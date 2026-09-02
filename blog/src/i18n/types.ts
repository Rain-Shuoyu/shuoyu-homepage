export const uiKeys = [
  'navArchive',
  'navTags',
  'navAbout',
  'primaryNavigation',
  'languageLabel',
  'themeLabel',
  'homeKicker',
  'published',
  'updated',
  'typePaperNotes',
  'typeEngineering',
  'typeLearning',
  'emptyPosts',
  'archiveTitle',
  'archiveDescription',
  'tagsTitle',
  'tagsDescription',
  'articleCount',
  'paperDetails',
  'authors',
  'venue',
  'originalPaper',
  'repository',
  'demo',
  'tableOfContents',
  'backToArchive',
  'newerNote',
  'olderNote',
  'aboutTitle',
  'aboutDescription',
  'aboutBody',
  'notFoundTitle',
  'notFoundDescription',
  'backHome',
  'rssTitle',
] as const;

export type UiKey = (typeof uiKeys)[number];

export type UiDictionary = Record<UiKey, string>;

export type UiLanguage = 'en' | 'zh';
