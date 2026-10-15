# Accesso di test semplificato

## Configurazione iniziale, una sola volta

Pubblica il file completo `firebase/cognilab.rules.json` in Firebase → Realtime Database → Rules. Pubblicare il sito su GitHub non aggiorna le regole del database.

Il gestore Enrico deve avere il suo account Email/Password con UID `eWoQhl1qwqVKRupDabTM6vfMyyI3` e il valore booleano true in `cognilab/professionals/eWoQhl1qwqVKRupDabTM6vfMyyI3`. Questo requisito non viene assegnato dal sito.

## Nuovo tester

1. Accedi come Enrico dall'area professionisti.
2. Apri **Gestisci accessi di test**, oppure `gestisci-tester.html`.
3. Inserisci email e password da assegnare, poi premi **Crea e abilita**.
4. Consegna le credenziali al tester: entrerà da `accesso.html`.

Non occorre copiare UID o modificare il database per ogni nuovo tester. La password non viene salvata in Realtime Database o nel browser dal pannello. La creazione usa un'app Firebase separata con autenticazione solo in memoria, così la sessione del gestore rimane attiva. Se Firebase blocca la creazione di account, usa Authentication → Add user e abilita il codice dal pannello.

## Account esistente bloccato

Il tester prova ad accedere con email e password. Se l'autenticazione riesce ma manca l'abilitazione, vede il proprio codice UID. Il gestore lo incolla nella sezione **Account già creato** e preme **Abilita account**. Il tester riprova. Non occorre conoscere la password dell'account esistente.

Lo stesso campo permette di revocare l'abilitazione tester, senza eliminare storico e account. L'accesso professionale resta separato: la revoca tester non revoca il ruolo professionale.

Solo l'UID del gestore Enrico, già abilitato come professionista, può leggere l'elenco e scrivere le abilitazioni tester dal sito. Gli altri professionisti non possono gestire gli inviti. Il pannello non concede ruoli clinici e non legge lo storico degli altri utenti.

## Riapertura futura e limiti

Il valore mancante o false di `cognilab/access/publicRegistrationOpen` mantiene l'accesso a inviti. Impostandolo a true dalla console si riapre la registrazione e l'accesso agli account registrati. L'area clinica richiede sempre il ruolo professionale.

Le risposte anonime al questionario usano un'identità separata e non concedono accesso alla palestra. GitHub Pages e il repository restano pubblici: l'accesso ai dati è protetto dalle regole Firebase, mentre i sorgenti HTML e le immagini sono scaricabili.
