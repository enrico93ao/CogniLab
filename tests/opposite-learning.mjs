import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
import {sessionProgress} from '../shared/care-model.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require('/tmp/cognilab-qa/node_modules/jsdom');
const html=fs.readFileSync(new URL('../Rispondi il contrario.html',import.meta.url),'utf8'),script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
function setup(assigned=true){const d=new JSDOM(html,{url:'https://example.test/Rispondi%20il%20contrario.html',runScripts:'outside-only'}),w=d.window;let now=0,next=0,begins=0;const jobs=new Map(),results=[],messages=[];
 w.Date.now=()=>now;w.setInterval=(fn)=>{const id=++next;jobs.set(id,{fn,interval:true});return id;};w.setTimeout=(fn,ms)=>{const id=++next;jobs.set(id,{fn,ms});return id;};w.clearInterval=w.clearTimeout=id=>jobs.delete(id);w.confirm=()=>true;
 Object.defineProperty(w,'parent',{value:{postMessage:message=>messages.push(message)}});
 Object.assign(w,{CogniLabRun:{begin:()=>begins++,complete:r=>results.push(r),abort:()=>({id:'skip-result',exerciseId:'rispondi-contrario',status:'interrupted'})}});
 if(assigned){w.localStorage.setItem('cognilab.lastUser','p');w.sessionStorage.setItem('cognilab.session.p',JSON.stringify({id:'s',programId:'plan'}));w.sessionStorage.setItem('cognilab.plan.p',JSON.stringify({programId:'plan',files:['Rispondi il contrario.html'],index:0}));}
 w.eval(script+';window.testState=()=>({pool:currentSessionQuestions,index:currentIndex,phase,attempts,isTimedMode,count:fullDatabase.length});');
 const run=ms=>{const e=[...jobs].find(([,v])=>v.ms===ms);if(e){jobs.delete(e[0]);e[1].fn();}},advance=seconds=>{now+=seconds*1000;for(const v of [...jobs.values()])if(v.interval)v.fn();};
 return {w,results,messages,run,advance,begins:()=>begins};}
{
 const {w,results,run,advance,begins}=setup();w.setMode(false);w.initSession();assert.equal(w.testState().isTimedMode,true);assert.equal(w.testState().count,71);assert.equal(w.testState().pool.length,15);assert.equal(new Set(w.testState().pool.map(q=>q.q)).size,15);assert.ok(w.testState().pool.every(q=>q.impulse!==q.target));const original=JSON.stringify(w.testState().pool);
 w.processAnswer(w.testState().pool[0].impulse);assert.equal(results.length,0);assert.equal(w.testState().phase,'feedback');run(3500);assert.equal(w.testState().index,0);assert.equal(JSON.stringify(w.testState().pool),original);assert.equal(begins(),1);
 advance(60);assert.equal(results.length,0);assert.equal(w.testState().phase,'feedback');w.restoreSession();assert.equal(JSON.stringify(w.testState().pool),original);
 for(let i=0;i<15;i++){w.processAnswer(w.testState().pool[i].target);w.processAnswer(w.testState().pool[i].target);run(180);}
 assert.equal(results.length,1);assert.equal(results[0].criterionMet,true);assert.equal(results[0].finalCorrect,15);assert.equal(results[0].errors,1);assert.equal(results[0].omissions,1);assert.equal(w.testState().phase,'finished');assert.equal(w.document.getElementById('skip-assigned').hidden,true);w.close();
}
{
 const {w,messages,results,run}=setup();w.initSession();w.processAnswer(w.testState().pool[0].impulse);w.confirm=()=>false;w.skipAssigned();assert.equal(messages.length,0);w.confirm=()=>true;w.skipAssigned();run(3500);assert.equal(w.testState().phase,'skipped');assert.equal(messages.length,1);assert.equal(messages[0].result.status,'interrupted');assert.equal(messages[0].result.skipped,true);assert.equal(results.length,0);w.close();
}
{
 const {w,messages}=setup(false);w.setMode(false);w.initSession();assert.equal(w.testState().isTimedMode,false);assert.equal(w.document.getElementById('skip-assigned').hidden,true);w.skipAssigned();assert.equal(messages.length,0);w.close();
}
const program={exercises:['rispondi-contrario','stroop-original']};const saved={results:{r:{exerciseId:'rispondi-contrario',programSlot:'0',status:'interrupted',skipped:true}}};let p=sessionProgress(program,saved);assert.equal(p.completed,0);assert.equal(p.skipped,1);assert.equal(p.nextSlot,1);assert.equal(p.complete,false);saved.results.r.skipped=false;assert.equal(sessionProgress(program,saved).nextSlot,0);saved.results.r.skipped=true;saved.results.s={exerciseId:'stroop-original',programSlot:'1',status:'completed'};p=sessionProgress(program,saved);assert.equal(p.complete,true);assert.equal(p.completed,1);assert.equal(p.skipped,1);
console.log('PASS: 71 questions; 15-item stable learning pool; failures/timeouts never complete; automatic retry; 15 correct wins; input debouncing; assigned-only timed mode and skip; skipped slots distinct from completed. No Firebase writes.');
