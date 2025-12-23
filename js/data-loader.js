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
let ustnData = [];
let esreData = [];
let otreData = [];
let ucHarfliKelimelerData = [];
let seddeData = [];
let cezmData = [];
let tenvinData = [];

// Loading state
let dataLoaded = {
    kelime: false,
    ayet: false,
    dua: false,
    hadis: false,
    harf: false,
    harf1: false,
    ustn: false,
    esre: false,
    otre: false,
    ucHarfliKelimeler: false,
    sedde: false,
    cezm: false,
    tenvin: false
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
 * Load Ustn (Ustun/Fetha) data
 */
async function loadUstnData() {
    if (dataLoaded.ustn && ustnData.length > 0) {
        return ustnData;
    }
    
    try {
        const response = await fetch('./data/ustn.json');
        if (!response.ok) throw new Error('Ustn data fetch failed');
        
        const data = await response.json();
        ustnData = Array.isArray(data.harfler) ? data.harfler : [];
        dataLoaded.ustn = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.ustnData = ustnData;
        }
        
        console.log(`✅ Ustn data loaded: ${ustnData.length} letters`);
        return ustnData;
    } catch (err) {
        console.error('❌ Ustn data load error:', err);
        return [];
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
        const response = await fetch('./data/esre.json');
        if (!response.ok) throw new Error('Esre data fetch failed');
        
        const data = await response.json();
        esreData = Array.isArray(data.harfler) ? data.harfler : [];
        dataLoaded.esre = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.esreData = esreData;
        }
        
        console.log(`✅ Esre data loaded: ${esreData.length} letters`);
        return esreData;
    } catch (err) {
        console.error('❌ Esre data load error:', err);
        return [];
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
        const response = await fetch('./data/otre.json');
        if (!response.ok) throw new Error('Otre data fetch failed');
        
        const data = await response.json();
        otreData = Array.isArray(data.harfler) ? data.harfler : [];
        dataLoaded.otre = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.otreData = otreData;
        }
        
        console.log(`✅ Otre data loaded: ${otreData.length} letters`);
        return otreData;
    } catch (err) {
        console.error('❌ Otre data load error:', err);
        return [];
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
        const response = await fetch('./data/uc_harfli_kelimeler.json');
        if (!response.ok) throw new Error('UcHarfliKelimeler data fetch failed');
        
        const data = await response.json();
        ucHarfliKelimelerData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        dataLoaded.ucHarfliKelimeler = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.ucHarfliKelimelerData = ucHarfliKelimelerData;
        }
        
        console.log(`✅ Üç Harfli Kelimeler data loaded: ${ucHarfliKelimelerData.length} words`);
        return ucHarfliKelimelerData;
    } catch (err) {
        console.error('❌ Üç Harfli Kelimeler data load error:', err);
        return [];
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
        const response = await fetch('./data/tenvin.json');
        if (!response.ok) throw new Error('Tenvin data fetch failed');
        
        const data = await response.json();
        tenvinData = Array.isArray(data.harfler) ? data.harfler : [];
        dataLoaded.tenvin = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.tenvinData = tenvinData;
        }
        
        console.log(`✅ Tenvin data loaded: ${tenvinData.length} letters`);
        return tenvinData;
    } catch (err) {
        console.error('❌ Tenvin data load error:', err);
        return [];
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
        const response = await fetch('./data/sedde.json');
        if (!response.ok) throw new Error('Sedde data fetch failed');
        
        const data = await response.json();
        seddeData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        dataLoaded.sedde = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.seddeData = seddeData;
        }
        
        console.log(`✅ Şedde data loaded: ${seddeData.length} words`);
        return seddeData;
    } catch (err) {
        console.error('❌ Şedde data load error:', err);
        return [];
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
        const response = await fetch('./data/cezm.json');
        if (!response.ok) throw new Error('Cezm data fetch failed');
        
        const data = await response.json();
        cezmData = Array.isArray(data.kelimeler) ? data.kelimeler : [];
        dataLoaded.cezm = true;
        
        // Update global reference
        if (typeof window !== 'undefined') {
            window.cezmData = cezmData;
        }
        
        console.log(`✅ Cezm data loaded: ${cezmData.length} words`);
        return cezmData;
    } catch (err) {
        console.error('❌ Cezm data load error:', err);
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
        harf1: { loaded: dataLoaded.harf1, count: harf1Data.length },
        ustn: { loaded: dataLoaded.ustn, count: ustnData.length },
        esre: { loaded: dataLoaded.esre, count: esreData.length },
        otre: { loaded: dataLoaded.otre, count: otreData.length },
        ucHarfliKelimeler: { loaded: dataLoaded.ucHarfliKelimeler, count: ucHarfliKelimelerData.length },
        sedde: { loaded: dataLoaded.sedde, count: seddeData.length },
        cezm: { loaded: dataLoaded.cezm, count: cezmData.length }
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
    window.loadUstnData = loadUstnData;
    window.loadEsreData = loadEsreData;
    window.loadOtreData = loadOtreData;
    window.loadUcHarfliKelimelerData = loadUcHarfliKelimelerData;
    window.loadSeddeData = loadSeddeData;
    window.loadCezmData = loadCezmData;
    window.loadTenvinData = loadTenvinData;
    window.preloadAllData = preloadAllData;
    window.getDataStatus = getDataStatus;
    
    // Expose data arrays
    window.kelimeData = kelimeData;
    window.ayetData = ayetData;
    window.duaData = duaData;
    window.hadisData = hadisData;
    window.harfData = harfData;
    window.harf1Data = harf1Data;
    window.ustnData = ustnData;
    window.esreData = esreData;
    window.otreData = otreData;
    window.ucHarfliKelimelerData = ucHarfliKelimelerData;
    window.seddeData = seddeData;
    window.cezmData = cezmData;
    window.tenvinData = tenvinData;
}
