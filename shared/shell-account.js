import {requireProfessional} from './clinical-access.js';
import {saveResult} from './progress-store.js';
import {friendlyError,auth,authReady} from './firebase-client.js';
const frame=document.getElementById('exercise-frame');
await authReady;
if(localStorage.getItem('hub_mode')==='clinical'){try{await requireProfessional();}catch{frame.hidden=true;location.replace('area-clinica.html');throw Error('Clinical access denied');}}
const planKey=auth.currentUser?'cognilab.plan.'+auth.currentUser.uid:null;
let plan;try{plan=planKey?JSON.parse(sessionStorage.getItem(planKey)):null;}catch{}
let nextButton;const saving=new Set();
if(plan?.files?.length){nextButton=document.createElement('button');nextButton.className='btn';nextButton.disabled=true;nextButton.textContent=plan.index+1<plan.files.length?'Esercizio successivo ('+(plan.index+1)+'/'+plan.files.length+')':'Concludi il percorso';document.querySelector('.cl-exercise-heading').append(nextButton);nextButton.onclick=()=>{plan.index++;if(plan.index<plan.files.length){sessionStorage.setItem(planKey,JSON.stringify(plan));location.href='esercizio.html?file='+encodeURIComponent(plan.files[plan.index]);}else{sessionStorage.removeItem(planKey);location.href='esercizi.html?feedback=1';}};}

window.addEventListener('message',async event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==='cognilab-exit-v3'){leave(false);return;}
 if(event.data?.type!=='cognilab-result-v3')return;
 const task=(async()=>{
  let ok=false,message;
  try{await Promise.race([saveResult(event.data.result),new Promise((_,reject)=>setTimeout(()=>reject({code:'sync-pending'}),12000))]);ok=true;message='Risultato salvato nella sessione e sincronizzato con il tuo account.';}
  catch(error){message=error.code==='login-required'?'Accedi alla palestra per conservare i risultati.':friendlyError(error)+' Se registrato nella coda locale, il risultato verrà ritentato dalla palestra.';}
  if(nextButton&&auth.currentUser)nextButton.disabled=false;
  frame.contentWindow.postMessage({type:'cognilab-save-status',id:event.data.result.id,ok,message},location.origin);
 })();saving.add(task);try{await task;}finally{saving.delete(task);}

});
async function leave(feedback){await Promise.allSettled([...saving]);const result=frame.contentWindow?.CogniLabRun?.abort();if(result)try{await saveResult(result);}catch{}location.href='esercizi.html'+(feedback?'?feedback=1':'');}
window.tornaAllaDashboard=event=>{event.preventDefault();leave(false);};
window.terminaSessioneGlobale=()=>leave(true);
