# Unified Blog Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an independently deployable Astro blog at blog.shuoyu.me for paper notes, engineering practice, and learning materials, managed in the same repository as the existing English homepage.

**Architecture:** Keep the current homepage Astro app at the repository root and add a separate Astro app under blog/. The two apps share one npm workspace and Git history but have independent routes, content, configuration, generated output, and Cloudflare Pages deployments. The blog renders Markdown/MDX content statically, defaults to English, and uses a client-side UI-only English/Chinese toggle.

**Tech Stack:** Astro 7.2.6, TypeScript, native CSS, Astro content collections, Markdown/MDX, Vitest, @astrojs/rss, @astrojs/sitemap, @astrojs/mdx, and Cloudflare Pages.

---

## File map

Create or modify these files:

- Modify package.json with the blog workspace declaration and repository-level scripts.
- Modify package-lock.json through npm install; never hand-edit it.
- Create blog/package.json for the independent blog app.
- Create blog/astro.config.mjs for static output, MDX, sitemap, and the blog canonical URL.
- Create blog/tsconfig.json and blog/src/env.d.ts for strict Astro TypeScript settings.
- Create blog/src/content.config.ts for the posts collection and frontmatter schema.
- Create blog/src/lib/post-types.ts for shared post and metadata types.
- Create blog/src/lib/content.ts for published-post filtering, sorting, archive grouping, and tag indexing.
- Create blog/src/content/posts/about-this-archive.md as the initial bilingual published note.
- Create blog/src/content/posts/example-paper-notes.md as a non-public paper metadata fixture.
- Create blog/src/content/posts/example-engineering.md as a non-public engineering metadata fixture.
- Create blog/src/content/posts/example-learning.md as a non-public learning metadata fixture.
- Create blog/src/i18n/types.ts, en.ts, zh.ts, and index.ts for UI dictionaries and locale helpers.
- Create blog/src/layouts/BlogLayout.astro and blog/src/layouts/PostLayout.astro.
- Create blog/src/components/Header.astro, LanguageToggle.astro, ThemeToggle.astro, PostList.astro, PostMeta.astro, ArchiveList.astro, TagList.astro, TableOfContents.astro, and PaperDetails.astro.
- Create blog/src/pages/index.astro, posts/[slug].astro, archive.astro, tags/index.astro, tags/[tag].astro, about.astro, 404.astro, and rss.xml.ts.
- Create blog/src/styles/global.css and blog/src/styles/prose.css.
- Create blog/public/robots.txt and blog/public/favicon.svg.
- Copy the approved local fonts and social card into blog/public/fonts/ and blog/public/og.png so the independent Pages output has all required assets.
- Modify README.md with local blog commands and the two-project Cloudflare Pages configuration.
- Create scripts/verify-blog-build.mjs for deterministic static-output checks.
- Create blog/tests/content.test.ts and blog/tests/i18n.test.ts.
- Modify the root package.json with the verify:blog-build script.

The existing homepage page tree, homepage content modules, homepage navigation, and homepage canonical URL remain unchanged.

## Task 1: Add the blog workspace and independent Astro app

**Files:**

- Modify: package.json
- Modify: package-lock.json through npm install
- Create: blog/package.json
- Create: blog/astro.config.mjs
- Create: blog/tsconfig.json
- Create: blog/src/env.d.ts
- Create: blog/src/pages/index.astro

- [ ] **Step 1: Record the homepage baseline before adding the workspace.**

Run:

~~~sh
npm install
npm test
npm run check
npm run build
~~~

Expected: npm install and all three verification commands exit 0, the existing homepage tests pass, and the existing root dist/ is generated.

- [ ] **Step 2: Add the workspace declaration and root orchestration scripts.**

Preserve the existing package name, engines, dependencies, and og script. Add the workspaces field and these scripts to the root package.json:

~~~json
{
  "workspaces": [
    "blog"
  ],
  "scripts": {
    "dev": "astro dev",
    "dev:blog": "npm run dev --workspace blog",
    "test": "vitest run",
    "test:all": "npm test && npm test --workspace blog",
    "check": "astro check",
    "check:all": "npm run check && npm run check --workspace blog",
    "build": "astro check && astro build",
    "build:blog": "npm run build --workspace blog",
    "build:all": "npm run build && npm run build:blog",
    "preview": "astro preview",
    "og": "node scripts/build-og.mjs"
  }
}
~~~

- [ ] **Step 3: Create the blog package manifest.**

Create blog/package.json:

~~~json
{
  "name": "shuoyu-blog",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "test": "vitest run",
    "check": "astro check",
    "build": "astro check && astro build",
    "preview": "astro preview"
  }
}
~~~

- [ ] **Step 4: Install the blog build dependencies through the root workspace.**

Run:

~~~sh
npm install --workspace blog astro@^7.2.6 @astrojs/mdx @astrojs/rss @astrojs/sitemap
npm install --workspace blog --save-dev @astrojs/check@^0.9.10 typescript@^6.0.3 vitest@^4.1.10
~~~

Expected: npm adds dependency entries to blog/package.json and package-lock.json, resolves one compatible Astro toolchain, and exits 0.

- [ ] **Step 5: Configure the blog as a static site with the blog canonical URL.**

Create blog/astro.config.mjs:

~~~js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://blog.shuoyu.me',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/404'),
    }),
  ],
  devToolbar: {
    enabled: false,
  },
});
~~~

- [ ] **Step 6: Add strict blog TypeScript configuration.**

Create blog/tsconfig.json:

~~~json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  }
}
~~~

Create blog/src/env.d.ts:

~~~ts
/// <reference types="astro/client" />
~~~

- [ ] **Step 7: Add a buildable blog baseline page.**

Create blog/src/pages/index.astro:

~~~astro
---
const title = 'Notes — Shuoyu Chen';
const description = 'Paper notes, engineering practice, and learning materials.';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  </body>
</html>
~~~

- [ ] **Step 8: Verify the independent baseline.**

Run:

~~~sh
npm run check:all
npm run build:all
~~~

Expected: both applications check successfully; root dist/ and blog/dist/index.html exist; no files are written to the other application's output directory.

- [ ] **Step 9: Commit the workspace boundary.**

Run:

~~~sh
git add package.json package-lock.json blog/package.json blog/astro.config.mjs blog/tsconfig.json blog/src/env.d.ts blog/src/pages/index.astro
git commit -m "chore: add blog workspace"
~~~

## Task 2: Add the typed content collection and archive helpers

**Files:**

- Create: blog/src/lib/post-types.ts
- Create: blog/src/lib/content.ts
- Create: blog/src/content.config.ts
- Create: blog/tests/content.test.ts
- Create: blog/src/content/posts/about-this-archive.md
- Create: blog/src/content/posts/example-paper-notes.md
- Create: blog/src/content/posts/example-engineering.md
- Create: blog/src/content/posts/example-learning.md

- [ ] **Step 1: Write failing unit tests for post ordering, filtering, tags, and years.**

Create blog/tests/content.test.ts:

~~~ts
import { describe, expect, it } from 'vitest';
import type { BlogPost } from '../src/lib/post-types';
import {
  getTagIndex,
  groupPostsByYear,
  postPath,
  postsForTag,
  publishedPosts,
  tagPath,
} from '../src/lib/content';

const makePost = (
  id: string,
  date: string,
  tags: string[],
  draft = false,
  type: BlogPost['data']['type'] = 'learning',
): BlogPost => ({
  id,
  data: {
    title: id,
    description: id + ' description',
    pubDate: new Date(date),
    type,
    tags,
    draft,
  },
});

describe('blog content helpers', () => {
  const posts = [
    makePost('newest', '2026-05-02', ['Robotics', 'Learning']),
    makePost('older', '2025-12-20', ['Robotics']),
    makePost('draft-note', '2026-06-01', ['Robotics'], true),
    makePost('same-day-b', '2026-05-02', ['Learning']),
    makePost('same-day-a', '2026-05-02', ['Learning']),
  ];

  it('excludes drafts and sorts newest first with a stable tie-breaker', () => {
    expect(publishedPosts(posts).map((post) => post.id)).toEqual([
      'newest',
      'same-day-a',
      'same-day-b',
      'older',
    ]);
  });

  it('groups published posts by UTC publication year', () => {
    expect(groupPostsByYear(posts).map((group) => ({
      year: group.year,
      ids: group.posts.map((post) => post.id),
    }))).toEqual([
      { year: 2026, ids: ['newest', 'same-day-a', 'same-day-b'] },
      { year: 2025, ids: ['older'] },
    ]);
  });

  it('builds deterministic tag summaries and filters by normalized tag', () => {
    expect(getTagIndex(posts)).toEqual([
      { slug: 'learning', label: 'Learning', count: 3 },
      { slug: 'robotics', label: 'Robotics', count: 2 },
    ]);
    expect(postsForTag(posts, 'robotics').map((post) => post.id)).toEqual([
      'newest',
      'older',
    ]);
  });

  it('creates stable post and tag URLs', () => {
    const post = makePost('about-this-archive', '2026-09-02', ['Meta']);
    expect(postPath(post)).toBe('/posts/about-this-archive');
    expect(tagPath('Paper Notes')).toBe('/tags/paper%20notes');
  });
});
~~~

- [ ] **Step 2: Run the focused test to confirm the missing-helper failure.**

Run:

~~~sh
npm test --workspace blog
~~~

Expected: FAIL because blog/src/lib/content.ts and blog/src/lib/post-types.ts do not exist.

- [ ] **Step 3: Add the shared post types.**

Create blog/src/lib/post-types.ts:

~~~ts
export const postTypes = ['paper-notes', 'engineering', 'learning'] as const;

export type PostType = (typeof postTypes)[number];

export type PaperMeta = {
  title?: string;
  authors?: string[];
  venue?: string;
  year?: number;
  url?: string;
};

export type PostLinks = {
  paper?: string;
  repo?: string;
  demo?: string;
};

export type PostData = {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  type: PostType;
  tags: string[];
  draft: boolean;
  cover?: string;
  paper?: PaperMeta;
  links?: PostLinks;
};

export type BlogPost = {
  id: string;
  data: PostData;
};
~~~

- [ ] **Step 4: Add deterministic content helpers.**

Create blog/src/lib/content.ts:

~~~ts
import type { BlogPost } from './post-types';

export type TagSummary = {
  slug: string;
  label: string;
  count: number;
};

export type YearGroup<T extends BlogPost = BlogPost> = {
  year: number;
  posts: T[];
};

export const normalizeTag = (tag: string) => tag.trim().toLowerCase();

export const publishedPosts = <T extends BlogPost>(posts: readonly T[]): T[] =>
  [...posts]
    .filter((post) => !post.data.draft)
    .sort((left, right) => {
      const dateDifference = right.data.pubDate.getTime() - left.data.pubDate.getTime();
      return dateDifference || left.id.localeCompare(right.id, 'en');
    });

export const postPath = (post: Pick<BlogPost, 'id'>) =>
  '/posts/' + encodeURIComponent(post.id);

export const tagPath = (tag: string) =>
  '/tags/' + encodeURIComponent(normalizeTag(tag));

export const groupPostsByYear = <T extends BlogPost>(
  posts: readonly T[],
): YearGroup<T>[] => {
  const groups = new Map<number, T[]>();

  for (const post of publishedPosts(posts)) {
    const year = post.data.pubDate.getUTCFullYear();
    const group = groups.get(year) ?? [];
    group.push(post);
    groups.set(year, group);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => right - left)
    .map(([year, groupedPosts]) => ({ year, posts: groupedPosts }));
};

export const getTagIndex = (posts: readonly BlogPost[]): TagSummary[] => {
  const entries = new Map<string, TagSummary>();

  for (const post of publishedPosts(posts)) {
    for (const rawTag of post.data.tags) {
      const label = rawTag.trim();
      const slug = normalizeTag(label);
      const existing = entries.get(slug);

      if (existing) {
        existing.count += 1;
      } else {
        entries.set(slug, { slug, label, count: 1 });
      }
    }
  }

  return [...entries.values()].sort((left, right) =>
    left.label.localeCompare(right.label, 'en'),
  );
};

export const postsForTag = <T extends BlogPost>(posts: readonly T[], tag: string): T[] => {
  const slug = normalizeTag(tag);

  return publishedPosts(posts).filter((post) =>
    post.data.tags.some((postTag) => normalizeTag(postTag) === slug),
  );
};
~~~

- [ ] **Step 5: Add the Astro content collection schema.**

Create blog/src/content.config.ts:

~~~ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { postTypes } from './lib/post-types';

const paperSchema = z.object({
  title: z.string().min(1).optional(),
  authors: z.array(z.string().min(1)).optional(),
  venue: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  url: z.string().url().optional(),
});

const linksSchema = z.object({
  paper: z.string().url().optional(),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
});

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  type: z.enum(postTypes),
  tags: z.array(z.string().min(1)).min(1),
  draft: z.boolean(),
  cover: z.string().min(1).optional(),
  paper: paperSchema.optional(),
  links: linksSchema.optional(),
});

export const collections = {
  posts: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './src/content/posts',
    }),
    schema: postSchema,
  }),
};
~~~

- [ ] **Step 6: Add one bilingual published starter note and three non-public metadata fixtures.**

Create blog/src/content/posts/about-this-archive.md:

~~~md
---
title: About This Archive
description: Why this blog exists and what I plan to keep here.
pubDate: 2026-09-02
type: learning
tags:
  - meta
  - writing
draft: false
---

This is a working archive for paper notes, engineering practice, and learning materials.

## 中文

这里记录论文速读、工程实践和学习资料。文章正文由我自己维护，界面提供中英文切换。
~~~

Create blog/src/content/posts/example-paper-notes.md:

~~~md
---
title: Example Paper Notes
description: A non-public fixture covering paper metadata.
pubDate: 2026-09-01
type: paper-notes
tags:
  - robotics
  - paper-reading
draft: true
paper:
  title: Example Original Paper
  authors:
    - First Author
    - Second Author
  venue: CoRL
  year: 2026
  url: https://example.com/paper
links:
  paper: https://example.com/paper
---

This fixture is excluded from the public build.
~~~

Create blog/src/content/posts/example-engineering.md:

~~~md
---
title: Example Engineering Note
description: A non-public fixture covering repository metadata.
pubDate: 2026-08-31
type: engineering
tags:
  - engineering
  - robotics
draft: true
links:
  repo: https://github.com/example/project
  demo: https://example.com/demo
---

This fixture is excluded from the public build.
~~~

Create blog/src/content/posts/example-learning.md:

~~~md
---
title: Example Learning Note
description: A non-public fixture covering the learning type.
pubDate: 2026-08-30
type: learning
tags:
  - learning
draft: true
---

This fixture is excluded from the public build.
~~~

- [ ] **Step 7: Run the content tests and both Astro applications' checks.**

Run:

~~~sh
npm test --workspace blog
npm run check:all
npm run build:blog
~~~

Expected: the helper tests pass; Astro accepts all frontmatter; the public build contains the starter article but none of the three draft fixtures.

- [ ] **Step 8: Commit the content model.**

Run:

~~~sh
git add blog/src/lib/post-types.ts blog/src/lib/content.ts blog/src/content.config.ts blog/tests/content.test.ts blog/src/content/posts
git commit -m "feat: add blog content collection"
~~~

## Task 3: Add the bilingual UI dictionary and locale helpers

**Files:**

- Create: blog/src/i18n/types.ts
- Create: blog/src/i18n/en.ts
- Create: blog/src/i18n/zh.ts
- Create: blog/src/i18n/index.ts
- Create: blog/tests/i18n.test.ts

- [ ] **Step 1: Write failing tests for complete dictionaries, interpolation, and date formatting.**

Create blog/tests/i18n.test.ts:

~~~ts
import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { zh } from '../src/i18n/zh';
import {
  defaultUiLanguage,
  formatDate,
  translate,
  typeLabelKey,
} from '../src/i18n';

describe('blog UI language', () => {
  it('uses English as the default', () => {
    expect(defaultUiLanguage).toBe('en');
  });

  it('keeps English and Chinese dictionaries in sync', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
  });

  it('interpolates article counts', () => {
    expect(translate('en', 'articleCount', { count: 3 })).toBe('3 articles');
    expect(translate('zh', 'articleCount', { count: 3 })).toBe('3 篇文章');
  });

  it('formats dates with a stable UTC calendar day', () => {
    const date = new Date('2026-09-02T23:30:00.000Z');
    expect(formatDate(date, 'en')).toBe('Sep 2, 2026');
    expect(formatDate(date, 'zh')).toContain('2026');
    expect(formatDate(date, 'zh')).toContain('9');
    expect(formatDate(date, 'zh')).toContain('2');
  });

  it('maps every content type to a UI key', () => {
    expect(typeLabelKey('paper-notes')).toBe('typePaperNotes');
    expect(typeLabelKey('engineering')).toBe('typeEngineering');
    expect(typeLabelKey('learning')).toBe('typeLearning');
  });
});
~~~

- [ ] **Step 2: Run the focused test to confirm the missing dictionary failure.**

Run:

~~~sh
npm test --workspace blog
~~~

Expected: FAIL because the blog/src/i18n modules do not exist.

- [ ] **Step 3: Define the complete UI key set.**

Create blog/src/i18n/types.ts:

~~~ts
export const uiKeys = [
  'navNotes',
  'navArchive',
  'navTags',
  'navAbout',
  'primaryNavigation',
  'languageLabel',
  'themeLabel',
  'homeKicker',
  'homeTitle',
  'homeDescription',
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
~~~

- [ ] **Step 4: Add the English dictionary.**

Create blog/src/i18n/en.ts:

~~~ts
import type { UiDictionary } from './types';

export const en = {
  navNotes: 'Notes',
  navArchive: 'Archive',
  navTags: 'Tags',
  navAbout: 'About',
  primaryNavigation: 'Primary navigation',
  languageLabel: 'Language',
  themeLabel: 'Toggle color theme',
  homeKicker: 'Personal archive',
  homeTitle: 'Notes',
  homeDescription: 'Paper notes, engineering practice, and learning materials.',
  published: 'Published',
  updated: 'Updated',
  typePaperNotes: 'Paper notes',
  typeEngineering: 'Engineering',
  typeLearning: 'Learning',
  emptyPosts: 'No notes have been published yet.',
  archiveTitle: 'Archive',
  archiveDescription: 'A chronological record of published notes.',
  tagsTitle: 'Tags',
  tagsDescription: 'Browse the archive by topic.',
  articleCount: '{count} articles',
  paperDetails: 'Paper details',
  authors: 'Authors',
  venue: 'Venue',
  originalPaper: 'Original paper',
  repository: 'Repository',
  demo: 'Demo',
  tableOfContents: 'On this page',
  backToArchive: 'Back to archive',
  newerNote: 'Newer note',
  olderNote: 'Older note',
  aboutTitle: 'About',
  aboutDescription: 'How this archive is organized.',
  aboutBody: 'This blog collects paper notes, engineering practice, and learning materials. Articles are authored in Markdown or MDX and published through Git.',
  notFoundTitle: 'Page not found',
  notFoundDescription: 'The page you requested does not exist.',
  backHome: 'Back to notes',
  rssTitle: 'Shuoyu Chen — Notes',
} satisfies UiDictionary;
~~~

- [ ] **Step 5: Add the Chinese dictionary.**

Create blog/src/i18n/zh.ts:

~~~ts
import type { UiDictionary } from './types';

export const zh = {
  navNotes: '文章',
  navArchive: '归档',
  navTags: '标签',
  navAbout: '关于',
  primaryNavigation: '主导航',
  languageLabel: '界面语言',
  themeLabel: '切换颜色主题',
  homeKicker: '个人资料库',
  homeTitle: '文章',
  homeDescription: '论文速读、工程实践和学习资料。',
  published: '发布于',
  updated: '更新于',
  typePaperNotes: '论文速读',
  typeEngineering: '工程实践',
  typeLearning: '学习资料',
  emptyPosts: '暂时还没有发布文章。',
  archiveTitle: '归档',
  archiveDescription: '按时间整理的已发布文章。',
  tagsTitle: '标签',
  tagsDescription: '按主题浏览资料库。',
  articleCount: '{count} 篇文章',
  paperDetails: '论文信息',
  authors: '作者',
  venue: '会议或期刊',
  originalPaper: '原论文',
  repository: '代码仓库',
  demo: '演示',
  tableOfContents: '本文目录',
  backToArchive: '返回归档',
  newerNote: '较新文章',
  olderNote: '较旧文章',
  aboutTitle: '关于',
  aboutDescription: '这个资料库的组织方式。',
  aboutBody: '这里记录论文速读、工程实践和学习资料。文章使用 Markdown 或 MDX 编写，通过 Git 发布。',
  notFoundTitle: '页面不存在',
  notFoundDescription: '你访问的页面不存在。',
  backHome: '返回文章列表',
  rssTitle: 'Shuoyu Chen — 文章',
} satisfies UiDictionary;
~~~

- [ ] **Step 6: Add locale selection, interpolation, and date helpers.**

Create blog/src/i18n/index.ts:

~~~ts
import { en } from './en';
import { zh } from './zh';
import type { UiDictionary, UiKey, UiLanguage } from './types';
import type { PostType } from '../lib/post-types';

export const dictionaries = {
  en,
  zh,
} satisfies Record<UiLanguage, UiDictionary>;

export const defaultUiLanguage: UiLanguage = 'en';

export const translate = (
  language: UiLanguage,
  key: UiKey,
  values: Record<string, string | number> = {},
) => {
  let value = dictionaries[language][key];

  for (const [name, replacement] of Object.entries(values)) {
    value = value.replaceAll('{' + name + '}', String(replacement));
  }

  return value;
};

export const formatDate = (date: Date, language: UiLanguage) =>
  new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);

export const typeLabelKey = (type: PostType): UiKey => {
  if (type === 'paper-notes') return 'typePaperNotes';
  if (type === 'engineering') return 'typeEngineering';
  return 'typeLearning';
};
~~~

- [ ] **Step 7: Run the locale tests and type checks.**

Run:

~~~sh
npm test --workspace blog
npm run check:all
~~~

Expected: all UI dictionary tests pass, including English defaulting and Chinese interpolation.

- [ ] **Step 8: Commit the UI language layer.**

Run:

~~~sh
git add blog/src/i18n blog/tests/i18n.test.ts
git commit -m "feat: add bilingual blog UI dictionaries"
~~~

## Task 4: Build the shared blog layout, header, theme, and reading styles

**Files:**

- Create: blog/src/layouts/BlogLayout.astro
- Create: blog/src/components/Header.astro
- Create: blog/src/components/LanguageToggle.astro
- Create: blog/src/components/ThemeToggle.astro
- Create: blog/src/styles/global.css
- Create: blog/src/styles/prose.css
- Modify: blog/src/pages/index.astro

- [ ] **Step 1: Replace the baseline page with the shared layout contract.**

Create blog/src/layouts/BlogLayout.astro:

~~~astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';

interface Props {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

const {
  title,
  description,
  canonicalPath = Astro.url.pathname,
  ogType = 'website',
  ogImage,
  publishedTime,
  modifiedTime,
  jsonLd,
  noindex = false,
} = Astro.props;

const siteUrl = Astro.site ?? new URL('https://blog.shuoyu.me');
const canonicalUrl = new URL(canonicalPath, siteUrl).toString();
const resolvedOgImage = ogImage ?? '/og.png';
const ogImageUrl = new URL(resolvedOgImage, siteUrl).toString();
const jsonLdText = jsonLd
  ? JSON.stringify(jsonLd).replace(/</g, '\\u003c')
  : undefined;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta id="theme-color" name="theme-color" content="#eaeef6" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonicalUrl} />
    {noindex && <meta name="robots" content="noindex, follow" />}
    <title>{title}</title>
    <meta property="og:site_name" content="Shuoyu Chen — Notes" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={canonicalUrl} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="og:image" content={ogImageUrl} />
    <meta name="twitter:image" content={ogImageUrl} />
    {publishedTime && (
      <meta property="article:published_time" content={publishedTime.toISOString()} />
    )}
    {modifiedTime && (
      <meta property="article:modified_time" content={modifiedTime.toISOString()} />
    )}
    {jsonLdText && <script type="application/ld+json" set:html={jsonLdText} />}

    <script is:inline>
      document.documentElement.classList.add('js');
      try {
        const stored = localStorage.getItem('shuoyu-blog-ui-language');
        document.documentElement.dataset.uiLang = stored === 'zh' ? 'zh' : 'en';
        document.documentElement.lang = stored === 'zh' ? 'zh-CN' : 'en';
      } catch {
        document.documentElement.dataset.uiLang = 'en';
        document.documentElement.lang = 'en';
      }

      let storedTheme = null;
      try {
        storedTheme = localStorage.getItem('theme');
      } catch {
        // Use the system preference when storage is unavailable.
      }
      document.documentElement.dataset.theme =
        storedTheme === 'dark' || storedTheme === 'light'
          ? storedTheme
          : matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main">
      <slot />
    </main>
  </body>
</html>
~~~

- [ ] **Step 2: Add the shared navigation and control components.**

Create blog/src/components/Header.astro:

~~~astro
---
import LanguageToggle from './LanguageToggle.astro';
import ThemeToggle from './ThemeToggle.astro';
---

<header class="site-header">
  <div class="header-inner">
    <a class="site-mark" href="/" aria-label="Shuoyu Chen — Notes">
      SHUOYU.CHEN / NOTES
    </a>
    <nav aria-label="Primary navigation" data-i18n-aria-label="primaryNavigation">
      <a href="/" data-i18n-key="navNotes">Notes</a>
      <a href="/archive" data-i18n-key="navArchive">Archive</a>
      <a href="/tags" data-i18n-key="navTags">Tags</a>
      <a href="/about" data-i18n-key="navAbout">About</a>
    </nav>
    <div class="header-controls">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  </div>
</header>
~~~

Create blog/src/components/ThemeToggle.astro:

~~~astro
<button
  class="icon-button"
  type="button"
  data-theme-toggle
  aria-label="Toggle color theme"
  aria-pressed="false"
  data-i18n-aria-label="themeLabel"
>
  <span aria-hidden="true">◐</span>
</button>

<script>
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  };

  const resolvedTheme = () =>
    root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

  const paintTheme = () => {
    const dark = resolvedTheme() === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    button?.setAttribute('aria-pressed', String(dark));
  };

  button?.addEventListener('click', () => {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // The theme remains active for the current page when storage is blocked.
    }
    paintTheme();
  });

  systemDark.addEventListener('change', () => {
    if (!storedTheme()) {
      root.dataset.theme = systemDark.matches ? 'dark' : 'light';
      paintTheme();
    }
  });

  paintTheme();
</script>
~~~

Create blog/src/components/LanguageToggle.astro:

~~~astro
---
import { dictionaries } from '../i18n';
---

<div
  class="language-toggle"
  data-language-toggle
  role="group"
  aria-label="Language"
  data-i18n-aria-label="languageLabel"
>
  <span class="sr-only" data-i18n-key="languageLabel">Language</span>
  <button type="button" data-language="en" aria-pressed="true">EN</button>
  <span aria-hidden="true">/</span>
  <button type="button" data-language="zh" aria-pressed="false">中文</button>
</div>

<script define:vars={{ dictionaries }}>
  type Language = keyof typeof dictionaries;
  type DictionaryKey = keyof typeof dictionaries.en;

  const storageKey = 'shuoyu-blog-ui-language';
  const isLanguage = (value: string | null): value is Language =>
    value === 'en' || value === 'zh';

  const translate = (
    language: Language,
    key: DictionaryKey,
    count = '',
  ) => {
    const dictionary = dictionaries[language] || dictionaries.en;
    const template = dictionary[key] || dictionaries.en[key];
    return template.replaceAll('{count}', count);
  };

  const applyLanguage = (language: Language) => {
    document.documentElement.dataset.uiLang = language;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n-key]').forEach((node) => {
      const rawKey = node.getAttribute('data-i18n-key');
      if (!rawKey || !(rawKey in dictionaries.en)) return;
      const key = rawKey as DictionaryKey;
      const count = node.getAttribute('data-i18n-count') || '';
      node.textContent = translate(language, key, count);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      const rawKey = node.getAttribute('data-i18n-aria-label');
      if (!rawKey || !(rawKey in dictionaries.en)) return;
      const key = rawKey as DictionaryKey;
      node.setAttribute('aria-label', translate(language, key));
    });

    document.querySelectorAll('[data-i18n-date]').forEach((node) => {
      const value = node.getAttribute('datetime');
      if (!value) return;
      node.textContent = new Intl.DateTimeFormat(
        language === 'zh' ? 'zh-CN' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        },
      ).format(new Date(value));
    });

    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.getAttribute('data-language') === language),
      );
    });
  };

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    // English remains the static fallback when storage is unavailable.
  }

  const initialLanguage = isLanguage(stored) ? stored : 'en';
  applyLanguage(initialLanguage);

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
      const language = button.getAttribute('data-language');
      if (!isLanguage(language)) return;
      try {
        localStorage.setItem(storageKey, language);
      } catch {
        // The selection remains active for the current page.
      }
      applyLanguage(language);
    });
  });
</script>
~~~

- [ ] **Step 3: Add the reading-first visual system.**

Create blog/src/styles/global.css:

~~~css
@import './prose.css';

:root {
  color-scheme: light;
  --page: #eaeef6;
  --surface: rgba(255, 255, 255, 0.7);
  --ink: #1c2433;
  --muted: #647087;
  --line: rgba(54, 73, 104, 0.18);
  --accent: #315fc4;
  --accent-soft: rgba(49, 95, 196, 0.12);
  --max-content: 1120px;
  --reading-width: 720px;
  --sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --serif: 'Source Serif 4', Georgia, serif;
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --page: #0a0d14;
  --surface: rgba(19, 25, 38, 0.78);
  --ink: #e7edf8;
  --muted: #9aa8c0;
  --line: rgba(185, 201, 230, 0.2);
  --accent: #8eafff;
  --accent-soft: rgba(142, 175, 255, 0.14);
}

@font-face {
  font-family: Inter;
  src: url('/fonts/inter-latin-var.woff2') format('woff2');
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: 'Source Serif 4';
  src: url('/fonts/source-serif-4-latin-var.woff2') format('woff2');
  font-style: normal;
  font-weight: 200 900;
  font-display: swap;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--page);
}

body {
  min-width: 320px;
  margin: 0;
  color: var(--ink);
  background: var(--page);
  font-family: var(--sans);
  line-height: 1.6;
}

a {
  color: inherit;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--page) 84%, transparent);
  backdrop-filter: blur(18px);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 28px;
  width: min(calc(100% - 40px), var(--max-content));
  min-height: 72px;
  margin: 0 auto;
}

.site-mark {
  color: var(--ink);
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-decoration: none;
  white-space: nowrap;
}

.site-header nav {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: var(--muted);
  font-size: 0.9rem;
}

.site-header nav a {
  text-decoration: none;
}

.site-header nav a:hover,
.site-header nav a:focus-visible {
  color: var(--accent);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.icon-button,
.language-toggle button {
  border: 1px solid var(--line);
  color: var(--muted);
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.icon-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.icon-button:hover,
.language-toggle button:hover,
.language-toggle button[aria-pressed='true'] {
  border-color: var(--accent);
  color: var(--accent);
}

.language-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  font-size: 0.8rem;
}

.language-toggle button {
  padding: 2px 4px;
  border: 0;
  border-radius: 4px;
}

.site-main,
main {
  width: min(calc(100% - 40px), var(--max-content));
  margin: 0 auto;
}

.page-intro {
  max-width: var(--reading-width);
  padding: 96px 0 52px;
}

.page-kicker {
  margin: 0 0 12px;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 0.96;
}

.page-description {
  max-width: 640px;
  margin: 24px 0 0;
  color: var(--muted);
  font-size: 1.08rem;
}

.post-list {
  max-width: var(--reading-width);
  margin: 0;
  padding: 0 0 96px;
  list-style: none;
}

.post-list-item {
  border-top: 1px solid var(--line);
  padding: 28px 0 30px;
}

.post-list-title a {
  display: block;
  text-decoration: none;
}

.post-list-title a:hover,
.post-list-title a:focus-visible {
  color: var(--accent);
}

.post-list-title {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(1.55rem, 3vw, 2.1rem);
  font-weight: 550;
  line-height: 1.15;
}

.post-list-description {
  max-width: 640px;
  margin: 10px 0 16px;
  color: var(--muted);
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.post-meta-group {
  display: inline-flex;
  gap: 5px;
  margin: 0;
}

.post-meta dt,
.post-meta dd {
  margin: 0;
}

.post-meta dt {
  color: var(--ink);
  font-weight: 650;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.tag-link {
  padding: 3px 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-size: 0.75rem;
  text-decoration: none;
}

.tag-link:hover,
.tag-link:focus-visible {
  border-color: var(--accent);
  color: var(--accent);
}

.archive-year {
  margin: 0 0 52px;
}

.archive-year-title {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
}

.archive-year .post-list {
  padding-bottom: 0;
}

.tag-index {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-width: var(--reading-width);
  padding-bottom: 96px;
}

.tag-index-link {
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  text-decoration: none;
}

.tag-index-link:hover,
.tag-index-link:focus-visible {
  border-color: var(--accent);
  color: var(--accent);
}

.post-shell {
  width: min(100%, var(--reading-width));
  margin: 0 auto;
  padding: 88px 0 96px;
}

.post-header {
  margin-bottom: 48px;
}

.post-title {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2.6rem, 7vw, 5.4rem);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.post-description {
  margin: 24px 0 20px;
  color: var(--muted);
  font-size: 1.12rem;
}

.post-cover {
  display: block;
  width: 100%;
  margin: 36px 0 48px;
  border-radius: 10px;
}

.paper-details {
  margin: 36px 0;
  padding: 18px 20px;
  border-left: 2px solid var(--accent);
  background: var(--accent-soft);
}

.paper-details p {
  margin: 0 0 8px;
}

.paper-details ul {
  margin: 0;
  padding-left: 20px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 72px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.post-nav-link {
  max-width: 45%;
  color: var(--muted);
  text-decoration: none;
}

.post-nav-link:hover,
.post-nav-link:focus-visible {
  color: var(--accent);
}

.post-nav-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.78rem;
}

.post-nav-title {
  font-family: var(--serif);
  font-size: 1.15rem;
}

.skip-link {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 20;
  padding: 8px 12px;
  transform: translateY(-160%);
  color: var(--page);
  background: var(--ink);
}

.skip-link:focus {
  transform: translateY(0);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

html:not(.js) [data-language-toggle] {
  display: none;
}

@media (max-width: 760px) {
  .header-inner {
    flex-wrap: wrap;
    gap: 12px 18px;
    padding: 15px 0;
  }

  .site-header nav {
    order: 3;
    width: 100%;
    gap: 14px;
  }

  .page-intro {
    padding-top: 68px;
  }

  .post-shell {
    padding-top: 64px;
  }

  .post-footer {
    display: grid;
  }

  .post-nav-link {
    max-width: 100%;
  }
}
~~~

Create blog/src/styles/prose.css:

~~~css
.prose {
  font-family: var(--serif);
  font-size: 1.12rem;
  line-height: 1.78;
}

.prose > :first-child {
  margin-top: 0;
}

.prose h2,
.prose h3,
.prose h4 {
  margin: 2.2em 0 0.65em;
  color: var(--ink);
  font-family: var(--sans);
  line-height: 1.2;
}

.prose h2 {
  font-size: 1.55rem;
}

.prose h3 {
  font-size: 1.25rem;
}

.prose p,
.prose ul,
.prose ol,
.prose blockquote,
.prose table,
.prose pre {
  margin: 1.15em 0;
}

.prose a {
  color: var(--accent);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.15em;
}

.prose blockquote {
  margin-right: 0;
  margin-left: 0;
  padding-left: 20px;
  border-left: 2px solid var(--accent);
  color: var(--muted);
}

.prose pre {
  overflow-x: auto;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: var(--surface);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.prose code {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.9em;
}

.prose :not(pre) > code {
  padding: 0.12em 0.28em;
  border-radius: 3px;
  background: var(--accent-soft);
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--sans);
  font-size: 0.9rem;
}

.prose th,
.prose td {
  padding: 8px 10px;
  border: 1px solid var(--line);
  text-align: left;
}
~~~

- [ ] **Step 4: Update the page baseline to use the layout.**

Replace blog/src/pages/index.astro with:

~~~astro
---
import BlogLayout from '../layouts/BlogLayout.astro';

const title = 'Notes — Shuoyu Chen';
const description = 'Paper notes, engineering practice, and learning materials.';
---

<BlogLayout title={title} description={description} canonicalPath="/">
  <section class="page-intro">
    <p class="page-kicker" data-i18n-key="homeKicker">Personal archive</p>
    <h1 class="page-title" data-i18n-key="homeTitle">Notes</h1>
    <p class="page-description" data-i18n-key="homeDescription">{description}</p>
  </section>
</BlogLayout>
~~~

- [ ] **Step 5: Verify the shared shell and manually inspect both themes.**

Run:

~~~sh
npm run check:all
npm run build:all
npm run dev:blog -- --port 4322
~~~

Expected: type checking and static builds pass. At the local blog URL, the header, theme button, responsive navigation, and language controls are visible. Without client JavaScript, the page remains readable in English and the language control is hidden.

- [ ] **Step 6: Commit the shared shell.**

Run:

~~~sh
git add blog/src/layouts blog/src/components/Header.astro blog/src/components/LanguageToggle.astro blog/src/components/ThemeToggle.astro blog/src/styles blog/src/pages/index.astro
git commit -m "feat: add blog reading layout"
~~~

## Task 5: Render the home page and article pages

**Files:**

- Create: blog/src/components/PostMeta.astro
- Create: blog/src/components/PostList.astro
- Create: blog/src/components/TableOfContents.astro
- Create: blog/src/components/PaperDetails.astro
- Create: blog/src/layouts/PostLayout.astro
- Modify: blog/src/pages/index.astro
- Create: blog/src/pages/posts/[slug].astro

- [ ] **Step 1: Add the metadata component with UI translation markers.**

Create blog/src/components/PostMeta.astro:

~~~astro
---
import { formatDate, typeLabelKey } from '../i18n';
import { tagPath } from '../lib/content';
import type { BlogPost } from '../lib/post-types';

interface Props {
  post: BlogPost;
}

const { post } = Astro.props;
const typeKey = typeLabelKey(post.data.type);
---

<dl class="post-meta">
  <div class="post-meta-group">
    <dt data-i18n-key={typeKey}>
      {typeKey === 'typePaperNotes'
        ? 'Paper notes'
        : typeKey === 'typeEngineering'
          ? 'Engineering'
          : 'Learning'}
    </dt>
  </div>
  <div class="post-meta-group">
    <dt data-i18n-key="published">Published</dt>
    <dd>
      <time datetime={post.data.pubDate.toISOString()} data-i18n-date>
        {formatDate(post.data.pubDate, 'en')}
      </time>
    </dd>
  </div>
  {post.data.updatedDate && (
    <div class="post-meta-group">
      <dt data-i18n-key="updated">Updated</dt>
      <dd>
        <time datetime={post.data.updatedDate.toISOString()} data-i18n-date>
          {formatDate(post.data.updatedDate, 'en')}
        </time>
      </dd>
    </div>
  )}
</dl>

<ul class="tag-row" aria-label="Tags" data-i18n-aria-label="navTags">
  {post.data.tags.map((tag) => (
    <li>
      <a class="tag-link" href={tagPath(tag)}>{tag}</a>
    </li>
  ))}
</ul>
~~~

- [ ] **Step 2: Add the post list and empty state.**

Create blog/src/components/PostList.astro:

~~~astro
---
import PostMeta from './PostMeta.astro';
import { postPath } from '../lib/content';
import type { BlogPost } from '../lib/post-types';

interface Props {
  posts: readonly BlogPost[];
}

const { posts } = Astro.props;
---

{posts.length === 0 ? (
  <p class="empty-state" data-i18n-key="emptyPosts">
    No notes have been published yet.
  </p>
) : (
  <ol class="post-list">
    {posts.map((post) => (
      <li class="post-list-item">
        <h2 class="post-list-title">
          <a href={postPath(post)}>{post.data.title}</a>
        </h2>
        <p class="post-list-description">{post.data.description}</p>
        <PostMeta post={post} />
      </li>
    ))}
  </ol>
)}
~~~

- [ ] **Step 3: Add the table of contents and optional paper metadata components.**

Create blog/src/components/TableOfContents.astro:

~~~astro
---
import type { MarkdownHeading } from 'astro';

interface Props {
  headings: MarkdownHeading[];
}

const visibleHeadings = Astro.props.headings.filter((heading) => heading.depth <= 3);
---

{visibleHeadings.length > 0 && (
  <nav
    class="table-of-contents"
    aria-label="On this page"
    data-i18n-aria-label="tableOfContents"
  >
    <p class="page-kicker" data-i18n-key="tableOfContents">On this page</p>
    <ol>
      {visibleHeadings.map((heading) => (
        <li class={'toc-depth-' + heading.depth}>
          <a href={'#' + heading.slug}>{heading.text}</a>
        </li>
      ))}
    </ol>
  </nav>
)}
~~~

Create blog/src/components/PaperDetails.astro:

~~~astro
---
import type { PaperMeta, PostLinks } from '../lib/post-types';

interface Props {
  paper?: PaperMeta;
  links?: PostLinks;
}

const { paper, links } = Astro.props;
const hasPaper = Boolean(
  paper &&
    (paper.title ||
      (paper.authors?.length ?? 0) > 0 ||
      paper.venue ||
      paper.year ||
      paper.url),
);
const paperUrl = paper?.url ?? links?.paper;
const hasLinks = Boolean(paperUrl || links?.repo || links?.demo);
---

{(hasPaper || hasLinks) && (
  <aside class="paper-details">
    {hasPaper && (
      <>
        <p data-i18n-key="paperDetails">Paper details</p>
        {paper?.title && <p>{paper.title}</p>}
        {paper?.authors && paper.authors.length > 0 && (
          <p>
            <strong data-i18n-key="authors">Authors</strong>:
            {paper.authors.join(', ')}
          </p>
        )}
        {paper?.venue && (
          <p>
            <strong data-i18n-key="venue">Venue</strong>: {paper.venue}
            {paper.year ? ' ' + paper.year : ''}
          </p>
        )}
      </>
    )}
    {hasLinks && (
      <ul>
        {paperUrl && (
          <li>
            <a href={paperUrl} rel="noreferrer" target="_blank" data-i18n-key="originalPaper">
              Original paper
            </a>
          </li>
        )}
        {links?.repo && (
          <li>
            <a href={links.repo} rel="noreferrer" target="_blank" data-i18n-key="repository">
              Repository
            </a>
          </li>
        )}
        {links?.demo && (
          <li>
            <a href={links.demo} rel="noreferrer" target="_blank" data-i18n-key="demo">
              Demo
            </a>
          </li>
        )}
      </ul>
    )}
  </aside>
)}
~~~

- [ ] **Step 4: Add the article layout and BlogPosting JSON-LD.**

Create blog/src/layouts/PostLayout.astro:

~~~astro
---
import type { MarkdownHeading } from 'astro';
import BlogLayout from './BlogLayout.astro';
import PaperDetails from '../components/PaperDetails.astro';
import PostMeta from '../components/PostMeta.astro';
import TableOfContents from '../components/TableOfContents.astro';
import { postPath } from '../lib/content';
import type { BlogPost } from '../lib/post-types';

interface Props {
  post: BlogPost;
  headings: MarkdownHeading[];
  newer?: BlogPost;
  older?: BlogPost;
}

const { post, headings, newer, older } = Astro.props;
const canonicalPath = postPath(post);
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.pubDate.toISOString(),
  ...(post.data.updatedDate
    ? { dateModified: post.data.updatedDate.toISOString() }
    : {}),
  mainEntityOfPage: 'https://blog.shuoyu.me' + canonicalPath,
  author: {
    '@type': 'Person',
    name: 'Shuoyu Chen',
    url: 'https://shuoyu.me/',
  },
  publisher: {
    '@type': 'Person',
    name: 'Shuoyu Chen',
    url: 'https://shuoyu.me/',
  },
};
---

<BlogLayout
  title={post.data.title + ' — Shuoyu Chen'}
  description={post.data.description}
  canonicalPath={canonicalPath}
  ogType="article"
  ogImage={post.data.cover}
  publishedTime={post.data.pubDate}
  modifiedTime={post.data.updatedDate}
  jsonLd={jsonLd}
>
  <article class="post-shell">
    <header class="post-header">
      <p class="page-kicker" data-i18n-key="homeKicker">Personal archive</p>
      <h1 class="post-title">{post.data.title}</h1>
      <p class="post-description">{post.data.description}</p>
      <PostMeta post={post} />
    </header>

    {post.data.cover && (
      <img class="post-cover" src={post.data.cover} alt={post.data.title} />
    )}

    <PaperDetails paper={post.data.paper} links={post.data.links} />
    <TableOfContents headings={headings} />

    <div class="prose">
      <slot />
    </div>

    <footer class="post-footer">
      {newer ? (
        <a class="post-nav-link" href={postPath(newer)}>
          <span class="post-nav-label" data-i18n-key="newerNote">Newer note</span>
          <span class="post-nav-title">{newer.data.title}</span>
        </a>
      ) : <span />}
      {older ? (
        <a class="post-nav-link" href={postPath(older)}>
          <span class="post-nav-label" data-i18n-key="olderNote">Older note</span>
          <span class="post-nav-title">{older.data.title}</span>
        </a>
      ) : <span />}
    </footer>

    <p>
      <a href="/archive" data-i18n-key="backToArchive">Back to archive</a>
    </p>
  </article>
</BlogLayout>
~~~

- [ ] **Step 5: Replace the home page with the published collection query.**

Replace blog/src/pages/index.astro with:

~~~astro
---
import { getCollection } from 'astro:content';
import BlogLayout from '../layouts/BlogLayout.astro';
import PostList from '../components/PostList.astro';
import { publishedPosts } from '../lib/content';

const posts = publishedPosts(await getCollection('posts'));
const title = 'Notes — Shuoyu Chen';
const description = 'Paper notes, engineering practice, and learning materials.';
---

<BlogLayout title={title} description={description} canonicalPath="/">
  <section class="page-intro">
    <p class="page-kicker" data-i18n-key="homeKicker">Personal archive</p>
    <h1 class="page-title" data-i18n-key="homeTitle">Notes</h1>
    <p class="page-description" data-i18n-key="homeDescription">{description}</p>
  </section>
  <PostList posts={posts} />
</BlogLayout>
~~~

- [ ] **Step 6: Add static article route generation.**

Create blog/src/pages/posts/[slug].astro:

~~~astro
---
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { publishedPosts } from '../../lib/content';

const posts = publishedPosts(await getCollection('posts'));

type PostEntry = CollectionEntry<'posts'>;

interface Props {
  post: PostEntry;
  newer?: PostEntry;
  older?: PostEntry;
}

export function getStaticPaths() {
  return posts.map((post, index) => ({
    params: { slug: post.id },
    props: {
      post,
      newer: posts[index - 1],
      older: posts[index + 1],
    },
  }));
}

const { post, newer, older } = Astro.props;
const { Content, headings } = await render(post);
---

<PostLayout post={post} headings={headings} newer={newer} older={older}>
  <Content />
</PostLayout>
~~~

- [ ] **Step 7: Verify the home and article routes.**

Run:

~~~sh
npm run check:all
npm run build:blog
~~~

Expected: the build creates blog/dist/index.html and blog/dist/posts/about-this-archive/index.html. Draft fixture titles are absent from generated HTML.

- [ ] **Step 8: Commit home and article rendering.**

Run:

~~~sh
git add blog/src/components/PostMeta.astro blog/src/components/PostList.astro blog/src/components/TableOfContents.astro blog/src/components/PaperDetails.astro blog/src/layouts/PostLayout.astro blog/src/pages/index.astro blog/src/pages/posts
git commit -m "feat: render blog notes and articles"
~~~

## Task 6: Add archive, tag, about, and 404 pages

**Files:**

- Create: blog/src/components/ArchiveList.astro
- Create: blog/src/components/TagList.astro
- Create: blog/src/pages/archive.astro
- Create: blog/src/pages/tags/index.astro
- Create: blog/src/pages/tags/[tag].astro
- Create: blog/src/pages/about.astro
- Create: blog/src/pages/404.astro

- [ ] **Step 1: Add archive and tag list components.**

Create blog/src/components/ArchiveList.astro:

~~~astro
---
import PostList from './PostList.astro';
import type { YearGroup } from '../lib/content';

interface Props {
  groups: readonly YearGroup[];
}

const { groups } = Astro.props;
---

{groups.map((group) => (
  <section class="archive-year">
    <h2 class="archive-year-title">{group.year}</h2>
    <PostList posts={group.posts} />
  </section>
))}
~~~

Create blog/src/components/TagList.astro:

~~~astro
---
import { tagPath, type TagSummary } from '../lib/content';

interface Props {
  tags: readonly TagSummary[];
}

const { tags } = Astro.props;
---

<div class="tag-index">
  {tags.map((tag) => (
    <a class="tag-index-link" href={tagPath(tag.slug)}>
      <span>{tag.label}</span>
      <span
        class="tag-index-count"
        data-i18n-key="articleCount"
        data-i18n-count={String(tag.count)}
      >
        {tag.count} articles
      </span>
    </a>
  ))}
</div>
~~~

- [ ] **Step 2: Add the chronological archive page.**

Create blog/src/pages/archive.astro:

~~~astro
---
import { getCollection } from 'astro:content';
import ArchiveList from '../components/ArchiveList.astro';
import BlogLayout from '../layouts/BlogLayout.astro';
import { groupPostsByYear, publishedPosts } from '../lib/content';

const posts = publishedPosts(await getCollection('posts'));
const groups = groupPostsByYear(posts);
---

<BlogLayout
  title="Archive — Shuoyu Chen"
  description="A chronological record of published notes."
  canonicalPath="/archive"
>
  <section class="page-intro">
    <p class="page-kicker" data-i18n-key="homeKicker">Personal archive</p>
    <h1 class="page-title" data-i18n-key="archiveTitle">Archive</h1>
    <p class="page-description" data-i18n-key="archiveDescription">
      A chronological record of published notes.
    </p>
  </section>
  <ArchiveList groups={groups} />
</BlogLayout>
~~~

- [ ] **Step 3: Add the tag index and tag detail pages.**

Create blog/src/pages/tags/index.astro:

~~~astro
---
import { getCollection } from 'astro:content';
import BlogLayout from '../../layouts/BlogLayout.astro';
import TagList from '../../components/TagList.astro';
import { getTagIndex, publishedPosts } from '../../lib/content';

const posts = publishedPosts(await getCollection('posts'));
const tags = getTagIndex(posts);
---

<BlogLayout
  title="Tags — Shuoyu Chen"
  description="Browse the archive by topic."
  canonicalPath="/tags"
>
  <section class="page-intro">
    <p class="page-kicker" data-i18n-key="homeKicker">Personal archive</p>
    <h1 class="page-title" data-i18n-key="tagsTitle">Tags</h1>
    <p class="page-description" data-i18n-key="tagsDescription">
      Browse the archive by topic.
    </p>
  </section>
  <TagList tags={tags} />
</BlogLayout>
~~~

Create blog/src/pages/tags/[tag].astro:

~~~astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import BlogLayout from '../../layouts/BlogLayout.astro';
import PostList from '../../components/PostList.astro';
import {
  getTagIndex,
  postsForTag,
  publishedPosts,
  tagPath,
  type TagSummary,
} from '../../lib/content';

type PostEntry = CollectionEntry<'posts'>;

const posts = publishedPosts(await getCollection('posts'));
const tags = getTagIndex(posts);

interface Props {
  tag: TagSummary;
  posts: PostEntry[];
}

export function getStaticPaths() {
  return tags.map((tag) => ({
    params: { tag: tag.slug },
    props: {
      tag,
      posts: postsForTag(posts, tag.slug),
    },
  }));
}

const { tag, posts: tagPosts } = Astro.props;
---

<BlogLayout
  title={tag.label + ' — Shuoyu Chen'}
  description={'Notes tagged ' + tag.label + '.'}
  canonicalPath={tagPath(tag.slug)}
>
  <section class="page-intro">
    <p class="page-kicker" data-i18n-key="tagsTitle">Tags</p>
    <h1 class="page-title">{tag.label}</h1>
    <p
      class="page-description"
      data-i18n-key="articleCount"
      data-i18n-count={String(tag.count)}
    >
      {tag.count} articles
    </p>
  </section>
  <PostList posts={tagPosts} />
</BlogLayout>
~~~

- [ ] **Step 4: Add About and 404 pages with translated UI copy.**

Create blog/src/pages/about.astro:

~~~astro
---
import BlogLayout from '../layouts/BlogLayout.astro';
---

<BlogLayout
  title="About — Shuoyu Chen"
  description="How this archive is organized."
  canonicalPath="/about"
>
  <section class="page-intro">
    <p class="page-kicker" data-i18n-key="homeKicker">Personal archive</p>
    <h1 class="page-title" data-i18n-key="aboutTitle">About</h1>
    <p class="page-description" data-i18n-key="aboutDescription">
      How this archive is organized.
    </p>
  </section>
  <section class="prose reading-width">
    <p data-i18n-key="aboutBody">
      This blog collects paper notes, engineering practice, and learning materials.
      Articles are authored in Markdown or MDX and published through Git.
    </p>
  </section>
</BlogLayout>
~~~

Create blog/src/pages/404.astro:

~~~astro
---
import BlogLayout from '../layouts/BlogLayout.astro';
---

<BlogLayout
  title="Page not found — Shuoyu Chen"
  description="The page you requested does not exist."
  canonicalPath="/404"
  noindex
>
  <section class="page-intro">
    <p class="page-kicker">404</p>
    <h1 class="page-title" data-i18n-key="notFoundTitle">Page not found</h1>
    <p class="page-description" data-i18n-key="notFoundDescription">
      The page you requested does not exist.
    </p>
    <p>
      <a href="/" data-i18n-key="backHome">Back to notes</a>
    </p>
  </section>
</BlogLayout>
~~~

- [ ] **Step 5: Add the small style rules needed by archive, tags, and the table of contents.**

Append to blog/src/styles/global.css:

~~~css
.empty-state {
  max-width: var(--reading-width);
  padding: 28px 0 96px;
  border-top: 1px solid var(--line);
  color: var(--muted);
}

.table-of-contents {
  display: block;
  margin: 40px 0;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  font-family: var(--sans);
  font-size: 0.88rem;
}

.table-of-contents .page-kicker {
  margin-bottom: 8px;
}

.table-of-contents ol {
  margin: 0;
  padding-left: 20px;
}

.table-of-contents li {
  margin: 4px 0;
}

.table-of-contents .toc-depth-3 {
  margin-left: 14px;
}

.reading-width {
  max-width: var(--reading-width);
}
~~~

- [ ] **Step 6: Verify all browsing surfaces and draft exclusion.**

Run:

~~~sh
npm run check:all
npm run build:blog
~~~

Expected: the static output contains home, article, archive, tags, tag detail, about, 404, and no route or visible text for the three draft fixtures. The archive is grouped by year and tag pages contain only published posts.

- [ ] **Step 7: Commit the archive and discovery pages.**

Run:

~~~sh
git add blog/src/components/ArchiveList.astro blog/src/components/TagList.astro blog/src/pages/archive.astro blog/src/pages/tags blog/src/pages/about.astro blog/src/pages/404.astro blog/src/styles/global.css
git commit -m "feat: add blog archive and tag browsing"
~~~

## Task 7: Add RSS, sitemap/robots metadata, local assets, and deployment documentation

**Files:**

- Create: blog/src/pages/rss.xml.ts
- Create: blog/public/robots.txt
- Create: blog/public/favicon.svg
- Copy: public/fonts/inter-latin-var.woff2 to blog/public/fonts/inter-latin-var.woff2
- Copy: public/fonts/source-serif-4-latin-var.woff2 to blog/public/fonts/source-serif-4-latin-var.woff2
- Copy: public/og.png to blog/public/og.png
- Modify: README.md

- [ ] **Step 1: Add the RSS endpoint for published posts only.**

Create blog/src/pages/rss.xml.ts:

~~~ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { publishedPosts, postPath } from '../lib/content';
import { en } from '../i18n/en';

export const GET: APIRoute = async ({ site }) => {
  const posts = publishedPosts(await getCollection('posts'));
  const blogSite = site ?? new URL('https://blog.shuoyu.me');

  return rss({
    title: en.rssTitle,
    description: en.homeDescription,
    site: blogSite,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: new URL(postPath(post), blogSite).toString(),
    })),
  });
};
~~~

- [ ] **Step 2: Add robots and the approved shared static assets.**

Create blog/public/robots.txt:

~~~text
User-agent: *
Allow: /
Sitemap: https://blog.shuoyu.me/sitemap-index.xml
~~~

Create blog/public/favicon.svg by copying the exact contents of public/favicon.svg so the independent blog output uses the approved mark.

Run these asset commands:

~~~sh
mkdir -p blog/public/fonts
cp public/favicon.svg blog/public/favicon.svg
cp public/fonts/inter-latin-var.woff2 blog/public/fonts/inter-latin-var.woff2
cp public/fonts/source-serif-4-latin-var.woff2 blog/public/fonts/source-serif-4-latin-var.woff2
cp public/og.png blog/public/og.png
cmp public/fonts/inter-latin-var.woff2 blog/public/fonts/inter-latin-var.woff2
cmp public/fonts/source-serif-4-latin-var.woff2 blog/public/fonts/source-serif-4-latin-var.woff2
cmp public/og.png blog/public/og.png
~~~

Expected: all cmp commands exit 0 and blog/public contains the fonts, favicon, and 1200x630 social card.

- [ ] **Step 3: Verify the default social card fallback.**

Run:

~~~sh
rg -n "resolvedOgImage|og:image|twitter:image" blog/src/layouts/BlogLayout.astro
~~~

Expected: the layout resolves `ogImage ?? '/og.png'`, emits both social-image tags unconditionally, and still permits an article cover image to override the fallback.

- [ ] **Step 4: Document local commands and both Pages projects.**

Modify README.md in two locations: insert the Blog development section after the existing Local development section, then replace the existing Cloudflare Pages section with the combined two-project section below.

~~~md
## Blog development

Run the homepage and blog independently:

```sh
npm run dev
npm run dev:blog
```

Run repository-wide validation:

```sh
npm run test:all
npm run check:all
npm run build:all
```

## Cloudflare Pages

Both sites use the same Git repository and the main branch.

Use the Astro framework preset and a Node.js version compatible with the engines declared in package.json.

| Project | Build command | Build directory | Domain |
| --- | --- | --- | --- |
| Homepage | npm run build | dist | shuoyu.me |
| Blog | npm run build:blog | blog/dist | blog.shuoyu.me |

The blog Pages project must use the repository root as its working directory, execute npm run build:blog, and publish blog/dist. It must not use the homepage dist directory.
~~~

- [ ] **Step 5: Verify RSS, sitemap, robots, and canonical metadata.**

Run:

~~~sh
npm run build:blog
~~~

Expected artifacts:

- blog/dist/rss.xml exists and includes the published starter note;
- blog/dist/sitemap-index.xml exists and points to the blog origin;
- blog/dist/robots.txt includes the sitemap URL;
- blog/dist/index.html and article HTML use https://blog.shuoyu.me/ canonical URLs;
- no draft fixture appears in RSS or sitemap.

- [ ] **Step 6: Commit metadata, assets, and deployment documentation.**

Run:

~~~sh
git add blog/src/pages/rss.xml.ts blog/public README.md
git add -f blog/public/fonts/inter-latin-var.woff2 blog/public/fonts/source-serif-4-latin-var.woff2 blog/public/og.png
git commit -m "feat: add blog metadata and deployment assets"
~~~

## Task 8: Add deterministic static-build verification and complete QA

**Files:**

- Create: scripts/verify-blog-build.mjs
- Modify: package.json to add the `verify:blog-build` script
- Modify: README.md to list the new verifier in repository-wide validation

- [ ] **Step 1: Add the static-build verifier and expose it from the root package.**

Create scripts/verify-blog-build.mjs:

~~~js
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requiredFiles = [
  'blog/dist/index.html',
  'blog/dist/posts/about-this-archive/index.html',
  'blog/dist/archive/index.html',
  'blog/dist/tags/index.html',
  'blog/dist/tags/meta/index.html',
  'blog/dist/about/index.html',
  'blog/dist/404.html',
  'blog/dist/rss.xml',
  'blog/dist/robots.txt',
  'blog/dist/sitemap-index.xml',
];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error('Missing blog build artifact: ' + relativePath);
  }
}

const indexHtml = readFileSync(resolve(root, 'blog/dist/index.html'), 'utf8');
const archiveHtml = readFileSync(resolve(root, 'blog/dist/archive/index.html'), 'utf8');
const tagsHtml = readFileSync(resolve(root, 'blog/dist/tags/index.html'), 'utf8');
const metaTagHtml = readFileSync(resolve(root, 'blog/dist/tags/meta/index.html'), 'utf8');
const articleHtml = readFileSync(
  resolve(root, 'blog/dist/posts/about-this-archive/index.html'),
  'utf8',
);
const rssXml = readFileSync(resolve(root, 'blog/dist/rss.xml'), 'utf8');
const robotsTxt = readFileSync(resolve(root, 'blog/dist/robots.txt'), 'utf8');
const sitemapXml = readFileSync(
  resolve(root, 'blog/dist/sitemap-index.xml'),
  'utf8',
);

if (!indexHtml.includes('https://blog.shuoyu.me/')) {
  throw new Error('Blog home is missing the blog canonical origin.');
}

if (!articleHtml.includes('application/ld+json')) {
  throw new Error('Article page is missing BlogPosting JSON-LD.');
}

const publicHtml = [indexHtml, archiveHtml, tagsHtml, metaTagHtml, articleHtml].join('\n');
const draftTitles = [
  'Example Paper Notes',
  'Example Engineering Note',
  'Example Learning Note',
];

for (const draftTitle of draftTitles) {
  if (publicHtml.includes(draftTitle) || rssXml.includes(draftTitle) || sitemapXml.includes(draftTitle)) {
    throw new Error('Draft fixture leaked into the public build: ' + draftTitle);
  }
}

if (!robotsTxt.includes('Sitemap: https://blog.shuoyu.me/sitemap-index.xml')) {
  throw new Error('robots.txt has the wrong sitemap URL.');
}

if (!sitemapXml.includes('blog.shuoyu.me')) {
  throw new Error('Sitemap does not point to the blog origin.');
}

const draftPaths = [
  'blog/dist/posts/example-paper-notes/index.html',
  'blog/dist/posts/example-engineering/index.html',
  'blog/dist/posts/example-learning/index.html',
];

for (const relativePath of draftPaths) {
  if (existsSync(resolve(root, relativePath))) {
    throw new Error('Draft route was generated: ' + relativePath);
  }
}

for (const draftSlug of [
  '/posts/example-paper-notes',
  '/posts/example-engineering',
  '/posts/example-learning',
]) {
  if (sitemapXml.includes(draftSlug)) {
    throw new Error('Draft URL leaked into the sitemap: ' + draftSlug);
  }
}

console.log('Blog static build verified: ' + requiredFiles.length + ' artifacts.');
~~~

The file list is intentionally explicit so a missing route or metadata artifact fails with the exact path.

Add this entry to the root package.json scripts object:

~~~json
"verify:blog-build": "node scripts/verify-blog-build.mjs"
~~~

In README.md, add `npm run verify:blog-build` after `npm run build:all` in the repository-wide validation block created in Task 7.

- [ ] **Step 2: Run the verifier against the current build to validate the complete route contract.**

Run:

~~~sh
node scripts/verify-blog-build.mjs
~~~

Expected: the verifier either names the first missing artifact/metadata violation or confirms the currently built route set. Do not treat a passing result as a substitute for the full rebuild in the next step.

- [ ] **Step 3: Run the complete repository build and tests.**

Run:

~~~sh
npm run test:all
npm run check:all
npm run build:all
npm run verify:blog-build
~~~

Expected: all commands exit 0. The verifier prints:

~~~text
Blog static build verified: 10 artifacts.
~~~

- [ ] **Step 4: Perform the local interaction QA pass.**

Run:

~~~sh
npm run dev:blog -- --port 4322
~~~

Check the local blog in this order:

1. Home lists the published starter note with title, summary, type, date, and tags.
2. Article page renders the Markdown body, paper metadata when present, code/prose styles, canonical metadata, and previous/next links.
3. Archive groups the article under 2026.
4. Tags lists meta and writing and opens the meta tag page.
5. About and 404 pages render their UI copy.
6. Clicking 中文 changes navigation, type labels, counts, dates, buttons, and accessibility labels.
7. Article title, article body, paper title, author names, and tag values remain unchanged when the UI language changes.
8. Reloading preserves the UI language; clearing the blog-specific localStorage key restores English.
9. The theme button switches light/dark mode and remains readable at mobile width.
10. The homepage at the root app still has About, Research, and Others only, with no Blog entry.

- [ ] **Step 5: Check repository boundaries and formatting.**

Run:

~~~sh
git diff --check
find blog/dist -maxdepth 3 -type f | sort
npm test
npm run check
npm run build
~~~

Expected: no whitespace errors; the blog output is under blog/dist; the homepage checks and build continue to pass independently.

- [ ] **Step 6: Commit the verification script.**

Run:

~~~sh
git add package.json README.md scripts/verify-blog-build.mjs
git commit -m "test: verify blog static output"
~~~

- [ ] **Step 7: Configure the two Cloudflare Pages projects.**

Use the existing homepage Pages project with:

~~~text
Working directory: repository root
Build command: npm run build
Build output directory: dist
Production branch: main
Custom domain: shuoyu.me
~~~

Create or configure the independent blog Pages project with:

~~~text
Working directory: repository root
Build command: npm run build:blog
Build output directory: blog/dist
Production branch: main
Custom domain: blog.shuoyu.me
~~~

After the first deployment, verify the production URLs, canonical links, RSS URL, sitemap URL, and draft exclusion from the public blog.

## Final implementation handoff

After all tasks are complete, the implementation should satisfy these checks:

- The root homepage continues to build with its existing command and navigation.
- The blog can be developed with npm run dev:blog.
- Both apps can be checked and built from the repository root.
- Blog content is authored by adding Markdown/MDX files under blog/src/content/posts/.
- Drafts are excluded from every public discovery surface.
- The blog has home, article, archive, tags, tag detail, about, 404, RSS, sitemap, and robots output.
- The UI language toggle defaults to English, switches generated UI copy to Chinese, persists locally, and does not translate article content.
- The two Cloudflare Pages projects use independent build commands and output directories.
- The homepage has no blog navigation entry.
- No CMS, backend, login, comments, analytics, auto-translation, or language-specific article routes are introduced.
