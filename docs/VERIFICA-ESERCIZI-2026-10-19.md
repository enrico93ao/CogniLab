# Verifica esercizi — 19 ottobre 2026

## Correzione pubblicata

**Conta i cerchi:** il tastierino compone il numero senza inviarlo subito. Un campo con tastiera numerica su mobile accetta fino a sei cifre; “Conferma” o Invio registrano la risposta, “Cancella” elimina l’ultima cifra e “Svuota” azzera il campo. Le risposte vuote o non intere sono rifiutate. Bloccati anche gli invii ripetuti e i callback del feedback dopo l’uscita o la fine del tempo.

Il test `tests/circle-answer.mjs` verifica 12, 20 e 123, correzione, Invio, risposte errate, validazione, doppia conferma, uscita durante il feedback, scadenza della sessione e metriche finali. Simulazione DOM, senza Firebase reale.

## Estensione dei controlli

Tutti i **38 esercizi** sono stati verificati per sintassi degli script incorporati, presenza dei file CSS/immagini/script locali dichiarati, ID duplicati, metadati e collegamento al runtime dei risultati. Controllata anche la sintassi degli 11 script locali direttamente richiamati. Nessuna anomalia in questi controlli statici.

Sono passate inoltre 17 suite esistenti su accessi, navigazione, assegnazioni, condivisione, recupero errori, sessioni, menu, timer, Lista della spesa, attenzione alternata, esplorazione, orientamento, Giardino, Pianoforte e feedback visivi/sonori. I test usano DOM, modelli e adattatori simulati: non certificano il rendering reale, la riproduzione audio su dispositivi o la configurazione Firebase pubblicata.

## Correzioni e verifiche consigliate

| Priorità | Ambito | Evidenza | Intervento consigliato |
|---|---|---|---|
| Media | Conta i cerchi, disposizione delle figure | `generateNonOverlappingPositions` accetta comunque una posizione al tentativo 200, anche se collide. Gli stimoli simultanei hanno dimensione fissa di 76 px. | Prevedere un ripiego senza sovrapposizioni e adattare le dimensioni all’area disponibile; controllare soprattutto i telefoni. È una possibilità rilevata nel codice, non un difetto grafico osservato in browser. |
| Da chiarire | Conta i cerchi, modalità continua | La sessione termina sia al quinto round sia alla scadenza di 120 secondi. | Rendere esplicito “5 prove, massimo 2 minuti” oppure scegliere un unico criterio di durata. L’attuale comportamento non impedisce le risposte a due cifre dopo questa correzione. |
| Media, manutenzione | Test automatici storici | `progress-v3.mjs` rimuove gli import senza simulare il nuovo `recordSessionResult`; fallisce per ReferenceError. `html-regression.mjs` impone il CSS della palestra anche alle pagine pubbliche e conserva conteggi di 36 esercizi. | Aggiornare questi test alla struttura attuale. I test più recenti `session-save`, `care-flow` e `care-dashboard` passano. Non sono errori di esecuzione dei giochi dimostrati. |
| Media, manutenzione | Comandi di test | `package.json` richiama `tests/exercise-smoke.mjs` e `tests/persistence.mjs`, assenti. | Collegare i comandi alle suite esistenti e alla nuova verifica del catalogo. |

## Elenco completo

“OK statico” indica esclusivamente i controlli descritti sopra, non una partita completa eseguita su ciascun dispositivo.

| Esercizio | File | Verifica |
|---|---|---|
| Il pianoforte | `Il pianoforte.html` | OK statico |
| Lista della spesa | `Lista della spesa.html` | OK statico |
| Attenzione Alternata | `Attenzione alternata.html` | OK statico |
| Cancellazione di H | `Cancellazione di H.html` | OK statico |
| Conta i cerchi | `conta_cerchi_rossi.html` | OK statico |
| Conta i numeri e le lettere | `Conta i numeri e le lettere.html` | OK statico |
| Doppio compito e velocità | `Doppio compito e velocità.html` | OK statico |
| Il semaforo delle parole | `Il semaforo delle parole.html` | OK statico |
| Stroop | `Stroop.html` | OK statico |
| Calcolo e memoria | `Calcolo e memoria.html` | OK statico |
| Inibizione e memoria di lavoro | `Inibizione e memoria di lavoro.html` | OK statico |
| Memoria di lavoro avanzato | `Memoria di lavoro avanzato.html` | OK statico |
| Memoria di prosa con distrattori | `Memoria di prosa con distrattori.html` | OK statico |
| Memoria visuospaziale con domande | `Memoria visuospaziale con domande.html` | OK statico |
| Memoria visuospaziale con numeri | `Memoria visuospaziale con numeri.html` | OK statico |
| Memoria visuospaziale il Giardino | `Memoria visuospaziale il Giardino.html` | OK statico |
| Rispondi al contrario e ricorda la parola | `Rispondi al contrario e ricorda la parola.html` | OK statico |
| Il cifrario | `Il cifrario.html` | OK statico |
| N back | `N back.html` | OK statico |
| N back semantico | `N back semantico.html` | OK statico |
| Relazioni logiche | `Relazioni logiche.html` | OK statico |
| Rispondi il contrario | `Rispondi il contrario.html` | OK statico |
| Set shifting | `Set shifting.html` | OK statico |
| Trova l'intruso | `Trova l'intruso.html` | OK statico |
| Catena di parole | `Catena di parole.html` | OK statico |
| Intruso semantico | `Intruso semantico.html` | OK statico |
| La torre delle lettere | `La torre delle lettere.html` | OK statico |
| Riordina la frase | `Riordina la frase.html` | OK statico |
| Riordina le lettere | `Riordina le lettere.html` | OK statico |
| Riordina le parole in ordine alfabetico | `Riordina le parole in ordine alfabetico.html` | OK statico |
| Esplorazione visuospaziale | `Esplorazione visuospaziale multilivello.html` | OK statico |
| Memoria visuospaziale rotante | `Memoria visuospaziale rotante.html` | OK statico |
| Riconoscimento visivo base | `Riconoscimento visivo base.html` | OK statico |
| Riconoscimento visivo avanzato | `Riconoscimento visivo.html` | OK statico |
| Silhouette | `Silhoutte.html` | OK statico |
| Trova l'immagine corrispondente | `Trova l'immagine corrispondente.html` | OK statico |
| L'orologio invisibile | `L'orologio invisibile.html` | OK statico |
| Orientamento temporale-spaziale | `Orientamento temporale-spaziale.html` | OK statico |

## Riproduzione

Con Node e la dipendenza `jsdom` installata:

```sh
node tests/circle-answer.mjs
node --experimental-vm-modules tests/exercise-audit.mjs
```

Se jsdom è installato separatamente, impostare `COGNILAB_QA_JSDOM` al percorso del relativo pacchetto.

Restano da provare in browser le partite complete dei 38 esercizi su desktop, tablet e telefono, l’audio/sintesi vocale e un salvataggio con account di test sul Firebase effettivo. Non sono state eseguite operazioni sui dati dei pazienti.
