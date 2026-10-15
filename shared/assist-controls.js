(() => {
 const start=document.querySelector('#trail-start,#exploration-start,#music-start,#orientation-form button[type=submit]');if(!start)return;
 const make=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
 const adapter=()=>window.CogniLabAssist;
 const intro=make('div',null,'cl-assist-demo');intro.append(make('span','Vuoi provare prima di iniziare?'));const demo=make('button','Mostrami come si fa');demo.type='button';demo.id='cl-demo-open';intro.append(demo);start.before(intro);
 const bar=make('nav',null,'cl-assist-bar');bar.hidden=true;bar.setAttribute('aria-label','Comandi dell’esercizio');const pause=make('button','Ⅱ Pausa'),help=make('button','Ripeti la consegna'),end=make('button','Concludi');pause.id='cl-task-pause';help.id='cl-task-help';end.id='cl-task-end';bar.append(pause,help,end);document.body.append(bar);document.body.classList.add('cl-assist-enabled');
 const dialog=make('dialog',null,'cl-assist-dialog');dialog.id='cl-assist-dialog';dialog.setAttribute('aria-labelledby','cl-assist-title');document.body.append(dialog);
 let revision=0,paused=false;
 function setPaused(value){if(paused===value)return;paused=value;document.body.classList.toggle('cl-assist-paused',value);if(value)adapter()?.pause();else adapter()?.resume();window.dispatchEvent(new CustomEvent('cognilab-task-pause',{detail:{paused:value}}));}
 function close(){revision++;dialog.close();if(paused)setPaused(false);}
 function open(title){revision++;const alreadyOpen=dialog.open;dialog.replaceChildren();const heading=make('h2',title);heading.id='cl-assist-title';dialog.append(heading);if(!alreadyOpen)dialog.showModal();return revision;}
 function action(text,callback,primary=false){const button=make('button',text,primary?'primary':'');button.type='button';button.onclick=callback;return button;}
 function readInstructions(){return adapter()?.instruction()||'Segui la consegna dell’esercizio e procedi con calma.';}
 function showHelp(){if(adapter()?.isRunning())setPaused(true);open('La consegna');dialog.append(make('p',readInstructions()),make('p','Il gioco resta fermo mentre leggi.'));const actions=make('div',null,'cl-assist-actions');if('speechSynthesis' in window)actions.append(action('Ascolta la consegna',()=>{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(readInstructions());utterance.lang='it-IT';utterance.rate=.85;speechSynthesis.speak(utterance);}));actions.append(action('Riprendi',close,true));dialog.append(actions);}
 pause.onclick=()=>{setPaused(true);open('In pausa');dialog.append(make('p','Timer, movimenti e sequenze sono fermi. Riprendi quando sei pronto.'));const actions=make('div',null,'cl-assist-actions');actions.append(action('Riprendi l’esercizio',close,true),action('Rileggi la consegna',showHelp));dialog.append(actions);};
 help.onclick=showHelp;
 end.onclick=()=>{setPaused(true);open('Concludere la prova?');dialog.append(make('p','Verranno salvati i risultati delle risposte già date.'));const actions=make('div',null,'cl-assist-actions');actions.append(action('Continua la prova',close),action('Concludi e salva',()=>{close();adapter()?.finish();sync();},true));dialog.append(actions);};
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',()=>{revision++;if('speechSynthesis' in window)speechSynthesis.cancel();if(paused)setPaused(false);});
 function sync(){const running=Boolean(adapter()?.isRunning());bar.hidden=!running;if(!running&&paused)close();}
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 demo.onclick=()=>{
  const current=adapter();if(!current)return;
  const token=open('Proviamo insieme');const sample=current.sample();dialog.append(make('p','Esempio guidato, senza timer e senza punteggio. Questa prova non viene salvata.'));
  const instruction=make('p',sample.instruction);dialog.append(instruction);const exampleSlot=sample.boxLabel?make('div',sample.boxLabel+': scegli la risposta','cl-assist-example-slot'):null;if(exampleSlot)dialog.append(exampleSlot);const board=make('div',null,'cl-assist-sample'),status=make('p','', 'cl-assist-status');status.setAttribute('role','status');dialog.append(board,status);
  let cursor=0,accepting=!sample.watch;const buttons=[];
  const finish=()=>{status.textContent='Hai completato l’esempio. Ora puoi tornare al menu e iniziare la sessione.';buttons.forEach(button=>button.disabled=true);};
  const hint=()=>buttons.forEach((button,index)=>button.classList.toggle('next',accepting&&!sample.watch&&index===sample.order[cursor]));
  sample.labels.forEach((text,index)=>{const button=action(text,()=>{if(!accepting||token!==revision)return;current.preview?.(index,sample.playOrder?.indexOf(index)??cursor);if(index!==sample.order[cursor]){button.classList.add('wrong');status.textContent='Riprova: tocca '+sample.labels[sample.order[cursor]]+'.';buttons[sample.order[cursor]].classList.add('next');return;}button.classList.remove('wrong','next');button.classList.add('done');if(exampleSlot)exampleSlot.textContent=sample.boxLabel+': '+sample.labels[index];cursor++;if(cursor===sample.order.length){accepting=false;finish();}else{status.textContent='Corretto. Continua.';hint();}});if(sample.shapes){const shape=make('span',null,'cl-assist-shape '+sample.shapes[index]);shape.setAttribute('aria-hidden','true');button.prepend(shape);}buttons.push(button);board.append(button);});hint();
  if(sample.watch){buttons.forEach(button=>button.disabled=true);const watch=action('Mostra l’esempio',async()=>{watch.disabled=true;status.textContent='Guarda e ascolta…';for(const [step,index] of (sample.playOrder||sample.order).entries()){if(token!==revision)return;buttons.forEach(button=>button.classList.remove('next'));buttons[index].classList.add('next');current.preview?.(index,step);await new Promise(resolve=>setTimeout(resolve,600));}if(token!==revision)return;buttons.forEach(button=>{button.classList.remove('next');button.disabled=false;});accepting=true;status.textContent='Adesso ripeti la sequenza che hai visto.';});dialog.append(watch);}
  const actions=make('div',null,'cl-assist-actions');actions.append(action('Torna al menu',close,true));dialog.append(actions);
 };
 sync();
})();
