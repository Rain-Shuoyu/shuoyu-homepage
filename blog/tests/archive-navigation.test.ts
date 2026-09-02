import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const header = read('../src/components/Header.astro');
const archivePage = read('../src/pages/archive.astro');
const astroConfig = read('../astro.config.mjs');

describe('blog archive navigation', () => {
  it('uses one flat archive as the primary browsing surface', () => {
    expect(header).not.toContain('data-i18n-key="navNotes"');
    expect(header).toContain('href="/archive" data-i18n-key="navArchive"');
    expect(header).toContain('SHUOYU.CHEN / ARCHIVE');
    expect(archivePage).toContain("import PostList from '../components/PostList.astro';");
    expect(archivePage).toContain('<PostList posts={posts} />');
    expect(archivePage).not.toContain('groupPostsByYear');
    expect(astroConfig).toContain("redirects: { '/': '/archive' }");
  });

  it('takes the 404 recovery link back to the archive', () => {
    expect(read('../src/pages/404.astro')).toContain('href="/archive" data-i18n-key="backHome"');
    expect(read('../src/pages/404.astro')).toContain('Back to archive');
  });
});
