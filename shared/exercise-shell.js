(() => {
  'use strict';
  const controls=document.getElementById('cl-focus-controls');
  controls.onclick=()=>{const open=document.body.classList.toggle('cl-show-controls');controls.setAttribute('aria-expanded',String(open));controls.textContent=open?'Nascondi comandi':'Mostra comandi';};
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==document.getElementById('exercise-frame').contentWindow||event.data?.type!=='cognilab-exercise-state')return;document.body.classList.toggle('cl-running',event.data.running===true);document.body.classList.remove('cl-show-controls');controls.setAttribute('aria-expanded','false');controls.textContent='Mostra comandi';});
  const frame = document.getElementById('exercise-frame');
  const error = document.getElementById('cl-load-error');
  const title = document.getElementById('cl-exercise-title');
  const direct = document.getElementById('cl-direct-link');
  document.body.classList.add('loaded');
  const showError = message => { error.textContent = message; error.hidden = false; };
  // Catalog URLs used to double-encode filenames; accept that legacy format.
  function resolveFile(value) {
    if (!value) return null;
    for (let pass = 0; pass < 3; pass++) {
      const found = window.CogniLabCatalog.find(item => item.file === value);
      if (found) return found;
      try { const decoded = decodeURIComponent(value); if (decoded === value) break; value = decoded; }
      catch { break; }
    }
    return null;
  }
  const param = new URLSearchParams(location.search).get('file');
  const exercise = param === null ? window.CogniLabCatalog[0] : resolveFile(param);
  if (!exercise) {
    title.textContent = 'Esercizio non disponibile';
    showError('Il collegamento non corrisponde a un esercizio di CogniLab. Torna alla dashboard e seleziona un’attività.');
    frame.hidden = true;
  } else {
    title.textContent = exercise.title;
    document.title = exercise.title + ' | CogniLab';
    direct.href = encodeURI(exercise.file).replace(/#/g, '%23');
    direct.target = '_blank'; direct.rel = 'noopener'; direct.hidden = false;
    frame.title = exercise.title;
    const timeout = setTimeout(() => showError('Il caricamento sta richiedendo più tempo del previsto. Puoi aprire l’esercizio a schermo intero dal collegamento qui sopra.'), 15000);
    frame.addEventListener('load', () => { clearTimeout(timeout); frame.classList.add('loaded'); error.hidden = true; });
    frame.addEventListener('error', () => { clearTimeout(timeout); showError('Impossibile caricare l’esercizio. Torna alla dashboard e riprova.'); });
    // Same-origin, catalog-only targets; no arbitrary remote iframe URLs.
    frame.src = direct.getAttribute('href') + (new URLSearchParams(location.search).has('configure')?'?configure=1':'');
  }
  const username = localStorage.getItem('hub_username') || 'Ospite';
  document.getElementById('user-display').textContent = (localStorage.getItem('hub_mode') === 'clinical' ? 'Clinico: ' : 'Utente: ') + username;
  function updateTimer() {
    let start = Number(localStorage.getItem('global_timer_start'));
    if (!Number.isFinite(start) || start <= 0 || start > Date.now()) {
      start = Date.now(); localStorage.setItem('global_timer_start', String(start));
    }
    const elapsed = Math.floor((Date.now() - start) / 1000);
    document.getElementById('global-timer').textContent = [Math.floor(elapsed/3600), Math.floor(elapsed/60)%60, elapsed%60].map(n => String(n).padStart(2,'0')).join(':');
  }
  updateTimer(); const interval = setInterval(updateTimer, 1000);
  window.addEventListener('pagehide', () => clearInterval(interval), {once:true});
  window.tornaAllaDashboard = event => { event.preventDefault(); location.href = 'esercizi.html'; };
  window.terminaSessioneGlobale = () => {
    if (!confirm('Vuoi concludere l’allenamento di oggi e tornare alla schermata principale?')) return;
    location.href = 'esercizi.html?feedback=1';
  };
})();
