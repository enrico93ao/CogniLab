const memoryJournals=new Map();
const key=uid=>'cognilab.sessionJournal.'+uid;
export function sessionJournal(uid){try{return memoryJournals.get(uid)||JSON.parse(sessionStorage.getItem(key(uid)))||{sessions:{}};}catch{return memoryJournals.get(uid)||{sessions:{}};}}
export function recordSessionResult(uid,result,state){
 const journal=sessionJournal(uid);
 journal.current=result.sessionId;
 const session=journal.sessions[result.sessionId]||{startedAt:result.sessionStartedAt,results:{}};
 session.results[result.id]={...result,syncState:state};
 journal.sessions[result.sessionId]=session;
 // Keep only the current and nine recent sessions in this tab.
 const ids=Object.keys(journal.sessions).sort((a,b)=>(journal.sessions[b].startedAt||'').localeCompare(journal.sessions[a].startedAt||''));
 for(const id of ids.slice(10))if(id!==journal.current)delete journal.sessions[id];
 memoryJournals.set(uid,journal);try{sessionStorage.setItem(key(uid),JSON.stringify(journal));}catch{/* Cloud saving must continue when tab storage is unavailable. */}
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('cognilab-session-change'));
}
export function currentSessionResults(uid){const journal=sessionJournal(uid);let active;try{active=JSON.parse(sessionStorage.getItem('cognilab.session.'+uid));}catch{}return Object.values(journal.sessions[active?.id||journal.current]?.results||{});}

export function clearSessionJournal(uid){memoryJournals.delete(uid);try{sessionStorage.removeItem(key(uid));}catch{}}
