import {isPermissionDenied,errorCode} from './firebase-errors.js';
import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import {getAuth,onAuthStateChanged,signInAnonymously} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {getDatabase} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
export const firebaseConfig={apiKey:'AIzaSyBBChH3sFfhwE4waQTzERtKGytJrucYEFM',authDomain:'hub-di-stimolazione-cognitiva.firebaseapp.com',databaseURL:'https://hub-di-stimolazione-cognitiva-default-rtdb.firebaseio.com',projectId:'hub-di-stimolazione-cognitiva',appId:'1:593673504352:web:9d4a194109ec7061e6e505'};
export const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getDatabase(app);
auth.languageCode='it';
export const authReady=new Promise(resolve=>{const stop=onAuthStateChanged(auth,async user=>{stop();if(!user){try{user=(await signInAnonymously(auth)).user;}catch{}}resolve(user);});});
export function friendlyError(error){
 const code=errorCode(error);
 if(isPermissionDenied(error))return 'Il servizio non autorizza questa operazione. Contatta il gestore della palestra.';
 if(code==='auth/network-request-failed'||code==='network-request-failed')return 'Connessione al servizio non riuscita. Controlla la rete e riprova.';
 if(code==='auth/configuration-not-found')return 'Il servizio di accesso non è ancora configurato. Contatta il gestore della palestra.';
 if(code==='guest-feedback-disabled')return 'L’invio senza registrazione non è ancora attivo. Il gestore deve abilitare l’accesso Anonymous in Firebase Authentication.';
 if(code==='privacy-not-configured')return 'Le regole Firebase non isolano ancora gli account. Configurare le regole fornite prima di salvare lo storico personale.';
 if(code.includes('operation-not-allowed'))return 'Il metodo di accesso non è ancora abilitato. Attivare Email/Password in Firebase Authentication.';
 if(code.includes('invalid-credential')||code.includes('invalid-login-credentials')||code.includes('wrong-password')||code.includes('user-not-found'))return 'Email o password non corrette.';
 if(code.includes('email-already-in-use'))return 'Questa email ha già un account. Scegli Accedi o recupera la password.';
 if(code.includes('weak-password'))return 'Scegli una password di almeno 6 caratteri.';
 if(code.includes('invalid-email'))return 'Inserisci un indirizzo email valido.';
 if(code.includes('unauthorized-domain'))return 'Il dominio enrico93ao.github.io deve essere autorizzato in Firebase Authentication.';
 if(code.includes('too-many-requests'))return 'Troppi tentativi. Attendi qualche minuto e riprova.';
 return 'Operazione non completata. Riprova oppure contatta il gestore della palestra.';
}
