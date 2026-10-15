import {groupKey} from './progress-model.mjs';
import {summarizeResults} from './care-model.mjs';
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const metrics={accuracy:{label:'Accuratezza',unit:'%',direction:1,field:'accuracyPct'},time:{label:'Tempo medio di risposta',unit:'ms',direction:-1,field:'responseTimeMs'},errors:{label:'Errori',unit:'errori',direction:-1,field:'errors'},score:{label:'Punteggio',field:'score'}};
function measure(r,key){const m=r.metrics||{},spec=metrics[key],value=m[spec.field];return typeof value==='number'&&Number.isFinite(value)?{value,unit:spec.unit||m.scoreUnit||'punti',direction:key==='score'?(m.scoreDirection==='lower'?-1:1):spec.direction}:null;}
const formatDate=value=>Number.isNaN(new Date(value).getTime())?'Data non disponibile':new Date(value).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'});
const settingLabels={'modalita':'Modalità','trail-type':'Sequenza','trail-order':'Ordine','trail-dynamic':'Stimoli in movimento','trail-bar-enabled':'Barra laterale','trail-bar-side':'Lato della barra','hint-toggle':'Aiuti','music-duration':'Durata in secondi','music-order':'Ordine','music-difficulty':'Difficoltà','orientation-level':'Livello','duration':'Durata','level':'Livello'};
const settingText=r=>Object.entries(r.settings||{}).filter(([key])=>key!=='stimulusVersion').map(([key,value])=>(settingLabels[key]||key.replace(/[-_]/g,' '))+': '+(typeof value==='boolean'?(value?'sì':'no'):value)).join(' · ');
export function createProgressView(host,{title='I miei progressi'}={}){
 host.classList.add('care-progress','care-card');
 const heading=el('div',undefined,'care-section-heading');heading.append(el('div','NEL TEMPO','care-eyebrow'),el('h2',title));host.append(heading);
 const description=el('p','Confronta lo stesso esercizio con le stesse impostazioni. I dati descrivono le prove svolte e non costituiscono una valutazione clinica.','care-muted');host.append(description);
 const status=el('p','Caricamento dei risultati…','care-load-status');status.setAttribute('role','status');host.append(status);
 const stats=el('div',undefined,'care-stats');host.append(stats);
 const filters=el('div',undefined,'care-filters');host.append(filters);
 const group=el('select'),metric=el('select'),period=el('select');
 for(const [key,spec] of Object.entries(metrics)){const option=el('option',spec.label);option.value=key;metric.append(option);}
 for(const [value,label] of [['all','Tutto lo storico'],['30','Ultimi 30 giorni'],['90','Ultimi 90 giorni']]){const o=el('option',label);o.value=value;period.append(o);}
 for(const [label,select] of [['Esercizio e impostazioni',group],['Indicatore',metric],['Periodo',period]]){const field=el('label',label);field.append(select);filters.append(field);}
 const settings=el('p',undefined,'care-settings'),trend=el('p',undefined,'care-trend'),chart=el('div',undefined,'care-chart');chart.setAttribute('aria-live','polite');host.append(settings,trend,chart);
 const details=el('details',undefined,'care-history');details.append(el('summary','Storico delle prove'));const scroll=el('div',undefined,'care-table-scroll'),table=el('table'),thead=el('thead'),tr=el('tr');
 for(const text of ['Data','Esercizio','Accuratezza','Errori','Durata','Stato']){const th=el('th',text);th.scope='col';tr.append(th);}thead.append(tr);const tbody=el('tbody');table.append(thead,tbody);scroll.append(table);details.append(scroll);host.append(details);
 let results=[];
 function draw(){
  const selected=results.filter(r=>r.status==='completed'&&groupKey(r)===group.value),latest=selected.at(-1);
  settings.textContent=latest?'Impostazioni: '+(settingText(latest)||'predefinite'):'';
  const cutoff=period.value==='all'?-Infinity:Date.now()-Number(period.value)*86400000;
  let series=selected.filter(r=>new Date(r.finishedAt).getTime()>=cutoff&&measure(r,metric.value));
  const last=series.at(-1),unit=last?measure(last,metric.value).unit:'',direction=last?measure(last,metric.value).direction:1;
  series=series.filter(r=>{const m=measure(r,metric.value);return m.unit===unit&&m.direction===direction;}).slice(-40);
  chart.replaceChildren();trend.className='care-trend';
  if(series.length<2){trend.textContent=series.length?'Primo dato disponibile: '+measure(series[0],metric.value).value.toLocaleString('it-IT')+' '+unit+'. Il grafico comparirà dalla seconda prova confrontabile.':'Nessun dato disponibile per questi filtri. Gli indicatori non misurati restano vuoti.';return;}
  const values=series.map(r=>measure(r,metric.value).value),delta=values.at(-1)-values[0],positive=delta*direction>0;
  trend.classList.add(delta===0?'stable':positive?'positive':'negative');
  trend.textContent=(delta===0?'→ Stabile':positive?'↗ Andamento positivo':'↘ Andamento negativo')+' · '+(delta>0?'+':'')+Number(delta.toFixed(2)).toLocaleString('it-IT')+' '+(unit==='%'?'punti percentuali':unit)+' tra la prima e l’ultima delle '+series.length+' prove mostrate.';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 760 260');svg.setAttribute('role','img');const title=document.createElementNS(ns,'title');title.textContent=metrics[metric.value].label+': '+trend.textContent;svg.append(title);
  const add=(tag,attrs,text)=>{const node=document.createElementNS(ns,tag);for(const [key,v] of Object.entries(attrs))node.setAttribute(key,v);if(text!==undefined)node.textContent=text;svg.append(node);return node;};
  let min=unit==='%'?0:Math.min(...values),max=unit==='%'?100:Math.max(...values);if(max===min){min=Math.max(0,min-1);max+=1;}
  for(let i=0;i<4;i++){const y=28+i*58;add('line',{x1:70,x2:730,y1:y,y2:y,stroke:'#e3ecef'});add('text',{x:60,y:y+4,'text-anchor':'end',fill:'#627684','font-size':12},Number((max-i*(max-min)/3).toFixed(1)).toLocaleString('it-IT'));}
  // Horizontal position follows real elapsed time, not a fabricated daily average.
  const firstTime=new Date(series[0].finishedAt).getTime(),lastTime=new Date(series.at(-1).finishedAt).getTime();
  const points=series.map((r,i)=>({x:70+(lastTime===firstTime?i/(series.length-1):(new Date(r.finishedAt).getTime()-firstTime)/(lastTime-firstTime))*660,y:202-(values[i]-min)/(max-min)*174}));
  add('polyline',{points:points.map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:'#0b837f','stroke-width':3,'stroke-linejoin':'round'});
  points.forEach((p,i)=>{const dot=add('circle',{cx:p.x,cy:p.y,r:5,fill:'#0b837f',stroke:'white','stroke-width':2});const t=document.createElementNS(ns,'title');t.textContent=formatDate(series[i].finishedAt)+': '+values[i]+' '+unit;dot.append(t);});
  add('text',{x:70,y:240,fill:'#627684','font-size':12},formatDate(series[0].finishedAt));add('text',{x:730,y:240,'text-anchor':'end',fill:'#627684','font-size':12},formatDate(series.at(-1).finishedAt));chart.append(svg);
  const accessible=el('details',undefined,'care-chart-values');accessible.append(el('summary','Leggi i valori del grafico'));const list=el('ol');series.forEach((r,i)=>list.append(el('li',formatDate(r.finishedAt)+': '+values[i].toLocaleString('it-IT')+' '+unit)));accessible.append(list);chart.append(accessible);
 }
 for(const select of [group,metric,period])select.onchange=draw;
 function render(source){
  results=[...source].sort((a,b)=>String(a.finishedAt||'').localeCompare(String(b.finishedAt||'')));status.textContent=results.length?results.length+' prove salvate, comprese quelle interrotte.':'Il tuo storico inizierà dal primo esercizio salvato.';
  const summary=summarizeResults(results);stats.replaceChildren();for(const [value,label] of [[summary.sessions,'Sessioni con esercizi completati'],[summary.exercises,'Esercizi completati'],[summary.minutes,'Minuti di attività'],[summary.days,'Giorni di allenamento']]){const tile=el('div',undefined,'care-stat');tile.append(el('strong',String(value)),el('span',label));stats.append(tile);}
  const previous=group.value,groups=new Map();for(const r of results.filter(r=>r.status==='completed'))groups.set(groupKey(r),r);group.replaceChildren();const versions=new Map();
  for(const [key,r] of groups){const number=(versions.get(r.exerciseId)||0)+1;versions.set(r.exerciseId,number);const option=el('option',r.title+' · configurazione '+number);option.value=key;group.append(option);}if(groups.has(previous))group.value=previous;filters.hidden=!groups.size;
  tbody.replaceChildren();for(const r of [...results].reverse().slice(0,100)){const row=el('tr'),accuracy=measure(r,'accuracy'),errors=measure(r,'errors');for(const content of [formatDate(r.finishedAt),r.title,accuracy?accuracy.value+'%':'—',errors?String(errors.value):'—',Number.isFinite(r.durationMs)?Math.round(r.durationMs/1000)+' s':'—',r.status==='completed'?'Completato':'Interrotto'])row.append(el('td',content));tbody.append(row);}
  if(!results.length){const row=el('tr'),cell=el('td','Nessuna prova salvata.');cell.colSpan=6;row.append(cell);tbody.append(row);}draw();
 }
 return {render,setStatus:message=>{status.textContent=message;},setTitle:value=>{heading.querySelector('h2').textContent=value;}};
}
