import { readFile, writeFile } from 'node:fs/promises';

const needsQuotes = (value) => /[",\r\n]/.test(value);

export function stringifyCsv(rows, columns) {
  const encode = (value) => {
    const text = value ?? '';
    return needsQuotes(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [columns.map(encode).join(','), ...rows.map((row) => columns.map((column) => encode(row[column])).join(','))].join('\r\n') + '\r\n';
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 2; continue; }
      if (char === '"') { quoted = false; i += 1; continue; }
      cell += char;
      i += 1;
      continue;
    }
    if (char === '"' && cell === '') { quoted = true; i += 1; continue; }
    if (char === ',') { row.push(cell); cell = ''; i += 1; continue; }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = ''; i += 1; continue;
    }
    cell += char;
    i += 1;
  }

  if (quoted) throw new Error(`CSV parse error at row ${rows.length + 1}, column ${row.length + 1}`);
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body
    .filter((values) => values.some((value) => value !== ''))
    .map((values) => Object.fromEntries(header.map((name, index) => [name, values[index] ?? ''])));
}

export async function readCsv(path) { return parseCsv(await readFile(path, 'utf8')); }
export async function writeCsv(path, rows, columns) { await writeFile(path, stringifyCsv(rows, columns)); }
