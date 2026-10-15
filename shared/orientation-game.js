import {MONTHS,SEASONS,season,temporalTasks,shuffle} from './training-model.mjs';
const el=id=>document.getElementById(id);
const labels={weekday:'Giorno della settimana',day:'Giorno',month:'Mese',year:'Anno',season:'Stagione'};
const weekdays=['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
let running=false,level,date,city,step=0,questions=[],position=0,attempts=0,correct=0,errors=0,selected=[],useHint=false;
const today=new Date();el('orientation-date').value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
function show(id){for(const name of ['setup','orientation-game','orientation-results'])el(name).hidden=name!==id;}
function normalize(value){return String(value).trim().toLocaleLowerCase('it-IT');}
function button(text,handler){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>handler(b);return b;}
function options(answer,pool){const count=level==='super-easy'?1:level==='advanced'?5:3;return shuffle([answer,...shuffle([...new Set(pool)].filter(v=>normalize(v)!==normalize(answer))).slice(0,count-1)]);}
function makeQuestions(){
 const answers={weekday:weekdays[date.getDay()],day:String(date.getDate()),month:MONTHS[date.getMonth()],year:String(date.getFullYear()),season:season(date)};
 const fields=level==='super-easy'?['weekday','day','month','year']:Object.keys(answers);
 const temporal={title:'Completa i box con la data di riferimento',answer:fields.map(k=>answers[k]),labels:fields.map(k=>labels[k]),pools:fields.map(k=>k==='weekday'?weekdays:k==='day'?Array.from({length:31},(_,i)=>String(i+1)):k==='month'?MONTHS:k==='year'?Array.from({length:9},(_,i)=>String(date.getFullYear()-4+i)):SEASONS)};
 return [temporal,{title:'In quale città ti trovi?',answer:[city],pools:[[city,'Aosta','Torino','Milano','Roma','Genova','Firenze','Bologna']]},{title:'In quale stanza ci si lava i denti?',answer:['bagno'],pools:[['bagno','cucina','camera','soggiorno','studio']]},{title:'Mappa della casa: tocca la cucina',answer:['cucina'],map:true},...temporalTasks(level,date)];
}
el('orientation-form').onsubmit=event=>{
 event.preventDefault();if(!event.currentTarget.reportValidity())return;
 city=el('orientation-city').value.trim();if(!city){el('orientation-city').focus();return;}
 const [y,m,d]=el('orientation-date').value.split('-').map(Number);date=new Date(y,m-1,d,12);level=el('orientation-level').value;useHint=level!=='advanced';
 step=0;attempts=correct=errors=0;questions=makeQuestions();running=true;window.CogniLabRun.begin(level);show('orientation-game');startQuestion();
};
function startQuestion(){position=0;selected=[];el('orientation-status').textContent='';render();}
function render(){
 if(!running)return;const q=questions[step];el('orientation-title').textContent=q.title;el('orientation-step').textContent='Attività '+(step+1)+' di '+questions.length;
 const help=el('orientation-hint');help.hidden=!useHint;help.textContent=useHint?'Aiuto: '+q.answer.join(' → '):'';
 const hintButton=el('orientation-hint-toggle');hintButton.hidden=level==='advanced';hintButton.textContent=useHint?'Nascondi aiuto':'Mostra aiuto';
 el('orientation-calendar').textContent=q.numeric?'Calendario usato: stagioni meteorologiche. Prossimo inizio: '+String(q.next.day)+'/'+String(q.next.month+1)+'/'+q.next.year+'.':'Stagioni meteorologiche: primavera dal 1 marzo, estate dal 1 giugno, autunno dal 1 settembre, inverno dal 1 dicembre.';
 const slots=el('orientation-slots');slots.replaceChildren();q.answer.forEach((answer,index)=>{const slot=document.createElement('div');slot.className='suite-slot'+(index<position?' filled':index===position?' active':'');const caption=document.createElement('span');caption.textContent=q.labels?.[index]||'Passaggio '+(index+1);const value=document.createElement('strong');value.textContent=selected[index]||'Scegli';slot.append(caption,value);slots.append(slot);});
 const choices=el('orientation-choices');choices.replaceChildren();el('orientation-next').hidden=position!==q.answer.length;
 const numeric=el('orientation-number-form');numeric.hidden=!q.numeric||position===q.answer.length;
 if(position===q.answer.length)return;
 if(q.numeric){el('orientation-number').value='';return;}
 let values;
 if(q.map){values=['bagno','cucina','camera','soggiorno'];choices.style.display='grid';choices.style.gridTemplateColumns='1fr 1fr';}
 else{choices.style.display='flex';values=q.pools?options(q.answer[position],q.pools[position]):shuffle([...q.answer].filter(v=>!selected.includes(v)));}
 for(const value of values)choices.append(button(value,b=>choose(value,b)));
}
function choose(value,b){
 if(!running)return;const q=questions[step];if(position>=q.answer.length)return;attempts++;
 if(normalize(value)!==normalize(q.answer[position])){errors++;el('orientation-status').textContent='Riprova: il box evidenziato aspetta un’altra risposta.';b?.classList.add('wrong');return;}
 correct++;selected.push(String(value));position++;el('orientation-status').textContent=position===q.answer.length?'Attività completata. Puoi continuare.':'Corretto. Completa il prossimo box.';render();
}
el('orientation-number-form').onsubmit=event=>{event.preventDefault();if(event.currentTarget.reportValidity())choose(String(Number(el('orientation-number').value)));};
el('orientation-hint-toggle').onclick=()=>{useHint=!useHint;render();};
el('orientation-next').onclick=()=>{if(position!==questions[step].answer.length)return;step++;if(step===questions.length)finish();else startQuestion();};
function finish(){if(!running)return;running=false;show('orientation-results');el('orientation-report').textContent=correct+' risposte corrette · '+errors+' errori · '+step+' attività completate.';window.CogniLabRun.complete({correct,total:attempts,errors,activitiesCompleted:step,activitiesTotal:questions.length});}
el('orientation-finish').onclick=finish;
el('orientation-again').onclick=async()=>{await window.CogniLabRun.waitForSave();show('setup');};
async function back(event){event.preventDefault();await window.CogniLabRun.waitForSave();if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);else location.href='esercizi.html';}
el('orientation-back').onclick=back;el('top-back').onclick=back;
