import {sessionProgress} from './care-model.mjs';
import {withAccessTimeout} from './access-timeout.js';
import {recordSessionResult,clearSessionJournal} from './session-journal.js';
import {requireProfessional} from './clinical-access.js';
import {isPermissionDenied} from './firebase-errors.js';
import {guestFeedbackClient} from './feedback-guest.js';
import {ref,set,update,get,serverTimestamp} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {db,auth,authReady} from './firebase-client.js';
import {normalizeMetrics} from './progress-model.mjs';
const uuid=()=>crypto.randomUUID();
const privateAccounts=new Set();
const memoryQueues=new Map(),acknowledged=new Map(),memorySessions=new Map(),memoryOnly=new Set();
const safeGet=(storage,key)=>{try{return globalThis[storage].getItem(key);}catch{return null;}};
function readQueue(key){let stored={};try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))stored=value;}catch{}
 const rows={...stored,...memoryQueues.get(key)};for(const id of acknowledged.get(key)||[])delete rows[id];return rows;
}
function putQueue(key,result){const rows=readQueue(key);rows[result.id]=result;memoryQueues.set(key,rows);acknowledged.get(key)?.delete(result.id);
 try{localStorage.setItem(key,JSON.stringify(rows));memoryOnly.delete(key+'|'+result.id);return true;}catch{memoryOnly.add(key+'|'+result.id);return false;}
}
function acknowledge(key,id){const rows=readQueue(key);delete rows[id];memoryQueues.set(key,rows);if(!acknowledged.has(key))acknowledged.set(key,new Set());acknowledged.get(key).add(id);memoryOnly.delete(key+'|'+id);
 try{if(Object.keys(rows).length)localStorage.setItem(key,JSON.stringify(rows));else localStorage.removeItem(key);}catch{/* Replaying the same IDs later is idempotent. */}
}
export function pendingSummary(uid){return {results:Object.keys(pending(uid)).length,sharing:Object.keys(pendingCare(uid)).length,memoryOnly:[...memoryOnly].filter(k=>k.startsWith(queueKey(uid)+'|')||k.startsWith('cognilab.carePending.'+uid+'|')).length};}
export function clearSyncedLocalData(uid){
 const state=pendingSummary(uid);if(state.results||state.sharing)throw Object.assign(new Error('Sincronizza i risultati prima di rimuoverli dal dispositivo.'),{code:'pending-results'});
 for(const key of [queueKey(uid),'cognilab.carePending.'+uid]){memoryQueues.delete(key);acknowledged.delete(key);try{localStorage.removeItem(key);}catch{}}
 for(const key of ['cognilab.session.'+uid,'cognilab.plan.'+uid,'cognilab.sessionJournal.'+uid])try{sessionStorage.removeItem(key);}catch{}
 memorySessions.delete(uid);clearSessionJournal(uid);
}
if(typeof window!=='undefined')window.addEventListener('beforeunload',event=>{if(auth.currentUser&&pendingSummary(auth.currentUser.uid).memoryOnly){event.preventDefault();event.returnValue='';}});
export async function ensurePrivateStorage(){
 await authReady;const user=auth.currentUser;if(!user)throw Object.assign(new Error('Login required'),{code:'login-required'});
 if(privateAccounts.has(user.uid))return;
 let denied=false;
 try{await get(ref(db,'cognilab/users/__privacy_probe__'));}catch(error){if(isPermissionDenied(error))denied=true;else throw error;}
 if(!denied)throw Object.assign(new Error('Privacy rules required'),{code:'privacy-not-configured'});
 await get(ref(db,`cognilab/users/${user.uid}/profile`));privateAccounts.add(user.uid);
}
export function sessionFor(uid){
 const key='cognilab.session.'+uid;let session;
 try{session=JSON.parse(sessionStorage.getItem(key));}catch{}session=session||memorySessions.get(uid);
 const patientId=safeGet('localStorage','hub_mode')==='clinical'?safeGet('localStorage','hub_selected_patient_id'):null;
 if(!session?.id||session.patientId!==patientId){session={id:uuid(),startedAt:new Date().toISOString(),patientId};try{sessionStorage.setItem(key,JSON.stringify(session));}catch{}}
 memorySessions.set(uid,session);return session;
}
function queueKey(uid){return 'cognilab.pending.'+uid;}
export function pending(uid){return readQueue(queueKey(uid));}
export async function saveResult(input){
 await authReady;const user=auth.currentUser;
 if(!user)throw Object.assign(new Error('Accedi per salvare i risultati nel tuo account.'),{code:'login-required'});
 if(input?.sessionId&&!/^[a-z0-9-]{8,80}$/i.test(input.sessionId))throw Error('Invalid session');
 if(!input?.id||!/^[a-z0-9-]{8,80}$/i.test(input.id)||typeof input.exerciseId!=='string'||!input.startedAt||!input.finishedAt)throw Error('Invalid exercise result');
 const session=input.sessionId?{id:input.sessionId,startedAt:input.sessionStartedAt,patientId:input.patientId||null,programId:input.programId,programOwnerId:input.programOwnerId,programSlot:input.programSlot}:sessionFor(user.uid);
 if(session.patientId)await requireProfessional();
 const result={...input,metrics:normalizeMetrics(input.metrics),sessionId:session.id,sessionStartedAt:session.startedAt,patientId:session.patientId||null};
 if(!session.patientId&&session.programId&&(!session.programExercises||session.programExercises[Number(session.programSlot)]===input.exerciseId)){result.programId=session.programId;result.programOwnerId=session.programOwnerId;result.programSlot=String(session.programSlot);}
 const durable=putQueue(queueKey(user.uid),result);
 try{recordSessionResult(user.uid,result,durable?'pending':'memory');}catch{}
 try{
 await withAccessTimeout(ensurePrivateStorage(),'result-save-timeout',12000);if(auth.currentUser?.uid!==user.uid)throw Error('Account changed');
 const values={};
 const base=`cognilab/users/${user.uid}/`+(session.patientId?'clinical/sessions/':'sessions/');
 values[`${base}${session.id}/startedAt`]=session.startedAt;
 values[`${base}${session.id}/patientId`]=session.patientId||null;
 values[`${base}${session.id}/results/${result.id}`]=result;
 values[`cognilab/activity/${user.uid}/${result.id}`]=result.status==='completed';
 await withAccessTimeout(update(ref(db),values),'result-save-timeout',12000);
 }catch(error){if(!durable)throw Object.assign(new Error('Risultato non sincronizzato e memoria del dispositivo non disponibile. Non chiudere questa pagina: ristabilisci la connessione e riprova.'),{code:'save-memory-only',cause:error});throw error;}
 let sharingState='none';
 if(result.programId){try{await shareCareResult(user.uid,result);sharingState='saved';}catch{sharingState='pending';}}
 try{recordSessionResult(user.uid,{...result,sharingState},'saved');}catch{}
 acknowledge(queueKey(user.uid),result.id);
 return {...result,sharingState};
}
export async function retryPending(){await authReady;const user=auth.currentUser;if(!user)return;for(const result of Object.values(pending(user.uid)))await saveResult(result);let sharingError;for(const result of Object.values(pendingCare(user.uid))){try{await shareCareResult(user.uid,result);}catch(error){sharingError=error;}}if(sharingError)throw sharingError;}
export function pendingCare(uid){return readQueue('cognilab.carePending.'+uid);}
async function shareCareResult(uid,result){
 if(auth.currentUser?.uid!==uid)throw Error('Account changed');
 const key='cognilab.carePending.'+uid;putQueue(key,result);
 const values={},base=`cognilab/careSessions/${uid}/${result.programId}/${result.sessionId}`;
 values[base+'/startedAt']=result.sessionStartedAt;values[base+'/results/'+result.id]=result;
 await withAccessTimeout(update(ref(db),values),'care-timeout',10000);
 acknowledge(key,result.id);
}
export async function finishSession(){
 await authReady;const user=auth.currentUser;if(!user)return;
 let existing;try{existing=JSON.parse(sessionStorage.getItem('cognilab.session.'+user.uid));}catch{}existing=existing||memorySessions.get(user.uid);if(!existing?.id)return;
 await ensurePrivateStorage();const session=sessionFor(user.uid);
 if(session.patientId||safeGet('localStorage','hub_mode')==='clinical')await requireProfessional();
 const base=`cognilab/users/${user.uid}/`+(session.patientId?'clinical/sessions/':'sessions/');const values={};
 values[`${base}${session.id}/status`]='completed';values[`${base}${session.id}/finishedAt`]=new Date().toISOString();
 if(safeGet('localStorage','hub_mode')==='clinical')values[`cognilab/users/${user.uid}/clinical/sessione_attiva`]=null;
 await update(ref(db),values);
 if(session.programId&&session.programExercises){try{const path=`cognilab/careSessions/${user.uid}/${session.programId}/${session.id}`;const saved=(await withAccessTimeout(get(ref(db,path)),'care-timeout')).val()||{};if(saved.startedAt)await withAccessTimeout(update(ref(db,path),{status:sessionProgress({exercises:session.programExercises},saved).complete?'completed':'interrupted',finishedAt:new Date().toISOString()}),'care-timeout');}catch{/* Personal session closure succeeds even if sharing was revoked. */}}
 for(const key of ['cognilab.session.'+user.uid,'cognilab.plan.'+user.uid])try{sessionStorage.removeItem(key);}catch{}memorySessions.delete(user.uid);
}
export async function saveFeedback(ratings,options={}){
 if(![ratings.q1,ratings.q2,ratings.q3].every(v=>Number.isInteger(v)&&v>=1&&v<=5))throw Error('Rispondi a tutte le domande.');
 await authReady;
 const withoutAccount=options.anonymous!==false||!auth.currentUser||auth.currentUser.isAnonymous;
 let client;
 try{client=withoutAccount?await guestFeedbackClient():{user:auth.currentUser,db};}
 catch(error){throw Object.assign(new Error('Feedback authentication failed'),{code:error?.code||'feedback-auth-failed',feedbackStage:'authentication'});}
 const submissionId=options.submissionId||sessionFor(client.user.uid).id;
 if(!/^[a-z0-9-]{8,80}$/i.test(submissionId))throw Error('Invalid feedback identifier');
 try{
   await set(ref(client.db,`cognilab/feedback/${client.user.uid}/${submissionId}`),{q1:ratings.q1,q2:ratings.q2,q3:ratings.q3,submittedAt:serverTimestamp()});
 }catch(error){throw Object.assign(new Error('Feedback database write failed'),{code:isPermissionDenied(error)?'permission-denied':error?.code||'feedback-write-failed',feedbackStage:'database'});}
 return submissionId;
}
export async function resultsForUser(){await ensurePrivateStorage();const user=auth.currentUser;if(!user)return [];const snap=await get(ref(db,`cognilab/users/${user.uid}/sessions`));return Object.values(snap.val()||{}).flatMap(s=>Object.values(s.results||{}));}
