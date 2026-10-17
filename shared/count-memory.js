// Native logic for the previously empty number/letter exercise.
let exposureTimeout;
let countPhase = 'setup';
function switchScreen(_from, target) {
    document.querySelectorAll('.glass').forEach(screen => screen.classList.add('screen-hidden'));
    if (target) document.getElementById(target).classList.remove('screen-hidden');
}
function initGame() {
    window.CogniLabRun?.begin();
    clearTimeout(exposureTimeout);
    currentLevel = 1; lives = 3;
    stats = {maxLevel:1,totalStimuli:0,correctResponses:0,totalAttempts:0,errors:0,correctNums:0,totalNums:0,correctLets:0,totalLets:0};
    config.useColors = document.getElementById('use-colors').checked;
    config.baseTime = Number(document.getElementById('exposure-time').value) * 1000;
    startGame();
}
function updateLivesUI() {
    document.getElementById('lives-display').textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
    document.getElementById('lives-display').setAttribute('aria-label', lives + ' vite rimaste');
}
function startGame() {
    clearTimeout(exposureTimeout);
    if (lives <= 0) return showFinalSummary();
    countPhase = 'exposure';
    switchScreen(null, null);
    document.getElementById('hud').style.opacity = '1';
    document.getElementById('level-text').textContent = 'LIVELLO ' + currentLevel;
    updateLivesUI();
    stats.maxLevel = Math.max(stats.maxLevel, currentLevel);
    const area = document.getElementById('game-area');
    area.replaceChildren(); area.classList.remove('hidden'); area.style.opacity = '1';
    area.style.display = 'grid'; area.style.gridTemplateColumns = 'repeat(4, 1fr)';
    area.style.alignContent = 'center'; area.style.gap = '14px'; area.style.padding = '90px 24px 24px';
    countNumbers = 0; countLetters = 0;
    const total = Math.min(24, currentLevel + 3);
    // Both stimulus types always appear; shuffle their positions without overlap.
    const types = [true, false, ...Array.from({length:total-2}, () => Math.random() < .5)];
    for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); [types[i],types[j]] = [types[j],types[i]];
    }
    for (const numeric of types) {
        numeric ? countNumbers++ : countLetters++;
        const stimulus = document.createElement('span'); stimulus.className = 'stimulus';
        stimulus.style.position = 'static'; stimulus.style.textAlign = 'center';
        stimulus.style.fontSize = 'clamp(28px, 7vw, 52px)';
        stimulus.style.color = config.useColors ? (numeric ? '#60a5fa' : '#c084fc') : '#f8fafc';
        stimulus.textContent = numeric ? String(Math.floor(Math.random()*10)) : 'ABCDEFGHLMNPRSTV'[Math.floor(Math.random()*15)];
        area.append(stimulus);
    }
    stats.totalStimuli += total;
    document.getElementById('input-numbers').value = '';
    document.getElementById('input-letters').value = '';
    exposureTimeout = setTimeout(() => {
        if (countPhase !== 'exposure') return;
        area.classList.add('hidden'); area.style.display = 'none';
        countPhase = 'answer'; switchScreen(null, 'answer-screen');
        document.getElementById('input-numbers').focus();
    }, config.baseTime);
}
function checkAnswers() {
    if (countPhase !== 'answer') return;
    const inputs = ['input-numbers','input-letters'].map(id => document.getElementById(id));
    if (inputs.some(input => input.value.trim() === '' || !Number.isInteger(Number(input.value)) || Number(input.value) < 0)) {
        inputs.find(input => input.value.trim() === '' || !Number.isInteger(Number(input.value)) || Number(input.value) < 0)?.focus();
        document.getElementById('answer-validation').textContent = 'Inserisci due numeri interi maggiori o uguali a zero.';
        return;
    }
    document.getElementById('answer-validation').textContent = '';
    countPhase = 'result';
    const correctNumber = Number(inputs[0].value) === countNumbers;
    const correctLetter = Number(inputs[1].value) === countLetters;
    const correct = Number(correctNumber) + Number(correctLetter);window.CogniLabAudio?.feedback(correct===2);
    stats.totalAttempts += 2; stats.correctResponses += correct; stats.errors += 2 - correct;
    stats.totalNums++; stats.totalLets++; stats.correctNums += Number(correctNumber); stats.correctLets += Number(correctLetter);
    if (correct < 2) lives--;
    updateLivesUI();
    document.getElementById('result-title').textContent = correct === 2 ? 'Risposta corretta!' : 'Riproviamo con calma';
    document.getElementById('result-details').textContent = `Numeri: ${countNumbers}. Lettere: ${countLetters}. Risposte corrette: ${correct} su 2.`;
    document.getElementById('next-btn').classList.toggle('hidden', correct < 2);
    document.getElementById('retry-btn').classList.toggle('hidden', correct === 2 || lives === 0);
    document.getElementById('final-stats-btn').classList.remove('hidden');
    switchScreen(null, 'result-screen');
}
window.addEventListener('pagehide', () => clearTimeout(exposureTimeout));
