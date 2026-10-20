# Risorse grafiche locali degli esercizi

32 esercizi usano `assets/vendor/exercise-utilities-3.4.17.css` compilato con Tailwind 3.4.17. Non viene più eseguito il compilatore CDN nel browser. I colori clinical e brand sono definiti in `scripts/assets/tailwind.config.cjs`; i caratteri personalizzati restano nei rispettivi esercizi.

Tre esercizi usano un sottoinsieme locale di 30 icone Lucide 0.468.0. Il generatore conserva le funzioni DOM della libreria e include i nodi SVG necessari, comprese le icone attivate durante la prova. Le licenze sono in `assets/vendor/`.

## Rigenerazione

1. `npm ci --prefix scripts/assets` installa gli strumenti separati con versioni e lockfile fissati.
2. `npm run assets:build` compila il CSS e rigenera icone, manifest e licenze. Non richiede la compilazione del precedente progetto Next.
3. `npm run test:assets` verifica i riferimenti, alcuni stati CSS rilevanti e il rendering di tutte le icone. Richiede JSDOM tra le dipendenze di sviluppo.
4. Se il contenuto degli asset cambia, aggiornare anche il parametro di cache nei riferimenti HTML e pubblicare insieme pagine e asset.

Il generatore scansiona le pagine HTML e i file JS condivisi. Le classi Tailwind devono comparire per intero nel sorgente: usare `selected ? 'bg-green-100' : 'bg-red-100'`, evitando di costruire il nome con frammenti come `bg-${color}-100`. Per nuovi nomi di icone aggiunti tramite codice, usare i nomi completi in `data-lucide` o `setAttribute`.

Verifiche del 20 ottobre 2026: confronto iniziale delle utility dei 32 esercizi con i sorgenti precedenti, senza selettori mancanti dopo normalizzazione della minificazione; successivamente sono stati eliminati i blocchi Firestore legacy non più usati; rendering delle 30 icone e conservazione degli attributi nel DOM. Le verifiche automatiche non sostituiscono una prova visiva e touch su dispositivi reali.

Restano risorse esterne per alcuni font, Font Awesome e Firebase. Questo intervento non elimina ogni richiesta a servizi esterni e non abilita una modalità completamente offline.

Riferimento tecnico: https://v3.tailwindcss.com/docs/content-configuration
