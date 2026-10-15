import {withAccessTimeout} from './access-timeout.js';
import {get,ref} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,authReady,db,accessModeReady} from './firebase-client.js';
export async function requireGymAccess(){
 await withAccessTimeout(authReady,'access-ready-timeout');
 const user=auth.currentUser;
 if(!user||user.isAnonymous)throw Object.assign(new Error('Invitation login required'),{code:'invitation-login-required'});
 const denied=()=>Object.assign(new Error('Invitation required'),{code:'invitation-required'});
 const checks=['testers','professionals'].map(role=>withAccessTimeout(get(ref(db,'cognilab/'+role+'/'+user.uid)),'invitation-check-failed').then(snapshot=>{if(snapshot.val()!==true)throw denied();return true;}));
 // One valid role is sufficient; a stalled unrelated read must not block it.
 checks.push(accessModeReady.then(open=>{if(!open)throw denied();return true;}));
 try{await Promise.any(checks);}catch(error){throw Object.assign(new Error('Invitation check failed'),{code:error.errors?.some(e=>e.code!=='invitation-required')?'invitation-check-failed':'invitation-required'});}
 if(auth.currentUser?.uid!==user.uid)throw denied();
 return user;
}
export function invitationMessage(error){
 if(error?.code==='invitation-check-failed')return 'Non è stato possibile leggere l’abilitazione. Il gestore deve controllare le regole Firebase aggiornate o la connessione.';
 if(error?.code==='invitation-required')return 'Questo account non è ancora abilitato al test. Contatta il gestore della palestra.';
 if(error?.code==='invitation-login-required')return 'Durante il test puoi entrare solo con un account autorizzato dal gestore.';
 return 'Non è stato possibile verificare l’accesso. Controlla la connessione e riprova.';
}
