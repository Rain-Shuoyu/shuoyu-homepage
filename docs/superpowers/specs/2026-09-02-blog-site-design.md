# Blog Site Design

**Date:** 2026-09-02  
**Status:** Approved for implementation planning  
**Scope:** An independent bilingual-UI blog at `blog.shuoyu.me`, managed in the same repository as the existing English homepage.

## 1. Goals and confirmed decisions

The blog is a publishing and archive site for three kinds of material:

- paper quick reads;
- engineering practice;
- learning materials and notes.

The experience should feel closer to a personal publication archive than to a social feed. The latest writing should be easy to browse, while older writing should remain discoverable by year, type, and tag.

The following decisions are fixed for v1:

1. The homepage and blog live in one Git repository.
2. They are two independent Astro applications in that repository.
3. They deploy as two independent Cloudflare Pages projects.
4. The homepage remains English-only and does not receive a Blog navigation entry.
5. The blog defaults to English and provides an English/Chinese UI toggle.
6. The user provides the article documents in bilingual form when needed. The blog does not translate article content, maintain language-specific article routes, or auto-generate translations.
7. Articles are authored as Markdown or MDX files and published through Git.
8. There is no CMS, login, comments, database, or recommendation system in v1.

## 2. User experience

The blog's primary navigation is:

`Notes · Archive · Tags · About · EN / 中文`

The homepage does not link to the blog. The blog may later link back to `shuoyu.me` as a small, independent utility link, but that is not required for the initial implementation.

### Home page

`blog.shuoyu.me/` shows the newest published articles first. Each item includes:

- title;
- short description;
- publication date;
- content type;
- tags;
- optional updated date.

The page should make the archive visible without turning the homepage into a dense dashboard. A small type filter or type summary can be added if it remains useful at the expected article volume; the canonical browsing surfaces are still Archive and Tags.

### Article page

`blog.shuoyu.me/posts/<slug>` renders the article with a reading-first layout:

- title and description;
- publication and updated dates;
- type and tags;
- optional paper, repository, or demo metadata;
- Markdown/MDX body;
- code blocks, quotations, tables, images, and links;
- previous/next or related navigation only when it improves archive traversal.

The main text column should remain approximately 680–760px wide on large screens, with comfortable line height and a responsive layout on small screens. The visual language can reuse the homepage's typography, colors, dark-mode behavior, and other stable brand cues, while the blog's hierarchy should prioritize reading and chronology.

### Archive and tags

`/archive` groups published articles by year in reverse chronological order. Each entry exposes the same compact metadata as the home page.

`/tags` lists all tags with article counts. `/tags/<tag>` lists the published articles associated with one tag. Type values (`paper-notes`, `engineering`, and `learning`) remain first-class metadata even when a tag page is the primary discovery mechanism.

### About page

`/about` briefly explains what the blog contains and how it is maintained. It is independent from the homepage biography. It must not invent or automatically add external identity links that the user has chosen not to publish.

## 3. Repository and application architecture

The current homepage app remains at the repository root. A new Astro app is added under `blog/`:

```text
/Users/shuoyuchen/code/homepage/
├── src/                         # existing homepage app
├── public/                      # existing homepage assets
├── astro.config.mjs             # existing homepage config
├── package.json                 # homepage scripts + unified repo scripts
├── blog/
│   ├── src/
│   │   ├── components/
│   │   ├── content/
│   │   │   └── posts/
│   │   ├── i18n/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── styles/
│   ├── public/
│   ├── astro.config.mjs
│   ├── package.json
│   └── tsconfig.json
└── docs/superpowers/specs/
```

The two apps have separate Astro configuration, pages, layouts, content, and generated output. This prevents host-based routing from coupling the homepage's canonical URL, page graph, and deployment behavior to the blog.

The root package remains the entry point for repository-wide work. The implementation should add workspace-aware commands with the following intended behavior:

```text
npm run dev          # existing homepage development server
npm run dev:blog     # blog development server
npm run check:all    # check both applications
npm run build:all    # build homepage and blog
npm run build        # existing homepage build behavior remains available
```

Using npm workspaces or an equivalent explicit delegation is acceptable. The important contract is that a contributor can install dependencies once, run either app directly, or validate both apps from the repository root.

### Sharing boundary

Page components and article content remain app-local. Stable design tokens, fonts, and small utility code may be shared later if doing so reduces duplication without making either app depend on the other's page tree. A shared package is not required to deliver the first blog version; introducing one should be a deliberate follow-up rather than a prerequisite for the blog skeleton.

## 4. Deployment model

Both Cloudflare Pages projects connect to the same Git repository but use different build commands and output directories:

| Site | Project working directory | Build command | Output directory | Domain |
| --- | --- | --- | --- | --- |
| Homepage | repository root | `npm run build` | `dist/` | `shuoyu.me` |
| Blog | repository root | `npm run build:blog` | `blog/dist/` | `blog.shuoyu.me` |

The blog build must not write into the homepage's `dist/`, and the homepage build must not depend on the blog app. Each Pages project can therefore be deployed, previewed, rolled back, and diagnosed independently while the source remains centrally managed.

The implementation phase should verify the exact Pages settings against the existing project and the repository's package-manager lockfile. Path-based build optimization can be added later if build time becomes meaningful; it is not part of the content or routing design.

## 5. Blog routes

The initial route map is:

```text
/
/posts/<slug>
/archive
/tags
/tags/<tag>
/about
/rss.xml
/404
```

The sitemap and robots metadata should be generated as part of the static build. The blog's canonical site URL is `https://blog.shuoyu.me`, independent of the homepage's `https://shuoyu.me` URL.

There are no `/zh/...` or `/en/...` article routes in v1. The language control changes interface copy in place and does not create a second URL tree.

## 6. Content model

Articles live in `blog/src/content/posts/` as `.md` or `.mdx` files. The filename is the stable slug unless a later requirement introduces an explicit slug override.

The collection schema should require the fields needed for reliable archive rendering and permit optional domain-specific metadata:

```yaml
---
title: Article title
description: A concise summary shown in lists and metadata
pubDate: 2026-09-02
type: paper-notes
tags:
  - robotics
  - embodied-intelligence
draft: false
updatedDate: 2026-09-03
paper:
  title: Original paper title
  authors:
    - First Author
    - Second Author
  venue: CoRL
  year: 2026
  url: https://example.com/paper
links:
  repo: https://github.com/example/project
  demo: https://example.com/demo
cover: /images/posts/example-cover.png
---
```

Required fields:

- `title: string`;
- `description: string`;
- `pubDate: date`;
- `type: paper-notes | engineering | learning`;
- `tags: string[]`;
- `draft: boolean`.

Optional fields:

- `updatedDate: date`;
- `cover: string`;
- `paper.title: string`;
- `paper.authors: string[]`;
- `paper.venue: string`;
- `paper.year: number`;
- `paper.url: string`;
- `links.paper: string`;
- `links.repo: string`;
- `links.demo: string`.

The schema should derive or validate the following behavior:

- slugs are unique because they come from unique content filenames;
- drafts are excluded from all public pages, RSS, sitemap, and counts;
- dates are sortable and formatted through the UI dictionary;
- missing optional metadata is hidden cleanly rather than rendered as empty labels;
- invalid frontmatter fails the build with an actionable error.

Article language is intentionally not a schema field. The article file is the source of truth and may contain English, Chinese, or both according to the bilingual document supplied by the user.

## 7. Bilingual UI behavior

The UI language layer is limited to site chrome and generated labels. It covers, for example:

- navigation labels;
- content-type labels;
- archive headings;
- date formatting labels;
- tag and article counts;
- buttons such as “read more,” “copy code,” and “back to archive”;
- empty states, 404 text, RSS/about descriptions, and accessibility labels.

The implementation should use small dictionary modules such as:

```text
blog/src/i18n/en.ts
blog/src/i18n/zh.ts
blog/src/components/LanguageToggle.astro
```

English is the default and the static fallback. A client-side toggle can persist the preference in `localStorage` under a blog-specific key and expose the current value through a root `data-ui-lang` attribute. The control must be keyboard accessible, visibly indicate the current selection, and work without requiring a page-specific translation route.

The toggle must not imply that an English-only article has been translated. It changes labels and other generated UI copy; article body content stays exactly as authored.

## 8. Proposed file responsibilities

The implementation plan should preserve a straightforward mapping between responsibility and file:

```text
blog/src/content.config.ts       # posts collection and frontmatter schema
blog/src/content/posts/*.md      # published and draft source articles
blog/src/i18n/en.ts               # English UI dictionary
blog/src/i18n/zh.ts               # Chinese UI dictionary
blog/src/layouts/BlogLayout.astro
blog/src/layouts/PostLayout.astro
blog/src/components/Header.astro
blog/src/components/LanguageToggle.astro
blog/src/components/PostList.astro
blog/src/components/PostMeta.astro
blog/src/components/ArchiveList.astro
blog/src/components/TagList.astro
blog/src/components/TableOfContents.astro
blog/src/pages/index.astro
blog/src/pages/posts/[slug].astro
blog/src/pages/archive.astro
blog/src/pages/tags/index.astro
blog/src/pages/tags/[tag].astro
blog/src/pages/about.astro
blog/src/pages/rss.xml.ts
blog/src/pages/404.astro
blog/src/styles/                  # blog-local reading and theme styles
blog/public/                      # favicon, social images, post assets
```

Components should receive already-normalized article data and UI strings where practical. Content filtering and sorting belong near the collection query, while layout files own document metadata, theme hooks, and page-level structure.

## 9. Publishing flow

The intended workflow is:

```text
write bilingual Markdown/MDX
        ↓
set metadata and draft status
        ↓
run local checks and build
        ↓
commit and push
        ↓
Cloudflare Pages builds blog/dist/
        ↓
blog.shuoyu.me serves the new archive entry
```

There is no editorial database or runtime publishing service. A draft is a normal source file with `draft: true`; changing it to `false` is the publication action.

## 10. SEO, accessibility, and quality requirements

Each public article should include:

- a canonical URL under `blog.shuoyu.me`;
- title and description metadata;
- Open Graph/Twitter-compatible social metadata;
- `BlogPosting` JSON-LD with the available date and author information;
- readable heading structure and link text;
- responsive images with useful alternative text;
- code blocks that remain usable on narrow screens.

The blog should generate RSS for published posts and exclude drafts from all discovery artifacts. Since the language toggle changes UI only and does not create translated document URLs, `hreflang` alternates are not required in v1.

The implementation should manually verify both light and dark themes, desktop and mobile layouts, keyboard operation of the language toggle, readable fallback without client JavaScript, archive/tag navigation, and the absence of a Blog entry in the homepage navigation.

## 11. Testing and acceptance criteria

Repository-level checks should cover both apps:

- homepage checks continue to pass unchanged;
- blog type checking and Astro build pass;
- `npm run check:all` checks both apps;
- `npm run build:all` produces both `dist/` and `blog/dist/` without cross-app writes;
- malformed frontmatter is rejected;
- drafts do not appear in home, archive, tag pages, RSS, or sitemap;
- tags and yearly archive groups contain the correct published articles;
- article slugs produce the expected `/posts/<slug>` routes;
- the language toggle changes UI labels, persists the preference, and leaves article body content unchanged;
- the homepage has no Blog navigation entry;
- canonical and social metadata use `blog.shuoyu.me` for blog pages.

The implementation should add focused tests for collection normalization and the language dictionary rather than relying only on a successful browser render. A small set of fixture articles should cover all three types, optional paper metadata, an engineering link, a learning note, a draft, and an updated date.

## 12. Implementation phases

1. Add the `blog/` Astro application and root-level unified scripts without changing homepage page behavior.
2. Add the posts collection, schema validation, fixture content, and draft filtering.
3. Build the blog layout, navigation, home page, article page, archive, tags, about page, and 404 page.
4. Add the English/Chinese UI dictionary and accessible client-side language toggle.
5. Add RSS, sitemap/robots, canonical/social metadata, and BlogPosting JSON-LD.
6. Run repository-wide checks, perform responsive/theme/language QA, and verify the two Pages build contracts.

The implementation plan should make each phase independently testable and should keep homepage changes limited to repository-level scripts or shared infrastructure that do not alter its public navigation or content.

## 13. Explicit non-goals and deferred decisions

The following are intentionally deferred:

- a CMS or browser-based editor;
- comments, reactions, accounts, or moderation;
- analytics and personalized recommendations;
- full-text search before the archive has enough articles to justify it;
- automatic translation or language-specific article copies;
- a runtime API, database, or authentication layer;
- a shared component package before the two app boundaries have stabilized.

These can be reconsidered after the publishing workflow and archive structure have been used for real articles.
