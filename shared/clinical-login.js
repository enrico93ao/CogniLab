import {signInWithEmailAndPassword,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {auth,authReady,friendlyError} from './firebase-client.js';
import {requireProfessional,clinicalMessage} from './clinical-access.js';
const form=document.getElementById('clinical-login'),status=document.getElementById('status');
localStorage.setItem('hub_mode','free_training');localStorage.removeItem('hub_selected_patient_id');
const busy=value=>document.querySelectorAll('button').forEach(button=>button.disabled=value);
form.onsubmit=async event=>{
 event.preventDefault();busy(true);status.textContent='Verifica delle credenziali…';
 try{
  await authReady;
  await signInWithEmailAndPassword(auth,form.elements.email.value.trim(),form.elements.password.value);
  form.elements.password.value='';
  const user=await requireProfessional();
  localStorage.setItem('hub_mode','clinical');localStorage.setItem('hub_username',user.displayName||'Professionista');
  location.href='esercizi.html';
 }catch(error){status.textContent=error.code?.startsWith('clinical-')?clinicalMessage(error):friendlyError(error);}finally{busy(false);}
};
document.getElementById('reset').onclick=async()=>{const email=form.elements.email.value.trim();if(!email){status.textContent='Inserisci la tua email professionale.';return;}busy(true);try{await sendPasswordResetEmail(auth,email);status.textContent='Se l’account esiste, riceverai le istruzioni per reimpostare la password.';}catch(error){status.textContent=friendlyError(error);}finally{busy(false);}};
