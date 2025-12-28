/**
 * Uzatma Med JSON Kontrol Script'i
 * Kelime ve okunuş uyumunu kontrol eder
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'uzatma_med.json');

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

console.log('🔍 Uzatma Med JSON Kontrolü\n');
console.log(`📊 Toplam kelime: ${data.kelimeler.length}\n`);

const errors = [];
const warnings = [];
const duplicates = {};

// ID kontrolü ve tekrarlar
const idMap = {};
const kelimeMap = {};

data.kelimeler.forEach((item, index) => {
    // ID kontrolü
    if (idMap[item.id]) {
        errors.push(`❌ ID ${item.id} tekrar ediyor (Satır: ${index + 1})`);
    }
    idMap[item.id] = item;
    
    // Kelime tekrarı kontrolü
    const key = item.kelime.trim();
    if (kelimeMap[key]) {
        if (!duplicates[key]) duplicates[key] = [];
        duplicates[key].push({ id: item.id, index: index + 1 });
    } else {
        kelimeMap[key] = item.id;
    }
});

// ID sıralaması kontrolü
const ids = data.kelimeler.map(k => k.id).sort((a, b) => a - b);
for (let i = 0; i < ids.length - 1; i++) {
    if (ids[i + 1] - ids[i] > 1) {
        warnings.push(`⚠️  ID sıralaması: ${ids[i]}'den sonra ${ids[i + 1]} geliyor (${ids[i + 1] - ids[i] - 1} ID eksik)`);
    }
}

// Tekrar eden kelimeler
Object.keys(duplicates).forEach(kelime => {
    const items = duplicates[kelime];
    if (items.length > 0) {
        errors.push(`❌ "${kelime}" kelimesi ${items.length + 1} kez tekrar ediyor: ID ${items.map(i => i.id).join(', ')}`);
    }
});

// Şüpheli okunuşlar
const suspicious = [
    { id: 52, kelime: 'أَيْدِيهِمْ', okunus: 'eydiyhhim', issue: 'Okunuşta "hh" var, muhtemelen "eydihim" olmalı' },
    { id: 63, kelime: 'طه', okunus: 'daha', issue: 'Okunuş "daha" yanlış görünüyor, "Taha" olmalı' },
    { id: 26, kelime: 'كَانُو', okunus: 'kanu', issue: 'Med harfi var ama okunuşta uzatma yok, "kânu" olabilir' },
    { id: 38, kelime: 'الْوَارِثُونَ', okunus: 'e varisune', issue: 'Başında "el" var ama okunuşta sadece "e" yazılmış, kontrol edilmeli' }
];

suspicious.forEach(item => {
    warnings.push(`⚠️  ID ${item.id}: "${item.kelime}" → "${item.okunus}" - ${item.issue}`);
});

// Sonuçları yazdır
console.log('═══════════════════════════════════════\n');

if (errors.length > 0) {
    console.log('❌ HATALAR:\n');
    errors.forEach(err => console.log(err));
    console.log('');
}

if (warnings.length > 0) {
    console.log('⚠️  UYARILAR:\n');
    warnings.forEach(warn => console.log(warn));
    console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Hiç hata bulunamadı!\n');
} else {
    console.log(`\n📊 Özet:`);
    console.log(`   - Hatalar: ${errors.length}`);
    console.log(`   - Uyarılar: ${warnings.length}\n`);
}

