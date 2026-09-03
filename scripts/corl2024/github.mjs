import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const API = 'https://api.github.com';
const maintainers = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
const issueTerms = ['install', 'setup', 'run', 'error', 'checkpoint', 'dataset', 'data', 'reproduc', 'evaluation', 'result', 'environment', 'dependency', 'weight', 'model', 'docker', 'cuda', 'mujoco', 'isaac', 'robosuite'];
const placeholderTerms = /coming\s+soon|will\s+be\s+released|to\s+be\s+updated|release\s+forthcoming/i;
const placeholderFiles = new Set(['README.md', 'LICENSE', '.gitignore', '.gitattributes', 'CITATION.cff']);

export function githubRepoFromUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const name = parts[1].replace(/\.git$/, '');
    if (!owner || !name) return null;
    return { owner, name, url: `https://github.com/${owner}/${name}` };
  } catch {
    return null;
  }
}

async function cachedJson(url, options) {
  const { fetchImpl = fetch, cacheDir, headers = {} } = options;
  const key = createHash('sha256').update(url).digest('hex');
  const cachePath = cacheDir ? join(cacheDir, `${key}.json`) : null;
  if (cachePath) {
    try { return JSON.parse(await readFile(cachePath, 'utf8')); } catch { /* fetch below */ }
  }
  const response = await fetchImpl(url, {
    headers: { accept: 'application/vnd.github+json', ...headers },
  });
  if (!response.ok) {
    const reset = response.headers?.get?.('x-ratelimit-reset');
    if (response.status === 403 || response.status === 429) throw new Error(`GitHub rate limit or access failure for ${url}${reset ? `; reset ${reset}` : ''}`);
    throw new Error(`GitHub request failed: ${response.status} ${url}`);
  }
  const payload = await response.json();
  if (cachePath) {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cachePath, `${JSON.stringify(payload)}\n`);
  }
  return payload;
}

function decodeReadme(readme) {
  if (!readme?.content) return '';
  if (readme.encoding === 'base64') return Buffer.from(readme.content.replaceAll('\n', ''), 'base64').toString('utf8');
  return String(readme.content);
}

export async function inspectGithubRepo(repo, options = {}) {
  const base = `${API}/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
  const common = { ...options, headers: options.token ? { authorization: `Bearer ${options.token}` } : {} };
  const metadata = await cachedJson(base, common);
  if (metadata.private || metadata.visibility === 'private' || metadata.visibility === 'internal') return { repo, private: true, owner_login: metadata.owner?.login ?? '', pushed_at: metadata.pushed_at ?? '', rootFiles: [], readmeText: '', issues: [], issueDetails: {} };
  const [contents, readme, issues] = await Promise.all([
    cachedJson(`${base}/contents`, common),
    cachedJson(`${base}/readme`, common).catch((error) => error.message.includes('404') ? { content: '', encoding: 'utf-8' } : Promise.reject(error)),
    cachedJson(`${base}/issues?state=all&per_page=100&page=1`, common),
  ]);
  const issueDetails = {};
  for (const issue of issues.filter((item) => !item.pull_request)) {
    const issueBase = `${base}/issues/${issue.number}`;
    issueDetails[issue.number] = {
      comments: await cachedJson(`${issueBase}/comments`, common),
      commits: await cachedJson(`${base}/commits?since=${encodeURIComponent(issue.created_at)}&per_page=1`, common),
    };
  }
  return {
    repo,
    private: false,
    owner_login: metadata.owner?.login ?? '',
    pushed_at: metadata.pushed_at ?? '',
    rootFiles: Array.isArray(contents) ? contents.map((item) => item.name).filter(Boolean) : [],
    readmeText: decodeReadme(readme),
    issues: issues.filter((item) => !item.pull_request),
    issueDetails,
  };
}

export function detectPlaceholderCandidates(snapshot, auditDate, paperId = '', title = '') {
  if (snapshot.private) return [];
  const candidates = [];
  if (placeholderTerms.test(snapshot.readmeText ?? '')) {
    candidates.push({ paper_id: paperId, title, candidate_type: 'placeholder_candidate', repo_url: snapshot.repo.url, source_url: snapshot.repo.url, issue_url: '', issue_created_at: '', repo_activity_after_issue: '', maintainer_response_observed: 'false', reason: 'README matched forthcoming phrase', audit_date: auditDate });
  }
  if (snapshot.rootFiles?.length > 0 && snapshot.rootFiles.every((name) => placeholderFiles.has(name))) {
    if (!candidates.some((item) => item.candidate_type === 'placeholder_candidate')) candidates.push({ paper_id: paperId, title, candidate_type: 'placeholder_candidate', repo_url: snapshot.repo.url, source_url: snapshot.repo.url, issue_url: '', issue_created_at: '', repo_activity_after_issue: '', maintainer_response_observed: 'false', reason: 'repository root contains placeholder files only', audit_date: auditDate });
  }
  return candidates;
}

function hasIssueTerm(issue) {
  const text = `${issue.title ?? ''}\n${issue.body ?? ''}`.toLowerCase();
  return issueTerms.some((term) => text.includes(term));
}

function daysBetween(auditDate, createdAt) {
  return (Date.parse(`${auditDate}T00:00:00Z`) - Date.parse(createdAt)) / 86400000;
}

export function detectIssueCandidates(snapshot, auditDate, paperId = '', title = '') {
  if (snapshot.private) return [];
  const candidates = [];
  for (const issue of snapshot.issues ?? []) {
    if (!hasIssueTerm(issue)) continue;
    const details = snapshot.issueDetails?.[issue.number] ?? { comments: [], commits: [] };
    const maintainerResponse = details.comments.some((comment) => maintainers.has(comment.author_association));
    const hasActivity = details.commits.length > 0;
    if (maintainerResponse || !hasActivity) continue;
    const openLongEnough = issue.state === 'open' && daysBetween(auditDate, issue.created_at) >= 60;
    const closedWithoutResolution = issue.state === 'closed' && !/resolved|fixed|answer(ed)?|workaround/i.test(`${issue.body ?? ''}\n${details.comments.map((comment) => comment.body ?? '').join('\n')}`);
    if (!openLongEnough && !closedWithoutResolution) continue;
    const lastActivity = details.commits[0]?.commit?.author?.date ?? details.commits[0]?.commit?.committer?.date ?? '';
    candidates.push({ paper_id: paperId, title, candidate_type: 'issue_candidate', repo_url: snapshot.repo.url, source_url: issue.html_url, issue_url: issue.html_url, issue_created_at: issue.created_at, repo_activity_after_issue: lastActivity, maintainer_response_observed: 'false', reason: 'issue matched reproduction term; no OWNER/MEMBER/COLLABORATOR comment; commit exists after issue creation', audit_date: auditDate });
  }
  return candidates;
}
