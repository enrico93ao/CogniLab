# Gestione dei dati dell’account

## Comandi disponibili

Nella palestra o nel contenitore dell’esercizio: **Il mio account → I miei dati**.

**Scarica i miei dati (JSON)** prepara un file sul dispositivo dell’utente. L’esportazione usa il solo UID della sessione autenticata; non accetta un identificativo di un altro utente. Comprende:
- identificativo, email e nome dell’account, con indicazione di verifica email;
- profilo e storico personale consultabili;
- programmi assegnati a quell’account, collegamenti, inviti e risultati condivisi ancora consultabili;
- attività e questionari associati a quell’UID;
- risultati locali in coda e diario personale della scheda del browser.

Non include l’archivio clinico privato dei pazienti di un professionista. Le righe locali o di sessione marcate con un `patientId` clinico sono escluse dall’esportazione personale. I questionari inviati tramite l’accesso anonimo separato non vengono ricollegati all’account personale.

Le letture sono indipendenti: non è un backup atomico del database. Il JSON contiene `exportedAt`, `complete` e `unavailable`. Una sezione non leggibile o una connessione non disponibile produce un’esportazione dichiarata parziale, conservando quanto recuperabile, compresi i risultati locali. I risultati condivisi di un programma vengono letti singolarmente, con le autorizzazioni esistenti; non viene tentata una lettura dell’intero ramo `careSessions`.

Un cambio di account durante l’operazione interrompe la preparazione. Non vengono esportati token, password o l’oggetto Firebase User completo. Il file contiene dati personali e va custodito su un dispositivo riservato. Non sono stati creati o scaricati export reali durante lo sviluppo.

## Richiesta di cancellazione

L’utente sceglie tra account e dati personali, storico degli allenamenti liberi o dati dei programmi assegnati. **Prepara richiesta** mostra una bozza con UID, email dell’account e ambito scelto; il destinatario è il gestore già indicato nella pagina privacy, `enrico.ao@gmail.com`.

**Apri app di posta** apre un messaggio precompilato. L’utente deve completarne personalmente l’invio. Il sito non crea un ticket e non dichiara la richiesta ricevuta o eseguita. Se non si apre una app di posta, la bozza può essere copiata e inviata manualmente. Il cambio di account invalida la bozza.

Questa funzione non elimina dati o account automaticamente. In particolare, interrompere un collegamento con il professionista o archiviare un programma non equivale a cancellarne i risultati.

## Procedura del gestore da completare prima di una cancellazione

1. Verificare l’identità e l’ambito della richiesta attraverso un canale appropriato. Il solo UID scritto in una email non dimostra la titolarità; non chiedere password o codici di accesso.
2. Distinguere dati personali di allenamento e documenti del percorso clinico, coinvolgendo il professionista competente. Definire quali dati rimuovere e quali eventuali dati conservare, con la relativa motivazione e durata. La piattaforma non decide questi aspetti.
3. Verificare risultati in attesa di sincronizzazione e disponibilità della copia richiesta dall’utente. Definire la gestione di copie di sicurezza e archivi locali secondo le decisioni del servizio.
4. Applicare l’operazione concordata soltanto con le autorizzazioni necessarie e dopo averne verificato l’esito. Tenere un registro riservato della gestione e comunicare l’esito all’interessato.
5. Per la chiusura completa, coordinare la gestione dei dati con Firebase Authentication: eliminare soltanto il login lascerebbe risultati e riferimenti nel database. L’ordine operativo deve evitare dati orfani o risultati reintrodotti da una coda non gestita.

### Mappa per individuare l’ambito della richiesta

| Archivio | Contenuto da verificare |
|---|---|
| Firebase Authentication, UID dell’account | Accesso ed email; non sostituisce lo storico nel database |
| `cognilab/users/UID/profile` | Profilo personale |
| `cognilab/users/UID/sessions` | Risultati personali, comprese possibili copie dei risultati assegnati |
| `cognilab/carePrograms/UID` e `cognilab/careSessions/UID/PROGRAMMA` | Programmi e risultati condivisi: richiedono coordinamento con il professionista |
| `cognilab/careLinks/UID` e `cognilab/careInvites/UID` | Collegamenti e inviti |
| `cognilab/users/PROFESSIONISTA/clinical` | Archivio clinico privato del professionista, con propri riferimenti al paziente |
| `cognilab/activity/UID`, `presence/UID`, `feedback/UID` | Dati tecnici e questionari effettivamente associati a quel medesimo UID |
| Proprietà private di Apps Script | Marcatori di deduplicazione delle notifiche, da considerare nella politica del servizio |
| Browser e copie di sicurezza | Dati locali e backup richiedono una gestione distinta dal database attivo |

Questa mappa è descrittiva: non è uno script di cancellazione e non assegna nuovi permessi. Non sono state modificate regole, ruoli o credenziali Firebase.

## Decisioni ancora necessarie per automatizzare la cancellazione clinica

Il gestore deve definire chi gestisce la richiesta per i dati clinici, quali tempi di conservazione applicare e come gestire backup, copie condivise e marcatori email. Dopo tali decisioni si potrà costruire e verificare un servizio amministrativo con anteprima dell’ambito, conferma esplicita e tracciamento dell’esito. Nessuna scadenza è stata inventata o attivata nel codice.
