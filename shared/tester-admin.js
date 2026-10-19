import {initializeApp,deleteApp} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import {initializeAuth,inMemoryPersistence,createUserWithEmailAndPassword,sendEmailVerification,deleteUser,signOut} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {ref,get,set} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,db,firebaseConfig,friendlyError} from './firebase-client.js';
import {requireProfessional} from './clinical-access.js';
const ownerUid='eWoQhl1qwqVKRupDabTM6vfMyyI3';
const status=document.getElementById('status'),management=document.getElementById('management');
const busy=value=>management.querySelectorAll('button').forEach(button=>button.disabled=value);
async function requireManager(){const user=await requireProfessional();if(user.uid!==ownerUid)throw Object.assign(Error('Solo il gestore può abilitare i tester.'),{code:'manager-required'});return user;}
const permissionError=error=>String(error?.code||error?.message).toLowerCase().includes('permission');
function message(error){
 if(permissionError(error))return 'Le regole Firebase non consentono ancora la gestione dei tester. Pubblica il file di regole aggiornato in Realtime Database → Rules, poi riprova.';
 if(error.code==='manager-required')return 'Questo account non corrisponde al super user abilitato. Account attuale: '+(auth.currentUser?.email||'email non disponibile')+'. Codice account: '+(auth.currentUser?.uid||'nessuno')+'. Accedi con l’account del gestore; se il problema persiste comunica questo codice al gestore.';
 if(error.code==='auth/email-already-in-use')return 'Questa email ha già un account. Usa “Account già creato”: il tester trova il suo codice provando ad accedere alla palestra.';
 if(error.code==='auth/admin-restricted-operation')return 'Firebase non consente di creare account dal sito. Crea l’utente in Authentication e abilitalo qui con il suo UID.';
 return friendlyError(error);
}
async function setAccess(uid,enabled){await requireManager();if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw Error('Codice tester non valido');await set(ref(db,'cognilab/testers/'+uid),enabled);}
try{await requireManager();management.hidden=false;document.getElementById('permission').textContent='Accesso super user verificato: '+(auth.currentUser?.email||'Enrico')+'.';status.textContent='Pronto. Per il primo utilizzo pubblica le regole Firebase aggiornate.';}catch(error){document.getElementById('permission').textContent='Accesso riservato al gestore.';status.textContent=message(error);}
document.getElementById('create-tester').onsubmit=async event=>{
 event.preventDefault();busy(true);status.textContent='Creazione dell’accesso…';let secondary,secondaryAuth,created,enabled=false;
 const form=event.currentTarget;
 try{
  await requireManager();
  // Probe admin read permission before creating an Authentication account.
  await get(ref(db,'cognilab/testers'));
  secondary=initializeApp(firebaseConfig,'tester-provision-'+crypto.randomUUID());
  secondaryAuth=initializeAuth(secondary,{persistence:inMemoryPersistence});
  created=(await createUserWithEmailAndPassword(secondaryAuth,form.elements.email.value.trim(),form.elements.password.value)).user;
  await setAccess(created.uid,true);enabled=true;
  document.querySelector('#enable-tester input').value=created.uid;
  let emailMessage;
  try{await sendEmailVerification(created,{url:'https://enrico93ao.github.io/CogniLab/esercizi.html',handleCodeInApp:false});emailMessage=' Richiesto l’invio dell’email di conferma: controllare anche lo spam.';}
  catch(error){emailMessage=' Non è stato possibile richiedere l’email di conferma. Il paziente può riprovare da Il mio account → Reinvia email di conferma. Dettaglio: '+friendlyError(error);}
  status.textContent='Account paziente creato e abilitato. Può accedere alla palestra con email e password assegnate. Il tuo accesso professionale resta attivo.'+emailMessage;
 }catch(error){
  status.textContent=message(error);
  if(created&&!enabled){try{await deleteUser(created);}catch{status.textContent+=' L’account è stato creato ma non abilitato. Per recuperarlo usa il codice: '+created.uid;}}
 }finally{
  form.elements.password.value='';
  if(secondaryAuth)await signOut(secondaryAuth).catch(()=>{});
  if(secondary)await deleteApp(secondary).catch(()=>{});
  busy(false);
 }
};
async function changeAccess(enabled){busy(true);try{const uid=document.querySelector('#enable-tester input').value.trim();await setAccess(uid,enabled);status.textContent=enabled?'Account abilitato: il tester può riprovare ad accedere.':'Abilitazione tester revocata. Gli account professionali mantengono il proprio accesso.';}catch(error){status.textContent=message(error);}finally{busy(false);}}
document.getElementById('enable-tester').onsubmit=event=>{event.preventDefault();changeAccess(true);};
document.getElementById('revoke').onclick=()=>changeAccess(false);
