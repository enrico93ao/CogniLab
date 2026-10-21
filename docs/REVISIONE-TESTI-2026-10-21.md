# Revisione dei testi di CogniLab

21 ottobre 2026

## Ambito

Sono state esaminate le 69 pagine HTML del portale, comprese le 38 attività, e i testi generati dalle dashboard e dai componenti condivisi. La revisione modifica 64 pagine HTML e 283 formulazioni distinte nelle pagine e nei rispettivi sorgenti. Le pagine con testi già chiari non sono state riscritte per il solo scopo di cambiarle.

## Criteri adottati

- Frasi più dirette, con indicazioni su cosa fare o su cosa mostra un risultato.
- Meno slogan, superlativi e metafore generiche; incoraggiamenti brevi e legati all’attività svolta.
- Termini italiani al posto di anglicismi evitabili. Conservati i nomi tecnici utili, come N-back e set shifting.
- Commenti ai risultati limitati alla prova, senza giudizi sullo stato cognitivo, confronti con presunte norme cliniche o promesse di benefici.
- Articoli alleggeriti nelle formule ripetitive, conservando citazioni, risultati degli studi e precisazioni sui loro limiti. Le date di revisione editoriale non indicano una nuova ricerca bibliografica.
- Profilo professionale più concreto e personale; dati biografici e formativi conservati.

## Correzioni di contenuto collegate al testo

Nel catalogo l’orientamento riguarda ora data, mesi e stagioni, senza richiedere un luogo. La descrizione delle stagioni riporta la convenzione didattica del giorno 21, già usata dall’esercizio. Corretti anche descrizioni di esercizi non corrispondenti al funzionamento attuale e punti doppi nei riepiloghi del catalogo.

Sono state rimosse dalle schermate di gioco formulazioni come “Dispositivo Medico”, “Conforme HIPAA & GDPR” e riferimenti a protocolli standardizzati che il solo esercizio non documenta. Le informative privacy mantengono i propri contenuti sostanziali.

## Funzionamento e verifiche

Regole, durate, domande-stimolo e calcoli dei punteggi sono conservati. È stata aggiunta la compatibilità con le vecchie etichette di avvio e menu, così che la revisione non richieda di ricreare le configurazioni dei pazienti. I controlli comprendono analisi dei sorgenti, navigazione, avvio delle configurazioni, assegnazioni, salvataggio, ripresa e regole di avanzamento. I test sono simulazioni DOM e verifiche locali; non rappresentano una nuova validazione clinica o una prova su ogni dispositivo fisico.

## Registro delle riscritture

Le voci seguenti riportano le formulazioni modificate nei sorgenti; gli articoli e le pagine generate possono ripetere la stessa riscrittura in più punti. Le interpolazioni nei messaggi dinamici sono riportate come nel codice.

### 1. index.html, scripts/seo/build-public-catalog.mjs

Prima: Un piccolo spazio, ogni giorno

Dopo: Esercitarsi con CogniLab

### 2. index.html, scripts/seo/build-public-catalog.mjs

Prima: Una palestra di stimolazione cognitiva con 38 attività in italiano per memoria, attenzione, linguaggio, ragionamento, percezione e orientamento. Esplora gli esercizi e scopri come si svolgono prima di entrare.

Dopo: 38 esercizi in italiano per allenare memoria, attenzione, linguaggio, ragionamento, percezione e orientamento. Puoi consultarli nel catalogo o accedere per svolgere il programma assegnato dal tuo professionista.

### 3. index.html, scripts/seo/build-public-catalog.mjs

Prima: È uno spazio digitale in cui esercitare memoria, attenzione, linguaggio e altre abilità attraverso attività guidate. La stimolazione cognitiva propone compiti diversi per mettere in gioco le proprie risorse, con difficoltà adeguate alla persona e ai suoi obiettivi.

Dopo: CogniLab raccoglie esercizi per memoria, attenzione, linguaggio e altre abilità cognitive. Le attività hanno difficoltà diverse, da scegliere in base alle esigenze della persona e alle indicazioni del professionista.

### 4. index.html, scripts/seo/public-pages.mjs

Prima: La palestra cresce

Dopo: Gli esercizi più recenti

### 5. catalogo-esercizi.html, esercizi-attenzione.html, esercizi-linguaggio.html, esercizi-memoria.html, esercizi-orientamento.html, esercizi-ragionamento.html, esercizi-visuospaziali.html, index.html, progetto-enrico-dalessandro.html, scripts/seo/build-public-catalog.mjs

Prima: Dalla scoperta all’attività

Dopo: Accesso alla palestra

### 6. index.html, scripts/seo/public-pages.mjs

Prima: La tua esperienza conta

Dopo: Recensioni

### 7. index.html, scripts/seo/public-pages.mjs

Prima: Le voci di chi usa CogniLab

Dopo: Le esperienze degli utenti

### 8. index.html, scripts/seo/public-pages.mjs

Prima: Uno spazio per raccontare la facilità d’uso e l’esperienza con gli esercizi.

Dopo: Hai usato CogniLab? Racconta come ti sei trovato con gli esercizi e con il sito.

### 9. index.html, scripts/seo/public-pages.mjs

Prima: Le prime recensioni iniziano da te

Dopo: Vuoi lasciare una recensione?

### 10. shared/care-dashboard.js

Prima: Il tuo allenamento, un passo alla volta

Dopo: Il tuo programma di esercizi

### 11. shared/care-dashboard.js

Prima: Qui trovi i programmi del professionista. Puoi riprendere una sessione lasciata a metà e ritrovare i risultati anche da un altro dispositivo.

Dopo: Qui trovi i programmi assegnati dal tuo professionista. Se interrompi una sessione, puoi riprenderla dagli esercizi già salvati, anche su un altro dispositivo.

### 12. shared/progress-view.js

Prima: Il percorso, a colpo d’occhio

Dopo: Andamento degli esercizi

### 13. shared/feedback-summary.js

Prima: Come viene vissuta la palestra

Dopo: Questionari di gradimento

### 14. shared/shell-account.js

Prima: Ottimo, continuiamo!

Dopo: Esercizio salvato

### 15. shared/shell-account.js

Prima: Un esercizio alla volta: il tuo impegno conta. Sei pronto per il prossimo?

Dopo: Il risultato è stato salvato. Puoi passare al prossimo esercizio.

### 16. shared/shell-account.js

Prima: Hai dedicato tempo al tuo allenamento. Ora puoi concludere la sessione.

Dopo: Le attività previste sono terminate. Puoi concludere la sessione.

### 17. shared/shell-account.js

Prima: Ogni allenamento è un passo nel tuo percorso. Grazie per l’impegno di oggi: concediti una pausa.

Dopo: I risultati di oggi sono salvati. Puoi fermarti qui e riprendere il programma alla prossima sessione.

### 18. shared/shell-account.js

Prima: Un momento: il risultato è in attesa

Dopo: Risultato non ancora sincronizzato

### 19. shared/progress-view.js

Prima: Il tuo percorso si aggiorna dopo ogni attività.

Dopo: Qui trovi i risultati delle attività salvate.

### 20. professionisti.html, scripts/seo/professional-platform.mjs

Prima: Confronta prove confrontabili

Dopo: Confronta prove con le stesse impostazioni

### 21. professionisti.html, scripts/seo/professional-platform.mjs

Prima: Se i dati non bastano, viene segnalato: non viene inventato un punteggio.

Dopo: Se mancano prove sufficienti per un confronto, il riepilogo lo segnala.

### 22. index.html, scripts/seo/build-public-catalog.mjs

Prima: Il comfort delle attività dipende dallo spazio disponibile e dal tipo di interazione richiesto.

Dopo: Per alcuni esercizi è più comodo uno schermo ampio o l’uso della tastiera.

### 23. esercizi-attenzione.html, esercizi-linguaggio.html, esercizi-memoria.html, esercizi-orientamento.html, esercizi-ragionamento.html, esercizi-visuospaziali.html, scripts/seo/build-public-catalog.mjs

Prima: Quali richieste trovi in quest’area

Dopo: Che cosa prevedono gli esercizi

### 24. catalogo-esercizi.html, scripts/seo/build-public-catalog.mjs

Prima: La palestra, attività per attività

Dopo: Tutti gli esercizi di CogniLab

### 25. professionisti.html, scripts/seo/professional-platform.mjs

Prima: Le impostazioni fanno parte della prescrizione

Dopo: Scegli le impostazioni per il paziente

### 26. scripts/seo/professional-content.mjs, valutazione-neuropsicologica.html

Prima: La domanda di partenza

Dopo: Prima della visita

### 27. scripts/seo/professional-content.mjs, valutazione-neuropsicologica.html

Prima: Non solo un test di memoria: un percorso per comprendere le abilità cognitive e il loro impatto nella vita quotidiana.

Dopo: Colloqui e test aiutano a capire quali abilità sono cambiate e come queste difficoltà incidono sulla vita quotidiana.

### 28. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Prima di tutto, dare spazio alla tua storia

Dopo: Il primo colloquio: partire dalla tua esperienza

### 29. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Piacere di conoscerti

Dopo: Il dott. D’Alessandro

### 30. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Mi occupo di persone, delle loro storie e delle difficoltà che possono incontrare nel pensare, nel sentire e nella vita di ogni giorno.

Dopo: Nel mio lavoro incontro persone che stanno affrontando difficoltà emotive, problemi di sonno o cambiamenti nella memoria e nelle altre abilità cognitive.

### 31. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Sono ambiti diversi, uniti dall’attenzione a ciò che ogni persona vive e desidera ritrovare.

Dopo: In ciascuno di questi ambiti parto dalla richiesta della persona e dalle difficoltà che incontra ogni giorno.

### 32. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Non tutte le richieste hanno bisogno dello stesso percorso. Un problema di sonno, una difficoltà emotiva o un cambiamento nella memoria richiedono domande e strumenti differenti. Il primo passo è orientarsi, senza dover arrivare al colloquio con una spiegazione già pronta.

Dopo: Durante il primo colloquio cerchiamo di capire che cosa ti ha portato a chiedere aiuto. Da lì valutiamo se proseguire con un approfondimento neuropsicologico, un percorso psicologico o un intervento sul sonno. Puoi raccontare quello che stai vivendo anche se non sai ancora come definirlo.

### 33. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Dalle difficoltà quotidiane a un percorso da costruire

Dopo: Gli ambiti di cui mi occupo

### 34. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Uno spazio per le difficoltà emotive

Dopo: Supporto psicologico e psicoterapia

### 35. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Ritrovare un rapporto diverso con il sonno

Dopo: Difficoltà di sonno e insonnia

### 36. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: Non serve avere già tutte le risposte

Dopo: Per un primo contatto

### 37. dott-enrico-dalessandro.html, scripts/seo/professional-content.mjs

Prima: La tecnologia può affiancare il lavoro clinico, ma il suo valore resta legato alla persona che la usa: alle sue possibilità, ai suoi obiettivi e alla sua esperienza.

Dopo: Ho sviluppato CogniLab per proporre esercizi anche tra un incontro e l’altro e poterne consultare i risultati insieme al paziente.

### 38. news-adl-iadl-autonomia.html, news-caregiver-supporto-rete.html, news-disturbo-neurocognitivo-lieve-maggiore.html, news-emozioni-cognizione.html, news-interazione-sociale.html, news-rtms-alzheimer-ricerca.html, news-sonno-cognizione.html, news-stimolazione-cognitiva.html, scripts/seo/news-pages.mjs

Prima: Il punto da ricordare

Dopo: In breve

### 39. news-disturbo-neurocognitivo-lieve-maggiore.html, shared/news-content.mjs

Prima: Prima delle etichette, la persona

Dopo: Quando una dimenticanza merita attenzione

### 40. news-rtms-alzheimer-ricerca.html, shared/news-content.mjs

Prima: Innovazione significa anche leggere i limiti: i risultati di un protocollo di ricerca non dimostrano che ogni trattamento rTMS sia efficace per ogni persona con Alzheimer.

Dopo: Gli studi sulla rTMS nell’Alzheimer hanno dato risultati diversi. Per interpretarli occorre considerare il protocollo usato, le persone coinvolte e la durata del trattamento.

### 41. news-rtms-alzheimer-ricerca.html, shared/news-content.mjs

Prima: La riportiamo con la sua data, senza usarla come unica fotografia della ricerca attuale.

Dopo: Va letta insieme alla sua data di pubblicazione e agli studi successivi.

### 42. news-rtms-alzheimer-ricerca.html, shared/news-content.mjs

Prima: Un risultato ottenuto nella depressione non dimostra automaticamente un beneficio nell’Alzheimer. Anche bersaglio, modalità di stimolazione e durata del programma contano: “rTMS” non identifica un unico intervento intercambiabile.

Dopo: Le indicazioni per la depressione e quelle per l’Alzheimer vanno considerate separatamente. Contano anche l’area stimolata, le modalità e la durata del programma: i protocolli rTMS possono essere molto diversi.

### 43. news-rtms-alzheimer-ricerca.html, shared/news-content.mjs

Prima: È un risultato promettente, ma riguarda quel protocollo e un periodo di osservazione limitato.

Dopo: Il risultato è incoraggiante, ma riguarda quel protocollo e un periodo di osservazione limitato.

### 44. news-rtms-alzheimer-ricerca.html, shared/news-content.mjs

Prima: Il riferimento riportato permette di leggere l’abstract originale e seguire il collegamento alla pubblicazione.

Dopo: Tra le fonti trovi l’abstract e il collegamento alla pubblicazione.

### 45. news-caregiver-supporto-rete.html, shared/news-content.mjs

Prima: Chiedere aiuto non riduce il valore della cura: permette di distribuirla e di riconoscere anche i bisogni di chi assiste.

Dopo: Chi assiste una persona con demenza può avere bisogno di riposo, sostegno pratico e qualcuno con cui parlare. Chiedere aiuto permette di condividere questi impegni.

### 46. news-caregiver-supporto-rete.html, shared/news-content.mjs

Prima: La cura coinvolge quindi tempo, responsabilità e relazioni, non soltanto singoli gesti pratici.

Dopo: Questi compiti occupano tempo e possono cambiare gli equilibri della vita familiare.

### 47. news-caregiver-supporto-rete.html, shared/news-content.mjs

Prima: Non è una misura dell’affetto.

Dopo: Può essere faticoso anche quando il legame affettivo è molto forte.

### 48. news-caregiver-supporto-rete.html, shared/news-content.mjs

Prima: La rete dovrebbe prevedere anche cosa fare se il caregiver principale non è disponibile.

Dopo: È utile accordarsi anche su chi può intervenire quando il caregiver principale non è disponibile.

### 49. news-caregiver-supporto-rete.html, shared/news-content.mjs

Prima: costruire una rete rende la cura una responsabilità condivisa, anziché un compito invisibile affidato a una sola persona.

Dopo: distribuire gli impegni tra familiari, amici e servizi può evitare che l’assistenza ricada interamente su una sola persona.

### 50. news-interazione-sociale.html, shared/news-wellbeing-content.mjs

Prima: La relazione ha valore anche quando non si ricorda un incontro nei dettagli. Partecipare, sentirsi accolti e poter scegliere restano bisogni importanti.

Dopo: Anche se i dettagli di un incontro vengono dimenticati, passare del tempo insieme può restare piacevole e importante per la persona.

### 51. news-interazione-sociale.html, shared/news-wellbeing-content.mjs

Prima: La scelta dovrebbe seguire desideri e possibilità della persona, evitando sia l’esclusione preventiva sia la partecipazione imposta.

Dopo: Chiedi alla persona che cosa le farebbe piacere e adatta la proposta alle sue possibilità.

### 52. news-interazione-sociale.html, shared/news-wellbeing-content.mjs

Prima: Se l’incontro diventa faticoso, ridurne la durata o scegliere un momento diverso è un adattamento, non un fallimento.

Dopo: Se l’incontro diventa faticoso, si può accorciarlo o provare in un altro momento della giornata.

### 53. news-interazione-sociale.html, shared/news-wellbeing-content.mjs

Prima: È una proposta organizzativa da adattare, non una prescrizione di frequenza valida per tutti. La continuità si costruisce più facilmente quando gli impegni sono realistici e distribuiti.

Dopo: La frequenza va concordata in base alle preferenze della persona e alla disponibilità di chi la accompagna. Piccoli impegni regolari possono essere più facili da mantenere.

### 54. news-emozioni-cognizione.html, shared/news-wellbeing-content.mjs

Prima: L’emozione va ascoltata, senza colpevolizzare la persona o chi la assiste.

Dopo: Ascoltare che cosa preoccupa la persona aiuta a capire come sostenerla.

### 55. news-emozioni-cognizione.html, shared/news-wellbeing-content.mjs

Prima: Sono accorgimenti da personalizzare, non un trattamento universale.

Dopo: Vanno adattati alla persona e alla situazione.

### 56. news-emozioni-cognizione.html, shared/news-wellbeing-content.mjs

Prima: Sostenere il benessere emotivo aiuta a creare condizioni più favorevoli per la vita quotidiana. Non richiede di essere sempre sereni e non sostituisce la cura delle cause del disturbo cognitivo.

Dopo: Ansia, tristezza e frustrazione possono rendere più difficile affrontare la giornata. Occuparsi di queste emozioni fa parte del sostegno alla persona, insieme alla cura del disturbo cognitivo.

### 57. news-sonno-cognizione.html, shared/news-wellbeing-content.mjs

Prima: Curare il sonno significa cercare le cause del problema e un percorso adatto alla persona. Non esiste una soluzione unica e dormire meglio non garantisce l’arresto di una malattia neurodegenerativa.

Dopo: Per affrontare un problema di sonno bisogna prima capirne le cause. Dormire meglio può aiutare nella vita quotidiana, ma non significa arrestare una malattia neurodegenerativa.

### 58. news-sonno-cognizione.html, shared/news-wellbeing-content.mjs

Prima: Questo significa adattare la giornata alle possibilità reali, non imporre regole rigide o attribuire la difficoltà alla mancanza di volontà. L’obiettivo è individuare un equilibrio sostenibile, verificando che cosa aiuta e che cosa aumenta la fatica.

Dopo: Nella pratica, si tratta di adattare orari e attività alle possibilità della persona. Osservare quando riposa meglio e quando è più affaticata aiuta a scegliere gli accorgimenti da mantenere.

### 59. news-stimolazione-cognitiva.html, shared/news-wellbeing-content.mjs

Prima: Questa distinzione aiuta a scegliere lo strumento adatto. Leggere insieme, discutere una fotografia e svolgere un esercizio sullo schermo possono avere un posto nel percorso, ma non sono interventi equivalenti.

Dopo: Leggere insieme, parlare di una fotografia e svolgere un esercizio sullo schermo sono attività diverse. La scelta dipende dall’obiettivo concordato con il professionista.

### 60. news-stimolazione-cognitiva.html, shared/news-wellbeing-content.mjs

Prima: Come costruire un percorso sostenibile

Dopo: Come scegliere le attività

### 61. esercizi-memoria.html, shared/public-catalog-content.mjs

Prima: Nel menu dell’esercizio scegli le impostazioni previste e, se stai seguendo un programma, rispetta le indicazioni del professionista.

Dopo: Negli esercizi liberi puoi scegliere le impostazioni dal menu. In un programma assegnato le trovi già predisposte dal professionista.

### 62. esercizi-attenzione.html, shared/public-catalog-content.mjs

Prima: Le prove effettive utilizzano la propria disposizione degli stimoli.

Dopo: Nell’esercizio le lettere possono essere disposte in modo diverso.

### 63. Cancellazione di H.html

Prima: Test Cancellazione Selettiva Clinica Avanzato

Dopo: Cancellazione di H | CogniLab

### 64. Cancellazione di H.html

Prima: Facilitazioni e Vincoli Neuropsicologici:

Dopo: Aiuti e modalità di selezione:

### 65. Cancellazione di H.html

Prima: Griglia Ordinata Rigida

Dopo: Griglia ordinata

### 66. Cancellazione di H.html

Prima: Sparsa / Casuale Libera

Dopo: Disposizione casuale

### 67. Memoria di lavoro avanzato.html

Prima: NeuroTraining Pro - Palestra Cognitiva

Dopo: Memoria di lavoro avanzata | CogniLab

### 68. Memoria di lavoro avanzato.html

Prima: Cognitive Gym v2.4 (HTML)

Dopo: CogniLab · Memoria di lavoro

### 69. Memoria di lavoro avanzato.html

Prima: NeuroTraining Pro

Dopo: Memoria di lavoro avanzata

### 70. Memoria di lavoro avanzato.html

Prima: Esercizio di memoria di lavoro con database dinamico. Memorizza le tappe e risolvi i calcoli personalizzati.

Dopo: Memorizza le tappe del viaggio, svolgi i calcoli e rispondi alle domande su ciò che hai letto.

### 71. Memoria di prosa con distrattori.html

Prima: NeuroBoost v2 - Training Cognitivo

Dopo: Memoria di prosa con distrattori | CogniLab

### 72. Memoria di prosa con distrattori.html

Prima: NeuroBoost v2

Dopo: Memoria di prosa

### 73. Memoria di prosa con distrattori.html

Prima: Inizia la tua sessione quotidiana di potenziamento cognitivo. Ogni volta contenuti diversi.

Dopo: Leggi il racconto, svolgi le attività proposte e rispondi alle domande. I racconti possono cambiare a ogni sessione.

### 74. Memoria di prosa con distrattori.html

Prima: Supporto Metacognitivo

Dopo: Rileggi il racconto

### 75. Memoria di prosa con distrattori.html

Prima: Nuova Sessione Locale

Dopo: Nuova sessione

### 76. Memoria visuospaziale con domande.html

Prima: NeuroTrain - Riabilitazione Neuropsicologica

Dopo: Memoria visuospaziale con domande | CogniLab

### 77. Memoria visuospaziale con domande.html

Prima: NeuroTrain v2.2

Dopo: Memoria visiva con domande

### 78. Memoria visuospaziale con domande.html

Prima: Software Clinico di Stimolazione Cognitiva

Dopo: CogniLab · Memoria visiva

### 79. Memoria visuospaziale con domande.html

Prima: Seleziona il Livello di Carico Cognitivo

Dopo: Scegli la difficoltà

### 80. Memoria visuospaziale con domande.html

Prima: Scegli la complessità degli stimoli visivi. L'esercizio allenerà la tua abilità di codifica rapida e la ritenzione spaziale a breve termine.

Dopo: Scegli quanti dettagli osservare e per quanto tempo. Poi rispondi alle domande sull’immagine.

### 81. Memoria visuospaziale con domande.html

Prima: basandoti sulla tua traccia mnemonica

Dopo: ricordando ciò che hai osservato

### 82. Memoria visuospaziale con domande.html

Prima: Profilo di Risposta Clinico

Dopo: Risultati della prova

### 83. Memoria visuospaziale con domande.html

Prima: Resoconto dettagliato del tasso di accuratezza e dei domini cognitivi stimolati.

Dopo: Qui trovi le risposte date e le percentuali di risposte corrette nelle diverse parti della prova.

### 84. Memoria visuospaziale con domande.html

Prima: Analisi dei Domini Cognitivi

Dopo: Risultati per tipo di domanda

### 85. Memoria visuospaziale con domande.html

Prima: Sviluppato secondo i protocolli neuropsicologici clinici standardizzati di valutazione ed enhancement cognitivo.

Dopo: Esercizio di allenamento: i risultati descrivono la prova e non costituiscono una valutazione neuropsicologica.

### 86. Memoria visuospaziale con numeri.html

Prima: Stato cognitivo stimato:

Dopo: Esito della prova:

### 87. Memoria visuospaziale con numeri.html

Prima: Dispositivo Medico non diagnostico • Focalizzato sulla stimolazione della memoria visuo-spaziale attiva.

Dopo: CogniLab · Esercizio di memoria visuospaziale. Non è un test diagnostico.

### 88. Memoria visuospaziale con numeri.html

Prima: La <strong>memoria di lavoro visuo-spaziale</strong> è una componente cruciale del nostro sistema cognitivo che ci permette di trattenere temporaneamente e manipolare informazioni spaziali (la posizione di oggetti o elementi nello spazio).

Dopo: La <strong>memoria di lavoro visuospaziale</strong> permette di tenere a mente e usare per breve tempo informazioni sulle posizioni degli oggetti.

### 89. Memoria visuospaziale rotante.html

Prima: Nuovo Test d'Efficienza Cognitiva

Dopo: Nuova prova

### 90. Memoria visuospaziale rotante.html

Prima: MENTAL BENDER

Dopo: LIVELLO AVANZATO

### 91. Memoria visuospaziale rotante.html

Prima: Valutazione Clinico-Cognitiva

Dopo: Commento alla prova

### 92. Memoria visuospaziale rotante.html

Prima: Un esercizio avanzato di memoria di lavoro spaziale progettato per stimolare i lobi parietali, responsabili dell'elaborazione spaziale 3D e della flessibilità cognitiva.

Dopo: Memorizza le caselle illuminate e ritrovale dopo la rotazione o il ribaltamento della griglia.

### 93. Memoria visuospaziale rotante.html

Prima: Benvenuto nel protocollo di potenziamento della memoria di lavoro spaziale. Ecco gli step per completare con successo ciascun round:

Dopo: Ogni prova si svolge in quattro passaggi:

### 94. Memoria visuospaziale rotante.html

Prima: Suggerimento Clinico:

Dopo: Suggerimento:

### 95. Il semaforo delle parole.html

Prima: Rehab Suite - Allenamento delle Funzioni Esecutive

Dopo: CogniLab · Attenzione e controllo della risposta

### 96. Il semaforo delle parole.html

Prima: Moduli Clinici di Controllo Motorio e Attenzione

Dopo: Come rispondere

### 97. Il semaforo delle parole.html

Prima: Valutazione Clinica Virtuale

Dopo: Commento ai risultati

### 98. Il semaforo delle parole.html

Prima: Dati di Performance Cognitiva

Dopo: Risultati della sessione

### 99. Il semaforo delle parole.html

Prima: Report di Riabilitazione

Dopo: Riepilogo della prova

### 100. Il semaforo delle parole.html

Prima: La sessione riabilitativa è stata temporaneamente sospesa. Riprendi quando sei pronto per mantenere alto il livello di attenzione.

Dopo: L’esercizio è in pausa. Premi Riprendi sessione quando vuoi continuare.

### 101. Il semaforo delle parole.html

Prima: Fallimenti nell'inibire la risposta al Rosso

Dopo: Risposte date con il semaforo rosso

### 102. Inibizione e memoria di lavoro.html

Prima: Analisi della tua performance cognitiva

Dopo: Risultati di questa sessione

### 103. L'orologio invisibile.html

Prima: Analisi della Performance

Dopo: Risultati della prova

### 104. L'orologio invisibile.html

Prima: Interpretazione Terapeutica del Profilo

Dopo: Commento ai tempi registrati

### 105. L'orologio invisibile.html

Prima: I dati sottostanti offrono un quadro chiaro sulle attitudini di stima temporale del paziente.

Dopo: Qui trovi gli scarti tra il momento richiesto e quello in cui hai premuto STOP.

### 106. Doppio compito e velocità.html

Prima: Test di Multitasking

Dopo: Esercizio di attenzione divisa

### 107. Doppio compito e velocità.html

Prima: Piattaforma di Riabilitazione Cognitiva

Dopo: CogniLab · Esercizi cognitivi

### 108. Doppio compito e velocità.html

Prima: Avvia Sessione di Test

Dopo: Avvia esercizio

### 109. Doppio compito e velocità.html

Prima: Schiaccia Ora

Dopo: Premi ora

### 110. Doppio compito e velocità.html

Prima: Zona di Validazione Esercizio

Dopo: Zona in cui rispondere

### 111. La torre delle lettere.html, Relazioni logiche.html

Prima: Pro Edition

Dopo: CogniLab

### 112. Catena di parole.html

Prima: Sfida Max

Dopo: Livello avanzato

### 113. Catena di parole.html

Prima: Concetti complessi e accostamenti semantici profondi.

Dopo: Associazioni meno immediate tra le parole.

### 114. Catena di parole.html

Prima: Collegamenti stimolanti che richiedono maggiore riflessione.

Dopo: Associazioni che richiedono di confrontare più alternative.

### 115. Catena di parole.html

Prima: Associazioni immediate e intuitive, perfetto per iniziare.

Dopo: Associazioni tra parole di uso comune.

### 116. Catena di parole.html

Prima: Riepilogo delle tue performance

Dopo: Riepilogo dei risultati

### 117. Conta i numeri e le lettere.html

Prima: Visual Memory Trainer Pro

Dopo: Conta numeri e lettere | CogniLab

### 118. Conta i numeri e le lettere.html

Prima: Testa la tua memoria e percezione visiva.

Dopo: Osserva i caratteri e conta quanti numeri e quante lettere compaiono.

### 119. Il cifrario.html

Prima: Report delle Performance Cognitive

Dopo: Risultati della sessione

### 120. Il cifrario.html

Prima: Grafico della Velocità di Scarica (Rendimento Attentivo / Tempo)

Dopo: Velocità delle risposte durante la sessione

### 121. Il cifrario.html

Prima: Velocità di scarica

Dopo: Velocità delle risposte

### 122. Il cifrario.html

Prima: Analisi Funzionale Attentiva

Dopo: Commento ai risultati

### 123. Il cifrario.html

Prima: per allenare la scarica visuo-motoria

Dopo: seguendo la legenda

### 124. Il cifrario.html

Prima: *L'asse temporale mostra l'andamento della sessione. Eventuali cali o flessioni della linea indicano momenti di affaticamento dell'attenzione sostenuta.

Dopo: Il grafico mostra come cambia la velocità durante la prova. Le variazioni, da sole, non permettono di stabilire se ci sia affaticamento.

### 125. Il cifrario.html

Prima: Training cognitivo clinico basato sul principio del Digit Symbol Substitution Test

Dopo: Esercizio di associazione tra simboli e numeri. Non è un test diagnostico

### 126. Rispondi il contrario.html

Prima: Mente d'Acciaio!

Dopo: Hai completato le 15 risposte!

### 127. Rispondi il contrario.html

Prima: Ottimo controllo dell'inibizione. Hai completato tutti i quesiti senza cedere all'istinto.

Dopo: Hai risposto a tutte le domande seguendo la regola del contrario.

### 128. Rispondi il contrario.html

Prima: Se rispondi Azzurro, l'impulso ha vinto e hai perso!

Dopo: In questo gioco Azzurro è la risposta da evitare.

### 129. Rispondi al contrario e ricorda la parola.html

Prima: Un test clinico di inibizione e memoria di lavoro.

Dopo: Un esercizio che combina due compiti.

### 130. Rispondi al contrario e ricorda la parola.html

Prima: Inibisci la verità automatica.

Dopo: Scegli il contrario della risposta vera.

### 131. Rispondi al contrario e ricorda la parola.html

Prima: Leggendario!

Dopo: Risposte registrate

### 132. Rispondi al contrario e ricorda la parola.html

Prima: Neuro-Report Finale

Dopo: Riepilogo finale

### 133. Rispondi al contrario e ricorda la parola.html

Prima: Cronologia Performance

Dopo: Risultati delle prove

### 134. Rispondi al contrario e ricorda la parola.html

Prima: Protocol: NEURO-FLOW-V3

Dopo: CogniLab · Risposte e memoria

### 135. Rispondi al contrario e ricorda la parola.html

Prima: Sync Active

Dopo: Salvataggio dei risultati

### 136. N back.html

Prima: Ottimi progressi oggi!

Dopo: Ecco i risultati di questa sessione.

### 137. Stroop.html

Prima: Ottima capacità di concentrazione!

Dopo: Ecco le risposte registrate durante la prova.

### 138. Riconoscimento visivo base.html

Prima: Ottimo lavoro di stimolazione.

Dopo: La prova è terminata. Puoi consultare le risposte qui sotto.

### 139. Silhoutte.html

Prima: Ottimo allenamento visivo.

Dopo: Ecco i risultati della prova.

### 140. Trova l'intruso.html

Prima: NEW RECORD!

Dopo: Record personale

### 141. Intruso semantico.html

Prima: Database Espanso v3.0

Dopo: Scegli la parola che non appartiene al gruppo

### 142. riepilogo.html

Prima: Ti aspettiamo domani per una nuova sessione.

Dopo: Segui il calendario concordato con il tuo professionista.

### 143. esercizi.html

Prima: Allena la capacità di spostare tempestivamente il focus attenzionale tra compiti e stimoli diversi.

Dopo: Collega numeri e lettere nell’ordine indicato, passando da una sequenza all’altra.

### 144. esercizi.html

Prima: Test di sbarramento classico per valutare e potenziare l'attenzione selettiva visiva.

Dopo: Cerca le H tra le altre lettere e selezionale.

### 145. esercizi.html

Prima: Metti alla prova l'attenzione visiva e la rapidità di conteggio di elementi target distribuiti.

Dopo: Osserva le figure e conta i cerchi richiesti.

### 146. esercizi.html

Prima: Esercizio di conteggio simultaneo e monitoraggio per stimolare l'attenzione divisa e sostenuta.

Dopo: Osserva i caratteri e indica quanti numeri e quante lettere hai visto.

### 147. esercizi.html

Prima: Simulazione di dual-task per incrementare la velocità di elaborazione e la gestione delle interferenze.

Dopo: Segui le regole mostrate e rispondi quando lo stimolo entra nella fascia verde.

### 148. esercizi.html

Prima: Sfide ad alto carico cognitivo per potenziare la manipolazione attiva di sequenze complesse.

Dopo: Ricorda le tappe di un viaggio e i loro dettagli mentre svolgi alcuni calcoli.

### 149. esercizi.html

Prima: Esercizio ecologico e contestualizzato per il riposizionamento di elementi in un ambiente grafico.

Dopo: Guarda le caselle illuminate e ripeti il percorso nell’ordine richiesto.

### 150. esercizi.html

Prima: Inversione logica immediata associata alla ritenzione a lungo termine di uno stimolo attivo.

Dopo: Rispondi al contrario della risposta vera e ricorda l’ultima parola di ogni frase.

### 151. esercizi.html

Prima: Associazione di simboli e lettere basata su regole rigide per stimolare la velocità di codifica.

Dopo: Usa la legenda per associare ogni figura al numero corrispondente.

### 152. esercizi.html

Prima: Classificazione automatica e controllo seriale alfabetico applicato a stringhe lessicali.

Dopo: Ricorda le parole e rimettile in ordine alfabetico.

### 153. esercizi.html

Prima: Allena l'esplorazione emicampale e contrasta i fenomeni di disattenzione spaziale unilaterale.

Dopo: Cerca il bersaglio nelle diverse posizioni dello schermo e selezionalo.

### 154. esercizi.html

Prima: Identificazione di oggetti e forme note per stimolare la via visiva ventrale.

Dopo: Osserva il modello e scegli la forma, il colore o l’oggetto corrispondente.

### 155. esercizi.html

Prima: Identificazione di dettagli micro-strutturali occultati o sovrapposti.

Dopo: Osserva e ricorda gli stimoli visivi prima di rispondere.

### 156. esercizi.html

Prima: Identificazione dell'oggetto corrispondente partendo esclusivamente dal suo contorno.

Dopo: Riconosci l’oggetto dalla sua sagoma.

### 157. esercizi.html

Prima: Confronto simultaneo tra target e distruttori per affinare la precisione geometrica.

Dopo: Ascolta la parola e seleziona l’immagine corrispondente.

### 158. esercizi.html

Prima: Quesiti interattivi di ancoraggio alla realtà quotidiana per datazione e coordinate.

Dopo: Completa la data e lavora sull’ordine di mesi e stagioni.

### 159. shared/public-catalog-content.mjs

Prima: Orientamento temporale e spaziale

Dopo: Orientamento temporale

### 160. shared/public-catalog-content.mjs

Prima: Esercizi di orientamento temporale e spaziale

Dopo: Esercizi di orientamento temporale

### 161. shared/public-catalog-content.mjs

Prima: Data, luogo, mesi e stagioni forniscono riferimenti per descrivere il momento e il contesto in cui ci troviamo.

Dopo: Data, mesi e stagioni ci aiutano a orientarci nel tempo.

### 162. shared/public-catalog-content.mjs

Prima: La prima parte riguarda i riferimenti del giorno e del luogo indicato per la sessione.

Dopo: La prima parte chiede di completare la data di riferimento.

### 163. shared/public-catalog-content.mjs

Prima: All’avvio conferma il luogo della sessione e leggi il riferimento richiesto da ciascun riquadro.

Dopo: Leggi la data di riferimento e completa i riquadri richiesti.

### 164. shared/public-catalog-content.mjs

Prima: secondo il calendario meteorologico usato dall’esercizio

Dopo: usando il 21 marzo, giugno, settembre e dicembre come inizio delle stagioni: una convenzione scelta per l’esercizio

### 165. shared/public-catalog-content.mjs

Prima: Conferma il luogo e controlla se la consegna richiede un ordine diretto, inverso o a salti.

Dopo: Controlla se la consegna richiede un ordine diretto, inverso o a salti.

### 166. Il cifrario.html

Prima: Filtro attentivo debole. Consigliamo di riprovare riducendo al minimo le distrazioni e memorizzando preliminarmente gli accoppiamenti numerici della legenda.

Dopo: In questa prova non è stata completata una sequenza. Prima di riprovare, controlla con calma le associazioni nella legenda.

### 167. Il cifrario.html

Prima: Velocità di elaborazione e scarica motoria eccezionale. Dimostra una notevole fluidità nei processi di scansione percettiva visiva.

Dopo: Hai completato le sequenze in tempi brevi per questa impostazione del gioco.

### 168. Il cifrario.html

Prima: Velocità esecutiva nei range medi di attenzione focalizzata normotipica.

Dopo: Il tempo medio per sequenza è riportato nel riepilogo. Confrontalo con prove svolte con le stesse impostazioni.

### 169. Il cifrario.html

Prima: I tempi di reazione indicano una latenza nell'elaborazione visuo-spaziale delle icone geometriche o nel recupero della mappa cifrata.

Dopo: In questa prova le sequenze hanno richiesto più tempo. Puoi consultare il tempo medio nel riepilogo.

### 170. Il cifrario.html

Prima: L'accuratezza rasenta l'eccellenza: hai mantenuto un controllo inibitorio eccellente sopprimendo gli impulsi di errore prassico anche sotto sforzo temporale.

Dopo: Quasi tutte le selezioni sono corrette.

### 171. Il cifrario.html

Prima: L'accuratezza è moderata, indicando transitori deficit attentivi superati grazie ad un'adeguata autocorrezione.

Dopo: La maggior parte delle selezioni è corretta; nel riepilogo trovi anche gli errori.

### 172. Il cifrario.html

Prima: Si riscontra un pattern impulsivo marcato (Speed-Accuracy Trade-off). Hai privilegiato la velocità esecutiva compromettendo severamente la precisione del codice.

Dopo: Ci sono state diverse selezioni errate. Prima di premere, ricontrolla il numero associato alla figura.

### 173. Il cifrario.html

Prima: Si rileva una flessione sensibile nella seconda parte della sessione. Questo indica una vulnerabilità della tenuta attentiva prolungata (rapido affaticamento corticale prefrontale).

Dopo: Nella seconda parte della prova la velocità delle risposte è diminuita. Il dato, da solo, non ne spiega la causa.

### 174. Il cifrario.html

Prima: La tenuta dell'attenzione risulta perfettamente costante e resiliente, immune al carico temporale e alle distrazioni dello sfondo.

Dopo: La velocità delle risposte è rimasta abbastanza simile nelle due parti della prova.

### 175. Il cifrario.html

Prima: Si evidenzia un forte effetto di riscaldamento cognitivo (warming up): l'efficacia dell'attenzione selettiva e del filtro visivo si è consolidata ed è migliorata con il passare dei secondi.

Dopo: Nella seconda parte della prova la velocità delle risposte è aumentata.

### 176. Il cifrario.html

Prima: L'allenamento a Livello 2 ha stimolato vigorosamente la corteccia prefrontale costringendoti a ignorare gli elementi fluttuanti, a superare l'effetto Stroop di mismatch dei colori e ad aggiornare continuamente la mappa mentale della legenda a ogni sequenza completata.

Dopo: Nel livello 2 la legenda cambia a ogni sequenza: controllala prima di rispondere. Questi dati descrivono il gioco e non sono una valutazione clinica.

### 177. Memoria visuospaziale con numeri.html

Prima: Sessione conclusa. Continua ad allenarti regolarmente per stimolare le connessioni neuronali visuo-spaziali!

Dopo: La sessione è terminata. Qui trovi i risultati delle prove svolte.

### 178. Memoria visuospaziale con numeri.html

Prima: Eccellente (Zenith)

Dopo: Tutte le prove riuscite

### 179. Memoria visuospaziale con numeri.html

Prima: Incredibile! Ottima performance in modalità adattiva. Hai dimostrato una plasticità cerebrale eccezionale!

Dopo: Hai completato correttamente tutte le prove della modalità adattiva.

### 180. Memoria visuospaziale con numeri.html

Prima: Incredibile! Hai dimostrato una memoria visuo-spaziale perfetta e impeccabile. Ottimo potenziale di focus!

Dopo: Hai completato correttamente tutte le prove di questa sessione.

### 181. Memoria visuospaziale con numeri.html

Prima: Eccellente coordinazione visuo-spaziale! Il tuo taccuino cognitivo lavora a pieno regime.

Dopo: Hai completato correttamente almeno 8 prove su 10.

### 182. Memoria visuospaziale con numeri.html

Prima: La tua memoria risponde bene, ma puoi migliorare. Fai una breve pausa e riprova rilassando lo sguardo.

Dopo: Hai completato correttamente almeno 4 prove su 10. Puoi fermarti o riprovare con le indicazioni del professionista.

### 183. Memoria visuospaziale con numeri.html

Prima: Necessita Allenamento

Dopo: Meno di 4 prove riuscite

### 184. Memoria visuospaziale con numeri.html

Prima: Non ti preoccupare, la memoria spaziale risente molto di stanchezza o distrazioni. Riprova con calma!

Dopo: In questa sessione sono riuscite meno di 4 prove su 10. Il risultato riguarda questo esercizio, non una valutazione della memoria.

### 185. Il semaforo delle parole.html

Prima: Performance discreta, ma con alcune incertezze sia di omissione che di selezione. I tempi di reazione indicano una prudenza elevata che ha però rallentato le risposte utili. Si raccomanda un allenamento costante per fluidificare l'attenzione selettiva.

Dopo: Nel riepilogo trovi risposte corrette, selezioni errate e risposte mancate. Puoi confrontarle con il professionista per scegliere le impostazioni della prossima prova.

### 186. Il semaforo delle parole.html

Prima: La sessione rileva una propensione all'impulsività o risposte anticipate automatiche (Falsi allarmi: ${falseAlarms}). Il paziente fatica ad inibire l'input motorio alla comparsa del semaforo rosso. Si raccomanda di ripetere l'esercizio focalizzandosi sulla precisione più che sulla velocità di esecuzione.

Dopo: Hai risposto ${falseAlarms} volte con il semaforo rosso. Alla prossima prova ricorda di aspettare il cambio della parola quando il segnale è rosso.

### 187. Il semaforo delle parole.html

Prima: Buona performance complessiva. L'inibizione della risposta motoria è controllata ed equilibrata. Il paziente ha commesso ${falseAlarms} falsi allarmi, un valore assolutamente accettabile per questo intervallo di tempo. Per le prossime sessioni si consiglia di impostare il livello 'Medio' con shifting dinamico.

Dopo: Hai dato il ${accuracy}% di risposte corrette e ${falseAlarms} risposte con il rosso. Per confrontare i risultati nel tempo, mantieni le stesse impostazioni.

### 188. Il semaforo delle parole.html

Prima: Straordinaria performance! Il livello di accuratezza è superbo (${accuracy}%) ed il controllo inibitorio è intatto (solo ${falseAlarms} Falsi Allarmi). La velocità di processamento delle informazioni è eccellente (${avgRt}ms). Questo indica eccellenti riserve cognitive di autoregolazione prefrontale.

Dopo: Nella prova hai dato il ${accuracy}% di risposte corrette e ${falseAlarms} risposte con il rosso. Il tempo medio sulle risposte corrette con il verde è ${avgRt} ms. Questi dati descrivono questa sessione.

### 189. L'orologio invisibile.html

Prima: La sessione rileva una propensione sistematica al <strong>ritardo</strong> nella stima temporale (${countRitardo} risposte in ritardo su ${total}). Questo ritardo (scarto medio di <strong>${avgAbsError} ms</strong>) può indicare una lieve tendenza all'affaticamento o cali transitori di attenzione sostenuta durante la fase invisibile della traccia. Il tempo interno del soggetto si muove più lentamente di quello reale. Si consiglia di pianificare sessioni di allenamento brevi ma frequenti, mantenendo impostazioni standard o rapide per stimolare la focalizzazione reattiva.

Dopo: Hai premuto STOP in ritardo in <strong>${countRitardo} prove su ${total}</strong>. Lo scarto medio assoluto è <strong>${avgAbsError} ms</strong>. Questi risultati non permettono, da soli, di stabilire la causa delle differenze di tempo.

### 190. L'orologio invisibile.html

Prima: Il paziente mostra una marcata e prevalente tendenza ad <strong>anticipare</strong> la stima del tempo ideale (${countAnticipo} risposte in anticipo su ${total}). Questo tipo di risposta è comunemente associato a una accelerazione dell'orologio interno o a un'impulsività di natura esecutiva (difficoltà di inibizione del comportamento). Si suggerisce di focalizzarsi su respirazioni rallentate prima dell'avvio e, se possibile, utilizzare la modalità Facile per rafforzare la traccia acustica del tempo prima di progredire.

Dopo: Hai premuto STOP in anticipo in <strong>${countAnticipo} prove su ${total}</strong>. Lo scarto medio assoluto è <strong>${avgAbsError} ms</strong>. Alla prossima prova segui il ritmo della lancetta prima che scompaia.

### 191. L'orologio invisibile.html

Prima: Il paziente ha completato la sessione mostrando un eccellente equilibrio temporale complessivo (errore medio di <strong>${avgAbsError} ms</strong>). La distribuzione bilanciata tra anticipazioni (${countAnticipo}) e ritardi (${countRitardo}) indica che non è presente una deviazione cronobiologica strutturale né stati evidenti di impulsività motoria. La capacità di mantenere a mente il ritmo in assenza di indizi visivi riflette ottime capacità di attenzione sostenuta e memoria di lavoro.

Dopo: Le risposte in anticipo (${countAnticipo}) e in ritardo (${countRitardo}) sono distribuite in modo simile. Lo scarto medio assoluto è <strong>${avgAbsError} ms</strong>. Il dato descrive la stima dei tempi in questa prova.

### 192. Memoria visuospaziale rotante.html

Prima: Esercitazione completata con <strong>Basso livello di precisione</strong>. Le operazioni mentali spaziali complesse necessitano di ulteriore pratica e potenziamento. Ripeti regolarmente l'esercizio al livello 'Difficile' per stabilizzare i meccanismi di focalizzazione visiva.

Dopo: Hai selezionato correttamente <strong>meno della metà delle caselle</strong> richieste. Prenditi una pausa se ne senti il bisogno. Il risultato riguarda questo esercizio, non una valutazione clinica.

### 193. Memoria visuospaziale rotante.html

Prima: La tua precisione di memorizzazione è <strong>Moderata</strong>. Mostri una leggera fatica nel calcolare le rotazioni mentali complesse dei pattern visuali. Ti consigliamo di allenarti costantemente per rafforzare le mappe cognitive visuo-spaziali e la memoria di lavoro di transizione.

Dopo: Hai selezionato correttamente dal <strong>50% a meno del 70% delle caselle</strong> richieste. Puoi rivedere con il professionista il livello più adatto per la prossima prova.

### 194. Memoria visuospaziale rotante.html

Prima: La tua efficienza visuo-spaziale è <strong>Buona ed in Linea con i parametri normali</strong>. Mostri un'adeguata stabilità di memorizzazione. Per migliorare ulteriormente la flessibilità, prova a velocizzare i tuoi tempi di elaborazione visuale mantenendo lo schema complessivo a blocchi integrati.

Dopo: Hai selezionato correttamente dal <strong>70% a meno del 90% delle caselle</strong> richieste. Nel grafico trovi i risultati della sessione.

### 195. Memoria visuospaziale rotante.html

Prima: La tua capacità di <strong>Rotazione Mentale</strong> ed efficienza spaziale è <strong>Superiore alla Media</strong>. Mostri eccellenti capacità di codifica della memoria di lavoro visuo-spaziale a livello di memoria di transito temporanea nel lobo parietale superiore. Ottimo controllo cognitivo.

Dopo: Hai selezionato correttamente almeno il <strong>90% delle caselle</strong> richieste. Il riepilogo descrive questa prova, senza un confronto con valori normativi.

### 196. Memoria visuospaziale con numeri.html

Prima: Questa applicazione stimola il <strong>Taccuino Visuo-Spaziale</strong>, facilitando la plasticità neuronale e migliorando la prontezza mentale attraverso un esercizio ludico privo di stress.

Dopo: In questo esercizio osservi dove si trovano i numeri e provi a ritrovarli dopo che sono scomparsi.

### 197. Memoria visuospaziale rotante.html

Prima: Conforme HIPAA & GDPR

Dopo: Esercizio di allenamento, non diagnostico

### 198. Memoria visuospaziale rotante.html

Prima: Clinically Inspired.

Dopo: CogniLab · Memoria visuospaziale.

### 199. Set shifting.html

Prima: Analisi delle Performance

Dopo: Risultati della prova

### 200. Relazioni logiche.html

Prima: Performance Finale

Dopo: Risultati della sessione

### 201. Memoria visuospaziale con numeri.html

Prima: Valutazione della Performance

Dopo: Risultati della prova

### 202. Memoria visuospaziale con numeri.html

Prima: Ottimo lavoro, hai completato tutti i 10 round. Ecco i dettagli della tua performance cognitiva.

Dopo: Hai terminato le 10 prove. Qui trovi i risultati della sessione.

### 203. La torre delle lettere.html

Prima: Ecco il riepilogo delle tue performance

Dopo: Ecco il riepilogo dei risultati

### 204. Il semaforo delle parole.html

Prima: Falsi Allarmi (Impulsività)

Dopo: Risposte con il rosso

### 205. Il semaforo delle parole.html

Prima: Eccellente! Nessun errore impulsivo.

Dopo: Nessuna risposta con il rosso.

### 206. Il semaforo delle parole.html

Prima: Controllo dell'inibizione nella norma.

Dopo: Da 1 a 3 risposte con il rosso.

### 207. Il semaforo delle parole.html

Prima: Propensione all'impulsività motoria.

Dopo: Più di 3 risposte con il rosso.

### 208. L'orologio invisibile.html

Prima: Buona sincronizzazione cerebrale.

Dopo: Confronta il punto di arresto con quello richiesto.

### 209. L'orologio invisibile.html

Prima: Sincronizzazione ed attenzione ottimali.

Dopo: Il punto di arresto è vicino a quello richiesto.

### 210. L'orologio invisibile.html

Prima: Eccellente Precisione!

Dopo: Tempo vicino al bersaglio

### 211. L'orologio invisibile.html

Prima: Errore Significativo

Dopo: Scarto dal tempo richiesto

### 212. L'orologio invisibile.html

Prima: Questo esercizio allena la capacità di stimare lo scorrere del tempo in assenza di stimoli esterni, stimolando la focalizzazione continua e riducendo l'impulsività.

Dopo: Segui il ritmo della lancetta. Quando l’orologio scompare, continua a contare il tempo e premi STOP al momento richiesto.

### 213. Memoria di prosa con distrattori.html

Prima: Prestazione eccezionale! Memoria a lungo termine intatta e assenza di fallimenti di codifica. Massima focalizzazione.

Dopo: Hai risposto correttamente a tutte le domande già prima della rilettura.

### 214. Memoria di prosa con distrattori.html

Prima: Ottima flessibilità cognitiva e capacità di monitoraggio. Il paziente ha sfruttato la rilettura per auto-correggersi efficacemente.

Dopo: Dopo aver riletto il racconto, hai corretto tutte le risposte.

### 215. Memoria di prosa con distrattori.html

Prima: Il paziente dimostra capacità di apprendimento e miglioramento dopo feedback, anche se alcune informazioni rimangono difficili da rievocare.

Dopo: Dopo la rilettura sono aumentate le risposte corrette. Nel riepilogo puoi controllare quali informazioni mancavano.

### 216. Memoria di prosa con distrattori.html

Prima: Sessione completata. Si raccomanda di continuare l'allenamento per supportare la codifica e il recupero mnestico.

Dopo: La sessione è terminata. Confronta le risposte con il racconto e, se serve, chiedi al professionista come proseguire.

### 217. Stroop.html

Prima: Sei un fulmine.

Dopo: Hai risposto in tempi brevi.

### 218. Stroop.html

Prima: Ottima precisione, prova a velocizzarti!

Dopo: Quasi tutte le risposte sono corrette. Nel riepilogo trovi anche il tempo medio.

### 219. Stroop.html

Prima: Continua ad allenarti per migliorare!

Dopo: La prova è terminata. Qui trovi risposte corrette, errori e tempi.

### 220. Stroop.html

Prima: Niente male, prova a rallentare per non sbagliare.

Dopo: Alcune risposte erano errate. Ricorda di seguire il colore dell’inchiostro.

### 221. Relazioni logiche.html

Prima: Genio della Logica 🏆

Dopo: Tutte le risposte corrette

### 222. Relazioni logiche.html

Prima: Mente Analitica 🧠

Dopo: Almeno 8 risposte corrette su 10

### 223. Relazioni logiche.html

Prima: Pensatore Strategico 📈

Dopo: Almeno metà delle risposte corrette

### 224. index.html, scripts/seo/news-pages.mjs

Prima: Nuove letture e approfondimenti aggiornati per prenderti cura della salute cognitiva.

Dopo: Articoli su memoria, vita quotidiana e assistenza, con riferimenti per approfondire.

### 225. news-adl-iadl-autonomia.html, shared/news-content.mjs

Prima: Non conta soltanto se un’attività viene svolta, ma come viene svolta: da soli, con indicazioni, con aiuto o attraverso una sostituzione completa.

Dopo: Per capire quanto una persona è autonoma, osserviamo se svolge le attività da sola, con qualche indicazione o con un aiuto più ampio.

### 226. news-adl-iadl-autonomia.html, shared/news-content.mjs

Prima: I cambiamenti delle capacità richiedono una revisione del sostegno, non un giudizio morale sull’impegno.

Dopo: Se le capacità cambiano, può essere necessario rivedere gli aiuti e le modalità di assistenza.

### 227. Catena di parole.html

Prima: Allenamento Cognitivo

Dopo: Allenamento cognitivo

### 228. Memoria visuospaziale rotante.html

Prima: Allenamento Neurocognitivo Visuo-Spaziale

Dopo: Esercizio di memoria visuospaziale

### 229. Rispondi al contrario e ricorda la parola.html

Prima: NeuroFlow - Training Cognitivo Pro

Dopo: Rispondi al contrario e ricorda | CogniLab

### 230. N back semantico.html

Prima: Sfidando la tua memoria di lavoro

Dopo: Confronta gli stimoli seguendo la regola scelta

### 231. Relazioni logiche.html

Prima: Apprendista

Dopo: Meno della metà delle risposte corrette

### 232. Memoria visuospaziale con domande.html

Prima: Il carico cognitivo imposto ha superato la capacità di ritenzione momentanea. Questo è del tutto normale: la memoria visiva richiede allenamento continuo per ottimizzare le proprie strategie di codifica semantica degli oggetti.

Dopo: Hai risposto correttamente a meno della metà delle domande su questa immagine. Il risultato riguarda la prova svolta; con il professionista puoi valutare quale difficoltà scegliere.

### 233. Memoria visuospaziale con domande.html

Prima: Si evidenzia qualche incertezza nel recupero attivo a breve termine o una vulnerabilità ad elementi distrattori ambientali. Ti consigliamo di ripetere l\'esercizio a difficoltà media rallentando l\'esplorazione oculare in modo sistematico.

Dopo: Hai risposto correttamente ad almeno la metà delle domande su questa immagine. Nel riepilogo puoi rivedere i dettagli che mancavano.

### 234. Memoria visuospaziale con domande.html

Prima: Buon livello di vigilanza ed elaborazione dei dettagli. La memoria di lavoro trattiene le informazioni chiave anche in contesti moderatamente complessi. Continua così per mantenere flessibile ed elastica la tua riserva cognitiva.

Dopo: Hai risposto correttamente ad almeno il 70% delle domande su questa immagine.

### 235. Memoria visuospaziale con domande.html

Prima: Straordinaria capacità di immagazzinamento visuo-spaziale ed eccellente stabilità attentiva. L\'ancoraggio visivo dei dettagli è rapido ed efficace. Le tue funzioni esecutive non mostrano alcuna deflessione visibile.

Dopo: Hai risposto correttamente a tutte le domande su questa immagine.

### 236. Memoria visuospaziale con domande.html

Prima: Prestazione Ottimale (Eccellente)

Dopo: Tutte le risposte corrette

### 237. Memoria visuospaziale con domande.html

Prima: Prestazione Buona (Preservata)

Dopo: Almeno il 70% di risposte corrette

### 238. Memoria visuospaziale con domande.html

Prima: Prestazione Lievemente Deficitaria (Sotto Soglia)

Dopo: Almeno la metà delle risposte corrette

### 239. Memoria visuospaziale con domande.html

Prima: Prestazione Deficitaria (Richiede Allenamento)

Dopo: Meno della metà delle risposte corrette

### 240. Memoria visuospaziale con domande.html

Prima: Classificazione: ${rating}

Dopo: Esito della prova: ${rating}

### 241. Memoria visuospaziale con domande.html

Prima: Valutazione Clinica:

Dopo: Commento alla prova:

### 242. Memoria visuospaziale con numeri.html

Prima: rating = "Ottimo"

Dopo: rating = "Almeno 8 prove riuscite su 10"

### 243. Memoria visuospaziale con numeri.html

Prima: rating = "Buono"

Dopo: rating = "Almeno 6 prove riuscite su 10"

### 244. Memoria visuospaziale con numeri.html

Prima: rating = "Sufficiente"

Dopo: rating = "Almeno 4 prove riuscite su 10"

### 245. Rispondi al contrario e ricorda la parola.html

Prima: Accuracy

Dopo: Risposte corrette

### 246. Rispondi al contrario e ricorda la parola.html

Prima: Max Level

Dopo: Livello raggiunto

### 247. Rispondi al contrario e ricorda la parola.html

Prima: Trials

Dopo: Prove

### 248. Rispondi al contrario e ricorda la parola.html

Prima: START SESSION

Dopo: Inizia la sessione

### 249. Rispondi al contrario e ricorda la parola.html

Prima: Task: Inibizione

Dopo: Regola del contrario

### 250. Rispondi al contrario e ricorda la parola.html

Prima: Working Memory

Dopo: Memoria di lavoro

### 251. scripts/seo/build-public-catalog.mjs

Prima: ${escape(area.intro.split('. ')[0])}.

Dopo: ${escape(area.intro.split('. ')[0].replace(/\.$/,''))}.

### 252. shared/public-catalog-content.mjs

Prima: data, luogo, mesi e stagioni

Dopo: data, mesi e stagioni

### 253. cookie.html, scripts/seo/privacy-content.mjs

Prima: Una guida alle tecnologie utilizzate per leggere le pagine e usare la palestra.

Dopo: Qui trovi quali dati vengono conservati nel browser quando consulti il sito o usi la palestra.

### 254. contatti.html, scripts/seo/public-pages.mjs

Prima: Non inserire dati sanitari o informazioni sui pazienti.

Dopo: Per tutelare la riservatezza, usa questo modulo solo per richieste generali: evita dati sanitari e informazioni sui pazienti.

### 255. Il cifrario.html

Prima: Affaticamento

Dopo: Variazione velocità

### 256. Riordina le lettere.html

Prima: Il Vocabolario Strampalato - Sfida 500 Parole

Dopo: Riordina le lettere | CogniLab

### 257. Riordina le lettere.html

Prima: Sfida 500 Parole

Dopo: Riordina le lettere

### 258. Riordina le lettere.html

Prima: Database validato con successo!

Dopo: Elenco delle parole pronto.

### 259. Inibizione e memoria di lavoro.html

Prima: Inibizione e Memoria - Analisi Performance

Dopo: Inibizione e memoria di lavoro | CogniLab

### 260. Riconoscimento visivo.html

Prima: Mente Attiva PRO - Stimolazione Cognitiva

Dopo: Riconoscimento visivo | CogniLab

### 261. Riordina la frase.html

Prima: Allena la mente ricostruendo la corretta sintassi.

Dopo: Rimetti le parole nell’ordine giusto per formare una frase.

### 262. esercizi.html

Prima: Generazione di parole in sequenza basata sulle sillabe finali per il recupero lessicale.

Dopo: Scegli la parola collegata a quella proposta e continua la sequenza.

### 263. esercizi.html

Prima: Esercizio interattivo basato sul controllo della risposta impulsiva e l'inibizione cognitiva.

Dopo: Con il verde indica se la parola appartiene alla categoria richiesta. Con il rosso aspetta.

### 264. esercizi.html

Prima: Il classico compito di incongruenza colore-parola per testare la suscettibilità alla distrazione.

Dopo: Premi il colore dell’inchiostro, ignorando la parola scritta.

### 265. esercizi.html

Prima: Unisci operazioni aritmetiche mentali alla necessità di mantenere a mente i risultati parziali.

Dopo: Esegui i calcoli a partire dal risultato precedente e ricorda le parole mostrate.

### 266. esercizi.html

Prima: Inibisci le informazioni non rilevanti aggiornando continuamente i contenuti a breve termine.

Dopo: Rispondi in base al peso dell’oggetto, tenendo conto delle eccezioni mostrate.

### 267. esercizi.html

Prima: Ascolto o lettura di brevi racconti logici con inserimento di elementi di disturbo.

Dopo: Leggi un racconto, svolgi le attività di distrazione e rispondi alle domande.

### 268. esercizi.html

Prima: Osservazione di scene strutturate e successivo richiamo di dettagli specifici.

Dopo: Osserva un’immagine e rispondi alle domande sui suoi dettagli.

### 269. esercizi.html

Prima: Memorizzazione della posizione spaziale di cifre numeriche crescenti.

Dopo: Ricorda le posizioni dei numeri e selezionale dal più piccolo al più grande.

### 270. esercizi.html

Prima: Variante avanzata che richiede la categorizzazione logica dello stimolo precedente.

Dopo: Confronta le parole o le loro categorie con quelle mostrate uno o due passaggi prima.

### 271. esercizi.html

Prima: Risoluzione di sillogismi e matrici per allenare il pensiero fluido e il problem solving.

Dopo: Scegli l’alternativa che completa la relazione proposta.

### 272. esercizi.html

Prima: Inibizione della risposta automatica predominante a favore di un criterio logico opposto.

Dopo: Leggi la domanda e scegli l’alternativa opposta alla risposta vera.

### 273. esercizi.html

Prima: Esercizio mirato ad allenare la flessibilità passando repentinamente da una regola all'altra.

Dopo: Cambia criterio di risposta seguendo il colore dello sfondo.

### 274. esercizi.html

Prima: Analisi visiva o concettuale per individuare l'elemento discordante in un set omogeneo.

Dopo: Trova nella griglia il simbolo diverso dagli altri.

### 275. esercizi.html

Prima: Trova la parola non legata da vincoli di significato all'interno di un campo semantico.

Dopo: Scegli la parola che non appartiene allo stesso gruppo delle altre.

### 276. esercizi.html

Prima: Esercizio di anagrammi e composizione lessicale da grafemi disposti in verticale.

Dopo: Sposta le lettere per ricostruire la parola richiesta.

### 277. esercizi.html

Prima: Ricostruzione della corretta sintassi di una frase i cui costituenti sono rimescolati.

Dopo: Rimetti in ordine le parole per formare una frase.

### 278. esercizi.html

Prima: Riordina un set di lettere confuse per scoprire la parola nascosta.

Dopo: Riordina le lettere per ricostruire la parola.

### 279. esercizi.html

Prima: Memorizza elementi geometrici complessi che subiscono rotazioni mentali.

Dopo: Ricorda le caselle illuminate e ritrovale dopo la rotazione della griglia.

### 280. esercizi.html

Prima: Calcolo e stima del tempo basati sulla posizione delle lancette mentali in quadranti vuoti.

Dopo: Segui il ritmo della lancetta e premi STOP quando pensi che i giri richiesti siano terminati.

### 281. N back.html

Prima: Eco-Sequenza - Neuro-Training

Dopo: N-back | CogniLab

### 282. Silhoutte.html

Prima: Riconoscimento Silhouette Pro

Dopo: Silhouette | CogniLab

### 283. shared/care-presets.js

Prima: cells da ricordare

Dopo: caselle da ricordare
