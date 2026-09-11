// Pre-deploy checks for a language pack. Run before every commit that touches
// lang/ or i18n-rules.js:   node check-pack.js [locale]     (default cs-CZ)
//
// Each check exists because its failure shipped once, silently:
//   1. duplicate keys  — in an object literal a repeated key replaces the
//      earlier one without a word.
//   2. NEVER shadowing — the never-translate list is consulted BEFORE the
//      dictionary and ignores case, so adding a brand that is also a word
//      quietly kills a translation ("true" -> "ano" was lost this way, v86).
//   3. templates without rules — a typo'd pattern id is dead text. Rules
//      without templates are listed as warnings (a pack catching up).
// Exit code 1 on any finding, so it can gate a commit.
const fs = require('fs');
const path = require('path');

const locale = process.argv[2] || 'cs-CZ';
const packPath = path.join(__dirname, 'lang', locale + '.js');
const R = require('./i18n-rules.js');
const S = require('./lang/source-en.js');
const P = require(packPath);
let problems = 0;

// 1. duplicate keys (4-space-indented "key": lines, i.e. the dictionary blocks)
const seen = new Map();
fs.readFileSync(packPath, 'utf8').split('\n').forEach((line, i) => {
  const m = line.match(/^\s{4}("(?:[^"\\]|\\.)+")\s*:/);
  if (!m) return;
  if (!seen.has(m[1])) seen.set(m[1], []);
  seen.get(m[1]).push(i + 1);
});
const dups = [...seen].filter(([, v]) => v.length > 1);
console.log('keys: ' + seen.size + '   duplicated: ' + dups.length);
dups.forEach(([k, v]) => { problems++; console.log('  DUP ' + k + '  lines ' + v.join(', ')); });

// 2. dictionary entries the NEVER list would shadow. A pure case correction
//    ("Wordpress" -> "WordPress") is fine: NEVER deliberately leaves spelling alone.
const all = Object.assign({}, P.dictApi || {}, P.dict || {});
const shadow = Object.keys(all).filter(k =>
  R.neverTranslate(k) !== null && all[k] !== k && all[k].toLowerCase() !== k.toLowerCase());
console.log('shadowed by NEVER: ' + shadow.length);
shadow.forEach(k => { problems++; console.log('  SHADOW ' + JSON.stringify(k) + ' -> ' + JSON.stringify(all[k])); });

// 3. rule ids vs templates. A rule with a '@formatter' needs no template.
const ruleIds = new Set(S.rules.map(r => r[0]));
const needTpl = S.rules.filter(r => !(r[2] && String(r[2]).charAt(0) === '@')).map(r => r[0]);
const tpls = Object.keys(P.patterns || {});
const noTpl = needTpl.filter(id => !(id in (P.patterns || {})) &&
  !(P.ruleOverrides && P.ruleOverrides[id] === null));
const noRule = tpls.filter(id => !ruleIds.has(id));
console.log('rules without a template: ' + noTpl.length + '   templates without a rule: ' + noRule.length);
/* a missing template is a WARNING: the rule matches, produces nothing, and the
   string is reported as a gap — correct behaviour for a pack still catching
   up (es.js). A template with no rule is an ERROR: it is a typo'd id. */
noTpl.forEach(id => console.log('  warn: no template ' + id));
noRule.forEach(id => { problems++; console.log('  NO RULE ' + id); });

console.log(problems ? '\n' + problems + ' problem(s)' : '\nok');
process.exit(problems ? 1 : 0);
