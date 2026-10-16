# Catalogo pubblico e indicizzazione

## Pubblicato il 16 ottobre 2026

- `catalogo-esercizi.html`: i 38 esercizi, descrizioni originali, illustrazioni già usate nella palestra, ricerca facoltativa e collegamenti alle aree.
- `esercizi-memoria.html`, `esercizi-attenzione.html`, `esercizi-linguaggio.html`, `esercizi-ragionamento.html`, `esercizi-visuospaziali.html`, `esercizi-orientamento.html`: sei pagine descrittive, con consegne, esempi illustrativi non registrati e schede delle attività.
- `progetto-enrico-dalessandro.html`: presentazione del progetto e dell’autore con le informazioni professionali già dichiarate nella home. Non sono stati aggiunti titoli, certificazioni, numeri di iscrizione, collaborazioni o risultati clinici non forniti.
- `index.html`: collegamento al catalogo pubblico, navigazione delle aree e del progetto, descrizione aggiornata. Canonical e verifica Google esistenti conservati.
- `sitemap.xml`: nove URL pubblici, compresa la home, con data dell’aggiornamento significativo. Nessuna schermata personale è inclusa.

Le nuove pagine sono HTML statico leggibile senza JavaScript, Firebase, registrazione o autorizzazione. Ricerca e filtri del catalogo sono un miglioramento facoltativo; senza script tutte le schede rimangono visibili. I link sono normali elementi `a href`. Le descrizioni non richiedono di caricare o avviare un esercizio.

I tre punti di ingresso esaminati — `esercizi.html`, `esercizio.html` e `Lista della spesa.html` — ricevono `noindex,follow`. Il noindex è un’indicazione ai motori di ricerca, non un controllo di sicurezza: le autorizzazioni dell’applicazione restano quelle già implementate. Non sono state modificate credenziali, ruoli, regole Firebase o salvataggi.

## Passaggi in Search Console

Questa pubblicazione non equivale all’invio a Google. L’integrazione GitHub non ha accesso alla proprietà Search Console dell’utente.

1. Seleziona la proprietà **Prefisso URL** `https://enrico93ao.github.io/CogniLab/`.
2. Vai su **Sitemap** e invia `sitemap.xml`, oppure l’indirizzo completo `https://enrico93ao.github.io/CogniLab/sitemap.xml`.
3. Controlla l’esito dell’elaborazione. Se il vecchio invio mostrava un errore, verifica prima che il nuovo file sia stato letto e quali URL siano stati rilevati.
4. In **Controllo URL**, verifica la home e `https://enrico93ao.github.io/CogniLab/catalogo-esercizi.html`. Puoi usare il test dell’URL pubblicato e richiedere l’indicizzazione delle pagine aggiornate. Ripetere continuamente la richiesta non costituisce una strategia di posizionamento.
5. Nei rapporti **Indicizzazione delle pagine** e **Rendimento**, segui pagine rilevate/indicizzate, impressioni, clic e query. Le modifiche non garantiscono una posizione o una data di comparsa.

Non è stato aggiunto un `robots.txt` nel percorso del progetto: Google cerca questo file alla radice del dominio, non in `/CogniLab/`. Per questo il file della sitemap viene fornito direttamente per Search Console. Non è stata modificata la configurazione del dominio o di altri repository.

## Collegamento dal sito NeuroCenter VDA

Il sito esterno non è stato modificato: non sono disponibili strumenti di amministrazione per quel sito. Se il responsabile desidera presentare CogniLab in una pagina pertinente, questo breve testo può essere usato come punto di partenza, adattandolo al contenuto della pagina:

```html
<p>Scopri <a href="https://enrico93ao.github.io/CogniLab/">CogniLab, la palestra di stimolazione cognitiva online del dott. Enrico D’Alessandro</a>: il catalogo pubblico presenta attività di memoria, attenzione, linguaggio, ragionamento, abilità visuospaziali e orientamento. Durante la fase di test l’accesso agli esercizi è su invito.</p>
```

Il testo descrive il progetto e non attribuisce al sito esterno titolarità o collaborazioni non verificate.

## Aggiornare il catalogo

I nomi e gli identificativi delle attività provengono da `shared/exercise-catalog.mjs`. Le descrizioni pubbliche e la distribuzione editoriale nelle sei aree sono in `shared/public-catalog-content.mjs`: non modificano la classificazione o i dati salvati dagli esercizi. Alcune attività coinvolgono più abilità insieme.

Le illustrazioni sono ricavate dal sistema grafico esistente, `shared/exercise-artwork.js`. Non sono presentate come screenshot delle sessioni.

Rigenera le pagine con:

```sh
node scripts/seo/build-public-catalog.mjs
python tests/public-seo.py
node tests/public-catalog-search.mjs
```

Il generatore non riscrive la home o le schermate riservate. Aggiorna `publicUpdated` soltanto quando viene pubblicata una modifica significativa; non impostare date future o aggiornamenti giornalieri fittizi.

## Verifiche e limiti

I test controllano XML, URL canonici, metadati, JSON-LD, raggiungibilità dei link senza JavaScript, frammenti, copertura dei 38 esercizi, indicazioni noindex e permanenza del token Google. La ricerca è verificata con un DOM simulato minimo.

Non è stato eseguito un controllo visivo nel browser: il controllo browser richiesto dall’ambiente di anteprima gestita non è disponibile in questa sessione. I controlli statici non attestano la resa su ogni dispositivo e non verificano l’effettiva scansione da parte di Google.

Riferimenti ufficiali:

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
