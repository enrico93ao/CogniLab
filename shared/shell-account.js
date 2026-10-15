import {requireProfessional} from './clinical-access.js';
import {saveResult,finishSession} from './progress-store.js';
import {friendlyError,auth,authReady} from './firebase-client.js';
const frame=document.getElementById('exercise-frame');
await authReady;
if(localStorage.getItem('hub_mode')==='clinical'){try{await requireProfessional();}catch{frame.hidden=true;location.replace('area-clinica.html');throw Error('Clinical access denied');}}
const planKey=auth.currentUser?'cognilab.plan.'+auth.currentUser.uid:null;
let plan;try{plan=planKey?JSON.parse(sessionStorage.getItem(planKey)):null;}catch{}
let nextButton;const saving=new Set();
const heading=document.querySelector('.cl-exercise-heading');
const planStatus=document.createElement('p');planStatus.setAttribute('role','status');planStatus.style.cssText='font-size:.85rem;color:#466775;line-height:1.5';
let file=new URLSearchParams(location.search).get('file');try{file=decodeURIComponent(file);}catch{}
if(plan?.files?.length&&plan.files[plan.index]===file){
 plan.completedSlots=plan.completedSlots||[];
 nextButton=document.createElement('button');nextButton.className='btn';nextButton.disabled=true;
 const remaining=()=>plan.files.map((_,i)=>i).filter(i=>!plan.completedSlots.includes(i));
 nextButton.textContent=plan.index+1<plan.files.length?'Esercizio successivo ('+(plan.index+1)+'/'+plan.files.length+')':'Concludi la sessione';
 heading.append(nextButton,planStatus);planStatus.textContent='Esercizio '+(plan.index+1)+' di '+plan.files.length+(plan.programId?' · Programma assegnato':'');
 nextButton.onclick=async()=>{
  nextButton.disabled=true;
  const next=remaining()[0];
  if(next!==undefined){
   plan.index=next;sessionStorage.setItem(planKey,JSON.stringify(plan));
   if(plan.programId){const key='cognilab.session.'+auth.currentUser.uid;let session;try{session=JSON.parse(sessionStorage.getItem(key));}catch{}if(session?.programId===plan.programId){session.programSlot=String(next);sessionStorage.setItem(key,JSON.stringify(session));}}
   location.href='esercizio.html?file='+encodeURIComponent(plan.files[next]);
  }else{
   try{await finishSession();sessionStorage.removeItem(planKey);location.href='esercizi.html?feedback=1';}
   catch(error){planStatus.textContent=friendlyError(error)+' Riprova a concludere la sessione.';nextButton.disabled=false;}
  }
 };
}
window.addEventListener('message',async event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==='cognilab-exit-v3'){leave(false);return;}
 if(event.data?.type!=='cognilab-result-v3')return;
 const task=(async()=>{
  let ok=false,message;
  try{
   const result=await Promise.race([saveResult(event.data.result),new Promise((_,reject)=>setTimeout(()=>reject({code:'sync-pending'}),15000))]);
   ok=result.sharingState!=='pending';
   message=ok?'Risultato salvato nella sessione e sincronizzato con il tuo account.':'Risultato salvato nel tuo account. La condivisione con il professionista è in attesa: riprova il salvataggio o torna alla dashboard per sincronizzare.';
  }catch(error){message=error.code==='login-required'?'Accedi alla palestra per conservare i risultati.':friendlyError(error)+' Se registrato nella coda locale, il risultato verrà ritentato dalla palestra.';}
  if(nextButton&&auth.currentUser&&ok&&event.data.result.status==='completed'){
   if(!plan.completedSlots.includes(plan.index))plan.completedSlots.push(plan.index);
   sessionStorage.setItem(planKey,JSON.stringify(plan));nextButton.disabled=false;
  }
  frame.contentWindow.postMessage({type:'cognilab-save-status',id:event.data.result.id,ok,message},location.origin);
 })();saving.add(task);try{await task;}finally{saving.delete(task);}
});
async function leave(feedback){await Promise.allSettled([...saving]);const result=frame.contentWindow?.CogniLabRun?.abort();if(result)try{await saveResult(result);}catch{}location.href='esercizi.html'+(feedback?'?feedback=1':'');}
window.tornaAllaDashboard=event=>{event.preventDefault();leave(false);};
window.terminaSessioneGlobale=()=>leave(true);
