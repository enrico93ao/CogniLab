export const LETTERS='ABCDEFGHIJKLMNOP'.split('');
export const MONTHS=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
export const SEASONS=['primavera','estate','autunno','inverno'];
export const NOTES=['Do','Re','Mi','Fa','Sol','La','Si','Do'];
export const FREQUENCIES=[261.6256,293.6648,329.6276,349.2282,391.9954,440,493.8833,523.2511];
export function shuffle(values,rng=Math.random){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function trailSequence(type,inverse=false,secondary=[]){let a=type==='letters'?[...LETTERS]:type==='numbers'?Array.from({length:20},(_,i)=>String(i+1)):secondary.flatMap((v,i)=>[String(i+1),v]);return inverse?a.reverse():a;}
// Random best-candidate packing: no rows or columns, with bounded work.
export function trailLayout(count,width,height,rng=Math.random){
 const top=104,bottom=12,available=Math.max(40,height-top-bottom);
 if(!count)return {size:0,points:[]};
 let size=Math.min(74,Math.sqrt(width*available/count)*.67,width-16,available-16);
 for(let attempt=0;attempt<40;attempt++,size*=.94){
  const margin=size/2+6,points=[];
  for(let i=0;i<count;i++){
   let best=null,distance=-1;
   for(let sample=0;sample<240;sample++){
    const p={x:margin+rng()*Math.max(0,width-2*margin),y:top+margin+rng()*Math.max(0,available-2*margin)};
    const gap=points.length?Math.min(...points.map(q=>Math.max(Math.abs(p.x-q.x),Math.abs(p.y-q.y)))):Infinity;
    if(gap>distance){best=p;distance=gap;}
   }
   if(distance<size+8)break;
   points.push(best);
  }
  if(points.length===count)return {size,points:shuffle(points,rng)};
 }
 throw new Error('Spazio insufficiente per gli stimoli');
}
export function nextTarget(current,rng=Math.random){if(rng()>=.35)return current;const others=['circle','square','triangle'].filter(x=>x!==current);return others[Math.floor(rng()*others.length)];}
// Northern hemisphere meteorological seasons: fixed, explicit calendar boundaries.
export function season(date){return SEASONS[Math.floor(((date.getMonth()+10)%12)/3)];}
export function nextSeason(date){const y=date.getFullYear(),m=date.getMonth(),d=date.getDate(),today=Date.UTC(y,m,d);const boundaries=[[2,1,'primavera'],[5,1,'estate'],[8,1,'autunno'],[11,1,'inverno']];for(const year of [y,y+1])for(const [month,day,name] of boundaries){const value=Date.UTC(year,month,day);if(value>today)return {name,days:(value-today)/86400000,year,month,day};}}
export function temporalTasks(level,date){if(level==='super-easy')return [];const tasks=[{title:'Metti le stagioni al contrario, iniziando dall’inverno',answer:[...SEASONS].reverse()},{title:'Metti i mesi al contrario, iniziando da dicembre',answer:[...MONTHS].reverse()}];if(level==='advanced'){tasks.push({title:'Parti da gennaio e scegli un mese sì e uno no',answer:MONTHS.filter((_,i)=>i%2===0)});const next=nextSeason(date);tasks.push({title:'Quanti giorni mancano all’inizio della prossima stagione: '+next.name+'?',answer:[String(next.days)],numeric:true,next});}return tasks;}
export function melody(length,keys=8,rng=Math.random){const phrase=[Math.floor(rng()*keys)];while(phrase.length<length){const last=phrase.at(-1);const step=[-2,-1,1,2][Math.floor(rng()*4)];phrase.push(Math.max(0,Math.min(keys-1,last+step)));}return phrase;}
export function extendMelody(phrase,keys=8,rng=Math.random){if(!phrase.length)return melody(1,keys,rng);const step=[-2,-1,1,2][Math.floor(rng()*4)];return [...phrase,Math.max(0,Math.min(keys-1,phrase.at(-1)+step))];}
export function cellFrequency(index){return FREQUENCIES[index%7]*2**Math.floor(index/7);}
