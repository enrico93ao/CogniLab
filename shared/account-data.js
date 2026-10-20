import {auth,authReady,db} from './firebase-client.js';
import {get,ref} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {withAccessTimeout} from './access-timeout.js';
import {pending,pendingCare} from './progress-store.js';
import {sessionJournal} from './session-journal.js';
import {validUid} from './care-model.mjs';
function account(){const user=auth.currentUser;if(!user||user.isAnonymous||!validUid(user.uid))throw Error('Accedi con il tuo account per gestire i dati.');return user;}
function personalResults(rows){return Object.fromEntries(Object.entries(rows||{}).filter(([,result])=>result&&typeof result==='object'&&!result.patientId));}
function personalSessions(rows){return Object.fromEntries(Object.entries(rows||{}).filter(([,session])=>session&&typeof session==='object'&&!session.patientId).map(([id,session])=>[id,{...session,results:personalResults(session.results)}]));}
function unchanged(uid){if(auth.currentUser?.uid!==uid)throw Error('Account cambiato. Riapri Il mio account e riprova.');}
export async function exportAccountData(){
 await withAccessTimeout(authReady,'access-ready-timeout');const user=account(),uid=user.uid;
 const unavailable=[],data={};
 const sections=[['profile',`cognilab/users/${uid}/profile`],['sessions',`cognilab/users/${uid}/sessions`],['programs',`cognilab/carePrograms/${uid}`],['connections',`cognilab/careLinks/${uid}`],['invitations',`cognilab/careInvites/${uid}`],['activity',`cognilab/activity/${uid}`],['feedback',`cognilab/feedback/${uid}`]];
 async function readSection(label,path){
  unchanged(uid);
  try{const snapshot=await withAccessTimeout(get(ref(db,path)),'data-export-timeout',12000);unchanged(uid);return snapshot.val();}
  catch(error){unchanged(uid);unavailable.push(label);return null;}
 }
 await Promise.all(sections.map(async([label,path])=>{data[label]=await readSection(label,path);}));
 // Rules permit reading only an individual assigned program's sessions, never the careSessions parent.
 data.programSessions={};const ids=Object.keys(data.programs||{});
 for(let offset=0;offset<ids.length;offset+=4){
  unchanged(uid);await Promise.all(ids.slice(offset,offset+4).map(async id=>{
   if(!validUid(id)){unavailable.push('programSessions:invalid-id');return;}
   const program=data.programs[id];if(!program||typeof program!=='object'||data.connections?.[program.professionalId]!==true){unavailable.push('programSessions:'+id);return;}
   data.programSessions[id]=await readSection('programSessions:'+id,`cognilab/careSessions/${uid}/${id}`);
  }));
 }
 unchanged(uid);
 data.sessions=data.sessions?personalSessions(data.sessions):data.sessions;
 const journal=sessionJournal(uid),sessions=personalSessions(journal.sessions);for(const [id,session]of Object.entries(sessions))if(!Object.keys(session.results).length)delete sessions[id];
 const local=JSON.parse(JSON.stringify({results:personalResults(pending(uid)),sharing:personalResults(pendingCare(uid)),journal:{sessions,...(sessions[journal.current]?{current:journal.current}:{})}}));
 return {format:'cognilab-account-export',version:1,exportedAt:new Date().toISOString(),account:{uid,email:user.email||null,displayName:user.displayName||null,emailVerified:Boolean(user.emailVerified)},data,local,unavailable,complete:unavailable.length===0,scope:'Profilo, storico personale e programmi assegnati al medesimo account; risultati locali in attesa di sincronizzazione. Le letture sono eseguite separatamente. Per altri documenti del percorso clinico rivolgersi al professionista.'};
}
const requestScopes={account:'cancellazione dell’account e dei dati personali',training:'cancellazione dello storico degli allenamenti liberi',clinical:'verifica della cancellazione dei dati dei programmi assegnati con il professionista'};
export function prepareDataRequest(scope){
 const user=account();if(!Object.hasOwn(requestScopes,scope))throw Error('Scegli quali dati riguardano la richiesta.');
 const to='enrico.ao@gmail.com',subject='CogniLab — richiesta gestione dati';
 const body=`Buongiorno,\n\nchiedo la ${requestScopes[scope]}.\n\nAccount CogniLab: ${user.uid}\nEmail dell’account: ${user.email||'da verificare'}\n\nVi chiedo di indicarmi eventuali verifiche di identità e di confermarmi come verrà gestita la richiesta, distinguendo gli eventuali dati del percorso clinico.\n\nGrazie.`;
 return {to,subject,body,href:`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
