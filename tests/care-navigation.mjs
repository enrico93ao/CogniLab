import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url),{JSDOM,VirtualConsole}=require(process.env.COGNILAB_QA_JSDOM||'/tmp/cognilab-qa/node_modules/jsdom');
const source=fs.readFileSync(new URL('../shared/shell-account.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,''),flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
for(const index of [0,1]){
 const files=['Stroop.html','Attenzione alternata.html'],dom=new JSDOM('<div class="cl-exercise-heading"></div><iframe id="exercise-frame"></iframe>',{url:'https://example.test/esercizio.html?file='+encodeURIComponent(files[index]),runScripts:'outside-only',virtualConsole:new VirtualConsole()}),w=dom.window;
 w.auth={currentUser:{uid:'patient'}};w.authReady=Promise.resolve();let sharing='pending',finished=0;w.saveResult=async()=>({sharingState:sharing});w.finishSession=async()=>{finished++;};w.friendlyError=()=> 'Errore';
 w.sessionStorage.setItem('cognilab.plan.patient',JSON.stringify({programId:'plan',files,index,completedSlots:index?[0]:[]}));w.sessionStorage.setItem('cognilab.session.patient',JSON.stringify({programId:'plan',programSlot:String(index)}));
 await w.eval('(async()=>{'+source+'})()');const b=w.document.querySelector('button'),frame=w.document.querySelector('iframe');frame.contentWindow.postMessage=()=>{};
 const send=async(status='completed')=>{w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data:{type:'cognilab-result-v3',result:{id:'result',status}}}));await flush();};
 await send();assert.equal(b.disabled,true,'pending sharing cannot advance the program');sharing='saved';await send('interrupted');assert.equal(b.disabled,true,'interrupted exercise cannot advance');await send();assert.equal(b.disabled,false);b.click();await flush();
 if(index===0){assert.equal(JSON.parse(w.sessionStorage.getItem('cognilab.plan.patient')).index,1);assert.equal(JSON.parse(w.sessionStorage.getItem('cognilab.session.patient')).programSlot,'1');}
 else{assert.equal(finished,1);assert.equal(w.sessionStorage.getItem('cognilab.plan.patient'),null);}w.close();
}
console.log('PASS: assigned sequence advances only on saved completion; pending sharing and interruptions stay on the exercise; next slot retained; last exercise concludes once. DOM simulation.');
