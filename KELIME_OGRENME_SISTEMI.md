# Kelime Öğrenme Sistemi - Nasıl Çalışır?

## 📊 Mastery Level (Ustalık Seviyesi) Hesaplama

Bir kelime **"öğrenilen kelimeler"** içine girmek için **masteryLevel >= 4** olmalı.

### Mastery Level Nasıl Hesaplanır?

```javascript
masteryLevel = Math.floor(successRate / 10)
```

**Başarı Oranı (Success Rate)** = `(Doğru Cevap Sayısı / Toplam Deneme Sayısı) * 100`

### Mastery Level Tablosu

| Başarı Oranı | Mastery Level | Kategori |
|--------------|---------------|----------|
| 0-9% | 0 | Yeni/Zorlanılan |
| 10-19% | 1 | Zorlanılan |
| 20-29% | 2 | Zorlanılan |
| 30-39% | 3 | Zorlanılan |
| **40-49%** | **4** | **Öğrenilen (Başlangıç)** |
| 50-59% | 5 | Öğrenilen |
| 60-69% | 6 | Öğrenilen |
| 70-79% | 7 | Öğrenilen |
| **80-89%** | **8** | **Ustalaşılan (Başlangıç)** |
| 90-99% | 9 | Ustalaşılan |
| 100% | 10 | Tam Ustalaşılan |

---

## 🎯 Kelimeler Ne Zaman "Öğrenilen Kelimeler" İçine Girer?

### Cevap: Başarı Oranı %40'a Ulaştığında

Bir kelime **"öğrenilen kelimeler"** listesine girmek için:
- **masteryLevel >= 4** olmalı
- Bu da **başarı oranının %40+** olması demek

### Örnek Senaryolar:

#### Senaryo 1: İlk 4 Denemede Hep Doğru
- 4 doğru / 4 deneme = %100 başarı
- masteryLevel = 10
- ✅ **Hemen "Öğrenilen" kategorisine girer** (hatta "Ustalaşılan")

#### Senaryo 2: 10 Denemede 4 Doğru
- 4 doğru / 10 deneme = %40 başarı
- masteryLevel = 4
- ✅ **"Öğrenilen" kategorisine girer**

#### Senaryo 3: 10 Denemede 3 Doğru
- 3 doğru / 10 deneme = %30 başarı
- masteryLevel = 3
- ❌ **Hala "Zorlanılan" kategorisinde**

#### Senaryo 4: 5 Denemede 2 Doğru
- 2 doğru / 5 deneme = %40 başarı
- masteryLevel = 4
- ✅ **"Öğrenilen" kategorisine girer**

---

## 📈 Kategori Geçişleri

### 1. Zorlanılan Kelimeler (masteryLevel < 4)
- Başarı oranı: **0-39%**
- Örnek: 10 denemede 3 doğru = %30 → masteryLevel = 3

### 2. Öğrenilen Kelimeler (masteryLevel 4-7)
- Başarı oranı: **40-79%**
- Örnek: 10 denemede 5 doğru = %50 → masteryLevel = 5
- **Bu kategoriye girmek için minimum: %40 başarı**

### 3. Ustalaşılan Kelimeler (masteryLevel >= 8)
- Başarı oranı: **80-100%**
- Örnek: 10 denemede 8 doğru = %80 → masteryLevel = 8
- **Bu kategoriye girmek için minimum: %80 başarı**

---

## 🔄 SM-2 Algoritması (Spaced Repetition)

Sistem **SM-2 algoritması** kullanıyor. Bu algoritma:
- Doğru cevaplarda: Tekrar aralığını artırır
- Yanlış cevaplarda: Tekrar aralığını sıfırlar
- Başarı oranına göre: Ease factor'ü ayarlar

### Önemli Not:
**Mastery Level sadece başarı oranına bağlıdır**, tekrar aralığına değil. Yani:
- Bir kelimeyi 10 kez deneyip 4 kez doğru bilirseniz → %40 → masteryLevel = 4 → "Öğrenilen"
- Tekrar aralığı ne olursa olsun, başarı oranı %40'a ulaştığında "Öğrenilen" kategorisine girer

---

## 💡 Pratik Örnekler

### Örnek 1: Hızlı Öğrenme
- **1. deneme:** Doğru ✅ → %100 → masteryLevel = 10 → **Ustalaşılan**
- **2. deneme:** Doğru ✅ → %100 → masteryLevel = 10 → **Ustalaşılan**

### Örnek 2: Normal Öğrenme
- **1. deneme:** Yanlış ❌ → %0 → masteryLevel = 0 → Zorlanılan
- **2. deneme:** Doğru ✅ → %50 → masteryLevel = 5 → **Öğrenilen**
- **3. deneme:** Doğru ✅ → %67 → masteryLevel = 6 → **Öğrenilen**

### Örnek 3: Yavaş Öğrenme
- **1-3. deneme:** Yanlış ❌ → %0 → masteryLevel = 0 → Zorlanılan
- **4. deneme:** Doğru ✅ → %25 → masteryLevel = 2 → Zorlanılan
- **5. deneme:** Doğru ✅ → %40 → masteryLevel = 4 → **Öğrenilen** ✅

---

## 🎯 Özet

**Bir kelime "öğrenilen kelimeler" içine girmek için:**
- ✅ Başarı oranı **%40 veya üzeri** olmalı
- ✅ Bu da **masteryLevel >= 4** demek
- ✅ En az **toplam denemelerin %40'ı doğru** olmalı

**Örnek:**
- 10 denemede 4 doğru = %40 → ✅ Öğrenilen
- 5 denemede 2 doğru = %40 → ✅ Öğrenilen
- 20 denemede 8 doğru = %40 → ✅ Öğrenilen

---

**Son Güncelleme:** 2026-01-04

