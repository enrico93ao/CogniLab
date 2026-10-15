import {withAccessTimeout} from './access-timeout.js';
import {signInWithEmailAndPassword,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {auth,authReady,friendlyError,accessModeReady} from './firebase-client.js';
import {requireGymAccess,invitationMessage} from './gym-access.js';
const form=document.getElementById('invitation-login'),status=document.getElementById('status');
const codeBox=document.createElement('p');codeBox.style.cssText='overflow-wrap:anywhere;user-select:all';codeBox.hidden=true;status.after(codeBox);
const busy=value=>document.querySelectorAll('button').forEach(button=>button.disabled=value);
accessModeReady.then(open=>{if(open)document.getElementById('access-copy').textContent='Accedi al tuo account per ritrovare sessioni e progressi.';});
form.onsubmit=async event=>{
 event.preventDefault();busy(true);codeBox.hidden=true;status.textContent='Verifica dell’accesso…';
 try{
  await withAccessTimeout(authReady,'access-ready-timeout');
  status.textContent='Verifica della password…';
  const credential=await withAccessTimeout(signInWithEmailAndPassword(auth,form.elements.email.value.trim(),form.elements.password.value),'access-login-timeout');
  form.elements.password.value='';
  status.textContent='Password verificata. Controllo dell’abilitazione…';
  await requireGymAccess();
  localStorage.setItem('hub_mode','free_training');localStorage.removeItem('hub_selected_patient_id');
  localStorage.setItem('hub_username',credential.user.displayName||'Utente');
  location.href='esercizi.html';
 }catch(error){status.textContent=error.code?.startsWith('invitation-')?invitationMessage(error):friendlyError(error);if(error.code?.startsWith('invitation-')&&auth.currentUser&&!auth.currentUser.isAnonymous){codeBox.textContent='Codice da comunicare al gestore per abilitare questo account: '+auth.currentUser.uid;codeBox.hidden=false;}}finally{busy(false);}
};
document.getElementById('reset').onclick=async()=>{const email=form.elements.email.value.trim();if(!email){status.textContent='Inserisci prima la tua email.';return;}busy(true);try{await withAccessTimeout(sendPasswordResetEmail(auth,email),'access-reset-timeout');status.textContent='Se l’account esiste, riceverai le istruzioni per reimpostare la password.';}catch(error){status.textContent=friendlyError(error);}finally{busy(false);}};
