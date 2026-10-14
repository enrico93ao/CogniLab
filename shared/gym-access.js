import {get,ref} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,authReady,db,accessModeReady} from './firebase-client.js';
export async function requireGymAccess(){
 const open=await accessModeReady;await authReady;
 const user=auth.currentUser;
 if(open&&user&&!user.isAnonymous)return user;
 if(!user||user.isAnonymous)throw Object.assign(new Error('Invitation login required'),{code:'invitation-login-required'});
 const checks=await Promise.allSettled(['testers','professionals'].map(role=>get(ref(db,'cognilab/'+role+'/'+user.uid))));
 if(auth.currentUser?.uid!==user.uid||!checks.some(result=>result.status==='fulfilled'&&result.value.val()===true)){
  throw Object.assign(new Error('Invitation required'),{code:'invitation-required'});
 }
 return user;
}
export function invitationMessage(error){
 if(error?.code==='invitation-required')return 'Questo account non è ancora abilitato al test. Contatta il gestore della palestra.';
 if(error?.code==='invitation-login-required')return 'Durante il test puoi entrare solo con un account autorizzato dal gestore.';
 return 'Non è stato possibile verificare l’accesso. Controlla la connessione e riprova.';
}
