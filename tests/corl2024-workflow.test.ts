import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(resolve(root, directory), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relative = resolve(root, directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(relative.slice(root.length + 1)));
    else files.push(relative);
  }
  return files;
}

describe('CoRL 2024 workflow boundary', () => {
  it('exposes the four local commands', async () => {
    const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
    for (const name of ['corl2024:bootstrap', 'corl2024:inspect', 'corl2024:validate', 'corl2024:summary']) {
      expect(packageJson.scripts[name]).toBeTypeOf('string');
    }
  });

  it('keeps generated findings ignored and outside the public site', async () => {
    const ignore = await readFile(resolve(root, 'research/corl2024/.gitignore'), 'utf8');
    expect(ignore).toContain('data/*.csv');
    expect(ignore).toContain('data/manifest.json');
    expect(ignore).toContain('cache/');
    expect(ignore).toContain('reports/');

    const sourceFiles = await filesUnder('src');
    for (const file of sourceFiles.filter((item) => /\.(astro|ts|js|mjs)$/.test(item))) {
      const contents = await readFile(file, 'utf8');
      expect(contents).not.toMatch(/scripts\/corl2024|research\/corl2024/);
    }
  });
});
