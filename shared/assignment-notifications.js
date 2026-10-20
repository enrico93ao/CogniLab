import {auth} from './firebase-client.js';
export function notificationFailure(error){
 const code=error?.code||error?.message||'notification-failed';
 const messages={
  'patient-email-missing':'Email del paziente non disponibile. Il paziente deve accedere al proprio account per sincronizzarla.',
  'daily-quota':'Quota giornaliera delle email esaurita. Il programma è disponibile; riprova la notifica domani.',
  'busy-retry':'Servizio email occupato. Puoi verificare nuovamente la notifica tra poco.',
  'delivery-uncertain':'Il servizio non può confermare l’invio. Controlla la posta inviata del mittente prima di intervenire: il reinvio automatico è bloccato per evitare duplicati.',
  'send-failed':'Il servizio non ha confermato l’invio. Controlla la posta inviata del mittente prima di intervenire.',
  'professional-required':'Notifica non autorizzata: verifica l’accesso come professionista.',
  'program-not-authorized':'Notifica non autorizzata: verifica che il programma sia ancora attivo e assegnato da te.',
  'link-required':'Collegamento con il paziente non attivo. Il programma resta salvato.',
  'login-required':'Accedi nuovamente come professionista per inviare la notifica.',
  'account-changed':'Account cambiato: notifica interrotta. Verifica lo stato con il professionista che ha assegnato il programma.'
 };
 const uncertain=error?.notificationUncertain||['delivery-uncertain','send-failed'].includes(code);
 return {state:uncertain?'uncertain':'failed',code:typeof code==='string'?code.slice(0,80):'notification-failed',message:messages[code]||(uncertain?'Conferma email non disponibile. Il programma è salvato. Verifica lo stato prima di tentare nuovamente: l’email potrebbe essere già stata inviata.':'Notifica non inviata. Il programma è salvato e disponibile al paziente; puoi riprovare la notifica.')};
}
export async function notifyAssignment(patientUid,programId,expectedUid){
 const user=auth.currentUser;
 const config=await fetch('data/notification-config.json',{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error('notification-config');return r.json();});
 if(!config.endpoint)return {state:'not-configured',message:'Programma salvato. Email non inviata: servizio di notifica da configurare.'};
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.endpoint))throw Error('Endpoint email non valido.');
 if(!user)throw Object.assign(Error('login-required'),{code:'login-required'});
 if((expectedUid&&user.uid!==expectedUid)||auth.currentUser?.uid!==user.uid)throw Object.assign(Error('account-changed'),{code:'account-changed'});
 const idToken=await user.getIdToken();
 if(auth.currentUser?.uid!==user.uid)throw Object.assign(Error('account-changed'),{code:'account-changed'});
 let result;
 try{
  const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({idToken,patientUid,programId}),signal:AbortSignal.timeout(25000)});
  if(response.ok===false)throw Error('notification-response');
  result=await response.json();
 }catch(error){throw Object.assign(Error('notification-confirmation-missing'),{code:'notification-confirmation-missing',notificationUncertain:true,cause:error});}
 if(!result?.ok)throw Object.assign(Error(result?.code||'notification-failed'),{code:result?.code||'notification-failed'});
 if(!['sent','already-sent'].includes(result.state))throw Object.assign(Error('notification-confirmation-missing'),{notificationUncertain:true});
 return {state:'sent',alreadySent:result.state==='already-sent',message:result.state==='already-sent'?'Il servizio conferma che questa notifica è già stata inviata. Non è stato eseguito un nuovo invio.':'Il servizio ha confermato l’invio dell’email. Questo non conferma la consegna o la lettura da parte del paziente.'};
}
