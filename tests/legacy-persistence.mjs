import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire}from'node:module';
import {exercises}from'../shared/exercise-catalog.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
for(const {file}of exercises){const html=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');for(const token of ['firebase-firestore.js','signInAnonymously','__firebase_config','__initial_auth_token','firebasejs/','firebase.database(','firebase.initializeApp('])assert.ok(!html.includes(token),file+': legacy pipeline '+token);assert.ok(html.includes('exercise-runtime.js'),file+' missing shared runtime');}
const cases=[
 ['Cancellazione di H.html',"stimuli=[{isTarget:true,cancelled:true,x:1},{isTarget:true,cancelled:true,x:2},{isTarget:true,cancelled:true,x:3},{isTarget:true,cancelled:false,x:4}];endExercise()",3,4],
 ['Doppio compito e velocità.html','state.correct=3;state.missed=1;endGame()',3,4],
 ["Trova l'intruso.html",'stats.isActive=true;stats.foundCount=3;stats.errorCount=1;endGame()',3,4],
 ['Set shifting.html',"trialsHistory=[{correct:true,rt:200,trialType:'mantenimento'},{correct:true,rt:300,trialType:'switch'},{correct:true,rt:250,trialType:'mantenimento'},{correct:false,rt:400,trialType:'switch'}];calculateMetricsAndSave()",3,4],
 ['Memoria di lavoro avanzato.html',"state.sessionData=[{city:'Aosta',monument:'Arco',time:'09:00'},{city:'Torino',monument:'Mole',time:'10:00'},{city:'Roma',monument:'Colosseo',time:'11:00'}];document.getElementById('ans-q1').value='Roma';document.getElementById('ans-q2').value='10:00';document.getElementById('ans-q3').value='Arco';checkAnswers()",3,3],
 ['Riconoscimento visivo.html','stats.totalCorrect=3;stats.totalErrors=1;showSummary()',3,4],
 ['Conta i numeri e le lettere.html','stats.correctResponses=3;stats.totalAttempts=4;stats.errors=1;showFinalSummary()',3,4],
 ['Catena di parole.html','stats.correct=3;stats.wrong=1;window.finishSession()',3,4],
 ['Il semaforo delle parole.html','state.stats.correctGo=2;state.stats.correctNoGo=1;state.stats.totalGo=3;state.stats.totalNoGo=1;endSession()',3,4],
 ['Memoria di prosa con distrattori.html','window.stats.initialCorrectAnswers=3;window.stats.finalCorrectAnswers=3;window.stats.totalQuestions=4;goToStats()',3,4],
 ['Memoria visuospaziale con domande.html',"questions=[{q:'A'},{q:'B'},{q:'C'},{q:'D'}];userAnswers=[{isCorrect:true},{isCorrect:true},{isCorrect:true},{isCorrect:false}];showResults()",3,4]
];
for(const [file,finish,correct,total]of cases){
 const html=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const dom=new JSDOM(html,{url:'https://example.test/'+encodeURIComponent(file)+'?sessione=true&pazienteId=someone-else&sessionId=other-session&nextUrl=https://untrusted.example/&returnUrl=https://untrusted.example/',runScripts:'outside-only'}),w=dom.window,results=[];
 w.setTimeout=()=>1;w.clearTimeout=()=>{};w.setInterval=()=>1;w.clearInterval=()=>{};w.requestAnimationFrame=()=>1;w.alert=()=>{throw Error('Unexpected legacy alert');};
 const node=()=>({connect(){},start(){},stop(){},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}}});
 w.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.destination={};}resume(){}createOscillator(){return node();}createGain(){return node();}};
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
 w.lucide={createIcons(){}};w.cancelAnimationFrame=()=>{};
 w.CogniLabAudio={handles:()=>true,feedback(){}};w.CogniLabRun={begin(){},complete:metrics=>{results.push(metrics);return Promise.resolve(true);},measure:f=>{try{return f();}catch{return null;}},waitForSave:async()=>false};
 for(const script of w.document.querySelectorAll('script:not([src])'))if(['','module','text/javascript'].includes(script.type))vm.runInContext(script.textContent,dom.getInternalVMContext());
 if(file==='Conta i numeri e le lettere.html')vm.runInContext(fs.readFileSync(new URL('../shared/count-memory.js',import.meta.url),'utf8'),dom.getInternalVMContext());
 await vm.runInContext(finish,dom.getInternalVMContext());
 assert.equal(results.length,1,file+' must emit exactly one shared completion');assert.equal(results[0].correct,correct,file);assert.equal(results[0].total,total,file);assert.equal(w.location.hostname,'example.test',file+' redirected from URL');
 if(file==='Memoria di prosa con distrattori.html'){await vm.runInContext('returnToGym()',dom.getInternalVMContext());assert.equal(w.location.hostname,'example.test');assert.equal(w.document.getElementById('btn-save-database').disabled,false);}
 dom.window.close();
}
console.log('PASS: no exercise contains legacy Firestore/anonymous setup; all eleven migrated games emit one correct result through the shared bridge even with hostile patient/session/redirect URL parameters. Prose return waits for confirmed saving. No Firebase calls.');
