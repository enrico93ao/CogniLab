import {deckFor,optionsFor,letterTiles,shuffle} from './language-suite-model.mjs';
import {picture,sceneMarkup} from './language-pictures.mjs';
import {ItalianVoice} from './italian-voice.mjs';
const el=id=>document.getElementById(id),mode=document.body.dataset.languageMode,voice=new ItalianVoice(),clock=new window.CogniLabTaskClock();
let running=false,paused=false,solved=false,index=0,deck=[],stats,roundErrors=0,assisted=false,heard=false,selected=[],tiles=[],sceneOrder=[],generation=0,advanceTimer=null;
const item=()=>deck[index],level=()=>el('language-level').value,workspace=()=>el('language-workspace');
const show=id=>{for(const name of ['setup','language-game','language-results'])el(name).hidden=name!==id;};
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function button(text,id,handler,cls='suite-btn'){const b=make('button',text,cls);b.type='button';if(id)b.id=id;b.onclick=handler;return b;}
function active(){return running&&!paused&&!solved;}
function feedback(ok){window.CogniLabAudio?.feedback(ok);}
function status(text){el('language-status').textContent=text;}
function setAssisted(){assisted=true;}
function speechText(){return mode==='repeat'?item().text:mode==='spell'?item().name:mode==='story'?item().text:item().prompt;}
function speak(replay=false){
 if(!running||paused||solved)return;
 const token=generation;if(mode==='spell')setAssisted();if(replay)stats.replays++;el('language-audio-error').hidden=true;
 if(mode==='repeat'){heard=false;for(const b of workspace().querySelectorAll('button'))b.disabled=true;status('Ascolta, poi prova a ripetere.');}
 voice.speak(speechText(),Number(el('language-rate').value),{done:()=>{if(token!==generation||!active())return;if(mode==='repeat'){heard=true;for(const b of workspace().querySelectorAll('button'))b.disabled=false;status('Ora prova a ripetere. Quando hai finito, premi Ho provato a ripetere.');}},error:()=>{if(token!==generation||!running)return;el('language-audio-error').hidden=false;el('language-audio-error').textContent=mode==='repeat'?'La voce italiana non è disponibile o non ha riprodotto la parola. Controlla l’audio e premi Ascolta di nuovo.':'L’audio non è disponibile. Puoi seguire la consegna scritta e continuare, oppure riprovare con Ascolta di nuovo.';}});
}
function showPicture(name,parent){const n=make('div',undefined,'language-object-wrap');n.innerHTML=picture(name);parent.append(n);}
function clearAdvance(){if(advanceTimer!==null)clock.clearTimeout(advanceTimer);advanceTimer=null;}
function advance(){if(!running||paused||!solved)return;clearAdvance();if(index+1===deck.length)finish();else{index++;render();}}
function doneRound(){
 if(!active())return;solved=true;voice.cancel();stats.completed++;if(mode!=='repeat'){if(!roundErrors&&!assisted)stats.firstTry++;if(assisted)stats.assisted++;else stats.withoutHint++;feedback(true);}for(const b of workspace().querySelectorAll('button'))b.disabled=true;
 el('language-replay').disabled=true;el('language-next').hidden=false;el('language-next').textContent=index+1===deck.length?'Concludi e salva →':'Prossima prova →';status(el('language-status').textContent+' Passaggio automatico tra un istante.');clearAdvance();advanceTimer=clock.setTimeout(()=>{advanceTimer=null;advance();},1200);
}
function fail(){stats.errors++;roundErrors++;feedback(false);}
function repeatBoard(){
 el('language-question').textContent='Ascolta e prova a ripetere';showPicture(item().name,el('language-stimulus'));
 const text=make('p',item().text,'language-word');el('language-stimulus').append(text);
 const actions=make('div',undefined,'language-repeat-actions');actions.append(button('Ho provato a ripetere','language-practiced',()=>{if(!active()||!heard)return;stats.practiced++;status('Tentativo registrato. La pronuncia non è stata valutata dal sito.');doneRound();}),button('Questa volta non ho ripetuto','language-not-practiced',()=>{if(!active()||!heard)return;stats.notPracticed++;status('Puoi passare alla prossima parola.');doneRound();},'suite-btn suite-secondary'));workspace().append(actions);speak();
}
function choiceBoard(){
 el('language-question').textContent=item().prompt;if(mode==='semantic')showPicture(item().image,el('language-stimulus'));
 const options=optionsFor(item(),level()),board=make('div',undefined,'language-grid');board.dataset.count=options.length;
 for(const name of options){const b=button('',null,()=>{
  if(!active()||b.disabled)return;stats.attempts++;
  if(name!==item().answer){fail();b.disabled=true;b.classList.add('wrong');if(roundErrors>=2&&el('language-hints').checked&&!assisted){setAssisted();const correct=[...board.children].find(n=>n.dataset.answer===item().answer);correct.classList.add('hint');correct.setAttribute('aria-label',item().answer+' · immagine suggerita');status('Ti aiuto: scegli l’immagine con il bordo tratteggiato.');}else status('Prova un’altra immagine. Puoi rileggere o riascoltare la domanda.');return;}
  b.classList.add('correct');status('Sì, è questa!');doneRound();
 },'language-choice');b.dataset.answer=name;b.setAttribute('aria-label',name);b.innerHTML=picture(name);if(el('language-labels').checked)b.append(make('span',name,'language-caption'));board.append(b);}
 workspace().append(board);status('Leggi la domanda e scegli l’immagine. Puoi anche ascoltarla.');
}
function spellHelp(full=false){if(!active())return;setAssisted();const hint=el('language-spell-help');hint.hidden=false;hint.textContent=full?'La parola da ricomporre è '+item().name.toUpperCase()+'.':'La parola comincia con '+item().name[0].toUpperCase()+'.';}
function redrawLetters(){
 const answer=el('language-letter-answer');answer.replaceChildren();if(!selected.length)answer.append(make('span','Tocca le lettere qui sotto','language-answer-placeholder'));
 selected.forEach((id,position)=>{answer.append(button(tiles.find(t=>t.id===id).letter,null,()=>{if(!active())return;selected.splice(position,1);redrawLetters();},'language-slot'));});
 for(const b of el('language-letter-bank').children)b.disabled=selected.includes(Number(b.dataset.tile));
}
function spellBoard(){
 el('language-question').textContent='Guarda l’immagine e componi la parola';showPicture(item().name,el('language-stimulus'));
 if(level()==='base')el('language-stimulus').append(make('p',item().name.toUpperCase(),'language-word'));
 const answer=make('div',undefined,'language-answer');answer.id='language-letter-answer';answer.setAttribute('role','group');answer.setAttribute('aria-label','Parola composta: tocca una lettera per toglierla');const bank=make('div',undefined,'language-letter-board');bank.id='language-letter-bank';tiles=letterTiles(item().name,level());
 for(const tile of tiles){const b=button(tile.letter,null,()=>{if(!active()||selected.includes(tile.id))return;selected.push(tile.id);redrawLetters();},'language-tile');b.dataset.tile=tile.id;bank.append(b);}
 const hint=make('p',undefined,'language-help');hint.id='language-spell-help';hint.hidden=true;
 const controls=make('div',undefined,'language-actions');controls.append(button('Cancella le lettere','language-clear',()=>{if(!active())return;selected=[];redrawLetters();},'suite-btn suite-secondary'),button('Aiutami','language-help',()=>spellHelp(true),'suite-btn suite-secondary'),button('Controlla la parola','language-check',()=>{
  if(!active())return;if(!selected.length){status('Scegli le lettere per comporre il nome dell’immagine.');return;}stats.attempts++;const value=selected.map(id=>tiles.find(t=>t.id===id).letter).join('');if(value===item().name.toUpperCase()){status('La parola è corretta!');doneRound();return;}
  fail();status('Rivedi la parola. Puoi toccare una lettera per toglierla o chiedere un aiuto.');if(roundErrors>=2&&el('language-hints').checked)spellHelp(roundErrors>=4);
 }));workspace().append(answer,bank,hint,controls);redrawLetters();status(level()==='avanzato'?'Ci sono due lettere in più: scegli soltanto quelle che servono.':'Tocca le lettere nell’ordine giusto.');
}
function sceneCard(step,position,handler,cls){const b=button('',null,handler,cls);b.dataset.scene=step.scene;b.setAttribute('aria-label',step.caption);b.innerHTML=sceneMarkup(step.scene);if(el('language-labels').checked)b.append(make('span',step.caption,'language-caption'));return b;}
function redrawScenes(){
 const sequence=el('language-scene-sequence');sequence.replaceChildren();if(!selected.length)sequence.append(make('p','Tocca la prima scena, poi le successive.','language-answer-placeholder'));
 selected.forEach((id,i)=>{const step=item().steps[id],b=sceneCard(step,i,()=>{if(!active())return;selected.splice(i,1);redrawScenes();},'language-scene-slot');b.prepend(make('strong',String(i+1)));sequence.append(b);});
 for(const b of el('language-scene-bank').children){const selectedNow=selected.includes(Number(b.dataset.step));b.disabled=selectedNow;b.classList.toggle('selected',selectedNow);}
}
function storyHint(){if(!active())return;setAssisted();const correct=item().steps[0];const hint=el('language-story-help');hint.hidden=false;hint.textContent='Il racconto comincia così: '+correct.caption;const b=[...el('language-scene-bank').children].find(n=>n.dataset.step==='0');if(b)b.classList.add('hint');}
function revealStory(){
 if(!active())return;el('language-story-ready').hidden=true;if(!el('language-story-support').checked)el('language-story-copy').hidden=true;
 const seq=make('div',undefined,'language-scene-sequence');seq.id='language-scene-sequence';seq.setAttribute('role','group');seq.setAttribute('aria-label','La tua sequenza: tocca una scena per toglierla');
 const bank=make('div',undefined,'language-scenes');bank.id='language-scene-bank';bank.dataset.count=item().steps.length;sceneOrder=shuffle(item().steps.map((_,i)=>i));if(sceneOrder.every((v,i)=>v===i))sceneOrder.reverse();
 for(const id of sceneOrder){const b=sceneCard(item().steps[id],id,()=>{if(!active()||selected.includes(id))return;selected.push(id);redrawScenes();},'language-choice language-scene');b.dataset.step=id;bank.append(b);}
 const hint=make('p',undefined,'language-help');hint.id='language-story-help';hint.hidden=true;
 const actions=make('div',undefined,'language-actions');actions.append(button('Ricomincia la sequenza','language-clear',()=>{if(!active())return;selected=[];redrawScenes();},'suite-btn suite-secondary'),button('Aiutami','language-help',storyHint,'suite-btn suite-secondary'),button('Controlla la sequenza','language-check',()=>{
  if(!active())return;if(selected.length!==item().steps.length){status('Scegli tutte le scene prima di controllare.');return;}stats.attempts++;if(selected.every((v,i)=>v===i)){status('Le scene sono nell’ordine del racconto!');doneRound();return;}fail();status('L’ordine non è ancora quello del racconto. Tocca le scene per toglierle e riprova.');if(roundErrors>=2&&el('language-hints').checked)storyHint();
  if(roundErrors>=4&&el('language-hints').checked){const p=el('language-story-help');p.textContent='Rileggi un passaggio alla volta: '+item().text;}
 }));workspace().append(seq,bank,hint,actions);redrawScenes();status('Tocca le scene nell’ordine del racconto.');
}
function storyBoard(){
 el('language-question').textContent='Leggi o ascolta, poi metti in ordine le scene';const story=make('article',undefined,'language-story');story.id='language-story-copy';story.append(make('h3',item().title),make('p',item().text));workspace().append(story,button('Ho letto, scelgo le immagini','language-story-ready',revealStory));status('Puoi premere Ascolta di nuovo per sentire il racconto.');
}
function render(){
 clearAdvance();generation++;solved=false;roundErrors=0;assisted=false;heard=false;selected=[];voice.cancel();workspace().replaceChildren();el('language-stimulus').replaceChildren();el('language-next').hidden=true;el('language-replay').disabled=false;el('language-audio-error').hidden=true;
 el('language-progress').textContent=`${mode==='story'?'Storia':'Prova'} ${index+1} di ${deck.length}`;
 if(mode==='repeat')repeatBoard();else if(mode==='spell')spellBoard();else if(mode==='story')storyBoard();else choiceBoard();
}
function start(){if(running)return;clock.reset();window.CogniLabRun.begin();deck=deckFor(mode,level(),Number(el('language-trials').value));workspace().inert=false;stats={completed:0,firstTry:0,assisted:0,withoutHint:0,errors:0,attempts:0,replays:0,practiced:0,notPracticed:0};index=0;running=true;paused=false;show('language-game');render();}
function finish(){
 if(!running)return;const complete=stats.completed===deck.length;running=false;paused=false;clearAdvance();clock.cancelAll();generation++;voice.cancel();show('language-results');el('language-result-title').textContent=complete?'Esercizio completato':'Esercizio concluso';
 const summary=el('language-summary');summary.replaceChildren();const tile=(value,label)=>{const n=make('div');n.append(make('strong',String(value)),make('span',label));summary.append(n);};
 let metrics={plannedTrials:deck.length,trialsCompleted:stats.completed,allTrialsCompleted:complete,replays:stats.replays};
 if(mode==='repeat'){el('language-report').textContent=`Hai ascoltato ${stats.completed} parole o espressioni sulle ${deck.length} previste. I tentativi sono dichiarati da te: il sito non valuta la pronuncia e non assegna un’accuratezza.`;tile(stats.completed,'Stimoli ascoltati');tile(stats.practiced,'Tentativi dichiarati');tile(stats.notPracticed,'Senza ripetizione');metrics={...metrics,listened:stats.completed,practiced:stats.practiced,notPracticed:stats.notPracticed,oralAssessment:'not-assessed'};}
 else{el('language-report').textContent=`Hai completato ${stats.completed} prove sulle ${deck.length} previste: ${stats.firstTry} al primo tentativo, senza aiuti.`;tile(stats.firstTry,'Al primo tentativo');tile(stats.assisted,'Con suggerimento');tile(stats.errors,'Risposte da rivedere');metrics={...metrics,correct:stats.completed,total:stats.attempts,errors:stats.errors,firstTry:stats.firstTry,assisted:stats.assisted,withoutHint:stats.withoutHint,score:stats.firstTry};}
 window.CogniLabRun[complete?'complete':'interrupt'](metrics);
}
el('language-start').onclick=start;el('language-replay').onclick=()=>speak(true);el('language-next').onclick=advance;
el('language-end').onclick=()=>{if(running&&confirm('Vuoi concludere adesso? Verranno salvate le risposte date finora.'))finish();};el('language-again').onclick=async()=>{await window.CogniLabRun.waitForSave();show('setup');};
async function back(event){event.preventDefault();if(running){if(!confirm('Vuoi uscire? Le risposte date finora saranno salvate.'))return;finish();}await window.CogniLabRun.waitForSave();if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);else location.href='esercizi.html';}
el('language-back').onclick=back;el('language-result-back').onclick=back;
window.CogniLabAssist={isRunning:()=>running,pause:()=>{paused=true;clock.pause();voice.cancel();workspace().inert=true;},resume:()=>{paused=false;clock.resume();workspace().inert=false;if(!solved&&mode==='repeat')speak();},finish,instruction:()=>window.CogniLabExercise.instructions};
window.addEventListener('pagehide',()=>{running=false;clearAdvance();clock.cancelAll();generation++;voice.cancel();});
