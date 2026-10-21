# Orientamento temporale e sessioni assegnate — 20 ottobre 2026

- L’esercizio mantiene soltanto data, calendario e sequenze temporali. Eliminate città, domande sulla casa, geolocalizzazione e richieste a servizi esterni.
- Stagioni dal 21 marzo, giugno, settembre e dicembre: convenzione didattica dichiarata.
- Dopo due errori nel conteggio dei giorni: suggerimento sul metodo, senza numero risolutivo. Dopo quattro errori: risposta esplicita; il paziente deve comunque inserirla.
- Le impostazioni dei programmi vengono applicate prima dell’avvio. Il paziente legge la consegna e conferma di essere pronto, senza aprire i menu di configurazione.
- Inibizione e memoria prepara prima le regole casuali e conserva la schermata nativa delle istruzioni. Il gioco si adatta anche alle finestre basse, con comandi nel flusso e scorrimento verticale di riserva.
- Il riquadro centrale compare subito quando termina l’esercizio; un risultato condiviso e salvato abilita il pulsante per continuare. La conclusione recupera il calendario salvato e distingue prossima sessione, fine programma e data non disponibile.
- Rimuovi paziente: nasconde esclusivamente il record nel proprio elenco; è ripristinabile. Non revoca account, collegamento o programmi attivi, come esplicitato nella conferma.
- Elimina assegnazione: archivia l’intero programma assegnato con la regola già esistente; nessuna sessione storica o configurazione viene cancellata. Non elimina singole date dal calendario. Lo storico resta consultabile. Non cambia le regole Firebase e non elimina account Authentication.
- Grafici visibili nelle due dashboard: serie e variazioni di accuratezza soltanto tra esercizi e impostazioni confrontabili, senza un punteggio clinico globale o valori inventati.

Verifiche: DOM simulato per salvataggio, prossima data, istruzioni effettive, suggerimenti progressivi, rimozione/ripristino e grafici; flussi di assegnazione e quattro sessioni; regole valutate localmente; regressione HTML e SEO. Nessuna scrittura su pazienti reali. La verifica visiva su dispositivi fisici resta necessaria.

Revisione automatica: rilevata e rimossa anche la precedente cancellazione permanente nella gestione locale dei pazienti. La funzione ora aggiorna soltanto il flag archived dell’anagrafica privata del professionista, esclude il paziente dall’elenco attivo e offre Ripristina. Non rimuove anagrafica o storico Firebase.
