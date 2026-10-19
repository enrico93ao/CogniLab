import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const rules=JSON.parse(read('firebase/cognilab.rules.json')).rules;
const owner='eWoQhl1qwqVKRupDabTM6vfMyyI3';
const expr=rules.cognilab.testers.$uid['.write'];
function allowed(uid,professional){return new Function('auth','root','return '+expr)({uid},{child:()=>({child:()=>({val:()=>professional})})});}
assert.equal(allowed(owner,true),true);
assert.equal(allowed(owner,false),false);
assert.equal(allowed('tester',true),false);
assert.equal(allowed('tester',false),false);
assert.equal(rules.cognilab.professionals.$uid['.write'],false);
assert.equal(rules.cognilab.testers.$uid['.validate'],'newData.isBoolean()');
const source=read('shared/tester-admin.js').replace(/^import .*;\s*$/gm,'');
async function scenario({probeDenied=false,writeDenied=false,emailDenied=false}={}){
 const calls=[];
 const form={elements:{email:{value:'tester@example.com'},password:{value:'test-password'}}};
 const elements={status:{},management:{querySelectorAll:()=>[]},permission:{},'create-tester':form,'enable-tester':{},revoke:{}};
 const input={value:''};
 const document={getElementById:id=>elements[id],querySelector:()=>input};
 const mainAuth={currentUser:{uid:owner}};
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 await new AsyncFunction('document','auth','db','firebaseConfig','friendlyError','requireProfessional','initializeApp','deleteApp','initializeAuth','inMemoryPersistence','createUserWithEmailAndPassword','deleteUser','sendEmailVerification','signOut','ref','get','set','crypto','invitePatient','registerManagedPatient','setPatientNotificationEmail',source)(document,mainAuth,{}, {},()=> 'Error',async()=>mainAuth.currentUser,()=>{calls.push('secondary-app');return {};},async()=>calls.push('cleanup-app'),(_app,options)=>{assert.equal(options.persistence,'memory');return 'secondary-auth';},'memory',async secondary=>{assert.equal(secondary,'secondary-auth');calls.push('create');return {user:{uid:'new-tester'}};},async()=>calls.push('rollback'),async(user,options)=>{assert.equal(user.uid,'new-tester');assert.equal(options.url,'https://enrico93ao.github.io/CogniLab/esercizi.html');calls.push('verification');if(emailDenied)throw {code:'auth/too-many-requests'};},async secondary=>{assert.equal(secondary,'secondary-auth');calls.push('secondary-signout');},(_db,path)=>path,async()=>{if(probeDenied)throw {code:'PERMISSION_DENIED'};},async(path,value)=>{calls.push('authorize');assert.equal(path,'cognilab/testers/new-tester');assert.equal(value,true);if(writeDenied)throw {code:'PERMISSION_DENIED'};},{randomUUID:()=> 'unique'},async(uid,name)=>{assert.equal(uid,'new-tester');assert.equal(name,'tester@example.com');calls.push('invite');},async uid=>{assert.equal(uid,'new-tester');calls.push('auto-link');},async(uid,email)=>{assert.equal(uid,'new-tester');assert.equal(email,'tester@example.com');calls.push('contact');});
 await form.onsubmit({preventDefault(){},currentTarget:form});
 assert.equal(mainAuth.currentUser.uid,owner);
 assert.equal(form.elements.password.value,'');
 return calls;
}
assert.deepEqual(await scenario(),['secondary-app','create','authorize','invite','auto-link','contact','verification','secondary-signout','cleanup-app']);
assert.deepEqual(await scenario({emailDenied:true}),['secondary-app','create','authorize','invite','auto-link','contact','verification','secondary-signout','cleanup-app']);
assert.deepEqual(await scenario({probeDenied:true}),[]);
assert.deepEqual(await scenario({writeDenied:true}),['secondary-app','create','authorize','rollback','secondary-signout','cleanup-app']);
console.log('PASS: only approved owner manages testers; separate memory-only login; main session preserved; denied rules prevent creation; failed authorization rolls back new account.');
