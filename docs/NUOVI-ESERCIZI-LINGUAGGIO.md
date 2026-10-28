# Nuovi esercizi di linguaggio — 28 ottobre 2026

Il gruppo comprende sei esercizi: Ascolta e indica, già pubblicato, e cinque nuove attività. Tutti sono nel catalogo, nella palestra e nel compositore dei programmi. Nessun esercizio richiede il microfono, la registrazione della voce o servizi a pagamento.

| Esercizio | Richiesta e livelli |
| --- | --- |
| Ascolta e indica | Parola pronunciata e scelta tra 2, 4 o 6 immagini. |
| Ascolta e ripeti | Parole brevi, parole più lunghe, brevi espressioni; immagine e riascolto. Registra tentativi dichiarati, non correttezza della pronuncia. |
| Ricomponi la parola | Lettere da toccare: parole brevi con modello, parole di 6–7 lettere, parole di almeno 8 lettere con due distrattori. Rimozione delle singole lettere e aiuti. |
| Rimetti in ordine la storia | Cinque racconti illustrati, con 3, 4 o 5 scene da ordinare tramite tocco. Testo e descrizioni delle scene configurabili. Coinvolge comprensione, sequenziamento e memoria degli eventi, non solo memoria semantica. |
| Quali immagini stanno insieme? | Relazioni tra oggetti, categorie e contesti, con 2, 4 o 6 alternative e domanda esplicita. |
| A cosa serve? | Scegliere l’oggetto adatto a una funzione quotidiana, con 2, 4 o 6 alternative. |

L’atlante fotografico esistente è affiancato da illustrazioni vettoriali locali per dieci oggetti e venticinque scene. Le scene non mostrano numeri che rivelano l’ordine; i numeri compaiono solo nella sequenza costruita dal paziente. Non si trascinano elementi.

## Configurazione, salvataggio e dashboard

- Tre difficoltà e numero di prove impostabili; nessun timer di risposta.
- Le sessioni assegnate applicano le opzioni del professionista e mostrano la consegna, senza aprire il menu di configurazione.
- Pausa e ripresa attraverso il cassetto discreto Comandi. La voce viene fermata durante la pausa.
- Le prove concluse in anticipo sono salvate come interrotte e non completano lo slot assegnato.
- Le attività con risposte oggettive salvano scelte/verifiche corrette e totali, errori, primo tentativo, aiuti e riascolti. La correzione dopo un errore non cancella l’errore.
- Ascolta e ripeti salva stimoli ascoltati e tentativi dichiarati, senza punteggio o percentuale di accuratezza orale. Lo storico lo segnala esplicitamente.
- La normalizzazione dei dati ora conserva i contatori documentati. I nuovi contatori compaiono nei dettagli dello storico del paziente e del professionista. Non ricostruisce contatori mancanti nelle prove passate.
- La stima della durata usa l’intervallo orientativo già previsto per le prove senza timer: non è una durata fissa.

Ascolta e indica e Ascolta e ripeti richiedono una voce italiana disponibile sul dispositivo. Se manca, la risposta non viene attribuita automaticamente e compare un avviso. Negli altri esercizi la voce è facoltativa: consegne scritte e immagini consentono di continuare.

## Un solo aggiornamento delle regole Firebase

Questa pubblicazione non distribuisce le regole di Realtime Database. Gli account e i permessi restano gli stessi. L’unica modifica al file delle regole è l’aggiunta dei sei nuovi identificativi alla lista degli esercizi ammessi.

Nella console del progetto **hub-di-stimolazione-cognitiva**, aprire **Realtime Database → Regole**. Nel percorso:

`cognilab / carePrograms / $patient / $program / exercises / $slot / .validate`

Se non è stata applicata la modifica precedente per Ascolta e indica, cercare il frammento:

```text
newData.val() === 'il-pianoforte'
```

Sostituire solo quel frammento con:

```text
newData.val() === 'ascolta-indica' || newData.val() === 'ascolta-ripeti' || newData.val() === 'ricomponi-parola' || newData.val() === 'storia-immagini' || newData.val() === 'associazioni-semantiche' || newData.val() === 'oggetti-funzioni' || newData.val() === 'il-pianoforte'
```

Il frammento deve rimanere su un’unica riga dentro la stringa `.validate` (l’editor può mostrarla a capo visivamente). Lasciare invariato il resto e premere **Pubblica** una sola volta. Se Ascolta e indica è già presente, evitare di aggiungerlo nuovamente. `firebase/cognilab.rules.json` contiene il riferimento completo aggiornato: prima di sostituire tutte le regole, confrontare eventuali modifiche fatte in console successivamente. Non modificare i rami `.read` e `.write` per abilitare questi esercizi.

Fino all’aggiornamento, Firebase può rifiutare l’assegnazione dei nuovi esercizi; i programmi esistenti continuano a usare gli stessi identificativi e impostazioni. Dopo l’aggiornamento assegnare una sessione a un account di prova e controllare il risultato da entrambe le dashboard.

## Verifiche e limiti

Test di modello e DOM per tutti i cinque nuovi esercizi nei tre livelli; completamento, interruzione, aiuti, errori, lettere duplicate, correzioni, audio mancante e pausa/ripresa. Configurazioni e programmi verificati su dati fittizi. Verificata la conservazione dei contatori nel percorso reale di normalizzazione e costruzione del payload di salvataggio. Le espressioni delle regole sono valutate su fixture, senza deploy Firebase o scritture su pazienti reali.

Le attività sono materiali di esercitazione configurabili dal professionista: i punteggi non sono test standardizzati né misure diagnostiche. Le immagini, il lessico e il numero di alternative vanno scelti rispetto alle capacità della persona. L’audio reale e la sincronizzazione con le regole pubblicate vanno verificati sul dispositivo usato per il percorso.
