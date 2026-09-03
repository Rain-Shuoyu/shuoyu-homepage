import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readCsv } from './csv.mjs';
import { fractionalGroups, validateCorpus, validateScreeningRow } from './model.mjs';

const positive = (label) => ['A', 'B', 'AB'].includes(label);
const placeholder = (label) => ['A', 'AB'].includes(label);
const issue = (label) => ['B', 'AB'].includes(label);

const rate = (numerator, denominator) => denominator === 0 ? null : numerator / denominator;

function visibleGroups(groups, minimum = 5) {
  const visible = new Map();
  let other = { total: 0, positive: 0 };
  for (const [name, values] of groups) {
    if (values.total >= minimum) visible.set(name, values);
    else {
      other.total += values.total;
      other.positive += values.positive;
    }
  }
  if (other.total > 0) visible.set('other', other);
  return visible;
}

export function summarizeRows(rows) {
  const labelCounts = Object.fromEntries(['A', 'B', 'AB', 'U', 'N'].map((label) => [label, 0]));
  for (const row of rows) if (Object.hasOwn(labelCounts, row.screen_label)) labelCounts[row.screen_label] += 1;
  const placeholderCount = rows.filter((row) => placeholder(row.screen_label)).length;
  const issueCount = rows.filter((row) => issue(row.screen_label)).length;
  const combinedCount = rows.filter((row) => row.screen_label === 'AB').length;
  const issueTrackerCount = rows.filter((row) => row.issue_tracker_inspectable === 'true').length;
  return {
    total: rows.length,
    label_counts: labelCounts,
    placeholder_count: placeholderCount,
    issue_count: issueCount,
    combined_count: combinedCount,
    issue_tracker_count: issueTrackerCount,
    official_artifact_count: rows.filter((row) => /^https?:\/\//.test(row.official_artifact_url ?? '')).length,
    placeholder_rate: rate(placeholderCount, rows.length),
    unanswered_issue_rate_all: rate(issueCount, rows.length),
    unanswered_issue_rate_conditional: rate(issueCount, issueTrackerCount),
    combined_signal_rate: rate(combinedCount, rows.length),
    countries: fractionalGroups(rows, 'countries_normalized'),
    institutions: fractionalGroups(rows, 'institutions_normalized'),
    second_review_counts: rows.reduce((counts, row) => {
      const status = row.second_review_status || 'blank';
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {}),
    positive_count: rows.filter((row) => positive(row.screen_label)).length,
  };
}

function formatRate(value) {
  return value === null ? 'n/a' : `${(value * 100).toFixed(1)}%`;
}

function renderGroupTable(groups) {
  const rows = [...visibleGroups(groups)].sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]));
  if (rows.length === 0) return '_No normalized affiliation data._';
  return [
    '| Group | Fractional papers | Fractional positive |',
    '| --- | ---: | ---: |',
    ...rows.map(([name, values]) => `| ${name} | ${values.total.toFixed(2)} | ${values.positive.toFixed(2)} |`),
  ].join('\n');
}

export function renderSummaryMarkdown(summary, auditDate) {
  const labels = ['A', 'B', 'AB', 'U', 'N'];
  return `# CoRL 2024 artifact triage summary

Audit date: ${auditDate}

This is a neutral, first-pass descriptive summary of observable artifact signals. ` +
    '`N` means “not observed under this pass”; it cannot establish whether a paper is reproducible or not reproducible. The summary does not assess scientific validity or explain why an observed condition occurred.\n\n' +
    `## Corpus

| Measure | Count | Rate |
| --- | ---: | ---: |
| Papers | ${summary.total} | 100.0% |
| Official artifact links | ${summary.official_artifact_count} | ${formatRate(rate(summary.official_artifact_count, summary.total))} |
| Placeholder signal | ${summary.placeholder_count} | ${formatRate(summary.placeholder_rate)} |
| Unanswered issue signal | ${summary.issue_count} | ${formatRate(summary.unanswered_issue_rate_all)} |
| Both signals | ${summary.combined_count} | ${formatRate(summary.combined_signal_rate)} |

## Screening labels

| Label | Count |
| --- | ---: |
${labels.map((label) => `| ${label} | ${summary.label_counts[label]} |`).join('\n')}

## Issue denominators

- All-paper denominator: ${summary.issue_count}/${summary.total} = ${formatRate(summary.unanswered_issue_rate_all)}.
- Inspectable issue-tracker denominator: ${summary.issue_count}/${summary.issue_tracker_count} = ${formatRate(summary.unanswered_issue_rate_conditional)}.

## Affiliation distribution

Groups below five fractional papers are combined as \`other\`.

### Countries

${renderGroupTable(summary.countries)}

### Institutions

${renderGroupTable(summary.institutions)}

## Review status

${Object.entries(summary.second_review_counts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => `- ${status}: ${count}`).join('\n') || '- blank: 0'}
`;
}

export function renderEvidenceMarkdown(rows) {
  const positiveRows = rows.filter((row) => ['A', 'B', 'AB'].includes(row.screen_label));
  return `# CoRL 2024 internal evidence trail

This local file records factual sources for positive screening labels. Labels do not assess scientific validity or explain why the observed conditions occurred.

${positiveRows.length === 0 ? '_No positive screening rows._' : positiveRows.map((row) => `- ${row.paper_id} — ${row.screen_label} — ${row.evidence_url} — ${row.evidence_note}`).join('\n')}
`;
}

function parseArgs(argv) {
  const root = resolve(import.meta.dirname, '../..');
  const args = {
    input: resolve(root, 'research/corl2024/data/screening.csv'),
    corpus: resolve(root, 'research/corl2024/data/papers.csv'),
    outputDir: resolve(root, 'research/corl2024/reports'),
    auditDate: new Date().toISOString().slice(0, 10),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--input') args.input = resolve(argv[++i]);
    else if (argv[i] === '--output-dir') args.outputDir = resolve(argv[++i]);
    else if (argv[i] === '--audit-date') args.auditDate = argv[++i];
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  return { ...args, root };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const corpus = await readCsv(args.corpus);
  const rows = await readCsv(args.input);
  validateCorpus(corpus, rows);
  const errors = rows.flatMap((row) => validateScreeningRow(row).map((error) => `${row.paper_id}: ${error}`));
  if (errors.length > 0) throw new Error(`Screening validation failed:\n${errors.join('\n')}`);
  const summary = summarizeRows(rows);
  await mkdir(args.outputDir, { recursive: true });
  await writeFile(resolve(args.outputDir, 'summary.md'), renderSummaryMarkdown(summary, args.auditDate));
  await writeFile(resolve(args.outputDir, 'evidence.md'), renderEvidenceMarkdown(rows));
  console.log(`Wrote CoRL 2024 summary to ${args.outputDir}`);
}
