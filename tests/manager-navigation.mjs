import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync(new URL('../shared/manager-navigation.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'');
const owner='eWoQhl1qwqVKRupDabTM6vfMyyI3';
for(const mode of ['free_training','clinical']){
 const elements=new Map(),panel={hidden:true,style:{}},nav={append(node){elements.set(node.id,node);}};elements.set('cl-tester-management',panel);
 const document={getElementById:id=>elements.get(id),querySelector:()=>nav,createElement(){return {style:{},remove(){elements.delete(this.id);}};}};
 const auth={currentUser:{uid:owner}};let callback,approved=true;
 vm.runInNewContext(source,{document,auth,localStorage:{getItem:()=>mode},onAuthStateChanged:(_,f)=>callback=f,requireProfessional:async()=>{if(!approved)throw Error('denied');return auth.currentUser;}});
 await callback(auth.currentUser);assert.equal(panel.hidden,false);assert.equal(elements.get('cl-create-patient-access').href,'gestisci-tester.html');
 auth.currentUser={uid:'other'};await callback(auth.currentUser);assert.equal(panel.hidden,true);assert.equal(elements.has('cl-create-patient-access'),false);
 approved=false;auth.currentUser={uid:owner};await callback(auth.currentUser);assert.equal(panel.hidden,true);
}
console.log('PASS: owner navigation visible independent of free/clinical mode; hidden on account change or missing professional role.');
