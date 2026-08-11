/**
 * Hasene Arapça Dersi - Cüz Yolculuğu
 * 30 cüzlük kelime ilerleme haritası ve cüz bazlı oyun modu
 */

const JUZ_STORAGE_KEY = 'hasene_juz_completed';
const JUZ_BONUS_HASENE = 150;

/** Standart Mushaf cüz başlangıçları (sure:ayet) */
const JUZ_STARTS = [
    { surah: 1, ayah: 1 },
    { surah: 2, ayah: 142 },
    { surah: 2, ayah: 253 },
    { surah: 3, ayah: 93 },
    { surah: 3, ayah: 171 },
    { surah: 4, ayah: 24 },
    { surah: 4, ayah: 148 },
    { surah: 5, ayah: 82 },
    { surah: 6, ayah: 111 },
    { surah: 7, ayah: 88 },
    { surah: 8, ayah: 41 },
    { surah: 9, ayah: 93 },
    { surah: 11, ayah: 1 },
    { surah: 12, ayah: 1 },
    { surah: 12, ayah: 53 },
    { surah: 15, ayah: 1 },
    { surah: 17, ayah: 1 },
    { surah: 18, ayah: 75 },
    { surah: 20, ayah: 1 },
    { surah: 21, ayah: 1 },
    { surah: 23, ayah: 1 },
    { surah: 25, ayah: 21 },
    { surah: 27, ayah: 56 },
    { surah: 29, ayah: 46 },
    { surah: 33, ayah: 31 },
    { surah: 36, ayah: 28 },
    { surah: 39, ayah: 32 },
    { surah: 41, ayah: 47 },
    { surah: 46, ayah: 1 },
    { surah: 51, ayah: 31 }
];

const JUZ_META = [
    { surahs: 'Fatiha – Bakara' },
    { surahs: 'Bakara' },
    { surahs: 'Bakara – Âl-i İmrân' },
    { surahs: 'Âl-i İmrân' },
    { surahs: 'Âl-i İmrân – Nisâ' },
    { surahs: 'Nisâ' },
    { surahs: 'Nisâ – Mâide' },
    { surahs: 'Mâide – En\'âm' },
    { surahs: 'En\'âm – A\'râf' },
    { surahs: 'A\'râf – Enfâl' },
    { surahs: 'Enfâl – Tevbe' },
    { surahs: 'Tevbe – Yûnus' },
    { surahs: 'Hûd' },
    { surahs: 'Yûsuf' },
    { surahs: 'Yûsuf – Hicr' },
    { surahs: 'Hicr – İsrâ' },
    { surahs: 'İsrâ – Kehf' },
    { surahs: 'Kehf – Tâhâ' },
    { surahs: 'Tâhâ – Furkân' },
    { surahs: 'Furkân – Neml' },
    { surahs: 'Neml – Ankebût' },
    { surahs: 'Ahzâb – Yâsîn' },
    { surahs: 'Yâsîn – Zümer' },
    { surahs: 'Zümer – Fussilet' },
    { surahs: 'Fussilet – Ahkâf' },
    { surahs: 'Ahkâf – Zâriyât' },
    { surahs: 'Zâriyât – Hadîd' },
    { surahs: 'Hadîd – Tahrîm' },
    { surahs: 'Mulk – Murselât' },
    { surahs: 'Nebe\' – Nâs' }
];

let juzWordIndex = null;
let returnToJuzAfterGame = false;
let selectedJuzNumber = null;

function compareQuranPosition(a, b) {
    if (a.surah !== b.surah) return a.surah - b.surah;
    return a.ayah - b.ayah;
}

function parseWordPosition(wordId) {
    const parts = (wordId || '').split(':').map(Number);
    return { surah: parts[0] || 0, ayah: parts[1] || 0 };
}

function getJuzNumberFromWordId(wordId) {
    const pos = parseWordPosition(wordId);
    if (!pos.surah) return 0;
    for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
        if (compareQuranPosition(pos, JUZ_STARTS[i]) >= 0) {
            return i + 1;
        }
    }
    return 1;
}

function buildJuzWordIndex(kelimeData) {
    const index = Array.from({ length: 30 }, () => []);
    (kelimeData || []).forEach((word) => {
        if (!word || !word.id) return;
        const juz = getJuzNumberFromWordId(word.id);
        if (juz >= 1 && juz <= 30) {
            index[juz - 1].push(word.id);
        }
    });
    return index;
}

function ensureJuzWordIndex() {
    const data = window.kelimeData || [];
    if (!juzWordIndex || juzWordIndex.totalWords !== data.length) {
        juzWordIndex = buildJuzWordIndex(data);
        juzWordIndex.totalWords = data.length;
    }
    return juzWordIndex;
}

function getWordStatsRef() {
    if (typeof window.getJuzWordStats === 'function') {
        return window.getJuzWordStats();
    }
    try {
        const raw = localStorage.getItem('hasene_word_stats');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function isWordMastered(stats) {
    if (!stats || !stats.attempts) return false;
    const mastery = stats.masteryLevel || 0;
    const rate = stats.successRate || 0;
    return mastery >= 5 || (stats.attempts >= 2 && rate >= 70);
}

function isWordStudied(stats) {
    return !!(stats && stats.attempts > 0);
}

function getCompletedJuzList() {
    try {
        const raw = localStorage.getItem(JUZ_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.filter((n) => n >= 1 && n <= 30) : [];
    } catch (e) {
        return [];
    }
}

function saveCompletedJuzList(list) {
    localStorage.setItem(JUZ_STORAGE_KEY, JSON.stringify(list));
}

function getJuzProgress(juzNum) {
    const index = ensureJuzWordIndex();
    const wordIds = index[juzNum - 1] || [];
    const stats = getWordStatsRef();

    let studied = 0;
    let mastered = 0;

    wordIds.forEach((id) => {
        const s = stats[id];
        if (isWordStudied(s)) studied++;
        if (isWordMastered(s)) mastered++;
    });

    const total = wordIds.length;
    const studiedPercent = total ? Math.round((studied / total) * 100) : 0;
    const masteredPercent = total ? Math.round((mastered / total) * 100) : 0;

    return {
        juzNum,
        total,
        studied,
        mastered,
        studiedPercent,
        masteredPercent,
        completed: masteredPercent >= 100,
        meta: JUZ_META[juzNum - 1] || { surahs: '' }
    };
}

function getAllJuzProgress() {
    return Array.from({ length: 30 }, (_, i) => getJuzProgress(i + 1));
}

function getOverallJuzSummary() {
    const all = getAllJuzProgress();
    const completed = getCompletedJuzList().length;
    const totalWords = all.reduce((sum, j) => sum + j.total, 0);
    const masteredWords = all.reduce((sum, j) => sum + j.mastered, 0);
    const avgMastered = totalWords ? Math.round((masteredWords / totalWords) * 100) : 0;

    let recommended = 1;
    for (const j of all) {
        if (j.masteredPercent < 100) {
            recommended = j.juzNum;
            break;
        }
    }

    return { all, completed, totalWords, masteredWords, avgMastered, recommended };
}

function filterKelimeByJuz(words, juzNum) {
    if (!juzNum || juzNum < 1 || juzNum > 30) return words || [];
    return (words || []).filter((w) => getJuzNumberFromWordId(w.id) === juzNum);
}

function getJuzStatusClass(progress, completedList) {
    if (completedList.includes(progress.juzNum) || progress.completed) return 'juz-complete';
    if (progress.masteredPercent >= 50) return 'juz-advanced';
    if (progress.studiedPercent > 0) return 'juz-started';
    return 'juz-new';
}

function isNarrowMobile() {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 420px)').matches;
}

function createJuzProgressRing(percent, label, size = 'md') {
    const radius = size === 'lg' ? 26 : size === 'sm' ? 16 : 20;
    const view = size === 'lg' ? 64 : size === 'sm' ? 40 : 48;
    const center = view / 2;
    const circumference = 2 * Math.PI * radius;
    const safePct = Math.max(0, Math.min(100, percent || 0));
    const offset = circumference * (1 - safePct / 100);

    return `
        <div class="juz-ring-wrap juz-ring-${size}">
            <svg class="juz-ring" viewBox="0 0 ${view} ${view}" aria-hidden="true">
                <circle class="juz-ring-track" cx="${center}" cy="${center}" r="${radius}" />
                <circle class="juz-ring-progress" cx="${center}" cy="${center}" r="${radius}"
                    stroke-dasharray="${circumference.toFixed(2)}"
                    stroke-dashoffset="${offset.toFixed(2)}" />
            </svg>
            <span class="juz-ring-label">${label}</span>
        </div>`;
}

function renderJuzJourneyScreen() {
    const grid = document.getElementById('juz-journey-grid');
    const overallBar = document.getElementById('juz-overall-progress-bar');
    const overallText = document.getElementById('juz-overall-progress-text');
    const detailPanel = document.getElementById('juz-detail-panel');
    if (!grid) return;

    const summary = getOverallJuzSummary();
    const completedList = getCompletedJuzList();

    if (overallBar) {
        overallBar.style.width = `${summary.avgMastered}%`;
    }
    if (overallText) {
        overallText.textContent = isNarrowMobile()
            ? `${summary.completed}/30 cüz · %${summary.avgMastered}`
            : `${summary.completed}/30 cüz tamam · %${summary.avgMastered} genel ustalık`;
    }

    const heroRing = document.getElementById('juz-hero-ring-slot');
    if (heroRing) {
        heroRing.innerHTML = createJuzProgressRing(summary.avgMastered, `%${summary.avgMastered}`, 'lg');
    }

    const chipCompleted = document.getElementById('juz-chip-completed');
    const chipRecommended = document.getElementById('juz-chip-recommended');
    if (chipCompleted) {
        chipCompleted.textContent = `🏆 ${summary.completed} tamamlandı`;
    }
    if (chipRecommended) {
        chipRecommended.textContent = `✨ Önerilen: ${summary.recommended}. cüz`;
    }

    grid.innerHTML = summary.all.map((p) => {
        const status = getJuzStatusClass(p, completedList);
        const isRecommended = p.juzNum === summary.recommended && p.masteredPercent < 100;
        return `
            <button type="button" class="juz-card ${status}${isRecommended ? ' juz-recommended' : ''}"
                    data-juz="${p.juzNum}" onclick="selectJuzOnMap(${p.juzNum})" aria-label="Cüz ${p.juzNum}, %${p.masteredPercent} ustalık">
                ${isRecommended ? '<span class="juz-card-badge">Önerilen</span>' : ''}
                ${completedList.includes(p.juzNum) ? '<span class="juz-card-done" aria-label="Tamamlandı">✓</span>' : ''}
                ${createJuzProgressRing(p.masteredPercent, p.juzNum, 'sm')}
                <div class="juz-card-name">${p.meta.surahs}</div>
                <div class="juz-card-foot">
                    <span class="juz-card-pct">%${p.masteredPercent}</span>
                    <span class="juz-card-words">${p.mastered}/${p.total}</span>
                </div>
            </button>
        `;
    }).join('');

    if (detailPanel && !selectedJuzNumber) {
        detailPanel.classList.add('hidden');
    } else if (detailPanel && selectedJuzNumber) {
        updateJuzDetailPanel(selectedJuzNumber);
    }

    updateJuzMainMenuWidget();
}

function updateJuzDetailPanel(juzNum) {
    const panel = document.getElementById('juz-detail-panel');
    if (!panel) return;

    const p = getJuzProgress(juzNum);
    selectedJuzNumber = juzNum;

    document.getElementById('juz-detail-title').textContent = `${juzNum}. Cüz · ${p.meta.surahs}`;
    document.getElementById('juz-detail-hint').textContent = `${p.total} kelime`;
    document.getElementById('juz-detail-stats').textContent =
        `${p.mastered}/${p.total} kelime ustalaşıldı · ${p.studied} kelime çalışıldı`;
    document.getElementById('juz-detail-progress-bar').style.width = `${p.masteredPercent}%`;
    document.getElementById('juz-detail-progress-text').textContent = `%${p.masteredPercent}`;

    const detailRing = document.getElementById('juz-detail-ring-slot');
    if (detailRing) {
        detailRing.innerHTML = createJuzProgressRing(p.masteredPercent, juzNum, 'md');
    }

    const completedList = getCompletedJuzList();
    const bonusEl = document.getElementById('juz-detail-bonus');
    if (bonusEl) {
        if (completedList.includes(juzNum) || p.completed) {
            bonusEl.textContent = '✅ Bu cüz tamamlandı — tebrikler!';
        } else {
            bonusEl.textContent = `🎁 %100 olunca +${JUZ_BONUS_HASENE} Hasene bonus`;
        }
    }

    panel.dataset.juz = String(juzNum);
    panel.classList.remove('hidden');

    document.querySelectorAll('.juz-card').forEach((card) => {
        card.classList.toggle('juz-selected', parseInt(card.dataset.juz, 10) === juzNum);
    });
}

function selectJuzOnMap(juzNum) {
    updateJuzDetailPanel(juzNum);
    document.getElementById('juz-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function openJuzJourney() {
    if (typeof loadKelimeData === 'function') {
        loadKelimeData().then(() => {
            juzWordIndex = null;
            selectedJuzNumber = null;
            renderJuzJourneyScreen();
        });
    } else {
        renderJuzJourneyScreen();
    }

    if (typeof showOnlyScreen === 'function') {
        showOnlyScreen('juz-journey-screen');
    }
}

function goToJuzJourney(skipWarning) {
    if (typeof goToMainMenu === 'function' && !skipWarning) {
        const onJuzScreen = !document.getElementById('juz-journey-screen')?.classList.contains('hidden');
        if (!onJuzScreen) {
            goToMainMenu(true);
        }
    }
    openJuzJourney();
}

async function startJuzPractice(juzNum) {
    if (!juzNum || juzNum < 1 || juzNum > 30) return;

    if (typeof loadKelimeData === 'function') {
        await loadKelimeData();
    }

    const progress = getJuzProgress(juzNum);
    if (progress.total < 5) {
        if (typeof showToast === 'function') {
            showToast('Bu cüzde yeterli kelime bulunamadı', 'error');
        }
        return;
    }

    returnToJuzAfterGame = true;
    selectedJuzNumber = juzNum;

    if (typeof startKelimeCevirGame === 'function') {
        await startKelimeCevirGame(`juz-${juzNum}`);
    }
}

function showJuzCompleteModal(juzNum, bonus) {
    const meta = JUZ_META[juzNum - 1];
    const title = document.getElementById('juz-complete-title');
    const desc = document.getElementById('juz-complete-desc');
    const bonusEl = document.getElementById('juz-complete-bonus');

    if (title) title.textContent = `🎉 ${juzNum}. Cüz Tamamlandı!`;
    if (desc) desc.textContent = `${juzNum}. Cüz (${meta?.surahs || ''}) kelimelerinin tamamını ustalaştın.`;
    if (bonusEl) bonusEl.textContent = `+${bonus} Hasene bonus kazandın!`;

    if (typeof openModal === 'function') {
        openModal('juz-complete-modal');
    }
}

function checkJuzRewardsAfterGame(juzNum) {
    if (!juzNum) return;

    juzWordIndex = null;
    const progress = getJuzProgress(juzNum);
    if (!progress.completed) {
        updateJuzMainMenuWidget();
        return;
    }

    const completed = getCompletedJuzList();
    if (completed.includes(juzNum)) {
        updateJuzMainMenuWidget();
        return;
    }

    completed.push(juzNum);
    completed.sort((a, b) => a - b);
    saveCompletedJuzList(completed);

    if (typeof addBonusHasene === 'function') {
        addBonusHasene(JUZ_BONUS_HASENE, `${juzNum}. cüz tamamlandı`);
    }

    showJuzCompleteModal(juzNum, JUZ_BONUS_HASENE);

    if (typeof window.onJuzCompleted === 'function') {
        window.onJuzCompleted(juzNum);
    }

    updateJuzMainMenuWidget();
}

function updateJuzMainMenuWidget() {
    const card = document.getElementById('juz-journey-card');
    const subtitle = document.getElementById('juz-journey-card-progress');
    if (!card || !subtitle) return;

    const summary = getOverallJuzSummary();
    subtitle.textContent = isNarrowMobile()
        ? `${summary.completed}/30 cüz · %${summary.avgMastered} · Öneri: ${summary.recommended}. cüz`
        : `${summary.completed}/30 cüz · %${summary.avgMastered} genel ilerleme · Önerilen: ${summary.recommended}. cüz`;
}

function closeResultAndReturnToJuz() {
    returnToJuzAfterGame = false;
    if (typeof closeModal === 'function') {
        closeModal('game-result-modal');
    }
    if (typeof cancelDailyPlan === 'function') {
        cancelDailyPlan();
    }
    openJuzJourney();
}

function shouldReturnToJuzAfterGame() {
    return returnToJuzAfterGame;
}

function clearJuzReturnFlag() {
    returnToJuzAfterGame = false;
}

function invalidateJuzWordIndex() {
    juzWordIndex = null;
}

if (typeof window !== 'undefined') {
    window.getJuzNumberFromWordId = getJuzNumberFromWordId;
    window.filterKelimeByJuz = filterKelimeByJuz;
    window.getJuzProgress = getJuzProgress;
    window.getAllJuzProgress = getAllJuzProgress;
    window.getOverallJuzSummary = getOverallJuzSummary;
    window.getCompletedJuzCount = () => getCompletedJuzList().length;
    window.openJuzJourney = openJuzJourney;
    window.goToJuzJourney = goToJuzJourney;
    window.startJuzPractice = startJuzPractice;
    window.selectJuzOnMap = selectJuzOnMap;
    window.renderJuzJourneyScreen = renderJuzJourneyScreen;
    window.checkJuzRewardsAfterGame = checkJuzRewardsAfterGame;
    window.updateJuzMainMenuWidget = updateJuzMainMenuWidget;
    window.closeResultAndReturnToJuz = closeResultAndReturnToJuz;
    window.shouldReturnToJuzAfterGame = shouldReturnToJuzAfterGame;
    window.clearJuzReturnFlag = clearJuzReturnFlag;
    window.invalidateJuzWordIndex = invalidateJuzWordIndex;
}
