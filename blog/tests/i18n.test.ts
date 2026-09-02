import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en';
import zh from '../src/i18n/zh';
import {
  defaultUiLanguage,
  formatDate,
  translate,
  typeLabelKey,
} from '../src/i18n';

describe('blog UI dictionaries', () => {
  it('provides matching bilingual keys and the default language', () => {
    expect(defaultUiLanguage).toBe('en');
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
  });

  it('translates article counts with interpolation', () => {
    expect(translate('en', 'articleCount', { count: 3 })).toBe('3 articles');
    expect(translate('zh', 'articleCount', { count: 3 })).toBe('3 篇文章');
  });

  it('formats dates in each language using UTC calendar dates', () => {
    const date = new Date('2026-09-02T23:30:00.000Z');
    const chineseDate = formatDate(date, 'zh');

    expect(formatDate(date, 'en')).toBe('Sep 2, 2026');
    expect(chineseDate).toContain('2026');
    expect(chineseDate).toContain('9');
    expect(chineseDate).toContain('2');
  });

  it('maps post types to their UI dictionary keys', () => {
    expect(typeLabelKey('paper-notes')).toBe('typePaperNotes');
    expect(typeLabelKey('engineering')).toBe('typeEngineering');
    expect(typeLabelKey('learning')).toBe('typeLearning');
  });
});
