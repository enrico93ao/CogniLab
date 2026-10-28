import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require('/tmp/cognilab-qa/node_modules/jsdom');
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
for(const file of ['Il cifrario.html','Il semaforo delle parole.html',"L'orologio invisibile.html",'Memoria visuospaziale con numeri.html','Memoria visuospaziale con domande.html','Memoria visuospaziale rotante.html','Memoria di prosa con distrattori.html']){
 const source=read(file);assert.doesNotMatch(source,/superiore alla media|normotipica|affaticamento corticale|riserve cognitive di autoregolazione|Stato cognitivo stimato:|memoria a lungo termine intatta|Prestazione Deficitaria|Conforme HIPAA|plasticità cerebrale eccezionale/i,file);
}
assert.match(read('esercizi-orientamento.html'),/convenzione scelta per l’esercizio/);assert.doesNotMatch(read('esercizi-orientamento.html'),/conferma il luogo|calendario meteorologico/i);
assert.doesNotMatch(read('catalogo-esercizi.html'),/proprie\.\.<\/p>|differente\.\.<\/p>/);
assert.match(read('index.html'),/39 esercizi in italiano/);assert.match(read('dott-enrico-dalessandro.html'),/San Camillo/);
const source=read('shared/care-presets.js').replace('window.CogniLabConfiguration={capture,apply};','window.CogniLabConfiguration={capture,apply,findStart};');
{
 const d=new JSDOM('<section id="setup"><button onclick="initSession()">Avvia esercizio</button></section>',{url:'https://example.test/?configure=1',runScripts:'outside-only'}),w=d.window;w.CogniLabExercise={setup:'setup'};w.eval(source);
 assert.ok(w.CogniLabConfiguration.findStart({start:{index:0,label:'Avvia Sessione di Test',handler:'initSession()'}}));assert.throws(()=>w.CogniLabConfiguration.findStart({start:{index:0,label:'Comando sconosciuto',handler:'initSession()'}}));assert.throws(()=>w.CogniLabConfiguration.findStart({start:{index:0,label:'Avvia Sessione di Test',handler:'other()'}}));w.close();
}
{
 const old='Livello 2\n                        MENTAL BENDER\n                    \n                    Estremo\n                    \n                        Griglia 5x5 con 5 cells da ricordare. La griglia subirà una rotazione casuale (90°, 180° o speculare).';
 const current=old.replace('MENTAL BENDER','LIVELLO AVANZATO').replace('5 cells','5 caselle');
 const d=new JSDOM('<section id="setup"><button onclick="chooseMode()"></button></section>',{url:'https://example.test/?configure=1',runScripts:'outside-only'}),w=d.window;w.CogniLabExercise={setup:'setup'};let clicked=0;const b=w.document.querySelector('button');b.textContent=current;b.onclick=()=>clicked++;w.eval(source);w.CogniLabConfiguration.apply({format:1,controls:[],buttons:[{panel:'setup',index:0,label:old}]});assert.equal(clicked,1);w.close();
}
console.log('PASS: descriptive feedback replaces ungrounded clinical judgments; public orientation text and punctuation corrected; old start/menu labels still apply, unknown labels/handlers rejected. DOM fixtures.');
