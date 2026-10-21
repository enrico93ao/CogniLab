import {get,ref} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,db} from './firebase-client.js';
import {requireProfessional} from './clinical-access.js';
import {withAccessTimeout} from './access-timeout.js';
import {summarizeFeedback,feedbackQuestions} from './feedback-summary-model.mjs';
export const feedbackManagerUid='eWoQhl1qwqVKRupDabTM6vfMyyI3';
export async function readFeedbackSummary(){
 const user=await requireProfessional();
 if(user.uid!==feedbackManagerUid||user.isAnonymous)throw Object.assign(Error('Riepilogo riservato al super user.'),{code:'feedback-manager-only'});
 const snapshot=await withAccessTimeout(get(ref(db,'cognilab/feedback')),'feedback-summary-timeout');
 if(auth.currentUser?.uid!==user.uid)throw Object.assign(Error('Account cambiato.'),{code:'feedback-account-changed'});
 return summarizeFeedback(snapshot.val());
}
export function mountFeedbackSummary(host){
 if(auth.currentUser?.uid!==feedbackManagerUid)return {refresh:async()=>{},clear:()=>{}};
 const element=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const card=element('section',undefined,'care-card care-feedback-summary');card.setAttribute('aria-label','Riepilogo questionari di gradimento');
 card.append(element('div','SOLO SUPER USER','care-eyebrow'),element('h2','Questionari di gradimento'));
 const note=element('p','Medie delle valutazioni da 1 a 5. La media generale riunisce le tre domande. Sono inclusi i questionari registrati e anonimi, senza mostrare nomi, email o singole risposte.','care-muted');
 const status=element('p','Caricamento dei questionari…','care-notice');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const count=element('p',undefined,'care-feedback-count'),grid=element('div',undefined,'care-feedback-grid'),updated=element('p',undefined,'care-muted');
 const refresh=element('button','Aggiorna medie');refresh.type='button';
 card.append(note,status,count,grid,updated,refresh);host.append(card);let generation=0;
 const clear=()=>{generation++;card.remove();};
 async function load(){
  const revision=++generation;refresh.disabled=true;grid.replaceChildren();count.textContent='';updated.textContent='';status.className='care-notice';status.textContent='Caricamento dei questionari…';
  try{
   const data=await readFeedbackSummary();if(revision!==generation||auth.currentUser?.uid!==feedbackManagerUid){clear();return;}
   count.textContent=data.count+' '+(data.count===1?'questionario completo':'questionari completi');
   status.textContent=data.count?'Le medie sono calcolate solo sulle risposte salvate.':'Nessun questionario completo salvato: le medie compariranno dopo il primo invio.';
   const items=[{label:'Media generale',value:data.overall},...feedbackQuestions.map(q=>({label:q.label,value:data.averages[q.key]}))];
   for(const {label,value} of items){const tile=element('article',undefined,'care-feedback-tile'),rating=element('strong',value===null?'—':value.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}));tile.append(element('h3',label),rating,element('span',value===null?'In attesa di risposte':'su 5'));
    if(value!==null){const bar=element('progress');bar.max=5;bar.value=value;bar.setAttribute('aria-label',label+': '+value.toFixed(2)+' su 5');tile.append(bar);}grid.append(tile);
   }
   updated.textContent='Letto dal database alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})+(data.latestAt?' · Ultimo invio: '+new Date(data.latestAt).toLocaleDateString('it-IT'):'');
  }catch(error){
   if(revision!==generation)return;if(auth.currentUser?.uid!==feedbackManagerUid){clear();return;}
   status.className='care-notice error';
   status.textContent=/permission/i.test(error?.code||'')?'Per attivare il riepilogo, pubblica le regole Firebase aggiornate in Realtime Database → Regole. La lettura complessiva è riservata al super user.':'Non è stato possibile leggere i questionari. Controlla la connessione e riprova.';
  }finally{if(revision===generation)refresh.disabled=false;}
 }
 refresh.onclick=load;load();return {refresh:load,clear};
}
