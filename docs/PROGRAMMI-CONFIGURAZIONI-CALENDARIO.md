# Programmi con configurazione, ripetizioni e calendario

Aggiornamento del 19 ottobre 2026.

## Funzionamento

- Creando un account dalla gestione accessi del super user si può inserire anche il nome/identificativo. L’account è aggiunto all’elenco clinico del gestore e riceve un invito al collegamento. L’email di conferma viene richiesta senza interrompere la sessione del professionista.
- All’aggiornamento dell’elenco, gli account test già abilitati e non ancora presenti vengono aggiunti con una descrizione generica contenente l’inizio dell’UID. Il professionista può impostare un nome usando “Collega un paziente” con lo stesso UID. Gli account revocati non vengono importati automaticamente e quelli già presenti mantengono lo storico.
- Il paziente resta tenuto ad accettare il collegamento: comparire nell’elenco non concede al professionista la lettura dei risultati privati.
- Nel programma si scelgono fino a 20 esercizi distinti; per ciascuno si impostano da 1 a 10 ripetizioni. Il totale non può superare 100 prove per sessione. Ogni ripetizione ha uno slot e un risultato propri.
- “Configura esercizio” apre il menu originale. Impostare le opzioni e premere “Salva configurazione”; l’avvio della prova è disabilitato nell’anteprima. Prima di assegnare bisogna salvare la configurazione di ogni esercizio, anche quando si vogliono mantenere i valori predefiniti.
- Si indica il numero di sessioni, da 1 a 60, e si sceglie una data per ciascuna con i selettori calendario. Le date possono coincidere e devono essere in ordine cronologico.
- Il paziente vede il calendario e la prossima data prevista. Aprendo il programma trova il menu preimpostato. I controlli restano modificabili: questa versione predispone le opzioni e non costituisce un blocco clinico delle impostazioni. I risultati registrano le impostazioni effettivamente utilizzate.
- Le date sono una pianificazione: non impediscono anticipi o recuperi e non inviano promemoria. Nello storico si distinguono data prevista e data effettiva.
- I programmi precedenti restano utilizzabili senza configurazione o calendario. Per modificarne la struttura assegnare un nuovo programma e archiviare il precedente, conservando lo storico.

## Aggiornamento necessario in Firebase

**Il gestore deve pubblicare il file completo `firebase/cognilab.rules.json` in Realtime Database → Regole.** Il codice del sito non può aggiornare autonomamente queste regole.

Le nuove regole ammettono configurazioni serializzate per ciascuno slot, fino a 100 prove, calendario fino a 60 date e data prevista delle sessioni. Mantengono il vincolo di professionista autorizzato, consenso del paziente e immutabilità dei programmi già assegnati. Con le vecchie regole, un nuovo programma contenente configurazioni/calendario sarà rifiutato.

## Verifiche

Test DOM/modelli/adattatori simulati: creazione accesso con invito e mantenimento login gestore; importazione account test esistenti senza falsificare consenso; configurazioni select/numero/checkbox/radio e pulsanti selezionati; date valide/invalide e ordine; ripetizioni distinte; builder/dashboard; navigazione e ripresa; quattro sessioni con configurazioni e date; regole autorizzative e salvataggio personale.

Resta necessaria una prova nel browser con l’account test e le regole effettivamente pubblicate. La cattura generica dei menu è da confermare sui 38 esercizi, soprattutto dove i pulsanti aggiornano impostazioni interne: i test automatici non certificano tutti i menu nel browser. Il rilevamento di un controllo non più compatibile mostra un errore invece di continuare silenziosamente.
