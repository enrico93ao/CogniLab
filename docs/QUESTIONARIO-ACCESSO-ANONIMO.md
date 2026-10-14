# Questionario: auth/admin-restricted-operation

Il codice indica un blocco amministrativo dell'operazione di creazione utente in Firebase Authentication / Identity Platform. Il questionario usa una seconda app Firebase con un'identità temporanea: il provider deve consentire l'accesso anonimo e il progetto deve consentire la creazione di utenti dal client.

1. Apri la console Google Cloud e seleziona il progetto hub-di-stimolazione-cognitiva.
2. Cerca Identity Platform con la ricerca della console e apri Settings / Impostazioni.
3. Cerca User actions / Azioni degli utenti, quindi l'opzione di creazione degli utenti (Enable create / Consenti creazione). Se è disattivata, abilitala e salva. Non è necessario abilitare la cancellazione degli account.
4. In Firebase → Authentication → Sign-in method, verifica che Anonymous sia abilitato.
5. Ricarica CogniLab e riprova il questionario con l'opzione anonima selezionata.

L'abilitazione della registrazione non assegna il ruolo professionale: il client non può scrivere cognilab/professionals e l'accesso clinico continua a richiedere approvazione amministrativa, a condizione che siano pubblicate le regole fornite.

Se la console non consente di cambiare questa impostazione o non espone Identity Platform, chiedi all'assistenza Firebase di verificare il blocco alla creazione degli utenti anonimi citando il codice auth/admin-restricted-operation. Non attivare un upgrade o un piano a pagamento solo per seguire queste istruzioni.

Non risolvere aprendo la lettura o la scrittura pubblica del database. Il blocco si verifica prima del salvataggio, durante la richiesta di accesso anonimo.

Fonte: https://docs.cloud.google.com/identity-platform/docs/concepts-manage-users#user_self-service
