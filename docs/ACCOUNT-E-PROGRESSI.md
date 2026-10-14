# CogniLab: account, sessioni e statistiche Firebase

## Funzioni realizzate

- Home e ritorni dagli esercizi portano al catalogo della palestra.
- Accesso Email/Password, registrazione, recupero password e uscita dall’account. Il nome visualizzato è distinto dall’identificativo Firebase del proprietario.
- Modalità ospite tramite autenticazione anonima, se abilitata in Firebase. La registrazione collega email/password all’identità ospite, mantenendo i risultati dello stesso UID. Per usare i progressi su altri dispositivi occorre un account registrato.
- Questionario: controllo delle tre risposte, stato di invio, errori visibili e un record per sessione, con timestamp server. Il gradimento medio usa la domanda 2; chiarezza e utilità non vengono scambiate per gradimento.
- Statistiche basate sui nuovi record Firebase: UID con almeno una connessione attiva, risultati completati registrati, questionari validi. Una lettura negata mostra un trattino e un messaggio, mai valori casuali. I contatori includono i record prodotti dal nuovo sistema; i vecchi archivi non vengono inventati o migrati senza una corrispondenza verificata.
- Tutti i 36 esercizi hanno un aggancio esplicito all’avvio e al riepilogo per inviare un risultato con ID stabile, data, durata, impostazioni e contatori nativi disponibili. Una misura non disponibile resta null e non compare come zero.
- Storico per account, raggruppamento per sessione e grafico degli stessi esercizi con le stesse impostazioni. Interruzioni distinte dai completamenti. L’andamento indica una variazione del dato registrato; non esprime una valutazione clinica automatica.
- Coda di risultati per UID, conservata nel browser e ritentata all’accesso e al ritorno della connessione. L’ID impedisce che un retry aumenti il conteggio; il retry mantiene l’ID della sessione originale.
- I nuovi pazienti creati nell’area clinica appartengono all’account che li gestisce. I risultati vengono associati al paziente selezionato. Le sequenze pianificate mantengono la stessa sessione e permettono di proseguire dal riepilogo al prossimo esercizio.
- I precedenti percorsi di salvataggio negli esercizi vengono esclusi quando è presente la nuova integrazione comune, per evitare accessi anonimi autonomi o salvataggi duplicati.

## Configurazione da completare in Firebase

La connessione GitHub permette di aggiornare l’interfaccia, ma non autorizza a modificare la configurazione amministrativa Firebase. È disponibile un’integrazione Firebase separata per gestire il progetto.

Progetto: `hub-di-stimolazione-cognitiva`.

1. In **Authentication → Sign-in method**, abilitare **Email/Password** e **Anonymous**. Anonymous permette alle persone che provano la palestra di inviare il questionario e poi convertire il proprio accesso in un account.
2. In **Authentication → Settings → Authorized domains**, aggiungere `enrico93ao.github.io`. Il controllo del 14 ottobre 2026 ha rilevato che questo dominio non era presente.
3. In **Realtime Database → Rules**, applicare le regole contenute in `firebase/cognilab.rules.json`, dopo aver confrontato le regole attuali e le integrazioni precedenti. Il file conserva senza modifiche le regole `cognilab_v2` fornite dall’utente e aggiunge lo spazio `cognilab`: non cancellare i dati esistenti. Non mantenere permessi di lettura/scrittura generali alla radice, perché prevalgono sui vincoli dei singoli account. Prima di pubblicarle, conservare le regole attuali per valutare eventuali integrazioni legacy che richiedano una migrazione.

Il client esegue un controllo prima dei salvataggi personali: la lettura di uno spazio appartenente a un altro UID deve essere negata, mentre la lettura del proprio deve essere consentita. Se il controllo fallisce, i nuovi risultati restano nella coda locale e il sito chiede di configurare le regole. Il controllo non sostituisce la verifica delle regole amministrative.

Gli archivi preesistenti nei nodi globali `pazienti`, `storico_pazienti`, `sessione_attiva` e `questionari_autovalutazione` sono lasciati sul database e non vengono copiati automaticamente sotto un nuovo account: manca una corrispondenza verificata tra i vecchi dati e il loro proprietario. La configurazione fornita non concede accesso a questi nodi legacy. La migrazione va concordata e verificata separatamente.

## Struttura dei nuovi dati

| Percorso | Contenuto | Accesso |
|---|---|---|
| `cognilab/users/UID/sessions/SESSION/results/RESULT` | Risultati, impostazioni, misure e paziente selezionato | Solo proprietario |
| `cognilab/users/UID/clinical` | Nuove schede pazienti e pianificazioni | Solo proprietario |
| `cognilab/presence/UID/CONNECTION` | Connessioni attive senza nome/email | Solo proprietario |
| `cognilab/activity/UID/RESULT` | Indicatore booleano di completamento | Solo proprietario |
| `cognilab/feedback/UID/SESSION` | Tre valutazioni e timestamp | Solo proprietario |
| `cognilab/stats` | Soli conteggi e media globali, senza UID o risposte individuali | Lettura autenticata; scrittura esclusivamente backend |

Le statistiche sono aggregate dai record salvati, ma restano dati inviati dai client: non costituiscono una misura anti-manomissione o una valutazione sanitaria certificata.

## Verifiche effettuate

- Regressione HTML: sintassi degli script nativi, 36 collegamenti, tema, ricerca, conservazione dei dati locali, timer e gioco di conteggio.
- Modello dei progressi: accuratezza, valori mancanti, gruppi confrontabili, miglioramenti verso punteggi inferiori, conteggi reali e gradimento.
- Salvataggio con backend simulato: retry dopo errori, ID della sessione preservato, coda separata per UID, controllo dei permessi e necessità dell’accesso.
- Bridge esercizio/contenitore: un solo risultato per completamento, impostazioni congelate all’avvio, interruzioni distinte e contatori non disponibili mantenuti null.

Non è stata completata una registrazione reale o una prova di scrittura nel database di produzione: servono prima i metodi di accesso e le regole corretti. Non è stata effettuata una partita completa in browser per ciascuno dei 36 esercizi. Eventuali misure mancanti vengono indicate come non misurate, senza costruire dati sostitutivi.

## Statistiche aggregate lato server

I client non leggono i record individuali di altri utenti. `firebase/functions/index.js` contiene la funzione server che calcola e aggiorna soltanto `onlineUsers`, `completedExercises`, `feedbackCount`, `satisfactionAverage` e `updatedAt`. La funzione deve essere distribuita separatamente nel progetto Firebase; caricare il codice su GitHub non la attiva. Finché non è attiva e non ha prodotto una statistica, il sito mostra un trattino anziché dati presunti. Le regole `stats` non permettono ai client di scrivere questi contatori.
