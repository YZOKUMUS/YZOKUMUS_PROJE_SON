/**
 * Apply Pronunciation Fixes to Data Files
 * pronunciation-fixes.json dosyasındaki düzeltmeleri data dosyalarına uygular
 * 
 * Kullanım:
 * node apply-pronunciation-fixes.js
 */

const fs = require('fs');
const path = require('path');

// Data dosyaları mapping
const DATA_FILE_MAP = {
    'uc-harfli-kelimeler': 'data/uc_harfli_kelimeler.json',
    'uzatma-med': 'data/uzatma_med.json',
    'harf': 'data/harf.json',
    'ustn': 'data/ustn.json',
    'esre': 'data/esre.json',
    'otre': 'data/otre.json',
    'sedde': 'data/sedde.json',
    'cezm': 'data/cezm.json',
    'tenvin': 'data/tenvin.json',
    'kelime': 'data/kelimebul.json'
};

// Alternatif dosya isimlerini dene
function findFixesFile() {
    const possibleNames = [
        'pronunciation-fixes.json',
        'pronunciation-fixes (1).json',
        'pronunciation-fixes(1).json'
    ];
    
    for (const name of possibleNames) {
        const filePath = path.join(__dirname, name);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
}

function applyPronunciationFixes() {
    console.log('🔧 Okunuş Düzeltmeleri Uygulama Script\'i\n');
    
    // 1. pronunciation-fixes.json dosyasını bul
    const fixesFilePath = findFixesFile();
    if (!fixesFilePath) {
        console.error('❌ pronunciation-fixes.json dosyası bulunamadı!');
        console.log('💡 İpucu: pronunciation-fixes.json dosyasını proje klasörüne (root) kopyalayın');
        process.exit(1);
    }
    
    console.log(`✅ Düzeltme dosyası bulundu: ${fixesFilePath}\n`);
    
    // 2. Düzeltmeleri yükle
    let fixes;
    try {
        const fixesContent = fs.readFileSync(fixesFilePath, 'utf8');
        fixes = JSON.parse(fixesContent);
        if (!Array.isArray(fixes)) {
            console.error('❌ pronunciation-fixes.json geçersiz format! Array olmalı.');
            process.exit(1);
        }
        console.log(`📝 ${fixes.length} düzeltme yüklendi\n`);
    } catch (error) {
        console.error('❌ pronunciation-fixes.json okunamadı:', error.message);
        process.exit(1);
    }
    
    // 3. Her data dosyası için düzeltmeleri uygula
    const results = {
        total: fixes.length,
        applied: 0,
        notFound: 0,
        alreadyApplied: 0,
        errors: []
    };
    
    // Submode'a göre grupla
    const fixesBySubmode = {};
    fixes.forEach(fix => {
        const submode = fix.submode || 'unknown';
        if (!fixesBySubmode[submode]) {
            fixesBySubmode[submode] = [];
        }
        fixesBySubmode[submode].push(fix);
    });
    
    console.log('📊 Düzeltmeler submode\'a göre gruplandı:');
    Object.keys(fixesBySubmode).forEach(submode => {
        console.log(`   ${submode}: ${fixesBySubmode[submode].length} düzeltme`);
    });
    console.log('');
    
    // Her submode için ilgili data dosyasını güncelle
    Object.keys(fixesBySubmode).forEach(submode => {
        const dataFilePath = DATA_FILE_MAP[submode];
        if (!dataFilePath) {
            console.warn(`⚠️ Submode "${submode}" için data dosyası bulunamadı, atlanıyor`);
            return;
        }
        
        const fullPath = path.join(__dirname, dataFilePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Data dosyası bulunamadı: ${dataFilePath}, atlanıyor`);
            return;
        }
        
        console.log(`\n📂 İşleniyor: ${dataFilePath}`);
        
        try {
            // Data dosyasını yükle
            const dataContent = fs.readFileSync(fullPath, 'utf8');
            let data = JSON.parse(dataContent);
            
            // Data formatını kontrol et (array veya object with array)
            let items = Array.isArray(data) ? data : (data.kelimeler || data.harfler || []);
            if (!Array.isArray(items)) {
                console.warn(`⚠️ ${dataFilePath} geçersiz format, atlanıyor`);
                return;
            }
            
            // Backup oluştur
            const backupPath = fullPath + '.backup';
            fs.writeFileSync(backupPath, dataContent);
            console.log(`   💾 Backup oluşturuldu: ${backupPath}`);
            
            // Düzeltmeleri uygula
            const submodeFixes = fixesBySubmode[submode];
            let fileApplied = 0;
            let fileNotFound = 0;
            let fileAlreadyApplied = 0;
            
            submodeFixes.forEach(fix => {
                const item = items.find(item => {
                    const itemKelime = item.kelime || item.harf || '';
                    return itemKelime === fix.kelime;
                });
                
                if (item) {
                    if (item.okunus === fix.oldOkunus) {
                        item.okunus = fix.newOkunus;
                        fileApplied++;
                        console.log(`   ✅ "${fix.kelime}": "${fix.oldOkunus}" → "${fix.newOkunus}"`);
                    } else if (item.okunus === fix.newOkunus) {
                        fileAlreadyApplied++;
                        console.log(`   ℹ️ "${fix.kelime}": Zaten düzeltilmiş ("${item.okunus}")`);
                    } else {
                        fileNotFound++;
                        console.log(`   ⚠️ "${fix.kelime}": Okunuş eşleşmedi (mevcut: "${item.okunus}", beklenen: "${fix.oldOkunus}")`);
                    }
                } else {
                    fileNotFound++;
                    console.log(`   ❌ "${fix.kelime}": Kelime bulunamadı`);
                }
            });
            
            // Data dosyasını kaydet
            if (Array.isArray(data)) {
                data = items;
            } else if (data.kelimeler) {
                data.kelimeler = items;
            } else if (data.harfler) {
                data.harfler = items;
            }
            
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`   ✅ ${dataFilePath} güncellendi (${fileApplied} uygulandı, ${fileAlreadyApplied} zaten uygulanmış, ${fileNotFound} bulunamadı)`);
            
            results.applied += fileApplied;
            results.alreadyApplied += fileAlreadyApplied;
            results.notFound += fileNotFound;
            
        } catch (error) {
            console.error(`   ❌ ${dataFilePath} işlenirken hata:`, error.message);
            results.errors.push({ file: dataFilePath, error: error.message });
        }
    });
    
    // 4. Sonuçları göster
    console.log('\n' + '='.repeat(50));
    console.log('📊 ÖZET:');
    console.log('='.repeat(50));
    console.log(`Toplam düzeltme: ${results.total}`);
    console.log(`✅ Uygulandı: ${results.applied}`);
    console.log(`ℹ️ Zaten uygulanmış: ${results.alreadyApplied}`);
    console.log(`❌ Bulunamadı: ${results.notFound}`);
    if (results.errors.length > 0) {
        console.log(`⚠️ Hatalar: ${results.errors.length}`);
        results.errors.forEach(({ file, error }) => {
            console.log(`   - ${file}: ${error}`);
        });
    }
    console.log('='.repeat(50));
    
    if (results.applied > 0) {
        console.log('\n✅ Düzeltmeler başarıyla uygulandı!');
        console.log('💡 İpucu: Backup dosyaları (.backup) güvenli bir şekilde silinebilir');
    } else {
        console.log('\n⚠️ Hiçbir düzeltme uygulanamadı');
    }
}

// Script'i çalıştır
if (require.main === module) {
    applyPronunciationFixes();
}

module.exports = { applyPronunciationFixes };

