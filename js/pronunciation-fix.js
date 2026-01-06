/**
 * Pronunciation Fix System (Temporary Tool)
 * Oyun sırasında yanlış okunuşları düzeltmek için geçici araç
 */

// Düzeltmeleri sakla
let pronunciationFixes = [];

/**
 * Load pronunciation fixes from localStorage
 */
function loadPronunciationFixes() {
    const saved = localStorage.getItem('pronunciation_fixes');
    if (saved) {
        try {
            pronunciationFixes = JSON.parse(saved);
            console.log(`📝 ${pronunciationFixes.length} okunuş düzeltmesi yüklendi`);
        } catch (e) {
            pronunciationFixes = [];
        }
    }
    updateFixCount();
}

/**
 * Save pronunciation fixes to localStorage
 */
function savePronunciationFixesToStorage() {
    localStorage.setItem('pronunciation_fixes', JSON.stringify(pronunciationFixes));
    console.log(`💾 ${pronunciationFixes.length} düzeltme kaydedildi`);
    updateFixCount();
}

/**
 * Update fix count display
 */
function updateFixCount() {
    const countEl = document.getElementById('fix-count');
    const countModalEl = document.getElementById('fix-count-modal');
    const count = pronunciationFixes.length;
    
    if (countEl) {
        countEl.textContent = count;
    }
    if (countModalEl) {
        countModalEl.textContent = count;
    }
}

/**
 * Show fix pronunciation modal
 */
function showFixPronunciationModal() {
    if (!currentQuestion) {
        showToast('Önce bir soru yüklenmelidir', 'error');
        return;
    }
    
    const arabicWord = currentQuestion.kelime || currentQuestion.harf || '';
    const currentOkunus = currentQuestion.okunus || '';
    const meaning = currentQuestion.anlam || '';
    
    // Modal'ı doldur
    document.getElementById('fix-arabic-word').textContent = arabicWord;
    document.getElementById('fix-word-meaning').textContent = meaning;
    document.getElementById('fix-current-okunus').textContent = currentOkunus;
    document.getElementById('fix-new-okunus').value = '';
    
    // Modal'ı aç
    openModal('fix-pronunciation-modal');
    
    // Input'a focus
    setTimeout(() => {
        document.getElementById('fix-new-okunus').focus();
    }, 100);
}

/**
 * Save pronunciation fix
 */
function savePronunciationFix() {
    const arabicWord = document.getElementById('fix-arabic-word').textContent;
    const currentOkunus = document.getElementById('fix-current-okunus').textContent;
    const newOkunus = document.getElementById('fix-new-okunus').value.trim();
    const meaning = document.getElementById('fix-word-meaning').textContent;
    
    if (!newOkunus) {
        showToast('Lütfen doğru okunuşu yazın', 'error');
        return;
    }
    
    if (newOkunus === currentOkunus) {
        showToast('Yeni okunuş eskisiyle aynı', 'info');
        return;
    }
    
    // Düzeltmeyi ekle
    const fix = {
        kelime: arabicWord,
        oldOkunus: currentOkunus,
        newOkunus: newOkunus,
        anlam: meaning,
        timestamp: new Date().toISOString(),
        submode: currentElifBaSubmode || 'unknown'
    };
    
    // Aynı kelime varsa güncelle, yoksa ekle
    const existingIndex = pronunciationFixes.findIndex(f => f.kelime === arabicWord);
    if (existingIndex >= 0) {
        pronunciationFixes[existingIndex] = fix;
        showToast(`"${arabicWord}" düzeltmesi güncellendi`, 'success');
    } else {
        pronunciationFixes.push(fix);
        showToast(`"${arabicWord}" düzeltmesi kaydedildi`, 'success');
    }
    
    // Kaydet
    savePronunciationFixesToStorage();
    
    // Modal'ı kapat
    closeModal('fix-pronunciation-modal');
    
    console.log(`✅ Düzeltme kaydedildi: ${arabicWord} → "${currentOkunus}" ⟹ "${newOkunus}"`);
}

/**
 * Export pronunciation fixes to JSON file
 */
function exportPronunciationFixes() {
    if (pronunciationFixes.length === 0) {
        showToast('Henüz düzeltme yok', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(pronunciationFixes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pronunciation-fixes.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    showToast(`${pronunciationFixes.length} düzeltme indirildi`, 'success');
    console.log(`📥 ${pronunciationFixes.length} düzeltme dışa aktarıldı`);
}

/**
 * Clear all pronunciation fixes
 */
function clearPronunciationFixes() {
    if (pronunciationFixes.length === 0) {
        showToast('Henüz düzeltme yok', 'info');
        return;
    }
    
    if (!confirm(`${pronunciationFixes.length} düzeltmeyi silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    pronunciationFixes = [];
    savePronunciationFixesToStorage();
    showToast('Tüm düzeltmeler silindi', 'success');
}

// Enter tuşu ile kaydet
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !document.getElementById('fix-pronunciation-modal').classList.contains('hidden')) {
        savePronunciationFix();
    }
});

// Sayfa yüklendiğinde düzeltmeleri yükle
loadPronunciationFixes();

// Console'dan erişim için
window.exportPronunciationFixes = exportPronunciationFixes;
window.clearPronunciationFixes = clearPronunciationFixes;
window.showFixPronunciationModal = showFixPronunciationModal;
window.savePronunciationFix = savePronunciationFix;

console.log('🔧 Okunuş Düzeltme Sistemi yüklendi');
console.log('📝 Düzeltmeleri indirmek için: exportPronunciationFixes()');
console.log('🗑️ Düzeltmeleri silmek için: clearPronunciationFixes()');

