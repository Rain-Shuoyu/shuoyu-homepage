import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const tableOfContents = read('../src/components/TableOfContents.astro');
const styles = read('../src/styles/global.css');

describe('table of contents', () => {
  it('renders as a native collapsed disclosure by default', () => {
    expect(tableOfContents).toContain('<details class="table-of-contents">');
    expect(tableOfContents).toContain('<summary class="table-of-contents-summary"');
    expect(tableOfContents).toContain('data-i18n-key="tableOfContents"');
    expect(tableOfContents).not.toContain(' open');
    expect(styles).toContain('.table-of-contents-summary {');
    expect(styles).toContain('.table-of-contents[open] .table-of-contents-summary::after');
  });
});
