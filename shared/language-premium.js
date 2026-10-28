// Presentation only: adapt to the actual exercise iframe, without scaling text or changing a response.
(() => {
 const main=document.querySelector('.language-premium .suite-main');if(!main)return;
 const mode=document.body.dataset.languageMode||'listen';
 const stage=document.getElementById(mode==='listen'?'listen-game':'language-game');if(!stage)return;
 const icons={listen:'<path d="M8 15a6 6 0 1 1 10-4c0 4-4 3-4 6a3 3 0 0 1-6 0m2-7a2 2 0 1 1 4 0c0 2-2 2-2 4"/>',repeat:'<path d="M4 10V7h13l-3-3m6 10v3H7l3 3M5 10v4m14-7v4"/>',spell:'<path d="m4 18 5-12 5 12m-8-4h6m5-7h5m-5 5h5m-5 6h5"/>',story:'<rect x="2" y="5" width="5" height="10" rx="1"/><rect x="10" y="5" width="5" height="10" rx="1"/><rect x="18" y="5" width="5" height="10" rx="1"/><path d="M5 19h15m-3-2 3 2-3 2"/>',semantic:'<path d="M9 8 6 5a4 4 0 0 0-5 5l4 4m10 2 3 3a4 4 0 0 0 5-5l-4-4M7 17 17 7"/>',function:'<path d="m14 4-3 6 3 3 6-3a6 6 0 0 1-7 7l-6 6-4-4 6-6a6 6 0 0 1 5-9Z"/>'};
 const mark=main.querySelector('.suite-mark');if(mark)mark.innerHTML='<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[mode]+'</svg>';
 const hero=main.querySelector('.suite-hero>div');if(hero&&!hero.querySelector('.lp-features')){const features=document.createElement('div');features.className='lp-features';for(const text of ['3 livelli','Senza timer',mode==='repeat'?'Ripetizione guidata':'Risposte con un tocco']){const n=document.createElement('span');n.textContent=text;features.append(n);}hero.append(features);}
 const replay=stage.querySelector('#language-replay,#listen-replay');if(replay){replay.setAttribute('aria-label','Ascolta di nuovo');replay.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Zm12-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg><span>Ascolta</span>';}
 const hud=stage.querySelector('.suite-hud');if(hud){const name=document.createElement('span');name.className='lp-stage-name';name.textContent=window.CogniLabExercise?.title||'CogniLab · Linguaggio';hud.prepend(name);}
 const meter=document.createElement('div'),fill=document.createElement('span');meter.className='lp-stage-meter';meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','Prove svolte');meter.setAttribute('aria-valuemin','0');meter.append(fill);hud?.append(meter);
 let frame=null;const visible=node=>node&&!node.hidden&&getComputedStyle(node).display!=='none';
 const height=node=>visible(node)?node.getBoundingClientRect().height:0;
 const px=(node,key)=>parseFloat(getComputedStyle(node)[key])||0;
 function set(key,value){const next=Math.round(value)+'px';if(stage.style.getPropertyValue(key)!==next)stage.style.setProperty(key,next);}
 function fit(){
  frame=null;if(!visible(stage))return;
  const width=stage.clientWidth,small=window.innerWidth<=680;
  const viewport=window.visualViewport?.height||window.innerHeight;
  const prompt=stage.querySelector('.language-prompt,.listen-prompt'),status=stage.querySelector('.language-status,.listen-status'),actions=stage.querySelector(':scope>.language-actions,:scope>.listen-actions'),error=stage.querySelector('.language-audio-error,.listen-audio-error'),stimulus=stage.querySelector('.language-stimulus');
  const mainSpace=px(main,'paddingTop')+px(main,'paddingBottom');
  const gap=px(stage,'rowGap');let available=viewport-mainSpace-height(hud)-height(prompt)-height(status)-height(actions)-height(error)-gap*5;
  set('--lp-target-size',small?Math.min(100,width*.28):Math.min(235,Math.max(130,available-50)));
  if(small&&visible(stimulus)&&stimulus.children.length)available-=height(stimulus)+gap;
  const grid=stage.querySelector('.language-grid,.listen-grid');
  if(grid&&grid.children.length){const cols=Math.max(1,getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length),rows=Math.ceil(grid.children.length/cols),card=grid.children[0];const caption=card.querySelector('.language-caption,.listen-label');const room=(available-gap*(rows-1))/rows-px(card,'paddingTop')-px(card,'paddingBottom')-height(caption)-12;const horizontal=card.clientWidth-px(card,'paddingLeft')-px(card,'paddingRight');set('--lp-choice-size',Math.max(84,Math.min(230,horizontal,room)));}
  const scenes=stage.querySelector('.language-scenes');if(scenes){const cols=Math.max(1,getComputedStyle(scenes).gridTemplateColumns.split(' ').filter(Boolean).length),rows=Math.ceil(scenes.children.length/cols);const copy=stage.querySelector('.language-story'),sequence=stage.querySelector('.language-scene-sequence'),controls=stage.querySelector('#language-workspace>.language-actions'),hint=stage.querySelector('.language-help');const top=window.innerWidth>900?Math.max(height(copy),height(sequence)):height(copy)+height(sequence)+gap;const captions=Math.max(0,...[...scenes.querySelectorAll('.language-caption')].map(height));const room=(available-top-height(controls)-height(hint)-gap*3)/rows-captions-24;set('--lp-scene-size',Math.max(90,Math.min(150,room)));set('--lp-slot-size',small?48:64);}
  const progress=stage.querySelector('#language-progress,#listen-progress')?.textContent.match(/(\d+)\s+di\s+(\d+)/);if(progress){const total=Number(progress[2]),next=stage.querySelector('#language-next,#listen-next'),done=Math.max(0,Number(progress[1])-(visible(next)?0:1));meter.setAttribute('aria-valuemax',String(total));meter.setAttribute('aria-valuenow',String(done));fill.style.width=(done/total*100)+'%';}
 }
 function queue(){if(frame===null)frame=requestAnimationFrame(fit);}
 const observer=new MutationObserver(queue);observer.observe(stage,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','data-count']});
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(queue):null;resize?.observe(main);
 window.addEventListener('resize',queue);window.visualViewport?.addEventListener('resize',queue);queue();
 window.addEventListener('pagehide',()=>{observer.disconnect();resize?.disconnect();if(frame!==null)cancelAnimationFrame(frame);window.removeEventListener('resize',queue);window.visualViewport?.removeEventListener('resize',queue);},{once:true});
})();
