# Accesso e disposizione degli stimoli

Attenzione alternata distribuisce gli stimoli con campionamento casuale continuo, senza righe o colonne. Il posizionamento mantiene separati i riquadri degli stimoli e adatta la dimensione allo spazio disponibile. Ridimensionamento e pausa conservano i progressi; i collegamenti vengono disegnati durante le risposte corrette. La versione dello stimolo è `scatter8`.

L'accesso distingue inizializzazione, verifica password e abilitazione. Ogni richiesta di accesso o lettura ruolo ha un limite di 12 secondi; il flag di registrazione pubblica ha un limite di 4 secondi, con valore prudenziale false. Il modulo torna utilizzabile dopo un errore. Una risposta tardiva non avvia il reindirizzamento del tentativo scaduto.

Per la palestra è sufficiente una risposta positiva fra ruolo tester, ruolo professionista o registrazione pubblica aperta per un account autenticato non anonimo. L'area clinica continua a richiedere il ruolo professionista. Nessun ruolo viene assegnato dal client e nessuna regola Firebase viene modificata.

Verifiche automatiche: 160 disposizioni su quattro formati, mantenimento progressi in 32 configurazioni, richieste ferme con timeout, pulsanti riabilitati e professionista autorizzato con letture secondarie ferme. Le prove usano Firebase simulato: non attestano lo stato dell'account privato in produzione.
