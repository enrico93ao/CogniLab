# Notifiche email dei programmi

## Cosa è pronto

Ad ogni nuova assegnazione il sito tenta la notifica. L’email contiene titolo, professionista, calendario, prove nell’ordine assegnato, ripetizioni, impostazioni disponibili e una guida in otto passaggi. Non include password, punteggi o diagnosi. La notifica recupera automaticamente il recapito dell’account del paziente nel record privato del professionista. Per i nuovi account creati dalla gestione viene salvata l’email usata per la creazione; per i precedenti è necessario un accesso del paziente con le regole aggiornate.

Lo stato nella scheda del programma distingue invio in corso, servizio non configurato, invio confermato, errore ed esito incerto. La conferma di assegnazione non attende la risposta del servizio email; attendere comunque l’esito della notifica prima di chiudere la pagina. Se viene chiusa prima, il programma rimane disponibile e la notifica si può verificare dal suo pulsante. Il mancato invio non annulla l’assegnazione. Il pulsante “Invia / verifica notifica email” permette di richiedere l’invio per un programma già creato. Un invio accettato da Google non garantisce la consegna in casella: controllare spam o eventuali rimbalzi.

Il repository contiene già l’endpoint configurato dal gestore. I nuovi controlli dello stato e la conferma immediata dell’assegnazione richiedono soltanto l’aggiornamento del sito: il codice Apps Script non viene modificato da questo intervento. I test automatici usano risposte simulate e non inviano email.

## Attivazione senza cambiare piano Firebase

1. Accedere a Google Apps Script con l’account Google dal quale si vogliono inviare le email e creare un progetto dedicato.
2. Copiare il contenuto completo di `notifications/apps-script/Code.gs` nell’editor. È il file unico già generato, non serve copiare gli altri sorgenti.
3. Eseguire `authorizeMailer` e autorizzare i permessi richiesti solo dopo aver verificato il codice. Il progetto richiede l’invio di email e richieste HTTPS per verificare l’account Firebase e leggere i dati autorizzati. L’autorizzazione Google e l’eventuale gestione delle schermate di sicurezza devono essere completate dal gestore.
4. Scegliere **Distribuisci → Nuova distribuzione → Applicazione web**. Eseguire come il proprietario e consentire l’accesso necessario alle richieste del sito. L’endpoint è pubblicamente raggiungibile, ma ogni invio richiede un token Firebase valido di un professionista autorizzato; non è un modulo libero di invio email.
5. Copiare l’URL della distribuzione terminante in `/exec` e inserirlo in `data/notification-config.json`: `{"endpoint":"URL_DELLA_TUA_DISTRIBUZIONE"}`. L’URL non è una password. Non inserire credenziali o chiavi private nel repository.
6. Nell’area professionista verificare il recapito recuperato automaticamente. Se non disponibile, far accedere il paziente e verificare le regole aggiornate del database. Fare la prima prova solo con un account test.
7. Verificare la ricezione e lo stato nel programma. La chiamata dal browser con reindirizzamento Google Apps Script va verificata sul deployment effettivo: i test locali non certificano CORS, autorizzazioni Google o consegna email.

L’account Google resta soggetto alle quote Apps Script e ai limiti del proprio servizio di posta. Non vengono attivati piani a pagamento Firebase né servizi SMTP esterni.

## Sicurezza e limiti

Il servizio verifica il token tramite Firebase Authentication, il ruolo professionale, la proprietà del programma attivo, il collegamento al paziente e il recapito nel record clinico del medesimo professionista. Non accetta destinatario, oggetto o testo dal payload del browser. Non usa credenziali amministrative Firebase e non registra i token nei log.

Per ciascun programma salva un marcatore privato nelle proprietà dello script. Due richieste identiche non producono due invii. Se l’esito è incerto il marcatore resta “sending”: prima di cancellarlo manualmente, il gestore deve verificare l’effettiva consegna, altrimenti si rischia un duplicato. Le proprietà hanno quote di spazio: per utilizzo esteso è opportuno migrare la deduplicazione su una coda server con stato di consegna e conservazione definita.

Questa versione notifica un nuovo programma, comprendendo tutte le sue sessioni calendarizzate. Non invia promemoria giornalieri o email a ogni apertura della sessione. L’indirizzo deve corrispondere all’account del paziente; non viene accettato dal payload della richiesta email.

## Manutenzione e test

Modificare `shared/assignment-email.mjs` e `notifications/apps-script/handler.gs`, poi eseguire `node scripts/build-notification-service.mjs` e ridistribuire il nuovo `Code.gs` in Google.

`node tests/assignment-email.mjs` verifica contenuto, calendario e ripetizioni, autorizzazione del professionista, collegamento, destinatario memorizzato, quote, duplicati ed esiti incerti, senza inviare email reali.

Fonti ufficiali consultate il 19 ottobre 2026:
- https://developers.google.com/apps-script/guides/services/quotas
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/mail/mail-app

## Recupero automatico del recapito (19 ottobre 2026)
La dashboard non richiede più di inserire il recapito. Gli account creati dal gestore lo salvano già alla creazione. Il paziente sincronizza la propria email autenticata in `cognilab/users/UID/profile/email` quando accede alla dashboard; il professionista attivamente collegato può leggere solo quel campo e copiarlo nel proprio elenco privato per il servizio email esistente. Le regole aggiornate in `firebase/cognilab.rules.json` devono essere pubblicate nella console Realtime Database. Non è necessario ridistribuire Apps Script. Gli account precedenti senza un recapito già salvato richiedono un nuovo accesso del paziente dopo l'aggiornamento del sito e delle regole. Se manca il recapito, il programma resta assegnato e la notifica segnala il mancato invio.

## Stati nella dashboard — 20 ottobre 2026
- `pending`: programma già salvato; la richiesta email è in corso oppure non è stata confermata prima della chiusura della pagina. Il pulsante permette di verificare tramite lo stesso servizio, che controlla i duplicati.
- `sent`: Apps Script ha confermato la chiamata a MailApp oppure segnala che il programma era già stato notificato. Non certifica consegna, lettura o assenza di spam.
- `uncertain`: risposta di rete mancante dopo la richiesta, errore di invio non determinabile o marcatore `sending`. Controllare prima la posta inviata dell’account mittente. Non è stato introdotto alcun reinvio automatico.
- `failed`: errore noto, come quota giornaliera, recapito mancante o autorizzazione. Il programma resta assegnato; il messaggio indica come intervenire.

Il completamento della notifica aggiorna il testo del programma senza ricaricare il modulo di assegnazione: una bozza in compilazione non viene cancellata. Un cambio di account impedisce di scrivere lo stato nel record del nuovo professionista.

Rimangono da definire la conservazione dei marcatori server e un recupero amministrativo degli esiti incerti. Il nuovo client non cancella marcatori e non richiede una nuova distribuzione Apps Script.
