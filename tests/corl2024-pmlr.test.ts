import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { assertCorpusSize, parsePmlrIndex } from '../scripts/corl2024/pmlr.mjs';

describe('PMLR CoRL 2024 parser', () => {
  it('extracts canonical paper and artifact links', async () => {
    const html = await readFile('tests/fixtures/corl2024/pmlr-index.html', 'utf8');
    const papers = parsePmlrIndex(html, 'https://proceedings.mlr.press/v270/');
    expect(papers).toHaveLength(2);
    expect(papers[0]).toMatchObject({
      paper_id: 'demo25a',
      title: 'Demo Robot Learning Paper',
      authors: 'Alice Author; Bob Author',
      paper_url: 'https://proceedings.mlr.press/v270/demo25a.html',
      official_artifact_url: 'https://github.com/example/demo',
      artifact_source: 'pmlr_software',
    });
    expect(papers[1].official_artifact_url).toBe('');
    expect(papers[1].artifact_source).toBe('');
  });

  it('protects the full corpus count while allowing fixture counts explicitly', async () => {
    const html = await readFile('tests/fixtures/corl2024/pmlr-index.html', 'utf8');
    const papers = parsePmlrIndex(html, 'https://proceedings.mlr.press/v270/');
    expect(() => assertCorpusSize(papers, false)).toThrow('264');
    expect(() => assertCorpusSize(papers, true)).not.toThrow();
  });
});
