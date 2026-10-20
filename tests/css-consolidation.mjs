import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire}from'node:module';import {consolidateCSS}from'../scripts/assets/css-consolidation.mjs';
const require=createRequire(new URL('../scripts/assets/package.json',import.meta.url)),postcss=require('postcss');
const fixture=postcss.parse('.a{color:red;display:block;display:grid}.b{color:blue}.a{color:red}.a{color:red!important}@media(max-width:650px){.a{color:red}}@keyframes x{from{opacity:1;opacity:1}to{opacity:1}}');
const stats=consolidateCSS(fixture);assert.equal(stats.removed,1);const result=fixture.toString();assert.match(result,/display: block;\s*display: grid/);assert.match(result,/color: red !important/);assert.equal((result.match(/opacity: 1/g)||[]).length,3);assert.match(result,/@media/);const again=postcss.parse(result);assert.equal(consolidateCSS(again).removed,0);assert.equal(again.toString(),result);
const actual=fs.readFileSync(new URL('../shared/public-catalog.css',import.meta.url),'utf8'),copy=postcss.parse(actual);assert.equal(consolidateCSS(copy).removed,0);assert.equal(copy.toString(),actual,'CSS should be formatted and idempotent');
function cascade(css,width,reduced,clip){const map={};postcss.parse(css).walkRules(rule=>{
 for(let p=rule.parent;p&&p.type!=='root';p=p.parent){
  if(p.name==='keyframes')return;
  if(p.name==='media'){const max=p.params.match(/max-width:\s*(\d+)px/);if(max){if(width>Number(max[1]))return;}else if(p.params.includes('prefers-reduced-motion')){if(!reduced)return;}else throw Error('Unsupported media '+p.params);}
  else if(p.name==='supports'){if(p.params==='(overflow:clip)'){if(!clip)return;}else throw Error('Unsupported supports '+p.params);}
 }
 for(const selector of rule.selectors)for(const d of rule.nodes||[])if(d.type==='decl'){const key=JSON.stringify([selector.trim(),d.prop]),previous=map[key];if(!previous||d.important||!previous.important)map[key]={value:d.value,important:Boolean(d.important)};}
 });return map;}
if(process.argv[2]&&process.argv[3]){
 const before=fs.readFileSync(process.argv[2],'utf8'),after=fs.readFileSync(process.argv[3],'utf8');let cases=0;
 for(const width of [320,375,390,768,1280])for(const reduced of [true,false])for(const clip of [true,false]){assert.deepEqual(cascade(before,width,reduced,clip),cascade(after,width,reduced,clip),'Declaration cascade at '+width);cases++;}
 console.log('PASS: identical selector/property winners in '+cases+' combinations of viewport, reduced motion and overflow support. This is CSS analysis, not a browser layout test.');
}
console.log('PASS: only identical shadowed declarations removed; fallbacks, important priority, media rules and keyframes preserved; public stylesheet readable and idempotent.');
