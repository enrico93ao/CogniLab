import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'jsdom');
const dom=new JSDOM(fs.readFileSync(new URL('../conta_cerchi_rossi.html',import.meta.url),'utf8'),{url:'https://example.test/CogniLab/conta_cerchi_rossi.html',runScripts:'outside-only'}),w=dom.window,ctx=dom.getInternalVMContext();const timers=new Map();let next=0,saved=[],aborts=0;w.tailwind={};w.setTimeout=(fn,delay)=>{const id=++next;timers.set(id,{fn,delay});return id};w.clearTimeout=id=>timers.delete(id);w.setInterval=w.setTimeout;w.clearInterval=w.clearTimeout;w.CogniLabRun={begin(){},measure:fn=>fn(),complete:r=>saved.push(r),abort:()=>aborts++};for(const s of w.document.querySelectorAll('script:not([src])'))vm.runInContext(s.textContent,ctx);w.initAudio=()=>{};w.playSound=()=>{};const run=s=>vm.runInContext(s,ctx),field=w.document.getElementById('circle-answer');
function answerTarget(target,mode='continuous'){w.returnToMenu();w.document.getElementById('select-gameplay').value=mode;w.startGame();run('gameState.'+(mode==='continuous'?'continuousTargetSum':'targetCount')+'='+target);w.showQuestionPrompt();}
answerTarget(12);w.appendDigit(1);w.appendDigit(2);assert.equal(field.value,'12');assert.equal(run('gameState.scoreLog.length'),0,'digits must not submit');w.submitNumber();assert.equal(run('gameState.scoreLog[0].user'),12);assert.equal(run('gameState.scoreLog[0].correct'),true);w.submitNumber();assert.equal(run('gameState.scoreLog.length'),1,'double confirmation must not duplicate');
answerTarget(20);w.appendDigit(2);w.appendDigit(9);w.eraseDigit();w.appendDigit(0);assert.equal(field.value,'20');field.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert.equal(run('gameState.scoreLog[0].user'),20);
answerTarget(3,'reset');w.submitNumber();assert.equal(run('gameState.scoreLog.length'),0);for(const bad of ['-1','2.5','abc','1e2']){field.value=bad;w.submitNumber();assert.equal(run('gameState.scoreLog.length'),0);}w.clearAnswer();assert.equal(field.value,'');w.appendDigit(4);w.submitNumber();assert.equal(run('gameState.scoreLog[0].correct'),false);
const pending=[...timers.values()].find(t=>t.delay===900);assert.ok(pending);w.returnToMenu();pending.fn();assert.equal(run('gameState.phase'),'menu','feedback must not reopen a round after menu');assert.equal(w.document.getElementById('feedback-overlay').style.display,'none');
answerTarget(123);w.appendDigit(1);w.appendDigit(2);w.appendDigit(3);w.submitNumber();assert.equal(run('gameState.scoreLog[0].correct'),true);const late=[...timers.values()].find(t=>t.delay===900);w.endContinuousSession();late.fn();assert.equal(run('gameState.phase'),'results');assert.equal(saved.length,1);assert.equal(saved[0].correct,1);assert.equal(saved[0].total,1);assert.ok(aborts>0);
// Two wrong cumulative rounds expose the previous correct subtotal on the next round.
answerTarget(5);field.value='0';w.submitNumber();assert.equal(run('gameState.sumHint'),null);
run("gameState.phase='answer';gameState.continuousTargetSum=9");field.value='0';w.submitNumber();assert.equal(run('gameState.sumHint'),9);assert.equal(run('gameState.scoreLog.filter(r=>r.correct).length'),0);
w.startRound();assert.match(w.document.getElementById('instruction-box').innerText,/precedente era 9/);w.showQuestionPrompt();assert.match(w.document.getElementById('instruction-box').innerText,/precedente era 9/);
run("gameState.phase='answer'");field.value=String(run('gameState.continuousTargetSum'));w.submitNumber();assert.equal(run('gameState.sumHint'),null);
// Dense and narrow play areas, including a constant RNG that forces the fallback.
for (const [width,height] of [[240,180],[280,260],[320,300],[700,300],[1024,500]]) {
 for (let count=2;count<=10;count++) {
  for (let repeat=0;repeat<15;repeat++) {
   const original=w.Math.random;if(repeat===0)w.Math.random=()=>0.5;
   const layout=w.stimulusLayout(count,width,height);
   const points=w.generateNonOverlappingPositions(count,layout.size,width,height);
   w.Math.random=original;assert.equal(points.length,count);
   for(let i=0;i<points.length;i++){
    const p=points[i];assert.ok(p.x>=0&&p.y>=0&&p.x+layout.size<=width&&p.y+layout.size<=height,'stimulus inside area');
    for(let j=0;j<i;j++)assert.ok(Math.abs(p.x-points[j].x)>=layout.size||Math.abs(p.y-points[j].y)>=layout.size,'no overlapping boxes');
   }
  }
 }
}
assert.ok(w.document.getElementById('select-gameplay').textContent.includes('5 prove, massimo 2 minuti'));
dom.window.close();console.log('PASS: multi-digit totals 12/20/123, keypad editing, Enter, validation, no premature/double submission, menu/expiry cancellation result metrics and 675 non-overlapping layouts (including forced fallback).');
