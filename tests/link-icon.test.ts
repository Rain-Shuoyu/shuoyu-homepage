import { describe, expect, it } from 'vitest';
import { iconForLink } from '../src/lib/link-icon';
import { researchProjects } from '../src/data/projects';

describe('iconForLink', () => {
  it('honours an explicit override', () => {
    expect(iconForLink({ label: 'Anything', href: 'https://github.com/x', icon: 'video' })).toBe(
      'video',
    );
  });

  it('reads code hosts as code', () => {
    expect(iconForLink({ label: 'Code', href: 'https://github.com/iSEE-Laboratory/x' })).toBe(
      'code',
    );
    expect(iconForLink({ label: 'Repository', href: 'https://gitlab.com/x' })).toBe('code');
  });

  /* github.io hosts project pages, not repositories — it must not be
     mistaken for github.com. */
  it('does not treat github.io project pages as code', () => {
    expect(iconForLink({ label: 'Project page', href: 'https://liaohr9.github.io/X/' })).toBe(
      'globe',
    );
  });

  /* "Paper (PDF)" points at arxiv.org/pdf, so the paper test has to
     win over the arxiv test. This is the ordering that regresses. */
  it('prefers paper over archive for an arXiv PDF', () => {
    expect(iconForLink({ label: 'Paper (PDF)', href: 'https://arxiv.org/pdf/2510.23119' })).toBe(
      'paper',
    );
  });

  it('reads a bare arXiv abstract as archive', () => {
    expect(iconForLink({ label: 'arXiv', href: 'https://arxiv.org/abs/2510.23119' })).toBe(
      'archive',
    );
  });

  it('reads video hosts and files as video', () => {
    expect(iconForLink({ label: 'Video', href: 'https://youtu.be/abc' })).toBe('video');
    expect(iconForLink({ label: 'Clip', href: '/media/teaser.mp4' })).toBe('video');
  });

  it('falls back to globe', () => {
    expect(iconForLink({ label: 'Lab site', href: 'https://example.edu/lab' })).toBe('globe');
  });

  it('resolves an icon for every real research link', () => {
    const valid = new Set(['globe', 'paper', 'archive', 'code', 'video']);
    for (const project of researchProjects) {
      for (const link of project.detail?.links ?? []) {
        expect(valid.has(iconForLink(link))).toBe(true);
      }
    }
  });
});
