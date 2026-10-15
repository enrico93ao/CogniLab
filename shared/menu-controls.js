(() => {
 'use strict';
 const roots=[...document.querySelectorAll('#setup,#main-menu,#start-screen,#welcome-screen,#menu-screen,#setup-screen,#menu')];
 const captions={'difficulty-level':{easy:'Facile · 30 stimoli',medium:'Medio · 70 stimoli',hard:'Difficile · 130 stimoli'},'stimulus-type':{letters:'Lettere · H',shapes:'Figure · Cerchio'},'disposition-mode':{grid:'Griglia ordinata',random:'Posizioni casuali'},'music-level':{'3':'Base · 3 caselle','5':'Avanzato · 5 caselle'},'music-order':{direct:'Diretto →',inverse:'Inverso ←'},'orientation-level':{'super-easy':'Super facile',base:'Base',advanced:'Avanzato'}};
 const icon=(value,index)=>{if(/inverse|reverse/.test(value))return '←';if(/direct/.test(value))return '→';if(value==='left')return '◀';if(value==='right')return '▶';if(/^[0-9]+$/.test(value))return '◷';return ['▰','▰▰','▰▰▰'][Math.min(index,2)];};
 for(const root of roots){
  for(const select of root.querySelectorAll('select:not([data-menu-enhanced])')){
   if(!select.id||select.options.length>8)continue;select.dataset.menuEnhanced='true';
   const enclosing=select.closest('label'),external=document.querySelector('label[for="'+select.id+'"]');
   const copy=enclosing?.cloneNode(true);copy?.querySelectorAll('select').forEach(node=>node.remove());
   const title=copy?.textContent.trim()||external?.textContent.trim()||select.previousElementSibling?.textContent.trim()||'Scegli un’opzione';
   const group=document.createElement('fieldset');group.className='cl-menu-group';const legend=document.createElement('legend');legend.textContent=title;group.append(legend);
   const options=document.createElement('div');options.className='cl-menu-options';group.append(options);
   const inputs=[];
   [...select.options].forEach((option,index)=>{const label=document.createElement('label');label.className='cl-menu-option';const input=document.createElement('input');input.type='radio';input.dataset.uiProxy='true';input.name='menu-'+select.id;input.value=option.value;input.checked=option.selected;input.disabled=select.disabled||option.disabled;const mark=document.createElement('span');mark.className='cl-menu-icon';mark.setAttribute('aria-hidden','true');mark.textContent=icon(option.value,index);const text=document.createElement('span');text.textContent=captions[select.id]?.[option.value]||option.textContent;input.setAttribute('aria-label',option.textContent);label.title=option.textContent;label.append(input,mark,text);options.append(label);inputs.push(input);input.onchange=()=>{if(!input.checked)return;select.value=input.value;select.dispatchEvent(new Event('change',{bubbles:true}));};});
   if(enclosing){if(enclosing.id)group.id=enclosing.id;enclosing.replaceWith(group);}else{select.before(group);if(external)external.hidden=true;}
   select.hidden=true;select.classList.add('cl-menu-select-source');group.append(select);
   const sync=()=>inputs.forEach(input=>{input.checked=input.value===select.value;input.disabled=select.disabled||[...select.options].find(option=>option.value===input.value)?.disabled;});
   select.addEventListener('change',sync);new MutationObserver(sync).observe(select,{attributes:true,subtree:true,attributeFilter:['disabled','selected']});
  }
  for(const input of root.querySelectorAll('input[type=checkbox]')){
   input.classList.add('cl-menu-check');const label=input.closest('label');label?.classList.add('cl-menu-switch');
   if(!input.getAttribute('aria-label')&&!(label?.textContent.trim()))input.setAttribute('aria-label',label?.previousElementSibling?.textContent.trim()||'Attiva opzione');
  }
  for(const button of root.querySelectorAll('.option-btn,.option-card,.difficulty-btn')){
   button.classList.add('cl-menu-choice');const usesAria=button.hasAttribute('aria-pressed');
   const sync=()=>{if(!button.classList.contains('cl-menu-choice'))button.classList.add('cl-menu-choice');const value=usesAria?button.getAttribute('aria-pressed')==='true':['selected','selected-mode','active'].some(c=>button.classList.contains(c));if(button.getAttribute('aria-pressed')!==String(value))button.setAttribute('aria-pressed',String(value));};
   sync();new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['class','aria-pressed']});
  }
 }
})();
