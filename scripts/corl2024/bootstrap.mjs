import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeCsv } from './csv.mjs';
import { SCREENING_COLUMNS } from './model.mjs';
import { assertCorpusSize, parsePmlrIndex, PAPER_COLUMNS } from './pmlr.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const defaults = {
  source: 'https://proceedings.mlr.press/v270/',
  outputDir: resolve(root, 'research/corl2024/data'),
  auditDate: new Date().toISOString().slice(0, 10),
};

function parseArgs(argv) {
  const args = { ...defaults, allowCount: false, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--allow-count') args.allowCount = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--source') args.source = argv[++i];
    else if (arg === '--output-dir') args.outputDir = resolve(argv[++i]);
    else if (arg === '--audit-date') args.auditDate = argv[++i];
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.auditDate)) throw new Error('--audit-date must use YYYY-MM-DD');
  return args;
}

async function readSource(source) {
  if (source.startsWith('file://')) return readFile(fileURLToPath(source), 'utf8');
  const response = await fetch(source, { headers: { accept: 'text/html' } });
  if (!response.ok) throw new Error(`PMLR request failed: ${response.status} ${response.statusText}`);
  return response.text();
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

const args = parseArgs(process.argv.slice(2));
const html = await readSource(args.source);
const papers = parsePmlrIndex(html, args.source);
assertCorpusSize(papers, args.allowCount);
await mkdir(args.outputDir, { recursive: true });

const screeningPath = resolve(args.outputDir, 'screening.csv');
if (!args.force && await exists(screeningPath)) {
  throw new Error(`Refusing to overwrite existing screening file: ${screeningPath}; use --force to replace it`);
}

const templateRows = papers.map((paper) => Object.fromEntries([
  ...PAPER_COLUMNS.map((column) => [column, paper[column] ?? '']),
  ...SCREENING_COLUMNS.filter((column) => !PAPER_COLUMNS.includes(column)).map((column) => [column, '']),
]));
await writeCsv(resolve(args.outputDir, 'papers.csv'), papers, PAPER_COLUMNS);
await writeCsv(resolve(args.outputDir, 'screening.template.csv'), templateRows, SCREENING_COLUMNS);
const manifest = {
  source_url: args.source,
  fetched_at: new Date().toISOString(),
  audit_date: args.auditDate,
  row_count: papers.length,
  html_sha256: createHash('sha256').update(html).digest('hex'),
};
await writeFile(resolve(args.outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${papers.length} paper rows to ${args.outputDir}`);
