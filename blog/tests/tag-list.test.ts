import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const tagList = read('../src/components/TagList.astro');
const styles = read('../src/styles/global.css');

describe('tag index presentation', () => {
  it('places a numeric article count in a top-right bubble', () => {
    expect(tagList).toContain('<span class="tag-index-label">{tag.label}</span>');
    expect(tagList).toContain('<span class="tag-index-count" aria-hidden="true">{tag.count}</span>');
    expect(tagList).toContain('class="sr-only"');
    expect(tagList).toContain('data-i18n-key="articleCount"');
    expect(styles).toContain('.tag-index-link { position: relative;');
    expect(styles).toContain('.tag-index-count { position: absolute;');
    expect(styles).toContain('top: 10px; right: 10px;');
  });
});
