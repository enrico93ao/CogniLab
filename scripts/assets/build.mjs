import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const dependencyRoot=process.env.COGNILAB_ASSET_DEPS||here;
const require=createRequire(path.join(dependencyRoot,'package.json'));
const tailwindRoot=path.dirname(require.resolve('tailwindcss/package.json'));
const lucideRoot=path.dirname(require.resolve('lucide/package.json'));
if(JSON.parse(fs.readFileSync(path.join(tailwindRoot,'package.json'))).version!=='3.4.17'||JSON.parse(fs.readFileSync(path.join(lucideRoot,'package.json'))).version!=='0.468.0')throw Error('Versioni degli strumenti non corrispondenti al manifest.');
const output=path.join(root,'assets/vendor');fs.mkdirSync(output,{recursive:true});
execFileSync(process.execPath,[path.join(tailwindRoot,'lib/cli.js'),'-c',path.join(here,'tailwind.config.cjs'),'-i',path.join(here,'tailwind.css'),'-o',path.join(output,'exercise-utilities-3.4.17.css'),'--minify'],{cwd:root,stdio:'inherit'});
const allIcons=require('lucide').icons,icons={};
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html')&&/lucide(?:@latest|\.subset)/.test(fs.readFileSync(path.join(root,f),'utf8')));
const names=new Set();
for(const file of files){const source=fs.readFileSync(path.join(root,file),'utf8');for(const match of source.matchAll(/data-lucide=["']([a-z0-9-]+)["']/g))names.add(match[1]);
 // Icon names set through setAttribute also need inclusion.
 for(const match of source.matchAll(/setAttribute\(['"]data-lucide['"],\s*['"]([a-z0-9-]+)['"]\)/g))names.add(match[1]);}
for(const name of names){const key=name.replace(/(\w)(\w*)(_|-|\s*)/g,(_g,a,b)=>a.toUpperCase()+b.toLowerCase());if(!allIcons[key])throw Error('Icona non disponibile: '+name);icons[key]=allIcons[key];}
function source(file){return fs.readFileSync(path.join(lucideRoot,'dist/esm',file),'utf8').replace(/^import .*;\s*$/gm,'').replace(/^export .*;\s*$/gm,'').replace(/^\/\/# sourceMappingURL=.*$/gm,'');}
// Preserve upstream DOM functions, using only the icon nodes required by these exercises.
const element=source('createElement.js'),replace=source('replaceElement.js').replace('const svgElement = createElement([tag, iconAttrs, children]);','const svgElement = createElement$1([tag, iconAttrs, children]);');
const main=source('lucide.js');const start=main.indexOf('const createIcons =');if(start<0)throw Error('API Lucide inattesa.');
const api=main.slice(start).replace('icons = {}','icons = bundledIcons');
fs.writeFileSync(path.join(output,'lucide.subset-0.468.0.js'),'/* Lucide 0.468.0 — ISC; see lucide-LICENSE.txt. Generated subset, not a new icon design. */\n(()=>{\nconst bundledIcons='+JSON.stringify(icons)+';\n'+element+'\n'+replace+'\n'+api+'\nwindow.lucide={createIcons,icons:bundledIcons};\n})();\n');
for(const [directory,name] of [[lucideRoot,'lucide'],[tailwindRoot,'tailwindcss']])fs.copyFileSync(path.join(directory,'LICENSE'),path.join(output,name+'-LICENSE.txt'));
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({tailwindcss:'3.4.17',lucide:'0.468.0',iconNames:[...names].sort()},null,2)+'\n');
console.log(`CSS statico e ${names.size} icone locali generati.`);
