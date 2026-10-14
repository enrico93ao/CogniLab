# CogniLab — revisione HTML per GitHub Pages

## Percorso aggiornato

Questa revisione riguarda i file HTML nella radice: `index.html` → `esercizi.html` → `esercizio.html` → uno dei 36 esercizi. GitHub Pages deve pubblicare la radice del repository. Non viene attivata la struttura Next/Vinext presente nel repository: le sue dipendenze locali sono incomplete. La precedente ARCHITETTURA.md descrive una diversa implementazione e non rappresenta il percorso HTML di questa revisione.

## Modifiche effettive

- Tema comune in `shared/cognilab.css`, applicato a tutti i file HTML della radice. Dashboard con palette petrolio, pannelli chiari, bordi e spaziature uniformi; impostazioni e risultati riconosciuti usano lo stesso stile. Gli stimoli mantengono colori e geometrie originali.
- Catalogo: ricerca per nome e area, conteggio dei risultati, stato vuoto, accesso delle card da tastiera e nomi accessibili delle caselle di selezione.
- Navigazione del catalogo disponibile anche se il modulo Firebase non viene caricato. Le operazioni cliniche richiedono ancora Firebase.
- Home e ritorno dal riepilogo: rimosso `localStorage.clear()`, che cancellava indiscriminatamente lo stato e gli archivi del sito. Un nuovo allenamento libero avvia un nuovo cronometro.
- Contenitore dell’esercizio: titoli specifici, collegamento diretto, selezione solo di file presenti nel catalogo, compatibilità con URL storici doppiamente codificati e recupero del cronometro da valori non validi.
- Avvio pianificato: apre il primo esercizio selezionato anziché un esercizio predefinito. Concatenazione automatica e salvataggio uniforme della sequenza restano da realizzare.
- Conta i numeri e le lettere: eliminati quattro ID duplicati; implementate le funzioni vuote e quelle mancanti. Esposizione configurabile, stimoli in posizioni separate, entrambe le categorie sempre presenti, verifica di risposte intere non negative, tre vite, avanzamento, riepilogo e azzeramento dei contatori al riavvio. La metrica di accuratezza conta due risposte per prova: una per i numeri e una per le lettere.
- Accessibilità: zoom riabilitato nei file che lo bloccavano; indicatore di focus, controlli di almeno 44 px e rispetto della preferenza di ridurre le animazioni.
- Rimosso il numero iniziale fittizio di 145 utenti: viene visualizzato un trattino in attesa di un dato effettivo.

## Verifica

Test di regressione DOM in `tests/html-regression.mjs` con jsdom: compilazione di 39 script nativi, esistenza dei 36 file del catalogo, inclusione del tema, conservazione di localStorage, rifiuto di URL iframe esterni/non validi, cronometro, ricerca e ciclo del gioco di conteggio. Test superati il 14 ottobre 2026.

Non sono state effettuate una verifica visiva in browser, una partita completa di ciascuno degli altri 35 esercizi o verifiche del database Firebase. Le dipendenze CDN originali degli esercizi sono ancora presenti: questa versione non è garantita offline. Non sono state modificate regole, dati o credenziali Firebase.

Per ripetere i test nel repository, rendere disponibile jsdom e avviare `node tests/html-regression.mjs`. In alternativa, impostare `COGNILAB_QA_JSDOM` al percorso assoluto del modulo jsdom già installato.

## Pubblicazione su GitHub Pages

1. Conservare una copia del sito attuale o utilizzare un nuovo branch.
2. Estrarre lo ZIP e copiare nella radice del repository i file HTML, `logo.png`, la cartella `shared` e questa nota. Tutti devono essere pubblicati insieme.
3. Mantenere l’impostazione Pages già in uso, con cartella `/ (root)`.
4. Verificare sul sito pubblicato: home, ricerca, apertura di un esercizio, zoom e sessione completa di Conta i numeri e le lettere.

Le modifiche sono raccolte in un commit. La pubblicazione effettiva è verificabile nel workflow GitHub Pages relativo al commit pubblicato.

## Fase successiva: archivio dei pazienti

Il percorso HTML usa Firebase con integrazioni differenti tra esercizi. Prima di ampliare il sistema va verificato lo stato effettivo del progetto e delle sue regole. GitHub Pages ospita l’interfaccia statica; l’archivio condiviso deve essere gestito da un backend autenticato.

Modello proposto:

- **Paziente:** ID stabile, codice identificativo, dati essenziali, terapeuta responsabile e note.
- **Sessione:** ID stabile, paziente, data/ora, obiettivi, ordine degli esercizi, stato e note del terapeuta.
- **Risultato dell’esercizio:** ID, sessione, esercizio/versione, difficoltà e impostazioni, durata, corrette/errori/omissioni e metriche specifiche. Valori non misurati devono restare null; punteggi di giochi diversi non vanno confrontati come se usassero la stessa scala.
- **Andamento:** confronti dello stesso esercizio a impostazioni comparabili; filtri per paziente, periodo ed esercizio; esportazione dei risultati.

Ordine del lavoro: completare la revisione dei singoli esercizi → introdurre un contratto di risultato comune → autenticazione e accesso ai dati del terapeuta → schede pazienti e sessioni → salvataggi idempotenti e recupero da errori di rete → monitoraggio nel tempo. Non vengono introdotti archivi clinici reali nel browser in questa revisione.
