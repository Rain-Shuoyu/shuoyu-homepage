import { describe, expect, it } from 'vitest';
import { validateCorpus, validateScreeningRow } from '../scripts/corl2024/model.mjs';

describe('CoRL 2024 screening validation', () => {
  it('rejects a corpus that is not exactly 264 papers', () => {
    expect(() => validateCorpus([{ paper_id: 'one' }], [{ paper_id: 'one' }])).toThrow('264');
  });

  it('rejects an issue label without inspectable tracker or activity evidence', () => {
    const errors = validateScreeningRow({
      paper_id: 'demo',
      issue_flag: 'true',
      placeholder_flag: 'false',
      issue_tracker_inspectable: 'false',
      inactive_repository: 'true',
      screen_label: 'B',
      evidence_url: 'https://github.com/example/demo/issues/1',
      evidence_note: 'Issue was not answered.',
      issue_url: 'https://github.com/example/demo/issues/1',
      issue_created_at: '2026-01-01',
      audit_date: '2026-09-03',
    });
    expect(errors).toContain('issue_flag requires issue_tracker_inspectable=true');
    expect(errors).toContain('issue_flag cannot coexist with inactive_repository=true');
    expect(errors).toContain('issue_flag requires repo_activity_after_issue');
  });

  it('allows an untouched template only in pending mode', () => {
    const row = { paper_id: 'demo', placeholder_flag: '', issue_flag: '' };
    expect(validateScreeningRow(row, { allowPending: true })).toEqual([]);
    expect(validateScreeningRow(row)).toContain('audit_date is required');
  });
});
