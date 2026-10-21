import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {programProgress,sessionProgress,validateProgram,validUid} from '../shared/care-model.mjs';import {exerciseById} from '../shared/exercise-catalog.mjs';import {normalizeMetrics} from '../shared/progress-model.mjs';import {withAccessTimeout} from '../shared/access-timeout.js';import {isPermissionDenied} from '../shared/firebase-errors.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const localStorage=storage(),sessionStorage=storage(),auth={currentUser:{uid:'pro',displayName:'Professionista',isAnonymous:false}},db={};let counter=0;
function at(path){return path.split('/').filter(Boolean).reduce((v,key)=>v?.[key],db)??null;}
function put(path,value){const parts=path.split('/').filter(Boolean);let o=db;for(const key of parts.slice(0,-1))o=o[key]??={};if(value===null)delete o[parts.at(-1)];else o[parts.at(-1)]=structuredClone(value);}
const context=vm.createContext({auth,authReady:Promise.resolve(),db,sessionStorage,localStorage,programProgress,sessionProgress,validateProgram,validUid,exerciseById,normalizeMetrics,withAccessTimeout,isPermissionDenied,Date,crypto:{randomUUID:()=> 'id-12345678-'+(++counter)},ref:(_,path='')=>path,get:async path=>{if(path.includes('__privacy_probe__'))throw {code:'PERMISSION_DENIED'};return {val:()=>at(path)};},set:async(path,value)=>put(path,value),update:async(path,values)=>{for(const [key,value] of Object.entries(values))put([path,key].filter(Boolean).join('/'),value);},requireGymAccess:async()=>auth.currentUser,requireProfessional:async()=>{if(auth.currentUser.uid!=='pro')throw Error('not professional');return auth.currentUser;},recordSessionResult(){}});
for(const file of ['shared/care-store.js','shared/progress-store.js'])vm.runInContext(read(file).replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''),context);

put('cognilab/careLinks/patient/pro',true);
const old={professionalId:'pro',professionalName:'Pro',status:'active',name:'Originale',totalSessions:1,exercises:['stroop-original'],createdAt:1,version:1};put('cognilab/carePrograms/patient/old',old);put('cognilab/careSessions/patient/old/s1',{startedAt:'2026-10-21',results:{r:{score:8}}});
const history=JSON.stringify(at('cognilab/careSessions/patient/old'));let patches=[];
context.update=async(path,values)=>{patches.push(structuredClone(values));for(const [key,value] of Object.entries(values))put([path,key].filter(Boolean).join('/'),value);};
const draft={name:'Aggiornato',totalSessions:2,exercises:['stroop-original']};const id=await context.assignProgram('patient',draft,'old');
assert.equal(patches[0]['cognilab/carePrograms/patient/old/status'],'archived');assert.equal(patches[0]['cognilab/carePrograms/patient/'+id].name,'Aggiornato');assert.equal(JSON.stringify(at('cognilab/careSessions/patient/old')),history);assert.equal(at('cognilab/careSessions/patient/'+id),null);
await assert.rejects(()=>context.assignProgram('patient',draft,'old'),/cambiato/);
put('cognilab/carePrograms/patient/foreign',{...old,professionalId:'other'});await assert.rejects(()=>context.assignProgram('patient',draft,'foreign'),/cambiato/);
put('cognilab/carePrograms/patient/failure',old);context.update=async()=>{throw Error('offline');};await assert.rejects(()=>context.assignProgram('patient',draft,'failure'),/offline/);assert.equal(at('cognilab/carePrograms/patient/failure/status'),'active');
console.log('PASS: replacement uses one atomic update, preserves old results, rejects foreign/archived source, and leaves source active on write failure. In-memory Firebase adapter.');
