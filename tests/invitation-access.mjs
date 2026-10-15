import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const source=read('shared/access-timeout.js').replace(/\bexport /g,'')+'\n'+read('shared/gym-access.js').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
function access(user,open=false,roles={}){
 const auth={currentUser:user};
 return new Function('auth','authReady','db','accessModeReady','ref','get',source+';return requireGymAccess;')(auth,Promise.resolve(),{},Promise.resolve(open),(_db,path)=>path,async path=>{if(roles[path]==='denied')throw Error('Permission denied');return {val:()=>roles[path]||null};});
}
await assert.rejects(access(null),error=>error.code==='invitation-login-required');
await assert.rejects(access({uid:'guest',isAnonymous:true}),error=>error.code==='invitation-login-required');
await assert.rejects(access({uid:'normal',isAnonymous:false}),error=>error.code==='invitation-required');
const tester={uid:'tester',isAnonymous:false};assert.equal((await access(tester,false,{'cognilab/testers/tester':true})()).uid,'tester');
const professional={uid:'professional',isAnonymous:false};assert.equal((await access(professional,false,{'cognilab/testers/professional':'denied','cognilab/professionals/professional':true})()).uid,'professional');
assert.equal((await access(tester,true)()).uid,'tester');
await assert.rejects(access(null,true));await assert.rejects(access({uid:'guest',isAnonymous:true},true));
const rules=JSON.parse(read('firebase/cognilab.rules.json')).rules;
assert.match(rules.cognilab.testers.$uid['.write'],/auth.uid === 'eWoQhl1qwqVKRupDabTM6vfMyyI3'/);
assert.match(rules.cognilab.testers.$uid['.write'],/professionals/);
assert.equal(rules.cognilab.access.publicRegistrationOpen['.write'],false);
assert.equal(rules.cognilab.access.publicRegistrationOpen['.read'],true);
for(const value of [rules.cognilab.users.$uid.sessions['.read'],rules.cognilab.users.$uid.sessions['.write'],rules.cognilab_v2.users.$uid['.read']])assert.match(value,/testers/);
assert.match(rules.cognilab.users.$uid.clinical['.write'],/professionals/);
assert.ok(!read('shared/firebase-client.js').includes('signInAnonymously'));
assert.match(read('index.html'),/https:\/\/www.neurocentervda.it\/valutazione-neuropsicologica\//);
console.log('PASS: guests and non-invited accounts denied; invited testers and professionals accepted; registration reopening still requires login; role self-assignment denied; CTA target correct.');
