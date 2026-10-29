import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {deckFor,optionsFor,letterTiles,shuffle} from '../shared/language-suite-model.mjs';import {makeDeck,choicesFor} from '../shared/listen-picture-model.mjs';import {ItalianVoice} from '../shared/italian-voice.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require('/tmp/cognilab-qa/node_modules/jsdom');const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const specs=[['listen','Ascolta e indica.html'],['repeat','Ascolta e ripeti.html'],['spell','Ricomponi la parola.html'],['story','Rimetti in ordine la storia.html'],['semantic','Quali immagini stanno insieme.html'],['function','A cosa serve.html']];
function harness(mode){
 const file=specs.find(s=>s[0]===mode)[1],dom=new JSDOM(read(file),{url:'https://example.test/'+encodeURIComponent(file),runScripts:'outside-only'}),w=dom.window;let now=1000,nextId=0,spoken,bank;const timers=new Map(),results=[];w.Date.now=()=>now;w.setTimeout=(fn,delay=0)=>{const id=++nextId;timers.set(id,{fn,at:now+delay});return id;};w.clearTimeout=id=>timers.delete(id);
 const tick=ms=>{const target=now+ms;let n=0;while(true){const due=[...timers].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;assert.ok(n++<1000);now=due[1].at;timers.delete(due[0]);due[1].fn();}now=target;};
 w.eval(read('shared/task-clock.js'));w.eval(read('shared/object-images.js'));w.eval(read('shared/language-pictures.mjs').replace(/export /g,''));for(const script of w.document.querySelectorAll('script:not([src])'))w.eval(script.textContent);
 w.CogniLabRun={begin(){},complete:m=>results.push({status:'completed',metrics:m}),interrupt:m=>results.push({status:'interrupted',metrics:m}),waitForSave:async()=>true};w.confirm=()=>true;w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};w.speechSynthesis={getVoices:()=>[{lang:'it-IT'}],cancel(){},speak(u){spoken=u;}};w.ItalianVoice=class extends ItalianVoice{constructor(){super(w);}};
 Object.assign(w,{optionsFor,letterTiles,shuffle,makeDeck,choicesFor});w.deckFor=(...args)=>{bank=deckFor(...args);return bank;};w.eval(read(mode==='listen'?'shared/listen-picture.js':'shared/language-suite.js').replace(/^import[^\n]*\n/gm,''));
 const prefix=mode==='listen'?'listen':'language',node=id=>w.document.getElementById(id),click=id=>node(id).click(),progress=()=>node(prefix+'-progress').textContent;
 function solve(){
  const i=Number(progress().match(/(\d+) di/)[1])-1;if(mode==='listen'){spoken.onend?.();[...node('listen-options').children].find(b=>b.dataset.word===spoken.text).click();}
  else if(mode==='repeat'){spoken.onend?.();click('language-practiced');}
  else if(mode==='spell'){for(const c of bank[i].name.toUpperCase())[...node('language-letter-bank').children].find(b=>!b.disabled&&b.textContent===c).click();assert.equal(node('language-check'),null);}
  else if(mode==='story'){click('language-story-ready');for(let j=0;j<bank[i].steps.length;j++)node('language-scene-bank').querySelector('[data-step="'+j+'"]').click();click('language-check');}
  else node('language-workspace').querySelector('[data-answer="'+bank[i].answer+'"]').click();
 }
 return {w,dom,results,tick,node,click,prefix,progress,solve,get bank(){return bank;},get spoken(){return spoken;}};
}
for(const [mode]of specs){
 // No click on Next, including the final automatic save.
 const h=harness(mode);h.click(h.prefix+'-start');const count=mode==='story'?3:10;for(let n=0;n<count;n++){h.solve();assert.equal(h.results.length,0);h.tick(1199);assert.match(h.progress(),new RegExp(' '+(n+1)+' di '));h.tick(1);if(n+1<count)assert.match(h.progress(),new RegExp(' '+(n+2)+' di '));}assert.equal(h.results.length,1);assert.equal(h.results[0].status,'completed');assert.equal(h.results[0].metrics.correct??h.results[0].metrics.practiced,count);h.tick(10000);assert.equal(h.results.length,1);h.dom.window.close();
 // Pause freezes the feedback transition and retains its remaining time.
 const p=harness(mode);p.click(p.prefix+'-start');p.solve();p.tick(400);p.w.CogniLabAssist.pause();p.tick(5000);assert.match(p.progress(),/ 1 di /);p.w.CogniLabAssist.resume();p.tick(799);assert.match(p.progress(),/ 1 di /);p.tick(1);assert.match(p.progress(),/ 2 di /);p.dom.window.close();
 // Optional immediate progression cancels the pending automatic callback.
 const m=harness(mode);m.click(m.prefix+'-start');m.solve();m.click(m.prefix+'-next');assert.match(m.progress(),/ 2 di /);m.tick(1200);assert.match(m.progress(),/ 2 di /);m.dom.window.close();
 // Ending or leaving the page cancels all pending transitions.
 const e=harness(mode);e.click(e.prefix+'-start');e.solve();e.click(e.prefix+'-end');assert.equal(e.results.length,1);assert.equal(e.results[0].status,'interrupted');e.tick(2000);assert.equal(e.results.length,1);e.dom.window.close();
 const l=harness(mode);l.click(l.prefix+'-start');l.solve();l.w.dispatchEvent(new l.w.Event('pagehide'));l.tick(2000);assert.match(l.progress(),/ 1 di /);assert.equal(l.results.length,0);l.dom.window.close();
}
for(const mode of ['listen','spell','story','semantic','function']){
 const h=harness(mode);h.click(h.prefix+'-start');if(mode==='listen'){h.spoken.onend?.();[...h.node('listen-options').children].find(b=>b.dataset.word!==h.spoken.text).click();}
 else if(mode==='spell'){const length=h.bank[0].name.length;for(let i=0;i<length;i++){const buttons=[...h.node('language-letter-bank').children];buttons.find(b=>!b.disabled&&(i>0||b.textContent!==h.bank[0].name[0].toUpperCase())).click();}}
 else if(mode==='story'){h.click('language-story-ready');for(let j=h.bank[0].steps.length-1;j>=0;j--)h.node('language-scene-bank').querySelector('[data-step="'+j+'"]').click();h.click('language-check');}
 else [...h.node('language-workspace').querySelectorAll('.language-choice')].find(b=>b.dataset.answer!==h.bank[0].answer).click();h.tick(2000);assert.match(h.progress(),/ 1 di /);assert.equal(h.results.length,0);h.dom.window.close();
}
console.log('PASS: all six exercises advance automatically after 1200ms, auto-save the final trial once, stay on errors, pause/resume the remaining delay, cancel manual/automatic races, and cancel pending transitions on finish/pagehide. Actual TaskClock with deterministic browser timers; no patient data.');
