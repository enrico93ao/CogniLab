(() => {
 const symbols={
  focus:'<circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="9"/><path d="M32 8v9m0 30v9M8 32h9m30 0h9"/><circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/>',
  memory:'<path d="M31 14c-8-7-17 0-15 8-9 3-9 16-2 19-1 10 11 14 17 7V14Zm2 0c8-7 17 0 15 8 9 3 9 16 2 19 1 10-11 14-17 7V14Z"/><path d="M21 23c7-1 9 5 7 9m-9 8c2-5 7-5 10-2m14-15c-7-1-9 5-7 9m9 8c-2-5-7-5-10-2"/>',
  logic:'<rect x="23" y="9" width="18" height="13" rx="4"/><path d="M32 22v10M15 42V32h34v10"/><rect x="7" y="42" width="16" height="13" rx="4"/><rect x="41" y="42" width="16" height="13" rx="4"/>',
  language:'<path d="M11 13h42v30H32L20 53V43h-9V13Z"/><path d="M21 24h22m-22 9h14"/>',
  visual:'<rect x="10" y="10" width="30" height="30" rx="7"/><circle cx="42" cy="42" r="14"/><path d="m14 51 10-10 10 10"/>',
  clock:'<circle cx="32" cy="32" r="22"/><path d="M32 17v16l12 7M32 10v3m0 38v3M10 32h3m38 0h3"/>',
  list:'<rect x="13" y="10" width="38" height="44" rx="7"/><path d="m20 23 3 3 5-6m-8 17 3 3 5-6m5-10h10m-10 14h10"/>',
  users:'<circle cx="24" cy="23" r="9"/><path d="M9 53v-7c0-10 30-10 30 0v7M42 14c12 0 12 18 0 18m4 7c6 1 9 4 9 9v5"/>',
  star:'<path d="m32 9 7 14 16 3-12 12 3 17-14-8-14 8 3-17L9 26l16-3 7-14Z"/>',
  letters:'<path d="M17 15v34m30-34v34M17 32h30"/>',
  basket:'<path d="m9 25 5 28h36l5-28H9Zm12 0 11-15 11 15M24 33v12m16-12v12"/>',
  number:'<rect x="12" y="9" width="40" height="46" rx="7"/><path d="M21 21h22M21 32h6m10 0h6m-22 12h6m10 0h6"/>',
  arrows:'<path d="M11 22h40m-10-10 10 10-10 10M53 44H13m10-10L13 44l10 10"/>',
  grid:'<rect x="10" y="10" width="44" height="44" rx="8"/><path d="M10 32h44M32 10v44"/><circle cx="21" cy="21" r="4" fill="currentColor" stroke="none"/>',
 };
 function symbolFor(title){const text=title.toLowerCase();if(text.includes('cancellazione'))return 'letters';if(text.includes('spesa'))return 'basket';if(/calcolo|cifrario|numeri/.test(text))return 'number';if(/alternata|shifting|contrario/.test(text))return 'arrows';if(/orologio|orientamento/.test(text))return 'clock';if(/visuo|immagine|riconoscimento|silhouette/.test(text))return 'visual';if(/parol|frase|letter|semantic|lingu/.test(text))return 'language';if(/memoria|back/.test(text))return 'memory';if(/relazion|intruso|logica/.test(text))return 'logic';if(text.includes('cerchi'))return 'grid';return 'focus';}
 function graphic(symbol,large){return `<svg viewBox="0 0 ${large?'112 88':'64 64'}" class="cl-dashboard-art" aria-hidden="true" focusable="false">${large?'<circle cx="60" cy="42" r="34" fill="currentColor" opacity=".08"/><path d="M12 17h12m-6-6v12M92 69h8" stroke="currentColor" stroke-width="2" opacity=".3"/><circle cx="91" cy="19" r="3" fill="currentColor" opacity=".35"/><g transform="translate(23 10)">':''}<g fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${symbols[symbol]||symbols.focus}</g>${large?'</g>':''}</svg>`;}
 document.querySelectorAll('.card').forEach(card=>{const host=card.querySelector('.card-image-container');if(!host)return;let file=card.dataset.file||'';try{file=decodeURIComponent(file);}catch{}host.innerHTML=window.CogniLabExerciseArtwork?.[file]||graphic(symbolFor(card.dataset.title||''),true);host.classList.add('cl-illustrated-icon');});
 document.querySelectorAll('.area-header').forEach(host=>{const icon=host.querySelector('i');if(!icon)return;const replacement=document.createElement('span');replacement.className='cl-area-icon';replacement.innerHTML=graphic(symbolFor(host.textContent),false);icon.replaceWith(replacement);});
 for(const [selector,symbol] of [['.kpi-card.users .kpi-icon','users'],['.kpi-card.done .kpi-icon','list'],['.kpi-card.satisfaction .kpi-icon','star']])document.querySelector(selector)?.replaceChildren(Object.assign(document.createElement('span'),{innerHTML:graphic(symbol,false)}));
})();
