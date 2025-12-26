/**
 * Script: Improve Turkish Pronunciation
 * Arapça kelimeleri Türkçe telaffuz kurallarına göre düzeltir
 */

const fs = require('fs');
const path = require('path');

const UC_HARFLI_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler.json');
const BACKUP_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler_backup.json');
const OUTPUT_PATH = path.join(__dirname, 'data', 'uc_harfli_kelimeler_improved.json');

// Gelişmiş Arapça-Türkçe harfleme tablosu
const IMPROVED_TRANSLITERATION = {
    // Elif ve varyantları
    'ا': { base: '', withFetha: 'a', withKesra: 'i', withDamma: 'u' },
    'أ': { base: 'e', withFetha: 'e', withKesra: 'i', withDamma: 'u' },
    'إ': { base: 'i', withFetha: 'e', withKesra: 'i', withDamma: 'u' },
    'آ': { base: 'â', withFetha: 'â', withKesra: 'î', withDamma: 'û' },
    'ء': { base: '', withFetha: 'e', withKesra: 'i', withDamma: 'u' },
    
    // Konsonantlar - Kalın harfler
    'ب': { base: 'b', withFetha: 'be', withKesra: 'bi', withDamma: 'bu' },
    'ت': { base: 't', withFetha: 'te', withKesra: 'ti', withDamma: 'tu' },
    'ث': { base: 's', withFetha: 'se', withKesra: 'si', withDamma: 'su' },
    'ج': { base: 'c', withFetha: 'ce', withKesra: 'ci', withDamma: 'cu' },
    'ح': { base: 'h', withFetha: 'ha', withKesra: 'hı', withDamma: 'hu' },
    'خ': { base: 'h', withFetha: 'ha', withKesra: 'hı', withDamma: 'hu' },
    'د': { base: 'd', withFetha: 'de', withKesra: 'di', withDamma: 'du' },
    'ذ': { base: 'z', withFetha: 'ze', withKesra: 'zi', withDamma: 'zu' },
    'ر': { base: 'r', withFetha: 're', withKesra: 'ri', withDamma: 'ru' },
    'ز': { base: 'z', withFetha: 'ze', withKesra: 'zi', withDamma: 'zu' },
    'س': { base: 's', withFetha: 'se', withKesra: 'si', withDamma: 'su' },
    'ش': { base: 'ş', withFetha: 'şe', withKesra: 'şi', withDamma: 'şu' },
    
    // Kalın harfler (emphatik)
    'ص': { base: 's', withFetha: 'sa', withKesra: 'sı', withDamma: 'su' },
    'ض': { base: 'd', withFetha: 'da', withKesra: 'dı', withDamma: 'du' },
    'ط': { base: 't', withFetha: 'ta', withKesra: 'tı', withDamma: 'tu' },
    'ظ': { base: 'z', withFetha: 'za', withKesra: 'zı', withDamma: 'zu' },
    'ع': { base: 'a', withFetha: 'a', withKesra: 'ı', withDamma: 'u' },
    'غ': { base: 'ğ', withFetha: 'ğa', withKesra: 'ğı', withDamma: 'ğu' },
    
    // Devam eden konsonantlar
    'ف': { base: 'f', withFetha: 'fe', withKesra: 'fi', withDamma: 'fu' },
    'ق': { base: 'k', withFetha: 'ka', withKesra: 'kı', withDamma: 'ku' },
    'ك': { base: 'k', withFetha: 'ke', withKesra: 'ki', withDamma: 'ku' },
    'ل': { base: 'l', withFetha: 'le', withKesra: 'li', withDamma: 'lu' },
    'م': { base: 'm', withFetha: 'me', withKesra: 'mi', withDamma: 'mu' },
    'ن': { base: 'n', withFetha: 'ne', withKesra: 'ni', withDamma: 'nu' },
    'ه': { base: 'h', withFetha: 'he', withKesra: 'hi', withDamma: 'hu' },
    'و': { base: 'v', withFetha: 've', withKesra: 'vi', withDamma: 'vu' },
    'ي': { base: 'y', withFetha: 'ye', withKesra: 'yi', withDamma: 'yu' },
    'ى': { base: 'a', withFetha: 'a', withKesra: 'i', withDamma: 'u' },
    'ة': { base: 't', withFetha: 'te', withKesra: 'ti', withDamma: 'tu' },
    'ئ': { base: '', withFetha: 'e', withKesra: 'i', withDamma: 'u' },
    'ؤ': { base: 'u', withFetha: 'ue', withKesra: 'ui', withDamma: 'u' }
};

// Harekeler
const HARAKAAT = {
    '\u064E': 'fetha',   // Üstün (َ)
    '\u064F': 'damma',   // Ötre (ُ)
    '\u0650': 'kesra',   // Esre (ِ)
    '\u0652': 'sukun',   // Cezm (ْ)
    '\u0651': 'shadda',  // Şedde (ّ)
    '\u064B': 'tanween_fetha', // Tenvin üstün (ً)
    '\u064C': 'tanween_damma', // Tenvin ötre (ٌ)
    '\u064D': 'tanween_kesra'  // Tenvin esre (ٍ)
};

/**
 * Gelişmiş Türkçe transliterasyon
 */
function improvedTransliteration(arabicWord) {
    let result = '';
    let i = 0;
    
    while (i < arabicWord.length) {
        const char = arabicWord[i];
        const nextChar = arabicWord[i + 1];
        const nextNextChar = arabicWord[i + 2];
        
        // Harekeyi tespit et
        let haraka = null;
        if (nextChar && HARAKAAT[nextChar]) {
            haraka = HARAKAAT[nextChar];
        }
        
        // Şedde kontrolü
        let hasShaddah = false;
        if (nextChar === '\u0651') {
            hasShaddah = true;
            // Şeddeden sonraki harekeyi al
            if (nextNextChar && HARAKAAT[nextNextChar]) {
                haraka = HARAKAAT[nextNextChar];
            }
        } else if (nextNextChar === '\u0651') {
            hasShaddah = true;
        }
        
        // Harf transliterasyonu
        if (IMPROVED_TRANSLITERATION[char]) {
            const letterMap = IMPROVED_TRANSLITERATION[char];
            let transliterated = '';
            
            if (haraka === 'fetha') {
                transliterated = letterMap.withFetha;
            } else if (haraka === 'kesra') {
                transliterated = letterMap.withKesra;
            } else if (haraka === 'damma') {
                transliterated = letterMap.withDamma;
            } else if (haraka === 'sukun') {
                transliterated = letterMap.base;
            } else if (haraka === 'tanween_fetha') {
                transliterated = letterMap.withFetha + 'n';
            } else if (haraka === 'tanween_damma') {
                transliterated = letterMap.withDamma + 'n';
            } else if (haraka === 'tanween_kesra') {
                transliterated = letterMap.withKesra + 'n';
            } else {
                // Hareke yoksa base kullan
                transliterated = letterMap.base;
            }
            
            // Şedde varsa harfi tekrarla
            if (hasShaddah && letterMap.base) {
                result += letterMap.base + transliterated;
            } else {
                result += transliterated;
            }
        } else if (!HARAKAAT[char]) {
            // Bilinmeyen karakter, olduğu gibi ekle (ama hareke değilse)
            result += char;
        }
        
        i++;
    }
    
    // Temizlik
    result = result
        .replace(/aa+/g, 'â')  // Çift a'ları tek â yap
        .replace(/ii+/g, 'î')  // Çift i'leri tek î yap
        .replace(/uu+/g, 'û')  // Çift u'ları tek û yap
        .trim();
    
    return result || 'unknown';
}

/**
 * Ana fonksiyon
 */
function improvePronunciations() {
    console.log('🚀 Türkçe Okunuş İyileştirme Script\'i Başlatıldı...\n');
    
    // Dosyayı oku
    console.log('📖 uc_harfli_kelimeler.json okunuyor...');
    let data;
    try {
        const content = fs.readFileSync(UC_HARFLI_PATH, 'utf8');
        data = JSON.parse(content);
        console.log(`✅ ${data.kelimeler.length} kelime yüklendi\n`);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
    
    // Backup oluştur
    console.log('💾 Yedek oluşturuluyor...');
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Yedek kaydedildi: ${BACKUP_PATH}\n`);
    
    // Okunuşları iyileştir
    console.log('🔧 Okunuşlar iyileştiriliyor...\n');
    
    let improvedCount = 0;
    const changes = [];
    
    for (let i = 0; i < data.kelimeler.length; i++) {
        const kelime = data.kelimeler[i];
        const oldOkunus = kelime.okunus;
        const newOkunus = improvedTransliteration(kelime.kelime);
        
        if (oldOkunus !== newOkunus && newOkunus !== 'unknown') {
            kelime.okunus = newOkunus;
            improvedCount++;
            
            // İlk 20 değişikliği kaydet
            if (changes.length < 20) {
                changes.push({
                    kelime: kelime.kelime,
                    anlam: kelime.anlam,
                    old: oldOkunus,
                    new: newOkunus
                });
            }
        }
        
        if ((i + 1) % 200 === 0) {
            console.log(`⏳ ${i + 1}/${data.kelimeler.length} kelime işlendi...`);
        }
    }
    
    console.log(`\n✅ Toplam ${improvedCount} okunuş iyileştirildi\n`);
    
    // Değişiklikleri göster
    if (changes.length > 0) {
        console.log('📋 İyileştirilen okunuşlar (ilk 20):');
        console.log('─'.repeat(90));
        changes.forEach((change, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${change.kelime.padEnd(10)} → "${change.old}" ⟹ "${change.new}" (${change.anlam.substring(0, 20)})`);
        });
        
        if (improvedCount > 20) {
            console.log(`... ve ${improvedCount - 20} değişiklik daha\n`);
        }
    }
    
    // Dosyayı kaydet
    console.log('\n💾 İyileştirilmiş dosya kaydediliyor...');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Dosya kaydedildi: ${OUTPUT_PATH}`);
    console.log(`📊 İstatistikler:`);
    console.log(`   - Toplam kelime: ${data.kelimeler.length}`);
    console.log(`   - İyileştirilen: ${improvedCount}`);
    console.log(`   - Değişmeden kalan: ${data.kelimeler.length - improvedCount}`);
    
    console.log('\n📝 Dosyayı kontrol edin ve uygunsa değiştirin:');
    console.log(`   Windows: move /Y data\\uc_harfli_kelimeler_improved.json data\\uc_harfli_kelimeler.json`);
    console.log(`   Yedek: ${BACKUP_PATH}`);
    
    console.log('\n🎉 Script tamamlandı!\n');
}

// Script'i çalıştır
improvePronunciations();

