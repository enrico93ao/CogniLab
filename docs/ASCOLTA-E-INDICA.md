# Ascolta e indica

Esercizio di comprensione di parole ascoltate con scelta di immagini. Non richiede produzione orale né scrittura. La banca iniziale comprende 17 oggetti fotografici già presenti nell’atlante di CogniLab.

## Impostazioni

- Base: 2 immagini di categorie diverse.
- Intermedio: 4 immagini, con alternative della stessa categoria quando disponibili.
- Avanzato: 6 immagini, con alternative della stessa categoria quando disponibili.
- 10, 15 o 20 parole, senza timer. Nessuna ripetizione prima di aver presentato l’intera banca.
- Voce lenta o naturale; nomi sotto le immagini facoltativi.
- Suggerimento visivo dopo due errori sulla stessa parola, se abilitato.

La voce è quella italiana disponibile sul dispositivo. Non si richiedono microfono o riconoscimento vocale. Le immagini diventano selezionabili dopo la fine dell’audio. Se la voce manca o fallisce, compare un messaggio per riprovare; nessuna risposta viene attribuita automaticamente.

## Risultati e sessioni

L’esercizio è nel catalogo e nel compositore del professionista. Le opzioni usano il sistema di configurazione esistente: nella sessione assegnata il paziente legge le istruzioni senza vedere il menu di configurazione.

Si salvano risposte corrette, scelte totali, errori, risposte al primo tentativo, risposte con suggerimento, risposte senza suggerimento, riascolti e parole previste/completate. L’accuratezza è calcolabile sulle scelte effettuate, non sul successo finale dopo tentativi. Se concluso prima di tutte le parole, il risultato è `interrupted`: non completa la voce assegnata. La durata è l’intervallo orientativo già utilizzato per gli esercizi senza timer, non una durata promessa.

## Attivazione su Firebase — necessaria per l’assegnazione

**Aggiornamento:** per abilitare tutti e sei i nuovi esercizi con una sola modifica, seguire ora `docs/NUOVI-ESERCIZI-LINGUAGGIO.md`. Le istruzioni seguenti descrivono la precedente attivazione del solo Ascolta e indica.

La pubblicazione su GitHub Pages non distribuisce le regole di Realtime Database.

Nella console Firebase del progetto **hub-di-stimolazione-cognitiva**, aprire **Realtime Database → Regole**. Nel percorso:

`cognilab / carePrograms / $patient / $program / exercises / $slot / .validate`

la lista degli identificativi ammessi deve includere:

```text
newData.val() === 'ascolta-indica' ||
```

Inserirlo all’inizio della parentesi contenente gli altri identificativi, prima di `newData.val() === 'il-pianoforte'`, lasciando invariato tutto il resto. Pubblicare le regole nella console. Il file `firebase/cognilab.rules.json` contiene la versione completa aggiornata come riferimento: non sovrascrivere eventuali modifiche alle regole fatte in console successivamente senza confrontarle.

Questa modifica aggiunge un identificativo alla validazione, senza cambiare autorizzazioni di lettura o scrittura. Fino all’aggiornamento delle regole, Firebase può rifiutare l’assegnazione di un programma che include il nuovo esercizio. Gli esercizi già assegnati non richiedono modifiche.

## Verifica

Test di modello, DOM, runtime di salvataggio e regole su dati fittizi: nessun dato paziente creato o modificato. Le regole sono verificate come espressioni, non con un emulatore Firebase. Interfaccia controllata nel browser di anteprima; questo browser non dispone di una voce italiana. L’audio effettivo va verificato su un dispositivo con voce italiana, insieme a una sessione di prova dopo l’aggiornamento delle regole.
