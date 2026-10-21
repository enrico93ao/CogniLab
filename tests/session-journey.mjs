import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {programProgress} from '../shared/care-model.mjs';
import {exerciseById} from '../shared/exercise-catalog.mjs';
import {groupKey} from '../shared/progress-model.mjs';
import {summarizeResults} from '../shared/care-model.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
function dom(html){const d=new JSDOM(html,{url:'https://example.test/esercizio.html?file=Stroop.html',runScripts:'outside-only'}),w=d.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};return d;}
// Only a saved, successfully shared result may unlock progression. The final
// screen obtains its date from the saved program, without making one up.
{
 const d=dom('<div class="cl-exercise-heading"></div><iframe id="exercise-frame"></iframe>'),w=d.window;
 const plan={programId:'p',files:['Stroop.html'],index:0,completedSlots:[]};w.localStorage.setItem('hub_mode','free_training');w.sessionStorage.setItem('cognilab.plan.patient',JSON.stringify(plan));
 let saved=false,finished=0;Object.assign(w,{auth:{currentUser:{uid:'patient'}},authReady:Promise.resolve(),friendlyError:()=> 'Errore',requireProfessional:async()=>{},programProgress,saveResult:async()=>{if(!saved)throw Error('offline');return {sharingState:'saved'};},finishSession:async()=>{finished++;},patientWorkspace:async()=>({programs:[{id:'p',exercises:['stroop-original'],totalSessions:2,schedule:['2026-10-20','2026-10-23'],sessions:{one:{results:{r:{status:'completed',exerciseId:'stroop-original',programSlot:'0'}}}}}]})});
 await w.eval('(async()=>{'+strip(read('shared/shell-account.js'))+'})()');
 const result={id:'r',status:'completed'},send=()=>w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:w.document.querySelector('iframe').contentWindow,data:{type:'cognilab-result-v3',result}}));
 send();await flush();assert.ok(w.document.querySelector('dialog').open);assert.match(w.document.querySelector('dialog').textContent,/Riprova il salvataggio/);assert.ok(w.document.querySelector('iframe').hasAttribute('inert'));saved=true;send();await flush();
 const dialog=w.document.querySelector('dialog');assert.ok(dialog.open);assert.match(dialog.textContent,/Hai completato tutti gli esercizi/);assert.equal(dialog.querySelector('progress').value,1);
 dialog.querySelector('button').click();await flush();assert.equal(finished,1);assert.match(w.document.querySelector('dialog').textContent,/23 ottobre 2026/);assert.match(w.document.querySelector('dialog').textContent,/Ben fatto/);w.close();
}
// Assigned inhibition creates the actual rules and shows its own instructions,
// rather than jumping directly into an uninitialized game.
{
 const d=dom(read('Inibizione e memoria di lavoro.html')),w=d.window;w.history.replaceState(null,'','/Inibizione%20e%20memoria%20di%20lavoro.html');
 w.AudioContext=class{constructor(){this.state='running';}resume(){return Promise.resolve();}};w.CogniLabRun={begin(){throw Error('Must not begin before patient reads instructions');}};
 for(const script of w.document.querySelectorAll('script:not([src])'))if(!script.type)w.eval(script.textContent);
 w.document.querySelector('[onclick="generateRulesAndShow()"]').onclick=()=>w.generateRulesAndShow();
 w.CogniLabGymAuthorized=true;w.CogniLabPresetPending=true;w.localStorage.setItem('cognilab.lastUser','patient');
 w.sessionStorage.setItem('cognilab.session.patient',JSON.stringify({programId:'p',programSlot:0,programConfigurations:[{format:1,controls:[],buttons:[]}]}));w.sessionStorage.setItem('cognilab.plan.patient',JSON.stringify({programId:'p',files:['Inibizione e memoria di lavoro.html'],index:0}));
 w.eval(read('shared/care-presets.js').replace(" if(document.readyState==='complete')"," window.testReady=ready; if(document.readyState==='complete')"));await w.testReady();
 assert.ok(w.document.getElementById('instruction-screen').classList.contains('active'));assert.ok(!w.document.getElementById('menu-screen').classList.contains('active'));assert.ok(w.document.querySelectorAll('#special-rules-list li').length>0);assert.ok(!w.document.getElementById('game-screen').classList.contains('active'));w.close();
}
// Other assigned exercises wait on instructions, not a configuration menu.
{
 const d=dom('<section id="setup"><p>Osserva il colore e scegli la risposta indicata dalla consegna.</p><button>Avvia</button></section>'),w=d.window;w.history.replaceState(null,'','/Stroop.html');let starts=0;w.document.querySelector('button').onclick=()=>starts++;
 w.CogniLabExercise={setup:'setup',title:'Stroop'};w.CogniLabGymAuthorized=true;w.CogniLabPresetPending=true;w.document.documentElement.classList.add('assigned-preparing');w.localStorage.setItem('cognilab.lastUser','patient');
 w.sessionStorage.setItem('cognilab.session.patient',JSON.stringify({programId:'p',programSlot:0,programConfigurations:[{format:1,controls:[],buttons:[]}]}));w.sessionStorage.setItem('cognilab.plan.patient',JSON.stringify({programId:'p',files:['Stroop.html'],index:0}));
 w.eval(read('shared/care-presets.js').replace(" if(document.readyState==='complete')"," window.testReady=ready; if(document.readyState==='complete')"));const ready=w.testReady();await flush();assert.equal(starts,0);assert.ok(w.document.querySelector('.cl-assigned-instructions').open);assert.match(w.document.querySelector('.cl-assigned-consegna').textContent,/Osserva il colore/);w.document.querySelector('.cl-assigned-instructions button').click();await ready;assert.equal(starts,1);assert.equal(w.document.documentElement.classList.contains('assigned-preparing'),false);w.close();
}
// The main chart is visible without opening details. No line combines
// incompatible configurations, and one result never fabricates a trend.
{
 const d=dom('<section id="host"></section>'),w=d.window;Object.assign(w,{exerciseById,groupKey,summarizeResults});w.eval(strip(read('shared/progress-view.js')));const host=w.document.getElementById('host'),view=w.createProgressView(host);
 const row=(id,value,settings={level:1})=>({id,exerciseId:'stroop-original',title:'Stroop',status:'completed',sessionId:id,settings,finishedAt:`2026-10-${id}T12:00:00Z`,durationMs:60000,metrics:{accuracyPct:value}});
 view.render([row('20',60)]);assert.equal(host.querySelectorAll('.care-area-spark').length,0);
 view.render([row('20',60),row('21',80),row('22',10,{level:2})]);assert.equal(host.querySelectorAll('.care-area-spark').length,1);assert.match(host.querySelector('.care-area-delta').textContent,/20 punti/);assert.equal(host.querySelector('.care-chart').closest('details'),null);w.close();
}
console.log('PASS: saved-result progression, central completion with actual next date, assigned inhibition rules and instructions, visible configuration-safe progress charts. DOM simulation; no live data.');
