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

## Cloudflare Pages

Configure the project with these settings:

- Production branch: `main`
- Framework preset: `Astro`
- Build command: `npm run build`
- Build directory: `dist`

The site uses static output and does not need an adapter, database, runtime secret, or server function. The supported runtime declared in `package.json` is Node `>=22.12.0` and npm `>=9.6.5`; Cloudflare Pages should use a compatible Node version.

After domain review completes, configure `shuoyu.me` as the custom domain.
