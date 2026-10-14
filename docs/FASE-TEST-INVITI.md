# Palestra in fase di test, accesso a inviti

La home rimane pubblica, con la presentazione del progetto e il collegamento alla valutazione neuropsicologica. L'accesso alla palestra richiede un account Firebase Email/Password autorizzato. Non vengono create identità anonime per accedere alla palestra. Il questionario può ancora usare un'identità separata per non collegare le risposte all'account del tester.

## Attivazione nella console Firebase

1. Pubblica l'intero file `firebase/cognilab.rules.json` in Realtime Database → Rules. Le regole mantengono i rami users, professionals e cognilab_v2, e aggiungono la verifica dell'abilitazione. Non modificare o cancellare i dati esistenti.
2. In Authentication → Users, aggiungi l'account del tester con la sua email e una password scelta, oppure usa l'account esistente. Per recuperare la password occorre un indirizzo email reale accessibile al tester.
3. Copia l'UID di quell'account.
4. In Realtime Database → Data, sotto `cognilab`, aggiungi `testers`. Sotto testers crea un figlio con nome UID e valore booleano `true`.
5. Il tester accede da `accesso.html` con email e password. Il ruolo tester non concede accesso clinico. Per revocarlo imposta il valore a false.

I professionisti già abilitati in `cognilab/professionals` possono usare anche la palestra senza essere duplicati nell'elenco testers. Gli altri account esistenti non vengono abilitati automaticamente. I nodi testers e professionals non sono scrivibili dai client.

## Riapertura futura

L'impostazione `cognilab/access/publicRegistrationOpen` mancante o false mantiene la fase a inviti. Impostandola a true dalla console si riapre la creazione di account dal sito e l'accesso agli account registrati. Anche dopo la riapertura l'area clinica richiede il ruolo professionals. Il flag e i ruoli sono modificabili solo dall'amministratore, non dagli utenti del sito.

## Limiti e controlli

Pubblicare il sito non pubblica le regole Firebase: finché non vengono caricate, il blocco è solo nell'interfaccia. Le nuove regole bloccano dati di palestra e storico per gli account non autorizzati, compreso il ramo legacy cognilab_v2. Le risposte anonime al questionario restano separate e non concedono accesso allo storico o alla palestra.

GitHub Pages ospita file statici pubblici e il repository è pubblico. La schermata di accesso impedisce l'uso ordinario delle pagine, ma non rende segreti i sorgenti HTML e le immagini. Per impedire anche il download dei file servirà in futuro un hosting che verifichi la sessione sul server.

Verifica con un account non presente negli elenchi: deve ricevere un rifiuto. Verifica con un tester: deve entrare nella palestra, ma non nell'area clinica. Verifica con un professionista: deve poter entrare in entrambe. In Rules Playground, anche una scrittura diretta ai ruoli deve essere negata.
