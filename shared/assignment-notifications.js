import {auth} from './firebase-client.js';
export async function notifyAssignment(patientUid,programId){
 const config=await fetch('data/notification-config.json',{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error('notification-config');return r.json();});
 if(!config.endpoint)return {state:'not-configured',message:'Programma salvato. Email non inviata: servizio di notifica da configurare.'};
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.endpoint))throw Error('Endpoint email non valido.');
 const idToken=await auth.currentUser.getIdToken();
 const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({idToken,patientUid,programId}),signal:AbortSignal.timeout(25000)});
 const result=await response.json();if(!result.ok)throw Error(result.code||'notification-failed');
 return {state:'sent',message:'Richiesta di invio email accettata dal servizio.'};
}
