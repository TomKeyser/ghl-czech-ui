/* Does the verifier actually fail on damage? A green check that has never
   gone red is not evidence. Four injuries, each the shape of a real bug. */
const fs=require('fs'), path=require('path'), os=require('os');
const b=fs.readFileSync('build.js','utf8');
const m=b.match(/function scan\([\s\S]*?\n}\n/);
const helpers=b.match(/const PUNCT[\s\S]*?function regexAllowed[\s\S]*?\n}\n/);
const tk=b.match(/function tokensEqual[\s\S]*?\n}\n/);
const na=b.match(/function nonAsciiProfile[\s\S]*?\n}\n/);
const pe=b.match(/function profilesEqual[\s\S]*?\n}\n/);
const src=[helpers[0],m[0],tk[0],na[0],pe[0]].join('\n');
const mod={};
new Function('module','exports','require',src+'\nmodule.exports={scan,tokensEqual,nonAsciiProfile,profilesEqual};')(mod,{},require);
const {scan,tokensEqual,nonAsciiProfile,profilesEqual}=mod.exports;

const good=fs.readFileSync(path.join('dist','lang','cs-CZ.js'),'utf8');
const orig=fs.readFileSync(path.join('src','lang','cs-CZ.js'),'utf8');
const origTokens=scan(orig,'orig').tokens;

function verdict(label, mutated){
  let t;
  try{ t=scan(mutated,'x').tokens; }catch(e){ return label+': REJECTED (tokenizer: '+e.message.slice(0,40)+')'; }
  const a=tokensEqual(origTokens,t);
  if(!a.ok) return label+': REJECTED (tokens — '+a.why.slice(0,70)+')';
  const p=profilesEqual(nonAsciiProfile(origTokens),nonAsciiProfile(t));
  if(!p.ok) return label+': REJECTED (encoding — '+p.why.slice(0,60)+')';
  return label+': ACCEPTED';
}

console.log(verdict('1 mojibake (ě -> Ä>)', good.replace('ě','Ä>')));
console.log(verdict('2 one letter dropped', good.replace('Jméno','Jmno')));
console.log(verdict('3 a key deleted', good.replace('"Tags": "Štítky",','')));
console.log(verdict('4 digit changed in a number', good.replace('350 x 180','350 x 181')));
const control = verdict('5 untouched control (must be ACCEPTED)', good);
console.log(control);
if (!/ACCEPTED$/.test(control)) {
  console.log('BROKEN: the verifier rejects an undamaged build.');
  process.exit(1);
}
console.log('All four injuries rejected, clean build accepted.');
