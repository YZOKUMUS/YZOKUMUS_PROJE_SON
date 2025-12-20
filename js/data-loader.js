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
let harf1Data = [];

// Loading state
let dataLoaded = {
    kelime: false,
    ayet: false,
    dua: false,
    hadis: false,
    harf: false,
    harf1: false
};

/**
 * Load Kelime data
 */
async function loadKelimeData() {
    if (dataLoaded.kelime && kelimeData.length > 0) {
        return kelimeData;
    }
    
    try {
        const response = await fetch('./data/kelimebul.json');
        if (!response.ok) throw new Error('Kelime data fetch failed');
        
        const data = await response.json();
        kelimeData = Array.isArray(data) ? data : [];
        dataLoaded.kelime = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.kelimeData = kelimeData;
        }
        
        console.log(`✅ Kelime data loaded: ${kelimeData.length} words`);
        return kelimeData;
    } catch (err) {
        console.error('❌ Kelime data load error:', err);
        return [];
    }
}

/**
 * Load Ayet data
 */
async function loadAyetData() {
    if (dataLoaded.ayet && ayetData.length > 0) {
        return ayetData;
    }
    
    try {
        const response = await fetch('./data/ayetoku.json');
        if (!response.ok) throw new Error('Ayet data fetch failed');
        
        const data = await response.json();
        ayetData = Array.isArray(data) ? data : [];
        dataLoaded.ayet = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.ayetData = ayetData;
        }
        
        console.log(`✅ Ayet data loaded: ${ayetData.length} verses`);
        return ayetData;
    } catch (err) {
        console.error('❌ Ayet data load error:', err);
        return [];
    }
}

/**
 * Load Dua data
 */
async function loadDuaData() {
    if (dataLoaded.dua && duaData.length > 0) {
        return duaData;
    }
    
    try {
        const response = await fetch('./data/duaet.json');
        if (!response.ok) throw new Error('Dua data fetch failed');
        
        const data = await response.json();
        duaData = Array.isArray(data) ? data : [];
        dataLoaded.dua = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.duaData = duaData;
        }
        
        console.log(`✅ Dua data loaded: ${duaData.length} duas`);
        return duaData;
    } catch (err) {
        console.error('❌ Dua data load error:', err);
        return [];
    }
}

/**
 * Load Hadis data
 */
async function loadHadisData() {
    if (dataLoaded.hadis && hadisData.length > 0) {
        return hadisData;
    }
    
    try {
        const response = await fetch('./data/hadisoku.json');
        if (!response.ok) throw new Error('Hadis data fetch failed');
        
        const data = await response.json();
        hadisData = Array.isArray(data) ? data : [];
        dataLoaded.hadis = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.hadisData = hadisData;
        }
        
        console.log(`✅ Hadis data loaded: ${hadisData.length} hadiths`);
        return hadisData;
    } catch (err) {
        console.error('❌ Hadis data load error:', err);
        return [];
    }
}

/**
 * Load Harf data
 */
async function loadHarfData() {
    if (dataLoaded.harf && harfData.length > 0) {
        return harfData;
    }
    
    try {
        const response = await fetch('./data/harf.json');
        if (!response.ok) throw new Error('Harf data fetch failed');
        
        const data = await response.json();
        harfData = data.harfler || [];
        dataLoaded.harf = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.harfData = harfData;
        }
        
        console.log(`✅ Harf data loaded: ${harfData.length} letters`);
        return harfData;
    } catch (err) {
        console.error('❌ Harf data load error:', err);
        return [];
    }
}

/**
 * Load Harf1 (Kelime Okuma) data
 */
async function loadHarf1Data() {
    if (dataLoaded.harf1 && harf1Data.length > 0) {
        return harf1Data;
    }
    
    try {
        const response = await fetch('./data/harf1.json');
        if (!response.ok) throw new Error('Harf1 data fetch failed');
        
        const data = await response.json();
        harf1Data = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        dataLoaded.harf1 = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.harf1Data = harf1Data;
        }
        
        console.log(`✅ Harf1 (Kelime Okuma) data loaded: ${harf1Data.length} words`);
        return harf1Data;
    } catch (err) {
        console.error('❌ Harf1 data load error:', err);
        return [];
    }
}

/**
 * Preload all data in background
 */
async function preloadAllData() {
    console.log('📦 Preloading all data...');
    
    await Promise.all([
        loadKelimeData(),
        loadAyetData(),
        loadDuaData(),
        loadHadisData(),
        loadHarfData(),
        loadHarf1Data()
    ]);
    
    console.log('✅ All data preloaded');
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
        harf1: { loaded: dataLoaded.harf1, count: harf1Data.length }
    };
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.loadKelimeData = loadKelimeData;
    window.loadAyetData = loadAyetData;
    window.loadDuaData = loadDuaData;
    window.loadHadisData = loadHadisData;
    window.loadHarfData = loadHarfData;
    window.loadHarf1Data = loadHarf1Data;
    window.preloadAllData = preloadAllData;
    window.getDataStatus = getDataStatus;
    
    // Expose data arrays
    window.kelimeData = kelimeData;
    window.ayetData = ayetData;
    window.duaData = duaData;
    window.hadisData = hadisData;
    window.harfData = harfData;
    window.harf1Data = harf1Data;
}
