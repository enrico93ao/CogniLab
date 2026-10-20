# Revisione tecnica CogniLab — 19 ottobre 2026

## Ambito e limiti
Revisione del codice delle 25 pagine pubbliche e dei moduli di accesso, dashboard, prescrizioni, salvataggio e notifiche; analisi statica dei 38 esercizi e test delle funzioni principali con adattatori locali. Non è una prova manuale completa di tutti i giochi né un penetration test. Le regole presenti nel repository non dimostrano quali regole siano effettivamente pubblicate in Firebase. Non sono state usate credenziali amministrative né creati risultati di pazienti reali.

## Correzione dello scorrimento orizzontale
Bloccato lo scorrimento orizzontale del documento tramite `overflow-x:clip` (fallback `hidden`) e contenuti limitati alla larghezza disponibile. Caroselli, schede, pulsanti, footer e colonne ora possono restringersi; la larghezza del carosello è contenuta esplicitamente. Caroselli e tabelle conservano il proprio scorrimento interno. Correzione applicata anche al foglio responsive della palestra; nuova versione del CSS nelle pagine pubbliche per invalidare le copie precedenti.

Il browser pubblico ha mostrato un superamento transitorio della larghezza del documento. Questo non identifica con certezza un unico elemento responsabile su ogni smartphone: la verifica finale su Safari/iOS e Chrome/Android reali rimane distinta dalla revisione del codice e dal controllo del browser disponibile.

## Fragilità confermate

| Priorità | Evidenza | Effetto | Intervento consigliato |
|---|---|---|---|
| Alta | `shared/progress-store.js`: `localStorage.setItem` precede la scrittura cloud senza gestione degli errori di spazio/accesso | Un archivio locale pieno o bloccato può interrompere il salvataggio anche con connessione attiva | Gestire gli errori dello storage; tentare il cloud quando disponibile e mostrare chiaramente cosa è stato conservato |
| Alta | `shared/account.js`: logout senza rimozione delle code `cognilab.pending.*` e `cognilab.carePending.*` | Risultati non sincronizzati possono restare sul dispositivo condiviso; le chiavi per UID evitano il caricamento in un altro account, ma non proteggono l'accesso locale al browser | Avviso e gestione esplicita dei dati pendenti sul dispositivo, senza cancellarli automaticamente prima della sincronizzazione |
| Media | 32 pagine caricano Tailwind dal CDN; 3 contengono una dipendenza `@latest` | Il rendering dipende dalla rete e da risorse esterne; un aggiornamento del fornitore può cambiare comportamento o icone | Compilare CSS statico, fissare le versioni e valutare risorse locali |
| Media | `package.json`: i comandi dev/build/start/start:local/install:ci referenziano script assenti nel checkout | L'avvio e la manutenzione non sono riproducibili con i comandi dichiarati | Semplificare il manifest per il portale statico e documentare un solo flusso di avvio/test/pubblicazione |
| Media | `notifications/apps-script/handler.gs`: stato `sending` mantenuto in caso di esito incerto; proprietà conservate per ogni programma | Una notifica incerta richiede controllo manuale; nessun webhook conferma consegna/spam; archivio di deduplicazione cresce nel tempo | Pannello con stato esplicito, recupero controllato e politica di conservazione; nessun reinvio automatico indiscriminato |
| Media | `shared/assignment-notifications.js`: richiesta sincrona con timeout dopo il salvataggio del programma | L'assegnazione resta salvata, ma un problema del servizio email può ritardare il messaggio finale della UI | Separare notifica e conferma di assegnazione, con stato di invio aggiornabile |
| Media | La pagina privacy dichiara che ruoli, basi giuridiche e conservazione del percorso clinico sono ancora da definire; non è presente un flusso completo di esportazione/cancellazione dell'account nella dashboard | La gestione operativa dei dati richiede intervento del gestore | Completare le procedure del servizio e verificarle con i responsabili competenti prima di estendere l'uso clinico |
| Media | Nei giochi rimangono integrazioni Firebase legacy, SDK diversi e persistenza nuova condivisa; i guard impediscono normalmente il doppio percorso | La manutenzione è fragile: una modifica futura può riattivare un percorso vecchio | Rimuovere gradualmente il codice legacy dopo aver coperto ogni esercizio con verifiche di completamento e salvataggio |

## Manutenzione del layout
Il foglio `shared/public-catalog.css` contiene regole stratificate e override ripetuti per gli stessi componenti. Questa organizzazione rende più probabili conflitti di specificità e regressioni tra desktop e mobile. È opportuno consolidare gli stili per componente e aggiungere verifiche delle larghezze a 320, 375, 390, 768 e 1280 pixel. Il blocco dello scorrimento della pagina è una protezione; i componenti devono comunque restare visibili e utilizzabili.

## Limiti funzionali già presenti
- Calendario delle sessioni descrittivo: non blocca anticipi o ritardi. Le email attuali notificano l'assegnazione, non ricordano automaticamente ogni appuntamento.
- Il gestore abilitato alla creazione account è identificato nel codice: scelta della fase di test, poco flessibile per un servizio con più amministratori.
- I punteggi sono generati dal browser e descrivono esercizi; non sono misure diagnostiche validate o una protezione contro manipolazioni intenzionali da parte del titolare dell'account.
- I form pubblici preparano un'email nell'app di posta: non garantiscono l'invio automatico né la ricezione della richiesta.

## Aspetti ancora da verificare nell'ambiente reale
Regole Firebase effettivamente pubblicate; configurazione MFA e politiche di accesso dei professionisti; backup e ripristino del database; autorizzazioni e quote reali del mittente email; sessioni reali su dispositivi mobili differenti e tecnologie assistive. Non vengono dichiarati funzionanti o mancanti senza una verifica nell'ambiente appropriato.

## Ordine di intervento suggerito
1. Robustezza del salvataggio e gestione dei dati locali sui dispositivi condivisi.
2. Risorse CSS/JS stabili e processo di pubblicazione/test riproducibile.
3. Stato e recupero delle notifiche, export e procedure di gestione dei dati.
4. Verifica manuale dei giochi su telefono/tablet, con priorità ai canvas, alle prove a tempo e alle risposte touch.

## Esito dei controlli automatici
14 gruppi di test superati: SEO e navigazione pubblica, regole (valutatore locale), flusso assegnazione/salvataggio, simulazione quattro sessioni, configurazioni, dashboard, progressi, gestione account, template e client notifiche, modifiche UX degli esercizi, regressione HTML e analisi statica dei 38 esercizi. Nessuna scrittura su pazienti reali.

## Primo blocco di correzioni — 19 ottobre 2026
- Il salvataggio cloud procede anche quando localStorage o sessionStorage non sono disponibili. Le code hanno un ripiego in memoria isolato per account; se cloud e memoria persistente non funzionano, il messaggio invita a non chiudere la pagina. Il browser viene avvisato prima della chiusura in presenza di dati conservati soltanto in memoria (la visualizzazione del dialogo dipende dal browser).
- Il logout tenta prima la sincronizzazione e mostra un messaggio visibile se ci sono risultati o condivisioni pendenti. Quando questi sono conservati in modo persistente, offre una scelta esplicita per uscire lasciandoli sul dispositivo; se sono solo in memoria, invita prima a sincronizzarli. Dopo la sincronizzazione rimuove code, diario e riferimenti della sessione dal dispositivo. Non cancella automaticamente risultati non sincronizzati.
- Aggiunto un test specifico per memoria bloccata/piena, salvataggio online, errore offline, recupero, condivisione assegnata e isolamento degli account. Simulazione locale, senza scritture sul Firebase reale.
- Ripristinati i comandi di avvio statico con server locale Node e i comandi build per generare pagine pubbliche e servizio notifiche. Le dipendenze del precedente progetto framework restano da ripulire separatamente, senza cambiare la pubblicazione GitHub Pages.

### Avvio riproducibile del portale statico
Con Node 22.13 o successivo: `npm run dev` (nessuna dipendenza richiesta per il server), quindi aprire `http://127.0.0.1:4173/`. `PORT` permette una porta differente. `npm run build` rigenera i file pubblici nel repository; non crea una cartella dist. `npm run test:storage` verifica il nuovo percorso di salvataggio. I test che usano JSDOM richiedono le dipendenze di sviluppo installate.

Restano aperti gli altri punti della revisione: consolidamento CSS e risorse esterne, notifiche incerte, gestione completa dei dati e verifica su dispositivi reali.

## Secondo blocco — 20 ottobre 2026
- Sostituito Tailwind CDN in 32 esercizi con CSS statico locale. Eliminate le tre dipendenze Lucide `@latest`, sostituite da 30 icone locali con versione e licenza fissate. Toolchain separata con lockfile; documentazione in `RISORSE-STATICHE.md`.
- Copertura dei selettori precedenti verificata su tutti i 32 esercizi; test DOM per tutte le icone e per stati clinici/selezione. Non è una certificazione del layout su ogni dispositivo.
- Assegnazione confermata dopo il salvataggio del programma, senza attendere l’email. Stato iniziale persistente; aggiornamento della conferma senza perdere le bozze del professionista. Test di ritardo, quota, fallimento e cambio account.
- Distinti invio confermato, notifica già inviata, esito incerto e cause note. Il servizio Apps Script e i controlli contro duplicati non sono modificati; non occorre ridistribuirlo per questo blocco.

Restano aperti consolidamento del CSS pubblico, dipendenze legacy del framework, conservazione/recupero amministrativo dei marcatori email, procedure complete di export/cancellazione, prove su dispositivi reali e verifica delle configurazioni effettivamente pubblicate.

### Rimozione dei percorsi legacy rilevati dalla revisione automatica
La prima preparazione della pubblicazione è stata respinta dal controllo automatico per la presenza di autenticazione anonima Firestore e percorsi clinici derivati dall’URL in codice preesistente. Non è stata pubblicata quella versione.

Come alternativa più sicura sono stati rimossi integralmente configurazione, autenticazione e letture/scritture Firestore dai sei esercizi che li contenevano: Catena di parole, Conta i numeri e le lettere, Il semaforo delle parole, Memoria di prosa con distrattori, Memoria visuospaziale con domande e Riconoscimento visivo avanzato. Eliminati anche i relativi reindirizzamenti controllati dalla URL. Il runtime condiviso autenticato rimane l’unico percorso dei risultati; nessun dato storico è cancellato o migrato.

Il test `tests/legacy-persistence.mjs` esegue nel DOM la conclusione dei sei esercizi, controlla una sola emissione con metriche coerenti e usa parametri URL estranei di paziente, sessione e ritorno. Controlla inoltre l’assenza del vecchio SDK Firestore e dell’autenticazione anonima nei sorgenti di tutti i 38 esercizi. In Memoria di prosa, il ritorno alla palestra attende la conferma del salvataggio. Si tratta di simulazioni locali, senza scritture su Firebase.

La revisione ha successivamente segnalato anche un SDK compat con il medesimo tipo di scritture legacy. Sono stati quindi eliminati i cinque ulteriori percorsi diretti in Cancellazione di H, Doppio compito e velocità, Memoria di lavoro avanzata, Trova l’intruso e Set shifting. Il test di completamento copre ora tutti gli undici esercizi e controlla l’assenza di qualsiasi SDK Firebase inline nei 38 esercizi canonici. Il codice condiviso di accesso e salvataggio conserva autenticazione, isolamento per account e autorizzazioni cliniche.

In Set shifting è stato rimosso anche un ritorno anticipato del vecchio salvataggio che poteva impedire la trasmissione al runtime condiviso quando mancavano i parametri clinici nell’URL. Non sono stati modificati dati, credenziali o regole del database.
