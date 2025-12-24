/**
 * Hasene Arapça Dersi - Hızlı Test Fonksiyonları
 * Her kod değişikliğinden sonra bu fonksiyonları çalıştırarak temel fonksiyonları test edin
 */

/**
 * Tüm temel fonksiyonları hızlıca test et
 */
function quickTest() {
    console.log('🧪 Hızlı Test Başlatılıyor...\n');
    
    const results = {
        passed: [],
        failed: []
    };
    
    // 1. Kullanıcı Yönetimi Testleri
    console.log('📋 1. Kullanıcı Yönetimi Testleri');
    try {
        const isLoggedIn = typeof window.isLoggedIn === 'function' ? window.isLoggedIn() : false;
        console.log(`   ✓ isLoggedIn fonksiyonu: ${typeof window.isLoggedIn === 'function' ? 'VAR' : 'YOK'}`);
        results.passed.push('isLoggedIn fonksiyonu');
    } catch (e) {
        console.error(`   ✗ isLoggedIn hatası:`, e);
        results.failed.push('isLoggedIn fonksiyonu');
    }
    
    try {
        const hasAuthBtn = document.getElementById('user-auth-btn') !== null;
        console.log(`   ✓ user-auth-btn elementi: ${hasAuthBtn ? 'VAR' : 'YOK'}`);
        results.passed.push('user-auth-btn elementi');
    } catch (e) {
        console.error(`   ✗ user-auth-btn hatası:`, e);
        results.failed.push('user-auth-btn elementi');
    }
    
    // 2. Oyun Modları Testleri
    console.log('\n📋 2. Oyun Modları Testleri');
    const gameFunctions = [
        'startKelimeCevirGame',
        'startDinleBulGame',
        'startBoslukDoldurGame',
        'startElifBaGame',
        'startKarmaGame'
    ];
    
    gameFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // 3. Cevap Kontrol Fonksiyonları
    console.log('\n📋 3. Cevap Kontrol Fonksiyonları');
    const answerFunctions = [
        'checkKelimeAnswer',
        'checkDinleAnswer',
        'checkBoslukAnswer',
        'checkElifAnswer',
        'checkKarmaAnswer'
    ];
    
    answerFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // 4. Ses Yönetimi
    console.log('\n📋 4. Ses Yönetimi');
    const audioFunctions = ['stopAllAudio', 'playSafeAudio'];
    audioFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // 5. Modal Yönetimi
    console.log('\n📋 5. Modal Yönetimi');
    const modalFunctions = ['openModal', 'closeModal', 'closeAllModals'];
    modalFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // 6. İstatistikler
    console.log('\n📋 6. İstatistikler');
    const statsFunctions = ['showWordAnalysisModal', 'getWordAnalysis', 'getStrugglingWords'];
    statsFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // 7. Günlük Görevler
    console.log('\n📋 7. Günlük Görevler');
    const taskFunctions = ['claimDailyReward', 'checkRewardBoxStatus'];
    taskFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // 8. Backend Senkronizasyon
    console.log('\n📋 8. Backend Senkronizasyon');
    const backendFunctions = ['saveUserStats', 'saveDailyTasks', 'loadUserStats', 'loadDailyTasks'];
    backendFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`   ${exists ? '✓' : '✗'} ${funcName}: ${exists ? 'VAR' : 'YOK'}`);
        if (exists) {
            results.passed.push(funcName);
        } else {
            results.failed.push(funcName);
        }
    });
    
    // Sonuçlar
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Başarılı: ${results.passed.length}`);
    console.log(`❌ Başarısız: ${results.failed.length}`);
    console.log('='.repeat(50));
    
    if (results.failed.length > 0) {
        console.log('\n⚠️ Başarısız Testler:');
        results.failed.forEach(fail => console.log(`   - ${fail}`));
    }
    
    return results;
}

/**
 * Konsol hatalarını kontrol et
 */
function checkConsoleErrors() {
    console.log('🔍 Konsol Hataları Kontrol Ediliyor...');
    
    // Override console.error to track errors
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
        errors.push(args);
        originalError.apply(console, args);
    };
    
    // Wait a bit for errors to accumulate
    setTimeout(() => {
        console.error = originalError;
        
        if (errors.length > 0) {
            console.warn(`⚠️ ${errors.length} konsol hatası bulundu`);
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}.`, ...error);
            });
        } else {
            console.log('✅ Konsol hatası yok');
        }
    }, 2000);
}

/**
 * DOM elementlerini kontrol et
 */
function checkDOMElements() {
    console.log('🔍 DOM Elementleri Kontrol Ediliyor...');
    
    const criticalElements = [
        'user-auth-btn',
        'word-analysis-modal',
        'daily-reward-modal',
        'stats-modal',
        'main-container'
    ];
    
    const missing = [];
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missing.push(id);
            console.error(`   ✗ ${id}: BULUNAMADI`);
        } else {
            console.log(`   ✓ ${id}: VAR`);
        }
    });
    
    if (missing.length > 0) {
        console.warn(`⚠️ ${missing.length} kritik element bulunamadı`);
    } else {
        console.log('✅ Tüm kritik elementler mevcut');
    }
    
    return missing;
}

/**
 * localStorage verilerini kontrol et
 */
function checkLocalStorage() {
    console.log('🔍 localStorage Kontrol Ediliyor...');
    
    const keys = [
        'hasene_user_id',
        'hasene_username',
        'hasene_totalPoints',
        'hasene_word_stats',
        'hasene_dailyTasks'
    ];
    
    const missing = [];
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value === null) {
            missing.push(key);
            console.warn(`   ⚠️ ${key}: YOK`);
        } else {
            console.log(`   ✓ ${key}: VAR`);
        }
    });
    
    return missing;
}

/**
 * Tüm testleri çalıştır
 */
function runAllTests() {
    console.clear();
    console.log('🚀 TÜM TESTLER BAŞLATILIYOR...\n');
    
    const results = {
        quickTest: quickTest(),
        domElements: checkDOMElements(),
        localStorage: checkLocalStorage()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST ÖZETİ');
    console.log('='.repeat(50));
    console.log(`✅ Başarılı Testler: ${results.quickTest.passed.length}`);
    console.log(`❌ Başarısız Testler: ${results.quickTest.failed.length}`);
    console.log(`🔍 Eksik DOM Elementleri: ${results.domElements.length}`);
    console.log(`💾 Eksik localStorage Key'leri: ${results.localStorage.length}`);
    console.log('='.repeat(50));
    
    return results;
}

// Global'e ekle
if (typeof window !== 'undefined') {
    window.quickTest = quickTest;
    window.checkConsoleErrors = checkConsoleErrors;
    window.checkDOMElements = checkDOMElements;
    window.checkLocalStorage = checkLocalStorage;
    window.runAllTests = runAllTests;
    
    console.log('✅ Test fonksiyonları yüklendi. Kullanım:');
    console.log('   - quickTest() - Hızlı fonksiyon testleri');
    console.log('   - checkDOMElements() - DOM element kontrolü');
    console.log('   - checkLocalStorage() - localStorage kontrolü');
    console.log('   - runAllTests() - Tüm testleri çalıştır');
}

