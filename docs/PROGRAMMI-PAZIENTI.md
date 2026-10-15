# Programmi per pazienti registrati

## Attivazione sul progetto esistente

La nuova dashboard è pubblicata su GitHub Pages. Il database richiede un aggiornamento delle regole prima di usare inviti e programmi. Nessuna Cloud Function, Identity Platform a pagamento o nuovo servizio è richiesto da questa funzione; valgono i limiti e le condizioni del progetto Firebase già utilizzato.

1. Apri `firebase/cognilab.rules.json` e copia tutto il contenuto. Nel pannello del gestore, se le autorizzazioni nuove mancano, compare anche «Copia le regole complete».
2. Nella console Firebase del progetto `hub-di-stimolazione-cognitiva`, vai in **Realtime Database → Regole**, sostituisci il contenuto con il file completo e premi **Pubblica**. Il file conserva le precedenti autorizzazioni di account, tester, professionisti, questionari e risultati.
3. Ricarica CogniLab. Le regole non cambiano i dati né le credenziali esistenti.

Questa procedura non può essere eseguita dall'integrazione GitHub: non dispone dell'accesso amministrativo alla console Firebase. Le regole locali sono verificate con un valutatore di fixture, non con l'emulatore o con il database di produzione.

## Primo programma

1. Il paziente entra con un account registrato e abilitato durante il test. Nella dashboard copia il proprio **codice account** (UID). Non deve condividere la password.
2. Il professionista entra dall'area clinica. In **Collega un paziente** inserisce un nome/identificativo e il codice ricevuto.
3. Il paziente accetta la richiesta nella propria dashboard, dopo aver controllato il professionista. Fino all'accettazione non si possono assegnare programmi o leggere risultati condivisi.
4. Il professionista aggiorna l'elenco, seleziona il paziente, scrive titolo e indicazioni, sceglie da 1 a 20 esercizi, li ordina con i pulsanti e imposta da 1 a 60 sessioni. Con **Assegna programma** il percorso diventa disponibile al paziente.
5. Il paziente aggiorna i programmi e preme **Inizia sessione**. L'esercizio successivo si sblocca dopo un risultato completato e sincronizzato. Una sessione incompleta può essere ripresa da un altro dispositivo, dal primo esercizio ancora da svolgere.

Le difficoltà/durate dei singoli esercizi si scelgono nei loro menu: il professionista può indicarle nel campo delle istruzioni. Questa versione assegna la sequenza e il numero di sessioni, senza imporre configurazioni ai diversi esercizi.

## Conteggi e andamento

Una sessione conta una volta sola quando ciascuna posizione della sequenza ha almeno un risultato `completed` nel medesimo tentativo. Duplicati, tentativi interrotti e ripetizioni della stessa posizione non riempiono altre posizioni. Se tutti gli esercizi sono già salvati, la sessione conta anche se il paziente chiude prima del questionario. Un questionario non è obbligatorio per il completamento.

La dashboard distingue programmi attivi, conclusi e archiviati, mostra il numero di sessioni completate e i dettagli delle prove. I grafici confrontano stesso esercizio, versione e impostazioni. Si può scegliere accuratezza, tempo medio di risposta, errori o punteggio, e un periodo di 30/90 giorni o tutto lo storico. Gli indicatori mancanti non diventano zero. Gli andamenti non equivalgono a una valutazione clinica automatica.

Le statistiche personali contano sessioni con almeno un esercizio completato: sono distinte dalle sessioni interamente completate di uno specifico programma. Le vecchie anagrafiche e attività in presenza restano nel pannello **Sessioni in studio**; non vengono collegate automaticamente ad account con nomi simili.

## Separazione dei dati

- `cognilab/careInvites/UIDpaziente/UIDprofessionista`: invito scritto da un professionista abilitato.
- `cognilab/careLinks/UIDpaziente/UIDprofessionista`: consenso scritto o revocato soltanto dal paziente, a fronte dell'invito.
- `cognilab/carePrograms/UIDpaziente/IDprogramma`: sequenza, proprietario, istruzioni e obiettivo. La struttura pubblicata resta stabile; il professionista può archiviarla.
- `cognilab/careSessions/UIDpaziente/IDprogramma/IDsessione`: copie dei soli risultati assegnati. La regola verifica esercizio e posizione nella sequenza.
- `cognilab/users/UIDpaziente/sessions`: lo storico personale resta privato. Non viene aperto al professionista.
- `cognilab/users/UIDprofessionista/clinical/registeredPatients`: elenco privato del professionista, con riferimenti ai programmi.

Il salvataggio personale avviene prima della condivisione. Se questa fallisce, il risultato personale resta salvato e la copia condivisa rimane in una coda separata nel dispositivo. Non si avanza al prossimo esercizio finché la copia non è sincronizzata; dalla dashboard è possibile ritentare la sincronizzazione. I tentativi ripetuti mantengono identificativi, sessione e posizione originali.

La revoca del collegamento blocca letture e scritture condivise per quel professionista; i risultati personali restano nel proprio account. L'archiviazione impedisce nuovi tentativi, ma consente di sincronizzare risultati di sessioni già avviate. Il sistema descrive attività riferite dall'applicazione; non è una certificazione antifrode o uno strumento diagnostico validato.

## Verifiche

`tests/care-flow.mjs`: invito, consenso, assegnazione, salvataggio, ripresa cloud, raggiungimento obiettivo, monitoraggio e archiviazione con adattatore Firebase in memoria.

`tests/care-programs.mjs`: conteggi, duplicati/interruzioni, protezione del salvataggio personale, coda condivisa, account diversi e grafico accessibile.

`tests/care-dashboard.mjs` e `tests/care-navigation.mjs`: menu dei 38 esercizi, riordino, invio, accettazione/revoca e avanzamento della sequenza, con simulazione DOM.

`tests/care-rules.mjs`: espressioni effettive del file di regole, valutate con fixture per paziente, professionista, altri utenti, revoca e dati non validi. Non sostituisce un test con l'emulatore Firebase o un collaudo di produzione.

Non è stato possibile eseguire QA visivo nel browser in questa sessione: l'ambiente non espone il controllo browser richiesto per l'anteprima gestita. Le verifiche DOM non attestano le dimensioni effettive su ogni dispositivo.
