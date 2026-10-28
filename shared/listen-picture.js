import {makeDeck,choicesFor} from './listen-picture-model.mjs';
const el=id=>document.getElementById(id),clock=new window.CogniLabTaskClock();
let running=false,ready=false,answered=false,index=0,errorsThisWord=0,assisted=false,deck=[],stats,utterance=null,speechToken=0,watchdog;
const show=id=>{for(const name of ['setup','listen-game','listen-results'])el(name).hidden=name!==id;};
const target=()=>deck[index];
function cancelSpeech(){speechToken++;clearTimeout(watchdog);if(utterance){utterance.onend=null;utterance.onerror=null;}utterance=null;window.speechSynthesis?.cancel();}
function setChoicesEnabled(enabled){for(const b of el('listen-options').children)b.disabled=!enabled||b.dataset.rejected==='true';}
function audioFailure(){if(!running)return;cancelSpeech();ready=false;setChoicesEnabled(false);el('listen-audio-error').hidden=false;el('listen-status').textContent='Riprova l’audio prima di scegliere.';}
function speak(replay=false){
 if(!running||answered||clock.paused)return;
 cancelSpeech();ready=false;setChoicesEnabled(false);el('listen-audio-error').hidden=true;
 const synth=window.speechSynthesis;if(!synth||!window.SpeechSynthesisUtterance){audioFailure();return;}
 const voices=synth.getVoices(),italian=voices.find(v=>/^it(?:-|_)/i.test(v.lang));
 if(voices.length&&!italian){audioFailure();return;}
 if(replay)stats.replays++;
 const token=speechToken;utterance=new SpeechSynthesisUtterance(target().name);utterance.lang='it-IT';utterance.rate=Number(el('listen-rate').value);if(italian)utterance.voice=italian;
 utterance.onend=()=>{clearTimeout(watchdog);if(!running||token!==speechToken||clock.paused)return;ready=true;setChoicesEnabled(true);el('listen-status').textContent=assisted?'L’immagine con il bordo tratteggiato è quella richiesta. Tocca l’immagine.':'Ora tocca l’immagine corrispondente.';};
 utterance.onerror=()=>{if(token===speechToken)audioFailure();};
 el('listen-status').textContent='Ascolta la parola…';watchdog=setTimeout(()=>{if(token===speechToken)audioFailure();},12000);
 try{synth.speak(utterance);}catch{audioFailure();}
}
function render(){
 ready=false;answered=false;errorsThisWord=0;assisted=false;el('listen-next').hidden=true;el('listen-replay').disabled=false;
 el('listen-progress').textContent=`Parola ${index+1} di ${deck.length}`;
 const options=el('listen-options');options.replaceChildren();const choices=choicesFor(target(),el('listen-level').value);options.dataset.count=choices.length;
 for(const item of choices){const b=document.createElement('button');b.type='button';b.className='listen-choice';b.dataset.word=item.name;b.setAttribute('aria-label',item.name);b.disabled=true;b.innerHTML=window.CogniLabObjects.markup(item.name);if(el('listen-labels').checked){const label=document.createElement('span');label.className='listen-label';label.textContent=item.name;b.append(label);}b.onclick=()=>choose(b,item);options.append(b);}
 speak();
}
function choose(button,item){
 if(!running||!ready||answered||clock.paused||button.disabled)return;
 stats.selections++;
 if(item.name!==target().name){stats.errors++;errorsThisWord++;button.dataset.rejected='true';button.disabled=true;button.classList.add('wrong');window.CogniLabAudio?.feedback(false);
  if(errorsThisWord>=2&&el('listen-hints').checked&&!assisted){assisted=true;const correct=[...el('listen-options').children].find(b=>b.dataset.word===target().name);correct.classList.add('hint');correct.setAttribute('aria-label',target().name+' · immagine suggerita');el('listen-status').textContent='Ti aiuto: cerca l’immagine con il bordo tratteggiato.';}
  else el('listen-status').textContent='Prova un’altra immagine. Se vuoi, riascolta la parola.';
  return;
 }
 answered=true;ready=false;stats.correct++;if(!errorsThisWord)stats.firstTry++;if(assisted)stats.assisted++;else stats.withoutHint++;button.classList.add('correct');const badge=document.createElement('span');badge.className='listen-badge';badge.setAttribute('aria-hidden','true');badge.textContent='✓';button.append(badge);setChoicesEnabled(false);window.CogniLabAudio?.feedback(true);el('listen-replay').disabled=true;el('listen-status').textContent='Sì, è questa!';el('listen-next').hidden=false;el('listen-next').textContent=index+1===deck.length?'Concludi e salva →':'Prossima parola →';el('listen-next').focus({preventScroll:true});
}
function start(){if(running)return;clock.reset();window.CogniLabRun.begin();deck=makeDeck(Number(el('listen-trials').value));index=0;stats={correct:0,firstTry:0,assisted:0,withoutHint:0,errors:0,selections:0,replays:0};running=true;show('listen-game');render();}
function finish(){
 if(!running)return;running=false;ready=false;cancelSpeech();clock.cancelAll();show('listen-results');
 const complete=stats.correct===deck.length;el('listen-result-title').textContent=complete?'Esercizio completato':'Esercizio concluso';el('listen-report').textContent=`Hai riconosciuto ${stats.correct} parole sulle ${deck.length} previste. ${stats.withoutHint} senza suggerimento. Puoi ritrovare questa prova nei tuoi risultati.`;
 el('listen-independent').textContent=stats.firstTry;el('listen-supported').textContent=stats.assisted;el('listen-errors').textContent=stats.errors;
 // Accuracy uses actual selections, never a fictitious perfect score after retries.
 window.CogniLabRun[complete?'complete':'interrupt']({correct:stats.correct,total:stats.selections,errors:stats.errors,score:stats.firstTry,firstTry:stats.firstTry,assisted:stats.assisted,withoutHint:stats.withoutHint,replays:stats.replays,plannedWords:deck.length,wordsCompleted:stats.correct,allWordsCompleted:complete});
}
el('listen-start').onclick=start;el('listen-replay').onclick=()=>speak(true);el('listen-audio-retry').onclick=()=>speak(true);
el('listen-next').onclick=()=>{if(!running||!answered||clock.paused)return;if(index+1===deck.length){finish();return;}index++;render();};
el('listen-end').onclick=()=>{if(!running)return;if(confirm('Vuoi concludere adesso? Verranno salvate le risposte date finora.'))finish();};
el('listen-again').onclick=async()=>{await window.CogniLabRun.waitForSave();show('setup');};
async function back(event){event.preventDefault();if(running){if(!confirm('Vuoi uscire? Le risposte date finora saranno salvate.'))return;finish();}await window.CogniLabRun.waitForSave();if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);else location.href='esercizi.html';}
el('listen-back').onclick=back;el('listen-result-back').onclick=back;
window.CogniLabAssist={isRunning:()=>running,pause:()=>{clock.pause();ready=false;cancelSpeech();setChoicesEnabled(false);},resume:()=>{clock.resume();if(!answered)speak();},finish,instruction:()=>window.CogniLabExercise.instructions};
window.addEventListener('pagehide',()=>{running=false;cancelSpeech();clock.cancelAll();});
