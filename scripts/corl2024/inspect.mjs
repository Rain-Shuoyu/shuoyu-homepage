import { resolve } from 'node:path';
import { readCsv, writeCsv } from './csv.mjs';
import { CANDIDATE_COLUMNS } from './model.mjs';
import { detectIssueCandidates, detectPlaceholderCandidates, githubRepoFromUrl, inspectGithubRepo } from './github.mjs';

const root = resolve(import.meta.dirname, '../..');
const args = { input: resolve(root, 'research/corl2024/data/papers.csv'), output: resolve(root, 'research/corl2024/data/candidate-queue.csv'), cacheDir: resolve(root, 'research/corl2024/cache'), auditDate: new Date().toISOString().slice(0, 10), maxRepositories: Infinity };
for (let i = 0; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg === '--input') args.input = resolve(process.argv[++i]);
  else if (arg === '--output') args.output = resolve(process.argv[++i]);
  else if (arg === '--cache-dir') args.cacheDir = resolve(process.argv[++i]);
  else if (arg === '--audit-date') args.auditDate = process.argv[++i];
  else if (arg === '--max-repositories') args.maxRepositories = Number(process.argv[++i]);
}

const papers = await readCsv(args.input);
const queue = [];
let skipped = 0;
let inspected = 0;
if (args.maxRepositories > 0) {
  for (const paper of papers) {
    const repo = githubRepoFromUrl(paper.official_artifact_url);
    if (!repo) { skipped += 1; continue; }
    if (inspected >= args.maxRepositories) break;
    const snapshot = await inspectGithubRepo(repo, { auditDate: args.auditDate, cacheDir: args.cacheDir, token: process.env.GITHUB_TOKEN });
    queue.push(...detectPlaceholderCandidates(snapshot, args.auditDate, paper.paper_id, paper.title));
    queue.push(...detectIssueCandidates(snapshot, args.auditDate, paper.paper_id, paper.title));
    inspected += 1;
  }
}
await writeCsv(args.output, queue, CANDIDATE_COLUMNS);
console.log(`Inspected ${inspected} repositories; skipped ${skipped} rows without an official GitHub repository; wrote ${queue.length} candidates to ${args.output}`);
