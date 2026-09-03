import * as cheerio from 'cheerio';
import { PAPER_COLUMNS } from './model.mjs';

export function parsePmlrIndex(html, baseUrl) {
  const $ = cheerio.load(html);
  const resolve = (href) => href ? new URL(href, baseUrl).href : '';
  const linkByText = (root, label) => root.find('a').filter((_, element) => $(element).text().trim() === label).first().attr('href') ?? '';

  return $('.paper').map((_, element) => {
    const root = $(element);
    const paperUrl = resolve(linkByText(root, 'abs'));
    const paperId = paperUrl.split('/').pop()?.replace(/\.html$/, '') ?? '';
    const authors = root.find('.authors').first().text().replace(/\u00a0/g, ' ').split(',').map((name) => name.trim()).filter(Boolean).join('; ');
    const artifactUrl = resolve(linkByText(root, 'Software'));
    return {
      paper_id: paperId,
      title: root.find('.title').first().text().trim(),
      authors,
      affiliations_raw: '',
      paper_url: paperUrl,
      pdf_url: resolve(linkByText(root, 'Download PDF')),
      openreview_url: resolve(linkByText(root, 'OpenReview')),
      project_url: '',
      official_artifact_url: artifactUrl,
      artifact_source: artifactUrl ? 'pmlr_software' : '',
    };
  }).get();
}

export function assertCorpusSize(papers, allowCount = false) {
  const valid = allowCount ? papers.length > 0 : papers.length === 264;
  if (!valid) throw new Error(`CoRL 2024 corpus must contain exactly 264 papers; received ${papers.length}`);
}

export { PAPER_COLUMNS };
