import {get,ref,set,update} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,authReady,db} from './firebase-client.js';
import {requireGymAccess} from './gym-access.js';
import {requireProfessional} from './clinical-access.js';
import {withAccessTimeout} from './access-timeout.js';
import {validateProgram,validUid,programProgress} from './care-model.mjs';
import {exerciseById} from './exercise-catalog.mjs';
const read=async path=>(await withAccessTimeout(get(ref(db,path)),'care-timeout')).val();
const write=(path,value)=>withAccessTimeout(set(ref(db,path),value),'care-timeout');
const patch=values=>withAccessTimeout(update(ref(db),values),'care-timeout');
export async function currentCareUser(){await withAccessTimeout(authReady,'access-ready-timeout');return requireGymAccess();}
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
export async function professionalPatients(){const user=await requireProfessional();return await read(`cognilab/users/${user.uid}/clinical/registeredPatients`)||{};}
export async function professionalPatient(patientUid,record){
 const user=await requireProfessional();if(!validUid(patientUid))throw Error('Codice paziente non valido.');
 const accepted=await read(`cognilab/careLinks/${patientUid}/${user.uid}`)===true;
 if(!accepted)return {accepted:false,programs:[]};
 const programs=await Promise.all(Object.keys(record.programs||{}).map(async id=>{
  const program=await read(`cognilab/carePrograms/${patientUid}/${id}`);if(!program||program.professionalId!==user.uid)return null;
  return {id,...program,sessions:await read(`cognilab/careSessions/${patientUid}/${id}`)||{}};
 }));return {accepted,programs:programs.filter(Boolean)};
}
export async function assignProgram(patientUid,input){
 const user=await requireProfessional(),fields=validateProgram(input);if(!validUid(patientUid))throw Error('Seleziona un paziente.');
 if(await read(`cognilab/careLinks/${patientUid}/${user.uid}`)!==true)throw Error('Il paziente deve prima accettare il collegamento dalla propria dashboard.');
 const id=crypto.randomUUID(),program={...fields,professionalId:user.uid,professionalName:String(user.displayName||user.email||'Professionista CogniLab').slice(0,80),createdAt:Date.now(),status:'active',version:1};
 await patch({[`cognilab/carePrograms/${patientUid}/${id}`]:program,[`cognilab/users/${user.uid}/clinical/registeredPatients/${patientUid}/programs/${id}`]:true});return id;
}
export async function archiveProgram(patientUid,id){await requireProfessional();if(!validUid(patientUid)||!validUid(id))throw Error('Programma non valido.');await write(`cognilab/carePrograms/${patientUid}/${id}/status`,'archived');}
export async function startAssignedProgram(id){
 const user=await currentCareUser();if(!validUid(id))throw Error('Programma non valido.');
 const program=await read(`cognilab/carePrograms/${user.uid}/${id}`);
 if(!program||program.status!=='active')throw Error('Questo programma non è più attivo.');
 if(await read(`cognilab/careLinks/${user.uid}/${program.professionalId}`)!==true)throw Error('Il collegamento al professionista non è attivo.');
 validateProgram(program);
 const sessions=await read(`cognilab/careSessions/${user.uid}/${id}`)||{},progress=programProgress(program,sessions);
 if(!progress.remaining)throw Error('Hai completato tutte le sessioni previste per questo programma.');
 const resume=progress.resume,session={id:resume?.id||crypto.randomUUID(),startedAt:resume?.startedAt||new Date().toISOString(),patientId:null,programId:id,programOwnerId:program.professionalId,programSlot:String(resume?.progress.nextSlot??0),programExercises:Array.from(program.exercises)};
 await write(`cognilab/careSessions/${user.uid}/${id}/${session.id}/startedAt`,session.startedAt);
 const completed=resume?Object.keys(resume.results||{}).map(key=>resume.results[key]).filter(r=>r.status==='completed').map(r=>Number(r.programSlot)):[];
 const plan={programId:id,files:program.exercises.map(exerciseId=>exerciseById.get(exerciseId).file),index:Number(session.programSlot),completedSlots:completed};
 sessionStorage.setItem('cognilab.session.'+user.uid,JSON.stringify(session));sessionStorage.setItem('cognilab.plan.'+user.uid,JSON.stringify(plan));
 localStorage.setItem('hub_mode','free_training');localStorage.removeItem('hub_selected_patient_id');
 return 'esercizio.html?file='+encodeURIComponent(plan.files[plan.index]);
}
