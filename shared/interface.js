(() => {
  'use strict';
  const ready = () => {
    if (document.body.dataset.cognilab === 'exercise') {
      const panelIds = ['main-menu','menu-screen','menuScreen','start-screen','setup-screen','settings-screen','config-screen','result-screen','resultScreen','results-screen','summary-screen','step-results'];
      panelIds.forEach(id => document.getElementById(id)?.classList.add('cl-panel'));
      return;
    }
    const cards = [...document.querySelectorAll('.card[data-file]')];
    if (!cards.length) return;
    // Catalog navigation is available even if the Firebase module fails to load.
    window.openExerciseCard ??= (card, event) => {
      if (event?.target.closest('input,label,button,a')) return;
      const file = decodeURIComponent(card.dataset.file);
      location.href = 'esercizio.html?file=' + encodeURIComponent(file);
    };
    cards.forEach(card => {
      card.tabIndex = 0;
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', 'Apri ' + card.dataset.title);
      const checkbox = card.querySelector('input[type=checkbox]');
      checkbox?.setAttribute('aria-label', 'Aggiungi ' + card.dataset.title + ' alla sequenza');
      card.addEventListener('keydown', event => {
        if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault(); window.openExerciseCard(card, event);
        }
      });
    });
    const search = document.createElement('div');
    search.className = 'cl-search';
    search.innerHTML = '<label for="cl-search-input">Trova il tuo esercizio<input id="cl-search-input" type="search" placeholder="Cerca per nome o area cognitiva…" autocomplete="off"></label><p id="cl-search-count" role="status" aria-live="polite"></p>';
    const first = document.querySelector('.area-sezione');
    first.before(search);
    const empty = document.createElement('p');
    empty.className = 'cl-empty'; empty.textContent = 'Nessun esercizio trovato. Prova un altro nome o un’area cognitiva.'; empty.hidden = true;
    search.after(empty);
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filter = () => {
      const words = normalize(search.querySelector('input').value).trim().split(/\s+/);
      let count = 0;
      cards.forEach(card => {
        const text = normalize(card.dataset.title + ' ' + card.closest('section')?.querySelector('h2')?.textContent);
        card.hidden = !words.every(word => text.includes(word));
        if (!card.hidden) count++;
      });
      document.querySelectorAll('.area-sezione').forEach(section => { section.hidden = ![...section.querySelectorAll('.card')].some(card => !card.hidden); });
      document.getElementById('cl-search-count').textContent = `${count} di ${cards.length} esercizi`;
      empty.hidden = count !== 0;
    };
    search.querySelector('input').addEventListener('input', filter); filter();
    // A sample number must never appear as a measured usage statistic.
    const users = document.getElementById('kpi-utenti');
    if (users?.textContent === '145') users.textContent = '—';
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
