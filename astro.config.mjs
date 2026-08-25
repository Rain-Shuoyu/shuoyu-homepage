import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://shuoyu.me',
  devToolbar: {
    enabled: false,
  },
});
