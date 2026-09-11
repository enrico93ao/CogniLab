# Architettura e modifiche

## Percorso comune

Il catalogo `index.html` apre `esercizio.html`, che carica il singolo HTML originale in un iframe e mostra le fasi Impostazioni → Allenamento → Risultati. Ogni file include tema e runtime comuni, metadati, un aggancio esplicito alla funzione di avvio e uno alla funzione finale. Il riepilogo legge i contatori del gioco, non il testo visualizzato. Il pulsante Dettagli dell’esercizio mantiene accessibile il report nativo.

Il tema normalizza tipografia, pannelli, controlli, impostazioni e riepilogo; geometria e colori degli stimoli specifici restano propri dell’attività. Chart.js, Lucide e CSS delle utility sono locali. I collegamenti Firebase sono stati rimossi dal percorso attivo. Il backend locale usa SQLite; quello Sites usa D1 con lo stesso validatore.

## Contratto di risultato v2

```json
{
  "schemaVersion": 2,
  "id": "UUID v4",
  "exerciseId": "id stabile",
  "exerciseVersion": "2.0.0",
  "title": "Titolo dal catalogo",
  "category": "Categoria dal catalogo",
  "startedAt": "ISO 8601",
  "finishedAt": "ISO 8601",
  "durationMs": 60000,
  "status": "completed",
  "settings": {"level": 2},
  "metrics": {
    "correct": 8, "total": 10, "errors": 2, "omissions": 0,
    "accuracyPct": 80, "responseTimeMs": null,
    "score": null, "scoreUnit": "", "scoreDirection": "higher"
  },
  "details": {}
}
```

`POST /api/results` valida il risultato e salva un record per UUID. Ripetere lo stesso invio restituisce successo; riusare lo stesso UUID con dati diversi restituisce 409. `GET /api/results` restituisce lo storico. `GET/POST /api/progress` gestisce le preferenze e mantiene compatibilità con il precedente sito. Le impostazioni sono valori scalari; i dettagli possono contenere prove e metriche annidate. Una misura assente vale null. Accuratezza = corrette/totale × 100, arrotondata a due decimali.

## Correzioni del sorgente

- **Conta i numeri e le lettere:** implementate le funzioni lasciate vuote, eliminati contenitori duplicati, ricostruite esposizione, risposta, vite e progressione.
- **Calcolo e memoria:** aggiunto il contatore reale dei tentativi, distinto dalle sole operazioni corrette.
- **Riconoscimento visivo base:** aggiunto il conteggio dei tentativi e il blocco delle risposte duplicate alla stessa prova già risolta.
- **Riordina la frase:** corrette ed errori misurati entrambi sulle selezioni di parole; frasi completate separate.
- **Riordina le lettere:** azzeramento dei contatori a ogni nuova partita.
- **Orientamento:** azzeramento delle risposte all’avvio e località configurata esplicitamente, senza geolocalizzazione IP esterna.
- **Rispondi il contrario:** esito di errore/scadenza registrato come interrotto, con omissioni quando misurabili.
- **Orologio:** nuova identità di sessione a ogni avvio; scarto temporale in ms, con miglioramento verso valori minori.
- **Tutti i file:** salvataggio comune, asset locali, metadati e formato del riepilogo uniformi. Nessuna migrazione automatica dei vecchi dati Firebase.

## Mappa dei 36 file

Le definizioni complete delle misure sono in `exercise-adapters.json`; le espressioni corrispondono ai contatori effettivi di ciascun sorgente.

| File aggiornato in public/exercises | Categoria | Funzione risultato |
|---|---|---|
| Stroop.html | Attenzione | `endGame` |
| Attenzione alternata.html | Attenzione | `endGame` |
| Calcolo e memoria.html | Memoria | `showFinalResults` |
| Cancellazione di H.html | Attenzione | `endExercise` |
| Catena di parole.html | Linguaggio | `window.finishSession` |
| Conta i numeri e le lettere.html | Memoria | `showFinalSummary` |
| Doppio compito e velocità.html | Funzioni esecutive | `endGame` |
| Esplorazione visuospaziale multilivello.html | Visuospaziale | `endGame` |
| Il cifrario.html | Funzioni esecutive | `showReport` |
| Il semaforo delle parole.html | Funzioni esecutive | `endSession` |
| Inibizione e memoria di lavoro.html | Funzioni esecutive | `endGame` |
| Intruso semantico.html | Linguaggio | `showResults` |
| L'orologio invisibile.html | Attenzione | `renderStatisticsAndGraphs` |
| La torre delle lettere.html | Funzioni esecutive | `endSession` |
| Memoria di lavoro avanzato.html | Memoria | `checkAnswers` |
| Memoria di prosa con distrattori.html | Memoria | `goToStats` |
| Memoria visuospaziale con domande.html | Visuospaziale | `showResults` |
| Memoria visuospaziale con numeri.html | Visuospaziale | `showSummary` |
| Memoria visuospaziale il Giardino.html | Visuospaziale | `finalize` |
| Memoria visuospaziale rotante.html | Visuospaziale | `endSession` |
| N back semantico.html | Memoria | `endGame` |
| N back.html | Memoria | `stopGame` |
| Orientamento temporale-spaziale.html | Orientamento | `renderFinal` |
| Relazioni logiche.html | Funzioni esecutive | `showStats` |
| Riconoscimento visivo base.html | Visuospaziale | `endGame` |
| Riconoscimento visivo.html | Memoria | `showSummary` |
| Riordina la frase.html | Linguaggio | `showFinalScreen` |
| Riordina le lettere.html | Linguaggio | `endGame` |
| Riordina le parole in ordine alfabetico.html | Linguaggio | `showFinalResults` |
| Rispondi al contrario e ricorda la parola.html | Funzioni esecutive | `finishRound` |
| Rispondi il contrario.html | Funzioni esecutive | `processAnswer` |
| Set shifting.html | Funzioni esecutive | `calculateMetricsAndSave` |
| Silhoutte.html | Visuospaziale | `endGame` |
| Trova l'immagine corrispondente.html | Visuospaziale | `endGame` |
| Trova l'intruso.html | Visuospaziale | `endGame` |
| conta_cerchi_rossi.html | Attenzione | `endSession` |
