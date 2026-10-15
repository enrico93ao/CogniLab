import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pages=['Attenzione alternata.html','Esplorazione visuospaziale multilivello.html','Orientamento temporale-spaziale.html','Memoria visuospaziale il Giardino.html','Il pianoforte.html','Lista della spesa.html','Cancellazione di H.html','Riconoscimento visivo base.html',"Trova l'immagine corrispondente.html"];
for(const file of pages){
 const dom=new JSDOM(read(file),{runScripts:'outside-only'}),w=dom.window;
 w.eval(read('shared/menu-controls.js'));
 const metadata=[...w.document.querySelectorAll('script:not([src])')].find(script=>script.textContent.includes('window.CogniLabExercise='));
 if(metadata)w.eval(metadata.textContent);
 const selects=[...w.document.querySelectorAll('select[data-menu-enhanced]')];
 for(const select of selects){
  assert.equal(select.hidden,true);const group=select.closest('fieldset');assert.ok(group.querySelector('legend').textContent.trim());
  const radios=[...group.querySelectorAll('input[type=radio]')];assert.equal(radios.length,select.options.length);assert.equal(radios.find(input=>input.checked).value,select.value);
  let changes=0;select.addEventListener('change',()=>changes++);
  if(!select.disabled&&radios.length>1){radios.at(-1).click();assert.equal(select.value,radios.at(-1).value);assert.equal(changes,1);}
  select.disabled=true;await Promise.resolve();assert.ok(radios.every(input=>input.disabled));
 }
 assert.ok(read(file).includes('shared/menu-controls.js?v=controls6'));
 if(file==='Orientamento temporale-spaziale.html')assert.equal(w.document.querySelector('#orientation-level-settings select').id,'orientation-level');
 if(file==='Attenzione alternata.html')assert.equal(w.document.querySelectorAll('input[name=trail-kind]').length,8);
 const runtime=read('shared/exercise-runtime.js');const start=runtime.indexOf('const settings=()=>'),end=runtime.indexOf(' const makeResult=',start);
 w.eval(runtime.slice(start,end)+';window.qaSettings=settings();');
 assert.ok(!Object.keys(w.qaSettings).some(key=>key.startsWith('menu-')),'UI proxies leaked into saved settings: '+file);
 w.close();
}
console.log('PASS: native radio options synchronize with exercise settings on nine menus; disabled options stay disabled; orientation settings container preserved; eight trail choices.');
