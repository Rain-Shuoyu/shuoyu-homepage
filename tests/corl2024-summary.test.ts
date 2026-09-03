import { describe, expect, it } from 'vitest';
import { renderSummaryMarkdown, summarizeRows } from '../scripts/corl2024/summary.mjs';

const rows = [
  { paper_id: 'a', screen_label: 'A', issue_tracker_inspectable: 'true', countries_normalized: 'CN;US', institutions_normalized: 'Lab A;Lab B', official_artifact_url: 'https://github.com/a' },
  { paper_id: 'b', screen_label: 'B', issue_tracker_inspectable: 'true', countries_normalized: 'CN', institutions_normalized: 'Lab A', official_artifact_url: '' },
  { paper_id: 'c', screen_label: 'AB', issue_tracker_inspectable: 'true', countries_normalized: 'US', institutions_normalized: 'Lab C', official_artifact_url: 'https://github.com/c' },
  { paper_id: 'd', screen_label: 'U', issue_tracker_inspectable: 'false', countries_normalized: 'CN', institutions_normalized: 'Lab D', official_artifact_url: '' },
  { paper_id: 'e', screen_label: 'N', issue_tracker_inspectable: 'false', countries_normalized: 'US', institutions_normalized: 'Lab E', official_artifact_url: '' },
];

describe('CoRL 2024 summary', () => {
  it('reports both issue denominators and signal counts', () => {
    const summary = summarizeRows(rows);
    expect(summary.total).toBe(5);
    expect(summary.placeholder_count).toBe(2);
    expect(summary.issue_count).toBe(2);
    expect(summary.combined_count).toBe(1);
    expect(summary.issue_tracker_count).toBe(3);
    expect(summary.placeholder_rate).toBe(2 / 5);
    expect(summary.unanswered_issue_rate_all).toBe(2 / 5);
    expect(summary.unanswered_issue_rate_conditional).toBe(2 / 3);
    expect(summary.countries.get('CN')).toEqual({ total: 2.5, positive: 1.5 });
  });

  it('uses neutral language in the Markdown report', () => {
    const report = renderSummaryMarkdown(summarizeRows(rows), '2026-09-03');
    expect(report).toContain('not observed under this pass');
    expect(report).toContain('not reproducible');
    expect(report).not.toMatch(/ranking|best|worst|fraud/i);
  });
});
