import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
class Element{
 constructor(){this.children=[];this.style={};this.dataset={};this.classes=new Set();this.classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),remove:(...names)=>names.forEach(name=>this.classes.delete(name)),contains:name=>this.classes.has(name),toggle:(name,on)=>{if(on??!this.classes.has(name)){this.classes.add(name);return true;}this.classes.delete(name);return false;}};}
 append(item){this.children.push(item);}appendChild(item){this.append(item);}setAttribute(key,value){this[key]=value;}after(){}querySelectorAll(){return [];}
}
const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};let spoken=[],results=[];
const document={getElementById:el,createElement:()=>new Element(),querySelectorAll:()=>[]};
const context=vm.createContext({document,Math,console,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},window:{innerWidth:1280,speechSynthesis:{cancel(){},speak:utterance=>spoken.push(utterance.text)},CogniLabObjects:{markup:name=>'<span>'+name+'</span>'},CogniLabRun:{measure:fn=>fn(),complete:value=>results.push(value)}}});
const html=read("Trova l'immagine corrispondente.html");const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];vm.runInContext(scripts.at(-1)[1],context);
vm.runInContext("running=true;currentTargetName='Cane';createCard('🍎',false,'large','Mela');",context);el('game-grid').children[0].onclick();assert.equal(spoken.at(-1),'Mela');assert.equal(el('game-grid').children[0]['aria-label'],'Mela');
vm.runInContext('endGame();initLevel();',context);assert.equal(results.length,1);assert.equal(spoken.length,1,'No new spoken instruction after game completion');
const dashboard=read('shared/dashboard.js');const segment=dashboard.slice(dashboard.indexOf('const feedbackOption='),dashboard.indexOf('window.tornaAllaHome='));
const win={},location={href:'esercizi.html'};let feedbackWrites=0;
const fakeDoc={createElement:()=>({style:{},after(){}}),querySelector:()=>({insertBefore(){}}),getElementById:()=>({style:{}})};
new Function('document','window','feedbackStatus','notice','saveFeedback','finishSession','friendlyError','crypto','localStorage','location','setTimeout','errorCode','auth','sessionStorage',segment)(fakeDoc,win,{}, {},()=>feedbackWrites++,()=>new Promise(()=>{}),()=>'',{randomUUID:()=> 'test-id-12345678'},{removeItem(){}},location,resolve=>resolve(),()=> '',{currentUser:null},{removeItem(){}});
await win.closeFeedbackModal();assert.equal(location.href,'index.html');assert.equal(feedbackWrites,0,'Skipping never writes survey answers');
console.log('PASS: wrong object named aloud; correct accessible name; no late round after completion; skip goes home without questionnaire write.');
