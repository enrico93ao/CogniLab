import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {deckFor,optionsFor,letterTiles,shuffle,pictureWords,relations,functions,stories} from '../shared/language-suite-model.mjs';import {ItalianVoice} from '../shared/italian-voice.mjs';import {normalizeMetrics,measurement,groupKey} from '../shared/progress-model.mjs';import {exercises,exerciseById} from '../shared/exercise-catalog.mjs';import {validateProgram,sessionProgress,summarizeResults} from '../shared/care-model.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const specs=[['repeat','Ascolta e ripeti.html','ascolta-ripeti'],['spell','Ricomponi la parola.html','ricomponi-parola'],['story','Rimetti in ordine la storia.html','storia-immagini'],['semantic','Quali immagini stanno insieme.html','associazioni-semantiche'],['function','A cosa serve.html','oggetti-funzioni']];
for(const mode of specs.map(s=>s[0]))for(const level of ['base','intermedio','avanzato']){
 const d=deckFor(mode,level,20);assert.equal(d.length,20);
 for(const item of d){if(mode==='story'){assert.equal(item.steps.length,{base:3,intermedio:4,avanzato:5}[level]);assert.ok(item.steps.every(s=>item.text.includes(s.caption)));}else if(mode==='repeat'){if(level==='base')assert.ok(item.name.length<=5);if(level==='intermedio')assert.ok(item.name.length>=6);if(level==='avanzato')assert.ok(item.text.includes(' '));}else if(mode==='spell'){const tiles=letterTiles(item.name,level);assert.equal(tiles.length,item.name.length+(level==='avanzato'?2:0));const stock=tiles.map(t=>t.letter);for(const c of item.name.toUpperCase()){const i=stock.indexOf(c);assert.ok(i>=0);stock.splice(i,1);}assert.equal(new Set(tiles.map(t=>t.id)).size,tiles.length);}else{const opts=optionsFor(item,level);assert.equal(opts.length,{base:2,intermedio:4,avanzato:6}[level]);assert.equal(new Set(opts).size,opts.length);assert.ok(opts.includes(item.answer));}}
}
function harness(mode,level='base',audio=true){
 const file=specs.find(s=>s[0]===mode)[1],dom=new JSDOM(read(file),{url:'https://example.test/CogniLab/'+encodeURIComponent(file),runScripts:'outside-only'}),w=dom.window;let spoken,bank;const results=[];
 w.eval(read('shared/object-images.js'));w.eval(read('shared/language-pictures.mjs').replace(/export /g,''));
 for(const word of pictureWords)assert.ok(w.picture(word.name));for(const story of stories)for(const s of story.steps)assert.match(w.sceneMarkup(s.scene),/<svg/);
 const images=new Set(pictureWords.map(w=>w.name));for(const item of [...relations,...functions])for(const n of [item.image,item.answer,...item.distractors].filter(Boolean))assert.ok(images.has(n),n);
 for(const script of w.document.querySelectorAll('script:not([src])'))w.eval(script.textContent);
 w.CogniLabRun={begin(){},complete(m){results.push({status:'completed',metrics:normalizeMetrics(m)});},interrupt(m){results.push({status:'interrupted',metrics:normalizeMetrics(m)});},waitForSave:async()=>true};w.confirm=()=>true;
 if(audio){w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};w.speechSynthesis={getVoices:()=>[{lang:'it-IT'}],cancel(){},speak(u){spoken=u;}};}
 w.ItalianVoice=class extends ItalianVoice{constructor(){super(w);}};w.deckFor=(...args)=>{bank=deckFor(...args);return bank;};w.optionsFor=optionsFor;w.letterTiles=letterTiles;w.shuffle=shuffle;
 w.eval(read('shared/language-suite.js').replace(/^import[^\n]*\n/gm,''));const node=id=>w.document.getElementById(id),click=id=>{assert.ok(node(id),id);node(id).click();};node('language-level').value=level;
 return {w,dom,node,click,results,get bank(){return bank;},get spoken(){return spoken;},endAudio(){spoken.onend?.();}};
}
for(const [mode,file,id] of specs){
 assert.ok(exercises.find(e=>e.id===id&&e.file===file));
 for(const level of ['base','intermedio','avanzato']){
  const h=harness(mode,level),w=h.w;h.click('language-start');const count=h.bank.length;
  for(let n=0;n<count;n++){
   const item=h.bank[n];
   if(mode==='repeat'){assert.equal(h.node('language-practiced').disabled,true);h.endAudio();h.click(n%2?'language-not-practiced':'language-practiced');}
   else if(mode==='spell'){for(const c of item.name.toUpperCase()){const b=[...w.document.querySelectorAll('.language-tile')].find(b=>!b.disabled&&b.textContent===c);assert.ok(b);b.click();}h.click('language-check');}
   else if(mode==='story'){h.click('language-story-ready');for(let step=0;step<item.steps.length;step++)w.document.querySelector('[data-step="'+step+'"]').click();h.click('language-check');}
   else w.document.querySelector('[data-answer="'+item.answer+'"]').click();
   assert.equal(h.node('language-next').hidden,false,mode+' '+level);h.click('language-next');
  }
  assert.equal(h.results.length,1);const r=h.results[0];assert.equal(r.status,'completed');assert.equal(r.metrics.allTrialsCompleted,true);assert.equal(r.metrics.trialsCompleted,count);
  if(mode==='repeat'){assert.equal(r.metrics.oralAssessment,'not-assessed');assert.equal(r.metrics.correct,null);assert.equal(r.metrics.accuracyPct,null);assert.equal(measurement(r),null);assert.equal(r.metrics.practiced+r.metrics.notPracticed,count);}else{assert.equal(r.metrics.correct,count);assert.equal(r.metrics.firstTry,count);assert.equal(r.metrics.accuracyPct,100);}
  h.dom.window.close();
 }
 // Early finish must leave an assignment incomplete.
 const h=harness(mode);h.click('language-start');h.click('language-end');assert.equal(h.results[0].status,'interrupted');assert.equal(h.results[0].metrics.allTrialsCompleted,false);assert.equal(sessionProgress({exercises:[id]},{results:{r:{exerciseId:id,programSlot:'0',status:h.results[0].status}}}).completedSlots.length,0);h.dom.window.close();
}
// Errors, duplicate letters, manual hints and selection editing.
{
 const h=harness('spell','avanzato'),w=h.w;h.click('language-start');const before=h.node('language-letter-bank').children.length;[...h.node('language-letter-bank').children][0].click();h.node('language-letter-answer').querySelector('button').click();assert.equal([...h.node('language-letter-bank').children].filter(b=>b.disabled).length,0);for(let i=0;i<2;i++){[...h.node('language-letter-bank').children].find(b=>!b.disabled).click();h.click('language-check');h.click('language-clear');}assert.equal(h.node('language-spell-help').hidden,false);h.click('language-help');assert.match(h.node('language-spell-help').textContent,new RegExp(h.bank[0].name.toUpperCase()));for(const c of h.bank[0].name.toUpperCase())[...h.node('language-letter-bank').children].find(b=>!b.disabled&&b.textContent===c).click();h.click('language-check');h.click('language-end');assert.equal(h.results[0].metrics.assisted,1);assert.equal(h.results[0].metrics.errors,2);assert.equal(h.results[0].metrics.total,3);assert.equal(h.results[0].metrics.firstTry,0);h.dom.window.close();
}
for(const mode of ['semantic','function']){
 const h=harness(mode,'avanzato');h.click('language-start');for(let i=0;i<2;i++)[...h.node('language-workspace').querySelectorAll('.language-choice')].find(b=>!b.disabled&&b.dataset.answer!==h.bank[0].answer).click();assert.ok(h.node('language-workspace').querySelector('.hint'));h.node('language-workspace').querySelector('[data-answer="'+h.bank[0].answer+'"]').click();h.click('language-end');assert.equal(h.results[0].metrics.assisted,1);assert.equal(h.results[0].metrics.errors,2);assert.equal(h.results[0].metrics.accuracyPct,33.33);h.dom.window.close();
}
{
 const h=harness('story','avanzato');h.click('language-start');h.click('language-story-ready');for(let i=4;i>=0;i--)h.node('language-scene-bank').querySelector('[data-step="'+i+'"]').click();h.click('language-check');h.click('language-help');h.click('language-clear');for(let i=0;i<5;i++)h.node('language-scene-bank').querySelector('[data-step="'+i+'"]').click();h.click('language-check');h.click('language-end');assert.equal(h.results[0].metrics.assisted,1);assert.equal(h.results[0].metrics.errors,1);h.dom.window.close();
}
// Audio failure blocks oral-practice acknowledgements but not written/visual activities.
for(const mode of ['repeat','spell','story','semantic','function']){const h=harness(mode,'base',false);h.click('language-start');if(mode!=='repeat')h.click('language-replay');assert.equal(h.node('language-audio-error').hidden,false);if(mode==='repeat')assert.equal(h.node('language-practiced').disabled,true);h.dom.window.close();}
// Pausing must not permit a response; resume restarts mandatory speech.
{
 const h=harness('repeat');h.click('language-start');h.endAudio();h.w.CogniLabAssist.pause();h.click('language-practiced');assert.equal(h.node('language-next').hidden,true);h.w.CogniLabAssist.resume();h.endAudio();h.click('language-practiced');assert.equal(h.node('language-next').hidden,false);h.dom.window.close();
}
// Configuration capture/apply and assignment validation include all five new IDs.
for(const [mode,file,id] of specs){const h=harness(mode,'avanzato');h.w.eval(read('shared/care-presets.js'));const config=h.w.CogniLabConfiguration.capture();h.node('language-level').value='base';h.w.CogniLabConfiguration.apply(config);assert.equal(h.node('language-level').value,'avanzato');assert.equal(validateProgram({name:'Prova',totalSessions:4,exercises:[id],configurations:[JSON.stringify(config)]}).exercises[0],id);h.dom.window.close();}
// Reject unbounded/custom metric payloads and retain the new documented counts.
assert.deepEqual(normalizeMetrics({firstTry:-1,assisted:1.5,notPracticed:Infinity}).firstTry,undefined);assert.equal(normalizeMetrics({firstTry:3,assisted:2,replays:4,oralAssessment:'not-assessed'}).firstTry,3);assert.equal(normalizeMetrics({malicious:'x'}).malicious,undefined);
console.log('PASS: all 5 exercises x 3 levels; coherent stimulus coverage; complete and interrupted runs; real metric normalization; honest oral-practice records; hints, errors, duplicate letters, sequence editing, audio failure, pause/resume, configuration capture/apply and assignment validation. DOM simulation, no patient records modified.');

{const h=harness('repeat');Object.assign(h.w,{exerciseById,groupKey,summarizeResults});h.w.eval(read('shared/progress-view.js').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,''));const host=h.w.document.createElement('section');h.w.document.body.append(host);const view=h.w.createProgressView(host);view.render([{exerciseId:'ascolta-ripeti',title:'Ascolta e ripeti',exerciseVersion:'1.0.0',settings:{},finishedAt:'2026-10-28T10:00:00Z',durationMs:60000,status:'completed',metrics:normalizeMetrics({listened:10,practiced:7,notPracticed:3,oralAssessment:'not-assessed'})}]);assert.match(host.textContent,/7 tentativi/);assert.match(host.textContent,/pronuncia non/);assert.equal(host.querySelectorAll('thead th').length,7);h.dom.window.close();}
