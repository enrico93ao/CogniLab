# Dashboard ed esercizi: aggiornamento del 19 ottobre 2026

- Eliminati i contatori globali dalla palestra e il relativo listener delle statistiche.
- Riquadro di supporto professionale con collegamento al form contatti; codice account nei dettagli.
- Progressi: tre indicatori essenziali, riepilogo per area in evidenza, filtri, grafici e storico nei dettagli apribili.
- Creazione accesso paziente visibile solo al gestore approvato in modalità clinica. Le autorizzazioni Firebase continuano a proteggere la pagina.
- Conta cerchi: dopo due risposte cumulative errate consecutive, mostra il subtotale corretto precedente nella prova successiva. Il dato originale rimane nel risultato.
- Doppio compito: area e HUD adattivi, fascia verde dal 15% al 50%, barra laterale opzionale sinistra/destra. La risposta viene validata solo se il centro dello stimolo si trova nella fascia visibile. Ricalcolo dei limiti a ogni frame e al ridimensionamento.
- Inibizione e memoria: 26 stimoli con nome accessibile, fotografie locali per gli oggetti disponibili, nuova presentazione degli stimoli e delle regole.
- Tastierini numerici con più, meno, cancellazione e correzione in calcolo e memoria e memoria di lavoro avanzata; resta disponibile la tastiera fisica.
- Memoria di prosa: puntatore visibile, eventi pointer con cattura e coordinate corrette sul canvas ridimensionato.
- Memoria visiva con domande: immagini vettoriali ingrandite con profondità, ombre e materiali; risposte coerenti con i dati della scena; date compatibili con il mese.
- Memoria visiva con numeri: dopo un errore ripete la disposizione identica, senza avanzare il round; il punteggio conta le sequenze corrette al primo tentativo, gli errori sono conservati.
- Semaforo: nessun campo nome paziente nel menu iniziale. Campo legacy nascosto per compatibilità dei report.

Versione 3.1.0 per conta cerchi, doppio compito, inibizione e memoria con numeri: le nuove prestazioni non vengono accorpate alle vecchie versioni nei confronti. Nessuna modifica alle regole Firebase o al servizio email in questo aggiornamento.

## Verifiche
Test DOM su input con segno, limiti della fascia, ripetizione della sequenza con punteggio onesto, puntatore e coordinate del disegno; 180 scene variabili con opzioni valide e univoche. Test su aiuto cumulativo dopo due errori, navigazione del gestore, dashboard, configurazioni assegnate, salvataggio/ripresa e bridge dei risultati. Analisi statica di 38 esercizi e regressione HTML. Non equivalgono a una verifica visiva e manuale su tutti i dispositivi e non hanno scritto risultati nel Firebase reale.
