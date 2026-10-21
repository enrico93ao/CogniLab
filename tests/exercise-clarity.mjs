import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {exercises} from '../shared/exercise-catalog.mjs';
const require=createRequire(import.meta.url),{JSDOM,VirtualConsole}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function page(html){const d=new JSDOM(html,{url:'https://example.test/Stroop.html',runScripts:'outside-only',virtualConsole:new VirtualConsole()}),w=d.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};return d;}
{
 const d=page('<button onclick="startGame()">Inizia</button>'),w=d.window;w.CogniLabExercise={id:'stroop-original',title:'Stroop'};let starts=0;w.document.querySelector('button').onclick=()=>starts++;w.eval(read('shared/exercise-guidance.js'));
 assert.deepEqual([...w.CogniLabGuidance.ids].sort(),exercises.map(e=>e.id).sort());
 for(const e of exercises){w.CogniLabExercise={id:e.id};const steps=w.CogniLabGuidance.steps();assert.equal(steps.length,3);assert.ok(steps.every(s=>s.length>30&&!s.includes('undefined')),e.id);}
 w.CogniLabExercise={id:'stroop-original',title:'Stroop'};w.document.querySelector('button').click();await flush();assert.equal(starts,0);assert.match(w.document.querySelector('dialog').textContent,/parola ROSSO è scritta in blu/);assert.equal(w.document.querySelectorAll('dialog li').length,3);
 w.document.querySelector('.cl-guidance-back').click();await flush();assert.equal(starts,0);w.document.querySelector('button').click();await flush();w.document.querySelector('dialog button').click();await flush();assert.equal(starts,1);assert.equal(w.document.querySelector('dialog'),null);w.close();
}
// Acknowledging assigned instructions must not open a second free-mode dialog.
{
 const d=page('<section id="setup"><button>Inizia</button></section>'),w=d.window;let starts=0;w.document.querySelector('button').onclick=()=>starts++;w.CogniLabExercise={id:'stroop-original',title:'Stroop',setup:'setup'};w.CogniLabGymAuthorized=true;w.CogniLabPresetPending=true;w.localStorage.setItem('cognilab.lastUser','p');w.sessionStorage.setItem('cognilab.session.p',JSON.stringify({programId:'plan',programSlot:'0',programConfigurations:[{format:1,controls:[],buttons:[]}]}));w.sessionStorage.setItem('cognilab.plan.p',JSON.stringify({programId:'plan',files:['Stroop.html'],index:0}));
 w.eval(read('shared/exercise-guidance.js'));w.eval(read('shared/care-presets.js').replace(" if(document.readyState==='complete')"," window.testReady=ready; if(document.readyState==='complete')"));const ready=w.testReady();await flush();assert.equal(starts,0);w.document.querySelector('dialog button').click();await ready;assert.equal(starts,1);assert.equal(w.document.querySelector('dialog'),null);w.close();
}
// Rules shown for the dual task are exactly the rules used after starting.
{
 const d=page(read('Doppio compito e velocità.html')),w=d.window;w.AudioContext=class{constructor(){this.state='running';}resume(){return Promise.resolve();}};w.requestAnimationFrame=()=>1;w.setInterval=()=>1;let begins=0;w.CogniLabRun={begin(){begins++;}};
 for(const script of w.document.querySelectorAll('script:not([src])'))if(!script.type)w.eval(script.textContent);
 const generate=w.generateRandomRules;let calls=0;w.generateRandomRules=()=>{calls++;return generate();};const rules=w.CogniLabPrepareGuidance();assert.equal(calls,1);assert.equal(begins,0);assert.ok(rules.every(s=>s.includes('fascia verde')));w.startGame();assert.equal(calls,1);assert.equal(begins,1);const buttons=[...w.document.querySelectorAll('#controls-hint button')];assert.equal(buttons.length,rules.length);buttons.forEach((b,i)=>{const texts=[...b.querySelectorAll('span')].map(n=>n.textContent.trim());assert.ok(rules[i].includes('Premi '+texts[0]+' per: '+texts[1]+'.'));});w.close();
}
function contrast(a,b){const l=s=>s.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0),x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.ok(contrast([25,61,74],[240,247,255])>=4.5);assert.ok(contrast([23,70,110],[214,230,245])>=4.5);assert.ok(contrast([255,255,255],[8,102,109])>=4.5);
{
 const d=page(read('Inibizione e memoria di lavoro.html')),w=d.window;for(const file of ['assets/vendor/exercise-utilities-3.4.17.css','shared/inhibition-layout.css','shared/exercise-clarity.css']){const style=w.document.createElement('style');style.textContent=read(file);w.document.head.append(style);}
 const list=w.document.getElementById('special-rules-list');list.innerHTML='<li><span>È un ANIMALE</span><span>SPAZIO</span></li>';
 assert.equal(w.getComputedStyle(list.querySelector('span')).color,'rgb(25, 61, 74)');assert.equal(w.getComputedStyle(w.document.querySelector('.inhibition-stimulus')).flexDirection,'column');assert.match(w.document.getElementById('instruction-screen').textContent,/colore del bordo/);assert.match(w.document.getElementById('instruction-screen').textContent,/prima dall’alto/);w.close();
}
assert.match(read('shared/exercise-clarity.css'),/grid-area:figure/);assert.match(read('shared/exercise-clarity.css'),/grid-area:caption/);
console.log('PASS: 38 explicit guides; free start waits for acknowledgement; cancellation; assigned start without duplicate dialog; rule text contrast >=4.5:1 and caption column. DOM/CSS simulation, not physical-device layout.');
