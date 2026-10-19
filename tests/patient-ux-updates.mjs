import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
function fixture(file){const dom=new JSDOM(read(file),{url:'https://example.test/'+encodeURIComponent(file),runScripts:'outside-only'}),w=dom.window,timers=[];w.setTimeout=(fn,ms)=>{timers.push({fn,ms});return timers.length;};w.clearTimeout=()=>{};w.setInterval=()=>1;w.clearInterval=()=>{};w.requestAnimationFrame=()=>1;w.AudioContext=class {constructor(){this.currentTime=0;this.state='running';this.destination={};}resume(){}createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}};}createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}};w.lucide={createIcons(){}};w.CogniLabRun={begin(){},abort(){},complete(){},measure:f=>f()};w.CogniLabAudio={handles:()=>true,feedback(){}};const run=code=>vm.runInContext(code,dom.getInternalVMContext());return {dom,w,timers,run,load(){for(const script of w.document.querySelectorAll('script:not([src]):not([type=module]):not([type="application/ld+json"])'))run(script.textContent);}};}
// Signed keypad composes signed integers, supports editing and never submits on a digit.
{
 const f=fixture('Calcolo e memoria.html');f.run(read('shared/signed-keypad.js'));f.w.document.dispatchEvent(new f.w.Event('DOMContentLoaded'));
 const input=f.w.document.getElementById('answer-input'),pad=f.w.document.querySelector('.cl-signed-keypad');const press=k=>[...pad.querySelectorAll('button')].find(b=>b.textContent===k).click();
 press('−');press('1');press('2');assert.equal(input.value,'-12');press('+');assert.equal(input.value,'+12');assert.equal(input.checkValidity(),true);press('⌫');assert.equal(input.value,'+1');press('Cancella');assert.equal(input.value,'');assert.ok([...pad.querySelectorAll('button')].every(b=>b.type==='button'));f.dom.window.close();
}
// Response validation uses the visible band's actual bounds, including after resize.
{
 const f=fixture('Doppio compito e velocità.html');f.load();const area=f.w.document.getElementById('play-area');let height=400;Object.defineProperty(area,'clientHeight',{get:()=>height});
 f.run('state.bandPercent=25');assert.equal(f.run('responseBounds().top'),284);assert.equal(f.w.document.getElementById('active-response-band').style.height,'100px');
 f.run('state.bandPercent=50');assert.equal(f.run('responseBounds().top'),184);height=200;assert.equal(f.run('responseBounds().top'),84);
 const word=f.w.document.createElement('div');Object.defineProperty(word,'offsetHeight',{value:40});f.w.testWord=word;f.run("state.gameActive=true;state.words=[{el:testWord,y:10,processed:false,targets:['A'],totalTargets:1}];handleInput('A')");assert.equal(f.run('state.correct'),0);
 f.run("state.words[0].y=100;handleInput('A')");assert.equal(f.run('state.correct'),1);f.dom.window.close();
}
// A failed spatial sequence is replayed identically, does not advance or erase its error.
{
 const f=fixture('Memoria visuospaziale con numeri.html');f.load();f.run('playSoundErrorClick=()=>{};playSoundSuccessRound=()=>{};playSoundTransition=()=>{};playSoundEndSession=()=>{};startGame(1)');const original=f.run('JSON.stringify(roundData.map(c=>[c.id,c.number]))');f.run('endRound(false)');assert.equal(f.run('sequenceErrors'),1);f.timers.find(t=>t.ms===1800).fn();assert.equal(f.run('currentRound'),1);assert.equal(f.run('JSON.stringify(roundData.map(c=>[c.id,c.number]))'),original);f.run('endRound(true)');assert.equal(f.run('score'),0,'retry success must not turn initial error into first-attempt success');f.timers.find(t=>t.ms===1200).fn();assert.equal(f.run('currentRound'),2);f.dom.window.close();
}
// Questions always refer to the variable scene actually rendered, with unique valid options.
{
 const f=fixture('Memoria visuospaziale con domande.html');const source=read('Memoria visuospaziale con domande.html');const start=source.indexOf('        const colorTranslations ='),end=source.indexOf('        // CONTROL:',source.indexOf('function generateDifficileScene'));
 // Load only the self-contained scene generators; no Firebase or game session activity.
 const functions=source.slice(start,source.indexOf('        // CONTROL:',source.indexOf('function generateDifficileScene')));
 // Stop after the difficult generator, before subsequent game controllers.
 const boundary=functions.indexOf('\n        //',functions.indexOf('questions: selectedQuestions',functions.indexOf('function generateDifficileScene')));
 f.run(functions.slice(0,boundary>0?boundary:undefined));
 for(const difficulty of ['facile','medio','difficile'])for(let i=0;i<60;i++){const result=f.run('generateScene('+JSON.stringify(difficulty)+')');for(const q of result.questions){assert.ok(q.options.includes(q.correct),difficulty+' missing correct option');assert.equal(new Set(q.options).size,q.options.length,'duplicate answer options');assert.ok(q.correct&&!q.correct.includes('undefined'));}const svg=f.w.document.querySelector('#canvas-container svg');assert.equal(svg.getAttribute('role'),'img');}
 f.dom.window.close();
}
// Drawing coordinates follow the displayed canvas size, with a visible pointer and capture.
{
 const f=fixture('Memoria di prosa con distrattori.html'),source=read('Memoria di prosa con distrattori.html');const start=source.indexOf('        let canvas, ctx, drawing = false;'),end=source.indexOf('        function recordAndNext',start);let moved,lined;
 const canvas=f.w.document.getElementById('drawing-canvas');canvas.getContext=()=>({beginPath(){},moveTo(x,y){moved=[x,y];},lineTo(x,y){lined=[x,y];},stroke(){}});canvas.setPointerCapture=()=>{};canvas.getBoundingClientRect=()=>({left:10,top:20,width:150,height:150});
 f.run(source.slice(start,end));f.run('initCanvas()');canvas.onpointerdown({preventDefault(){},pointerId:1,clientX:85,clientY:95});assert.deepEqual(moved,[150,150]);canvas.onpointermove({preventDefault(){},clientX:100,clientY:110});assert.deepEqual(lined,[180,180]);assert.equal(f.w.document.getElementById('drawing-pointer').style.display,'block');canvas.onpointerup();assert.equal(f.w.document.getElementById('drawing-pointer').style.display,'none');f.dom.window.close();
}
console.log('PASS: signed input editing, responsive green-band hit validation, identical sequence retry with honest scoring, and 180 coherent variable scenes. DOM simulation; no live Firebase writes.');
