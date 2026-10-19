import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const owner='eWoQhl1qwqVKRupDabTM6vfMyyI3',data={cognilab:{testers:{oldPatient:true,disabledPatient:false,externalPatient:true,[owner]:true}}},writes=[];data.cognilab.users={[owner]:{clinical:{registeredPatients:{oldPatient:{name:'Created by manager',managedAccount:true}}}}};
const at=path=>path.split('/').reduce((value,key)=>value?.[key],data)??null;
const put=(path,value)=>{const parts=path.split('/');let node=data;for(const key of parts.slice(0,-1))node=node[key]??={};node[parts.at(-1)]=value;};
const context=vm.createContext({auth:{currentUser:{uid:owner}},requireProfessional:async()=>({uid:owner,email:'professional@example.test'}),withAccessTimeout:p=>p,ref:(_,p)=>p,db:{},get:async p=>({val:()=>structuredClone(at(p))}),update:async(_,values)=>{writes.push(values);for(const [path,value] of Object.entries(values))put(path,value);},Date,validUid:()=>true});
vm.runInContext(fs.readFileSync(new URL('../shared/care-store.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''),context);
const roster=await context.professionalPatients();assert.ok(roster.oldPatient);assert.ok(!roster.disabledPatient);assert.ok(!roster[owner]);assert.equal(writes.length,2);assert.equal(at('cognilab/careLinks/externalPatient/'+owner),null);assert.equal(at('cognilab/careLinks/oldPatient/'+owner),true);assert.equal(roster.oldPatient.autoLinkInitialized,true);
// An existing patient must not be automatically reconnected after later revocation.
put('cognilab/careLinks/oldPatient/'+owner,null);await context.professionalPatients();assert.equal(writes.length,2);assert.equal(at('cognilab/careLinks/oldPatient/'+owner),null);
await assert.rejects(()=>context.connectManagedPatient('missing'),/non presente/);
console.log('PASS: enabled patients imported and automatically linked once; disabled/self excluded; later revocation respected; absent account rejected.');
