import {notifyAssignment,notificationFailure} from './assignment-notifications.js?v=notify31';
import {get,ref,set,update} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,authReady,db} from './firebase-client.js';
import {requireGymAccess} from './gym-access.js';
import {requireProfessional} from './clinical-access.js';
import {withAccessTimeout} from './access-timeout.js';
import {validateProgram,validUid,programProgress} from './care-model.mjs?v=opposite43';
import {exerciseById} from './exercise-catalog.mjs';
const read=async path=>(await withAccessTimeout(get(ref(db,path)),'care-timeout')).val();
const write=(path,value)=>withAccessTimeout(set(ref(db,path),value),'care-timeout');
const patch=values=>withAccessTimeout(update(ref(db),values),'care-timeout');
export async function currentCareUser(){
 await withAccessTimeout(authReady,'access-ready-timeout');const user=await requireGymAccess();
 // The patient's authenticated email is published only in their private profile.
 if(user.email&&!user.isAnonymous)try{await write(`cognilab/users/${user.uid}/profile/email`,user.email);}catch{/* Old rules must not block access to prescribed sessions. */}
 return user;
}
export function careError(error){
 if(error?.code==='PERMISSION_DENIED'||error?.code==='permission-denied')return 'Il servizio non autorizza questa operazione. Il gestore deve verificare le regole Firebase per programmi e collegamenti.';
 if(error?.code?.includes('timeout'))return 'Il servizio non ha risposto in tempo. I dati già salvati restano disponibili: riprova.';
 return error?.message||'Operazione non completata. Riprova.';
}
export async function invitePatient(patientUid,name){
 const user=await requireProfessional();if(!validUid(patientUid)||patientUid===user.uid)throw Error('Inserisci il codice account di un altro utente registrato.');
 name=String(name||'').trim();if(!name||name.length>80)throw Error('Inserisci il nome o un identificativo del paziente (massimo 80 caratteri).');
 const label=String(user.displayName||user.email||'Professionista CogniLab').slice(0,80);
 const base=`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}`;
 const values={[base+'/name']:name,[base+'/linkedAt']:Date.now(),[`cognilab/careInvites/${patientUid}/${user.uid}`]:{professionalName:label,createdAt:Date.now()}};
 await patch(values);
}
export async function setConnection(professionalUid,accepted){
 const user=await currentCareUser();if(!validUid(professionalUid))throw Error('Codice professionista non valido.');
 await write(`cognilab/careLinks/${user.uid}/${professionalUid}`,accepted?true:null);
}
export async function patientWorkspace(){
 const user=await currentCareUser();
 const [invites,links,programs]=await Promise.all(['careInvites','careLinks','carePrograms'].map(root=>read(`cognilab/${root}/${user.uid}`)));
 const list=await Promise.all(Object.entries(programs||{}).map(async([id,program])=>{
  if(!links?.[program.professionalId])return null;
  return {id,...program,sessions:await read(`cognilab/careSessions/${user.uid}/${id}`)||{}};
 }));
 return {user,invites:invites||{},links:links||{},programs:list.filter(Boolean)};
}
export async function checkCareStorage(){const user=await requireProfessional();await read(`cognilab/careLinks/${user.uid}/${user.uid}`);}
export async function connectManagedPatient(patientUid){
 const user=await requireProfessional();
 if(user.uid!=='eWoQhl1qwqVKRupDabTM6vfMyyI3'||!validUid(patientUid)||patientUid===user.uid)throw Error('Collegamento automatico non autorizzato.');
 const base=`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}`;
 const record=await read(base);if(!record)throw Error('Paziente non presente nel tuo elenco.');
 if(record.managedAccount!==true)throw Error('Conferma prima che questo account è stato creato dal gestore.');
 if(record.autoLinkInitialized===true)return;
 if(await read(`cognilab/testers/${patientUid}`)!==true)throw Error('Account paziente non abilitato.');
 await patch({[`cognilab/careLinks/${patientUid}/${user.uid}`]:true,[base+'/autoLinkInitialized']:true});
}
export async function registerManagedPatient(patientUid){
 const user=await requireProfessional();if(user.uid!=='eWoQhl1qwqVKRupDabTM6vfMyyI3'||!validUid(patientUid)||patientUid===user.uid)throw Error('Operazione riservata al gestore.');
 const base=`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}`;
 if(!await read(base)||await read(`cognilab/testers/${patientUid}`)!==true)throw Error('Seleziona un account paziente già presente e abilitato.');
 await patch({[base+'/managedAccount']:true});await connectManagedPatient(patientUid);
}
export async function professionalPatients(){
 const user=await requireProfessional(),records=await read(`cognilab/users/${user.uid}/clinical/registeredPatients`)||{};
 // Only the account manager can enumerate the testers it provisions.
 if(user.uid==='eWoQhl1qwqVKRupDabTM6vfMyyI3'){
  const testers=await read('cognilab/testers')||{};
  for(const [uid,enabled] of Object.entries(testers))if(enabled===true&&uid!==user.uid){
   if(!records[uid]){const name='Paziente test · '+uid.slice(0,8);await invitePatient(uid,name);records[uid]={name};}
   if(records[uid].managedAccount===true&&records[uid].autoLinkInitialized!==true){await connectManagedPatient(uid);records[uid].autoLinkInitialized=true;}
  }
 }
 return records;
}
export async function professionalPatient(patientUid,record){
 const user=await requireProfessional();if(!validUid(patientUid))throw Error('Codice paziente non valido.');
 const accepted=await read(`cognilab/careLinks/${patientUid}/${user.uid}`)===true;
 if(!accepted)return {accepted:false,programs:[]};
 await recoverPatientEmail(patientUid,record);
 const programs=await Promise.all(Object.keys(record.programs||{}).map(async id=>{
  const program=await read(`cognilab/carePrograms/${patientUid}/${id}`);if(!program||program.professionalId!==user.uid)return null;
  return {id,...program,notification:record.notifications?.[id]||null,sessions:await read(`cognilab/careSessions/${patientUid}/${id}`)||{}};
 }));return {accepted,programs:programs.filter(Boolean)};
}
async function recoverPatientEmail(patientUid,record){
 // Only this exact contact field is shared with an actively linked professional.
 let email;try{email=await read(`cognilab/users/${patientUid}/profile/email`);}catch{}
 if(!email&&/^\S+@\S+\.\S+$/.test(record.name||''))email=record.name;
 if(typeof email==='string'&&email!==record.notificationEmail){await setPatientNotificationEmail(patientUid,email);record.notificationEmail=email;}
 return record.notificationEmail||null;
}
export async function setPatientNotificationEmail(patientUid,email){
 const user=await requireProfessional();email=String(email||'').trim();
 if(!validUid(patientUid)||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||/[\r\n,;]/.test(email))throw Error('Inserisci una email valida per il paziente.');
 const base=`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}`;if(!await read(base))throw Error('Paziente non presente nel tuo elenco.');
 await patch({[base+'/notificationEmail']:email});
}
export async function sendAssignmentNotification(patientUid,id,expectedProfessionalUid){
 const user=await requireProfessional();if(expectedProfessionalUid&&user.uid!==expectedProfessionalUid)throw Error('Account cambiato.');if(!validUid(patientUid)||!validUid(id))throw Error('Paziente o programma non valido.');let result;
 try{const record=await read(`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}`);if(record)await recoverPatientEmail(patientUid,record);result=await notifyAssignment(patientUid,id,user.uid);}catch(error){result=notificationFailure(error);}
 const status={...result,updatedAt:Date.now()};
 if(auth.currentUser?.uid!==user.uid)throw Error('Account cambiato. Aggiorna la pagina.');
 await patch({[`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}/notifications/${id}`]:status});return status;
}
export async function assignProgram(patientUid,input,replacesId=null){
 const user=await requireProfessional(),fields=validateProgram(input);if(!validUid(patientUid))throw Error('Seleziona un paziente.');
 if(await read(`cognilab/careLinks/${patientUid}/${user.uid}`)!==true)throw Error('Il paziente deve prima accettare il collegamento dalla propria dashboard.');
 let previous=null;if(replacesId){if(!validUid(replacesId))throw Error('Programma non valido.');previous=await read(`cognilab/carePrograms/${patientUid}/${replacesId}`);if(!previous||previous.professionalId!==user.uid||previous.status!=='active')throw Error('Il programma è cambiato. Aggiorna l’elenco prima di modificarlo.');}
 const id=crypto.randomUUID(),program={...fields,professionalId:user.uid,professionalName:String(user.displayName||user.email||'Professionista CogniLab').slice(0,80),createdAt:Date.now(),status:'active',version:1};
 const notificationBase=`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}/notifications/${id}`;
 if(auth.currentUser?.uid!==user.uid)throw Error('Account cambiato. Aggiorna la pagina.');
 await patch({...(previous?{[`cognilab/carePrograms/${patientUid}/${replacesId}/status`]:'archived'}:{}),[`cognilab/carePrograms/${patientUid}/${id}`]:program,[`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}/programs/${id}`]:true,[notificationBase]:{state:'pending',message:'Programma salvato. Invio della notifica email in corso; attendi la conferma prima di chiudere la pagina.',updatedAt:Date.now()}});
 // Assignment is confirmed immediately. Email failure cannot undo the saved program.
 sendAssignmentNotification(patientUid,id,user.uid).then(status=>{
  if(typeof window!=='undefined'&&auth.currentUser?.uid===user.uid)window.dispatchEvent(new CustomEvent('cognilab-notification-change',{detail:{patientUid,programId:id,status}}));
 }).catch(()=>{/* The persisted pending state lets the professional verify later. */});
 return id;
}
export async function archiveProgram(patientUid,id){await requireProfessional();if(!validUid(patientUid)||!validUid(id))throw Error('Programma non valido.');await write(`cognilab/carePrograms/${patientUid}/${id}/status`,'archived');}
export async function setPatientArchived(patientUid,archived){
 const user=await requireProfessional();if(!validUid(patientUid)||patientUid===user.uid)throw Error('Paziente non valido.');
 const base=`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}`;
 if(!await read(base))throw Error('Paziente non presente nel tuo elenco.');
 await patch({[base+'/archived']:archived===true});
}
export async function startAssignedProgram(id){
 const user=await currentCareUser();if(!validUid(id))throw Error('Programma non valido.');
 const program=await read(`cognilab/carePrograms/${user.uid}/${id}`);
 if(!program||program.status!=='active')throw Error('Questo programma non è più attivo.');
 if(await read(`cognilab/careLinks/${user.uid}/${program.professionalId}`)!==true)throw Error('Il collegamento al professionista non è attivo.');
 validateProgram(program);
 const sessions=await read(`cognilab/careSessions/${user.uid}/${id}`)||{},progress=programProgress(program,sessions);
 if(!progress.remaining)throw Error('Hai completato tutte le sessioni previste per questo programma.');
 const resume=progress.resume,session={id:resume?.id||crypto.randomUUID(),startedAt:resume?.startedAt||new Date().toISOString(),patientId:null,programId:id,programOwnerId:program.professionalId,programSlot:String(resume?.progress.nextSlot??0),programExercises:Array.from(program.exercises),programConfigurations:program.configurations||[],scheduledDate:program.schedule?.[progress.completed]||null};
 await patch({[`cognilab/careSessions/${user.uid}/${id}/${session.id}/startedAt`]:session.startedAt,...(session.scheduledDate?{[`cognilab/careSessions/${user.uid}/${id}/${session.id}/scheduledDate`]:session.scheduledDate}:{})});
 const completed=resume?.progress.completedSlots||[],skippedSlots=resume?.progress.skippedSlots||[];
 const plan={programId:id,configurations:program.configurations||[],files:program.exercises.map(exerciseId=>exerciseById.get(exerciseId).file),index:Number(session.programSlot),completedSlots:completed,skippedSlots};
 sessionStorage.setItem('cognilab.session.'+user.uid,JSON.stringify(session));sessionStorage.setItem('cognilab.plan.'+user.uid,JSON.stringify(plan));
 localStorage.setItem('hub_mode','free_training');localStorage.removeItem('hub_selected_patient_id');
 return 'esercizio.html?file='+encodeURIComponent(plan.files[plan.index]);
}
