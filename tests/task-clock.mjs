import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
let now=0,id=0;const jobs=new Map();
const context={window:{},Date:{now:()=>now},setTimeout:(fn,ms)=>{jobs.set(++id,{fn,at:now+ms});return id;},clearTimeout:id=>jobs.delete(id),requestAnimationFrame:fn=>{jobs.set(++id,{fn,at:now+16});return id;},cancelAnimationFrame:id=>jobs.delete(id)};
vm.runInNewContext(read('shared/task-clock.js'),context);const clock=new context.window.CogniLabTaskClock();
function advance(ms){const end=now+ms;while(true){const next=[...jobs].filter(([,job])=>job.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);next[1].fn();}now=end;}
let callbacks=0,ticks=0,frames=0;clock.setTimeout(()=>callbacks++,1000);clock.setInterval(()=>ticks++,100);clock.requestAnimationFrame(()=>frames++);advance(250);assert.equal(ticks,2);assert.equal(frames,1);clock.pause();const frozen=clock.now();advance(10000);assert.equal(clock.now(),frozen);assert.equal(ticks,2);assert.equal(callbacks,0);clock.resume();advance(749);assert.equal(callbacks,0);advance(1);assert.equal(callbacks,1);clock.cancelAll();const count=ticks;advance(500);assert.equal(ticks,count);clock.reset();assert.equal(clock.paused,false);
// The real result bridge excludes pause intervals from recorded active time.
const dom=new JSDOM('<!doctype html><body></body>',{runScripts:'outside-only',url:'https://example.test/CogniLab/'}),w=dom.window;let real=0;w.Date.now=()=>real;w.CogniLabGymAuthorized=true;w.CogniLabExercise={id:'test',title:'Test',category:'Test'};
w.eval(read('shared/exercise-runtime.js').replace("import('./gym-gate.js')","Promise.resolve()"));w.CogniLabRun.begin();real=1000;w.dispatchEvent(new w.CustomEvent('cognilab-task-pause',{detail:{paused:true}}));real=11000;w.dispatchEvent(new w.CustomEvent('cognilab-task-pause',{detail:{paused:false}}));real=12000;const result=w.CogniLabRun.abort();assert.equal(result.durationMs,2000);assert.equal(result.pausedMs,10000);w.close();
console.log('PASS: task timeouts, intervals and animation frames freeze and resume; callbacks cancel on finish; recorded active duration excludes pause time.');
