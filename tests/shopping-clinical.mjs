import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createShoppingRound,scoreShopping,LEVELS} from '../shared/shopping-model.mjs';
import {normalizeMetrics} from '../shared/progress-model.mjs';
const source=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
for(const [level,config] of Object.entries(LEVELS)){
 for(let i=0;i<100;i++){
  const round=createShoppingRound(level);
  assert.equal(round.targets.length,config.count);
  assert.equal(new Set(round.options).size,config.count*2);
  assert.ok(round.targets.every(product=>round.options.includes(product)));
  assert.equal(normalizeMetrics(scoreShopping(round.targets,round.targets)).accuracyPct,100);
  const other=round.options.filter(product=>!round.targets.includes(product));
  assert.deepEqual(scoreShopping(round.targets,other),{correct:0,total:config.count,errors:config.count,omissions:config.count});
 }
}
assert.deepEqual(scoreShopping(['Pane','Latte'],['Pane','Pane','Riso']),{correct:1,total:2,errors:1,omissions:1});
assert.throws(()=>createShoppingRound('missing'));
const code=source('shared/access-timeout.js').replace(/\bexport /g,'')+'\n'+source('shared/clinical-access.js').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
const auth={currentUser:null};let approved=false,reads=0;
const check=new Function('auth','authReady','db','ref','get',code+';return requireProfessional;')(auth,Promise.resolve(),{},(_db,path)=>path,async()=>{reads++;return {val:()=>approved};});
await assert.rejects(check,error=>error.code==='clinical-login-required');
auth.currentUser={uid:'guest',isAnonymous:true};await assert.rejects(check);assert.equal(reads,0);
auth.currentUser={uid:'professional',isAnonymous:false};await assert.rejects(check,error=>error.code==='clinical-not-authorized');
approved=true;assert.equal((await check()).uid,'professional');
approved=false;await assert.rejects(check,error=>error.code==='clinical-not-authorized');
const rules=JSON.parse(source('firebase/cognilab.rules.json')).rules;
assert.equal(rules.cognilab.professionals.$uid['.write'],false);
assert.equal(rules.cognilab.users.$uid['.read'],undefined);
assert.equal(rules.cognilab.users.$uid['.write'],undefined);
assert.match(rules.cognilab.users.$uid.clinical['.read'],/auth.uid === \$uid/);
assert.match(rules.cognilab.users.$uid.clinical['.write'],/professionals/);
assert.match(rules.cognilab.users.$uid.sessions.$session['.validate'],/!newData.child\('patientId'\).exists/);
console.log('PASS: unique lists, all levels, omissions and false choices; anonymous/normal/approved/revoked roles; owner-only clinical rules and non-writable privileges.');
