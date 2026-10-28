import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';const require=createRequire(import.meta.url),{JSDOM}=require('/tmp/cognilab-qa/node_modules/jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const files=['Ascolta e indica.html','Ascolta e ripeti.html','Ricomponi la parola.html','Rimetti in ordine la storia.html','Quali immagini stanno insieme.html','A cosa serve.html'];
for(const file of files){
 const dom=new JSDOM(read(file),{url:'https://example.test/CogniLab/'+encodeURIComponent(file),runScripts:'outside-only'}),w=dom.window;w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};w.ResizeObserver=class{observe(){}disconnect(){}};
 for(const script of w.document.querySelectorAll('script:not([src])'))w.eval(script.textContent);
 const setupButtons=[...w.document.querySelectorAll('#setup button')].map(b=>b.textContent.trim());w.eval(read('shared/language-premium.js'));
 assert.ok(w.document.body.classList.contains('language-premium'));assert.ok(w.document.querySelector('link[href^="shared/language-premium.css"]'));assert.ok(w.document.querySelector('.cl-language-stage'));
 assert.equal(w.document.querySelectorAll('.lp-features span').length,3);assert.equal(w.document.querySelectorAll('.suite-mark svg').length,1);assert.ok(w.document.querySelector('.lp-stage-meter[role=progressbar]'));assert.deepEqual([...w.document.querySelectorAll('#setup button')].map(b=>b.textContent.trim()),setupButtons);
 assert.equal(w.document.querySelector('#language-replay,#listen-replay').getAttribute('aria-label'),'Ascolta di nuovo');assert.equal(w.document.querySelectorAll('.cl-language-stage button').length,new JSDOM(read(file)).window.document.querySelectorAll('.cl-language-stage button').length);w.close();
}
const home=new JSDOM(read('index.html')).window.document;
const cards=[...home.querySelectorAll('[data-new-language]')];assert.equal(cards.length,6);assert.equal(new Set(cards.map(n=>n.dataset.newLanguage)).size,6);assert.ok(home.querySelector('#language-new-title'));assert.ok(home.querySelector('link[href^="shared/language-home.css"]'));
assert.ok(read('index.html').indexOf('id="language-new-title"')<read('index.html').indexOf('id="news-title"'));
for(const card of cards){assert.ok(card.querySelector('svg'));assert.ok(card.querySelector('h3 a').getAttribute('href').startsWith('esercizi-linguaggio.html#'));}
assert.ok(home.querySelector('.pub-language-entry a[href="accesso.html"]'));assert.equal(home.querySelectorAll('[data-carousel]').length,2);
console.log('PASS: 6 scoped premium pages; configuration button indices preserved; accessible audio controls and progress; unique icons; all six home cards before articles; two existing carousels retained. Geometry checked separately in browser.');
