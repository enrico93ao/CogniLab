import {auth,authReady} from './firebase-client.js';
import {currentSessionResults} from './session-journal.js';
import {measurement} from './progress-model.mjs';
await authReady;
const host=document.getElementById('cl-current-session')||document.querySelector('.stats-row');
function render(){if(host){
 const results=auth.currentUser?currentSessionResults(auth.currentUser.uid).filter(result=>result.status==='completed'):[];
 if(document.getElementById('res-count')){
  host.querySelectorAll('[data-session-result]').forEach(row=>row.remove());
  document.getElementById('res-count').textContent=results.length;
  const percentages=results.map(measurement).filter(value=>value?.unit==='%');
  document.getElementById('res-score').textContent=percentages.length?Math.round(percentages.reduce((sum,item)=>sum+item.value,0)/percentages.length)+'%':'—';
 }
 if(document.getElementById('cl-current-session')){
  host.replaceChildren();const title=document.createElement('h2');title.textContent='La sessione corrente';host.append(title);
  const subtitle=document.createElement('p');subtitle.textContent=results.length?results.length+' esercizi completati in questa sessione.':'Completa un esercizio per vedere qui il risultato della sessione.';host.append(subtitle);
 }
 for(const result of results){const row=document.createElement('p');row.dataset.sessionResult='true';const value=measurement(result);row.textContent=result.title+' · '+(value?value.value+' '+value.unit:'Completato')+' · '+(result.syncState==='saved'?'Sincronizzato':result.syncState==='memory'?'Solo in questa pagina: non chiudere, riprova la sincronizzazione':'Salvato su questo dispositivo, sincronizzazione in attesa');host.append(row);}
}}
render();
window.addEventListener('cognilab-session-change',render);
