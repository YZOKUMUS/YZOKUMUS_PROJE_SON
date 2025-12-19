# HASENE PUANLAMA SİSTEMİ - DETAYLI AÇIKLAMA

## 📊 TOPLAM HASENE'YE EKLENENLER

Toplam Hasene **birikimli** bir değerdir, **hiç sıfırlanmaz**. Tüm zamanlardan kazanılan puanların toplamıdır.

### 1. OYUN İÇİ PUANLAR (Her Oyun Modunda)
- **Her doğru cevap**: `basePoints + comboBonus`
  - Kolay: 5 puan + 2 combo = **7 puan**
  - Orta: 10 puan + 2 combo = **12 puan**
  - Zor: 15 puan + 2 combo = **17 puan**
- **Perfect Bonus** (Hatasız oyun, 3+ soru): **+50 puan**
- **Oyun Sonu**: Tüm `sessionScore` (tüm doğru cevaplar + perfect bonus) `totalPoints`'e eklenir

### 2. GÜNLÜK HEDEF BONUSU
- Günlük hedef tamamlandığında: **+100 puan**
- Sadece **bir kez** günde verilir

### 3. ACHIEVEMENT (BAŞARIM) PUANLARI
- Yeni bir başarım açıldığında, o başarımın tanımlı puanı verilir
- Başarım başına farklı puanlar olabilir

### 4. GÜNLÜK ÖDÜL KUTUSU (Daily Reward Box)
- Tüm görevler tamamlandığında açılan kutu
- Rastgele: **100, 250 veya 500 puan**

### 5. GÖREV TAMAMLAMA ÖDÜLLERİ (Task Rewards)
- Günlük görevler tamamlandığında
- İslami öğreti bazlı rastgele ödül: **Değişken miktar**

---

## 📅 GÜNLÜK HASENE'YE EKLENENLER

Günlük Hasene **sadece bugün** kazanılan puanları gösterir, **her gün 24:00'te sıfırlanır**.

### 1. OYUN İÇİ PUANLAR (Her Oyun Modunda)
- **Her doğru cevap**: `basePoints + comboBonus`
  - Kolay: 5 + 2 = **7 puan**
  - Orta: 10 + 2 = **12 puan**
  - Zor: 15 + 2 = **17 puan**
- **Perfect Bonus**: **+50 puan** (hatasız oyun)

### 2. GÜNLÜK HEDEF BONUSU
- Günlük hedef tamamlandığında: **+100 puan**
- Bu bonus **hem toplam hem günlük** Hasene'ye eklenir

---

## ⚠️ ÖNEMLİ FARKLAR

### ❌ GÜNLÜK HASENE'YE EKLENMEYENLER (Ama Toplam Hasene'ye Eklenir)

1. **Achievement Puanları**: Başarım açıldığında sadece `totalPoints`'e eklenir
2. **Günlük Ödül Kutusu** (100-500 puan): Sadece `totalPoints`'e eklenir
3. **Görev Tamamlama Ödülleri**: Sadece `totalPoints`'e eklenir

### ✅ İKİSİNE DE EKLENENLER

1. **Her doğru cevap puanı** (basePoints + comboBonus)
2. **Perfect Bonus** (50 puan)
3. **Günlük Hedef Bonusu** (100 puan)

---

## 📈 MANTIK ÖRNEKLERİ

### Örnek 1: İlk Oyun (Sıfırdan Başlangıç)
- 10 soru doğru cevaplandı (Kolay mod, 7 puan/soru)
- Perfect bonus yok (1 yanlış var)
- **Günlük Hasene**: 10 × 7 = **70 puan**
- **Toplam Hasene**: 70 puan
- ✅ **Eşit** (İlk oyun olduğu için)

### Örnek 2: İkinci Gün (Önceki Günden Birikim Var)
**Önceki Gün:**
- Toplam Hasene: 500 puan
- Günlük Hasene: 500 puan (o gün)

**Bugün (Yeni Gün):**
- 20 soru doğru cevaplandı (Orta mod, 12 puan/soru)
- Perfect bonus var (+50)
- Günlük hedef tamamlandı (+100)
- **Günlük Hasene**: (20 × 12) + 50 + 100 = **390 puan**
- **Toplam Hasene**: 500 + 390 = **890 puan**
- ✅ **Normal** (Toplam > Günlük, çünkü önceki günden birikim var)

### Örnek 3: Günlük Ödül Kutusu Açıldı
- Önceki toplam: 1000 puan
- Günlük Hasene: 300 puan
- Ödül kutusu: 250 puan
- **Günlük Hasene**: 300 puan (değişmez)
- **Toplam Hasene**: 1000 + 250 = **1250 puan**
- ⚠️ **Fark artar** (Çünkü ödül sadece toplama eklenir)

---

## 🎯 SONUÇ

- **Toplam Hasene**: Tüm zamanlardan birikmiş puanlar (hiç sıfırlanmaz)
- **Günlük Hasene**: Sadece bugün kazanılan puanlar (her gün sıfırlanır)
- **İlk oyunda**: Toplam = Günlük (eşit olmalı)
- **Sonraki günlerde**: Toplam ≥ Günlük (normal durum)
- **Fark nedeni**: Toplam birikimli, günlük sadece bugünkü ilerleme

