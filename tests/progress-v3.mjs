import assert from 'node:assert/strict';
import {recordSessionResult} from '../shared/session-journal.js';
import {isPermissionDenied} from '../shared/firebase-errors.js';
import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {normalizeMetrics,groupKey,comparableSeries,change,onlineCount,completedCount,satisfaction} from '../shared/progress-model.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(normalizeMetrics({correct:8,total:10}).accuracyPct,80);
assert.equal(normalizeMetrics({correct:null,total:10}).accuracyPct,null);
assert.equal(normalizeMetrics({correct:20,total:10}).accuracyPct,null);
assert.equal(normalizeMetrics({score:NaN}).score,null);
assert.equal(onlineCount({alice:{tab1:true,tab2:true},bob:{tab:false}}),1);
assert.equal(completedCount({alice:{r1:true,r2:false},bob:{r3:true}}),2);
assert.equal(satisfaction([{q1:5,q2:2,q3:5},{q1:4,q2:4,q3:4},{q1:0,q2:5,q3:5}]),3);
const result=(id,settings,metrics)=>({id,exerciseId:'stroop',settings,metrics,status:'completed',finishedAt:'2026-10-14T09:00:0'+id+'Z'});
const a=result('1',{duration:60,level:1},{accuracyPct:70}),b=result('2',{level:1,duration:60},{accuracyPct:80}),other=result('3',{level:2,duration:60},{accuracyPct:90});
assert.equal(groupKey(a),groupKey(b));assert.equal(comparableSeries([other,b,a],groupKey(a)).length,2);assert.equal(change(a,b).trend,'positivo');
assert.equal(change({...a,metrics:{score:400,scoreUnit:'ms',scoreDirection:'lower'}},{...b,metrics:{score:300,scoreUnit:'ms',scoreDirection:'lower'}}).trend,'positivo');
function storage(){const m=new Map();return {getItem:key=>m.get(key)||null,setItem:(key,value)=>m.set(key,value),removeItem:key=>m.delete(key)};}
const auth={currentUser:{uid:'alice'}},localStorage=storage(),sessionStorage=storage();let writes=[],fail=false,privateRules=true;
globalThis.sessionStorage=sessionStorage;
const context=vm.createContext({recordSessionResult,isPermissionDenied,crypto:{randomUUID:()=> 'run-'+Math.random().toString(16).slice(2)},auth,authReady:Promise.resolve(),db:{},localStorage,sessionStorage,normalizeMetrics,ref:(_db,p='')=>p,
 get:async p=>{if(p.includes('__privacy_probe__')&&privateRules)throw {code:'PERMISSION_DENIED'};return {val:()=>null};},
 update:async(p,value)=>{if(fail)throw {code:'PERMISSION_DENIED'};writes.push({p,value});},set:async(p,value)=>writes.push({p,value}),serverTimestamp:()=>123,console});
let code=fs.readFileSync(path.join(root,'shared/progress-store.js'),'utf8').replace(/^import .+\n/gm,'').replace(/export /g,'');vm.runInContext(code,context);
const payload={id:'result-12345678',exerciseId:'stroop',title:'Stroop',startedAt:'2026-10-14T09:00:00Z',finishedAt:'2026-10-14T09:01:00Z',durationMs:60000,status:'completed',metrics:{correct:8,total:10},settings:{level:1}};
fail=true;await assert.rejects(()=>context.saveResult(payload));assert.equal(Object.keys(context.pending('alice')).length,1,'Failed results remain queued');
const queued=Object.values(context.pending('alice'))[0];sessionStorage.removeItem('cognilab.session.alice');fail=false;
await context.retryPending();assert.equal(Object.keys(context.pending('alice')).length,0);const written=Object.keys(writes[0].value);assert.ok(written.some(p=>p.includes('/sessions/'+queued.sessionId+'/results/')),'Retry preserves original session');assert.ok(written.every(p=>p.includes('/alice/')));
auth.currentUser={uid:'bob'};await context.retryPending();assert.equal(writes.length,1,'No cross-account queue replay');
privateRules=false;await assert.rejects(()=>context.ensurePrivateStorage(),error=>error.code==='privacy-not-configured','Broad read permissions block personal storage');
auth.currentUser=null;await assert.rejects(()=>context.saveResult(payload),error=>error.code==='login-required');
console.log('PASS: real KPI aggregation; comparable trend groups; missing metrics; lower-is-better scores; durable retries; session identity; account isolation; privacy gate; login requirement.');
const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const {JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'jsdom');
const page=new JSDOM('<body><div id="setup"><input id="duration" type="number" value="60"></div></body>',{url:'https://example.test/CogniLab/Stroop.html',runScripts:'outside-only'});
const w=page.window,messages=[];Object.defineProperty(w,'parent',{value:{postMessage:message=>{if(message.type==='cognilab-result-v3')messages.push(message)}}});w.CogniLabGymAuthorized=true;w.CogniLabExercise={id:'stroop',title:'Stroop',category:'Attenzione',setup:'setup'};
w.eval(fs.readFileSync(path.join(root,'shared/exercise-runtime.js'),'utf8').replace("import('./gym-gate.js')","Promise.resolve()"));w.CogniLabRun.begin();w.document.getElementById('duration').value='120';w.CogniLabRun.complete({correct:3,total:4});w.CogniLabRun.complete({correct:9,total:10});
assert.equal(messages.length,1,'Completion is emitted once');assert.equal(messages[0].result.settings.duration,'60','Settings reflect exercise start');assert.equal(w.CogniLabRun.abort(),null,'No second interrupted record after completion');
w.CogniLabRun.begin();assert.equal(w.CogniLabRun.abort().status,'interrupted');assert.equal(w.CogniLabRun.measure(()=>missingVariable),null,'Unavailable metrics never become invented zeroes');w.close();
console.log('PASS: exercise-to-shell bridge; completion deduplication; settings snapshot; interrupted runs; unavailable counters.');
