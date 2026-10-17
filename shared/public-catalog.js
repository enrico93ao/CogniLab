// Optional search enhancement. The complete catalog and every link are in the HTML.
(()=>{
 const controls=document.getElementById('public-filters');if(!controls)return;
 const input=document.getElementById('public-search'),cards=[...document.querySelectorAll('[data-exercise]')],buttons=[...controls.querySelectorAll('[data-filter]')];let area='all';
 const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').trim();
 const texts=new Map(cards.map(card=>[card,normalize(card.textContent)]));
 function filter(){const query=normalize(input.value),terms=query.split(/\s+/).filter(Boolean);let count=0;for(const card of cards){const visible=(area==='all'||card.dataset.area===area)&&terms.every(term=>texts.get(card).includes(term));card.hidden=!visible;if(visible)count++;}document.getElementById('public-results').textContent=count===1?'1 esercizio trovato.':count+' esercizi trovati.';document.getElementById('public-no-results').hidden=count!==0;}
 input.addEventListener('input',filter);for(const button of buttons)button.addEventListener('click',()=>{area=button.dataset.filter;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();});controls.hidden=false;
})();
(()=>{if(!('IntersectionObserver' in window)||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('pub-in-view');observer.unobserve(entry.target);}},{threshold:.08});document.querySelectorAll('.pub-section').forEach(section=>observer.observe(section));})();
