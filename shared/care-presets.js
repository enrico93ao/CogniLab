(() => {
 'use strict';
 const preview=new URLSearchParams(location.search).has('configure');
 const panels=()=>String(window.CogniLabExercise?.setup||'').split(',').map(id=>document.getElementById(id.trim())).filter(Boolean);
 const controls=panel=>[...panel.querySelectorAll('input,select')].filter(c=>c.dataset.uiProxy!=='true'&&!['password','text','email','file','hidden','submit','button'].includes(c.type));
 const selected=b=>b.matches('.selected,.active,.selected-mode,[aria-pressed="true"],.border-indigo-500,.border-blue-500');
 const safeButton=b=>!b.disabled&&!/avvia|inizia|start|salva|esci|termina|menu|home|riprendi|pausa|conferma/i.test(b.textContent);
 const clicked=new Map();
 const group=b=>{const handler=b.getAttribute('onclick')||'';const match=handler.match(/^\s*([\w.]+)\s*\(/);return match?match[1]+(handler.match(/\(\s*(['"])(.*?)\1\s*,/)?.[2]||''):(b.className.match(/\b[\w-]+-(?:btn|option)\b/)?.[0]||b.parentElement?.id||b.parentElement?.className||'options');};
 if(preview)document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||!safeButton(b))return;const panel=panels().find(p=>p.contains(b));if(panel)clicked.set(panel.id+'|'+group(b),{panel:panel.id,index:[...panel.querySelectorAll('button')].indexOf(b),label:b.textContent.trim()});},true);
 const capture=()=>({format:1,controls:panels().flatMap(panel=>controls(panel).map((c,index)=>({panel:panel.id,index,key:c.id||c.name||c.type,type:c.type,value:c.value,checked:c.checked===true}))),buttons:[...clicked.values(),...panels().flatMap(panel=>[...panel.querySelectorAll('button')].flatMap((b,index)=>selected(b)&&safeButton(b)&&!clicked.has(panel.id+'|'+group(b))?[{panel:panel.id,index,label:b.textContent.trim()}]:[]))]});
 function apply(config){
  if(!config||config.format!==1||!Array.isArray(config.controls))throw Error('Configurazione non valida');
  const allowed=new Map(panels().map(p=>[p.id,p]));
  for(const item of config.buttons||[]){const panel=allowed.get(item.panel),b=panel?.querySelectorAll('button')[item.index];if(!b||!safeButton(b)||(item.label&&item.label!==b.textContent.trim()))throw Error('Le opzioni del menu sono cambiate: aggiorna la configurazione.');if(!selected(b))b.click();}
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
 function ready(){
  if(preview){document.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();},true);document.addEventListener('click',event=>{const b=event.target.closest('button');if(b&&/avvia|inizia|start/i.test(b.textContent)){event.preventDefault();event.stopImmediatePropagation();}},true);parent.postMessage({type:'cognilab-config-ready'},location.origin);return;}
  try{
   const uid=localStorage.getItem('cognilab.lastUser');if(!uid)return;
   const session=JSON.parse(sessionStorage.getItem('cognilab.session.'+uid)||'null');
   const plan=JSON.parse(sessionStorage.getItem('cognilab.plan.'+uid)||'null');
   if(!session?.programId||plan?.programId!==session.programId||decodeURIComponent(location.pathname.split('/').pop())!==plan.files?.[plan.index])return;
   const config=session.programConfigurations?.[Number(session.programSlot)];if(!config)return;
   apply(typeof config==='string'?JSON.parse(config):config);window.CogniLabPresetPending=false;
   const notice=document.createElement('p');notice.className='cl-notice';notice.setAttribute('role','status');notice.textContent='Impostazioni predisposte dal professionista'+(session.scheduledDate?' · Sessione del '+session.scheduledDate.split('-').reverse().join('/'):'')+'.';panels()[0]?.prepend(notice);
  }catch(error){const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent='Configurazione assegnata non applicata: '+error.message;document.body.prepend(notice);document.addEventListener('click',e=>{if(e.target.closest('button')&&/avvia|inizia|start/i.test(e.target.closest('button').textContent)){e.preventDefault();e.stopImmediatePropagation();}},true);}
 }
 if(document.readyState==='complete')setTimeout(ready,0);else window.addEventListener('load',()=>setTimeout(ready,0),{once:true});
})();
