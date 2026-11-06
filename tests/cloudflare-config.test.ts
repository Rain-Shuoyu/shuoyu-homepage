import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Cloudflare Worker deployment', () => {
  it('uses the built site and serves the custom 404 page for missing paths', () => {
    const configPath = resolve(process.cwd(), 'wrangler.jsonc');

    expect(existsSync(configPath)).toBe(true);

    const config = readFileSync(configPath, 'utf8');
    expect(config).toMatch(/"directory"\s*:\s*"\.\/dist"/);
    expect(config).toMatch(/"not_found_handling"\s*:\s*"404-page"/);
  });
});
