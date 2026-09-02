import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import en from '../i18n/en';
import { postPath, publishedPosts } from '../lib/content';

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
