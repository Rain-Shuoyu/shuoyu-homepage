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
