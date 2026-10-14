(() => {
 'use strict';let active=null,finished=false,lastResult=null,savePromise=Promise.resolve(),saveResolver=null;let retryButton;
 const focusStyle=document.createElement('link');focusStyle.rel='stylesheet';focusStyle.href='shared/exercise-focus.css';document.head.append(focusStyle);
 const lifecycle=running=>{document.body.classList.toggle('cl-task-running',running);if(parent!==window)parent.postMessage({type:'cognilab-exercise-state',running},location.origin);};
 const status=document.createElement('p');status.className='cl-save-status';status.setAttribute('role','status');status.hidden=true;
 const mount=()=>{const host=document.getElementById('cl-exercise-save-status');if(host){host.append(status);}else document.body.append(status);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 const settings=()=>{const result={};const ids=(window.CogniLabExercise?.setup||'').split(',');
 for(const id of ids){const panel=document.getElementById(id);if(!panel)continue;
 for(const input of panel.querySelectorAll('input,select')){if(['password','text','email'].includes(input.type))continue;if(input.type==='radio'&&!input.checked)continue;const key=input.id||input.name;if(key)result[key]=input.type==='checkbox'?input.checked:input.value;}
 for(const button of panel.querySelectorAll('button.selected,button.active,button.selected-mode,button[aria-pressed="true"],button.border-indigo-500,button.border-blue-500'))if(button.id)result[button.id]=true;
 }return result;};
 const makeResult=(metrics={},state='completed')=>{const meta=window.CogniLabExercise;if(!active||!meta||finished)return null;finished=true;lifecycle(false);const finishedAt=new Date().toISOString();return {schemaVersion:3,id:active.id,exerciseId:meta.id,title:meta.title,category:meta.category,exerciseVersion:meta.version||'3.0.0',startedAt:active.startedAt,finishedAt,durationMs:Math.max(0,Date.now()-active.start),settings:active.settings,status:state,metrics};};
 const send=result=>{
 if(!result)return savePromise;
 lastResult=result;status.hidden=false;status.textContent='Salvataggio nella sessione…';
 if(retryButton)retryButton.hidden=true;
 if(window.parent!==window){
  savePromise=new Promise(resolve=>{const timeout=setTimeout(()=>{if(saveResolver){status.textContent='La sincronizzazione sta richiedendo più tempo. Torna alla palestra per verificare la sessione e ritentare i risultati in coda.';showRetry();saveResolver=null;resolve(false);}},15000);saveResolver=ok=>{clearTimeout(timeout);resolve(ok);};});
  window.parent.postMessage({type:'cognilab-result-v3',result},location.origin);
 }else{
  savePromise=import('./progress-store.js').then(module=>Promise.race([module.saveResult(result),new Promise((_,reject)=>setTimeout(()=>reject({code:'sync-pending'}),15000))])).then(()=>{status.textContent='Risultato salvato nella sessione e sincronizzato con il tuo account.';return true;}).catch(async error=>{const module=await import('./firebase-client.js');status.textContent=module.friendlyError(error);showRetry();return false;});
 }
 return savePromise;
 };
 function showRetry(){if(!retryButton){retryButton=document.createElement('button');retryButton.className='btn';retryButton.textContent='Riprova il salvataggio';retryButton.onclick=()=>send(lastResult);status.after(retryButton);}retryButton.hidden=false;}

 window.CogniLabRun={begin(argument){if(active&&!finished)return;const start=Date.now();const config=settings();if(window.CogniLabExercise?.stimulusVersion)config.stimulusVersion=window.CogniLabExercise.stimulusVersion;if(['number','string','boolean'].includes(typeof argument))config.modalita=argument;active={id:crypto.randomUUID(),start,startedAt:new Date(start).toISOString(),settings:config};finished=false;lifecycle(true);status.hidden=true;if(retryButton)retryButton.hidden=true;},measure(callback){try{const value=callback();return typeof value==='number'&&Number.isFinite(value)?value:typeof value==='string'?value:null;}catch{return null;}},complete(metrics){return send(makeResult(metrics));},waitForSave(){return savePromise;},abort(){return makeResult({},'interrupted');}};
 document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!/salva.*(Firebase|Dati)|save.*(Firebase|Database)/i.test(button.getAttribute('onclick')||''))return;event.preventDefault();event.stopImmediatePropagation();if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);else location.href='esercizi.html';},true);
 window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='cognilab-save-status')return;status.hidden=false;if(event.data.id&&event.data.id!==lastResult?.id)return;status.textContent=event.data.message;if(event.data.ok===false)showRetry();if(saveResolver){saveResolver(event.data.ok!==false);saveResolver=null;}});
})();
