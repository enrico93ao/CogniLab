# Controlli uniformi dei menu

I menu aggiornati sono: Attenzione alternata, Esplorazione visuospaziale, Orientamento, Giardino, Pianoforte, Lista della spesa, Cancellazione di H, Riconoscimento visivo base e Trova l'immagine corrispondente.

- Scelte singole: schede con radio nativo, testo leggibile e stato selezionato in verde.
- Opzioni attivabili: caselle da spuntare, con area di clic ampia.
- Direzione: Diretto/Inverso, senza aprire un menu a tendina.
- Durata e difficoltà: scelte visibili; le descrizioni lunghe vengono abbreviate nella scheda ma restano nell'etichetta accessibile.
- Le scelte a pulsanti già esistenti mostrano un indicatore di selezione e lo stato aria-pressed.

In Attenzione alternata il tipo di percorso, l'ordine e il movimento vengono impostati prima di premere un unico pulsante di avvio. La barra rossa opzionale è attivabile in tutte le modalità, a sinistra o a destra. Viene nascosta alla fine e al ritorno al menu, non intercetta i tocchi e rispetta il movimento ridotto. Il posizionamento dei nodi tiene conto dello spazio laterale necessario.

In Esplorazione il livello viene selezionato prima di avviare la prova. La barra resta disponibile a sinistra, destra o in posizione casuale.

Il componente shared/menu-controls.js mantiene i select originali come fonte delle impostazioni, aggiungendo controlli radio sincronizzati. I controlli duplicati dell'interfaccia sono marcati data-ui-proxy e ignorati dalla raccolta delle impostazioni per il salvataggio. Se il componente non viene caricato, i select originali restano utilizzabili.

Test: tests/menu-controls.mjs verifica sincronizzazione, opzioni disabilitate e impostazioni salvate; tests/training-browser.mjs verifica i nove menu su telefono e desktop e la barra in Attenzione alternata, oltre alle prove di gioco già presenti.
