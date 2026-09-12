#!/usr/bin/env node
/* =============================================================================
   bundle-strings.js — candidate UI strings out of HighLevel's own JS bundles
   (task t47)

   WHY THIS EXISTS: the packs came from HighLevel's localization API, and that
   corpus does not cover the newer surfaces at all — which is why a native
   reviewer kept finding untranslated screens. The strings themselves are
   literals in HighLevel's JS chunks, so they can be read directly, including
   the ones on screens nobody has visited and in MODAL BODIES, which no route
   walker can reach.

   WHAT IT PRODUCES ARE CANDIDATES, NOT ENTRIES. Translating a string you have
   never seen in place is how the context-dependent pile gets WRONG entries
   rather than merely missing ones. Pair it with the collector: a bundle string
   that has ALSO been sighted in the DOM is high-confidence; a bundle-only
   string waits until something sees it.

   USE
     node bundle-strings.js                  # uses harvest/bundle-urls.json
     node bundle-strings.js --refresh        # re-download every chunk

   Collect the URL list from a logged-in tab first:
     [...new Set(performance.getEntriesByType('resource').map(e => e.name))]
       .filter(u => /^https:\/\/(static|appcdn)\.leadconnectorhq\.com\/.*\.js$/.test(u))

   Chunks are cached under harvest/bundles/ (gitignored) so a re-run is free.
   Output: harvest/bundle-candidates.tsv, ranked by how many chunks mention the
   string — a string in several chunks is shared chrome, and shared chrome is
   what a user meets most often.
============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const URLS = path.join(ROOT, 'harvest', 'bundle-urls.json');
const CACHE = path.join(ROOT, 'harvest', 'bundles');
const OUT = path.join(ROOT, 'harvest', 'bundle-candidates.tsv');
const REFRESH = process.argv.includes('--refresh');

/* ---------- what counts as plausible interface text ---------------------
   Deliberately strict. A false positive costs a human a second of reading;
   ten thousand of them cost the list its usefulness, and a list nobody reads
   is the same as no list. */

function isCandidate(s) {
  if (s.length < 4 || s.length > 80) return false;
  if (!/\s/.test(s)) return false;                     /* a phrase, not a token */
  if (!/^[A-Z]/.test(s)) return false;                 /* UI text is sentence case */
  if (!/^[\x20-\x7E]+$/.test(s)) return false;         /* plain ASCII only */
  if (/\s{2,}|^\s|\s$/.test(s)) return false;          /* odd whitespace: markup */
  if (/[<>{}\\|`=;~^]/.test(s)) return false;          /* code, markup, templates */
  if (/[_/]/.test(s)) return false;                    /* paths, snake_case */
  if (/\b[a-z]+[A-Z]/.test(s)) return false;           /* camelCase identifiers */
  if (/\w\.\w/.test(s)) return false;                  /* i18n keys, file names */
  if (/https?:|www\.|@/.test(s)) return false;         /* urls, e-mail */
  if (/\b(?:px|rem|em|vh|vw|rgba?|hsla?|deg|fr)\b/.test(s)) return false;  /* css */
  if (/^[A-Z\s\d.,:%$+-]+$/.test(s) && !/[a-z]/.test(s)) return false;     /* SHOUTING or numbers */
  const words = s.split(/\s+/);
  if (words.length > 14) return false;                 /* a paragraph, not a label */
  if (!words.some(w => /^[A-Za-z]{3,}$/.test(w))) return false;
  return true;
}

/* ---------- fetching, with a cache ------------------------------------- */

async function grab(url) {
  const name = crypto.createHash('sha1').update(url).digest('hex').slice(0, 16) + '.js';
  const file = path.join(CACHE, name);
  if (!REFRESH && fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status + ' ' + url);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
}

/* ---------- string literals out of minified JS -------------------------- */

const LITERAL = /(["'])((?:\\.|(?!\1)[^\\\n\r])*)\1/g;

function unescape_(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
          .replace(/\\n/g, '\n').replace(/\\t/g, '\t')
          .replace(/\\(["'\\/])/g, '$1');
}

function literals(src) {
  const found = new Set();
  let m;
  LITERAL.lastIndex = 0;
  while ((m = LITERAL.exec(src))) {
    let s;
    try { s = unescape_(m[2]); } catch (e) { continue; }
    s = s.trim();
    if (isCandidate(s)) found.add(s);
  }
  return found;
}

/* ---------- what we already have ---------------------------------------- */

function known() {
  const pack = require('./src/lang/cs-CZ.js');
  const set = new Set();
  for (const part of ['dict', 'dictApi']) {
    for (const k of Object.keys(pack[part] || {})) set.add(k);
  }
  for (const scope of Object.values(pack.byRoute || {})) {
    for (const k of Object.keys(scope)) set.add(k);
  }
  return set;
}

async function main() {
  if (!fs.existsSync(URLS)) {
    console.error('No ' + path.relative(ROOT, URLS) + ' — collect the URL list first (see the header).');
    process.exit(1);
  }
  fs.mkdirSync(CACHE, { recursive: true });

  const urls = JSON.parse(fs.readFileSync(URLS, 'utf8'));
  const have = known();
  const seen = new Map();        /* string -> { n, where } */
  let bytes = 0, failed = 0;

  for (let i = 0; i < urls.length; i++) {
    let src;
    try { src = await grab(urls[i]); } catch (e) { failed++; continue; }
    bytes += src.length;
    const chunk = urls[i].split('/').pop();
    for (const s of literals(src)) {
      const rec = seen.get(s) || { n: 0, where: chunk };
      rec.n++;
      seen.set(s, rec);
    }
    if ((i + 1) % 25 === 0) process.stderr.write('  ' + (i + 1) + '/' + urls.length + '\n');
  }

  const rows = [...seen.entries()]
    .filter(([s]) => !have.has(s))
    .sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]));

  /* WHICH CHUNK a string came from is the column that makes this list usable.
     Nine thousand candidates ranked by frequency is a pile; the same list
     grepped for the chunk behind the screen you are about to work on is a
     harvest queue. */
  const lines = ['chunks\tfirst seen in\tstring']
    .concat(rows.map(([s, r]) => r.n + '\t' + r.where + '\t' + s));
  fs.writeFileSync(OUT, lines.join('\n') + '\n');

  console.log('chunks read   ' + (urls.length - failed) + '/' + urls.length +
              (failed ? ' (' + failed + ' failed)' : ''));
  console.log('bytes         ' + (bytes / 1e6).toFixed(1) + ' MB');
  console.log('candidates    ' + seen.size + ' distinct, ' + rows.length + ' not already in the pack');
  console.log('written       ' + path.relative(ROOT, OUT));
}

main().catch((e) => { console.error(e); process.exit(1); });
