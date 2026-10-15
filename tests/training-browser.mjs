import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer((request,response)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}const content=fs.readFileSync(file);response.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.(mjs|js)$/.test(file)?'text/javascript':'text/html');response.end(content);}catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=process.env.COGNILAB_QA_URL||'http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch({headless:true,...(process.env.COGNILAB_QA_CHROMIUM?{executablePath:process.env.COGNILAB_QA_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process']});
try{
 const context=await browser.newContext();
 // Layout fixtures bypass Firebase authentication and result writes; actual
 // access and persistence are verified by their separate regression tests.
 await context.route('**/shared/exercise-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:`window.CogniLabGymAuthorized=true;window.qaSaved=[];window.CogniLabRun={begin(){document.body.classList.add('cl-task-running')},complete(m){window.qaSaved.push(m);document.body.classList.remove('cl-task-running')},measure:f=>f(),waitForSave:async()=>{},abort(){document.body.classList.remove('cl-task-running')}};`}));
 await context.route('https://**',route=>{if(route.request().url().startsWith('https://cdn.tailwindcss.com')&&process.env.COGNILAB_QA_TAILWIND){const css=fs.readFileSync(process.env.COGNILAB_QA_TAILWIND,'utf8');return route.fulfill({contentType:'text/javascript',body:`const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);`});}return route.abort();});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const files=['Esplorazione visuospaziale multilivello.html','Attenzione alternata.html','Orientamento temporale-spaziale.html','Memoria visuospaziale il Giardino.html','Il pianoforte.html'];
 for(const [width,height] of [[375,812],[820,1180],[1440,900]]){
  await page.setViewportSize({width,height});
  for(const [index,file] of files.entries()){
   await page.goto(base+encodeURIComponent(file));await page.waitForTimeout(150);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' horizontal overflow at '+width);
   assert.ok(await page.locator('h1').first().isVisible(),file+' heading');
   if(process.env.COGNILAB_QA_SCREENSHOTS)await page.screenshot({path:process.env.COGNILAB_QA_SCREENSHOTS+'/'+width+'-'+index+'-setup.png',fullPage:true});
   if(index===0){await page.getByText('Livello Flessibilità (Shifting)',{exact:true}).click();await page.waitForTimeout(50);const box=await page.locator('#instruction-banner').boundingBox();assert.ok(box&&Math.abs(box.x+box.width/2-width/2)<3);assert.ok(await page.locator('#stimulus').isVisible());const rect=await page.locator('#stimulus').boundingBox();assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=width+1&&rect.y+rect.height<=height+1);}
   if(index===1){await page.getByText('Base · Solo numeri',{exact:true}).click();await page.getByText('MODALITÀ STATICA',{exact:true}).click();assert.equal(await page.locator('.node').count(),20);const rects=await page.locator('.node').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));for(const a of rects)assert.ok(a.x>=0&&a.y>=0&&a.x+a.w<=width+1&&a.y+a.h<=height+1);for(let i=0;i<rects.length;i++)for(let j=0;j<i;j++){const a=rects[i],b=rects[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'overlapping trail nodes');}}
   if(index===2){await page.locator('#orientation-city').fill('Cogne');await page.locator('#orientation-start, #orientation-form button[type=submit]').click();assert.equal(await page.locator('.suite-slot').count(),5);}
   if(index>=3){await page.locator('#music-start').click();await page.waitForTimeout(100);assert.equal(await page.locator(index===3?'.garden-cell':'.piano-key').count(),index===3?16:8);}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' game overflow at '+width);
   if(process.env.COGNILAB_QA_SCREENSHOTS)await page.screenshot({path:process.env.COGNILAB_QA_SCREENSHOTS+'/'+width+'-'+index+'-game.png',fullPage:true});
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: five exercise menus and play areas at phone, tablet and desktop widths; centered target instruction; bounded stimuli and non-overlapping trail nodes; no browser script errors.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
