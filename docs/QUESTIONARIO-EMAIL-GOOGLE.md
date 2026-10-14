# Questionario senza registrazione, email e Google

## Correzioni
Il controllo dei permessi riconosce anche gli errori Firebase privi della proprietà code, purché indichino esplicitamente Permission denied. Altre eccezioni non vengono scambiate per una conferma dell’isolamento tra account.
Un questionario salvato viene confermato indipendentemente dalla successiva chiusura della sessione. Un eventuale errore di chiusura viene indicato separatamente.
La casella “Invia senza collegare le risposte al mio account” usa un’app Firebase separata, con autenticazione Anonymous e persistenza soltanto in memoria. Non modifica l’accesso dell’account principale e non salva nome, email o il suo UID insieme alle risposte. È un’identità tecnica temporanea; non è una promessa di anonimato assoluto rispetto ai log del fornitore.
Non sono richieste nuove regole oltre alla configurazione owner-only già fornita. Il provider Anonymous deve essere abilitato nel progetto Firebase.

## Email dopo la registrazione
Dopo la creazione o conversione dell’account viene chiamato sendEmailVerification, con il collegamento di ritorno alla home della palestra:
https://enrico93ao.github.io/CogniLab/esercizi.html
La richiesta di email non blocca un account già creato se il servizio di invio fallisce. Nel pannello “Il mio account” è disponibile il reinvio.
Questa è un’email Firebase di conferma dell’indirizzo, che può essere personalizzata come benvenuto. Non è una newsletter o un invio SMTP arbitrario.

In Firebase Console → Authentication → Templates → Email address verification:
- usare come oggetto “Benvenuto in CogniLab – conferma il tuo indirizzo”;
- impostare il nome mittente CogniLab, secondo le opzioni consentite dalla console;
- personalizzare il testo con: “Benvenuto in CogniLab! Conferma il tuo indirizzo tramite il collegamento qui sotto. Dopo la conferma puoi tornare alla palestra e iniziare il tuo allenamento.”;
- conservare i segnaposto e il collegamento di verifica richiesti da Firebase.
I template amministrativi non sono modificati automaticamente caricando il codice su GitHub.
Il dominio enrico93ao.github.io deve essere tra quelli autorizzati. Il redirect immediato dopo la registrazione e il collegamento di continuazione dell’email portano entrambi alla palestra.

## Ricerca Google
La pagina pubblica ha titolo, descrizione, URL canonico, informazioni di condivisione, dati strutturati WebSite e testo HTML leggibile anche prima del caricamento JavaScript.
La sitemap è:
https://enrico93ao.github.io/CogniLab/sitemap.xml
Non viene aggiunto un robots.txt in una sottocartella: Google lo cerca alla radice del dominio, che non appartiene a questo repository.

Per richiedere indicizzazione:
1. Aprire Google Search Console con il proprio account Google.
2. Aggiungere una proprietà “Prefisso URL”: https://enrico93ao.github.io/CogniLab/
3. Scegliere verifica tramite tag HTML e ottenere il tag google-site-verification, oppure scegliere il file HTML fornito da Google.
4. Fornire quel tag o file per inserirlo nel repository, poi verificare la proprietà.
5. Inviare sitemap.xml e richiedere indicizzazione della home con Ispezione URL.

Non è stata verificata una proprietà Google Search Console e non è stata inviata una richiesta di indicizzazione. L’indicizzazione e i tempi dipendono da Google; metadati e sitemap non garantiscono la presenza immediata nei risultati.
