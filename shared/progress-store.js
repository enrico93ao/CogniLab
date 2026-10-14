import {isPermissionDenied} from './firebase-errors.js';
import {guestFeedbackClient} from './feedback-guest.js';
import {ref,set,update,get,serverTimestamp} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {db,auth,authReady} from './firebase-client.js';
import {normalizeMetrics} from './progress-model.mjs';
const uuid=()=>crypto.randomUUID();
const privateAccounts=new Set();
export async function ensurePrivateStorage(){
 await authReady;const user=auth.currentUser;if(!user)throw Object.assign(new Error('Login required'),{code:'login-required'});
 if(privateAccounts.has(user.uid))return;
 let denied=false;
 try{await get(ref(db,'cognilab/users/__privacy_probe__'));}catch(error){if(isPermissionDenied(error))denied=true;else throw error;}
 if(!denied)throw Object.assign(new Error('Privacy rules required'),{code:'privacy-not-configured'});
 await get(ref(db,`cognilab/users/${user.uid}`));privateAccounts.add(user.uid);
}
export function sessionFor(uid){
 const key='cognilab.session.'+uid;let session;
 try{session=JSON.parse(sessionStorage.getItem(key));}catch{}
 const patientId=localStorage.getItem('hub_mode')==='clinical'?localStorage.getItem('hub_selected_patient_id'):null;
 if(!session?.id||session.patientId!==patientId){session={id:uuid(),startedAt:new Date().toISOString(),patientId};sessionStorage.setItem(key,JSON.stringify(session));}
 return session;
}
function queueKey(uid){return 'cognilab.pending.'+uid;}
export function pending(uid){try{return JSON.parse(localStorage.getItem(queueKey(uid)))||{};}catch{return {};}}
export async function saveResult(input){
 await authReady;const user=auth.currentUser;
 if(!user)throw Object.assign(new Error('Accedi per salvare i risultati nel tuo account.'),{code:'login-required'});
 if(input?.sessionId&&!/^[a-z0-9-]{8,80}$/i.test(input.sessionId))throw Error('Invalid session');
 if(!input?.id||!/^[a-z0-9-]{8,80}$/i.test(input.id)||typeof input.exerciseId!=='string'||!input.startedAt||!input.finishedAt)throw Error('Invalid exercise result');
 const session=input.sessionId?{id:input.sessionId,startedAt:input.sessionStartedAt,patientId:input.patientId||null}:sessionFor(user.uid);
 const result={...input,metrics:normalizeMetrics(input.metrics),sessionId:session.id,sessionStartedAt:session.startedAt,patientId:session.patientId||null};
 const queue=pending(user.uid);queue[result.id]=result;localStorage.setItem(queueKey(user.uid),JSON.stringify(queue));
 await ensurePrivateStorage();
 const values={};
 values[`cognilab/users/${user.uid}/sessions/${session.id}/startedAt`]=session.startedAt;
 values[`cognilab/users/${user.uid}/sessions/${session.id}/results/${result.id}`]=result;
 values[`cognilab/activity/${user.uid}/${result.id}`]=result.status==='completed';
 await update(ref(db),values);
 const latest=pending(user.uid);delete latest[result.id];localStorage.setItem(queueKey(user.uid),JSON.stringify(latest));
 return result;
}
export async function retryPending(){await authReady;const user=auth.currentUser;if(!user)return;for(const result of Object.values(pending(user.uid)))await saveResult(result);}
export async function finishSession(){await authReady;const user=auth.currentUser;if(!user)return;await ensurePrivateStorage();const session=sessionFor(user.uid);const values={};values[`cognilab/users/${user.uid}/sessions/${session.id}/status`]='completed';values[`cognilab/users/${user.uid}/sessions/${session.id}/finishedAt`]=new Date().toISOString();values[`cognilab/users/${user.uid}/clinical/sessione_attiva`]=null;await update(ref(db),values);sessionStorage.removeItem('cognilab.session.'+user.uid);sessionStorage.removeItem('cognilab.plan.'+user.uid);}
export async function saveFeedback(ratings,options={}){
 if(![ratings.q1,ratings.q2,ratings.q3].every(v=>Number.isInteger(v)&&v>=1&&v<=5))throw Error('Rispondi a tutte le domande.');
 await authReady;
 const withoutAccount=options.anonymous!==false||!auth.currentUser||auth.currentUser.isAnonymous;
 const client=withoutAccount?await guestFeedbackClient():{user:auth.currentUser,db};
 const submissionId=options.submissionId||sessionFor(client.user.uid).id;
 if(!/^[a-z0-9-]{8,80}$/i.test(submissionId))throw Error('Invalid feedback identifier');
 await set(ref(client.db,`cognilab/feedback/${client.user.uid}/${submissionId}`),{q1:ratings.q1,q2:ratings.q2,q3:ratings.q3,submittedAt:serverTimestamp()});
 return submissionId;
}
export async function resultsForUser(){await ensurePrivateStorage();const user=auth.currentUser;if(!user)return [];const snap=await get(ref(db,`cognilab/users/${user.uid}/sessions`));return Object.values(snap.val()||{}).flatMap(s=>Object.values(s.results||{}));}
