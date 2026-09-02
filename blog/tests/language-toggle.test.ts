import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type FakeNode = {
  textContent: string;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  toggleAttribute(name: string, force?: boolean): void;
  addEventListener(name: string, callback: () => void): void;
};

const source = readFileSync(new URL('../src/components/LanguageToggle.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>\s*([\s\S]*?)\s*<\/script>/)?.[1];

if (!script) throw new Error('Language toggle script not found.');

const makeNode = (initialAttributes: Record<string, string>, initialText = ''): FakeNode => {
  const attributes = { ...initialAttributes };
  const listeners = new Map<string, () => void>();

  return {
    textContent: initialText,
    getAttribute(name) {
      return attributes[name] ?? null;
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
    toggleAttribute(name, force = true) {
      if (force) attributes[name] = '';
      else delete attributes[name];
    },
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
  };
};

describe('blog language toggle', () => {
  it('waits for the full document before applying a stored language', () => {
    let mainContentParsed = false;
    let domContentLoaded: (() => void) | undefined;
    const headerLabel = makeNode({ 'data-i18n-key': 'homeKicker' }, 'Personal archive');
    const mainLabel = makeNode({ 'data-i18n-key': 'archiveTitle' }, 'Archive');
    const ariaLabel = makeNode({ 'data-i18n-aria-label': 'primaryNavigation' }, '');
    const date = makeNode({ 'data-i18n-date': '', datetime: '2026-09-02T00:00:00.000Z' }, 'Sep 2, 2026');
    const contentEnglish = makeNode({ 'data-content-language': 'en' });
    const contentChinese = makeNode({ 'data-content-language': 'zh', hidden: '' });
    const englishButton = makeNode({ 'data-language': 'en', 'aria-pressed': 'true' });
    const chineseButton = makeNode({ 'data-language': 'zh', 'aria-pressed': 'false' });
    const toggle = makeNode({
      'data-dictionaries': JSON.stringify({
        en: {
          homeKicker: 'Personal archive',
          archiveTitle: 'Archive',
          primaryNavigation: 'Primary navigation',
          languageLabel: 'Language',
        },
        zh: {
          homeKicker: '个人资料库',
          archiveTitle: '归档',
          primaryNavigation: '主导航',
          languageLabel: '界面语言',
        },
      }),
    });
    const documentRef = {
      readyState: 'loading',
      documentElement: { dataset: {} as Record<string, string>, lang: 'en' },
      querySelector(selector: string) {
        return selector === '[data-language-toggle]' ? toggle : null;
      },
      querySelectorAll(selector: string) {
        if (selector === '[data-i18n-key]') return mainContentParsed ? [headerLabel, mainLabel] : [headerLabel];
        if (selector === '[data-i18n-aria-label]') return [ariaLabel];
        if (selector === '[data-i18n-date]') return [date];
        if (selector === '[data-content-language]') return [contentEnglish, contentChinese];
        if (selector === '[data-language]') return [englishButton, chineseButton];
        return [];
      },
      addEventListener(name: string, callback: () => void) {
        if (name === 'DOMContentLoaded') domContentLoaded = callback;
      },
    };

    const localStorageRef = { getItem: () => 'zh', setItem: () => undefined };
    const run = new Function('document', 'localStorage', 'Intl', script);

    run(documentRef, localStorageRef, Intl);

    expect(domContentLoaded).toEqual(expect.any(Function));
    expect(mainLabel.textContent).toBe('Archive');

    mainContentParsed = true;
    domContentLoaded?.();

    expect(mainLabel.textContent).toBe('归档');
    expect(documentRef.documentElement.lang).toBe('zh-CN');
    expect(chineseButton.getAttribute('aria-pressed')).toBe('true');
    expect(englishButton.getAttribute('aria-pressed')).toBe('false');
  });
});
