# Accesso professionisti

L'accesso al training libero non assegna privilegi clinici. Il login professionale è in `area-clinica.html`. Le password sono gestite esclusivamente da Firebase Authentication; nessuna credenziale è salvata nel repository.

## Attivazione iniziale

1. In Firebase Authentication → Users, cerca l'account di Enrico. Se non esiste, premi Add user e inserisci la sua email e la password concordata. Se esiste, mantieni l'account e usa il recupero password se necessario. Non creare duplicati.
2. Copia l'UID dell'utente dalla console Authentication.
3. In Realtime Database → Rules, pubblica l'intero file `firebase/cognilab.rules.json`. Conserva eventuali regole aggiuntive del progetto, dopo averne verificato la compatibilità. Il file mantiene il ramo cognilab_v2.
4. In Realtime Database → Data, aggiungi sotto `cognilab` il nodo `professionals`, poi un figlio con nome esattamente uguale all'UID copiato e valore booleano `true` (non la stringa "true"). Non sostituire né importare la radice del database.
5. Apri il sito → Area clinica e accedi con email e password. Il nome Enrico può essere impostato nel profilo dell'account CogniLab.

Solo la console amministrativa può assegnare o revocare il ruolo. Per revocarlo, imposta il valore a false. Per aggiungere un altro professionista, ripeti la procedura con il suo UID. Il ruolo non si basa su nome, email o localStorage.

## Dati

Le anagrafiche e le sessioni dei pazienti restano nel ramo privato `cognilab/users/UID/clinical`. I nuovi risultati clinici vanno in `clinical/sessions`, separati dallo storico personale. I risultati clinici precedenti in `sessions` continuano a essere mostrati al professionista abilitato. Il ramo sessions legacy viene negato agli account non abilitati che possiedono un ramo clinical, per proteggere i risultati già presenti. Nessun dato viene cancellato o spostato automaticamente.

Le regole tolgono i permessi generali al nodo users/UID: un permesso sul genitore renderebbe inefficace la protezione del ramo clinical. Il client verifica il ruolo prima di aprire il pannello e prima delle operazioni cliniche. È indispensabile pubblicare le regole: il solo aggiornamento del sito non protegge il database.

## Verifica in Rules Playground

Usa l'UID di un account autenticato. Senza il ruolo, lettura/scrittura di `cognilab/users/UID/clinical/pazienti` devono essere negate. Con ruolo true e provider password devono essere consentite. Un UID diverso dal proprietario deve essere sempre negato. Scrivere `cognilab/professionals/UID` dal client deve essere sempre negato.

La creazione effettiva dell'account, l'assegnazione del ruolo e la pubblicazione delle regole non sono eseguite dal connector GitHub.
