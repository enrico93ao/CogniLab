# Home, contatti e recensioni — 17 ottobre 2026

La barra superiore e la presentazione iniziale identificano il dott. Enrico D’Alessandro come creatore. Il carosello elenca due esercizi nuovi e tre aggiornati, con collegamenti alle schede pubbliche. Si ferma su hover/focus, interazione manuale, pagina nascosta e movimento ridotto; dispone di pausa e frecce.

## Moduli

Contatti: nome, cognome, email, messaggio facoltativo. Recensioni: alias pubblico, email privata, voto da 1 a 5 senza preselezione, commento, autorizzazione alla pubblicazione. Il trasporto attuale è mailto verso enrico.ao@gmail.com: apre il client di posta e NON invia automaticamente. L’interfaccia lo dichiara prima e dopo l’azione. Esiste un testo da copiare se il client non è configurato. Nessun campo viene archiviato nel database o nel browser dall’app; il fallback HTML usa POST verso mailto per evitare dati nei parametri della pagina. Per invio diretto dal sito occorre configurare un servizio server/email.

## Recensioni vere

Nessuna recensione inventata e nessuna media iniziale. La home renderizza soltanto data/public-reviews.json. Dopo aver ricevuto l’email e l’autorizzazione, il gestore può aggiungere un record con name (alias), rating (intero 1–5), comment, date (YYYY-MM-DD), approved:true. Non inserire email o informazioni sanitarie: il file è PUBBLICO. Il generatore rifiuta campi aggiuntivi e record non approvati, ed effettua l’escape del testo. Non aggiungere autorizzazioni o corrispondenza privata al repository. Ammettere recensioni negative pertinenti; richiedere nuove conferme per modifiche sostanziali al testo. La home non dichiara un utilizzo verificato automaticamente.

## Privacy e cookie

Le nuove informative descrivono pagine pubbliche, hosting, moduli, recensioni e dati locali. L’avviso è informativo, non un consenso pubblicitario; non carica tracker. Il riconoscimento dell’avviso dura per la sessione. Footer pubblico con link Privacy, Cookie, Contatti e recensione.

L’aggiunta delle pagine non certifica l’intera piattaforma come conforme GDPR. Il gestore deve confermare identità e recapiti del titolare, ruoli dei professionisti, basi giuridiche e informativa per dati clinici, tempi reali di conservazione, contratti e impostazioni Firebase/posta e trasferimenti. Non sono state modificate regole Firebase o politiche server di conservazione. Non sono stati inventati indirizzi di sede, numero d’iscrizione o accordi con fornitori.

Riferimenti verificati: https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876 e Regolamento UE 2016/679.

Verifiche automatiche: 12 URL pubblici, metadati/JSON-LD/link, 38 schede e ricerca, handoff mailto con campi privati e voto neutro, fallback senza dati nell’URL, sintassi. Browser QA non disponibile; verificare scorrimento su dispositivi reali e apertura del proprio client di posta. Nessuna email inviata dai test.
