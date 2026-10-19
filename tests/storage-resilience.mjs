import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {normalizeMetrics} from '../shared/progress-model.mjs';
import {isPermissionDenied} from '../shared/firebase-errors.js';
import {withAccessTimeout} from '../shared/access-timeout.js';
const source=fs.readFileSync(new URL('../shared/progress-store.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
function harness(){let online=true;const saved=new Map(),journal=[];
 const blocked={getItem(){throw Error('SecurityError');},setItem(){throw Error('QuotaExceededError');},removeItem(){throw Error('SecurityError');}};
 const auth={currentUser:{uid:'alice'}};
 const context=vm.createContext({localStorage:blocked,sessionStorage:blocked,auth,authReady:Promise.resolve(),db:{},crypto:{randomUUID:()=> 'session-12345678'},normalizeMetrics,isPermissionDenied,withAccessTimeout,recordSessionResult:(_uid,r,state)=>journal.push({r,state}),clearSessionJournal:()=>{},ref:(_db,p)=>p,get:async p=>{if(p.includes('__privacy_probe__'))throw {code:'PERMISSION_DENIED'};return {val:()=>null};},update:async(_ref,values)=>{if(!online)throw Error('offline');for(const [p,v] of Object.entries(values))saved.set(p,v);},requireProfessional:async()=>auth.currentUser});
 vm.runInContext(source,context);return {context,saved,journal,setOnline:v=>online=v,auth};
}
const result={id:'result-12345678',exerciseId:'stroop',startedAt:'2026-10-19T10:00:00Z',finishedAt:'2026-10-19T10:01:00Z',status:'completed',metrics:{correct:2,total:3}};
const h=harness();await h.context.saveResult(result);assert.equal(h.context.pendingSummary('alice').results,0);assert.ok([...h.saved.keys()].some(k=>k.endsWith('/'+result.id)));assert.equal(h.journal.at(-1).state,'saved');
h.setOnline(false);await assert.rejects(h.context.saveResult({...result,id:'result-87654321'}),e=>e.code==='save-memory-only');assert.equal(h.context.pendingSummary('alice').memoryOnly,1);assert.throws(()=>h.context.clearSyncedLocalData('alice'),e=>e.code==='pending-results');assert.equal(h.context.pendingSummary('bob').results,0);
h.setOnline(true);await h.context.retryPending();assert.equal(h.context.pendingSummary('alice').results,0);assert.equal(h.context.pendingSummary('alice').memoryOnly,0);h.context.clearSyncedLocalData('alice');
const s=harness();s.setOnline(false);const assigned={...result,sessionId:'assigned-12345678',sessionStartedAt:result.startedAt,programId:'program-12345678',programOwnerId:'owner',programSlot:'0'};await assert.rejects(s.context.saveResult(assigned));s.setOnline(true);await s.context.retryPending();assert.ok([...s.saved.keys()].some(k=>k.startsWith('cognilab/careSessions/alice/')));assert.equal(s.context.pendingSummary('alice').sharing,0);
console.log('PASS: blocked local/tab storage does not block cloud saves; offline memory queue warns and retries; account isolation; cleanup guard; assigned result sharing.');
