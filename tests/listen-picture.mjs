import assert from 'node:assert/strict';
import fs from 'node:fs';import {createRequire} from 'node:module';import {makeDeck,choicesFor,words} from '../shared/listen-picture-model.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(let n=0;n<100;n++){
 const deck=makeDeck(20);assert.equal(deck.length,20);assert.equal(new Set(deck.slice(0,17).map(w=>w.name)).size,17);deck.forEach((w,i)=>{if(i)assert.notEqual(w.name,deck[i-1].name);});
 for(const word of words)for(const [level,count] of [['base',2],['intermedio',4],['avanzato',6]]){const opts=choicesFor(word,level);assert.equal(opts.length,count);assert.equal(new Set(opts.map(w=>w.name)).size,count);assert.equal(opts.filter(w=>w.name===word.name).length,1);if(level==='base')assert.ok(opts.find(w=>w.name!==word.name).group!==word.group);}
}
function harness({voices=[{lang:'it-IT'}],audio=true}={}){
 const dom=new JSDOM(read('Ascolta e indica.html'),{url:'https://example.test/CogniLab/Ascolta%20e%20indica.html',runScripts:'outside-only'}),w=dom.window,results=[];let spoken;
 w.eval(read('shared/task-clock.js'));w.eval(read('shared/object-images.js'));for(const word of words)assert.ok(w.CogniLabObjects.positions[word.name]!==undefined);
 w.CogniLabExercise={instructions:'Ascolta e scegli.'};w.CogniLabRun={begin(){},complete(m){results.push({status:'completed',metrics:m});},interrupt(m){results.push({status:'interrupted',metrics:m});},waitForSave:async()=>true};w.confirm=()=>true;
 if(audio){w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};w.speechSynthesis={getVoices:()=>voices,cancel(){},speak(u){spoken=u;}};}
 w.makeDeck=makeDeck;w.choicesFor=choicesFor;w.eval(read('shared/listen-picture.js').replace(/^import[^\n]*\n/,''));
 const click=id=>w.document.getElementById(id).click(),node=id=>w.document.getElementById(id);
 const endAudio=()=>spoken.onend?.();const pick=correct=>[...node('listen-options').children].find(b=>!b.disabled&&(b.dataset.word===spoken.text)===correct);
 return {w,dom,results,click,node,endAudio,pick,get spoken(){return spoken;}};
}
{
 const h=harness();h.node('listen-level').value='avanzato';h.click('listen-start');assert.equal(h.node('listen-options').children.length,6);assert.ok([...h.node('listen-options').children].every(b=>b.disabled));h.endAudio();h.pick(false).click();h.pick(false).click();assert.ok(h.node('listen-options').querySelector('.hint'));h.pick(true).click();assert.equal(h.node('listen-next').hidden,false);assert.equal(h.results.length,0);h.click('listen-next');h.endAudio();
 h.w.CogniLabAssist.pause();assert.ok([...h.node('listen-options').children].every(b=>b.disabled));h.w.CogniLabAssist.resume();h.endAudio();h.click('listen-replay');h.endAudio();h.pick(true).click();
 for(let i=2;i<10;i++){h.click('listen-next');h.endAudio();h.pick(true).click();}h.click('listen-next');assert.equal(h.results.length,1);const r=h.results[0];assert.equal(r.status,'completed');assert.equal(r.metrics.correct,10);assert.equal(r.metrics.errors,2);assert.equal(r.metrics.total,12);assert.equal(r.metrics.firstTry,9);assert.equal(r.metrics.assisted,1);assert.equal(r.metrics.replays,1);assert.equal(r.metrics.allWordsCompleted,true);assert.ok(h.node('listen-game').hidden);h.dom.window.close();
}
{
 const h=harness();h.click('listen-start');h.endAudio();h.pick(true).click();h.click('listen-end');assert.equal(h.results[0].status,'interrupted');assert.equal(h.results[0].metrics.allWordsCompleted,false);assert.equal(h.results[0].metrics.wordsCompleted,1);h.dom.window.close();
}
for(const opts of [{audio:false},{voices:[{lang:'en-US'}]}]){const h=harness(opts);h.click('listen-start');assert.equal(h.node('listen-audio-error').hidden,false);assert.ok([...h.node('listen-options').children].every(b=>b.disabled));assert.equal(h.results.length,0);h.dom.window.close();}
{
 const h=harness();h.click('listen-start');const old=h.spoken;old.onerror();assert.equal(h.node('listen-audio-error').hidden,false);h.click('listen-audio-retry');h.endAudio();assert.ok(h.pick(true));h.dom.window.close();
}
// Shared discreet controls must pause and resume this exercise without cancelling the new word.
{
 const h=harness(),w=h.w;w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;w.setTimeout(()=>this.dispatchEvent(new w.Event('close')),0);};w.eval(read('shared/assist-controls.js'));
 assert.equal(w.document.getElementById('cl-demo-open'),null);h.click('listen-start');h.endAudio();h.click('cl-task-pause');assert.ok([...h.node('listen-options').children].every(b=>b.disabled));w.document.querySelector('#cl-assist-dialog button').click();await new Promise(r=>setTimeout(r,10));h.endAudio();assert.ok(h.pick(true));h.dom.window.close();
}
// The real runtime must persist an early end as interrupted and never emit twice.
{
 const dom=new JSDOM('<body><div id="cl-exercise-save-status"></div></body>',{url:'https://example.test/CogniLab/Ascolta%20e%20indica.html',runScripts:'outside-only'}),w=dom.window;const sent=[];Object.defineProperty(w,'parent',{value:{postMessage:m=>sent.push(m)}});w.CogniLabExercise={id:'ascolta-indica',title:'Ascolta e indica',category:'Linguaggio',setup:'setup'};w.CogniLabGymAuthorized=true;w.eval(read('shared/exercise-runtime.js').replace(" import('./gym-gate.js').catch(()=>location.replace('accesso.html'));",''));w.CogniLabRun.begin();w.CogniLabRun.interrupt({correct:1,total:2,errors:1});const result=sent.find(m=>m.type==='cognilab-result-v3').result;assert.equal(result.status,'interrupted');w.CogniLabRun.complete({});assert.equal(sent.filter(m=>m.type==='cognilab-result-v3').length,1);w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:w.parent,data:{type:'cognilab-save-status',id:result.id,ok:true,message:'Salvato'}}));await w.CogniLabRun.waitForSave();w.close();
}
console.log('PASS: stimulus/image coverage; 3 difficulty levels; randomized balanced deck; audio gating/failure/retry; hints; pause/resume; replay; complete metrics and real runtime interrupted persistence. DOM simulation, no patient data.');
