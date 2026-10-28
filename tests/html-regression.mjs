import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require = createRequire(import.meta.url);
const {JSDOM} = require(process.env.COGNILAB_QA_JSDOM || 'jsdom');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const dom = (name, query = '') => { const page = new JSDOM(read(name), {url: 'https://example.test/CogniLab/' + name + query, runScripts:'outside-only'}); contexts.set(page.window, page.getInternalVMContext()); return page; };
const contexts = new WeakMap();
const execute = (window, name) => vm.runInContext(read(name), contexts.get(window));
let nativeScripts = 0;
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const page = dom(name);
  for (const script of page.window.document.querySelectorAll('script:not([src]):not([type="module"]):not([type="application/json"]):not([type="application/ld+json"])')) {
    new vm.Script(script.textContent, {filename:name}); nativeScripts++;
  }
  assert.ok([...page.window.document.querySelectorAll('link[rel="stylesheet"]')].some(link => /^shared\/(cognilab|public-catalog)\.css(?:\?|$)/.test(link.getAttribute('href'))), name);
  assert.ok(!read(name).includes('localStorage.clear()'), name + ': no global storage erasure');
  page.window.close();
}
const catalogContext = {window:{}}; vm.runInNewContext(read('shared/catalog.js'), catalogContext);
const catalog = catalogContext.window.CogniLabCatalog;
assert.equal(catalog.length, 39);
for (const item of catalog) assert.ok(fs.existsSync(path.join(root,item.file)), item.file);
{
  const page = dom('index.html'); const w = page.window;
  w.localStorage.setItem('saved-history','keep-me');
  for (const script of w.document.querySelectorAll('script:not([src]):not([type="application/ld+json"]):not([type="module"])')) vm.runInContext(script.textContent, contexts.get(w));
  assert.equal(w.localStorage.getItem('saved-history'),'keep-me'); w.close();
}
for (const [param, valid] of [
  ['',true], ['?file=Stroop.html',true],
  ['?file=Attenzione%2520alternata.html',true],
  ['?file=javascript%3Aalert(1)',false], ['?file=https%3A%2F%2Fevil.test',false],
  ['?file=..%2Findex.html',false], ['?file=%25ZZ',false]
]) {
  const page = dom('esercizio.html',param); const w = page.window;
  w.localStorage.setItem('global_timer_start','corrupt');
  execute(w,'shared/catalog.js'); execute(w,'shared/exercise-shell.js');
  assert.equal(w.document.getElementById('exercise-frame').hidden,!valid,param);
  assert.equal(w.document.getElementById('cl-load-error').hidden,valid,param);
  assert.ok(!w.document.getElementById('global-timer').textContent.includes('NaN'));
  if(valid) assert.ok(!w.document.getElementById('cl-direct-link').hidden);
  w.close();
}
{
  const page = dom('esercizi.html'); const w = page.window;
  execute(w,'shared/interface.js'); w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const input = w.document.getElementById('cl-search-input');
  input.value = 'visuospaziale'; input.dispatchEvent(new w.Event('input'));
  assert.ok([...w.document.querySelectorAll('.card')].some(card => !card.hidden));
  input.value = 'xyz non esiste'; input.dispatchEvent(new w.Event('input'));
  assert.ok([...w.document.querySelectorAll('.card')].every(card => card.hidden));
  assert.equal(w.document.querySelector('.cl-empty').hidden,false);
  input.value = ''; input.dispatchEvent(new w.Event('input'));
  assert.equal([...w.document.querySelectorAll('.card')].filter(card => !card.hidden).length,39);
  assert.equal(w.document.querySelector('.kpi-grid'),null);
  assert.equal(w.document.querySelector('.card').getAttribute('role'),'link');
  w.close();
}
{
  const page = dom('Conta i numeri e le lettere.html'); const w = page.window;
  const ids = [...w.document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
  let exposure;
  w.setTimeout = callback => {exposure = callback; return 1;}; w.clearTimeout = () => {};
  for(const script of w.document.querySelectorAll('script:not([src]):not([type="module"])')) vm.runInContext(script.textContent, contexts.get(w));
  execute(w,'shared/count-memory.js');
  w.initGame(); assert.equal(w.eval('countPhase'),'exposure');
  assert.equal(w.document.querySelectorAll('#game-area .stimulus').length,4);
  exposure(); assert.equal(w.eval('countPhase'),'answer');
  w.checkAnswers(); assert.equal(w.eval('stats.totalAttempts'),0,'Blank answer rejected');
  w.document.getElementById('input-numbers').value = w.eval('countNumbers');
  w.document.getElementById('input-letters').value = w.eval('countLetters');
  w.checkAnswers(); w.checkAnswers();
  assert.equal(w.eval('stats.totalAttempts'),2,'No duplicate submissions');
  assert.equal(w.eval('stats.correctResponses'),2);
  w.nextLevel(); assert.equal(w.eval('currentLevel'),2); exposure();
  w.document.getElementById('input-numbers').value = '99'; w.document.getElementById('input-letters').value = '99';
  w.checkAnswers(); assert.equal(w.eval('lives'),2); assert.equal(w.eval('stats.errors'),2);
  w.showFinalSummary(); assert.equal(w.document.getElementById('stat-accuracy').innerText,'50%');
  w.initGame(); assert.equal(w.eval('stats.totalAttempts'),0,'Reset on a fresh session');
  w.showFinalSummary(); exposure(); assert.equal(w.eval('countPhase'),'summary','Cancelled exposure cannot reopen answers');
  w.close();
}
console.log(`PASS: ${nativeScripts} native scripts; 39 exercise links; shared theme; home persistence; safe iframe URLs; timer recovery; catalog search; counting game lifecycle and metrics.`);
