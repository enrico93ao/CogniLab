(() => {
 'use strict';let active=null,finished=false;
 const status=document.createElement('p');status.className='cl-save-status';status.setAttribute('role','status');status.hidden=true;
 document.addEventListener('DOMContentLoaded',()=>document.body.append(status));
 const settings=()=>{const result={};const ids=(window.CogniLabExercise?.setup||'').split(',');
 for(const id of ids){const panel=document.getElementById(id);if(!panel)continue;
 for(const input of panel.querySelectorAll('input,select')){if(['password','text','email'].includes(input.type))continue;if(input.type==='radio'&&!input.checked)continue;const key=input.id||input.name;if(key)result[key]=input.type==='checkbox'?input.checked:input.value;}
 for(const button of panel.querySelectorAll('button.selected,button.active,button[aria-pressed="true"],button.border-indigo-500,button.border-blue-500'))if(button.id)result[button.id]=true;
 }return result;};
 const makeResult=(metrics={},state='completed')=>{const meta=window.CogniLabExercise;if(!active||!meta||finished)return null;finished=true;const finishedAt=new Date().toISOString();return {schemaVersion:3,id:active.id,exerciseId:meta.id,title:meta.title,category:meta.category,exerciseVersion:'3.0.0',startedAt:active.startedAt,finishedAt,durationMs:Math.max(0,Date.now()-active.start),settings:active.settings,status:state,metrics};};
 const send=result=>{if(!result)return;status.hidden=false;status.textContent='Salvataggio del risultato…';
 if(window.parent!==window){window.parent.postMessage({type:'cognilab-result-v3',result},location.origin);}
 else import('./progress-store.js').then(module=>module.saveResult(result)).then(()=>{status.textContent='Risultato salvato nel tuo account.';}).catch(error=>{status.textContent=error.code==='login-required'?'Accedi dalla palestra per salvare i risultati nel tuo account.':'Invio non riuscito: il risultato resta nella coda locale del tuo account. Riprova dalla palestra.';});
 };
 window.CogniLabRun={begin(argument){if(active&&!finished)return;const start=Date.now();const config=settings();if(['number','string','boolean'].includes(typeof argument))config.modalita=argument;active={id:crypto.randomUUID(),start,startedAt:new Date(start).toISOString(),settings:config};finished=false;status.hidden=true;},measure(callback){try{const value=callback();return typeof value==='number'&&Number.isFinite(value)?value:typeof value==='string'?value:null;}catch{return null;}},complete(metrics){send(makeResult(metrics));},abort(){return makeResult({},'interrupted');}};
 document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!/salva.*(Firebase|Dati)|save.*(Firebase|Database)/i.test(button.getAttribute('onclick')||''))return;event.preventDefault();event.stopImmediatePropagation();if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);else location.href='esercizi.html';},true);
 window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='cognilab-save-status')return;status.hidden=false;status.textContent=event.data.message;});
})();
