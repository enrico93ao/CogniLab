# Verifica esercizi — 19 ottobre 2026

## Correzione pubblicata

**Conta i cerchi:** il tastierino compone il numero senza inviarlo subito. Un campo con tastiera numerica su mobile accetta fino a sei cifre; “Conferma” o Invio registrano la risposta, “Cancella” elimina l’ultima cifra e “Svuota” azzera il campo. Le risposte vuote o non intere sono rifiutate. Bloccati anche gli invii ripetuti e i callback del feedback dopo l’uscita o la fine del tempo.

Il test `tests/circle-answer.mjs` verifica 12, 20 e 123, correzione, Invio, risposte errate, validazione, doppia conferma, uscita durante il feedback, scadenza della sessione e metriche finali. Simulazione DOM, senza Firebase reale.

## Estensione dei controlli

Tutti i **38 esercizi** sono stati verificati per sintassi degli script incorporati, presenza dei file CSS/immagini/script locali dichiarati, ID duplicati, metadati e collegamento al runtime dei risultati. Controllata anche la sintassi degli 11 script locali direttamente richiamati. Nessuna anomalia in questi controlli statici.

Sono passate inoltre 17 suite esistenti su accessi, navigazione, assegnazioni, condivisione, recupero errori, sessioni, menu, timer, Lista della spesa, attenzione alternata, esplorazione, orientamento, Giardino, Pianoforte e feedback visivi/sonori. I test usano DOM, modelli e adattatori simulati: non certificano il rendering reale, la riproduzione audio su dispositivi o la configurazione Firebase pubblicata.

## Interventi completati dopo la verifica

- **Figure senza sovrapposizioni:** dimensioni adattate all’area disponibile; collocazione casuale con verifica dei rettangoli (anche per i quadrati), e ripiego in celle separate con ordine e posizione variabili. Nessuna posizione in collisione viene accettata dopo il limite di tentativi. Il test copre 675 disposizioni, da 240×180 a 1024×500, comprese estrazioni casuali costanti che forzano il ripiego; controlla numero di figure, contenimento e assenza di sovrapposizioni. Questo non sostituisce una prova visiva sui dispositivi.
- **Durata esplicita:** la modalità continua mostra “5 prove, massimo 2 minuti”. Il criterio di conclusione rimane invariato, evitando di modificare la durata dei training esistenti.
- **Test storici aggiornati:** la suite HTML riconosce il tema pubblico, il reindirizzamento del vecchio catalogo, i dati strutturati JSON-LD e i 38 esercizi. Il test dei progressi usa il diario di sessione, simula l’autorizzazione ed esamina soltanto i messaggi dei risultati, distinguendoli dagli eventi di stato.
- **Comandi ripristinati:** `test:exercises` esegue la verifica del catalogo e il test di Conta i cerchi; `test:persistence` esegue salvataggio e percorso dei programmi. Eliminati i richiami a file di test assenti.

Verifiche superate dopo le modifiche: `test:exercises`, `test:html`, `test:progress` e `test:persistence`. I test dei dati usano adattatori simulati, senza modificare Firebase reale.

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
