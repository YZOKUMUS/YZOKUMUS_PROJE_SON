/**
 * Hasene Arapça Dersi - Data Loader
 * JSON veri dosyalarını yükler
 */

// Global data stores
let kelimeData = [];
let ayetData = [];
let duaData = [];
let hadisData = [];
let harfData = [];
// Removed: harf1Data - not used in game-core.js
let ustnData = [];
let esreData = [];
let otreData = [];
let ucHarfliKelimelerData = [];
let seddeData = [];
let cezmData = [];
let tenvinData = [];
let uzatmaMedData = [];

// Loading state
let dataLoaded = {
    kelime: false,
    ayet: false,
    dua: false,
    hadis: false,
    harf: false,
    // Removed: harf1 - not used
    ustn: false,
    esre: false,
    otre: false,
    ucHarfliKelimeler: false,
    sedde: false,
    cezm: false,
    tenvin: false,
    uzatmaMed: false
};

const loadPromises = {};
let preloadPromise = null;
let backgroundPreloadScheduled = false;
const FETCH_RETRIES = 3;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDataJson(url, label) {
    let lastError;
    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                cache: attempt > 1 ? 'reload' : 'default'
            });
            if (!response.ok) {
                throw new Error(`${label} fetch failed (${response.status})`);
            }
            return await response.json();
        } catch (err) {
            lastError = err;
            if (attempt < FETCH_RETRIES) {
                await sleep(400 * attempt);
            }
        }
    }
    throw lastError;
}

function markDataLoaded(flagKey, arr) {
    if (arr.length > 0) {
        dataLoaded[flagKey] = true;
    }
}

/**
 * Load Kelime data
 */
async function loadKelimeData() {
    if (dataLoaded.kelime && kelimeData.length > 0) {
        return kelimeData;
    }
    if (loadPromises.kelime) {
        return loadPromises.kelime;
    }

    loadPromises.kelime = (async () => {
        try {
            const data = await fetchDataJson('./data/kelimebul.json', 'Kelime');
            kelimeData = Array.isArray(data) ? data : [];
            markDataLoaded('kelime', kelimeData);
            if (typeof window !== 'undefined') {
                window.kelimeData = kelimeData;
            }
            console.log(`✅ Kelime data loaded: ${kelimeData.length} words`);
            return kelimeData;
        } catch (err) {
            console.error('❌ Kelime data load error:', err);
            return kelimeData.length > 0 ? kelimeData : [];
        } finally {
            loadPromises.kelime = null;
        }
    })();

    return loadPromises.kelime;
}

/**
 * Load Ayet data
 */
async function loadAyetData() {
    if (dataLoaded.ayet && ayetData.length > 0) {
        return ayetData;
    }
    if (loadPromises.ayet) {
        return loadPromises.ayet;
    }

    loadPromises.ayet = (async () => {
        try {
            const data = await fetchDataJson('./data/ayetoku.json', 'Ayet');
            ayetData = Array.isArray(data) ? data : [];
            markDataLoaded('ayet', ayetData);
            if (typeof window !== 'undefined') {
                window.ayetData = ayetData;
            }
            console.log(`✅ Ayet data loaded: ${ayetData.length} verses`);
            return ayetData;
        } catch (err) {
            console.error('❌ Ayet data load error:', err);
            return ayetData.length > 0 ? ayetData : [];
        } finally {
            loadPromises.ayet = null;
        }
    })();

    return loadPromises.ayet;
}

/**
 * Load Dua data
 */
async function loadDuaData() {
    if (dataLoaded.dua && duaData.length > 0) {
        return duaData;
    }
    
    try {
        const data = await fetchDataJson('./data/duaet.json', 'Dua');
        duaData = Array.isArray(data) ? data : [];
        markDataLoaded('dua', duaData);
        
        if (typeof window !== 'undefined') {
            window.duaData = duaData;
        }
        
        console.log(`✅ Dua data loaded: ${duaData.length} duas`);
        return duaData;
    } catch (err) {
        console.error('❌ Dua data load error:', err);
        return duaData.length > 0 ? duaData : [];
    }
}

/**
 * Load Hadis data
 */
async function loadHadisData() {
    if (dataLoaded.hadis && hadisData.length > 0) {
        return hadisData;
    }
    if (loadPromises.hadis) {
        return loadPromises.hadis;
    }

    loadPromises.hadis = (async () => {
        try {
            const data = await fetchDataJson('./data/hadisoku.json', 'Hadis');
            hadisData = Array.isArray(data) ? data : [];
            markDataLoaded('hadis', hadisData);
            if (typeof window !== 'undefined') {
                window.hadisData = hadisData;
            }
            console.log(`✅ Hadis data loaded: ${hadisData.length} hadiths`);
            return hadisData;
        } catch (err) {
            console.error('❌ Hadis data load error:', err);
            return hadisData.length > 0 ? hadisData : [];
        } finally {
            loadPromises.hadis = null;
        }
    })();

    return loadPromises.hadis;
}

/**
 * Load Harf data
 */
async function loadHarfData() {
    if (dataLoaded.harf && harfData.length > 0) {
        return harfData;
    }
    if (loadPromises.harf) {
        return loadPromises.harf;
    }

    loadPromises.harf = (async () => {
        try {
            const data = await fetchDataJson('./data/harf.json', 'Harf');
            harfData = data.harfler || [];
            markDataLoaded('harf', harfData);
            if (typeof window !== 'undefined') {
                window.harfData = harfData;
            }
            console.log(`✅ Harf data loaded: ${harfData.length} letters`);
            return harfData;
        } catch (err) {
            console.error('❌ Harf data load error:', err);
            return harfData.length > 0 ? harfData : [];
        } finally {
            loadPromises.harf = null;
        }
    })();

    return loadPromises.harf;
}

/**
 * Load Harf1 (Kelime Okuma) data
 * REMOVED: This data is not used in game-core.js, so it's been removed to clean up the codebase
 */
// async function loadHarf1Data() { ... }

/**
 * Load Ustn (Ustun/Fetha) data
 */
async function loadUstnData() {
    if (dataLoaded.ustn && ustnData.length > 0) {
        return ustnData;
    }
    
    try {
        const data = await fetchDataJson('./data/ustn.json', 'Ustun');
        ustnData = Array.isArray(data.harfler) ? data.harfler : [];
        markDataLoaded('ustn', ustnData);
        
        if (typeof window !== 'undefined') {
            window.ustnData = ustnData;
        }
        
        console.log(`✅ Ustn data loaded: ${ustnData.length} letters`);
        return ustnData;
    } catch (err) {
        console.error('❌ Ustn data load error:', err);
        return ustnData.length > 0 ? ustnData : [];
    }
}

/**
 * Load Esre data
 */
async function loadEsreData() {
    if (dataLoaded.esre && esreData.length > 0) {
        return esreData;
    }
    
    try {
        const data = await fetchDataJson('./data/esre.json', 'Esre');
        esreData = Array.isArray(data.harfler) ? data.harfler : [];
        markDataLoaded('esre', esreData);
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.esreData = esreData;
        }
        
        console.log(`✅ Esre data loaded: ${esreData.length} letters`);
        return esreData;
    } catch (err) {
        console.error('❌ Esre data load error:', err);
        return esreData.length > 0 ? esreData : [];
    }
}

/**
 * Load Otre data
 */
async function loadOtreData() {
    if (dataLoaded.otre && otreData.length > 0) {
        return otreData;
    }
    
    try {
        const data = await fetchDataJson('./data/otre.json', 'Otre');
        otreData = Array.isArray(data.harfler) ? data.harfler : [];
        markDataLoaded('otre', otreData);
        
        if (typeof window !== 'undefined') {
            window.otreData = otreData;
        }
        
        console.log(`✅ Otre data loaded: ${otreData.length} letters`);
        return otreData;
    } catch (err) {
        console.error('❌ Otre data load error:', err);
        return otreData.length > 0 ? otreData : [];
    }
}

/**
 * Load Üç Harfli Kelimeler data
 */
async function loadUcHarfliKelimelerData() {
    if (dataLoaded.ucHarfliKelimeler && ucHarfliKelimelerData.length > 0) {
        return ucHarfliKelimelerData;
    }
    
    try {
        const data = await fetchDataJson('./data/uc_harfli_kelimeler.json', 'UcHarfliKelimeler');
        ucHarfliKelimelerData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        markDataLoaded('ucHarfliKelimeler', ucHarfliKelimelerData);
        
        if (typeof window !== 'undefined') {
            window.ucHarfliKelimelerData = ucHarfliKelimelerData;
        }
        
        console.log(`✅ Üç Harfli Kelimeler data loaded: ${ucHarfliKelimelerData.length} words`);
        return ucHarfliKelimelerData;
    } catch (err) {
        console.error('❌ Üç Harfli Kelimeler data load error:', err);
        return ucHarfliKelimelerData.length > 0 ? ucHarfliKelimelerData : [];
    }
}

/**
 * Load Tenvin data
 */
async function loadTenvinData() {
    if (dataLoaded.tenvin && tenvinData.length > 0) {
        return tenvinData;
    }
    
    try {
        const data = await fetchDataJson('./data/tenvin.json', 'Tenvin');
        tenvinData = Array.isArray(data.harfler) ? data.harfler : [];
        markDataLoaded('tenvin', tenvinData);
        
        if (typeof window !== 'undefined') {
            window.tenvinData = tenvinData;
        }
        
        console.log(`✅ Tenvin data loaded: ${tenvinData.length} letters`);
        return tenvinData;
    } catch (err) {
        console.error('❌ Tenvin data load error:', err);
        return tenvinData.length > 0 ? tenvinData : [];
    }
}

/**
 * Load Şedde data
 */
async function loadSeddeData() {
    if (dataLoaded.sedde && seddeData.length > 0) {
        return seddeData;
    }
    
    try {
        const data = await fetchDataJson('./data/sedde.json', 'Sedde');
        seddeData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        markDataLoaded('sedde', seddeData);
        
        if (typeof window !== 'undefined') {
            window.seddeData = seddeData;
        }
        
        console.log(`✅ Şedde data loaded: ${seddeData.length} words`);
        return seddeData;
    } catch (err) {
        console.error('❌ Şedde data load error:', err);
        return seddeData.length > 0 ? seddeData : [];
    }
}

/**
 * Load Cezm data
 */
async function loadCezmData() {
    if (dataLoaded.cezm && cezmData.length > 0) {
        return cezmData;
    }
    
    try {
        const data = await fetchDataJson('./data/cezm.json', 'Cezm');
        cezmData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        markDataLoaded('cezm', cezmData);
        
        if (typeof window !== 'undefined') {
            window.cezmData = cezmData;
        }
        
        console.log(`✅ Cezm data loaded: ${cezmData.length} words`);
        return cezmData;
    } catch (err) {
        console.error('❌ Cezm data load error:', err);
        return cezmData.length > 0 ? cezmData : [];
    }
}

/**
 * Load Uzatma (Med) Harfleri data
 */
async function loadUzatmaMedData() {
    if (dataLoaded.uzatmaMed && uzatmaMedData.length > 0) {
        return uzatmaMedData;
    }
    
    try {
        const data = await fetchDataJson('./data/uzatma_med.json', 'UzatmaMed');
        uzatmaMedData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        markDataLoaded('uzatmaMed', uzatmaMedData);
        
        if (typeof window !== 'undefined') {
            window.uzatmaMedData = uzatmaMedData;
        }
        
        console.log(`✅ Uzatma (Med) Harfleri data loaded: ${uzatmaMedData.length} words`);
        return uzatmaMedData;
    } catch (err) {
        console.error('❌ Uzatma Med data load error:', err);
        return uzatmaMedData.length > 0 ? uzatmaMedData : [];
    }
}

/**
 * Preload all data in background (explicit — e.g. Talim Et, smoke tests)
 */
async function preloadAllData() {
    if (!preloadPromise) {
        preloadPromise = (async () => {
            console.log('📦 Preloading all data...');
            await Promise.all([
                loadKelimeData(),
                loadAyetData(),
                loadDuaData(),
                loadHadisData(),
                loadHarfData(),
                loadUzatmaMedData()
            ]);
            console.log('✅ All data preloaded');
        })();
    }
    return preloadPromise;
}

/**
 * Staggered background preload after app is interactive (faster first paint)
 */
function scheduleBackgroundPreload() {
    if (backgroundPreloadScheduled) {
        return;
    }
    backgroundPreloadScheduled = true;

    const runStaggered = () => {
        console.log('📦 Arka plan veri yüklemesi başlıyor (lazy)...');
        const tasks = [
            { fn: loadHarfData, delay: 0 },
            { fn: loadKelimeData, delay: 800 },
            { fn: loadDuaData, delay: 3500 },
            { fn: loadAyetData, delay: 5500 },
            { fn: loadHadisData, delay: 7500 },
            { fn: loadUzatmaMedData, delay: 9500 }
        ];
        tasks.forEach(({ fn, delay }) => {
            setTimeout(() => {
                fn().catch((err) => console.warn('Background preload:', err));
            }, delay);
        });
    };

    const startDelay = 2500;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        setTimeout(() => {
            window.requestIdleCallback(runStaggered, { timeout: 8000 });
        }, startDelay);
    } else {
        setTimeout(runStaggered, startDelay);
    }
}

/**
 * Get data loading status
 */
function getDataStatus() {
    return {
        kelime: { loaded: dataLoaded.kelime, count: kelimeData.length },
        ayet: { loaded: dataLoaded.ayet, count: ayetData.length },
        dua: { loaded: dataLoaded.dua, count: duaData.length },
        hadis: { loaded: dataLoaded.hadis, count: hadisData.length },
        harf: { loaded: dataLoaded.harf, count: harfData.length },
        // Removed: harf1 - not used
        ustn: { loaded: dataLoaded.ustn, count: ustnData.length },
        esre: { loaded: dataLoaded.esre, count: esreData.length },
        otre: { loaded: dataLoaded.otre, count: otreData.length },
        ucHarfliKelimeler: { loaded: dataLoaded.ucHarfliKelimeler, count: ucHarfliKelimelerData.length },
        sedde: { loaded: dataLoaded.sedde, count: seddeData.length },
        cezm: { loaded: dataLoaded.cezm, count: cezmData.length },
        tenvin: { loaded: dataLoaded.tenvin, count: tenvinData.length },
        uzatmaMed: { loaded: dataLoaded.uzatmaMed, count: uzatmaMedData.length }
    };
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.loadKelimeData = loadKelimeData;
    window.loadAyetData = loadAyetData;
    window.loadDuaData = loadDuaData;
    window.loadHadisData = loadHadisData;
    window.loadHarfData = loadHarfData;
    // Removed: window.loadHarf1Data - not used
    window.loadUstnData = loadUstnData;
    window.loadEsreData = loadEsreData;
    window.loadOtreData = loadOtreData;
    window.loadUcHarfliKelimelerData = loadUcHarfliKelimelerData;
    window.loadSeddeData = loadSeddeData;
    window.loadCezmData = loadCezmData;
    window.loadTenvinData = loadTenvinData;
    window.loadUzatmaMedData = loadUzatmaMedData;
    window.preloadAllData = preloadAllData;
    window.scheduleBackgroundPreload = scheduleBackgroundPreload;
    window.getDataStatus = getDataStatus;
    
    // Expose data arrays
    window.kelimeData = kelimeData;
    window.ayetData = ayetData;
    window.duaData = duaData;
    window.hadisData = hadisData;
    window.harfData = harfData;
    // Removed: window.harf1Data - not used
    window.ustnData = ustnData;
    window.esreData = esreData;
    window.otreData = otreData;
    window.ucHarfliKelimelerData = ucHarfliKelimelerData;
    window.seddeData = seddeData;
    window.cezmData = cezmData;
    window.tenvinData = tenvinData;
    window.uzatmaMedData = uzatmaMedData;
}
