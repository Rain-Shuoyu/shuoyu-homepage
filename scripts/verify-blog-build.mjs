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
  if (!existsSync(resolve(root, relativePath))) {
    throw new Error('Missing blog build artifact: ' + relativePath);
  }
}

const read = (relativePath) => readFileSync(resolve(root, relativePath), 'utf8');
const indexHtml = read('blog/dist/index.html');
const archiveHtml = read('blog/dist/archive/index.html');
const tagsHtml = read('blog/dist/tags/index.html');
const metaTagHtml = read('blog/dist/tags/meta/index.html');
const articleHtml = read('blog/dist/posts/about-this-archive/index.html');
const rssXml = read('blog/dist/rss.xml');
const robotsTxt = read('blog/dist/robots.txt');
const sitemapIndexXml = read('blog/dist/sitemap-index.xml');
const sitemapPageXml = existsSync(resolve(root, 'blog/dist/sitemap-0.xml'))
  ? read('blog/dist/sitemap-0.xml')
  : '';
const sitemapXml = sitemapIndexXml + '\n' + sitemapPageXml;

if (!indexHtml.includes('https://blog.shuoyu.me/')) {
  throw new Error('Blog home is missing the blog canonical origin.');
}
if (!articleHtml.includes('https://blog.shuoyu.me/posts/about-this-archive')) {
  throw new Error('Article page is missing its blog canonical URL.');
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

for (const relativePath of [
  'blog/dist/posts/example-paper-notes/index.html',
  'blog/dist/posts/example-engineering/index.html',
  'blog/dist/posts/example-learning/index.html',
]) {
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
