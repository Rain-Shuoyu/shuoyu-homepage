/* Rasterises scripts/og-image.svg to public/og.png.
 *
 * Social scrapers do not render SVG, so the card has to ship as a
 * raster image. sharp comes with Astro (libvips/librsvg), so this needs
 * no extra dependency.
 *
 * Run with `npm run og` after editing the SVG, then commit the PNG —
 * it is not generated during `npm run build`, so the build stays fast
 * and reproducible without a rasteriser present.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'og-image.svg');
const target = join(here, '..', 'public', 'og.png');

const svg = await readFile(source);

/* density raises librsvg's rasterisation DPI so text renders crisply
   before being fit to the 1200x630 card. */
const png = await sharp(svg, { density: 192 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();

await writeFile(target, png);

const { width, height } = await sharp(png).metadata();
console.log(`og.png written: ${width}x${height}, ${(png.length / 1024).toFixed(1)} KB`);
