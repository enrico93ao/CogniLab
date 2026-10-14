import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {ref,onValue,onDisconnect,set,remove} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {db,auth,friendlyError} from './firebase-client.js';
import {saveFeedback,finishSession,pending,retryPending,ensurePrivateStorage} from './progress-store.js';
import {onlineCount,completedCount,satisfaction,groupKey,comparableSeries,measurement,change} from './progress-model.mjs';
const notice=document.createElement('p');notice.className='cl-notice';notice.hidden=true;notice.setAttribute('role','status');document.querySelector('.kpi-grid').after(notice);
const feedbackStatus=document.createElement('p');feedbackStatus.id='cl-feedback-status';feedbackStatus.setAttribute('role','status');document.querySelector('#feedback-modal .modal-card').append(feedbackStatus);
window.submitFeedbackForm=async()=>{
 const ratings=Object.fromEntries([1,2,3].map(n=>['q'+n,document.querySelectorAll(`.star-rating[data-q="${n}"] .star-btn.active`).length]));
 if(Object.values(ratings).some(n=>n===0)){feedbackStatus.textContent='Rispondi a tutte le domande scegliendo da 1 a 5 stelle.';return;}
 if(!auth.currentUser){feedbackStatus.textContent='Accedi al tuo account per inviare il questionario.';window.CogniLabOpenAccount?.();return;}
 const button=document.querySelector('[onclick="submitFeedbackForm()"]');button.disabled=true;feedbackStatus.textContent='Invio in corso…';
 try{await saveFeedback(ratings);feedbackStatus.textContent='Questionario salvato. Grazie!';await finishSession();localStorage.removeItem('global_timer_start');button.textContent='Risposte inviate';}
 catch(error){feedbackStatus.textContent=friendlyError(error);button.disabled=false;}
};
window.closeFeedbackModal=async()=>{try{await finishSession();document.getElementById('feedback-modal').style.display='none';localStorage.removeItem('global_timer_start');}catch(error){feedbackStatus.textContent=friendlyError(error);}};
window.terminaSessioneGlobale=()=>{feedbackStatus.textContent='';const button=document.querySelector('[onclick="submitFeedbackForm()"]');button.disabled=false;button.textContent='Invia Risposte';document.querySelectorAll('.star-btn').forEach(b=>b.classList.remove('active'));document.getElementById('feedback-modal').style.display='flex';};
window.tornaAllaHome=()=>{location.href='esercizi.html';};
if(new URLSearchParams(location.search).get('feedback')==='1')window.terminaSessioneGlobale();
const progress=document.createElement('section');progress.className='cl-progress';
progress.innerHTML='<h2>I miei progressi</h2><p id="cl-progress-status" role="status">Accedi per visualizzare le sessioni salvate nel tuo account.</p><label for="cl-progress-exercise">Esercizio e impostazioni confrontabili</label><br><select id="cl-progress-exercise" hidden></select><p id="cl-trend"></p><div id="cl-progress-chart"></div><div class="cl-table-scroll"><table><thead><tr><th scope="col">Data</th><th scope="col">Esercizio</th><th scope="col">Risultato</th><th scope="col">Durata</th><th scope="col">Stato</th></tr></thead><tbody id="cl-progress-rows"></tbody></table></div>';
notice.after(progress);
const selector=document.getElementById('cl-progress-exercise');let allResults=[],rawResults=[];
const svgNS='http://www.w3.org/2000/svg';
function draw(){
 const series=comparableSeries(allResults,selector.value).filter(r=>measurement(r)).slice(-20);
 const host=document.getElementById('cl-progress-chart');host.replaceChildren();const trend=document.getElementById('cl-trend');trend.textContent='';
 if(series.length<2){trend.textContent='Servono almeno due risultati dello stesso esercizio con le stesse impostazioni per mostrare l’andamento.';return;}
 const last=measurement(series.at(-1));const comparable=series.filter(r=>measurement(r).unit===last.unit&&measurement(r).direction===last.direction);
 if(comparable.length<2)return;
 const delta=change(comparable[0],comparable.at(-1));trend.textContent=`Andamento ${delta.trend}: ${delta.delta>0?'+':''}${delta.delta.toFixed(1)} ${delta.unit==='%'?'punti percentuali':delta.unit}. Confronto tra risultati a impostazioni uguali, senza interpretazione clinica automatica.`;
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 700 280');svg.setAttribute('role','img');svg.setAttribute('aria-label','Andamento cronologico: '+trend.textContent);
 const values=comparable.map(r=>measurement(r).value);let min=last.unit==='%'?0:Math.min(...values),max=last.unit==='%'?100:Math.max(...values);if(max===min){max+=1;min=Math.max(0,min-1);}
 const points=values.map((v,i)=>({x:65+i*600/(values.length-1),y:220-(v-min)*170/(max-min)}));
 const line=document.createElementNS(svgNS,'polyline');line.setAttribute('points',points.map(p=>`${p.x},${p.y}`).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#087e8b');line.setAttribute('stroke-width','3');svg.append(line);
 const text=(x,y,value)=>{const el=document.createElementNS(svgNS,'text');el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('font-size','13');el.setAttribute('fill','#536d77');el.textContent=value;svg.append(el);};
 text(5,52,max.toFixed(1)+' '+last.unit);text(5,222,min.toFixed(1)+' '+last.unit);text(65,255,new Date(comparable[0].finishedAt).toLocaleDateString('it-IT'));text(575,255,new Date(comparable.at(-1).finishedAt).toLocaleDateString('it-IT'));
 points.forEach((point,i)=>{const circle=document.createElementNS(svgNS,'circle');circle.setAttribute('cx',point.x);circle.setAttribute('cy',point.y);circle.setAttribute('r','5');circle.setAttribute('fill','#087e8b');const title=document.createElementNS(svgNS,'title');title.textContent=new Date(comparable[i].finishedAt).toLocaleString('it-IT')+': '+values[i]+' '+last.unit;circle.append(title);svg.append(circle);});host.append(svg);
}
selector.onchange=draw;
function renderResults(source){
 rawResults=source;const patientId=localStorage.getItem('hub_mode')==='clinical'?document.getElementById('patient-select')?.value:null;
 const results=source.filter(r=>patientId?r.patientId===patientId:!r.patientId);
 document.querySelector('.cl-progress h2').textContent=patientId?'Andamento del paziente':'I miei progressi';
 allResults=results;document.getElementById('cl-progress-status').textContent=results.length?`${results.length} risultati salvati. I confronti distinguono esercizio e impostazioni.`:'Nessun risultato salvato. Completa un esercizio per iniziare il tuo storico.';
 const selected=selector.value;selector.replaceChildren();const groups=new Map();
 for(const result of results.filter(r=>r.status==='completed'))groups.set(groupKey(result),result);
 for(const [key,result] of groups){const option=document.createElement('option');option.value=key;option.textContent=result.title+' — '+(Object.entries(result.settings||{}).map(([k,v])=>`${k}: ${v}`).join(', ')||'impostazioni predefinite');selector.append(option);}
 selector.hidden=!groups.size;if(groups.has(selected))selector.value=selected;
 const rows=document.getElementById('cl-progress-rows');rows.replaceChildren();
 for(const result of [...results].sort((a,b)=>b.finishedAt.localeCompare(a.finishedAt)).slice(0,100)){const row=document.createElement('tr');const value=measurement(result);for(const content of [new Date(result.finishedAt).toLocaleString('it-IT'),result.title,value?`${value.value.toFixed(1)} ${value.unit}`:'Non misurato',Math.round(result.durationMs/1000)+' s',result.status==='completed'?'Completato':'Interrotto']){const cell=document.createElement('td');cell.textContent=content;row.append(cell);}rows.append(row);}draw();
}
let stops=[],presenceRef;
function unavailable(element,error){element.textContent='—';notice.hidden=false;notice.textContent=friendlyError(error);}
onAuthStateChanged(auth,async user=>{
 stops.forEach(stop=>stop());stops=[];if(presenceRef){remove(presenceRef).catch(()=>{});presenceRef=null;}
 document.getElementById('kpi-utenti').textContent='—';document.getElementById('kpi-svolti').textContent='—';document.getElementById('kpi-media-stelle').textContent='—';renderResults([]);
 if(!user){document.getElementById('cl-progress-status').textContent='Accedi per conservare e visualizzare i tuoi progressi.';return;}
 notice.hidden=true;
 const watch=(path,render,element)=>stops.push(onValue(ref(db,path),snap=>render(snap.val()),error=>unavailable(element,error)));
 watch('cognilab/presence',value=>document.getElementById('kpi-utenti').textContent=onlineCount(value),document.getElementById('kpi-utenti'));
 watch('cognilab/activity',value=>document.getElementById('kpi-svolti').textContent=completedCount(value),document.getElementById('kpi-svolti'));
 watch('cognilab/feedback',value=>{const entries=Object.values(value||{}).flatMap(v=>Object.values(v));const avg=satisfaction(entries);document.getElementById('kpi-media-stelle').textContent=avg===null?'Nessun questionario':avg.toFixed(1)+' / 5 ('+entries.length+' questionari)';},document.getElementById('kpi-media-stelle'));
 try{await ensurePrivateStorage();}catch(error){unavailable(document.getElementById('cl-progress-status'),error);return;}
 if(auth.currentUser?.uid!==user.uid)return;
 watch(`cognilab/users/${user.uid}/sessions`,value=>renderResults(Object.values(value||{}).flatMap(s=>Object.values(s.results||{}))),document.getElementById('cl-progress-status'));
 if(user.isAnonymous){notice.hidden=false;notice.textContent='Modalità ospite: crea un account per ritrovare i progressi anche su altri dispositivi.';}
 const queued=Object.keys(pending(user.uid)).length;if(queued){notice.hidden=false;notice.textContent=`${queued} risultati in attesa di sincronizzazione. Vengono ritentati automaticamente quando la connessione è disponibile.`;try{await retryPending();}catch(error){notice.textContent=friendlyError(error)+' I risultati restano nella coda locale del tuo account.';}}
});

window.CogniLabRefreshPatient=()=>{renderResults(rawResults);const select=document.getElementById('patient-select');const patientId=select.value;const report=document.getElementById('patient-report-section');report.style.display=patientId?'block':'none';document.getElementById('report-patient-name').textContent=select.options[select.selectedIndex]?.text||'';const rows=document.getElementById('history-table-body');rows.replaceChildren();for(const result of rawResults.filter(r=>r.patientId===patientId).sort((a,b)=>b.finishedAt.localeCompare(a.finishedAt))){const row=document.createElement('tr');const value=measurement(result);for(const text of [new Date(result.finishedAt).toLocaleString('it-IT'),result.title,value?value.value.toFixed(1)+' '+value.unit:'Non misurato']){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}rows.append(row);}document.getElementById('performanceChart').closest('.chart-container').hidden=true;};
