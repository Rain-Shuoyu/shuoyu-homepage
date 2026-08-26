export type LinkIconName = 'globe' | 'paper' | 'archive' | 'code' | 'video';

export type IconLink = {
  label: string;
  href: string;
  /* Set to override the inferred icon. */
  icon?: LinkIconName;
};

/* Picks an icon from a link's href and label.

   Deliberately semantic rather than brand marks: the site's other
   icons are 1.7-weight strokes, and filled brand logos would clash
   with them. Order matters — "Paper (PDF)" points at arxiv.org/pdf,
   so the pdf/paper test has to run before the arxiv one. */
export function iconForLink(link: IconLink): LinkIconName {
  if (link.icon) return link.icon;

  /* href and label are searched together, so extension tests use \b
     rather than an end anchor — $ would never match, since the label
     always follows the href in this string. */
  const subject = `${link.href} ${link.label}`.toLowerCase();

  /* github.io is a project-page host, so match github.com only. */
  if (/github\.com|gitlab\.com|bitbucket\.org|\bcode\b|\brepo(sitory)?\b/.test(subject)) {
    return 'code';
  }
  if (/\.pdf\b|\bpdf\b|\bpaper\b|\bpreprint\b/.test(subject)) return 'paper';
  if (/arxiv\.org|\barxiv\b|openreview|\bbibtex\b|\bdataset\b/.test(subject)) return 'archive';
  if (/youtube\.com|youtu\.be|vimeo\.com|\bvideo\b|\.mp4\b/.test(subject)) return 'video';

  return 'globe';
}
