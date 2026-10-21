import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
import {programProgress,resultsFromCare,summarizeResults} from '../shared/care-model.mjs';import {exerciseById,exercises} from '../shared/exercise-catalog.mjs';import {groupKey} from '../shared/progress-model.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom'),read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
const source=read('shared/care-dashboard.js').replace(/^import .*;\s*$/gm,'');
function page(mode){const dom=new JSDOM('<section id="care-workspace"></section>',{url:'https://example.test/',runScripts:'outside-only'}),w=dom.window;w.localStorage.setItem('hub_mode',mode);w.confirm=()=>true;w.HTMLDialogElement.prototype.showModal=function(){};Object.assign(w,{feedbackManagerUid:"eWoQhl1qwqVKRupDabTM6vfMyyI3",mountFeedbackSummary:()=>{},programProgress,resultsFromCare,summarizeResults,exerciseById,exercises,groupKey,careError:e=>e.message,onAuthStateChanged:()=>()=>{},pendingCare:()=>({}),retryPending:async()=>{},checkCareStorage:async()=>{},requireProfessional:async()=>({uid:'pro'}),auth:{currentUser:{uid:mode==='clinical'?'pro':'patient'}}});w.currentCareUser=async()=>w.auth.currentUser;w.eval(read('shared/progress-view.js').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''));return {dom,w};}
{
 const {w}=page('clinical');let assigned;
 w.professionalPatients=async()=>({patient:{name:'Test'}});w.professionalPatient=async()=>({accepted:true,programs:[]});w.assignProgram=async(uid,input)=>{assigned=input;};
 await w.eval('(async()=>{'+source+'})()');const select=w.document.getElementById('care-patient-select');select.value='patient';select.dispatchEvent(new w.Event('change'));await flush();
 const check=w.document.querySelector('[data-exercise-id="attenzione-alternata"]');check.checked=true;check.dispatchEvent(new w.Event('change'));
 const entries=()=>[...w.document.querySelectorAll('.care-order li')],click=(row,text)=>[...row.querySelectorAll('button')].find(b=>b.textContent===text).click();
 const configure=(row,value)=>{click(row,[...row.querySelectorAll('button')].find(b=>/Configur/.test(b.textContent)).textContent);const frame=w.document.querySelector('dialog iframe');w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data:{type:'cognilab-config',configuration:{format:1,controls:[{panel:'setup',index:0,value}],buttons:[]}}}));};
 configure(entries()[0],'base');click(entries()[0],'Aggiungi variante');assert.equal(entries().length,2);configure(entries()[1],'advanced');
 let repeat=entries()[1].querySelector('input');repeat.value='2';repeat.dispatchEvent(new w.Event('change'));
 entries()[1].querySelector('[aria-label^="Sposta prima"]').click();
 click(entries()[0],'Aggiungi variante');assert.equal(entries().length,3);click(entries()[1],'×');assert.equal(entries().length,2);assert.equal(check.checked,true);
 const f=w.document.querySelector('.care-builder form');f.elements.title.value='Varianti';f.elements.sessions.value='1';f.elements.sessions.dispatchEvent(new w.Event('input'));const date=f.querySelector('input[type=date]');date.value='2026-11-01';date.dispatchEvent(new w.Event('input'));f.dispatchEvent(new w.Event('submit',{cancelable:true}));await flush();
 assert.deepEqual(Array.from(assigned.exercises),['attenzione-alternata','attenzione-alternata','attenzione-alternata']);assert.deepEqual(Array.from(assigned.configurations,c=>JSON.parse(c).controls[0].value),['advanced','advanced','base']);w.close();
}
const {validateProgram,sessionProgress}=await import('../shared/care-model.mjs');
const config=value=>JSON.stringify({format:1,controls:[{value}],buttons:[]});const plan=validateProgram({name:'Varianti',totalSessions:1,exercises:['attenzione-alternata','attenzione-alternata'],configurations:[config('base'),config('advanced')]});
assert.equal(sessionProgress(plan,{results:{one:{status:'completed',exerciseId:'attenzione-alternata',programSlot:'0'}}}).nextSlot,1);
assert.equal(sessionProgress(plan,{results:{one:{status:'completed',exerciseId:'attenzione-alternata',programSlot:'0'},two:{status:'completed',exerciseId:'attenzione-alternata',programSlot:'1'}}}).complete,true);
console.log('PASS: independent duplicate configurations survive reorder, repeats and removal; assignment and completion remain slot-based. DOM simulation, no patient data written.');
