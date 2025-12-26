/**
 * Script: Fix Qaf (ق) Pronunciation
 * ق harfinin okunuşunu düzelt: "k" yerine "g" olmalı (kalın k sesi)
 */

const fs = require('fs');
const path = require('path');

const UC_HARFLI_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler.json');
const OUTPUT_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler_fixed_qaf.json');

function fixQafPronunciation() {
    console.log('🔧 Kaf (ق) Okunuşu Düzeltme Script\'i\n');
    
    // Dosyayı oku
    const content = fs.readFileSync(UC_HARFLI_PATH, 'utf8');
    const data = JSON.parse(content);
    
    console.log(`📖 ${data.kelimeler.length} kelime yüklendi\n`);
    
    const changes = [];
    let fixedCount = 0;
    
    for (const kelime of data.kelimeler) {
        const arabicWord = kelime.kelime;
        const currentOkunus = kelime.okunus;
        
        // ق (kaf) harfi içeren kelimeleri bul
        if (arabicWord.includes('ق')) {
            // k → g değişikliği yap (kalın k için)
            let newOkunus = currentOkunus;
            
            // Sadece k harflerini g yap, diğer harfleri etkileme
            // "kul" → "gul", "kafi" → "gafi", etc.
            newOkunus = newOkunus
                .replace(/ku/g, 'gu')
                .replace(/ka/g, 'ga')
                .replace(/kı/g, 'gı')
                .replace(/ki/g, 'gi')
                .replace(/ke/g, 'ge');
            
            if (newOkunus !== currentOkunus) {
                kelime.okunus = newOkunus;
                fixedCount++;
                
                if (changes.length < 30) {
                    changes.push({
                        kelime: arabicWord,
                        old: currentOkunus,
                        new: newOkunus,
                        anlam: kelime.anlam
                    });
                }
            }
        }
    }
    
    console.log(`✅ ${fixedCount} kelime düzeltildi\n`);
    
    if (changes.length > 0) {
        console.log('📋 Düzeltilen kelimeler (ilk 30):');
        console.log('─'.repeat(90));
        changes.forEach((change, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${change.kelime.padEnd(10)} → "${change.old}" ⟹ "${change.new}" (${change.anlam.substring(0, 25)})`);
        });
        
        if (fixedCount > 30) {
            console.log(`... ve ${fixedCount - 30} değişiklik daha\n`);
        }
    }
    
    // Dosyayı kaydet
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`\n✅ Dosya kaydedildi: ${OUTPUT_PATH}`);
    console.log('\n📝 Kontrol edin ve uygunsa:');
    console.log('   Move-Item -Force data\\uc_harfli_kelimeler_fixed_qaf.json data\\uc_harfli_kelimeler.json');
    console.log('\n🎉 Tamamlandı!\n');
}

fixQafPronunciation();

