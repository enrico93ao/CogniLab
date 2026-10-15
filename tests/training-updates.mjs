import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import * as model from '../shared/training-model.mjs';
const require=createRequire(import.meta.url);
const {JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
assert.deepEqual(model.trailSequence('letters'),model.LETTERS);
assert.equal(model.trailSequence('letters',true).join(''),'PONMLKJIHGFEDCBA');
assert.deepEqual(model.trailSequence('numbers',true),Array.from({length:20},(_,i)=>String(20-i)));
assert.deepEqual(model.trailSequence('alpha',false,['A','B']),['1','A','2','B']);
assert.equal(model.nextTarget('circle',()=>.9),'circle');
let rng=[.1,.99];assert.equal(model.nextTarget('circle',()=>rng.shift()),'triangle');
rng=[.1,0];assert.equal(model.nextTarget('circle',()=>rng.shift()),'square');
for(const [date,name] of [[new Date(2026,0,1),'inverno'],[new Date(2026,2,1),'primavera'],[new Date(2026,5,1),'estate'],[new Date(2026,8,1),'autunno']])assert.equal(model.season(date),name);
assert.equal(model.nextSeason(new Date(2026,9,15)).days,47);
assert.equal(model.nextSeason(new Date(2028,1,28)).days,2);
assert.equal(model.nextSeason(new Date(2026,11,31)).days,60);
assert.equal(model.nextSeason(new Date(2026,2,1)).name,'estate');
assert.equal(model.temporalTasks('base',new Date()).length,2);
assert.equal(model.temporalTasks('super-easy',new Date()).length,0);
const tasks=model.temporalTasks('advanced',new Date(2026,9,15));
assert.deepEqual(tasks[2].answer,['gennaio','marzo','maggio','luglio','settembre','novembre']);
for(let i=0;i<15;i++)assert.ok(model.cellFrequency(i+1)>model.cellFrequency(i));
for(const length of [1,2,8,32]){const m=model.melody(length);assert.equal(m.length,length);assert.ok(m.every(n=>Number.isInteger(n)&&n>=0&&n<8));}
assert.deepEqual(model.extendMelody([2,3,4],8,()=>0),[2,3,4,2]);
function page(file){const dom=new JSDOM(read(file),{url:'https://example.test/CogniLab/'+encodeURIComponent(file),runScripts:'outside-only'});const w=dom.window;w.eval(read('shared/task-clock.js'));const saved=[];let begins=0;w.CLTraining=model;w.CogniLabRun={begin(){begins++;},measure:f=>f(),complete:m=>saved.push(m),waitForSave:async()=>{},abort(){}};return {dom,w,saved,begins:()=>begins};}
function evaluate(p,file){p.w.eval(read(file).replace(/^import .*;\s*$/gm,''));}
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function clock(w){let now=0,id=0;const jobs=new Map();w.Date.now=()=>now;w.setTimeout=(f,ms=0)=>{jobs.set(++id,{at:now+ms,f});return id;};w.clearTimeout=id=>jobs.delete(id);w.setInterval=(f,ms)=>{jobs.set(++id,{at:now+ms,f,interval:ms});return id;};w.clearInterval=id=>jobs.delete(id);return async ms=>{const target=now+ms;while(true){const next=[...jobs].filter(([,v])=>v.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);if(next[1].interval)jobs.set(next[0],{...next[1],at:now+next[1].interval});next[1].f();await flush();}now=target;await flush();};}
// Actual piano controller: replay same phrase on error, advance only on success,
// and cancel demonstration callbacks on timed completion.
{
 const p=page('Il pianoforte.html'),w=p.w,advance=clock(w);Object.assign(w,model);w.melody=()=>[2];
 evaluate(p,'shared/music-game.js');w.document.getElementById('music-start').click();assert.equal(p.begins(),1);assert.equal(w.document.querySelectorAll('.piano-key').length,8);
 await advance(650);assert.equal(w.document.querySelectorAll('.piano-key.active').length,1);await advance(610);
 const keys=w.document.querySelectorAll('.piano-key');keys[1].click();await advance(850+650);assert.equal([...keys].findIndex(k=>k.classList.contains('active')),2);assert.equal(w.document.getElementById('music-span').textContent,'1 nota');
 await advance(610);keys[2].click();await advance(850);assert.equal(w.document.getElementById('music-span').textContent,'2 note');
 await advance(120000);assert.equal(p.saved.length,1);assert.equal(p.saved[0].errors,1);assert.equal(p.saved[0].sequencesCompleted,1);assert.equal(w.document.getElementById('music-results').hidden,false);
 await advance(5000);assert.equal(p.saved.length,1);assert.equal(w.document.querySelectorAll('.piano-key.active').length,0);w.close();
}
// Garden inverse recall and manual finish use the same safe timed controller.
{
 const p=page('Memoria visuospaziale il Giardino.html'),w=p.w,advance=clock(w);Object.assign(w,model);let index=0;w.Math.random=()=>[.73,.16,.92][index++%3];
 const tones=[];w.AudioContext=class{currentTime=0;resume(){return Promise.resolve();}close(){return Promise.resolve();}createOscillator(){return {frequency:{set value(v){tones.push(v);}},connect(){},start(){},stop(){}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}};
 evaluate(p,'shared/music-game.js');w.document.getElementById('music-order').value='inverse';w.document.getElementById('music-start').click();await advance(2480);
 assert.deepEqual(tones,model.FREQUENCIES.slice(0,3));
 const keys=w.document.querySelectorAll('.garden-cell');assert.equal(keys.length,16);for(const i of [14,2,11])keys[i].click();assert.deepEqual(tones.slice(3),model.FREQUENCIES.slice(0,3).reverse());await advance(850);assert.equal(w.document.getElementById('music-count').textContent,'1');
 w.document.getElementById('music-finish').click();assert.equal(p.saved.length,1);assert.equal(p.saved[0].sequencesCompleted,1);await advance(3000);assert.equal(w.document.querySelectorAll('.garden-cell.active').length,0);w.close();
}
// Actual exploration controller: triangle shifting target, cue side in base
// mode, no visible previous stimulus between taps and clean single shape.
{
 const p=page('Esplorazione visuospaziale multilivello.html'),w=p.w,advance=clock(w);w.console.warn=()=>{};w.console.log=()=>{};w.Math.random=()=>.1;w.CLTraining={...model,nextTarget:()=> 'triangle'};
 for(const script of w.document.querySelectorAll('script:not([src]):not([type="module"])'))w.eval(script.textContent);
 w.document.getElementById('distractor-toggle').checked=true;w.setBarSide('right');w.startGame('base');assert.equal(w.document.getElementById('flashing-bar').style.right,'0px');
 const stimulus=w.document.getElementById('stimulus');stimulus.dispatchEvent(new w.Event('pointerdown',{cancelable:true}));assert.equal(stimulus.style.visibility,'hidden');await advance(350);assert.equal(stimulus.className,'target-circle');
 w.resetToMenu();w.startGame('shifting');w.moveStimulus();assert.match(w.document.getElementById('instruction-banner').textContent,/TRIANGOLO GIALLO/);assert.equal(stimulus.querySelectorAll('.distractor-triangle').length,1);w.endGame();assert.equal(p.saved.length,1);w.close();
}
// Actual orientation UI: reject empty city, use confirmed place, complete all
// advanced tasks through rendered boxes and retain correct/error totals.
{
 const p=page('Orientamento temporale-spaziale.html'),w=p.w;Object.assign(w,model);evaluate(p,'shared/orientation-game.js');
 const form=w.document.getElementById('orientation-form');const submit=()=>form.dispatchEvent(new w.Event('submit',{cancelable:true}));submit();assert.equal(p.begins(),0);
 w.document.getElementById('orientation-city').value='Cogne';w.document.getElementById('orientation-date').value='2026-10-15';w.document.getElementById('orientation-level').value='advanced';submit();assert.equal(p.begins(),1);
 const answers=[['giovedì','15','ottobre','2026','autunno'],['Cogne'],['bagno'],['cucina'],...tasks.map(t=>t.answer)];
 const choose=value=>{const b=[...w.document.querySelectorAll('#orientation-choices button')].find(b=>b.textContent===value);assert.ok(b,value);b.click();};
 choose([...w.document.querySelectorAll('#orientation-choices button')].find(b=>b.textContent!=='giovedì').textContent);
 for(let i=0;i<answers.length;i++){
  if(i===answers.length-1){w.document.getElementById('orientation-number').value='47';w.document.getElementById('orientation-number-form').dispatchEvent(new w.Event('submit',{cancelable:true}));}
  else for(const answer of answers[i])choose(answer);
  assert.equal(w.document.getElementById('orientation-next').hidden,false);w.document.getElementById('orientation-next').click();
 }
 assert.equal(p.saved.length,1);assert.equal(p.saved[0].errors,1);assert.equal(p.saved[0].activitiesCompleted,8);assert.equal(p.saved[0].total,p.saved[0].correct+1);w.close();
}
// Legacy controller execution: all combinations of base trail and direction.
const secondary={alpha:'ABCDEFGHIJKLM'.split(''),reverse:'ZYXWVUTSRQPON'.split(''),months:['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set'],days:['Lun','Mar','Mer','Gio','Ven','Sab','Dom','Lun','Mar'],romans:['I','II','III','IV','V','VI','VII','VIII','IX'],compass:['N','E','S','O','NE','SE','SO','NO','N']};
for(const type of ['letters','numbers',...Object.keys(secondary)])for(const inverse of [false,true])for(const moving of [false,true]){
 const p=page('Attenzione alternata.html'),w=p.w;clock(w);w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
 for(const script of w.document.querySelectorAll('script:not([src]):not([type="module"])'))w.eval(script.textContent);
 w.selectType(type);w.document.getElementById('trail-order').value=inverse?'inverse':'direct';w.startGame(moving);
 const nodes=[...w.document.querySelectorAll('.node')];assert.equal(nodes.length,model.trailSequence(type,inverse,secondary[type]).length);
 assert.deepEqual(nodes.map(n=>n.innerText),model.trailSequence(type,inverse,secondary[type]));
 nodes[0].dispatchEvent(new w.Event('pointerdown',{cancelable:true}));
 w.innerHeight=900;w.dispatchEvent(new w.Event('resize'));assert.equal(w.document.getElementById('main-menu').classList.contains('hidden'),true);assert.equal(w.document.querySelectorAll('.node.correct').length,1);assert.equal(w.document.querySelectorAll('.node').length,nodes.length);
 for(const node of nodes.slice(1))node.dispatchEvent(new w.Event('pointerdown',{cancelable:true}));assert.equal(p.saved.length,1);assert.equal(p.saved[0].errors,0);w.close();
}
console.log('PASS: 32 trail configurations retain progress on resize; C-major audio sequence verified; three randomized shifting targets; calendar/leap-year boundaries; real orientation completion; piano exact retry, progressive length and timeout cancellation.');
