import { resolve } from 'node:path';
import { readCsv } from './csv.mjs';
import { validateCorpus, validateScreeningRow } from './model.mjs';

function parseArgs(argv) {
  const root = resolve(import.meta.dirname, '../..');
  const args = {
    corpus: resolve(root, 'research/corl2024/data/papers.csv'),
    input: resolve(root, 'research/corl2024/data/screening.csv'),
    allowPending: false,
    strict: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--corpus') args.corpus = resolve(argv[++i]);
    else if (argv[i] === '--input') args.input = resolve(argv[++i]);
    else if (argv[i] === '--allow-pending') args.allowPending = true;
    else if (argv[i] === '--strict') args.strict = true;
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  return args;
}

function validateRows(rows, options) {
  const errors = [];
  rows.forEach((row, index) => {
    for (const error of validateScreeningRow(row, options)) errors.push(`row ${index + 2} (${row.paper_id || 'blank'}): ${error}`);
    if (options.strict && ['A', 'B', 'AB'].includes(row.screen_label) && row.second_review_status !== 'verified') errors.push(`row ${index + 2} (${row.paper_id}): positive rows require second_review_status=verified`);
  });
  if (options.strict && rows.filter((row) => row.screen_label === 'N' && row.second_review_status === 'verified').length < 10) errors.push('strict mode requires at least 10 verified N rows');
  return errors;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const corpus = await readCsv(args.corpus);
  const rows = await readCsv(args.input);
  const errors = [];
  try { validateCorpus(corpus, rows); } catch (error) { errors.push(error.message); }
  errors.push(...validateRows(rows, { allowPending: args.allowPending, strict: args.strict }));
  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Validated ${rows.length} CoRL 2024 screening rows`);
  }
}
