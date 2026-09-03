export const PAPER_COLUMNS = [
  'paper_id', 'title', 'authors', 'affiliations_raw', 'paper_url', 'pdf_url',
  'openreview_url', 'project_url', 'official_artifact_url', 'artifact_source',
];

export const SCREENING_COLUMNS = [
  ...PAPER_COLUMNS,
  'placeholder_flag', 'placeholder_subtype', 'issue_tracker_inspectable',
  'issue_flag', 'issue_url', 'issue_created_at', 'issue_state',
  'repo_activity_after_issue', 'inactive_repository', 'countries_normalized',
  'institutions_normalized', 'evidence_url', 'evidence_note', 'audit_date',
  'screen_label', 'reviewer', 'second_review_status',
];

export const CANDIDATE_COLUMNS = [
  'paper_id', 'title', 'candidate_type', 'repo_url', 'source_url', 'issue_url',
  'issue_created_at', 'repo_activity_after_issue', 'maintainer_response_observed',
  'reason', 'audit_date',
];

export const SCREEN_LABELS = new Set(['A', 'B', 'AB', 'U', 'N']);
const positiveLabels = new Set(['A', 'B', 'AB']);

export function deriveScreenLabel(row) {
  if (row.placeholder_flag === 'true' && row.issue_flag === 'true') return 'AB';
  if (row.placeholder_flag === 'true') return 'A';
  if (row.issue_flag === 'true') return 'B';
  return 'N';
}

const isHttpUrl = (value) => /^https?:\/\//.test(value ?? '');

export function validateScreeningRow(row, options = {}) {
  const errors = [];
  const allowPending = options.allowPending === true;
  const label = row.screen_label ?? '';
  const positive = positiveLabels.has(label);

  if (!row.paper_id?.trim()) errors.push('paper_id is required');
  if (!allowPending && !row.audit_date?.trim()) errors.push('audit_date is required');
  if (!allowPending && !SCREEN_LABELS.has(label)) errors.push('screen_label must be A, B, AB, U, or N');
  if (allowPending && label && !SCREEN_LABELS.has(label)) errors.push('screen_label must be A, B, AB, U, or N');
  if (positive && !isHttpUrl(row.evidence_url)) errors.push('positive labels require evidence_url');
  if (positive && !row.evidence_note?.trim()) errors.push('positive labels require evidence_note');
  if (label === 'A' && row.placeholder_flag !== 'true') errors.push('A requires placeholder_flag=true');
  if (label === 'B' && row.issue_flag !== 'true') errors.push('B requires issue_flag=true');
  if (label === 'AB' && (row.placeholder_flag !== 'true' || row.issue_flag !== 'true')) errors.push('AB requires both positive flags');
  if (label === 'N' && (row.placeholder_flag === 'true' || row.issue_flag === 'true')) errors.push('N requires both flags=false');
  if (row.issue_flag === 'true' && row.issue_tracker_inspectable !== 'true') errors.push('issue_flag requires issue_tracker_inspectable=true');
  if (row.issue_flag === 'true' && row.inactive_repository === 'true') errors.push('issue_flag cannot coexist with inactive_repository=true');
  if (row.issue_flag === 'true' && !isHttpUrl(row.issue_url)) errors.push('issue_flag requires issue_url');
  if (row.issue_flag === 'true' && !row.issue_created_at?.trim()) errors.push('issue_flag requires issue_created_at');
  if (row.issue_flag === 'true' && !row.repo_activity_after_issue?.trim()) errors.push('issue_flag requires repo_activity_after_issue');
  return errors;
}

export function validateCorpus(papers, screening) {
  if (papers.length !== 264) throw new Error(`CoRL 2024 corpus must contain exactly 264 papers; received ${papers.length}`);
  const paperIds = papers.map((row) => row.paper_id);
  if (new Set(paperIds).size !== paperIds.length) throw new Error('corpus contains duplicate paper_id values');
  const screeningIds = screening.map((row) => row.paper_id);
  if (new Set(screeningIds).size !== screeningIds.length) throw new Error('screening contains duplicate paper_id values');
  if (paperIds.length !== screeningIds.length || paperIds.some((id) => !screeningIds.includes(id))) throw new Error('corpus and screening paper_id values do not match');
}

export function splitList(value) {
  return [...new Set((value ?? '').split(';').map((item) => item.trim()).filter(Boolean))];
}

export function fractionalGroups(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const values = splitList(row[field]);
    if (values.length === 0) continue;
    const weight = 1 / values.length;
    for (const value of values) {
      const current = groups.get(value) ?? { total: 0, positive: 0 };
      current.total += weight;
      if (positiveLabels.has(row.screen_label)) current.positive += weight;
      groups.set(value, current);
    }
  }
  return groups;
}
