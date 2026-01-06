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
 * Automatically downloads the file (no prompt)
 */
function exportPronunciationFixes() {
    if (pronunciationFixes.length === 0) {
        showToast('Henüz düzeltme yok', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(pronunciationFixes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Try to use File System Access API if available (Chrome/Edge)
    if ('showSaveFilePicker' in window) {
        (async () => {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'pronunciation-fixes.json',
                    types: [{
                        description: 'JSON dosyası',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(dataStr);
                await writable.close();
                
                // Clean up URL after successful save
                URL.revokeObjectURL(url);
                
                showToast(`${pronunciationFixes.length} düzeltme kaydedildi!`, 'success');
                console.log(`📥 ${pronunciationFixes.length} düzeltme kaydedildi: pronunciation-fixes.json`);
            } catch (err) {
                // User cancelled or error occurred, fallback to download
                if (err.name !== 'AbortError') {
                    console.warn('File System Access API hatası, fallback kullanılıyor:', err);
                }
                downloadFile(url);
            }
        })();
    } else {
        // Fallback: Traditional download
        downloadFile(url);
    }
    
    function downloadFile(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pronunciation-fixes.json';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up after click
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Note: Browser may still ask for location if settings require it
        showToast(`${pronunciationFixes.length} düzeltme indirildi! Downloads klasörüne kaydedildi.`, 'success', 4000);
        console.log(`📥 ${pronunciationFixes.length} düzeltme dışa aktarıldı: pronunciation-fixes.json`);
        console.log('💡 İpucu: İndirilen dosyayı proje klasörüne (root) kopyalayın');
    }
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

/**
 * Apply pronunciation fixes and export updated data files automatically
 * Tek butonla tüm işlemi yapar: düzeltmeleri uygular ve güncellenmiş dosyaları indirir
 */
async function applyAndExportPronunciationFixes() {
    if (pronunciationFixes.length === 0) {
        showToast('Henüz düzeltme yok', 'info');
        return;
    }
    
    showToast(`${pronunciationFixes.length} düzeltme uygulanıyor ve güncellenmiş dosyalar hazırlanıyor...`, 'info', 5000);
    console.log(`🔨 ${pronunciationFixes.length} düzeltme otomatik olarak uygulanıyor...`);
    
    // Önce data'ları yükle
    if (typeof window.preloadAllData === 'function') {
        console.log('📦 Tüm datalar yükleniyor...');
        await window.preloadAllData();
        console.log('✅ Datalar yüklendi');
    }
    
    // Düzeltmeleri uygula ve güncellenmiş dosyaları hazırla
    const results = await applyFixesFromArray(pronunciationFixes);
    
    if (results.applied > 0 || Object.keys(results.updatedFiles).length > 0) {
        showToast(`${results.applied} düzeltme uygulandı! Güncellenmiş data dosyaları indiriliyor...`, 'success', 5000);
        
        // Güncellenmiş data dosyalarını indir
        await exportUpdatedDataFiles(results.updatedFiles);
        
        showToast(`✅ Tamamlandı! ${Object.keys(results.updatedFiles).length} dosya indirildi. Proje klasörüne kopyalayın.`, 'success', 6000);
    } else {
        showToast(`Hiçbir düzeltme uygulanamadı (${results.notFound} kelime bulunamadı)`, 'warning');
    }
}

/**
 * Apply pronunciation fixes to data arrays (runtime)
 * This function applies fixes to loaded data in memory
 */
async function applyPronunciationFixesToData() {
    if (pronunciationFixes.length === 0) {
        showToast('Henüz düzeltme yok', 'info');
        return;
    }
    
    console.log(`🔨 ${pronunciationFixes.length} düzeltme uygulanıyor...`);
    
    // Önce tüm data'ları yükle (eğer yüklenmemişse)
    if (typeof window.preloadAllData === 'function') {
        console.log('📦 Tüm datalar yükleniyor...');
        await window.preloadAllData();
        console.log('✅ Datalar yüklendi');
    } else {
        // Fallback: Sadece gerekli data'ları yükle
        const loadFunctions = [
            { name: 'ucHarfliKelimeler', fn: window.loadUcHarfliKelimelerData },
            { name: 'uzatmaMed', fn: window.loadUzatmaMedData },
            { name: 'kelime', fn: window.loadKelimeData },
            { name: 'harf', fn: window.loadHarfData },
            { name: 'ustn', fn: window.loadUstnData },
            { name: 'esre', fn: window.loadEsreData },
            { name: 'otre', fn: window.loadOtreData },
            { name: 'sedde', fn: window.loadSeddeData },
            { name: 'cezm', fn: window.loadCezmData },
            { name: 'tenvin', fn: window.loadTenvinData }
        ];
        
        for (const { name, fn } of loadFunctions) {
            if (typeof fn === 'function') {
                try {
                    await fn();
                } catch (e) {
                    console.warn(`⚠️ ${name} yüklenemedi:`, e);
                }
            }
        }
    }
    
    let appliedCount = 0;
    let notFoundCount = 0;
    const dataArrays = [
        { name: 'kelimeData', data: window.kelimeData || [] },
        { name: 'ucHarfliKelimelerData', data: window.ucHarfliKelimelerData || [] },
        { name: 'uzatmaMedData', data: window.uzatmaMedData || [] },
        { name: 'harfData', data: window.harfData || [] },
        { name: 'ustnData', data: window.ustnData || [] },
        { name: 'esreData', data: window.esreData || [] },
        { name: 'otreData', data: window.otreData || [] },
        { name: 'seddeData', data: window.seddeData || [] },
        { name: 'cezmData', data: window.cezmData || [] },
        { name: 'tenvinData', data: window.tenvinData || [] }
    ];
    
    // Debug: Data array'lerinin durumunu göster
    console.log('📊 Data array durumu:');
    dataArrays.forEach(({ name, data }) => {
        console.log(`  ${name}: ${Array.isArray(data) ? data.length : 'undefined'} öğe`);
    });
    
    pronunciationFixes.forEach((fix, fixIndex) => {
        let found = false;
        console.log(`\n🔍 Düzeltme ${fixIndex + 1}: "${fix.kelime}" (${fix.submode})`);
        console.log(`   Eski: "${fix.oldOkunus}" → Yeni: "${fix.newOkunus}"`);
        
        dataArrays.forEach(({ name, data }) => {
            if (Array.isArray(data) && data.length > 0) {
                const item = data.find(item => {
                    const itemKelime = item.kelime || item.harf || '';
                    return itemKelime === fix.kelime;
                });
                
                if (item) {
                    console.log(`   ✅ ${name} içinde bulundu`);
                    console.log(`   Mevcut okunuş: "${item.okunus}"`);
                    
                    // Okunuş eşleşmesi kontrolü - hem oldOkunus hem de mevcut okunuşu kontrol et
                    if (item.okunus === fix.oldOkunus) {
                        item.okunus = fix.newOkunus;
                        appliedCount++;
                        found = true;
                        console.log(`   ✅ Düzeltme uygulandı: "${fix.oldOkunus}" → "${fix.newOkunus}"`);
                    } else if (item.okunus === fix.newOkunus) {
                        // Zaten yeni okunuş uygulanmış
                        console.log(`   ℹ️ Düzeltme zaten uygulanmış: "${item.okunus}"`);
                        found = true; // Bulundu ama zaten uygulanmış
                    } else {
                        console.log(`   ⚠️ Okunuş eşleşmedi: "${item.okunus}" ≠ "${fix.oldOkunus}"`);
                        // Okunuş eşleşmese bile kelime bulundu
                        found = true;
                    }
                }
            }
        });
        
        if (!found) {
            notFoundCount++;
            console.log(`   ❌ Kelime hiçbir data array'inde bulunamadı`);
        }
    });
    
    if (appliedCount > 0) {
        showToast(`${appliedCount} düzeltme uygulandı!${notFoundCount > 0 ? ` (${notFoundCount} bulunamadı)` : ''}`, 'success');
        console.log(`\n✅ Toplam ${appliedCount} düzeltme uygulandı`);
        if (notFoundCount > 0) {
            console.log(`⚠️ ${notFoundCount} düzeltme uygulanamadı (kelimeler bulunamadı)`);
        }
    } else {
        showToast(`Hiçbir düzeltme uygulanamadı${notFoundCount > 0 ? ` (${notFoundCount} kelime bulunamadı)` : ''}`, 'warning');
        console.log(`\n❌ Hiçbir düzeltme uygulanamadı`);
    }
}

// Wrapper function for HTML onclick (handles async)
function applyPronunciationFixesToDataWrapper() {
    if (typeof applyPronunciationFixesToData === 'function') {
        applyPronunciationFixesToData().catch(err => {
            console.error('❌ Düzeltme uygulama hatası:', err);
            if (typeof showToast === 'function') {
                showToast('Düzeltme uygulanırken hata oluştu: ' + err.message, 'error');
            }
        });
    } else {
        console.error('❌ applyPronunciationFixesToData fonksiyonu bulunamadı');
        if (typeof showToast === 'function') {
            showToast('Düzeltme fonksiyonu yüklenmedi. Sayfayı yenileyin.', 'error');
        }
    }
}

/**
 * Import pronunciation fixes from JSON file and apply to data
 * Kullanıcı pronunciation-fixes.json dosyasını seçer, düzeltmeler uygulanır ve güncellenmiş data dosyaları indirilir
 */
async function importAndApplyPronunciationFixes() {
    // File input oluştur
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const fixes = JSON.parse(text);
            
            if (!Array.isArray(fixes)) {
                showToast('Geçersiz dosya formatı! Array olmalı.', 'error');
                return;
            }
            
            if (fixes.length === 0) {
                showToast('Dosyada düzeltme yok!', 'info');
                return;
            }
            
            showToast(`${fixes.length} düzeltme yüklendi, uygulanıyor...`, 'info');
            console.log(`📥 ${fixes.length} düzeltme dosyadan yüklendi`);
            
            // Önce data'ları yükle
            if (typeof window.preloadAllData === 'function') {
                await window.preloadAllData();
            }
            
            // Düzeltmeleri uygula
            const results = await applyFixesFromArray(fixes);
            
            // Sonuçları göster
            if (results.applied > 0) {
                showToast(`${results.applied} düzeltme uygulandı! Güncellenmiş data dosyaları indiriliyor...`, 'success', 5000);
                
                // Güncellenmiş data dosyalarını indir
                await exportUpdatedDataFiles(results.updatedFiles);
            } else {
                showToast(`Hiçbir düzeltme uygulanamadı (${results.notFound} kelime bulunamadı)`, 'warning');
            }
            
        } catch (error) {
            console.error('❌ Dosya okuma hatası:', error);
            showToast('Dosya okunamadı: ' + error.message, 'error');
        } finally {
            document.body.removeChild(input);
        }
    };
    
    document.body.appendChild(input);
    input.click();
}

/**
 * Apply fixes from array to data arrays
 */
async function applyFixesFromArray(fixes) {
    const results = {
        applied: 0,
        notFound: 0,
        alreadyApplied: 0,
        updatedFiles: {}
    };
    
    const dataArrays = [
        { name: 'kelimeData', data: window.kelimeData || [], file: 'kelimebul.json' },
        { name: 'ucHarfliKelimelerData', data: window.ucHarfliKelimelerData || [], file: 'uc_harfli_kelimeler.json' },
        { name: 'uzatmaMedData', data: window.uzatmaMedData || [], file: 'uzatma_med.json' },
        { name: 'harfData', data: window.harfData || [], file: 'harf.json' },
        { name: 'ustnData', data: window.ustnData || [], file: 'ustn.json' },
        { name: 'esreData', data: window.esreData || [], file: 'esre.json' },
        { name: 'otreData', data: window.otreData || [], file: 'otre.json' },
        { name: 'seddeData', data: window.seddeData || [], file: 'sedde.json' },
        { name: 'cezmData', data: window.cezmData || [], file: 'cezm.json' },
        { name: 'tenvinData', data: window.tenvinData || [], file: 'tenvin.json' }
    ];
    
    fixes.forEach((fix, fixIndex) => {
        let found = false;
        
        dataArrays.forEach(({ name, data, file }) => {
            if (Array.isArray(data) && data.length > 0) {
                const item = data.find(item => {
                    const itemKelime = item.kelime || item.harf || '';
                    return itemKelime === fix.kelime;
                });
                
                if (item) {
                    if (item.okunus === fix.oldOkunus) {
                        item.okunus = fix.newOkunus;
                        results.applied++;
                        found = true;
                        
                        // Güncellenmiş dosyayı kaydet
                        if (!results.updatedFiles[file]) {
                            const dataArrayInfo = dataArrays.find(d => d.file === file);
                            results.updatedFiles[file] = { 
                                data: data, 
                                format: dataArrayInfo?.format || 'array',
                                key: dataArrayInfo?.key || null
                            };
                        }
                    } else if (item.okunus === fix.newOkunus) {
                        results.alreadyApplied++;
                        found = true;
                    } else {
                        found = true; // Kelime bulundu ama okunuş farklı
                    }
                }
            }
        });
        
        if (!found) {
            results.notFound++;
        }
    });
    
    // Güncellenmiş data array'lerini window'a geri yaz (referans zaten aynı, sadece güncellendi)
    // Not: data array'leri zaten window objesinde, sadece içerikleri güncellendi
    
    return results;
}

/**
 * Export updated data files as JSON downloads
 */
async function exportUpdatedDataFiles(updatedFiles) {
    let downloadedCount = 0;
    
    for (const [fileName, fileData] of Object.entries(updatedFiles)) {
        try {
            let jsonData;
            
            // Data formatını kontrol et
            if (fileData.format === 'object' && fileData.key) {
                // Object formatında (harf.json, uc_harfli_kelimeler.json vb.)
                jsonData = {};
                jsonData[fileData.key] = fileData.data;
            } else {
                // Array formatında (kelimebul.json)
                jsonData = fileData.data;
            }
            
            const dataStr = JSON.stringify(jsonData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            downloadedCount++;
            console.log(`📥 ${fileName} indirildi`);
            
            // Dosyalar arasında kısa bir gecikme (tarayıcı çoklu indirmeyi handle edebilsin)
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.error(`❌ ${fileName} indirilemedi:`, error);
        }
    }
    
    if (downloadedCount > 0) {
        showToast(`${downloadedCount} güncellenmiş data dosyası indirildi! Proje klasörüne kopyalayın.`, 'success', 6000);
    }
}

// Console'dan erişim için
window.exportPronunciationFixes = exportPronunciationFixes;
window.clearPronunciationFixes = clearPronunciationFixes;
window.showFixPronunciationModal = showFixPronunciationModal;
window.savePronunciationFix = savePronunciationFix;
window.applyPronunciationFixesToData = applyPronunciationFixesToData;
window.applyPronunciationFixesToDataWrapper = applyPronunciationFixesToDataWrapper;
window.importAndApplyPronunciationFixes = importAndApplyPronunciationFixes;
window.applyAndExportPronunciationFixes = applyAndExportPronunciationFixes;

console.log('🔧 Okunuş Düzeltme Sistemi yüklendi');
console.log('📝 Düzeltmeleri indirmek için: exportPronunciationFixes()');
console.log('🗑️ Düzeltmeleri silmek için: clearPronunciationFixes()');
console.log('🔨 Düzeltmeleri uygulamak için: applyPronunciationFixesToData()');

