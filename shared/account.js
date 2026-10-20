import {mountAccountData} from './account-data-ui.js?v=data32';
import {requireGymAccess,invitationMessage} from './gym-access.js';
import {disconnectPresence} from './presence.js';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,updateProfile,onAuthStateChanged,EmailAuthProvider,linkWithCredential,sendEmailVerification} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {auth,authReady,friendlyError,accessModeReady} from './firebase-client.js';
import {retryPending,pendingSummary,clearSyncedLocalData} from './progress-store.js';
const registrationOpen=await accessModeReady;
const HOME_URL='https://enrico93ao.github.io/CogniLab/esercizi.html';
const button=document.createElement('button');button.className='btn';button.textContent=registrationOpen?'Accedi / Registrati':'Accedi';
const host=document.querySelector('.nav-right-cluster')||document.querySelector('.welcome-container');host?.append(button);
const dialog=document.createElement('dialog');dialog.className='cl-account';
dialog.innerHTML='<form id="cl-account-form"><h2>Il tuo spazio CogniLab</h2><p>Accedi per ritrovare sessioni e progressi anche su un altro dispositivo.</p><label>Nome<input name="name" autocomplete="name" maxlength="80"></label><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Password<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><p id="cl-account-status" role="status" aria-live="polite"></p><div class="cl-account-actions"><button class="btn" type="submit" name="action" value="login">Accedi</button><button class="btn" type="submit" name="action" value="register">Crea account</button><button type="button" id="cl-reset-password">Password dimenticata</button><button type="button" id="cl-close-account">Chiudi</button></div></form><div id="cl-signed-account" hidden><h2>Il tuo account</h2><p id="cl-account-name"></p><p id="cl-email-status" role="status"></p><button id="cl-resend-verification" class="btn">Reinvia email di conferma</button><p id="cl-logout-status" role="status" aria-live="polite"></p><button id="cl-logout" class="btn">Esci dall’account</button><button id="cl-logout-local" class="btn" hidden>Esci lasciando i risultati su questo dispositivo</button><button id="cl-close-signed">Chiudi</button></div>';
document.body.append(dialog);
const dataControls=mountAccountData(document.getElementById('cl-signed-account'));
let dataAccountUid;
button.onclick=()=>dialog.showModal();window.CogniLabOpenAccount=()=>dialog.showModal();
const form=dialog.querySelector('form'),status=document.getElementById('cl-account-status');
form.querySelector('[value="register"]').hidden=!registrationOpen;
if(!registrationOpen)form.elements.name.closest('label').hidden=true;
window.openUserModal=async()=>{try{const user=await requireGymAccess();localStorage.setItem('hub_mode','free_training');localStorage.removeItem('hub_selected_patient_id');localStorage.setItem('hub_username',user.displayName||'Utente');location.href='esercizi.html';}catch{location.href='accesso.html';}};
if(registrationOpen){const choice=document.querySelector('.choice-card.training');if(choice){choice.querySelector('h2').textContent='Palestra · Accedi';choice.querySelector('p').textContent='Accedi o crea un account per allenarti e conservare i risultati.';choice.onclick=()=>window.openUserModal();}}
const busy=value=>dialog.querySelectorAll('button').forEach(b=>b.disabled=value);
form.addEventListener('submit',async event=>{
 event.preventDefault();busy(true);status.textContent='Accesso in corso…';
 const fields=new FormData(form);
 try{
  await authReady;
  let credential;
  const registering=event.submitter?.value==='register';
  if(registering&&!registrationOpen)throw Object.assign(new Error('Registration closed'),{code:'registration-closed'});
  if(event.submitter?.value==='register'){credential=auth.currentUser?.isAnonymous?await linkWithCredential(auth.currentUser,EmailAuthProvider.credential(fields.get('email').trim(),fields.get('password'))):await createUserWithEmailAndPassword(auth,fields.get('email').trim(),fields.get('password'));const name=fields.get('name').trim();if(name)await updateProfile(credential.user,{displayName:name});}
  else credential=await signInWithEmailAndPassword(auth,fields.get('email').trim(),fields.get('password'));
  await requireGymAccess();
  let emailState='';
  if(registering){
    try{await sendEmailVerification(credential.user,{url:HOME_URL,handleCodeInApp:false});emailState='sent';}
    catch(error){emailState='pending';console.warn('Email confirmation delivery request failed:',error.code||'unknown');}
  }
  form.reset();dialog.close();localStorage.setItem('hub_username',credential.user.displayName||'Utente');localStorage.setItem('hub_mode','free_training');
  location.href=registering?'esercizi.html?welcome='+emailState:'esercizi.html';
 }catch(error){status.textContent=error.code==='registration-closed'?'La registrazione è temporaneamente chiusa.':error.code?.startsWith('invitation-')?invitationMessage(error):friendlyError(error);}finally{busy(false);}
});
document.getElementById('cl-reset-password').onclick=async()=>{const email=form.elements.email.value.trim();if(!email){status.textContent='Inserisci prima la tua email.';return;}busy(true);try{await sendPasswordResetEmail(auth,email);status.textContent='Se l’account esiste, riceverai le istruzioni per reimpostare la password.';}catch(e){status.textContent=friendlyError(e);}finally{busy(false);}};
for(const id of ['cl-close-account','cl-close-signed'])document.getElementById(id).onclick=()=>dialog.close();
async function exitAccount(){
 await disconnectPresence().catch(()=>{});await signOut(auth);dialog.close();
 try{localStorage.setItem('hub_mode','free_training');for(const key of ['hub_selected_patient_id','hub_username','cognilab.lastUser'])localStorage.removeItem(key);}catch{}
 location.href='index.html';
}
document.getElementById('cl-logout-local').onclick=async()=>{
 const uid=auth.currentUser?.uid;if(!uid)return;
 const message=document.getElementById('cl-logout-status');
 if(pendingSummary(uid).memoryOnly){message.textContent='Ci sono risultati solo in memoria: ripristina la connessione prima di uscire.';return;}
 try{await exitAccount();}catch(error){message.textContent=friendlyError(error);}
};
document.getElementById('cl-logout').onclick=async()=>{
 const message=document.getElementById('cl-logout-status'),button=document.getElementById('cl-logout'),localExit=document.getElementById('cl-logout-local');button.disabled=true;localExit.hidden=true;
 try{const uid=auth.currentUser?.uid;if(!uid)return;message.textContent='Verifico il salvataggio dei risultati…';
 await retryPending().catch(()=>{});const waiting=pendingSummary(uid);
 if(waiting.results||waiting.sharing){localExit.hidden=Boolean(waiting.memoryOnly);message.textContent=waiting.memoryOnly?'Ci sono risultati conservati solo in questa pagina. Non chiudere: ripristina la connessione e riprova a uscire.':'Ci sono risultati ancora da sincronizzare. Sono conservati su questo dispositivo. Ripristina la connessione e riprova, oppure scegli di uscire lasciandoli qui. Su un dispositivo condiviso è preferibile attendere la sincronizzazione.';return;}
 clearSyncedLocalData(uid);await exitAccount();
 }catch(e){message.textContent=friendlyError(e);}finally{button.disabled=false;}
};
onAuthStateChanged(auth,user=>{
 if(dataAccountUid!==user?.uid){dataControls.reset();dataAccountUid=user?.uid;}
 const registered=Boolean(user&&!user.isAnonymous);button.textContent=registered?'Il mio account':registrationOpen?'Accedi / Registrati':'Accedi';form.hidden=registered;document.getElementById('cl-signed-account').hidden=!registered;
 document.getElementById('cl-account-name').textContent=user?.displayName||user?.email||'';
 document.getElementById('cl-resend-verification').hidden=!registered||Boolean(user.emailVerified);
 if(user){try{if(localStorage.getItem('cognilab.lastUser')!==user.uid)localStorage.removeItem('hub_selected_patient_id');localStorage.setItem('cognilab.lastUser',user.uid);localStorage.setItem('hub_username',user.displayName||'Utente');}catch{}const display=document.getElementById('user-display');if(display)display.textContent=user.displayName||'Utente';retryPending().catch(()=>{});}
 else{const display=document.getElementById('user-display');if(display)display.textContent='Ospite';}
});
window.addEventListener('online',()=>retryPending().catch(()=>{}));

document.getElementById('cl-resend-verification').onclick=async()=>{
 const user=auth.currentUser;if(!user||user.isAnonymous)return;
 const target=document.getElementById('cl-email-status');const button=document.getElementById('cl-resend-verification');
 button.disabled=true;target.textContent='Invio dell’email in corso…';
 try{await sendEmailVerification(user,{url:HOME_URL,handleCodeInApp:false});target.textContent='Email di conferma richiesta. Controlla anche la cartella spam.';}
 catch(error){target.textContent=friendlyError(error);}finally{button.disabled=false;}
};
const welcome=new URLSearchParams(location.search).get('welcome');
if(welcome==='sent'||welcome==='pending'){
 const message=document.createElement('p');message.className='cl-notice';message.setAttribute('role','status');
 message.textContent=welcome==='sent'?'Benvenuto in CogniLab! Ti abbiamo richiesto l’invio di un’email per confermare l’indirizzo e tornare alla palestra.':'Account creato. Non è stato possibile richiedere l’email di conferma; puoi riprovare da Il mio account.';
 const host=document.querySelector('.container')||document.querySelector('.welcome-container');host?.prepend(message);
}
