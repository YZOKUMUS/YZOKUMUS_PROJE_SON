# Üç Harfli Kelimeler JSON Dosyası - Tespit Edilen Sorunlar

## 📋 Genel Durum

Dosya: `data/uc_harfli_kelimeler.json`  
Toplam kayıt: ~8,900+ kelime

---

## ❌ Tespit Edilen Sorunlar

### 1. **Okunuş Alanında Arapça Karakterler**

"okunus" alanı sadece Türkçe karakterler içermeli, ancak bazı kayıtlarda Arapça karakterler var:

#### Örnekler:

| Satır | Kelime | Mevcut Okunuş | Sorun | Düzeltilmiş Okunuş |
|-------|--------|---------------|-------|---------------------|
| 510 | `ٱغْفِرْ` | `"ٱğfir"` | Arapça `ٱ` karakteri | `"iğfir"` veya `"iğfir"` |
| 4003 | `حِزْبٍۭ` | `"hızbinۭ"` | Arapça `ۭ` karakteri | `"hızbin"` |
| 6033 | `غُلَٰمٌ` | `"ğuleٰmun"` | Arapça `ٰ` karakteri | `"ğulemun"` |
| 286 | `وَسْـَٔلِ` | `"vesـٔli"` | Arapça `ـٔ` karakteri | `"veseli"` veya `"ves'eli"` |
| 1777 | `شَيْـًٔا` | `"şeyـٔ"` | Arapça `ـٔ` karakteri | `"şey"` veya `"şey'"` |
| 3023 | `مَـَٔابِ` | `"meـٔbi"` | Arapça `ـٔ` karakteri | `"meabi"` veya `"me'abi"` |
| 3016 | `ٱرْجِعِ` | `"ٱrciı"` | Arapça `ٱ` karakteri | `"irciı"` |
| 3044 | `فَٱدْعُ` | `"feٱdu"` | Arapça `ٱ` karakteri | `"feidu"` veya `"fe'du"` |
| 5025 | `مُلَٰقٍ` | `"muleٰgın"` | Arapça `ٰ` karakteri | `"mulegın"` |

**Toplam:** En az 16 kayıt etkilenmiş (grep sonucu)

---

### 2. **Yazım Hataları (Anlam)**

| Satır | Kelime | Okunuş | Mevcut Anlam | Sorun | Düzeltilmiş Anlam |
|-------|---------|--------|--------------|-------|-------------------|
| 3003 | `وَلَّىٰ` | `"vella"` | `"Döndı"` | Yazım hatası | `"Döndü"` |
| 8022 | `وَحَبَّ` | `"vehabbe"` | `"Ve daneler"` | Eksik/yanlış | `"Ve hububat"` veya `"Ve daneler (hububat)"` |

---

### 3. **Okunuş Formatı Sorunları**

Bazı okunuşlarda tek tırnak (`'`) kullanılmış, bu doğru olabilir ama tutarlılık için kontrol edilmeli:

| Satır | Kelime | Okunuş | Not |
|-------|--------|--------|-----|
| 2820 | `نَّشَأْ` | `"neşe'"` | Tek tırnak kullanımı - doğru olabilir |

---

## ✅ Doğru Görünen Örnekler

| Kelime | Okunuş | Anlam | Durum |
|--------|--------|-------|-------|
| `اَكَلَ` | `"ekele"` | `"Yedi"` | ✅ Doğru |
| `اَمَلَ` | `"amele"` | `"Umut etti"` | ✅ Doğru |
| `ذَهَبَ` | `"zehebe"` | `"Gitti"` | ✅ Doğru |
| `عَلِمَ` | `"alime"` | `"Bildi"` | ✅ Doğru |
| `فَهِمَ` | `"fehime"` | `"Anladı"` | ✅ Doğru |
| `شَرِبَ` | `"şeribe"` | `"İçti"` | ✅ Doğru |
| `سَمِعَ` | `"semia"` | `"İşitti"` | ✅ Doğru |
| `رَجَعَ` | `"recea"` | `"Döndü"` | ✅ Doğru |

---

## 🔧 Önerilen Düzeltmeler

### 1. **Arapça Karakterleri Temizle**

Tüm "okunus" alanlarından Arapça karakterleri kaldır:
- `ٱ` → `i` veya kaldır
- `ۭ` → kaldır
- `ٰ` → kaldır
- `ـٔ` → `'` (tek tırnak) veya kaldır

### 2. **Yazım Hatalarını Düzelt**

- `"Döndı"` → `"Döndü"`
- `"Ve daneler"` → `"Ve hububat"` veya daha açıklayıcı anlam

### 3. **Tutarlılık Kontrolü**

Tüm okunuşlarda tutarlı format kullan:
- Tek tırnak (`'`) kullanımı standartlaştır
- Türkçe karakterler kullan (ğ, ş, ı, ü, ö, ç)

---

## 📊 İstatistikler

- **Toplam kayıt:** ~8,900+
- **Arapça karakter içeren okunuş:** En az 16 kayıt
- **Yazım hatası:** En az 2 kayıt
- **Sorunlu kayıt oranı:** ~0.2%

---

## 🎯 Sonraki Adımlar

1. ✅ Sorunları tespit et (bu dosya)
2. ⏳ Düzeltmeleri topla (oyun içinde düzeltme sistemi kullanılabilir)
3. ⏳ Düzeltmeleri uygula ve dosyayı güncelle
4. ⏳ Test et

---

**Not:** Bu rapor, dosyanın rastgele örneklerinin kontrolüne dayanmaktadır. Tüm dosyanın tam kontrolü için daha detaylı bir analiz gerekebilir.

