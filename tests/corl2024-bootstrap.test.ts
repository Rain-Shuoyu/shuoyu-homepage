import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { parseCsv } from '../scripts/corl2024/csv.mjs';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const fixtureUrl = new URL('./fixtures/corl2024/pmlr-index.html', import.meta.url);

describe('CoRL 2024 bootstrap', () => {
  it('writes fixture inventory, template, and manifest', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'corl2024-bootstrap-'));
    try {
      await execFileAsync(process.execPath, ['scripts/corl2024/bootstrap.mjs', '--source', fixtureUrl.href, '--output-dir', outputDir, '--allow-count', '--audit-date', '2026-09-03'], { cwd: root });
      expect(parseCsv(await readFile(join(outputDir, 'papers.csv'), 'utf8'))).toHaveLength(2);
      expect(parseCsv(await readFile(join(outputDir, 'screening.template.csv'), 'utf8'))).toHaveLength(2);
      expect(JSON.parse(await readFile(join(outputDir, 'manifest.json'), 'utf8')).row_count).toBe(2);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});
