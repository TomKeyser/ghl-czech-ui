/* =============================================================================
   deploy-dist.js — publish ONLY the built files to the public repository.

   The split Tom asked for on 12 Sep: source private, distribution public.

   THE POINT THIS SCRIPT EXISTS TO PROTECT.
   Making the source repository private is undone by carelessness in three
   quiet ways, and all three have to be closed or the split is theatre:

     1. COMMIT MESSAGES. This project's messages are essays. They describe the
        firewall's internals, which leaks were found on which account, and the
        reasoning behind every zone. Published alongside the built files they
        would give away more than the source ever would. So the public commit
        message is a version string and nothing else — no body, no attribution
        trailer, no session link.

     2. STRAY FILES. One `cp -r` and COVERAGE.md, FIREWALL.md or harvest/ is
        public. The target is therefore an ALLOWLIST: exactly the built
        modules, nothing else, and the script refuses a target holding
        anything it does not recognise.

     3. WHAT IS INSIDE THE BUILT FILES ANYWAY. Private source does not hide a
        sub-account id compiled into ONLY_LOCATIONS. The script prints every
        identifying string it is about to publish, every time, so that is a
        decision rather than a discovery.

   Usage:
     node deploy-dist.js --target ../ghl-czech-ui-dist            (dry run)
     node deploy-dist.js --target ../ghl-czech-ui-dist --push     (commit+push)
============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ALLOWED = [
  'ghlczechui.js', 'i18n-rules.js', 'collector.js', 'gap-picker.js',
  path.join('lang', 'cs-CZ.js'), path.join('lang', 'source-en.js'),
  /* Pages needs these two to behave; both are content-free. */
  '.nojekyll', 'README.md'
];

const args = process.argv.slice(2);
const targetIdx = args.indexOf('--target');
const TARGET = targetIdx !== -1 ? args[targetIdx + 1] : null;
const DO_PUSH = args.includes('--push');

if (!TARGET) {
  console.log('usage: node deploy-dist.js --target <dir> [--push]');
  process.exit(1);
}

function sh(cmd, cmdArgs, cwd) {
  return execFileSync(cmd, cmdArgs, { cwd: cwd || process.cwd(), encoding: 'utf8' }).trim();
}

/* ---- 1. build and verify, or stop ---------------------------------------- */
console.log('building…\n');
try {
  console.log(sh('node', ['build.js']));
} catch (e) {
  console.log('\nBUILD FAILED — nothing deployed.');
  process.exit(1);
}

/* ---- 2. the target must be the repository we think it is ----------------- */
if (!fs.existsSync(path.join(TARGET, '.git'))) {
  console.log('\nTarget is not a git repository: ' + TARGET);
  console.log('Clone the public distribution repo there first.');
  process.exit(1);
}
let origin = '';
try { origin = sh('git', ['remote', 'get-url', 'origin'], TARGET); }
catch (e) { console.log('\nTarget has no origin remote.'); process.exit(1); }

let isPrivate = null;
try {
  const name = origin.replace(/^.*github\.com[/:]/, '').replace(/\.git$/, '');
  isPrivate = sh('gh', ['api', 'repos/' + name, '--jq', '.private']) === 'true';
} catch (e) { /* offline: fall through, reported below */ }

console.log('\ntarget   : ' + path.resolve(TARGET));
console.log('origin   : ' + origin);
console.log('private  : ' + (isPrivate === null ? 'unknown' : isPrivate));

if (isPrivate === true) {
  console.log('\nThat repository is PRIVATE. This script publishes the public');
  console.log('distribution; pushing the build somewhere nobody can fetch it');
  console.log('would silently take the layer off the air. Refusing.');
  process.exit(1);
}

/* ---- 3. copy the allowlist, and only the allowlist ----------------------- */
fs.mkdirSync(path.join(TARGET, 'lang'), { recursive: true });
const copied = [];
for (const rel of ALLOWED) {
  const from = path.join('dist', rel);
  if (!fs.existsSync(from)) continue;          /* .nojekyll/README live in target */
  fs.copyFileSync(from, path.join(TARGET, rel));
  copied.push(rel);
}
if (!fs.existsSync(path.join(TARGET, '.nojekyll'))) {
  fs.writeFileSync(path.join(TARGET, '.nojekyll'), '');
}

/* ---- 4. refuse a target holding anything unrecognised -------------------- */
function walk(dir, base) {
  let out = [];
  for (const e of fs.readdirSync(path.join(dir, base || ''), { withFileTypes: true })) {
    const rel = path.join(base || '', e.name);
    if (e.name === '.git') continue;
    if (e.isDirectory()) out = out.concat(walk(dir, rel));
    else out.push(rel);
  }
  return out;
}
const present = walk(TARGET, '');
const strays = present.filter(f => !ALLOWED.includes(f));
if (strays.length) {
  console.log('\nREFUSING — the public target holds files that are not part of the');
  console.log('distribution. Remove them before deploying:\n');
  strays.forEach(f => console.log('   ' + f));
  process.exit(1);
}

/* ---- 5. say out loud what is about to become public ---------------------- */
const IDENTIFYING = [
  { label: 'sub-account ids', re: /'[A-Za-z0-9]{20}'/g },
  { label: 'github.io URLs',  re: /[a-z0-9-]+\.github\.io[^\s'"]*/gi },
  { label: 'other hostnames', re: /https?:\/\/[a-z0-9.-]+/gi }
];
const found = new Map();
for (const rel of copied) {
  const txt = fs.readFileSync(path.join(TARGET, rel), 'utf8');
  for (const id of IDENTIFYING) {
    const hits = txt.match(id.re) || [];
    for (const h of hits) {
      const k = id.label + ' :: ' + h;
      found.set(k, (found.get(k) || 0) + 1);
    }
  }
}
console.log('\nidentifying strings inside the files being published:');
if (!found.size) console.log('   (none)');
else [...found.entries()].sort().slice(0, 24)
  .forEach(([k, n]) => console.log('   ' + k + '  ×' + n));
console.log('\n   Private source does not hide any of the above — it is compiled in.');

/* ---- 6. version, from the built engine ----------------------------------- */
const eng = fs.readFileSync(path.join(TARGET, 'ghlczechui.js'), 'utf8');
const v = (eng.match(/var VERSION\s*=\s*'(v\d+)'/) || [])[1];
const dv = (eng.match(/var DATA_VERSION\s*=\s*'(v\d+)'/) || [])[1];
if (!v || !dv) { console.log('\nCould not read VERSION/DATA_VERSION from the build.'); process.exit(1); }
const message = v + '/' + dv;          /* the entire public commit message */

let status = '';
try { status = sh('git', ['status', '--porcelain'], TARGET); } catch (e) {}
console.log('\nfiles     : ' + copied.length + ' copied');
console.log('changes   : ' + (status ? status.split('\n').length + ' file(s)' : 'none'));
console.log('message   : "' + message + '"   (no body, no trailer, no session link)');

if (!DO_PUSH) {
  console.log('\nDRY RUN — nothing committed. Re-run with --push to publish.');
  process.exit(0);
}
if (!status) { console.log('\nNothing to publish.'); process.exit(0); }

sh('git', ['add', '-A'], TARGET);
sh('git', ['-c', 'commit.gpgsign=false', 'commit', '-m', message], TARGET);
sh('git', ['push', 'origin', 'HEAD'], TARGET);
console.log('\nPublished ' + message + ' to ' + origin);
