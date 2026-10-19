# Prova paziente TEST — quattro sessioni

Eseguita il 19 ottobre 2026 con `node tests/four-session-patient.mjs`.

**SIMULAZIONE LOCALE. Nessun account è stato creato e nessun risultato è stato scritto sul Firebase effettivo. Il paziente non compare nella dashboard online.** Identità, date, livelli e prestazioni sono fittizi. I valori servono a verificare la gestione dei dati, non rappresentano un esito clinico.

## Metodo e risultati

Eseguito il codice reale `care-store.js` e `progress-store.js` con un adattatore di database in memoria. Utilizzati il diario di sessione e i modelli reali di progresso e confronto. Il test non esegue partite nei tre giochi: fornisce direttamente risultati fittizi alla funzione di salvataggio.

Invito → consenso del paziente → assegnazione di 3 esercizi per 4 sessioni → salvataggio personale → condivisione con il professionista → lettura del monitoraggio.

| Esercizio | Sessione 1 | Sessione 2 | Sessione 3 | Sessione 4 | Variazione |
|---|---:|---:|---:|---:|---|
| Stroop | 60% | 70% | 80% | 90% | 30 punti percentuali (positivo) |
| Attenzione Alternata | 50% | 60% | 70% | 80% | 30 punti percentuali (positivo) |
| Conta i cerchi | 70% | 70% | 60% | 50% | -20 punti percentuali (negativo) |

Controlli superati:

- 4 sessioni distinte, ciascuna con 3 risultati; 12 risultati personali e 12 condivisi.
- Ricostruzione dell’esercizio successivo dai dati persistiti dopo la cancellazione dello stato di navigazione della scheda.
- Errore di rete alla seconda prova della seconda sessione: risultato mantenuto in attesa, recuperato con `retryPending`, senza perdita né duplicati.
- Ripetizione di ogni invio: il medesimo identificatore aggiorna il record senza aumentare il numero di risultati.
- Obiettivo raggiunto a 4 sessioni; impedito l’avvio di una quinta sessione dello stesso programma.
- Il professionista legge 4 sessioni completate; il diario di un altro account rimane vuoto.
- Il modello di confronto riconosce sia gli andamenti crescenti sia quello decrescente a parità di impostazioni.

L’adattatore non applica le regole di sicurezza Firebase: la prova non certifica permessi effettivi, autenticazione, rete, rendering dei grafici o persistenza remota. Il controllo dell’isolamento del diario non equivale a un test di sicurezza del database.

## Prova sul sito con un account test

1. Dalla gestione utenti del professionista creare o autorizzare un account dedicato, chiamato chiaramente “Paziente TEST”. Usare un indirizzo email di test controllato dal gestore; non usare dati di un paziente reale.
2. Collegare l’account al professionista, accettando l’invito dal profilo del paziente. Assegnare Stroop, Attenzione alternata e Conta i cerchi per 4 sessioni.
3. Accedere come paziente in una seconda finestra del browser e completare davvero i 3 esercizi. Attendere lo stato di salvataggio riuscito prima di uscire.
4. Ricaricare la pagina o uscire e rientrare: verificare che la prima sessione rimanga completa. Ripetere fino a 4 sessioni.
5. Nell’area professionista verificare 4 sessioni complete, 12 risultati e grafici coerenti, confrontando esercizi con le stesse impostazioni. I punteggi reali dipendono dalle prove eseguite.
6. Nella console RTDB verificare i record `cognilab/users/UID_TEST/sessions` e `cognilab/careSessions/UID_TEST/ID_PROGRAMMA`. Devono esserci 4 sessioni con 3 risultati ciascuna. Verificare l’identificatore dell’account test, evitando di modificare record reali.
7. Per la prova di recupero rete: su una prova aggiuntiva dedicata, interrompere temporaneamente la rete prima della conclusione, controllare lo stato in attesa, ripristinare la connessione e riprovare il salvataggio. Controllare che lo stesso risultato venga salvato una sola volta.

Annotare eventuali messaggi d’errore e il punto esatto del flusso. Non condividere password o dati personali dei pazienti.
