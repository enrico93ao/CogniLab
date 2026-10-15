import {NOTES,FREQUENCIES,cellFrequency,melody,extendMelody} from './training-model.mjs';
const el=id=>document.getElementById(id),piano=document.body.dataset.instrument==='piano';
let audio,playing=false,accepting=false,generation=0,deadline=0,timer,phrase=[],expected=[],cursor=0,length=1,roundErrors=0,stats;
const keys=[];
function tone(index,step=0){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.value=piano?FREQUENCIES[index]:cellFrequency(step);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.16,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+.48);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.5);}catch{el('audio-note').hidden=false;}}
function clearKeys(){keys.forEach(k=>k.classList.remove('active','correct','wrong'));}
function valid(token){return playing&&token===generation&&Date.now()<deadline;}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function show(id){for(const section of ['setup','music-game','music-results'])el(section).hidden=id!==section;}
async function demonstrate(token){
 accepting=false;cursor=0;clearKeys();el('music-status').textContent=roundErrors?'Riguarda la stessa sequenza, poi riprova.':'Guarda e ascolta la sequenza.';
 await sleep(650);if(!valid(token))return;
 for(const [step,index] of phrase.entries()){if(!valid(token))return;keys[index].classList.add('active');tone(index,step);await sleep(460);keys[index].classList.remove('active');if(!valid(token))return;await sleep(150);}
 if(!valid(token))return;accepting=true;el('music-status').textContent=el('music-order')?.value==='inverse'?'Ripeti la sequenza al contrario.':'Ora tocca a te: ripeti la sequenza.';
}
function newRound(){if(!playing)return;roundErrors=0;stats.roundsStarted++;phrase=piano?(phrase.length?extendMelody(phrase).slice(0,length):melody(length)):Array.from({length},()=>Math.floor(Math.random()*16));expected=el('music-order')?.value==='inverse'?[...phrase].reverse():[...phrase];el('music-span').textContent=length+' '+(length===1?'nota':'note');demonstrate(generation);}
async function press(index){
 if(!playing||!accepting)return;
 if(Date.now()>=deadline){finish();return;}
 const token=generation;tone(index,el('music-order')?.value==='inverse'?phrase.length-1-cursor:cursor);clearKeys();
 if(index!==expected[cursor]){stats.errors++;roundErrors++;accepting=false;keys[index].classList.add('wrong');el('music-status').textContent='Riproviamo insieme: ascolta di nuovo la stessa sequenza.';await sleep(850);if(valid(token))demonstrate(token);return;}
 stats.correctNotes++;keys[index].classList.add('active');cursor++;
 if(cursor<expected.length){await sleep(180);if(valid(token))keys[index].classList.remove('active');return;}
 accepting=false;stats.completed++;stats.maxSpan=Math.max(stats.maxSpan,length);if(!roundErrors)stats.firstTry++;
 el('music-count').textContent=stats.completed;el('music-status').textContent='Sequenza corretta!';
 if(piano)length=Math.min(32,length+1);else if(!roundErrors&&stats.firstTry%3===0)length=Math.min(24,length+1);
 await sleep(850);if(valid(token))newRound();
}
const count=piano?8:16,host=el('music-keys');
for(let i=0;i<count;i++){
 const key=document.createElement('button');key.type='button';key.className=piano?'piano-key':'garden-cell';
 key.setAttribute('aria-label',piano?NOTES[i]+' · tasto '+(i+1):'Casella '+(i+1));
 const name=document.createElement('span');name.textContent=piano?NOTES[i]:String(i+1);key.append(name);
 if(piano){const n=document.createElement('span');n.className='key-number';n.textContent=i+1;key.append(n);}
 key.onclick=()=>press(i);host.append(key);keys.push(key);
}
if(piano)for(const edge of [1,2,4,5,6]){const black=document.createElement('span');black.className='piano-black';black.style.left=(edge*12.5)+'%';black.setAttribute('aria-hidden','true');host.append(black);}
function tick(){const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));el('music-time').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');el('music-progress').style.width=(seconds/(Number(el('music-duration').value)*60)*100)+'%';if(!seconds)finish();}
el('music-start').onclick=()=>{
 if(playing)return;window.CogniLabRun.begin();
 try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{el('audio-note').hidden=false;}
 generation++;playing=true;accepting=false;phrase=[];length=piano?1:Number(el('music-level').value);stats={completed:0,roundsStarted:0,maxSpan:0,firstTry:0,correctNotes:0,errors:0};
 deadline=Date.now()+Number(el('music-duration').value)*60000;show('music-game');el('music-count').textContent='0';tick();timer=setInterval(tick,200);newRound();
};
function finish(){if(!playing)return;playing=false;accepting=false;generation++;clearInterval(timer);clearKeys();show('music-results');el('music-report').textContent=stats.completed+' sequenze completate · '+stats.firstTry+' al primo tentativo · '+stats.errors+' errori · sequenza più lunga: '+stats.maxSpan+' note.';window.CogniLabRun.complete({correct:stats.correctNotes,total:stats.correctNotes+stats.errors,errors:stats.errors,score:stats.completed,sequencesCompleted:stats.completed,firstTry:stats.firstTry,longestSpan:stats.maxSpan,roundsStarted:stats.roundsStarted});}
el('music-finish').onclick=finish;
el('music-again').onclick=async()=>{await window.CogniLabRun.waitForSave();show('setup');};
async function back(event){event.preventDefault();await window.CogniLabRun.waitForSave();if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);else location.href='esercizi.html';}
el('music-back').onclick=back;el('top-back').onclick=back;
window.addEventListener('pagehide',()=>{playing=false;generation++;clearInterval(timer);audio?.close().catch(()=>{});});
