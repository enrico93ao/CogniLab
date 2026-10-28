// Evaluate the actual rule expressions against fixtures. This is not the Firebase emulator.
import assert from 'node:assert/strict';import fs from 'node:fs';
const rules=JSON.parse(fs.readFileSync(new URL('../firebase/cognilab.rules.json',import.meta.url),'utf8')).rules;
const db={cognilab:{professionals:{pro:true,otherPro:true},testers:{patient:true,stranger:true},careInvites:{patient:{pro:{professionalName:'Dottore',createdAt:1}}},careLinks:{patient:{pro:true}},carePrograms:{patient:{plan:{professionalId:'pro',professionalName:'Dottore',name:'Prova',totalSessions:2,exercises:['stroop-original','attenzione-alternata'],createdAt:1,status:'active',version:1}}}}};
const value=(tree,path)=>path.reduce((node,key)=>node?.[key],tree)??null;
class Snapshot{constructor(tree,path=[]){this.tree=tree;this.path=path;}val(){return value(this.tree,this.path);}child(path){if(typeof path!=='string')throw Error('child requires string');return new Snapshot(this.tree,[...this.path,...path.split('/')]);}parent(){return new Snapshot(this.tree,this.path.slice(0,-1));}exists(){return this.val()!==null;}isString(){return typeof this.val()==='string';}isNumber(){return typeof this.val()==='number';}isBoolean(){return typeof this.val()==='boolean';}hasChild(path){return this.child(path).exists();}hasChildren(keys){return keys?keys.every(k=>this.hasChild(k)):this.val()!==null&&typeof this.val()==='object'&&Object.keys(this.val()).length>0;}}
const user=(uid,anonymous=false)=>({uid,token:{firebase:{sign_in_provider:anonymous?'anonymous':'password'}}});
function evaluate(expression,bindings,auth,path,next=db){if(typeof expression==='boolean')return expression;const code=expression.replace(/(\$\w+)\.matches\((\/.*?\/)(\))/g,'matches($1,$2)');try{return Boolean(new Function('auth','root','data','newData','now','matches',...Object.keys(bindings),'return ('+code+');')(auth,new Snapshot(db),new Snapshot(db,path),new Snapshot(next,path),Date.now(),(v,re)=>re.test(v),...Object.values(bindings)));}catch(error){throw new Error('Rule failed to evaluate: '+expression+'\n'+error.message);}}
function chain(path){const out=[{rule:rules,bindings:{},path:[]}];let rule=rules,bindings={};for(let i=0;i<path.length;i++){const key=path[i],wild=Object.keys(rule).find(k=>k.startsWith('$'));if(!rule[key]&&!wild)break;const match=rule[key]?key:wild;rule=rule[match];bindings={...bindings,...(match.startsWith('$')?{[match]:key}:{})};out.push({rule,bindings,path:path.slice(0,i+1)});}return out;}
function read(path,auth){return chain(path.split('/')).some(n=>n.rule['.read']!==undefined&&evaluate(n.rule['.read'],n.bindings,auth,n.path));}
function write(path,content,auth){const parts=path.split('/'),next=structuredClone(db);let cursor=next;for(const key of parts.slice(0,-1))cursor=cursor[key]??={};if(content===null)delete cursor[parts.at(-1)];else cursor[parts.at(-1)]=content;
 const nodes=chain(parts);if(!nodes.some(n=>n.rule['.write']!==undefined&&evaluate(n.rule['.write'],n.bindings,auth,n.path,next)))return false;
 function validate(n){const snapshot=new Snapshot(next,n.path);if(!snapshot.exists())return true;if(n.rule['.validate']!==undefined&&!evaluate(n.rule['.validate'],n.bindings,auth,n.path,next))return false;
  const v=snapshot.val();if(v&&typeof v==='object')for(const key of Object.keys(v)){const wild=Object.keys(n.rule).find(k=>k.startsWith('$')),match=n.rule[key]?key:wild;if(match&&!validate({rule:n.rule[match],bindings:{...n.bindings,...(match.startsWith('$')?{[match]:key}:{})},path:[...n.path,key]}))return false;}return true;
 }
 return nodes.every(n=>validate(n));
}
assert.equal(read('cognilab/carePrograms/patient',user('patient')),true);
assert.equal(read('cognilab/carePrograms/patient',user('pro')),false,'professional cannot enumerate patient programs');
assert.equal(read('cognilab/carePrograms/patient/plan',user('pro')),true);
assert.equal(read('cognilab/carePrograms/patient/plan',user('otherPro')),false);
assert.equal(read('cognilab/careSessions/patient/plan',user('stranger')),false);
assert.equal(read('cognilab/users/patient/sessions',user('pro')),false,'unassigned personal history stays private');
assert.equal(read('cognilab/carePrograms/patient',user('patient',true)),false);
assert.equal(write('cognilab/careLinks/patient/pro',null,user('patient')),true);
assert.equal(write('cognilab/careLinks/patient/otherPro',true,user('patient')),false,'accepting requires an invitation');
assert.equal(write('cognilab/careLinks/patient/pro',true,user('pro')),false,'professional cannot approve own link');
const plan=db.cognilab.carePrograms.patient.plan;
assert.equal(write('cognilab/carePrograms/patient/newPlan',plan,user('pro')),true);
assert.equal(write('cognilab/carePrograms/patient/newPlan',{...plan,exercises:['ascolta-indica']},user('pro')),true);
assert.equal(write('cognilab/carePrograms/patient/newPlan',{...plan,exercises:['ascolta-indica']},user('stranger')),false);
assert.equal(write('cognilab/carePrograms/patient/newPlan',{...plan,professionalId:'otherPro'},user('pro')),false);
assert.equal(write('cognilab/carePrograms/patient/newPlan',plan,user('patient')),false);
assert.equal(write('cognilab/carePrograms/patient/newPlan',{...plan,exercises:['../index.html']},user('pro')),false);
assert.equal(write('cognilab/carePrograms/patient/newPlan',{...plan,totalSessions:0},user('pro')),false);
assert.equal(write('cognilab/carePrograms/patient/newPlan',{...plan,exercises:{0:'stroop-original',3:'attenzione-alternata'}},user('pro')),false);
assert.equal(write('cognilab/carePrograms/patient/plan/name','Altered',user('pro')),false,'published exercise plan remains stable');
assert.equal(write('cognilab/carePrograms/patient/plan/status','archived',user('pro')),true);
const r={id:'result1',exerciseId:'stroop-original',programId:'plan',programOwnerId:'pro',programSlot:'0',status:'completed',finishedAt:'2026-10-15',sessionId:'s1'};
assert.equal(write('cognilab/careSessions/patient/plan/s1',{startedAt:'2026-10-15',results:{result1:r}},user('patient')),true);
assert.equal(write('cognilab/careSessions/patient/plan/s1',{startedAt:'2026-10-15',results:{result1:{...r,exerciseId:'il-pianoforte'}}},user('patient')),false,'wrong exercise cannot fill the slot');
assert.equal(write('cognilab/careSessions/patient/plan/s1',{startedAt:'2026-10-15'},user('pro')),false,'professional cannot write patient results');
assert.equal(write('cognilab/careSessions/patient/plan/s1',{startedAt:'2026-10-15',results:{result1:{...r,status:'interrupted',skipped:true}}},user('patient')),true,'explicit skip marker may be stored with interrupted result, no completion forged');
delete db.cognilab.careLinks.patient.pro;
assert.equal(read('cognilab/carePrograms/patient/plan',user('pro')),false);assert.equal(read('cognilab/careSessions/patient/plan',user('pro')),false);
assert.equal(write('cognilab/careSessions/patient/plan/s1',{startedAt:'2026-10-15'},user('patient')),false);
const manager='eWoQhl1qwqVKRupDabTM6vfMyyI3';
db.cognilab.professionals[manager]=true;db.cognilab.users={[manager]:{clinical:{registeredPatients:{patient:{name:'Test',managedAccount:true}}}}};
assert.equal(write('cognilab/careLinks/patient/'+manager,true,user(manager)),true,'manager can initialize a registered enabled patient link');
assert.equal(write('cognilab/careLinks/patient/'+manager,true,user(manager,true)),false,'anonymous manager denied');
assert.equal(write('cognilab/careLinks/patient/'+manager,true,user('otherPro')),false,'other professional denied');
assert.equal(write('cognilab/careLinks/patient/'+manager,null,user(manager)),false,'manager cannot revoke through initialization path');
db.cognilab.users[manager].clinical.registeredPatients.patient.managedAccount=false;assert.equal(write('cognilab/careLinks/patient/'+manager,true,user(manager)),false,'unmarked external account denied');db.cognilab.users[manager].clinical.registeredPatients.patient.managedAccount=true;
db.cognilab.users[manager].clinical.registeredPatients.patient.autoLinkInitialized=true;
assert.equal(write('cognilab/careLinks/patient/'+manager,true,user(manager)),false,'automatic linking cannot override later patient revocation');
db.cognilab.users[manager].clinical.registeredPatients.patient.autoLinkInitialized=false;db.cognilab.testers.patient=false;
assert.equal(write('cognilab/careLinks/patient/'+manager,true,user(manager)),false,'disabled patient denied');
// Only the authenticated email can be synchronized; only linked professionals see it.
db.cognilab.testers.patient=true;db.cognilab.careLinks.patient.pro=true;
const patientWithEmail=user('patient');patientWithEmail.token.email='patient@example.test';
assert.equal(write('cognilab/users/patient/profile/email','patient@example.test',patientWithEmail),true);
assert.equal(write('cognilab/users/patient/profile/email','someone-else@example.test',patientWithEmail),false);
assert.equal(read('cognilab/users/patient/profile/email',user('pro')),true);
assert.equal(read('cognilab/users/patient/profile',user('pro')),false);
assert.equal(read('cognilab/users/patient/profile/email',user('otherPro')),false);
assert.equal(read('cognilab/users/patient/profile/email',user('stranger')),false);
assert.equal(read('cognilab/users/patient/profile/email',user('pro',true)),false);
delete db.cognilab.careLinks.patient.pro;
assert.equal(read('cognilab/users/patient/profile/email',user('pro')),false);
console.log('PASS: actual rule expressions deny strangers, anonymous users, unconsented links, personal history reads, plan tampering and incorrect exercise slots; revocation stops shared access. Fixture evaluator, not live Firebase/emulator.');
