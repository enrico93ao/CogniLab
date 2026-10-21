import {requireProfessional} from './clinical-access.js';
import {saveResult,finishSession} from './progress-store.js?v=opposite43';
import {friendlyError,auth,authReady} from './firebase-client.js';
import {patientWorkspace} from './care-store.js?v=opposite43';
import {programProgress} from './care-model.mjs?v=opposite43';
const frame=document.getElementById('exercise-frame');
await authReady;
if(localStorage.getItem('hub_mode')==='clinical'){try{await requireProfessional();}catch{frame.hidden=true;location.replace('area-clinica.html');throw Error('Clinical access denied');}}
const planUid=auth.currentUser?.uid;
const planKey=planUid?'cognilab.plan.'+planUid:null;
let plan;try{plan=planKey?JSON.parse(sessionStorage.getItem(planKey)):null;}catch{}
let nextButton;const saving=new Set();
let journey;const isSkipped=payload=>payload?.exerciseId==='rispondi-contrario'&&payload.status==='interrupted'&&payload.skipped===true;
const isPassed=payload=>payload?.status==='completed';
const handled=()=>[...(plan?.completedSlots||[]),...(plan?.skippedSlots||[])];
function showNext({pending=false,error=null,retry=null}={}){
 if(!plan?.programId||!nextButton)return;
 // The iframe becomes inert before any network request: its result/menu
 // buttons cannot receive clicks or keyboard focus while saving.
 frame.setAttribute('inert','');frame.style.pointerEvents='none';
 journey?.remove();journey=document.createElement('dialog');journey.className='cl-journey';journey.setAttribute('aria-busy',String(pending));
 journey.addEventListener('cancel',event=>event.preventDefault());
 const remaining=plan.files.map((_,i)=>i).filter(i=>!handled().includes(i));
 const mark=document.createElement('span');mark.className='cl-journey-mark';mark.textContent=pending?'…':error?'!':'✓';mark.setAttribute('aria-hidden','true');
 const title=document.createElement('h1');title.tabIndex=-1;title.textContent=pending?'Esercizio terminato':error?'Un momento: il risultato è in attesa':plan.skippedSlots?.length?(remaining.length?'Proseguiamo con il programma':'Hai concluso le attività del programma'):remaining.length?'Ottimo, continuiamo!':'Hai completato tutti gli esercizi!';
 const text=document.createElement('p');text.setAttribute('role','status');text.setAttribute('aria-live','polite');text.textContent=pending?'Salvataggio in corso… Non devi fare nulla. Il pulsante per continuare si attiverà appena il risultato sarà confermato.':error|| (remaining.length?'Un esercizio alla volta: il tuo impegno conta. Sei pronto per il prossimo?':'Hai dedicato tempo al tuo allenamento. Ora puoi concludere la sessione.');
 const bar=document.createElement('progress');bar.className='cl-journey-progress';bar.max=plan.files.length;bar.value=handled().length;bar.setAttribute('aria-label',handled().length+' attività registrate su '+plan.files.length);
 const go=document.createElement('button');go.disabled=pending;go.textContent=pending?'Salvataggio in corso…':error?'Riprova il salvataggio':remaining.length?'Prosegui con l’esercizio successivo →':'Concludi la sessione →';go.onclick=async()=>{go.disabled=true;if(error){await retry?.();}else{await nextButton.onclick();go.disabled=false;}};
 if(plan.skippedSlots?.length){const skipped=document.createElement('p');skipped.textContent=plan.skippedSlots.length+' esercizi saltati e registrati come non completati.';journey.append(skipped);}
 journey.append(mark,title,text,bar,go);
 if(error){const back=document.createElement('button');back.className='cl-journey-secondary';back.style.cssText='background:#eef3f6;color:#294e60;box-shadow:none;font-size:1rem';back.textContent='Torna alla dashboard per sincronizzare';back.onclick=()=>leave(false);journey.append(back);}
 document.body.append(journey);journey.showModal();title.focus({preventScroll:true});journey.scrollTop=0;
}

async function showCompleted(){
 const programId=plan.programId;let nextDate=null,allDone=false,dateKnown=false,archived=false;
 try{const data=await patientWorkspace(),program=data.programs.find(p=>p.id===programId);if(program){archived=program.status==='archived';const progress=programProgress(program,program.sessions);nextDate=program.schedule?.[progress.completed]||null;allDone=progress.remaining===0;dateKnown=true;}}catch{}
 journey?.remove();journey=document.createElement('dialog');journey.className='cl-journey';
 const title=document.createElement('h1');title.textContent=plan.skippedSlots?.length?'Sessione conclusa. Grazie per l’impegno!':'Sessione completata. Ben fatto!';
 const text=document.createElement('p');text.textContent='Ogni allenamento è un passo nel tuo percorso. Grazie per l’impegno di oggi: concediti una pausa.';
 const date=document.createElement('p');date.className='cl-journey-date';date.textContent=archived?'Il programma è stato archiviato. Il professionista potrà indicarti i prossimi passi.':nextDate?'Ti aspettiamo '+new Date(nextDate+'T12:00:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' per la prossima sessione.':allDone?'Hai concluso il programma assegnato! Il professionista potrà concordare con te i prossimi passi.':dateKnown?'Consulta il professionista per concordare la prossima sessione.':'La prossima data non è disponibile in questo momento. Controlla il calendario nella tua dashboard.';
 const go=document.createElement('button');go.textContent='Torna alla mia dashboard';go.onclick=()=>location.href='esercizi.html?feedback=1';if(plan.skippedSlots?.length){const skipped=document.createElement('p');skipped.textContent=plan.skippedSlots.length+' esercizi sono stati saltati: il professionista potrà consultarli come non completati.';journey.append(skipped);}
 journey.append(title,text,date,go);document.body.append(journey);journey.showModal();
 journey.addEventListener('cancel',e=>e.preventDefault());
}
const heading=document.querySelector('.cl-exercise-heading');
const planStatus=document.createElement('p');planStatus.setAttribute('role','status');planStatus.style.cssText='font-size:.85rem;color:#466775;line-height:1.5';
let file=new URLSearchParams(location.search).get('file');try{file=decodeURIComponent(file);}catch{}
if(plan?.files?.length&&plan.files[plan.index]===file){
 plan.completedSlots=plan.completedSlots||[];plan.skippedSlots=plan.skippedSlots||[];
 nextButton=document.createElement('button');nextButton.className='btn';nextButton.disabled=true;
 const remaining=()=>plan.files.map((_,i)=>i).filter(i=>!handled().includes(i));
 nextButton.textContent=plan.index+1<plan.files.length?'Esercizio successivo ('+(plan.index+1)+'/'+plan.files.length+')':'Concludi la sessione';
 heading.append(nextButton,planStatus);planStatus.textContent='Esercizio '+(plan.index+1)+' di '+plan.files.length+(plan.programId?' · Programma assegnato':'');
 nextButton.onclick=async()=>{
  if(auth.currentUser?.uid!==planUid){planStatus.textContent='Account cambiato: torna alla palestra prima di continuare.';return;}
  nextButton.disabled=true;
  const next=remaining()[0];
  if(next!==undefined){
   plan.index=next;sessionStorage.setItem(planKey,JSON.stringify(plan));
   if(plan.programId){const key='cognilab.session.'+auth.currentUser.uid;let session;try{session=JSON.parse(sessionStorage.getItem(key));}catch{}if(session?.programId===plan.programId){session.programSlot=String(next);sessionStorage.setItem(key,JSON.stringify(session));}}
   location.href='esercizio.html?file='+encodeURIComponent(plan.files[next]);
  }else{
   try{await finishSession();sessionStorage.removeItem(planKey);if(plan.programId)await showCompleted();else location.href='esercizi.html?feedback=1';}
   catch(error){planStatus.textContent=friendlyError(error)+' Riprova a concludere la sessione.';nextButton.disabled=false;}
  }
 };
}
const inFlightResults=new Map();
function queueSave(payload){
 const id=payload?.id;if(inFlightResults.has(id))return inFlightResults.get(id);
 const task=saveExerciseResult(payload);inFlightResults.set(id,task);saving.add(task);
 const clear=()=>{inFlightResults.delete(id);saving.delete(task);};task.then(clear,clear);return task;
}
async function saveExerciseResult(payload){
 const assigned=Boolean(nextButton&&plan?.programId&&(isPassed(payload)||isSkipped(payload)));
 if(assigned&&payload.exerciseId==='rispondi-contrario'&&isPassed(payload)&&payload.metrics?.criterionMet!==true){frame.contentWindow.postMessage({type:'cognilab-save-status',id:payload.id,ok:false,message:'Completa le 15 risposte senza errori nel tempo previsto, oppure usa Salta questo esercizio.'},location.origin);return;}
 if(assigned){nextButton.disabled=true;showNext({pending:true});}
 let ok=false,message;
 try{
  if(auth.currentUser?.uid!==planUid)throw {code:'account-changed'};
  const result=await Promise.race([saveResult(payload),new Promise((_,reject)=>setTimeout(()=>reject({code:'sync-pending'}),15000))]);
  ok=result.sharingState!=='pending';
  message=ok?'Risultato salvato nella sessione e sincronizzato con il tuo account.':'Risultato salvato nel tuo account. La condivisione con il professionista è in attesa: riprova il salvataggio o torna alla dashboard per sincronizzare.';
 }catch(error){message=error.code==='account-changed'?'Account cambiato. Torna alla palestra prima di continuare.':error.code==='login-required'?'Accedi alla palestra per conservare i risultati.':friendlyError(error)+(error.code==='save-memory-only'?'':' Se registrato nella coda locale, il risultato verrà ritentato dalla palestra.');}
 if(auth.currentUser?.uid!==planUid){ok=false;message='Account cambiato. Torna alla palestra prima di continuare.';}
 if(nextButton&&auth.currentUser&&ok&&(isPassed(payload)||isSkipped(payload))){
  const slots=isSkipped(payload)?plan.skippedSlots:plan.completedSlots;if(!slots.includes(plan.index))slots.push(plan.index);
  sessionStorage.setItem(planKey,JSON.stringify(plan));nextButton.disabled=false;showNext();
 }else if(assigned)showNext({error:message,retry:()=>queueSave(payload)});
 frame.contentWindow.postMessage({type:'cognilab-save-status',id:payload?.id,ok,message},location.origin);
}
window.addEventListener('message',async event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==='cognilab-exit-v3'){if(journey?.open)return;leave(false);return;}
 if(event.data?.type!=='cognilab-result-v3')return;
 await queueSave(event.data.result);
});

async function leave(feedback){await Promise.allSettled([...saving]);const result=frame.contentWindow?.CogniLabRun?.abort();if(result)try{await saveResult(result);}catch{}location.href='esercizi.html'+(feedback?'?feedback=1':'');}
window.tornaAllaDashboard=event=>{event.preventDefault();leave(false);};
window.terminaSessioneGlobale=()=>leave(true);
