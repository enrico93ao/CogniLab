// Timed menus use explicit units; trial counts and exposure times are not durations.
const timed={
 'il-pianoforte':{key:'music-duration',unit:60,fallback:120},
 'memoria-giardino':{key:'music-duration',unit:60,fallback:120},
 'semaforo-parole':{key:'durationSelect',unit:1,fallback:120},
 'n-back':{key:'duration-select',unit:1,fallback:120},
 'riordina-lettere':{key:'duration',unit:1,fallback:120},
 'immagine-corrispondente':{key:'session-duration',unit:1,fallback:60},
 'esplorazione-visuospaziale':{fallback:120},
 'doppio-compito':{fallback:120},
 'stroop-original':{fallback:60},
 'inibizione-memoria':{fallback:180},
 'cifrario':{fallback:90},
 'riconoscimento-base':{fallback:60},
 'intruso-visivo':{fallback:60}
};
function readConfig(raw){try{const c=typeof raw==='string'?JSON.parse(raw):raw;return c?.format===1?c:null;}catch{return null;}}
function labelSeconds(label){const m=String(label||'').trim().match(/^(\d+(?:[.,]\d+)?)\s*(m|min|minuti|minuto|s|secondi|secondo)(?:\b|$)/i);if(!m)return null;return Number(m[1].replace(',','.'))*(/^m/i.test(m[2])?60:1);}
export function exerciseDuration(id,raw){
 const config=readConfig(raw),spec=timed[id];let seconds=null;
 if(config&&spec){
  const control=(config.controls||[]).find(c=>c.key===spec.key&&(!['radio','checkbox'].includes(c.type)||c.checked===true));
  if(control)seconds=Number(control.value)*spec.unit;
  if(seconds===null){const options=(config.buttons||[]).map(b=>labelSeconds(b.label)).filter(n=>n!==null);if(options.length===1)seconds=options[0];}
  if(seconds===null)seconds=spec.fallback;
 }
 if(Number.isFinite(seconds)&&seconds>0&&seconds<=3600)return {minSeconds:seconds,maxSeconds:seconds,variable:0,unconfigured:0};
 // This is an explicitly disclosed planning range, not a measured patient speed.
 return {minSeconds:120,maxSeconds:300,variable:1,unconfigured:config?0:1};
}
export function sessionDuration(program={}){
 const result={minSeconds:0,maxSeconds:0,variable:0,unconfigured:0,trials:0};
 for(const [slot,id] of Array.from(program.exercises||[]).entries()){
  const item=exerciseDuration(id,program.configurations?.[slot]);for(const key of ['minSeconds','maxSeconds','variable','unconfigured'])result[key]+=item[key];result.trials++;
 }
 return result;
}
export function durationLabel(value){
 if(!value.trials&&value.trials!==undefined)return 'Aggiungi un esercizio per stimare la durata';
 const min=Math.max(1,Math.ceil(value.minSeconds/60)),max=Math.max(min,Math.ceil(value.maxSeconds/60));
 return 'Durata stimata per sessione: circa '+(min===max?min:min+'–'+max)+' min';
}
export const durationExplanation='Pause e lettura delle istruzioni escluse. Per ogni prova senza timer si considera un intervallo orientativo di 2–5 minuti: il tempo effettivo dipende dalla persona. I tentativi ripetuti dopo un errore possono prolungare la sessione. Le voci non configurate saranno ricalcolate dopo il salvataggio delle impostazioni.';
