import type { PostType } from '../lib/post-types';
import en from './en';
import zh from './zh';
import type { UiDictionary, UiKey, UiLanguage } from './types';

export { en, zh };
export * from './types';

export const dictionaries: Record<UiLanguage, UiDictionary> = {
  en,
  zh,
};

export const defaultUiLanguage: UiLanguage = 'en';

export function translate(
  language: UiLanguage,
  key: UiKey,
  values: Record<string, string | number> = {},
): string {
  return dictionaries[language][key].replace(/\{([^{}]+)\}/g, (placeholder, name) => {
    return values[name] === undefined ? placeholder : String(values[name]);
  });
}

const typeLabelKeys: Record<PostType, Extract<UiKey, `type${string}`>> = {
  'paper-notes': 'typePaperNotes',
  engineering: 'typeEngineering',
  learning: 'typeLearning',
};

export function typeLabelKey(type: PostType): Extract<UiKey, `type${string}`> {
  return typeLabelKeys[type];
}

export function formatDate(date: Date, language: UiLanguage): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
