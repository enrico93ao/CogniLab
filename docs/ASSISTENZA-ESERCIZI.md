# Esempi guidati e comandi comuni

Prima applicazione: Attenzione alternata, Esplorazione visuospaziale, Orientamento, Giardino e Pianoforte.

## Prima della prova

“Mostrami come si fa” apre un esempio guidato separato dalla sessione. Non avvia CogniLabRun e non salva punteggi. Per Giardino e Pianoforte viene mostrata una breve sequenza, poi l'utente può ripeterla. Il Giardino rispetta il richiamo diretto o inverso scelto nel menu. Per gli altri esercizi si prova una selezione guidata. Alla fine si torna al menu: l'avvio della sessione rimane una scelta esplicita.

## Durante la prova

La barra comune propone Pausa, Ripeti la consegna e Concludi. La consegna viene mostrata in una finestra che mette in pausa il gioco; è disponibile anche la lettura vocale se supportata dal browser. Per concludere viene chiesta conferma e si salvano le risposte già date. Nei percorsi interrotti anticipatamente gli elementi non completati vengono riportati come omissioni.

TaskClock controlla esclusivamente i timer dell'esercizio: timeout, intervalli e frame di animazione conservano il tempo residuo durante la pausa. Le sequenze musicali e il contesto audio vengono sospesi e ripresi. I timer di Firebase e della sincronizzazione non vengono modificati. Il runtime comune registra il tempo di pausa ed esclude tali intervalli dalla durata attiva del risultato.

La griglia del Giardino e i percorsi riservano lo spazio necessario ai comandi inferiori. Le barre lampeggianti sono nascoste durante la pausa.

## Verifiche

- tests/task-clock.mjs: timer, intervalli, frame, ripresa e durata attiva registrata.
- tests/training-updates.mjs: logica delle prove, sequenze, resize e timer di sessione.
- tests/training-browser.mjs: esempi completabili senza risultati salvati, pausa e lettura consegna senza avanzamento, conclusione unica per tutti e cinque gli esercizi, oltre ai controlli responsive e ai menu già presenti.
