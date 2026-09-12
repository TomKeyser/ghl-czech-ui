/* Size and composition of each shipped module. Run from the repo root. */
const fs = require('fs');
const zlib = require('zlib');

const FILES = [
  ['src/ghlczechui.js',    'engine'],
  ['src/i18n-rules.js',    'rules engine'],
  ['src/lang/cs-CZ.js',    'target pack (cs-CZ)'],
  ['src/lang/source-en.js','source rules (en)'],
  ['src/gap-picker.js',    'dev tool, opt-in'],
  ['src/review-tool.js',   'dev tool, opt-in']
];

/* Strip comments while respecting strings and template literals.
   Regex literals are NOT handled specially; a `/` after an operator could be
   misread. Checked against the real files by confirming the stripped output
   still parses, which it must for the number to mean anything. */
function stripComments(s) {
  let out = '', i = 0, inStr = null, inBlock = false, inLine = false;
  const BS = String.fromCharCode(92); // backslash
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i += 2; continue; } i++; continue; }
    if (inLine)  { if (c === '\n') { inLine = false; out += c; } i++; continue; }
    if (inStr) {
      if (c === BS) { out += c + (n || ''); i += 2; continue; }
      if (c === inStr) inStr = null;
      out += c; i++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; out += c; i++; continue; }
    if (c === '/' && n === '*') { inBlock = true; i += 2; continue; }
    if (c === '/' && n === '/') { inLine = true; i += 2; continue; }
    out += c; i++;
  }
  return out;
}

const rows = [];
let totRaw = 0, totGz = 0, totCode = 0;

for (const [f, label] of FILES) {
  if (!fs.existsSync(f)) { rows.push({ f, label, missing: true }); continue; }
  const s = fs.readFileSync(f, 'utf8');
  const raw = Buffer.byteLength(s, 'utf8');
  const gz = zlib.gzipSync(s, { level: 9 }).length;
  const br = zlib.brotliCompressSync(Buffer.from(s, 'utf8')).length;

  const stripped = stripComments(s);
  const codeOnly = stripped.split('\n').map(l => l.trimEnd()).filter(l => l.trim()).join('\n');
  const codeBytes = Buffer.byteLength(codeOnly, 'utf8');

  let parses = true;
  try { new Function(codeOnly); } catch (e) { parses = false; }

  rows.push({
    f, label, raw, gz, br,
    lines: s.split('\n').length,
    codeBytes,
    proseBytes: raw - codeBytes,
    prosePct: ((raw - codeBytes) / raw * 100),
    strippedParses: parses
  });
  totRaw += raw; totGz += gz; totCode += codeBytes;
}

const shipped = rows.filter(r => !r.missing && !/dev tool/.test(r.label));
const shipRaw = shipped.reduce((a, r) => a + r.raw, 0);
const shipGz  = shipped.reduce((a, r) => a + r.gz, 0);
const shipCode = shipped.reduce((a, r) => a + r.codeBytes, 0);

console.log(JSON.stringify({ rows, totals: { shipRaw, shipGz, shipCode,
  shipProsePct: ((shipRaw - shipCode) / shipRaw * 100) } }, null, 1));
