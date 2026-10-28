export function numberOrNull(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;}
export function normalizeMetrics(raw={}){
 const correct=numberOrNull(raw.correct),total=numberOrNull(raw.total);
 const details={};
 for(const key of ['plannedTrials','trialsCompleted','replays','listened','practiced','notPracticed','firstTry','assisted','withoutHint','plannedWords','wordsCompleted'])if(Number.isSafeInteger(raw[key])&&raw[key]>=0&&raw[key]<=1000000)details[key]=raw[key];
 for(const key of ['allTrialsCompleted','allWordsCompleted'])if(typeof raw[key]==='boolean')details[key]=raw[key];
 if(raw.oralAssessment==='not-assessed')details.oralAssessment='not-assessed';
 return {...details,correct,total,errors:numberOrNull(raw.errors),omissions:numberOrNull(raw.omissions),accuracyPct:correct!==null&&total>0&&correct<=total?Math.round(correct/total*10000)/100:null,responseTimeMs:numberOrNull(raw.responseTimeMs),score:numberOrNull(raw.score),scoreUnit:typeof raw.scoreUnit==='string'?raw.scoreUnit.slice(0,30):'punti',scoreDirection:raw.scoreDirection==='lower'?'lower':'higher'};
}
export function groupKey(result){return result.exerciseId+'|'+(result.exerciseVersion||'legacy')+'|'+JSON.stringify(Object.fromEntries(Object.entries(result.settings||{}).sort(([a],[b])=>a.localeCompare(b))));}
export function comparableSeries(results,key){return results.filter(r=>r.status==='completed'&&groupKey(r)===key).sort((a,b)=>a.finishedAt.localeCompare(b.finishedAt));}
export function measurement(result){const m=result.metrics||{};return m.accuracyPct!==null&&m.accuracyPct!==undefined?{value:m.accuracyPct,unit:'%',direction:'higher'}:m.score!==null&&m.score!==undefined?{value:m.score,unit:m.scoreUnit||'punti',direction:m.scoreDirection||'higher'}:null;}
export function change(first,last){const a=measurement(first),b=measurement(last);if(!a||!b||a.unit!==b.unit||a.direction!==b.direction)return null;const delta=b.value-a.value;return {delta,unit:b.unit,trend:delta===0?'stabile':(b.direction==='lower'?-delta:delta)>0?'positivo':'negativo'};}
export function satisfaction(entries){const valid=entries.filter(e=>[e.q1,e.q2,e.q3].every(v=>Number.isInteger(v)&&v>=1&&v<=5));return valid.length?valid.reduce((sum,e)=>sum+e.q2,0)/valid.length:null;}
export function onlineCount(presence){return Object.values(presence||{}).filter(connections=>Object.values(connections||{}).some(c=>c===true||c?.online===true)).length;}
export function completedCount(activity){return Object.values(activity||{}).reduce((n,rows)=>n+Object.values(rows||{}).filter(v=>v===true).length,0);}
