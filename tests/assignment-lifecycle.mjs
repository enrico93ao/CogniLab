import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {validateProgram,validUid,programProgress} from '../shared/care-model.mjs';
import {exerciseById} from '../shared/exercise-catalog.mjs';
import {withAccessTimeout} from '../shared/access-timeout.js';
const database={},auth={currentUser:{uid:'pro',displayName:'Professionista'}};let response;
function read(path){return path.split('/').reduce((v,k)=>v?.[k],database)??null;}
function write(path,value){let target=database;const parts=path.split('/');for(const part of parts.slice(0,-1))target=target[part]??={};target[parts.at(-1)]=structuredClone(value);}
write('cognilab/careLinks/patient/pro',true);write('cognilab/users/pro/clinical/registeredPatients/patient',{name:'Paziente',notificationEmail:'patient@example.test'});
let id=0;const context=vm.createContext({auth,db:{},authReady:Promise.resolve(),validateProgram,validUid,programProgress,exerciseById,withAccessTimeout,Date,crypto:{randomUUID:()=> 'program-12345678-'+(++id)},requireProfessional:async()=>auth.currentUser,ref:(_db,path='')=>path,get:async path=>({val:()=>read(path)}),set:async(path,value)=>write(path,value),update:async(_path,values)=>{for(const [key,value]of Object.entries(values))write(key,value);}});
for(const file of ['shared/assignment-notifications.js','shared/care-store.js'])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''),context);
context.notifyAssignment=()=>new Promise((resolve,reject)=>{response={resolve,reject};});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const first=await Promise.race([context.assignProgram('patient',{name:'Percorso',totalSessions:2,exercises:['stroop-original']}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Assignment blocked by email')),500))]);
await flush();assert.ok(read('cognilab/carePrograms/patient/'+first));const key='cognilab/users/pro/clinical/registeredPatients/patient/notifications/';assert.equal(read(key+first).state,'pending');response.resolve({state:'sent',message:'Invio confermato'});await flush();assert.equal(read(key+first).state,'sent');
const second=await context.assignProgram('patient',{name:'Secondo percorso',totalSessions:1,exercises:['stroop-original']});await flush();response.reject(Object.assign(Error('daily-quota'),{code:'daily-quota'}));await flush();assert.equal(read(key+second).state,'failed');assert.match(read(key+second).message,/Quota giornaliera/);assert.equal(read('cognilab/carePrograms/patient/'+second).status,'active');
const third=await context.assignProgram('patient',{name:'Cambio account',totalSessions:1,exercises:['stroop-original']});await flush();auth.currentUser={uid:'another-pro'};response.resolve({state:'sent',message:'Invio confermato'});await flush();assert.equal(read(key+third).state,'pending');assert.equal(read('cognilab/users/another-pro'),null);
console.log('PASS: assignment resolves while email is pending; status updates on confirmation or quota failure; saved program survives failure; changed account cannot receive another professional’s status. No emails sent.');
