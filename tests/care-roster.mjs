import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const owner='eWoQhl1qwqVKRupDabTM6vfMyyI3',data={},writes=[];
const context=vm.createContext({auth:{currentUser:{uid:owner}},requireProfessional:async()=>({uid:owner,email:'professional@example.test'}),withAccessTimeout:p=>p,ref:(_,p)=>p,db:{},get:async p=>({val:()=>p==='cognilab/testers'?{oldPatient:true,disabledPatient:false,[owner]:true}:data}),update:async(_,values)=>writes.push(values),Date,validUid:()=>true});
vm.runInContext(fs.readFileSync(new URL('../shared/care-store.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''),context);
const roster=await context.professionalPatients();assert.ok(roster.oldPatient);assert.ok(!roster.disabledPatient);assert.ok(!roster[owner]);assert.equal(writes.length,1);assert.ok(writes[0]['cognilab/careInvites/oldPatient/'+owner]);assert.ok(!Object.keys(writes[0]).some(k=>k.includes('careLinks')));
console.log('PASS: existing enabled test patients added to manager roster and invited; disabled/self excluded; patient consent never forged.');
