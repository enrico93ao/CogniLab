import {createProgressView} from './progress-view.js?v=language2';
import {requireProfessional} from './clinical-access.js';
import {errorCode} from './firebase-errors.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {ref,onValue,onDisconnect,set,remove} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {db,auth,friendlyError,accessModeReady} from './firebase-client.js';
import {saveFeedback,finishSession,pending,retryPending,ensurePrivateStorage} from './progress-store.js';
import {onlineCount,completedCount,satisfaction,groupKey,comparableSeries,measurement,change} from './progress-model.mjs';
const notice=document.createElement('p');notice.className='cl-notice';notice.hidden=true;notice.setAttribute('role','status');document.getElementById('care-workspace').after(notice);
const feedbackStatus=document.createElement('p');feedbackStatus.id='cl-feedback-status';feedbackStatus.setAttribute('role','status');document.querySelector('#feedback-modal .modal-card').append(feedbackStatus);
const feedbackOption=document.createElement('label');
feedbackOption.style.cssText='display:flex;gap:10px;align-items:center;margin:16px 0';
feedbackOption.innerHTML='<input id="cl-feedback-anonymous" type="checkbox" checked> Invia senza collegare le risposte al mio account';
document.querySelector('#feedback-modal .modal-card').insertBefore(feedbackOption,feedbackStatus);
const help=document.createElement('p');
help.textContent='Puoi inviare le risposte senza collegarle al tuo account personale. In questa modalità il questionario non contiene nome o email.';
feedbackOption.after(help);
let feedbackSubmissionId=crypto.randomUUID(),feedbackSent=false,closingSessionPromise=null;
function returnToLanding(){
 localStorage.removeItem('global_timer_start');
 const uid=auth.currentUser?.uid;
 if(uid){sessionStorage.removeItem('cognilab.session.'+uid);sessionStorage.removeItem('cognilab.plan.'+uid);}
 location.href='index.html';
}
function closeCurrentSession(){
 if(!closingSessionPromise)closingSessionPromise=finishSession().then(()=>{localStorage.removeItem('global_timer_start');}).catch(error=>{
   notice.hidden=false;notice.textContent='La chiusura della sessione non è stata completata. '+friendlyError(error);
   closingSessionPromise=null;
 });
 return closingSessionPromise;
}
window.submitFeedbackForm=async()=>{
 if(feedbackSent)return;
 const ratings=Object.fromEntries([1,2,3].map(n=>['q'+n,document.querySelectorAll(`.star-rating[data-q="${n}"] .star-btn.active`).length]));
 if(Object.values(ratings).some(n=>n===0)){feedbackStatus.textContent='Rispondi a tutte le domande scegliendo da 1 a 5 stelle.';return;}
 const button=document.querySelector('[onclick="submitFeedbackForm()"]');
 if(button.disabled)return;
 button.disabled=true;feedbackStatus.textContent='Invio in corso…';
 try{
   await saveFeedback(ratings,{anonymous:document.getElementById('cl-feedback-anonymous').checked,submissionId:feedbackSubmissionId});
   feedbackSent=true;feedbackStatus.textContent='Questionario inviato. Grazie!';button.textContent='Risposte inviate';
   feedbackStatus.textContent='Questionario inviato. Ritorno alla home…';
   await Promise.race([closeCurrentSession(),new Promise(resolve=>setTimeout(resolve,1500))]);
   returnToLanding();
 }catch(error){
   const code=errorCode(error)||'errore-non-identificato';
   const stage=error.feedbackStage==='authentication'?'accesso anonimo':error.feedbackStage==='database'?'salvataggio risposte':'invio';
   feedbackStatus.textContent=friendlyError(error)+' Dettaglio: '+stage+' ('+code+').';
   button.disabled=false;
 }
};
window.closeFeedbackModal=async()=>{
 document.getElementById('feedback-modal').style.display='none';
 await Promise.race([closeCurrentSession(),new Promise(resolve=>setTimeout(resolve,1500))]);
 returnToLanding();
};
window.terminaSessioneGlobale=()=>{
 feedbackStatus.textContent='';feedbackSent=false;feedbackSubmissionId=crypto.randomUUID();closingSessionPromise=null;
 const button=document.querySelector('[onclick="submitFeedbackForm()"]');button.disabled=false;button.textContent='Invia Risposte';
 document.querySelectorAll('.star-btn').forEach(button=>button.classList.remove('active'));
 document.getElementById('feedback-modal').style.display='flex';
};
window.tornaAllaHome=()=>{location.href='esercizi.html';};
if(new URLSearchParams(location.search).get('feedback')==='1')window.terminaSessioneGlobale();
const progress=document.createElement('section');progress.id='care-personal-progress';notice.after(progress);
const progressView=createProgressView(progress);progress.querySelector('.care-load-status').id='cl-progress-status';
let rawResults=[];
function renderResults(source){
 rawResults=source;const patientId=localStorage.getItem('hub_mode')==='clinical'?document.getElementById('patient-select')?.value:null;
 const results=source.filter(r=>patientId?r.patientId===patientId:!r.patientId);
 progress.hidden=localStorage.getItem('hub_mode')==='clinical'&&!patientId;
 progressView.setTitle(patientId?'Progressi delle sessioni in studio':'I miei progressi');progressView.render(results);
}
let stops=[],presenceRef;
function unavailable(element,error){if(element.id==='cl-progress-status'){element.textContent='Lo storico non è disponibile. '+friendlyError(error);progress.querySelectorAll('.care-stat strong').forEach(n=>n.textContent='—');}else element.textContent='—';notice.hidden=false;notice.textContent=friendlyError(error);}
onAuthStateChanged(auth,async user=>{
 stops.forEach(stop=>stop());stops=[];if(presenceRef){remove(presenceRef).catch(()=>{});presenceRef=null;}
 renderResults([]);
 if(!user){document.getElementById('cl-progress-status').textContent='Accedi per conservare e visualizzare i tuoi progressi.';return;}
 notice.hidden=true;
 const watch=(path,render,element)=>stops.push(onValue(ref(db,path),snap=>render(snap.val()),error=>unavailable(element,error)));
 try{await ensurePrivateStorage();}catch(error){unavailable(document.getElementById('cl-progress-status'),error);return;}
 if(auth.currentUser?.uid!==user.uid)return;
 const clinicalMode=localStorage.getItem('hub_mode')==='clinical';
 if(clinicalMode){try{await requireProfessional();}catch(error){document.getElementById('cl-progress-status').textContent='Accesso professionale non autorizzato.';return;}}
 const saved={personal:[],clinical:[]};
 const renderSaved=()=>renderResults([...saved.personal,...saved.clinical]);
 watch(`cognilab/users/${user.uid}/sessions`,value=>{saved.personal=Object.values(value||{}).flatMap(s=>Object.values(s.results||{}));renderSaved();},document.getElementById('cl-progress-status'));
 if(clinicalMode)watch(`cognilab/users/${user.uid}/clinical/sessions`,value=>{saved.clinical=Object.values(value||{}).flatMap(s=>Object.values(s.results||{}));renderSaved();},document.getElementById('cl-progress-status'));
 if(user.isAnonymous){notice.hidden=false;notice.textContent='Modalità ospite: crea un account per ritrovare i progressi anche su altri dispositivi.';}
 const queued=Object.keys(pending(user.uid)).length;if(queued){notice.hidden=false;notice.textContent=`${queued} risultati in attesa di sincronizzazione. Vengono ritentati automaticamente quando la connessione è disponibile.`;try{await retryPending();}catch(error){notice.textContent=friendlyError(error)+' I risultati restano nella coda locale del tuo account.';}}
});

window.CogniLabRefreshPatient=()=>{renderResults(rawResults);const select=document.getElementById('patient-select');const patientId=select.value;const report=document.getElementById('patient-report-section');report.style.display=patientId?'block':'none';document.getElementById('report-patient-name').textContent=select.options[select.selectedIndex]?.text||'';const rows=document.getElementById('history-table-body');rows.replaceChildren();for(const result of rawResults.filter(r=>r.patientId===patientId).sort((a,b)=>b.finishedAt.localeCompare(a.finishedAt))){const row=document.createElement('tr');const value=measurement(result);for(const text of [new Date(result.finishedAt).toLocaleString('it-IT'),result.title,value?value.value.toFixed(1)+' '+value.unit:'Non misurato']){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}rows.append(row);}document.getElementById('performanceChart').closest('.chart-container').hidden=true;};
