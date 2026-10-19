import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {exercises} from '../shared/exercise-catalog.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.COGNILAB_QA_JSDOM||'jsdom');
const root=fileURLToPath(new URL('../',import.meta.url));
const results=[],modules=new Set();
for(const exercise of exercises){
 const issues=[],html=fs.readFileSync(path.join(root,exercise.file),'utf8');
 const dom=new JSDOM(html),doc=dom.window.document;
 const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);
 for(const id of new Set(ids))if(ids.filter(x=>x===id).length>1)issues.push('ID duplicato: '+id);
 let scripts=0;
 for(const s of doc.querySelectorAll('script')){
  const type=s.getAttribute('type')||'';
  if(s.src){const raw=s.getAttribute('src');if(/^(https?:)?\/\//.test(raw))continue;const file=decodeURIComponent(raw.split(/[?#]/)[0]);if(!fs.existsSync(path.join(root,file)))issues.push('Script assente: '+file);else modules.add(file);continue;}
  if(type && !['module','text/javascript','application/javascript'].includes(type))continue;
  try{if(type==='module')new vm.SourceTextModule(s.textContent);else new vm.Script(s.textContent);scripts++;}catch(e){issues.push('Sintassi: '+e.message);}
 }
 for(const el of doc.querySelectorAll('link[rel="stylesheet"],img[src]')){
  const raw=el.getAttribute('href')||el.getAttribute('src');if(!raw||/^(https?:|data:|\/\/|#)/.test(raw))continue;
  const file=decodeURIComponent(raw.split(/[?#]/)[0]);if(!fs.existsSync(path.join(root,file)))issues.push('Risorsa assente: '+file);
 }
 if(!html.includes('CogniLabExercise'))issues.push('Metadati esercizio assenti');
 if(!html.includes('exercise-runtime.js'))issues.push('Runtime risultati assente');
 results.push({title:exercise.title,file:exercise.file,scripts,issues});dom.window.close();
}
for(const file of modules){const source=fs.readFileSync(path.join(root,file),'utf8');try{new vm.SourceTextModule(source);}catch(e){results.push({file,issues:['Sintassi script condiviso: '+e.message]});}}
console.log(JSON.stringify({scope:'Analisi statica: sintassi, risorse locali dichiarate, ID, metadati e runtime. Non esegue i giochi né chiama Firebase.',exercises:exercises.length,sharedScripts:modules.size,results},null,2));
if(results.some(r=>r.issues.length))process.exitCode=1;
