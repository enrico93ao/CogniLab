import {get,ref} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,authReady,db} from './firebase-client.js';
export async function requireProfessional(){
 await authReady;
 const user=auth.currentUser;
 if(!user||user.isAnonymous)throw Object.assign(new Error('Professional login required'),{code:'clinical-login-required'});
 const allowed=await get(ref(db,'cognilab/professionals/'+user.uid));
 if(allowed.val()!==true||auth.currentUser?.uid!==user.uid)throw Object.assign(new Error('Professional approval required'),{code:'clinical-not-authorized'});
 return user;
}
export function clinicalMessage(error){
 if(error?.code==='clinical-login-required')return 'Accedi con le credenziali assegnate al tuo account professionale.';
 if(error?.code==='clinical-not-authorized')return 'Questo account non è abilitato all’area clinica. L’abilitazione viene assegnata dal gestore.';
 return 'Impossibile verificare l’abilitazione professionale. Controllare la connessione e le regole Firebase.';
}
