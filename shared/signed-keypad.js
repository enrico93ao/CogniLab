(() => {
 function mount(){for(const input of document.querySelectorAll('[data-signed-keypad]')){
  if(input.dataset.keypadReady)return;input.dataset.keypadReady='true';input.type='text';input.inputMode='text';input.pattern='(?:[+]|-)?[0-9]+';input.maxLength=10;
  const pad=document.createElement('div');pad.className='cl-signed-keypad';pad.setAttribute('role','group');pad.setAttribute('aria-label','Tastierino numerico con segno');
  for(const key of ['1','2','3','4','5','6','7','8','9','+','0','−','⌫','Cancella']){const b=document.createElement('button');b.type='button';b.textContent=key;b.setAttribute('aria-label',key==='⌫'?'Elimina ultima cifra':key==='−'?'Segno meno':key==='+'?'Segno più':key);b.onclick=()=>{if(input.disabled)return;let value=input.value;if(key==='Cancella')value='';else if(key==='⌫')value=value.slice(0,-1);else if(key==='+'||key==='−')value=(key==='−'?'-':'+')+value.replace(/^[+-]/,'');else if(value.length<10)value+=key;input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus({preventScroll:true});};pad.append(b);}input.after(pad);
 }}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount):mount();
})();
