/* What would stripping comments ACTUALLY save on the wire? Gzip already
   compresses prose well, so the raw-byte figure overstates the benefit.
   Measure it rather than assume it. */
const fs = require('fs');
const zlib = require('zlib');

const FILES = ['ghlczechui.js','i18n-rules.js','lang/cs-CZ.js','lang/source-en.js','collector.js'];

function stripComments(s) {
  let out = '', i = 0, inStr = null, inBlock = false, inLine = false;
  const BS = String.fromCharCode(92);
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

let gzBefore = 0, gzAfter = 0, rawBefore = 0, rawAfter = 0;
const rows = [];
for (const f of FILES) {
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const stripped = stripComments(s).split('\n').map(l => l.trimEnd()).filter(l => l.trim()).join('\n');
  let parses = true;
  try { new Function(stripped); } catch (e) { parses = false; }
  const a = zlib.gzipSync(s, { level: 6 }).length;         // level 6 ~ what a server uses
  const b = zlib.gzipSync(stripped, { level: 6 }).length;
  rows.push({
    file: f,
    rawKB: +(Buffer.byteLength(s) / 1024).toFixed(1),
    strippedKB: +(Buffer.byteLength(stripped) / 1024).toFixed(1),
    gzKB: +(a / 1024).toFixed(1),
    gzStrippedKB: +(b / 1024).toFixed(1),
    gzSavedKB: +((a - b) / 1024).toFixed(1),
    gzSavedPct: +(((a - b) / a) * 100).toFixed(1),
    strippedStillParses: parses
  });
  gzBefore += a; gzAfter += b;
  rawBefore += Buffer.byteLength(s); rawAfter += Buffer.byteLength(stripped);
}

console.log(JSON.stringify({
  rows,
  totals: {
    rawBeforeKB: +(rawBefore / 1024).toFixed(1),
    rawAfterKB: +(rawAfter / 1024).toFixed(1),
    gzBeforeKB: +(gzBefore / 1024).toFixed(1),
    gzAfterKB: +(gzAfter / 1024).toFixed(1),
    gzSavedKB: +((gzBefore - gzAfter) / 1024).toFixed(1),
    gzSavedPct: +(((gzBefore - gzAfter) / gzBefore) * 100).toFixed(1)
  }
}, null, 1));
