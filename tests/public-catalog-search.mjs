import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
class Element{constructor(text=''){this.textContent=text;this.hidden=false;this.dataset={};this.value='';this.listeners={};this.attributes={};}addEventListener(type,fn){this.listeners[type]=fn;}setAttribute(name,value){this.attributes[name]=value;}}
const cards=[...read('catalogo-esercizi.html').matchAll(/<article class="pub-exercise"[^>]*data-exercise data-area="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(([,area,html])=>{const card=new Element(html.replace(/<[^>]+>/g,' '));card.dataset.area=area;return card;});assert.equal(cards.length,38);
const controls=new Element(),input=new Element(),results=new Element(),empty=new Element();controls.hidden=true;
const buttons=['all','memoria','attenzione','linguaggio','ragionamento','visuospaziali','orientamento'].map(area=>{const b=new Element();b.dataset.filter=area;return b;});controls.querySelectorAll=()=>buttons;
const elements={'public-filters':controls,'public-search':input,'public-results':results,'public-no-results':empty};const document={getElementById:id=>elements[id],querySelectorAll:()=>cards};
vm.runInNewContext(read('shared/public-catalog.js'),{document,window:{}});assert.equal(controls.hidden,false);assert.ok(cards.every(c=>!c.hidden));
input.value='STROOP';input.listeners.input();assert.equal(cards.filter(c=>!c.hidden).length,1);assert.match(results.textContent,/1 esercizio/);
input.value='cifrário';input.listeners.input();assert.equal(cards.filter(c=>!c.hidden).length,1);
input.value='';buttons.find(b=>b.dataset.filter==='attenzione').listeners.click();assert.ok(cards.some(c=>!c.hidden));assert.ok(cards.filter(c=>!c.hidden).every(c=>c.dataset.area==='attenzione'));assert.equal(buttons.find(b=>b.dataset.filter==='attenzione').attributes['aria-pressed'],'true');
input.value='parola-assente-123';input.listeners.input();assert.ok(cards.every(c=>c.hidden));assert.equal(empty.hidden,false);
input.value='';buttons[0].listeners.click();assert.equal(cards.filter(c=>!c.hidden).length,38);assert.equal(empty.hidden,true);
console.log('PASS: 38 static cards; progressive search, accent/case handling, category filtering, zero-results state, reset and pressed state. No browser/Firebase session used.');
