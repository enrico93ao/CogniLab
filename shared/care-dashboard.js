import {sessionDuration,exerciseDuration,durationLabel,durationExplanation} from './session-duration.mjs';
import {mountFeedbackSummary,feedbackManagerUid} from './feedback-summary.js?v=feedback39';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {auth} from './firebase-client.js';
import {currentCareUser,patientWorkspace,checkCareStorage,professionalPatients,professionalPatient,registerManagedPatient,invitePatient,setConnection,assignProgram,sendAssignmentNotification,archiveProgram,setPatientArchived,startAssignedProgram,careError} from './care-store.js?v=edit41';
import {programProgress,resultsFromCare} from './care-model.mjs';
import {exercises,exerciseById} from './exercise-catalog.mjs';
import {createProgressView} from './progress-view.js?v=journey36';
import {pendingCare,retryPending} from './progress-store.js';
import {requireProfessional} from './clinical-access.js';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,handler,cls='')=>{const b=el('button',text,cls);b.type='button';b.onclick=handler;return b;};
const card=(heading,eyebrow)=>{const n=el('section',undefined,'care-card');if(eyebrow)n.append(el('div',eyebrow,'care-eyebrow'));if(heading)n.append(el('h2',heading));return n;};
const empty=text=>el('p',text,'care-empty');
const field=(label,control)=>{const n=el('label',label);n.append(control);return n;};
const input=(name,placeholder,max=80)=>{const n=el('input');n.name=name;n.placeholder=placeholder;n.maxLength=max;n.required=true;return n;};
const workspace=document.getElementById('care-workspace');
const status=el('p','Caricamento dello spazio personale…','care-notice');status.setAttribute('role','status');status.setAttribute('aria-live','polite');workspace.append(status);
function message(text,error=false){status.textContent=text;status.className='care-notice'+(error?' error':'');}
async function action(b,operation,success){
 b.disabled=true;b.setAttribute('aria-busy','true');const local=b.careStatus||el('p');b.careStatus=local;local.textContent='Operazione in corso…';local.className='care-action-status care-muted';local.setAttribute('role','status');if(!local.isConnected)b.after(local);
 try{await operation();local.textContent=success||'Operazione completata.';if(success)message(success);}catch(error){local.textContent=careError(error);local.classList.add('care-notice','error');message(careError(error),true);}finally{b.disabled=false;b.removeAttribute('aria-busy');}
}
const notificationUpdates=new Map();
const notificationKey=(patientUid,programId)=>auth.currentUser?.uid+'|'+patientUid+'|'+programId;
window.addEventListener('cognilab-notification-change',event=>{const {patientUid,programId,status}=event.detail||{};if(!status?.message)return;notificationUpdates.set(notificationKey(patientUid,programId),status);for(const notice of workspace.querySelectorAll('[data-notification-program]'))if(notice.dataset.notificationProgram===programId&&notice.dataset.notificationPatient===patientUid)notice.textContent=status.message;});
function programCard(program,{professional=false,patientUid,onChange,onEdit}={}){
 const node=el('article',undefined,'care-program'),progress=programProgress(program,program.sessions),done=progress.remaining===0;
 const row=el('div',undefined,'care-heading-row');row.append(el('h3',program.name),el('span',program.status==='archived'?'Archiviato':done?'Completato':'In corso','care-badge'+(program.status==='archived'?' archived':'')));node.append(row);
 if(!professional)node.append(el('p','Assegnato da '+program.professionalName,'care-muted'));
 const bar=el('progress');bar.max=program.totalSessions;bar.value=Math.min(progress.completed,program.totalSessions);bar.setAttribute('aria-label',progress.completed+' sessioni completate su '+program.totalSessions);node.append(bar);
 const totals=el('div',undefined,'care-totals');totals.append(el('strong',progress.completed+' / '+program.totalSessions+' sessioni completate'),el('span',progress.percent+'%'));node.append(totals);
 if(program.schedule?.length)node.append(el('p','Calendario: '+program.schedule.map(day=>day.split('-').reverse().join('/')).join(' · '),'care-muted'));
 const duration=el('p',durationLabel(sessionDuration(program)),'care-duration');duration.setAttribute('aria-label',duration.textContent);node.append(duration);const timingNote=el('details');timingNote.append(el('summary','Come viene stimata la durata'),el('p',durationExplanation,'care-muted'));node.append(timingNote);
 if(program.instructions)node.append(el('p',program.instructions));
 const details=el('details'),summary=el('summary',program.exercises.length+' prove per ogni sessione');details.append(summary);const list=el('ol');for(const [slot,id] of program.exercises.entries())list.append(el('li',(exerciseById.get(id)?.title||'Esercizio non disponibile')+' · '+durationLabel(exerciseDuration(id,program.configurations?.[slot])).replace('Durata stimata per sessione: ','')));details.append(list);node.append(details);
 if(program.schedule?.[progress.completed]&&!done)node.append(el('p','Prossima sessione prevista: '+program.schedule[progress.completed].split('-').reverse().join('/'),'care-muted'));
 if(progress.resume&&!done&&program.status==='active')node.append(el('p','Sessione da riprendere: '+progress.resume.progress.completed+' esercizi su '+progress.resume.progress.total+' già salvati.','care-muted'));
 if(!professional&&program.status==='active'&&!done){
  const b=button(progress.resume?'Riprendi la sessione':'Inizia sessione '+(progress.completed+1),()=>action(b,async()=>{location.href=await startAssignedProgram(program.id);}), 'primary');node.append(b);
 }
 if(professional&&onEdit)node.append(button(program.status==='active'?'Recupera e modifica':'Recupera come nuovo programma',()=>onEdit(program)));
 if(professional&&program.status==='active'){
  const fresh=notificationUpdates.get(notificationKey(patientUid,program.id)),notification=fresh&&fresh.updatedAt>=(program.notification?.updatedAt||0)?fresh:program.notification;
  const notice=el('p',notification?.message||'Notifica email non ancora richiesta.','care-muted');notice.dataset.notificationProgram=program.id;notice.dataset.notificationPatient=patientUid;notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');node.append(notice);
  const notify=button('Invia / verifica notifica email',()=>action(notify,async()=>{const result=await sendAssignmentNotification(patientUid,program.id);await onChange();if(result.state!=='sent')throw Error(result.message);}));node.append(notify);

  const b=button('Elimina assegnazione',()=>{if(confirm('Rimuovere questa assegnazione dai programmi attivi? Il paziente non potrà avviare altre sessioni del programma. Risultati e configurazione resteranno nello storico dei programmi archiviati.'))action(b,async()=>{await archiveProgram(patientUid,program.id);await onChange();},'Assegnazione rimossa dai programmi attivi e conservata nello storico.');},'danger');node.append(b);
 }
 if(professional&&progress.sessions.length){const history=el('details'),s=el('summary','Dettaglio delle sessioni');history.append(s);const ul=el('ul');for(const item of progress.sessions){const date=new Date(item.startedAt).toLocaleDateString('it-IT');ul.append(el('li',date+(item.scheduledDate?' (prevista '+item.scheduledDate.split('-').reverse().join('/')+')':'')+' · '+(item.progress.complete?'Completa':item.status==='interrupted'?'Interrotta':'Da riprendere')+' · '+item.progress.completed+'/'+item.progress.total+' esercizi'));}history.append(ul);node.append(history);}
 return node;
}
async function patientView(user){
 const shortcut=document.querySelector('.care-shortcuts a[href="#care-workspace"]');if(shortcut)shortcut.textContent='Il mio programma';
 const top=card('Il tuo allenamento, un passo alla volta','IL TUO PERCORSO');top.classList.add('care-hero');top.append(el('p','Qui trovi i programmi del professionista. Puoi riprendere una sessione lasciata a metà e ritrovare i risultati anche da un altro dispositivo.'));
 const refresh=button('Aggiorna programmi',()=>action(refresh,load));top.append(refresh);workspace.append(top);
 const grid=el('div',undefined,'care-grid'),programHost=card('I programmi assegnati','DA SVOLGERE'),account=card('Un percorso su misura per te','SUPPORTO PROFESSIONALE');grid.append(programHost,account);workspace.append(grid);
 const list=el('div');programHost.append(list);
 account.append(el('p','Richiedi il supporto di un professionista per costruire il tuo percorso di stimolazione personalizzato.','care-muted'));
 const support=el('a','Invia richiesta di supporto','primary');support.href='contatti.html?richiesta=percorso-personalizzato';account.append(support);
 const accountDetails=el('details');accountDetails.append(el('summary','Il mio codice account'),el('code',user.uid,'care-code'));account.append(accountDetails);
 const invites=el('div');account.append(invites);
 let version=0;
 async function load(){
  const revision=++version;const data=await patientWorkspace();if(revision!==version||auth.currentUser?.uid!==user.uid)return;
  list.replaceChildren();if(!data.programs.length)list.append(empty('Non hai ancora programmi assegnati. Puoi usare gli esercizi della palestra mentre attendi le indicazioni del professionista.'));
  if(data.programs.some(p=>p.status==='active')){const copy=document.getElementById('welcome-subtext');if(copy)copy.textContent='Segui il programma assegnato dal professionista oppure scegli un esercizio dalla palestra.';}
  const archived=el('details');archived.append(el('summary','Programmi archiviati'));let archivedCount=0;
  for(const program of data.programs.sort((a,b)=>b.createdAt-a.createdAt)){if(program.status==='archived'){archived.append(programCard(program));archivedCount++;}else list.append(programCard(program));}if(archivedCount)list.append(archived);
  invites.replaceChildren();
  if(!Object.keys(data.invites).length)invites.append(el('p','Il professionista ti guiderà nella scelta degli esercizi e dei livelli più adatti.','care-muted'));
  for(const [uid,invite] of Object.entries(data.invites)){
   const connected=data.links[uid]===true,n=el('div',undefined,'care-invite');n.append(el('h3',invite.professionalName));
   n.append(el('p',connected?'Collegamento attivo. Il professionista vede i risultati dei programmi che ti ha assegnato.':'Accettando permetti a questo professionista di assegnarti programmi e di vedere i risultati di quei programmi. Gli altri esercizi del tuo storico restano privati.','care-muted'));
   n.append(el('code',uid,'care-code'));
   const b=button(connected?'Interrompi collegamento':'Accetta collegamento',()=>{
    if(connected&&!confirm('Interrompere il collegamento? Il professionista non potrà più consultare questi risultati o assegnare nuovi programmi. I tuoi risultati personali resteranno nel tuo account.'))return;
    action(b,async()=>{await setConnection(uid,!connected);await load();},connected?'Collegamento interrotto.':'Collegamento accettato. Il professionista può assegnarti il programma.');
   },connected?'danger':'primary');n.append(b);invites.append(n);
  }
  const queued=Object.keys(pendingCare(user.uid)).length;
  message(queued?queued+' risultati salvati nel tuo account attendono la condivisione con il professionista. Usa “Riprova sincronizzazione”.':'Programmi aggiornati alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})+'.');
 }
 const retry=button('Riprova sincronizzazione',()=>action(retry,async()=>{await retryPending();await load();},'Sincronizzazione completata.'));programHost.append(retry);
 await load();
 window.addEventListener('pageshow',event=>{if(event.persisted)load().catch(error=>message(careError(error),true));});
}
async function professionalView(user){
 await requireProfessional();
 if(user.uid===feedbackManagerUid)mountFeedbackSummary(workspace);
 const progressLink=document.querySelector('.care-shortcuts a[href="#care-personal-progress"]');if(progressLink)progressLink.href='#care-registered-progress';
 const top=card('Programmi e progressi dei pazienti','SPAZIO PROFESSIONISTA');top.classList.add('care-hero');top.append(el('p','Collega un account registrato, prepara una sequenza di esercizi e segui le sessioni svolte dal paziente. I risultati sono distinti per esercizio e impostazioni.'));
 const refresh=button('Aggiorna pazienti e risultati',()=>action(refresh,async()=>{await loadRoster();await loadSelected();}));top.append(refresh);workspace.append(top);
 const setup=el('div',undefined,'care-grid'),roster=card('Pazienti e richieste','MONITORAGGIO'),invite=card('Collega un paziente','NUOVO COLLEGAMENTO');setup.append(roster,invite);workspace.append(setup);
 const select=el('select');select.id='care-patient-select';roster.append(field('Seleziona un paziente registrato',select));
 const linkStatus=el('p',undefined,'care-muted');roster.append(linkStatus);
 const removed=el('details');removed.append(el('summary','Pazienti rimossi · recupera'));const removedList=el('div');removed.append(removedList);roster.append(removed);
 const removePatient=button('Rimuovi paziente dall’elenco',()=>{
  const patientUid=select.value;if(!patientUid)return;
  if(!confirm('Rimuovere questo paziente dal tuo elenco? Potrai recuperarlo da “Pazienti rimossi”. Account, collegamento, risultati e programmi già assegnati restano attivi: per interrompere un programma usa “Elimina assegnazione”.'))return;
  action(removePatient,async()=>{await setPatientArchived(patientUid,true);selected='';select.value='';await loadRoster();await loadSelected();},'Paziente rimosso dall’elenco. Puoi recuperarlo da Pazienti rimossi.');
 },'danger');removePatient.hidden=true;roster.append(removePatient);
 roster.append(el('p','Il codice account si trova nella dashboard del paziente. La semplice anagrafica delle sessioni in studio non crea un collegamento con un account.','care-muted'));
 const form=el('form'),name=input('name','Nome o identificativo del paziente'),uid=input('uid','Codice copiato dalla dashboard del paziente',128);uid.autocomplete='off';name.autocomplete='off';form.append(field('Nome nel tuo elenco',name),field('Codice account paziente',uid));
 const submit=el('button','Invia richiesta di collegamento','primary');submit.type='submit';form.append(submit);invite.append(form);
 invite.append(el('p','Il paziente riceverà la richiesta nella propria dashboard. Durante il test deve avere già un account abilitato alla palestra.','care-muted'));
 const detail=card('Il programma del paziente','PIANIFICAZIONE');workspace.append(detail);const content=el('div');detail.append(content);
 const chartHost=el('section');chartHost.id='care-registered-progress';workspace.append(chartHost);const chart=createProgressView(chartHost,{title:'Progressi dei programmi assegnati'});chart.render([]);
 let records={},selected='',revision=0;
 async function loadRoster(){
  records=await professionalPatients();if(auth.currentUser?.uid!==user.uid)return;
  const previous=select.value||selected;select.replaceChildren();const placeholder=el('option',Object.keys(records).length?'Scegli un paziente':'Nessun paziente collegato');placeholder.value='';select.append(placeholder);
  removedList.replaceChildren();
  for(const [id,record] of Object.entries(records).sort(([,a],[,b])=>a.name.localeCompare(b.name))){
   if(record.archived===true){const row=el('p',record.name+' '),restore=button('Ripristina paziente',()=>action(restore,async()=>{await setPatientArchived(id,false);await loadRoster();},'Paziente ripristinato nell’elenco.'));row.append(restore);removedList.append(row);continue;}
   const option=el('option',record.name);option.value=id;select.append(option);
  }if(records[previous]&&records[previous].archived!==true)select.value=previous;
  removed.hidden=!removedList.childElementCount;
 }
 async function loadSelected(){
  selected=select.value;removePatient.hidden=!selected;const current=++revision;content.replaceChildren();chart.render([]);
  if(!selected){content.append(empty('Seleziona un paziente per vedere i suoi programmi o crearne uno nuovo.'));linkStatus.textContent='';return;}
  linkStatus.textContent='Verifica del collegamento…';const data=await professionalPatient(selected,records[selected]);
  if(current!==revision||auth.currentUser?.uid!==user.uid)return;
  chart.setTitle('Progressi di '+records[selected].name);linkStatus.textContent=data.accepted?'Collegamento attivo: puoi assegnare un programma.':'In attesa di accettazione, oppure collegamento interrotto dal paziente.';
  if(!data.accepted&&user.uid==='eWoQhl1qwqVKRupDabTM6vfMyyI3'&&records[selected].managedAccount!==true){
   const automatic=button('Account creato da me: collega automaticamente',()=>{if(!confirm('Confermi di aver creato tu questo account? Il collegamento consentirà l’assegnazione dei programmi e la consultazione dei relativi risultati senza accettazione del paziente.'))return;action(automatic,async()=>{await registerManagedPatient(selected);await loadRoster();await loadSelected();},'Account del gestore collegato automaticamente.');},'primary');content.append(automatic);
  }
  if(!data.accepted){content.append(empty('Il paziente deve accettare il collegamento nella propria dashboard. I suoi risultati non sono accessibili fino a quel momento.'));return;}
  content.append(el('p',records[selected].notificationEmail?'Notifiche inviate automaticamente all’email dell’account: '+records[selected].notificationEmail:'Email dell’account non ancora disponibile: verrà sincronizzata al prossimo accesso del paziente, con le regole Firebase aggiornate.','care-muted'));
  if(!data.programs.length)content.append(empty('Nessun programma assegnato. Prepara il primo qui sotto.'));
  const archived=el('details');archived.append(el('summary','Assegnazioni eliminate · storico e configurazioni'));let archivedCount=0;
  let editor;const editProgram=program=>{const draft=builder(selected,loadSelected,program);editor.replaceWith(draft);editor=draft;editor.scrollIntoView?.({behavior:'smooth',block:'start'});editor.querySelector('input')?.focus();};
  for(const program of data.programs.sort((a,b)=>b.createdAt-a.createdAt)){const entry=programCard(program,{professional:true,patientUid:selected,onChange:async()=>{await loadRoster();await loadSelected();},onEdit:editProgram});if(program.status==='archived'){archived.append(entry);archivedCount++;}else content.append(entry);}
  if(archivedCount)content.append(archived);
  chart.render(data.programs.flatMap(p=>resultsFromCare(p.sessions)));
  editor=builder(selected,loadSelected);content.append(editor);message('Dati aggiornati alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})+'.');
 }
 select.onchange=()=>{loadSelected().catch(error=>message(careError(error),true));};
 form.onsubmit=event=>{event.preventDefault();action(submit,async()=>{const patientUid=uid.value.trim();await invitePatient(patientUid,name.value);selected=patientUid;form.reset();await loadRoster();select.value=patientUid;await loadSelected();},'Richiesta inviata. Il paziente deve accettarla dalla propria dashboard.');};
 function builder(patientUid,reload,sourceProgram=null){
  const wrap=el('div',undefined,'care-builder');wrap.append(el('h3',sourceProgram?'Modifica programma recuperato':'Crea un programma'));if(sourceProgram)wrap.append(el('p','Stai recuperando “'+sourceProgram.name+'”. Il salvataggio crea una nuova assegnazione con conteggio delle sessioni da zero e invia una nuova notifica. L’assegnazione precedente viene archiviata se attiva; risultati e sessioni già svolte restano nello storico. Controlla numero di sessioni e date prima di confermare.','care-notice'));
  const f=el('form'),title=input('title','Es. Attenzione e memoria · primo percorso'),sessions=input('sessions','',2);sessions.type='number';sessions.min='1';sessions.max='60';sessions.value=String(sourceProgram?.totalSessions||6);title.value=sourceProgram?.name||'';
  const row=el('div',undefined,'care-inline');row.append(field('Titolo del programma',title),field('Numero di sessioni',sessions));f.append(row);
  const instructions=el('textarea');instructions.maxLength=1000;instructions.value=sourceProgram?.instructions||'';instructions.placeholder='Indicazioni pratiche per svolgere il programma';f.append(field('Indicazioni per il paziente (facoltative)',instructions));
  f.append(el('p','Ogni sessione ripete la sequenza qui sotto. Usa “Aggiungi variante” per inserire più volte lo stesso esercizio con impostazioni diverse. Configura ogni voce dal suo menu e indica quante volte ripeterla. Le impostazioni saranno predisposte per il paziente. I grafici separeranno le configurazioni diverse.','care-muted'));
  const fs=el('fieldset');fs.append(el('legend','Scegli gli esercizi (massimo 100 voci, incluse le varianti)'));const search=input('search','Cerca un esercizio',100);search.type='search';search.required=false;fs.append(field('Cerca nel catalogo',search));const catalog=el('div',undefined,'care-catalog');fs.append(catalog);f.append(fs);
  const dates=el('textarea');dates.placeholder='2026-10-20\n2026-10-22\n2026-10-24';dates.required=false;dates.hidden=true;f.append(dates);const calendar=el('fieldset');calendar.append(el('legend','Calendario delle sessioni'));const dateFields=el('div',undefined,'care-inline');calendar.append(dateFields);f.append(calendar);const renderCalendar=()=>{const previous=[...dateFields.querySelectorAll('input')].map(n=>n.value);dateFields.replaceChildren();for(let i=0;i<Math.min(60,Number(sessions.value)||0);i++){const date=el('input');date.type='date';date.required=true;date.value=previous[i]||sourceProgram?.schedule?.[i]||'';date.oninput=()=>{dates.value=[...dateFields.querySelectorAll('input')].map(n=>n.value).join('\n');};dateFields.append(field('Sessione '+(i+1),date));}dates.value=[...dateFields.querySelectorAll('input')].map(n=>n.value).join('\n');};renderCalendar();
  const presets=new Map(),repetitions=new Map();
  const order=el('ol',undefined,'care-order'),count=el('p','Nessun esercizio selezionato.','care-muted');const duration=el('p','Aggiungi un esercizio per stimare la durata','care-duration');duration.setAttribute('role','status');duration.setAttribute('aria-live','polite');f.append(count,duration,el('p',durationExplanation,'care-muted'),order);let chosen=[],nextEntry=0;const checks=new Map();
  const renderOrder=()=>{order.replaceChildren();const trials=chosen.reduce((sum,entry)=>sum+(repetitions.get(entry.key)||1),0);count.textContent=chosen.length?trials+' prove per sessione · '+(trials*Number(sessions.value||0))+' prove previste nel programma.':'Nessun esercizio selezionato.';
   const sequence=[],configurations=[];for(const {id,key} of chosen){for(let n=0;n<(repetitions.get(key)||1)&&n<10;n++){sequence.push(id);configurations.push(presets.get(key));}}duration.textContent=durationLabel(sessionDuration({exercises:sequence,configurations}));
   chosen.forEach((entry,index)=>{const {id,key}=entry;const li=el('li');li.dataset.entryKey=key;li.append(el('span',exerciseById.get(id).title+' · Voce '+(index+1)));li.append(el('small',durationLabel(exerciseDuration(id,presets.get(key))).replace('Durata stimata per sessione: ','Durata della prova: '),'care-muted'));const controls=el('div',undefined,'care-actions');
    const repeat=el('input');repeat.type='number';repeat.min='1';repeat.max='10';repeat.value=String(repetitions.get(key)||1);repeat.setAttribute('aria-label','Ripetizioni di '+exerciseById.get(id).title);repeat.onchange=()=>{repetitions.set(key,Number(repeat.value));renderOrder();};controls.append(field('Ripetizioni per sessione',repeat));
    const configure=button(presets.has(key)?'Configurazione salvata ✓':'Configura esercizio',()=>{
     const dialog=el('dialog');dialog.className='care-config-dialog';const frame=el('iframe');frame.title='Impostazioni di '+exerciseById.get(id).title;frame.src=encodeURI(exerciseById.get(id).file)+'?configure=1';
     const note=el('p','Imposta il menu senza avviare la prova, poi salva la configurazione.');const feedback=el('p');feedback.setAttribute('role','status');
     const close=()=>{window.removeEventListener('message',receive);dialog.remove();};
     const receive=event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||!['cognilab-config','cognilab-config-ready'].includes(event.data?.type))return;if(event.data.type==='cognilab-config-ready'){if(presets.has(key))frame.contentWindow.postMessage({type:'cognilab-apply-config',configuration:JSON.parse(presets.get(key))},location.origin);return;}presets.set(key,JSON.stringify(event.data.configuration));close();renderOrder();};window.addEventListener('message',receive);
     const save=button('Salva configurazione',()=>{feedback.textContent='Lettura delle impostazioni…';frame.contentWindow.postMessage({type:'cognilab-capture-config'},location.origin);});
     dialog.append(note,frame,feedback,save,button('Annulla',close));dialog.addEventListener('cancel',close);document.body.append(dialog);dialog.showModal();
    });controls.append(configure);
    controls.append(button('Aggiungi variante',()=>{if(chosen.length>=100){message('Puoi inserire fino a 100 voci, incluse le varianti.',true);return;}const copy={id,key:String(++nextEntry)};if(presets.has(key))presets.set(copy.key,presets.get(key));repetitions.set(copy.key,1);chosen.splice(index+1,0,copy);renderOrder();}));
    for(const [delta,label,symbol] of [[-1,'Sposta prima','↑'],[1,'Sposta dopo','↓']]){const b=button(symbol,()=>{[chosen[index],chosen[index+delta]]=[chosen[index+delta],chosen[index]];renderOrder();});b.setAttribute('aria-label',label+' '+exerciseById.get(id).title);b.disabled=index+delta<0||index+delta>=chosen.length;controls.append(b);}const remove=button('×',()=>{chosen=chosen.filter(x=>x.key!==key);presets.delete(key);repetitions.delete(key);checks.get(id).checked=chosen.some(x=>x.id===id);renderOrder();});remove.setAttribute('aria-label','Rimuovi '+exerciseById.get(id).title);controls.append(remove);li.append(controls);order.append(li);});
  };
  for(const item of exercises){const label=el('label'),check=el('input');check.type='checkbox';check.value=item.id;check.dataset.exerciseId=item.id;checks.set(item.id,check);const text=el('span',item.title);text.append(el('small',item.category));label.append(check,text);catalog.append(label);
   check.onchange=()=>{if(check.checked&&chosen.length>=100){check.checked=false;message('Puoi selezionare fino a 100 voci.',true);return;}chosen=check.checked?[...chosen,{id:item.id,key:String(++nextEntry)}]:chosen.filter(entry=>{if(entry.id!==item.id)return true;presets.delete(entry.key);repetitions.delete(entry.key);return false;});renderOrder();};
  }
  if(sourceProgram){for(const [slot,id] of sourceProgram.exercises.entries()){const entry={id,key:String(++nextEntry)};chosen.push(entry);if(sourceProgram.configurations?.[slot])presets.set(entry.key,sourceProgram.configurations[slot]);checks.get(id).checked=true;}renderOrder();}
  search.oninput=()=>{const term=search.value.toLocaleLowerCase('it');for(const label of catalog.children)label.hidden=!label.textContent.toLocaleLowerCase('it').includes(term);};sessions.oninput=()=>{renderOrder();renderCalendar();};
  const b=el('button',sourceProgram?'Salva e riassegna programma':'Assegna programma','primary');b.type='submit';f.append(b);f.onsubmit=event=>{event.preventDefault();action(b,async()=>{const sequence=[],configurations=[];for(const {id,key} of chosen){const times=repetitions.get(key)||1;if(!Number.isInteger(times)||times<1||times>10)throw Error('Scegli da 1 a 10 ripetizioni per esercizio.');if(!presets.has(key))throw Error('Configura '+exerciseById.get(id).title+' prima di assegnare il programma.');for(let n=0;n<times;n++){sequence.push(id);configurations.push(presets.get(key));}}
   if(sequence.length>100)throw Error('La sessione può contenere al massimo 100 prove, incluse le ripetizioni.');
   await assignProgram(patientUid,{name:title.value,instructions:instructions.value,totalSessions:sessions.value,exercises:sequence,configurations,schedule:dates.value.split(/\s+/).filter(Boolean)},sourceProgram?.status==='active'?sourceProgram.id:null);await loadRoster();await reload();},'Programma assegnato. È disponibile nella dashboard del paziente.');};if(sourceProgram)f.append(button('Annulla modifica',()=>{reload().catch(error=>message(careError(error),true));}));wrap.append(f);return wrap;
 }
 await loadRoster();await loadSelected();await checkCareStorage();message('Elenco pazienti aggiornato.');
}
try{
 const user=await currentCareUser();
 onAuthStateChanged(auth,current=>{if(current?.uid!==user.uid){workspace.replaceChildren(el('p','Account cambiato. Ricaricamento dello spazio personale…','care-notice'));location.reload();}});
 if(localStorage.getItem('hub_mode')==='clinical')await professionalView(user);else await patientView(user);
}catch(error){
 message(careError(error),true);
 if(localStorage.getItem('hub_mode')==='clinical'&&auth.currentUser?.uid==='eWoQhl1qwqVKRupDabTM6vfMyyI3'){
  const help=el('details');help.append(el('summary','Configurazione dei programmi su Firebase'));help.append(el('p','Se hai appena attivato questa funzione, carica le regole complete in Realtime Database → Regole → Pubblica. Le autorizzazioni esistenti restano nel file.'));
  const link=el('a','Apri il file completo delle regole','care-button');link.href='firebase/cognilab.rules.json';link.target='_blank';link.rel='noopener';help.append(link);const copy=button('Copia le regole complete',()=>action(copy,async()=>{const response=await fetch('firebase/cognilab.rules.json',{cache:'no-store'});if(!response.ok)throw Error('Apri il file delle regole e copiane il contenuto.');const rules=await response.json();await navigator.clipboard.writeText(JSON.stringify(rules,null,2));},'Regole copiate. Incollale in Firebase → Realtime Database → Regole e premi Pubblica. Poi ricarica questa pagina.'));help.append(copy);help.open=true;workspace.append(help);
 }
}
