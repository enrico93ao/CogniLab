import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {recordSessionResult,sessionJournal} from '../shared/session-journal.js';
import {groupKey,comparableSeries,change} from '../shared/progress-model.mjs';
import {programProgress,sessionProgress,validateProgram,validUid} from '../shared/care-model.mjs';import {exerciseById} from '../shared/exercise-catalog.mjs';import {normalizeMetrics} from '../shared/progress-model.mjs';import {withAccessTimeout} from '../shared/access-timeout.js';import {isPermissionDenied} from '../shared/firebase-errors.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const localStorage=storage(),sessionStorage=storage(),auth={currentUser:{uid:'pro',displayName:'Professionista',isAnonymous:false}},db={};let counter=0,failNextWrite=false;globalThis.sessionStorage=sessionStorage;
function at(path){return path.split('/').filter(Boolean).reduce((v,key)=>v?.[key],db)??null;}
function put(path,value){const parts=path.split('/').filter(Boolean);let o=db;for(const key of parts.slice(0,-1))o=o[key]??={};if(value===null)delete o[parts.at(-1)];else o[parts.at(-1)]=structuredClone(value);}
const context=vm.createContext({auth,authReady:Promise.resolve(),db,sessionStorage,localStorage,programProgress,sessionProgress,validateProgram,validUid,exerciseById,normalizeMetrics,withAccessTimeout,isPermissionDenied,Date,crypto:{randomUUID:()=> 'id-12345678-'+(++counter)},ref:(_,path='')=>path,get:async path=>{if(path.includes('__privacy_probe__'))throw {code:'PERMISSION_DENIED'};return {val:()=>at(path)};},set:async(path,value)=>put(path,value),update:async(path,values)=>{if(failNextWrite){failNextWrite=false;throw Object.assign(new Error('Rete simulata non disponibile'),{code:'NETWORK_ERROR'});}for(const [key,value] of Object.entries(values))put([path,key].filter(Boolean).join('/'),value);},requireGymAccess:async()=>auth.currentUser,requireProfessional:async()=>{if(auth.currentUser.uid!=='pro')throw Error('not professional');return auth.currentUser;},recordSessionResult});
for(const file of ['shared/care-store.js','shared/progress-store.js'])vm.runInContext(read(file).replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''),context);

// All identities and results are fictitious. No network or live Firebase calls.
const patient='patient-test-four-sessions';
const exerciseIds=['stroop-original','attenzione-alternata','cerchi-rossi'];
const correctBySession=[[6,5,7],[7,6,7],[8,7,6],[9,8,5]];
await context.invitePatient(patient,'Paziente TEST — dati simulati');
auth.currentUser={uid:patient,isAnonymous:false};await context.setConnection('pro',true);
auth.currentUser={uid:'pro',displayName:'Professionista TEST',isAnonymous:false};
const programId=await context.assignProgram(patient,{name:'TEST — 4 sessioni, 3 esercizi',totalSessions:4,exercises:exerciseIds,configurations:exerciseIds.map(()=>JSON.stringify({format:1,controls:[],buttons:[]})),schedule:['2026-10-20','2026-10-22','2026-10-24','2026-10-26']});
auth.currentUser={uid:patient,isAnonymous:false};
const sessionIds=new Set(),rows=[];let retried=false;
for(let day=0;day<4;day++){
 let sessionId;
 for(let slot=0;slot<exerciseIds.length;slot++){
  // Drop tab navigation state: reconstruct the next exercise from persisted data.
  sessionStorage.removeItem('cognilab.plan.'+patient);sessionStorage.removeItem('cognilab.session.'+patient);
  await context.startAssignedProgram(programId);
  const session=JSON.parse(sessionStorage.getItem('cognilab.session.'+patient));
  assert.equal(Number(session.programSlot),slot,'Persisted next slot');assert.equal(session.programConfigurations.length,3);assert.equal(session.scheduledDate,['2026-10-20','2026-10-22','2026-10-24','2026-10-26'][day]);
  if(slot===0){sessionId=session.id;assert.ok(!sessionIds.has(sessionId));sessionIds.add(sessionId);}
  assert.equal(session.id,sessionId,'One identity for all exercises of a session');
  const exerciseId=exerciseIds[slot],date='2026-10-'+String(12+day*2).padStart(2,'0');
  const result={id:'test-result-'+(++counter),exerciseId,title:exerciseById.get(exerciseId).title,status:'completed',startedAt:date+'T09:0'+slot+':00Z',finishedAt:date+'T09:0'+slot+':50Z',durationMs:50000,exerciseVersion:'test-1',settings:{level:'base',testSimulation:true},metrics:{correct:correctBySession[day][slot],total:10,errors:10-correctBySession[day][slot]}};
  if(day===1&&slot===1){
   failNextWrite=true;await assert.rejects(()=>context.saveResult(result),/Rete simulata/);
   assert.equal(Object.keys(context.pending(patient)).length,1);
   assert.equal(sessionJournal(patient).sessions[sessionId].results[result.id].syncState,'pending');
   await context.retryPending();assert.equal(Object.keys(context.pending(patient)).length,0);retried=true;
  }else await context.saveResult(result);
  // Same result replay must replace the record, never add a completed exercise.
  await context.saveResult(result);
  const privateResults=at('cognilab/users/'+patient+'/sessions/'+sessionId+'/results');
  assert.equal(Object.keys(privateResults).length,slot+1);
  assert.equal(sessionJournal(patient).sessions[sessionId].results[result.id].syncState,'saved');
  rows.push({session:day+1,exercise:result.title,accuracyPct:result.metrics.correct*10});
 }
 const workspace=await context.patientWorkspace();
 assert.equal(programProgress(workspace.programs[0],workspace.programs[0].sessions).completed,day+1);
}
assert.ok(retried);assert.equal(sessionIds.size,4);
await assert.rejects(()=>context.startAssignedProgram(programId),/tutte le sessioni/);
auth.currentUser={uid:'pro',isAnonymous:false};
const roster=await context.professionalPatients(),details=await context.professionalPatient(patient,roster[patient]);
const progress=programProgress(details.programs[0],details.programs[0].sessions);assert.equal(progress.completed,4);
const sessions=at('cognilab/users/'+patient+'/sessions');
const allResults=Object.values(sessions).flatMap(s=>Object.values(s.results));assert.equal(allResults.length,12);
const shared=at('cognilab/careSessions/'+patient+'/'+programId);assert.equal(Object.values(shared).flatMap(s=>Object.values(s.results)).length,12);
assert.equal(Object.keys(sessionJournal(patient).sessions).length,4);assert.equal(Object.keys(sessionJournal('other-test-account').sessions).length,0);
const trends=exerciseIds.map(exerciseId=>{
 const first=allResults.find(r=>r.exerciseId===exerciseId),series=comparableSeries(allResults,groupKey(first));
 assert.equal(series.length,4);const trend=change(series[0],series.at(-1));
 return {exercise:first.title,accuracy:series.map(r=>r.metrics.accuracyPct),trend:trend.trend,delta:trend.delta};
});assert.deepEqual(trends.map(t=>t.trend),['positivo','positivo','negativo']);
console.log(JSON.stringify({mode:'SIMULAZIONE LOCALE — nessun account creato e nessuna scrittura sul Firebase effettivo',patient,completedSessions:progress.completed,savedResults:allResults.length,sharedResults:12,retryRecovered:true,duplicateResults:0,rows,trends},null,2));
