/* =============================================================================
   build.js — ship without comments, keep them for ourselves.

   Tom's decision, 12 Sep 2026. The comments are 29% of what crosses the wire
   (measured: 65.5 KB of 222.8 KB gzipped) and 68.5% of the engine file.

   WHY THIS IS MORE CAREFUL THAN A MINIFIER WOULD BE.
   Until now this project had a safety property worth naming: what is in git is
   byte-for-byte what ships, so a mangled deploy was not possible. A build step
   throws that away and puts a transform between the source and the user.

   So the property is REPLACED rather than abandoned. This script does not ask
   to be trusted; it PROVES each output is the same program as its input, and
   writes nothing if it cannot:

     1. the built file parses
     2. the TOKEN STREAMS are identical — every string, regex, number,
        identifier and punctuator, in order, comments and whitespace ignored.
        This is the real proof: it can only pass if nothing but comments and
        whitespace changed.
     3. the non-ASCII codepoints are identical, as a multiset. Czech is the
        product; a transform that turns "ě" into "Ä>" must die here. See the
        PowerShell mojibake incident, 12 Sep.
     4. the three data modules are require()d from both source and build and
        deep-compared — every dictionary key, every regex source and flag.
        The engine cannot be required (it touches document at load), so for
        that one, 1-3 carry the weight.

   DELIBERATELY NOT A MINIFIER. No identifier renaming, no reformatting. The
   measured saving is almost entirely the comments; mangling would add real
   risk for a few more kilobytes, and this code reaches a live business.

   Usage:  node build.js          build + verify into dist/
           node build.js --check  verify only, write nothing
============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = 'dist';
const MODULES = [
  { file: 'ghlczechui.js', requireable: false },
  { file: 'i18n-rules.js', requireable: true },
  { file: 'collector.js',  requireable: false },
  /* Loaded by its OWN <script> tag in HighLevel's Custom JS, not by the
     engine — so a dist/ deployment that omitted it would leave one tag
     pointing at the unbuilt copy. Included so dist/ is a complete, testable
     deployment rather than most of one. */
  { file: 'gap-picker.js', requireable: false },
  { file: path.join('lang', 'cs-CZ.js'),     requireable: true },
  { file: path.join('lang', 'source-en.js'), requireable: true }
];

/* ---------- the tokenizer ------------------------------------------------
   One pass, used for BOTH stripping and verifying, so the two can never
   disagree about what a token is.

   The hard part of tokenizing JavaScript without a parser is telling a regex
   literal from a division. The standard heuristic: a '/' starts a regex when
   the previous significant token cannot end an expression. Getting this wrong
   matters here more than in most codebases — lang/source-en.js is 123 regex
   literals, several containing escaped slashes, and a stripper that mistook
   one for division would silently eat the rest of the line.
   ---------------------------------------------------------------------- */

const PUNCT = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}',
  ';', '+', '-', '*', '%', '^', '~', '<', '>']);
const KEYWORD_BEFORE_REGEX = new Set(['return', 'typeof', 'instanceof', 'in',
  'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);

function regexAllowed(prev) {
  if (!prev) return true;
  if (prev.type === 'punct') {
    if (prev.value === ')' || prev.value === ']') return false;
    return true;
  }
  if (prev.type === 'name') return KEYWORD_BEFORE_REGEX.has(prev.value);
  return false;   /* after a string, number or regex, '/' is division */
}

/* Returns { tokens, stripped }.
   `stripped` replaces every comment with a single space, which cannot join two
   tokens together. Blank-only lines are dropped afterwards. */
function scan(src, fileLabel) {
  const tokens = [];
  let out = '';
  let i = 0;
  const n = src.length;
  let prev = null;

  const push = (type, value) => { const t = { type, value }; tokens.push(t); prev = t; };

  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];

    /* whitespace: kept verbatim in output, never a token */
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { out += c; i++; continue; }

    /* comments -> one space */
    if (c === '/' && c2 === '/') {
      while (i < n && src[i] !== '\n') i++;
      out += ' ';
      continue;
    }
    if (c === '/' && c2 === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) throw new Error(fileLabel + ': unterminated block comment at ' + i);
      i = end + 2;
      out += ' ';
      continue;
    }

    /* strings and template literals */
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      let j = i + 1;
      let raw = c;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { raw += d + (src[j + 1] || ''); j += 2; continue; }
        if (d === quote) { raw += d; j++; break; }
        if (d === '\n' && quote !== '`') {
          throw new Error(fileLabel + ': newline inside ' + quote + ' string at ' + i);
        }
        raw += d; j++;
      }
      out += raw;
      push('string', raw);
      i = j;
      continue;
    }

    /* regex literal */
    if (c === '/' && regexAllowed(prev)) {
      let j = i + 1;
      let raw = '/';
      let inClass = false;
      let closed = false;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { raw += d + (src[j + 1] || ''); j += 2; continue; }
        if (d === '[') inClass = true;
        else if (d === ']') inClass = false;
        else if (d === '/' && !inClass) { raw += d; j++; closed = true; break; }
        else if (d === '\n') break;
        raw += d; j++;
      }
      if (!closed) throw new Error(fileLabel + ': unterminated regex at offset ' + i);
      while (j < n && /[a-z]/i.test(src[j])) { raw += src[j]; j++; }   /* flags */
      out += raw;
      push('regex', raw);
      i = j;
      continue;
    }

    /* numbers */
    if (c >= '0' && c <= '9') {
      let j = i, raw = '';
      while (j < n && /[0-9a-fA-FxXoObBeE._]/.test(src[j])) {
        if ((src[j] === 'e' || src[j] === 'E') && (src[j + 1] === '+' || src[j + 1] === '-')) {
          raw += src[j] + src[j + 1]; j += 2; continue;
        }
        raw += src[j]; j++;
      }
      out += raw; push('number', raw); i = j; continue;
    }

    /* identifiers, keywords — allow the full unicode range so Czech in an
       identifier position would survive rather than be split */
    if (/[A-Za-z_$-￿]/.test(c)) {
      let j = i, raw = '';
      while (j < n && /[A-Za-z0-9_$-￿]/.test(src[j])) { raw += src[j]; j++; }
      out += raw; push('name', raw); i = j; continue;
    }

    /* everything else is punctuation, one character at a time */
    out += c; push('punct', c); i++;
  }

  /* drop lines that are now only whitespace */
  const cleaned = out.split('\n').map(l => l.replace(/\s+$/, ''))
                     .filter(l => l.trim().length > 0).join('\n') + '\n';
  return { tokens, stripped: cleaned };
}

/* ---------- verification helpers ---------------------------------------- */

function tokensEqual(a, b) {
  if (a.length !== b.length) {
    return { ok: false, why: 'token count ' + a.length + ' vs ' + b.length };
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].type !== b[i].type || a[i].value !== b[i].value) {
      return { ok: false, why: 'token ' + i + ': ' + a[i].type + ' ' +
        JSON.stringify(a[i].value).slice(0, 60) + '  vs  ' + b[i].type + ' ' +
        JSON.stringify(b[i].value).slice(0, 60) };
    }
  }
  return { ok: true };
}

/* Non-ASCII inside CODE, not inside prose.
   The first version of this check compared whole files and failed everything,
   correctly-but-uselessly: comments are full of em-dashes and Czech examples,
   and removing a comment is supposed to remove those. What must survive is
   every non-ASCII character in a token — a dictionary value, a regex, a
   selector. That is the thing the PowerShell incident destroyed. */
function nonAsciiProfile(tokens) {
  const m = new Map();
  for (const t of tokens) {
    for (const ch of t.value) {
      const cp = ch.codePointAt(0);
      if (cp > 127) m.set(cp, (m.get(cp) || 0) + 1);
    }
  }
  return m;
}

function profilesEqual(a, b) {
  if (a.size !== b.size) return { ok: false, why: 'distinct non-ASCII chars ' + a.size + ' vs ' + b.size };
  for (const [cp, count] of a) {
    if (b.get(cp) !== count) {
      return { ok: false, why: 'U+' + cp.toString(16).toUpperCase() + ' (' +
        String.fromCodePoint(cp) + ') appears ' + count + ' vs ' + (b.get(cp) || 0) };
    }
  }
  return { ok: true };
}

/* deep compare that understands RegExp */
function deepEqual(a, b, pathStr, diffs) {
  pathStr = pathStr || '';
  if (a instanceof RegExp || b instanceof RegExp) {
    if (!(a instanceof RegExp) || !(b instanceof RegExp) ||
        a.source !== b.source || a.flags !== b.flags) {
      diffs.push(pathStr + ': regex ' + String(a) + ' vs ' + String(b));
    }
    return;
  }
  if (typeof a === 'function' && typeof b === 'function') {
    if (a.name !== b.name) diffs.push(pathStr + ': fn name ' + a.name + ' vs ' + b.name);
    return;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    if (a !== b) diffs.push(pathStr + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
    return;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) diffs.push(pathStr + ': key count ' + ka.length + ' vs ' + kb.length);
  for (const k of ka) {
    if (!(k in b)) { diffs.push(pathStr + '.' + k + ': missing in build'); continue; }
    if (diffs.length > 20) return;
    deepEqual(a[k], b[k], pathStr + '.' + k, diffs);
  }
}

/* ---------- run ----------------------------------------------------------- */

const checkOnly = process.argv.includes('--check');
const results = [];
let failed = false;

for (const mod of MODULES) {
  const srcPath = mod.file;
  if (!fs.existsSync(srcPath)) { console.log('SKIP (missing) ' + srcPath); continue; }
  const src = fs.readFileSync(srcPath, 'utf8');

  let scanned;
  try { scanned = scan(src, srcPath); }
  catch (e) { console.log('FAIL ' + srcPath + ' — tokenizer: ' + e.message); failed = true; continue; }

  const built = scanned.stripped;
  const checks = [];

  /* 1. it parses */
  let parses = true;
  try { new Function(built); } catch (e) { parses = false; }
  checks.push({ name: 'parses', ok: parses });

  /* 2. token streams identical */
  let rescanned;
  try { rescanned = scan(built, srcPath + ' (built)'); }
  catch (e) { rescanned = null; }
  const tk = rescanned ? tokensEqual(scanned.tokens, rescanned.tokens)
                       : { ok: false, why: 'built file failed to tokenize' };
  checks.push({ name: 'token streams identical', ok: tk.ok, why: tk.why });

  /* 3. every non-ASCII character INSIDE CODE preserved exactly */
  const pf = rescanned
    ? profilesEqual(nonAsciiProfile(scanned.tokens), nonAsciiProfile(rescanned.tokens))
    : { ok: false, why: 'built file failed to tokenize' };
  checks.push({ name: 'non-ASCII in code preserved', ok: pf.ok, why: pf.why });

  /* 4. data modules: require both and deep-compare */
  if (mod.requireable) {
    const tmp = path.join(require('os').tmpdir(), 'kabuild-' + path.basename(srcPath));
    fs.writeFileSync(tmp, built, 'utf8');
    const diffs = [];
    try {
      const a = require(path.resolve(srcPath));
      const b = require(tmp);
      deepEqual(a, b, path.basename(srcPath), diffs);
    } catch (e) {
      diffs.push('require failed: ' + e.message);
    }
    fs.unlinkSync(tmp);
    checks.push({ name: 'exports deep-equal', ok: diffs.length === 0,
                  why: diffs.slice(0, 3).join(' | ') });
  }

  const allOk = checks.every(c => c.ok);
  if (!allOk) failed = true;

  const gzA = zlib.gzipSync(src, { level: 6 }).length;
  const gzB = zlib.gzipSync(built, { level: 6 }).length;
  results.push({ file: srcPath, checks, allOk,
    rawBefore: Buffer.byteLength(src), rawAfter: Buffer.byteLength(built),
    gzBefore: gzA, gzAfter: gzB, built });
}

/* report */
let tGzA = 0, tGzB = 0, tRawA = 0, tRawB = 0;
console.log('');
for (const r of results) {
  console.log((r.allOk ? 'OK   ' : 'FAIL ') + r.file);
  for (const c of r.checks) {
    if (!c.ok) console.log('       ✗ ' + c.name + (c.why ? ' — ' + c.why : ''));
  }
  console.log('       ' + (r.rawBefore / 1024).toFixed(1) + ' KB -> ' +
    (r.rawAfter / 1024).toFixed(1) + ' KB raw   |   ' +
    (r.gzBefore / 1024).toFixed(1) + ' KB -> ' + (r.gzAfter / 1024).toFixed(1) + ' KB gzip   (-' +
    (100 * (r.gzBefore - r.gzAfter) / r.gzBefore).toFixed(0) + '%)');
  tGzA += r.gzBefore; tGzB += r.gzAfter; tRawA += r.rawBefore; tRawB += r.rawAfter;
}
console.log('');
console.log('TOTAL  ' + (tRawA / 1024).toFixed(1) + ' KB -> ' + (tRawB / 1024).toFixed(1) + ' KB raw');
console.log('       ' + (tGzA / 1024).toFixed(1) + ' KB -> ' + (tGzB / 1024).toFixed(1) +
  ' KB gzip   (-' + ((tGzA - tGzB) / 1024).toFixed(1) + ' KB, -' +
  (100 * (tGzA - tGzB) / tGzA).toFixed(1) + '%)');

if (failed) {
  console.log('\nNOT WRITTEN — a verification failed. The build is refused rather than shipped.');
  process.exit(1);
}

if (checkOnly) { console.log('\n--check: verified, nothing written.'); process.exit(0); }

/* write, then READ BACK AND RE-VERIFY.
   Every check above ran on a string in memory. The failure this project has
   actually suffered happened at the moment of writing: an encoding that turned
   "ě" into mojibake across 81 lines. So the last check is on the bytes that
   are really on disk, which is the only artifact anyone will ever serve. */
fs.mkdirSync(path.join(OUT, 'lang'), { recursive: true });
let writeFailed = false;
for (const r of results) {
  const dest = path.join(OUT, r.file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, r.built, 'utf8');

  const readBack = fs.readFileSync(dest, 'utf8');
  if (readBack.charCodeAt(0) === 0xFEFF) {
    console.log('FAIL ' + dest + ' — a BOM was written'); writeFailed = true; continue;
  }
  let rb;
  try { rb = scan(readBack, dest); }
  catch (e) { console.log('FAIL ' + dest + ' — will not tokenize after write: ' + e.message);
              writeFailed = true; continue; }
  const srcTokens = scan(fs.readFileSync(r.file, 'utf8'), r.file).tokens;
  const same = tokensEqual(srcTokens, rb.tokens);
  if (!same.ok) {
    console.log('FAIL ' + dest + ' — differs from source after write: ' + same.why);
    writeFailed = true; continue;
  }
  const enc = profilesEqual(nonAsciiProfile(srcTokens), nonAsciiProfile(rb.tokens));
  if (!enc.ok) {
    console.log('FAIL ' + dest + ' — encoding damaged on write: ' + enc.why);
    writeFailed = true;
  }
}

if (writeFailed) {
  console.log('\nFiles were written but DID NOT verify on read-back. Do not deploy dist/.');
  process.exit(1);
}
console.log('\nWritten to ' + OUT + '/ — verified equivalent to source, on disk.');
