import {saveResult} from './progress-store.js';
import {friendlyError,auth,authReady} from './firebase-client.js';
const frame=document.getElementById('exercise-frame');
await authReady;
const planKey=auth.currentUser?'cognilab.plan.'+auth.currentUser.uid:null;
let plan;try{plan=planKey?JSON.parse(sessionStorage.getItem(planKey)):null;}catch{}
let nextButton;
if(plan?.files?.length){nextButton=document.createElement('button');nextButton.className='btn';nextButton.disabled=true;nextButton.textContent=plan.index+1<plan.files.length?'Esercizio successivo ('+(plan.index+1)+'/'+plan.files.length+')':'Concludi il percorso';document.querySelector('.cl-exercise-heading').append(nextButton);nextButton.onclick=()=>{plan.index++;if(plan.index<plan.files.length){sessionStorage.setItem(planKey,JSON.stringify(plan));location.href='esercizio.html?file='+encodeURIComponent(plan.files[plan.index]);}else{sessionStorage.removeItem(planKey);location.href='esercizi.html?feedback=1';}};}

window.addEventListener('message',async event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==='cognilab-exit-v3'){leave(false);return;}
 if(event.data?.type!=='cognilab-result-v3')return;
 try{await saveResult(event.data.result);if(nextButton)nextButton.disabled=false;frame.contentWindow.postMessage({type:'cognilab-save-status',message:'Risultato salvato nel tuo account.'},location.origin);}
 catch(error){if(nextButton&&auth.currentUser)nextButton.disabled=false;frame.contentWindow.postMessage({type:'cognilab-save-status',message:error.code==='login-required'?'Accedi al tuo account dalla palestra per conservare i progressi.':friendlyError(error)+' Il risultato resta nella coda locale del tuo account.'},location.origin);}
});
async function leave(feedback){const result=frame.contentWindow?.CogniLabRun?.abort();if(result)try{await saveResult(result);}catch{}location.href='esercizi.html'+(feedback?'?feedback=1':'');}
window.tornaAllaDashboard=event=>{event.preventDefault();leave(false);};
window.terminaSessioneGlobale=()=>leave(true);
