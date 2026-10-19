# Notifiche email dei programmi

## Cosa è pronto

Ad ogni nuova assegnazione il sito tenta la notifica. L’email contiene titolo, professionista, calendario, prove nell’ordine assegnato, ripetizioni, impostazioni disponibili e una guida in otto passaggi. Non include password, punteggi o diagnosi. La notifica usa l’email salvata dal professionista nel campo dedicato; per i nuovi account creati dalla gestione viene salvata automaticamente l’email usata per la creazione.

Lo stato nella scheda del programma distingue servizio non configurato, errore e invio accettato. Il mancato invio non annulla l’assegnazione. Il pulsante “Invia / verifica notifica email” permette di richiedere l’invio per un programma già creato. Un invio accettato da Google non garantisce la consegna in casella: controllare spam o eventuali rimbalzi.

**Il servizio non è attivo finché il gestore non lo pubblica e non configura l’endpoint.** Il file di configurazione è intenzionalmente privo di URL: nessuna email di prova è stata inviata automaticamente durante lo sviluppo.

## Attivazione senza cambiare piano Firebase

1. Accedere a Google Apps Script con l’account Google dal quale si vogliono inviare le email e creare un progetto dedicato.
2. Copiare il contenuto completo di `notifications/apps-script/Code.gs` nell’editor. È il file unico già generato, non serve copiare gli altri sorgenti.
3. Eseguire `authorizeMailer` e autorizzare i permessi richiesti solo dopo aver verificato il codice. Il progetto richiede l’invio di email e richieste HTTPS per verificare l’account Firebase e leggere i dati autorizzati. L’autorizzazione Google e l’eventuale gestione delle schermate di sicurezza devono essere completate dal gestore.
4. Scegliere **Distribuisci → Nuova distribuzione → Applicazione web**. Eseguire come il proprietario e consentire l’accesso necessario alle richieste del sito. L’endpoint è pubblicamente raggiungibile, ma ogni invio richiede un token Firebase valido di un professionista autorizzato; non è un modulo libero di invio email.
5. Copiare l’URL della distribuzione terminante in `/exec` e inserirlo in `data/notification-config.json`: `{"endpoint":"URL_DELLA_TUA_DISTRIBUZIONE"}`. L’URL non è una password. Non inserire credenziali o chiavi private nel repository.
6. Nell’area professionista controllare l’email del paziente prima dell’assegnazione. Per i vecchi programmi usare il campo “Recapito del paziente per i programmi assegnati” e premere “Salva email notifiche”. Il recapito può essere impostato anche durante una nuova assegnazione. Fare la prima prova solo con un account test.
7. Verificare la ricezione e lo stato nel programma. La chiamata dal browser con reindirizzamento Google Apps Script va verificata sul deployment effettivo: i test locali non certificano CORS, autorizzazioni Google o consegna email.

L’account Google resta soggetto alle quote Apps Script e ai limiti del proprio servizio di posta. Non vengono attivati piani a pagamento Firebase né servizi SMTP esterni.

## Sicurezza e limiti

Il servizio verifica il token tramite Firebase Authentication, il ruolo professionale, la proprietà del programma attivo, il collegamento al paziente e il recapito nel record clinico del medesimo professionista. Non accetta destinatario, oggetto o testo dal payload del browser. Non usa credenziali amministrative Firebase e non registra i token nei log.

Per ciascun programma salva un marcatore privato nelle proprietà dello script. Due richieste identiche non producono due invii. Se l’esito è incerto il marcatore resta “sending”: prima di cancellarlo manualmente, il gestore deve verificare l’effettiva consegna, altrimenti si rischia un duplicato. Le proprietà hanno quote di spazio: per utilizzo esteso è opportuno migrare la deduplicazione su una coda server con stato di consegna e conservazione definita.

Questa versione notifica un nuovo programma, comprendendo tutte le sue sessioni calendarizzate. Non invia promemoria giornalieri o email a ogni apertura della sessione. L’indirizzo può essere inserito dal professionista per gli account già esistenti: controllarne la corrispondenza al paziente.

## Manutenzione e test

Modificare `shared/assignment-email.mjs` e `notifications/apps-script/handler.gs`, poi eseguire `node scripts/build-notification-service.mjs` e ridistribuire il nuovo `Code.gs` in Google.

`node tests/assignment-email.mjs` verifica contenuto, calendario e ripetizioni, autorizzazione del professionista, collegamento, destinatario memorizzato, quote, duplicati ed esiti incerti, senza inviare email reali.

Fonti ufficiali consultate il 19 ottobre 2026:
- https://developers.google.com/apps-script/guides/services/quotas
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/mail/mail-app
