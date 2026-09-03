import { describe, expect, it } from 'vitest';
import { parseCsv, stringifyCsv } from '../scripts/corl2024/csv.mjs';
import {
  deriveScreenLabel,
  validateScreeningRow,
  fractionalGroups,
} from '../scripts/corl2024/model.mjs';

describe('CoRL 2024 data model', () => {
  it('round-trips quoted commas, quotes, and line breaks', () => {
    const rows = [{ title: 'A, "quoted" title', note: 'line 1\nline 2' }];
    expect(parseCsv(stringifyCsv(rows, ['title', 'note']))).toEqual(rows);
  });

  it('derives the neutral screen label from the two flags', () => {
    expect(deriveScreenLabel({ placeholder_flag: 'true', issue_flag: 'false' })).toBe('A');
    expect(deriveScreenLabel({ placeholder_flag: 'false', issue_flag: 'true' })).toBe('B');
    expect(deriveScreenLabel({ placeholder_flag: 'true', issue_flag: 'true' })).toBe('AB');
    expect(deriveScreenLabel({ placeholder_flag: 'false', issue_flag: 'false' })).toBe('N');
  });

  it('requires evidence and issue metadata for a positive row', () => {
    const errors = validateScreeningRow({
      paper_id: 'demo',
      placeholder_flag: 'true',
      issue_flag: 'false',
      screen_label: 'A',
      evidence_url: '',
      evidence_note: '',
      audit_date: '2026-09-03',
    });
    expect(errors).toContain('positive labels require evidence_url');
    expect(errors).toContain('positive labels require evidence_note');
  });

  it('uses fractional counting for semicolon-separated institutions', () => {
    const result = fractionalGroups([
      { screen_label: 'A', institutions_normalized: 'Lab A;Lab B' },
      { screen_label: 'N', institutions_normalized: 'Lab A' },
    ], 'institutions_normalized');
    expect(result.get('Lab A')).toEqual({ total: 1.5, positive: 0.5 });
    expect(result.get('Lab B')).toEqual({ total: 0.5, positive: 0.5 });
  });
});
