import assert from 'node:assert/strict';
import fs from 'node:fs';
import {trailLayout} from '../shared/training-model.mjs';
import {withAccessTimeout} from '../shared/access-timeout.js';
for(const [w,h] of [[320,450],[375,600],[820,700],[1440,750]])for(const n of [16,20,26,32])for(let seed=1;seed<=10;seed++){
 let state=seed;const rng=()=>((state=(state*1664525+1013904223)>>>0)/4294967296);
 const {size,points}=trailLayout(n,w,h,rng);assert.equal(points.length,n);
 assert.ok(new Set(points.map(p=>p.x)).size===n);assert.ok(new Set(points.map(p=>p.y)).size===n);
 for(let i=0;i<n;i++){const p=points[i];assert.ok(p.x>=size/2&&p.x<=w-size/2);assert.ok(p.y>=104+size/2&&p.y<=h-12-size/2);for(let j=0;j<i;j++)assert.ok(Math.hypot(p.x-points[j].x,p.y-points[j].y)>=size+7.99);}
}
await assert.rejects(withAccessTimeout(new Promise(()=>{}),'test-timeout',5),e=>e.code==='test-timeout');
assert.equal(await withAccessTimeout(Promise.resolve('ok'),'unused',10),'ok');
const source=fs.readFileSync(new URL('../shared/gym-access.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
const user={uid:'approved',isAnonymous:false},auth={currentUser:user};
const gate=new Function('auth','authReady','db','accessModeReady','ref','get','withAccessTimeout',source+';return requireGymAccess;')(auth,Promise.resolve(),{},new Promise(()=>{}),(_,p)=>p,p=>p.includes('/professionals/')?Promise.resolve({val:()=>true}):new Promise(()=>{}),(p,c)=>withAccessTimeout(p,c,30));
assert.equal(await withAccessTimeout(gate(),'gate-stalled',100),user);
console.log('PASS: 160 scattered layouts without overlap; stalled requests time out; approved professional enters despite stalled tester/public flag reads.');
const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const {JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');
for(const failure of ['password','role']){
 const dom=new JSDOM(fs.readFileSync(new URL('../area-clinica.html',import.meta.url),'utf8'),{url:'https://example.test/',runScripts:'outside-only'}),w=dom.window;
 w.authReady=Promise.resolve();w.auth={};w.signInWithEmailAndPassword=()=>failure==='password'?new Promise(()=>{}):Promise.resolve();w.requireProfessional=()=>new Promise(()=>{});
 w.withAccessTimeout=(p,c)=>withAccessTimeout(p,c,5);w.friendlyError=e=>e.code;w.clinicalMessage=e=>e.code;
 // Bound the real role function too, as production does at the DB read.
 if(failure==='role')w.requireProfessional=()=>withAccessTimeout(new Promise(()=>{}),'clinical-check-timeout',5);
 w.eval(fs.readFileSync(new URL('../shared/clinical-login.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,''));
 const form=w.document.getElementById('clinical-login');form.elements.email.value='test@example.test';form.elements.password.value='test-password';
 await form.onsubmit({preventDefault(){}});
 assert.equal(w.document.getElementById('status').textContent,failure==='password'?'access-login-timeout':'clinical-check-timeout');assert.ok([...w.document.querySelectorAll('button')].every(b=>!b.disabled));w.close();
}
console.log('PASS: clinical login releases buttons and reports the failed stage when password or role requests stall.');
