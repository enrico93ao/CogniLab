(() => {
 'use strict';
 const preview=new URLSearchParams(location.search).has('configure');
 const panels=()=>String(window.CogniLabExercise?.setup||'').split(',').map(id=>document.getElementById(id.trim())).filter(Boolean);
 const controls=panel=>[...panel.querySelectorAll('input,select')].filter(c=>c.dataset.uiProxy!=='true'&&!['password','text','email','file','hidden','submit','button'].includes(c.type));
 const selected=b=>b.matches('.selected,.active,.selected-mode,[aria-pressed="true"],.border-indigo-500,.border-blue-500');
 const safeButton=b=>!b.disabled&&!/avvia|inizia|start|salva|esci|termina|menu|home|riprendi|pausa|conferma/i.test(b.textContent);
 const clicked=new Map();let prescribedStart=null;
 const isStart=b=>/\b(avvia|inizia|start|comincia)\b/i.test(b.textContent)||/^(?:window\.)?(?:startGame|startExercise|initGame|initSession|setupAndStart|selectDifficulty)\s*\(/.test(b.getAttribute('onclick')||'');
 const describe=b=>({index:[...document.querySelectorAll('button')].indexOf(b),label:b.textContent.trim(),handler:b.getAttribute('onclick')||''});
 function findStart(config){
  if(config?.start){const b=document.querySelectorAll('button')[config.start.index];if(!b||!isStart(b)||b.textContent.trim()!==config.start.label||(b.getAttribute('onclick')||'')!==config.start.handler)throw Error('Il comando di avvio è cambiato.');return b;}
  const roots=panels(),all=[...document.querySelectorAll('button')].filter(b=>isStart(b)&&!b.disabled&&!b.closest('[hidden],.hidden'));
  const local=all.filter(b=>roots.some(p=>p.contains(b)));const list=local.length?local:all;
  if(list.length!==1)throw Error('Il professionista deve selezionare il livello di avvio e salvare nuovamente la configurazione.');
  return list[0];
 }
 if(preview)document.addEventListener('click',event=>{const b=event.target.closest('button');if(b&&isStart(b)){prescribedStart=describe(b);event.preventDefault();event.stopImmediatePropagation();}},true);
 const group=b=>{const handler=b.getAttribute('onclick')||'';const match=handler.match(/^\s*([\w.]+)\s*\(/);return match?match[1]+(handler.match(/\(\s*(['"])(.*?)\1\s*,/)?.[2]||''):(b.className.match(/\b[\w-]+-(?:btn|option)\b/)?.[0]||b.parentElement?.id||b.parentElement?.className||'options');};
 if(preview)document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||!safeButton(b))return;const panel=panels().find(p=>p.contains(b));if(panel)clicked.set(panel.id+'|'+group(b),{panel:panel.id,index:[...panel.querySelectorAll('button')].indexOf(b),label:b.textContent.trim()});},true);
 const capture=()=>({format:1,...(prescribedStart?{start:prescribedStart}:{}),controls:panels().flatMap(panel=>controls(panel).map((c,index)=>({panel:panel.id,index,key:c.id||c.name||c.type,type:c.type,value:c.value,checked:c.checked===true}))),buttons:[...clicked.values(),...panels().flatMap(panel=>[...panel.querySelectorAll('button')].flatMap((b,index)=>selected(b)&&safeButton(b)&&!clicked.has(panel.id+'|'+group(b))?[{panel:panel.id,index,label:b.textContent.trim()}]:[]))]});
 function apply(config){
  if(!config||config.format!==1||!Array.isArray(config.controls))throw Error('Configurazione non valida');
  if(preview&&config.start)prescribedStart=config.start;
  const allowed=new Map(panels().map(p=>[p.id,p]));
  for(const item of config.buttons||[]){const panel=allowed.get(item.panel),b=panel?.querySelectorAll('button')[item.index];if(!b||!safeButton(b)||(item.label&&item.label!==b.textContent.trim()))throw Error('Le opzioni del menu sono cambiate: aggiorna la configurazione.');if(isStart(b))continue;if(!selected(b))b.click();}
  for(const item of config.controls){const panel=allowed.get(item.panel),c=panel&&controls(panel)[item.index];if(!c||(item.key&&item.key!==(c.id||c.name||c.type)))throw Error('Il menu è cambiato: chiedi al professionista di aggiornare la configurazione.');
   if(c.tagName==='SELECT'&&![...c.options].some(o=>o.value===String(item.value)))throw Error('Opzione non più disponibile');
   if(['checkbox','radio'].includes(c.type)){const desired=item.checked===true;if(c.checked!==desired&&(c.type==='checkbox'||desired))c.click();c.checked=desired;}else c.value=String(item.value);
   if(c.type!=='radio'||c.checked){c.dispatchEvent(new Event('input',{bubbles:true}));c.dispatchEvent(new Event('change',{bubbles:true}));}
  }
 }
 window.CogniLabConfiguration={capture,apply};
 window.addEventListener('message',event=>{
  if(!preview||event.origin!==location.origin||event.source!==parent)return;
  if(event.data?.type==='cognilab-capture-config')parent.postMessage({type:'cognilab-config',configuration:capture()},location.origin);
  if(event.data?.type==='cognilab-apply-config')try{apply(event.data.configuration);}catch{/* Preview remains editable if an older menu changed. */}
 });
 async function ready(){
  if(preview){document.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();},true);document.addEventListener('click',event=>{const b=event.target.closest('button');if(b&&/avvia|inizia|start/i.test(b.textContent)){event.preventDefault();event.stopImmediatePropagation();}},true);parent.postMessage({type:'cognilab-config-ready'},location.origin);return;}
  try{
   const uid=localStorage.getItem('cognilab.lastUser');if(!uid)return;
   const session=JSON.parse(sessionStorage.getItem('cognilab.session.'+uid)||'null');
   const plan=JSON.parse(sessionStorage.getItem('cognilab.plan.'+uid)||'null');
   if(!session?.programId||plan?.programId!==session.programId||decodeURIComponent(location.pathname.split('/').pop())!==plan.files?.[plan.index])return;
   const config=session.programConfigurations?.[Number(session.programSlot)];if(!config)throw Error('Manca la configurazione assegnata.');
   const parsed=typeof config==='string'?JSON.parse(config):config;
   apply(parsed);
   const start=findStart(parsed);
   for(let attempt=0;window.CogniLabGymAuthorized!==true&&attempt<150;attempt++)await new Promise(resolve=>setTimeout(resolve,100));
   if(window.CogniLabGymAuthorized!==true)throw Error('Accesso non verificato: torna alla palestra e riprova.');
   window.CogniLabPresetPending=false;
   // Prepare the actual random rules, then let the patient read the native
   // instruction screen. Starting directly would skip both rules and guidance.
   if(window.CogniLabExercise?.assignedPreparation==='inhibition-rules'){
    const prepare=document.querySelector('[onclick="generateRulesAndShow()"]');
    if(!prepare)throw Error('Consegna non disponibile.');
    prepare.click();document.documentElement.classList.remove('assigned-preparing');return;
   }
   const accepted=await showAssignedInstructions();if(accepted===false){location.href='esercizi.html';return;}
   document.documentElement.classList.remove('assigned-preparing');window.CogniLabAssignedStarting=true;try{start.click();}finally{window.CogniLabAssignedStarting=false;}

  }catch(error){const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent='Configurazione assegnata non applicata: '+error.message;notice.dataset.assignedVisible='true';document.body.prepend(notice);const back=document.createElement('a');back.href='esercizi.html';back.textContent='Torna alla palestra';back.dataset.assignedVisible='true';document.body.prepend(back);document.addEventListener('click',e=>{if(e.target.closest('button')&&/avvia|inizia|start/i.test(e.target.closest('button').textContent)){e.preventDefault();e.stopImmediatePropagation();}},true);}
 }
 function showAssignedInstructions(){
  if(window.CogniLabGuidance)return window.CogniLabGuidance.show();
  return new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.dataset.assignedVisible='true';dialog.className='cl-assigned-instructions';
   const heading=document.createElement('h1');heading.textContent=window.CogniLabExercise?.title||'Il prossimo esercizio';
   const intro=document.createElement('p');intro.textContent='Le impostazioni sono già pronte. Leggi la consegna e inizia quando ti senti pronto.';
   const instruction=document.createElement('p');instruction.className='cl-assigned-consegna';
   const copy=panels().flatMap(panel=>[...panel.querySelectorAll('p')]).map(n=>n.textContent.trim()).filter(t=>t.length>35&&!/configura|imposta|durata sessione|numero di prove/i.test(t)).slice(0,3).join(' ');
   instruction.textContent=window.CogniLabAssist?.instruction?.()||window.CogniLabExercise?.instructions||copy||'Segui la consegna mostrata nell’area di gioco. Procedi con calma, una risposta alla volta.';
   const go=document.createElement('button');go.type='button';go.textContent='Ho capito, inizia';go.onclick=()=>{dialog.close();dialog.remove();resolve();};
   const back=document.createElement('a');back.href='esercizi.html';back.textContent='Torna alla palestra';
   dialog.append(heading,intro,instruction,go,back);document.body.append(dialog);dialog.addEventListener('cancel',e=>e.preventDefault());dialog.showModal();
  });
 }
 if(document.readyState==='complete')setTimeout(ready,0);else window.addEventListener('load',()=>setTimeout(ready,0),{once:true});
})();
