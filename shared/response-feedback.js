(()=>{
 if(window.CogniLabAudio)return;
 const key='cognilab.responseAudio';let preferences={positive:true,negative:true,volume:.35};try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved)preferences={positive:saved.positive!==false,negative:saved.negative!==false,volume:typeof saved.volume==='number'?Math.max(0,Math.min(1,saved.volume)):.35};}catch{}
 let audio,last=-Infinity,note;const active=new Set();
 const kinds={correct:'correct',success:'correct',hit:'correct','super-positive':'correct',complete:'correct',wrong:'error',error:'error',failure:'error'};
 const normalize=type=>typeof type==='boolean'?(type?'correct':'error'):kinds[type];
 function context(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;audio??=new Audio();if(audio.state==='suspended')audio.resume().catch(()=>{if(note)note.hidden=false;});return audio;}
 function stop(){for(const oscillator of active){try{oscillator.stop();}catch{}}active.clear();}
 function feedback(type){
  const kind=normalize(type);if(!kind||!(kind==='correct'?preferences.positive:preferences.negative)||!preferences.volume)return false;
  // Retain the exploration exercise's separate local switches.
  const local=document.getElementById(kind==='correct'?'sound-correct-toggle':'sound-error-toggle');if(local&&!local.checked)return false;
  const now=Date.now();if(now-last<90)return false;last=now;
  try{const ctx=context();if(!ctx){if(note)note.hidden=false;return false;}const at=ctx.currentTime;
   const sequence=kind==='correct'?[[523.25,0,.11],[783.99,.09,.14]]:[[220,0,.16]];
   for(const [frequency,delay,duration] of sequence){const osc=ctx.createOscillator(),gain=ctx.createGain(),start=at+delay;osc.type='sine';osc.frequency.setValueAtTime(frequency,start);if(kind==='error')osc.frequency.linearRampToValueAtTime(174.61,start+duration);gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(.12*preferences.volume,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(ctx.destination);active.add(osc);osc.onended=()=>{active.delete(osc);osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+duration+.01);}return true;
  }catch{if(note)note.hidden=false;return false;}
 }
 function save(){try{localStorage.setItem(key,JSON.stringify(preferences));}catch{}}
 window.CogniLabAudio={feedback,handles:type=>Boolean(normalize(type)),configure:values=>{if(typeof values.positive==='boolean')preferences.positive=values.positive;if(typeof values.negative==='boolean')preferences.negative=values.negative;if(typeof values.volume==='number'&&Number.isFinite(values.volume))preferences.volume=Math.max(0,Math.min(1,values.volume));save();if(!preferences.positive&&!preferences.negative)stop();},stop};
 document.addEventListener('pointerdown',()=>{try{context();}catch{}},{capture:true,once:true});document.addEventListener('keydown',()=>{try{context();}catch{}},{capture:true,once:true});window.addEventListener('cognilab-task-pause',e=>{if(e.detail?.paused)stop();});window.addEventListener('pagehide',()=>{stop();audio?.close().catch(()=>{});});
 function mount(){
  const panel=(window.CogniLabExercise?.setup||'').split(',').map(id=>document.getElementById(id)).find(Boolean);if(!panel||document.getElementById('cl-response-options'))return;
  const box=document.createElement('fieldset');box.id='cl-response-options';box.className='cl-response-options';box.style.cssText='grid-column:1/-1;clear:both;border:1px solid #cfe1e5;border-radius:14px;padding:16px;margin:16px 0;color:#315b69;background:#f2f8f8;font:500 .85rem system-ui,sans-serif;text-align:left';const legend=document.createElement('legend');legend.textContent='Riscontri sonori';legend.style.fontWeight='700';box.append(legend);
  for(const [name,label] of [['positive','Risposta corretta'],['negative','Risposta da correggere']]){const row=document.createElement('label');row.style.cssText='display:inline-flex;align-items:center;gap:9px;margin:8px 18px 8px 0;cursor:pointer';const input=document.createElement('input');input.type='checkbox';input.id='cl-sound-'+name;input.dataset.uiProxy='true';input.checked=preferences[name];input.style.cssText='width:22px;height:22px;accent-color:#087e80';input.onchange=()=>window.CogniLabAudio.configure({[name]:input.checked});row.append(input,document.createTextNode(label));box.append(row);}
  const volumeLabel=document.createElement('label');volumeLabel.textContent='Volume dei riscontri';volumeLabel.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0';const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='1';volume.step='.05';volume.value=preferences.volume;volume.dataset.uiProxy='true';volume.setAttribute('aria-label','Volume dei riscontri sonori');volume.oninput=()=>window.CogniLabAudio.configure({volume:Number(volume.value)});volumeLabel.append(volume);box.append(volumeLabel);
  const preview=document.createElement('button');preview.type='button';preview.textContent='Prova i suoni';preview.style.cssText='min-height:40px;padding:8px 12px;border:1px solid #b9d3d8;border-radius:10px;background:white;color:#236773;font:inherit;cursor:pointer';preview.onclick=()=>{feedback('correct');setTimeout(()=>feedback('error'),350);};box.append(preview);note=document.createElement('p');note.hidden=true;note.textContent='Se non senti i suoni, controlla volume e autorizzazioni audio del browser.';note.setAttribute('role','status');box.append(note);panel.append(box);
  const style=document.createElement('style');style.textContent='body.cl-task-running .cl-response-options{display:none!important}';document.head.append(style);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
