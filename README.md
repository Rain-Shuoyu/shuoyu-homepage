# Shuoyu Chen's homepage

This repository contains Shuoyu Chen's static personal homepage, built with Astro.

## Local development

Install dependencies and start the local development server:

```sh
npm install
npm run dev
```

Run the verification commands before handing off a change:

```sh
npm test
npm run check
npm run build
```

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
npm run verify:blog-build
```

## Cloudflare Pages

Both sites use the same Git repository and the `main` branch.

Use the Astro framework preset and a Node.js version compatible with the engines declared in package.json.

| Project | Build command | Build directory | Domain |
| --- | --- | --- | --- |
| Homepage | `npm run build` | `dist` | `shuoyu.me` |
| Blog | `npm run build:blog` | `blog/dist` | `blog.shuoyu.me` |

The blog Pages project must use the repository root as its working directory, execute `npm run build:blog`, and publish `blog/dist`. It must not use the homepage `dist` directory.

Both sites use static output and do not need an adapter, database, runtime secret, or server function.
