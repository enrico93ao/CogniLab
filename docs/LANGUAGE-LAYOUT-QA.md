# Layout dei nuovi esercizi di linguaggio — 28 ottobre 2026

## Modifiche

Interfaccia condivisa per Ascolta e indica, Ascolta e ripeti, Ricomponi la parola, Rimetti in ordine la storia, Quali immagini stanno insieme? e A cosa serve?. Palette blu/verde già usata nel portale, icone distinte, pulsante audio riconoscibile, pannelli con contrasti espliciti, indicatore delle prove svolte e controlli nel cassetto. Il collegamento superiore viene nascosto durante il gioco per recuperare spazio.

La disposizione sfrutta la larghezza e l’altezza effettive dell’iframe. Le immagini si adattano allo spazio rimanente dopo consegna, contatori e controlli. Su desktop, quando utile, bersaglio e risposte sono affiancati. Su schermi stretti si impilano. I nomi restano sotto le figure anche su smartphone. Testi e pulsanti non vengono rimpiccioliti con trasformazioni di scala e non vengono tagliati per forzare tutto nella finestra. Nei formati piccoli o molto bassi, soprattutto con cinque scene o sei alternative nominate, rimane lo scorrimento verticale necessario alla leggibilità.

La home presenta tutte e sei le nuove attività in una sezione statica prima degli articoli: tre colonne su desktop, due su tablet, una su smartphone. Ogni scheda rimanda alla descrizione pubblica, con un accesso alla palestra sotto il gruppo. I caroselli esistenti restano disponibili; quello delle altre attività non ripete le sei nuove schede.

## Verifiche

- Chrome remoto, iframe con viewport effettive 1366×768, 1024×768, 768×1024, 390×844, 360×640 e 844×390.
- Tutti e sei gli esercizi nei livelli avanzati; nomi sotto le immagini abilitati per associazioni e funzioni; cinque scene nella storia. Nessun superamento della larghezza del documento nei 36 casi controllati.
- Le schermate campione dei sei esercizi rientrano nelle due finestre desktop. Le attività più lunghe possono richiedere scorrimento verticale sui formati compatti: non viene nascosto contenuto necessario.
- Home controllata a 1366, 768, 390 e 360 pixel: tutte e sei le schede presenti, nessuno scorrimento orizzontale.
- 13 gruppi di test passati: presentazione, tutti i nuovi esercizi, Ascolta e indica, HTML, configurazioni, consegne, home, caroselli, catalogo, dashboard, salvataggio, percorso di sessione e avanzamento immediato.
- Il test di presentazione controlla che il numero e l’ordine dei pulsanti di configurazione restino invariati.

Le prove grafiche usano copie locali dei file di produzione con accesso e salvataggio sostituiti da stub solo nell’ambiente di anteprima. Per misurare la schermata normale di ascolto viene simulato l’evento di fine audio: non è una verifica acustica della voce italiana. Controllato anche l’avviso reale di audio non disponibile. Nessun account paziente aperto e nessuna scrittura su Firebase. Non sono prove su dispositivi fisici o su tutti i browser.

## Compatibilità

Nessuna modifica a stimoli, regole degli esercizi, criteri di completamento, punteggi, identificativi o regole Firebase. Le configurazioni già assegnate conservano gli stessi controlli e comandi di avvio.
