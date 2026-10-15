import {exerciseById} from './exercise-catalog.mjs';
export const validUid=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
export function validateProgram(input){
 const name=String(input.name||'').trim(),instructions=String(input.instructions||'').trim(),totalSessions=Number(input.totalSessions),exercises=Array.from(input.exercises||[]);
 if(!name||name.length>80)throw Error('Inserisci un titolo di massimo 80 caratteri.');
 if(!Number.isInteger(totalSessions)||totalSessions<1||totalSessions>60)throw Error('Scegli un numero di sessioni da 1 a 60.');
 if(!exercises.length||exercises.length>20||exercises.some(id=>!exerciseById.has(id)))throw Error('Scegli da 1 a 20 esercizi dal catalogo.');
 if(instructions.length>1000)throw Error('Le indicazioni possono contenere al massimo 1000 caratteri.');
 return {name,instructions,totalSessions,exercises};
}
export function sessionProgress(program,session={}){
 const sequence=Array.from(program.exercises||[]),completed=new Set();
 for(const r of Object.values(session.results||{})){
  const slot=Number(r.programSlot);
  if(r.status==='completed'&&Number.isInteger(slot)&&String(slot)===String(r.programSlot)&&sequence[slot]===r.exerciseId)completed.add(slot);
 }
 const nextSlot=sequence.findIndex((_,index)=>!completed.has(index));
 return {completed:completed.size,total:sequence.length,nextSlot,complete:sequence.length>0&&nextSlot===-1};
}
export function programProgress(program,sessions={}){
 const entries=Object.entries(sessions).map(([id,session])=>({id,...session,progress:sessionProgress(program,session)})).sort((a,b)=>(b.startedAt||'').localeCompare(a.startedAt||''));
 const completed=entries.filter(s=>s.progress.complete).length;
 const resume=entries.find(s=>!s.progress.complete&&s.status!=='completed');
 return {completed,total:program.totalSessions,remaining:Math.max(0,program.totalSessions-completed),percent:Math.min(100,Math.round(completed/program.totalSessions*100)),sessions:entries,resume};
}
export function resultsFromCare(sessions){return Object.values(sessions||{}).flatMap(s=>Object.values(s.results||{}));}
export function summarizeResults(results){
 const done=results.filter(r=>r.status==='completed'),sessions=new Set(done.map(r=>r.sessionId).filter(Boolean));
 const dates=new Set(done.filter(r=>r.finishedAt).map(r=>new Date(r.finishedAt).toLocaleDateString('sv-SE')));
 return {exercises:done.length,sessions:sessions.size,minutes:Math.round(done.reduce((sum,r)=>sum+(Number.isFinite(r.durationMs)?r.durationMs:0),0)/60000),days:dates.size};
}
