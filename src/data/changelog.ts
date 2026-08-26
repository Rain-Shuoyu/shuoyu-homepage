export type ChangelogEntry = {
  date: string;
  title: string;
  items: string[];
};

/* Newest first. Grouped by milestone rather than one entry per commit,
   since commit subjects like "chore: initialize" are not reader-facing. */
export const changelog: ChangelogEntry[] = [
  {
    date: '2026-08-26',
    title: 'Research project pages',
    items: [
      'Each research project now has its own page, so the cards open a summary on the site instead of jumping straight to an external link.',
      'Each page opens with a teaser video or figure, followed by a short description of what the project is and how it works.',
      'Research cards now use a rightward arrow that slides sideways, keeping the diagonal travel for links that leave the site.',
    ],
  },
  {
    date: '2026-08-25',
    title: 'Liquid glass material',
    items: [
      'Rebuilt panels on a translucent glass material: blur with saturation boost, feathered bevel rim, specular gradient border with faint chromatic dispersion.',
      'Replaced the flat page wash with a drifting colour field and fractal-noise marbling, so the blur has real detail to work against.',
      'Removed a pointer-tracked highlight that pulled attention away from the content, and softened the row highlight in Side projects to fade at its edges.',
      'Fixed a seam that appeared in the overscroll region when scrolling past either end of the page.',
    ],
  },
  {
    date: '2026-08-25',
    title: 'Research-first hierarchy',
    items: [
      'Made research the visual anchor of the page: full glass cards with a tinted fill, against a plain hairline list for side projects.',
      'Trimmed side projects to the first three, with a link through to the rest on GitHub.',
      'Tightened vertical rhythm and narrowed the measure so the page reads as a dense document.',
      'Moved About above Selected work and gave it the full introduction.',
    ],
  },
  {
    date: '2026-08-25',
    title: 'Visual layer',
    items: [
      'Added a serif display face for headings against a sans body, with monospace for metadata.',
      'Introduced system-following dark mode with a manual toggle, applied before first paint so there is no flash.',
      'Added scroll-reveal transitions, staggered card entrances, and an active-section indicator in the sidebar.',
    ],
  },
  {
    date: '2026-08-25',
    title: 'First build',
    items: [
      'Set up a static Astro site with typed content for identity, research, and lab projects.',
      'Rendered the split sidebar layout, research and lab sections, and external links.',
      'Added accessibility and metadata passes, content invariant tests, and a deployment guide for Cloudflare.',
    ],
  },
];
