(() => {
 'use strict';
 // Practical instructions, deliberately independent of scores and diagnoses.
 const guides={
  "ascolta-ripeti":["Guarda l’immagine e ascolta la parola o la breve espressione.", "Prova a ripeterla. Puoi riascoltare con Ascolta di nuovo.", "Premi Ho provato a ripetere oppure Questa volta non ho ripetuto. La prova successiva compare automaticamente. La pronuncia non viene valutata dal sito."],
  "ricomponi-parola":["Guarda l’immagine e tocca le lettere nell’ordine giusto per comporre il nome.", "Per correggere, tocca una lettera già inserita. Aiutami mostra la parola da ricomporre.", "La parola viene controllata automaticamente quando hai inserito tutte le lettere. Nel livello avanzato ci sono due lettere in più da lasciare fuori. Dopo la risposta corretta passerai automaticamente alla parola successiva."],
  "storia-immagini":["Leggi o ascolta il racconto. Poi premi Ho letto, scelgo le immagini.", "Tocca le scene nell’ordine del racconto. Le scene scelte compaiono nella tua sequenza.", "Per correggere, tocca una scena della tua sequenza. Quando hai scelto tutte le scene premi Controlla la sequenza. Dopo la risposta corretta comparirà automaticamente il racconto successivo."],
  "associazioni-semantiche":["Guarda l’immagine e leggi la domanda. Puoi anche ascoltarla.", "Scegli l’immagine collegata secondo la domanda: per esempio, dove cresce un frutto o quale oggetto si usa insieme a un altro.", "Se sbagli, prova un’altra immagine. Dopo la risposta corretta il prossimo quesito compare automaticamente."],
  "oggetti-funzioni":["Leggi o ascolta che cosa devi fare nella situazione proposta.", "Tocca l’oggetto adatto a quella funzione. Non serve rispondere a voce.", "Puoi rileggere o riascoltare la domanda. Dopo la risposta corretta il prossimo quesito compare automaticamente."],

  'ascolta-indica':['Ascolta la parola. Non devi rispondere a voce.','Tocca l’immagine corrispondente. Puoi premere Ascolta di nuovo per riascoltare.','Se sbagli, prova un’altra immagine. Dopo la risposta corretta ascolterai automaticamente la parola successiva.'],
  'il-pianoforte':['Ascolta e guarda i tasti che si illuminano. Aspetta che la melodia finisca.','Premi gli stessi tasti nello stesso ordine. Prima una nota, poi sequenze più lunghe.','Se sbagli, osserva nuovamente la stessa sequenza e riprova.'],
  'lista-della-spesa':['Osserva i prodotti della lista e cerca di ricordarli.','Durante la pausa conta soltanto i cerchi blu: non contare i quadrati gialli.','Alla fine seleziona i prodotti che erano nella lista e premi Conferma la lista.'],
  'attenzione-alternata':['Leggi il tipo di percorso e l’ordine indicati prima di iniziare.','Tocca un elemento alla volta seguendo quella sequenza, anche se gli elementi si muovono.','Se il percorso è alternato, passa ogni volta da un numero all’altro tipo di elemento.'],
  'cancellazione-h':['Cerca tutte le H, oppure tutti i cerchi pieni se la prova usa le figure.','Tocca soltanto i bersagli: lascia stare le altre lettere o figure.','Esplora tutto lo schermo. Se è attivo il vincolo di riga, tocca la barra al termine della riga.'],
  'cerchi-rossi':['Conta soltanto i cerchi rossi. Non contare i distrattori di altri colori o forme.','Se gli stimoli appaiono uno alla volta, tieni a mente il totale mentre li osservi.','Inserisci il numero e premi Conferma. Nel conto continuo aggiungi i nuovi cerchi al totale precedente.'],
  'conta-numeri-lettere':['Osserva gli stimoli prima che scompaiano.','Conta separatamente quanti sono numeri e quanti sono lettere.','Inserisci i due conteggi negli appositi campi, poi premi Verifica Risultati.'],
  'doppio-compito':['Leggi le regole associate ai tasti prima di rispondere: ogni regola richiede il proprio tasto.','Aspetta che la parola raggiunga la fascia verde. Non rispondere quando è fuori dalla fascia.','Premi tutti i tasti delle regole che corrispondono alla parola. Una parola può richiedere più risposte.'],
  'semaforo-parole':['Leggi la categoria obiettivo e osserva il semaforo.','Con il VERDE rispondi Vero se la parola appartiene alla categoria; altrimenti rispondi Falso.','Con il ROSSO non premere niente: aspetta la parola successiva.'],
  'stroop-original':['Guarda il colore dell’inchiostro con cui è scritta la parola.','Premi il pulsante del colore dell’inchiostro: non scegliere in base al significato della parola.','Esempio: se la parola ROSSO è scritta in blu, premi BLU.'],
  'calcolo-memoria':['Ricorda il risultato del calcolo precedente: sarà il numero di partenza del calcolo successivo.','Applica l’operazione mostrata, inserisci il nuovo risultato e conferma.','Quando compare una parola, memorizzala. Alla fine scrivi le parole che ricordi.'],
  'inibizione-memoria':['Guarda l’oggetto e il colore del suo bordo. Controlla prima le eccezioni elencate.','Se un’eccezione corrisponde all’oggetto, usa il tasto indicato da quella regola, ignorando il peso. Se corrispondono più regole, segui la prima dall’alto.','Se nessuna eccezione si applica, premi ← per un oggetto leggero oppure → per un oggetto pesante.'],
  'memoria-lavoro-avanzato':['Leggi e memorizza le tappe: città, orari e luoghi associati.','Quando il programma lo richiede, risolvi i calcoli e conferma le risposte.','Rispondi poi alle domande usando le informazioni che hai memorizzato.'],
  'memoria-prosa':['Leggi il racconto e ricorda nomi, numeri, colori e orari.','Svolgi le attività intermedie: trova il simbolo diverso e copia la figura quando richiesto.','Rispondi alle domande sul racconto. Se viene proposta una rilettura, cerca le informazioni che mancavano.'],
  'memoria-visuospaziale-domande':['Osserva l’immagine prima che scompaia.','Ricorda gli oggetti, i colori, le quantità e dove sono posizionati.','Rispondi alle domande scegliendo l’alternativa che corrisponde all’immagine vista.'],
  'memoria-visuospaziale-numeri':['Guarda la posizione dei numeri nella griglia prima che si nascondano.','Tocca le caselle vuote nell’ordine dei numeri: prima 1, poi 2, poi 3 e così via.','Se sbagli, osserva di nuovo la stessa sequenza e riprova finché la completi.'],
  'memoria-giardino':['Guarda le caselle che si illuminano e aspetta la fine della sequenza.','Ripeti il percorso toccando le caselle nell’ordine richiesto.','Nell’ordine inverso comincia dall’ultima casella vista e torna indietro.'],
  'contrario-ricorda':['Leggi ogni domanda e rispondi al contrario della risposta vera.','Contemporaneamente memorizza l’ultima parola di ogni frase.','Quando compaiono i campi di rievocazione, inserisci le ultime parole che ricordi.'],
  'cifrario':['Controlla nella legenda a quale numero corrisponde ogni figura.','Leggi la sequenza da sinistra a destra e premi i numeri corrispondenti nello stesso ordine.','Se la legenda cambia, usa la nuova associazione: non continuare con quella precedente.'],
  'n-back':['Osserva gli stimoli uno alla volta e tieni a mente il livello N-back indicato.','Premi MATCH solo se lo stimolo è uguale a quello presentato N posizioni prima.','Se non corrisponde, non premere. Con 1-back confronta con il precedente; con 2-back confronta con due posizioni prima.'],
  'n-back-semantico':['Osserva le parole una alla volta e leggi il livello N-back e la modalità.','Nella modalità classica cerca la stessa parola di N posizioni prima. Nella modalità semantica cerca la stessa categoria, anche con parole diverse.','Premi il tasto di corrispondenza solo quando la regola è rispettata; altrimenti aspetta.'],
  'relazioni-logiche':['Leggi il quesito e tutte le alternative.','Cerca la relazione o l’associazione richiesta dal quesito.','Tocca la risposta che completa correttamente la relazione, poi continua con il quesito successivo.'],
  'rispondi-contrario':['Leggi la domanda e individua la risposta che verrebbe spontanea.','Non scegliere la risposta vera: scegli l’alternativa contraria richiesta dal gioco.','Completa 15 risposte senza errori: nel programma assegnato hai 60 secondi. Dopo ogni errore o tempo scaduto riparti dalle stesse domande. Puoi usare Salta questo esercizio: sarà registrato come non completato.'],
  'set-shifting':['Controlla lo sfondo prima di ogni risposta. La regola può cambiare.','Con lo sfondo BLU considera il numero e scegli Pari o Dispari. Ignora la lettera.','Con lo sfondo GRIGIO considera la lettera e scegli Vocale o Consonante. Ignora il numero.'],
  'intruso-visivo':['Osserva tutti i simboli o le figure proposte.','Cerca l’elemento diverso dagli altri.','Tocca soltanto l’intruso, poi osserva il nuovo gruppo di stimoli.'],
  'catena-parole':['Leggi la parola o il collegamento proposto.','Scegli l’alternativa che ha l’associazione di significato più adatta.','Controlla il feedback e continua la catena con le nuove parole.'],
  'intruso-semantico':['Leggi tutte le parole del gruppo.','Trova la caratteristica che accomuna la maggior parte delle parole.','Tocca la parola che non appartiene a quel gruppo.'],
  'torre-lettere':['Leggi la parola obiettivo e osserva dove si trovano le lettere.','Sposta le lettere con i comandi del gioco per ricostruire la parola richiesta.','Se sei in difficoltà, usa Aiuto per vedere un percorso suggerito.'],
  'riordina-frase':['Leggi tutte le parole disponibili.','Toccale nell’ordine necessario a formare una frase corretta.','Controlla la frase composta; usa Annulla ultima se vuoi correggere l’ultimo inserimento.'],
  'riordina-lettere':['Guarda tutte le lettere della parola mescolata.','Riordinale per ricostruire una parola di senso compiuto.','Premi Conferma quando la parola è pronta. Usa Aiuto se necessario.'],
  'ordine-alfabetico':['Memorizza le parole prima che scompaiano.','Ricostruisci la lista mettendo le parole in ordine alfabetico, dalla A alla Z.','Controlla l’ordine e premi Conferma ordine.'],
  'esplorazione-visuospaziale':['Leggi la consegna centrale per sapere quale bersaglio cercare.','Tocca solo la forma e il colore richiesti. Non toccare i distrattori.','Nella modalità set shifting controlla di nuovo la consegna dopo ogni risposta: il bersaglio può cambiare.'],
  'memoria-rotante':['Memorizza le caselle evidenziate nella griglia.','Osserva la rotazione o la trasformazione indicata. Immagina dove finiscono quelle caselle dopo il cambiamento.','Seleziona le posizioni corrispondenti nella griglia trasformata.'],
  'riconoscimento-base':['Osserva il modello da riconoscere.','Confrontalo con le due alternative: cerca lo stesso colore, la stessa forma o lo stesso oggetto.','Tocca l’alternativa che corrisponde al modello, poi osserva il modello successivo.'],
  'riconoscimento-visivo':['Osserva e memorizza le immagini mostrate.','Quando compare la scelta, seleziona le immagini che avevi appena visto.','Non scegliere gli elementi nuovi. Procedi con la conferma indicata sullo schermo.'],
  'silhouette':['Osserva con attenzione la sagoma scura.','Confronta il suo contorno con gli oggetti proposti.','Tocca l’oggetto che ha la stessa forma della sagoma.'],
  'immagine-corrispondente':['Ascolta la parola e osserva il modello o il bersaglio indicato.','Tocca l’immagine corrispondente. Non scegliere gli altri oggetti.','Nelle matrici segui la consegna e seleziona tutti i bersagli richiesti.'],
  'orologio-invisibile':['Osserva il ritmo della lancetta durante il giro visibile.','Quando l’orologio scompare, continua a seguire mentalmente lo stesso ritmo.','Premi STOP quando pensi che sia stato completato il numero di giri invisibili richiesto.'],
  'orientamento':['Completa i box della data scegliendo una risposta alla volta.','Nelle attività successive segui l’ordine richiesto: inverso, oppure un mese sì e uno no.','Se viene chiesto quanti giorni mancano alla prossima stagione, usa il calendario e inserisci il numero di giorni.']
 };
 function steps(){
  const id=window.CogniLabExercise?.id,base=[...(guides[id]||['Leggi la consegna nell’area di gioco.','Osserva gli stimoli prima di rispondere.','Usa i comandi indicati, una risposta alla volta.'])];
  if(id==='attenzione-alternata'){
   const type=document.getElementById('trail-type')?.value,reverse=document.getElementById('trail-order')?.value==='inverse';
   if(type==='letters')base[0]=reverse?'Tocca le lettere all’indietro: P, O, N e così via fino ad A.':'Tocca le lettere in ordine alfabetico: A, B, C e così via fino a P.';
   else if(type==='numbers')base[0]=reverse?'Tocca i numeri all’indietro: 20, 19, 18 e così via fino a 1.':'Tocca i numeri in ordine crescente: 1, 2, 3 e così via fino a 20.';
   if(type!=='letters'&&type!=='numbers'){const example=window.CogniLabAssist?.sample?.().labels?.slice(0,3);if(example?.length)base[0]='Comincia così: '+example.join(' → ')+'. Continua con lo stesso ordine di alternanza.';}
   if(type==='letters'||type==='numbers')base[2]='Dopo ogni risposta cerca il prossimo elemento della sequenza. Se sbagli, riprova senza saltarlo.';
  }
  if(id==='n-back'||id==='n-back-semantico'){
   const active=document.querySelector(id==='n-back'?'[id^="lvl-"].active':'[id^="btn-"][id$="back"].btn-active');
   const n=Number(active?.textContent.match(/[123]/)?.[0]);
   if(n){base[0]='Questa prova è un '+n+'-back: confronta lo stimolo attuale con quello di '+n+' posizioni prima.';
    if(id==='n-back-semantico')base[1]=document.getElementById('mode-semantic')?.classList.contains('btn-active')?'Cerca la stessa categoria di significato: per esempio, Auto e Treno sono entrambi mezzi di trasporto.':'Cerca esattamente la stessa parola, non soltanto una parola simile.';
    base[2]='Premi il pulsante di corrispondenza soltanto quando trovi una corrispondenza. Negli altri casi aspetta lo stimolo successivo.';
   }
  }
  if(id==='memoria-giardino'){base[1]=document.getElementById('music-order')?.value==='inverse'?'Ripeti le caselle in ordine inverso: comincia dall’ultima vista.':'Ripeti le caselle nello stesso ordine in cui si sono illuminate.';base[2]='Tocca una casella alla volta, soltanto dopo la fine della presentazione.';}
  return base;
 }
 function render(host){
  const title=document.createElement('h2');title.textContent='Come si gioca';const list=document.createElement('ol');
  for(const text of steps()){const li=document.createElement('li');li.textContent=text;list.append(li);}host.append(title,list);
 }
 function show(){const rules=window.CogniLabPrepareGuidance?.()||[];return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='cl-explicit-instructions';dialog.dataset.assignedVisible='true';dialog.setAttribute('aria-label','Istruzioni: '+(window.CogniLabExercise?.title||'esercizio'));
  const title=document.createElement('p');title.tabIndex=-1;title.className='cl-guidance-title';title.textContent=window.CogniLabExercise?.title||'Preparati alla prova';dialog.append(title);render(dialog);
  if(rules.length){const heading=document.createElement('h2');heading.textContent='Le regole di questa prova';const list=document.createElement('ul');for(const text of rules){const li=document.createElement('li');li.textContent=text;list.append(li);}dialog.append(heading,list);}
  const go=document.createElement('button');go.type='button';go.textContent='Ho capito, inizia';go.onclick=()=>{dialog.close();dialog.remove();resolve(true);};
  const cancel=document.createElement('button');cancel.type='button';cancel.className='cl-guidance-back';cancel.textContent='Non ancora, torna indietro';cancel.onclick=()=>{dialog.close();dialog.remove();resolve(false);};dialog.addEventListener('cancel',e=>e.preventDefault());dialog.append(go,cancel);document.body.append(dialog);dialog.showModal();title.focus({preventScroll:true});dialog.scrollTop=0;
 });}
 window.CogniLabGuidance={steps,render,show,ids:Object.keys(guides)};
 let replay=false,opening=false;
 document.addEventListener('click',async event=>{
  if(replay||opening||new URLSearchParams(location.search).has('configure')||window.CogniLabPresetPending||window.CogniLabExercise?.assignedPreparation==='inhibition-rules')return;
  const b=event.target.closest('button');if(!b||b.closest('dialog'))return;
  const launch=/^(?:window\.)?(?:startGame|startExercise|initGame|initSession|setupAndStart|selectDifficulty)\s*\(/.test(b.getAttribute('onclick')||'')||/\b(avvia|inizia|start|comincia)\b/i.test(b.textContent);
  if(!launch||b.disabled||window.CogniLabAssist?.isRunning?.()||document.body.classList.contains('cl-task-running'))return;
  if(window.CogniLabAssignedStarting)return;
  event.preventDefault();event.stopImmediatePropagation();opening=true;const accepted=await show();opening=false;
  if(accepted&&b.isConnected){replay=true;try{b.click();}finally{replay=false;}}
 },true);
})();
