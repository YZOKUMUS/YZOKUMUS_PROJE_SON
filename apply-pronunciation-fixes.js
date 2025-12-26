/**
 * Apply Pronunciation Fixes
 * pronunciation-fixes.json dosyasındaki düzeltmeleri uygular
 */

const fs = require('fs');
const path = require('path');

const UC_HARFLI_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler.json');
const FIXES_PATH = path.join(__dirname, 'pronunciation-fixes.json');
const BACKUP_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler_before_fixes.json');

function applyPronunciationFixes() {
    console.log('🔧 Okunuş Düzeltmeleri Uygulama Script\'i\n');
    
    // Düzeltmeleri yükle
    if (!fs.existsSync(FIXES_PATH)) {
        console.error('❌ pronunciation-fixes.json dosyası bulunamadı!');
        console.log('💡 Önce oyunda düzeltmeleri yapın ve exportPronunciationFixes() ile indirin.');
        process.exit(1);
    }
    
    const fixesContent = fs.readFileSync(FIXES_PATH, 'utf8');
    const fixes = JSON.parse(fixesContent);
    
    console.log(`📋 ${fixes.length} düzeltme yüklendi\n`);
    
    // Ana dosyayı yükle
    const dataContent = fs.readFileSync(UC_HARFLI_PATH, 'utf8');
    const data = JSON.parse(dataContent);
    
    console.log(`📖 ${data.kelimeler.length} kelime yüklendi\n`);
    
    // Yedek oluştur
    fs.writeFileSync(BACKUP_PATH, dataContent, 'utf8');
    console.log(`💾 Yedek oluşturuldu: ${BACKUP_PATH}\n`);
    
    // Düzeltmeleri uygula
    let appliedCount = 0;
    const appliedFixes = [];
    
    for (const fix of fixes) {
        const kelime = data.kelimeler.find(k => k.kelime === fix.kelime);
        
        if (kelime) {
            const oldOkunus = kelime.okunus;
            kelime.okunus = fix.newOkunus;
            appliedCount++;
            
            appliedFixes.push({
                kelime: fix.kelime,
                old: oldOkunus,
                new: fix.newOkunus,
                anlam: fix.anlam
            });
            
            console.log(`✅ ${fix.kelime} → "${oldOkunus}" ⟹ "${fix.newOkunus}"`);
        } else {
            console.log(`⚠️  ${fix.kelime} bulunamadı`);
        }
    }
    
    console.log(`\n✅ ${appliedCount}/${fixes.length} düzeltme uygulandı\n`);
    
    // Dosyayı kaydet
    fs.writeFileSync(UC_HARFLI_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`💾 Dosya kaydedildi: ${UC_HARFLI_PATH}`);
    
    console.log('\n📊 Özet:');
    console.log(`   - Toplam kelime: ${data.kelimeler.length}`);
    console.log(`   - Düzeltilen: ${appliedCount}`);
    console.log(`   - Yedek: ${BACKUP_PATH}`);
    
    console.log('\n🎉 Tamamlandı!\n');
}

applyPronunciationFixes();

