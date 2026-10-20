import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {JSDOM}=require('jsdom');
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const pages=fs.readdirSync(root).filter(p=>p.endsWith('.html'));let count=0;
const css=read('assets/vendor/exercise-utilities-3.4.17.css');
for(const page of pages){const html=read(page);assert.ok(!html.includes('cdn.tailwindcss.com'),page+' still uses CDN compiler');assert.ok(!html.includes('lucide@latest'),page+' still uses floating icons');assert.ok(!html.includes('tailwind.config'),page+' still uses runtime configuration');if(html.includes('exercise-utilities-3.4.17.css'))count++;}
assert.equal(count,32);
for(const selector of ['.hidden{','.flex{','.grid-cols-2{','.bg-clinical-600{','.border-clinical-600{','.hover\\:bg-clinical-700:hover{','.bg-clinical-50\\/30{','.w-\\[18px\\]{'])assert.ok(css.includes(selector),'Missing compiled selector '+selector);
const manifest=JSON.parse(read('assets/vendor/manifest.json'));
const dom=new JSDOM('<main>'+manifest.iconNames.map(name=>`<i data-lucide="${name}" class="w-5" aria-hidden="true"></i>`).join('')+'</main>',{runScripts:'outside-only'});dom.window.eval(read('assets/vendor/lucide.subset-0.468.0.js'));dom.window.lucide.createIcons();assert.equal(dom.window.document.querySelectorAll('svg').length,manifest.iconNames.length);for(const svg of dom.window.document.querySelectorAll('svg')){assert.ok(svg.querySelector('path,rect,circle,line,polyline,polygon,ellipse'));assert.equal(svg.getAttribute('aria-hidden'),'true');assert.ok(svg.classList.contains('w-5'));}dom.window.lucide.createIcons();assert.equal(dom.window.document.querySelectorAll('svg').length,manifest.iconNames.length);dom.window.close();
console.log('PASS: 32 exercise pages use static local CSS; no runtime Tailwind or floating Lucide; clinical colors, transient states, arbitrary sizes compiled; every bundled icon renders with preserved attributes.');
