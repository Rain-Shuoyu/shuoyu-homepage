import { describe, expect, it } from 'vitest';
import {
  detectIssueCandidates,
  detectPlaceholderCandidates,
  githubRepoFromUrl,
  inspectGithubRepo,
} from '../scripts/corl2024/github.mjs';

const auditDate = '2026-09-03';

describe('CoRL 2024 GitHub triage', () => {
  it('normalizes official GitHub repository URLs', () => {
    expect(githubRepoFromUrl('https://github.com/example/demo/tree/main')).toEqual({
      owner: 'example', name: 'demo', url: 'https://github.com/example/demo',
    });
    expect(githubRepoFromUrl('https://gitlab.com/example/demo')).toBeNull();
  });

  it('generates placeholder and issue candidates without final labels', async () => {
    const issueCreated = '2026-01-01T00:00:00Z';
    const requests = new Map([
      ['https://api.github.com/repos/example/demo', {
        status: 200,
        json: { private: false, owner: { login: 'example' }, pushed_at: '2026-08-01T00:00:00Z' },
      }],
      ['https://api.github.com/repos/example/demo/contents', {
        status: 200,
        json: [{ name: 'README.md' }, { name: 'LICENSE' }, { name: '.gitignore' }],
      }],
      ['https://api.github.com/repos/example/demo/readme', {
        status: 200,
        json: { content: Buffer.from('# Demo\nCode coming soon').toString('base64'), encoding: 'base64' },
      }],
      ['https://api.github.com/repos/example/demo/issues?state=all&per_page=100&page=1', {
        status: 200,
        json: [{ number: 1, html_url: 'https://github.com/example/demo/issues/1', title: 'Cannot reproduce the reported result', body: 'The result cannot run.', state: 'open', created_at: issueCreated }],
      }],
      ['https://api.github.com/repos/example/demo/issues/1/comments', { status: 200, json: [] }],
      ['https://api.github.com/repos/example/demo/commits?since=2026-01-01T00%3A00%3A00Z&per_page=1', {
        status: 200, json: [{ sha: 'abc', commit: { author: { date: '2026-02-01T00:00:00Z' } } }],
      }],
    ]);
    const fetchImpl = async (url: string) => {
      const response = requests.get(url);
      if (!response) throw new Error(`unexpected URL ${url}`);
      return { ok: response.status >= 200 && response.status < 300, status: response.status, headers: new Headers(), json: async () => response.json };
    };
    const snapshot = await inspectGithubRepo({ owner: 'example', name: 'demo', url: 'https://github.com/example/demo' }, { auditDate, fetchImpl, cacheDir: null });
    const queue = [
      ...detectPlaceholderCandidates(snapshot, auditDate, 'paper-1', 'Demo Paper'),
      ...detectIssueCandidates(snapshot, auditDate, 'paper-1', 'Demo Paper'),
    ];
    expect(queue.map((item) => item.candidate_type)).toEqual(['placeholder_candidate', 'issue_candidate']);
    expect(queue.every((item) => !('screen_label' in item))).toBe(true);
  });
});
