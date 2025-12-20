# GÜNLÜK SERİ (STREAK) SİSTEMİ - NASIL ÇALIŞIR?

## 📅 TAKVİMDE SERİ NASIL GÖRÜNÜR?

Takvimde her gün için:
- **Oynanan günler**: Yeşil nokta (●) ile işaretlenir
- **Bugün**: Özel vurgulama ile gösterilir
- **Oynanmayan günler**: Boş görünür

## 🔥 SERİ NE ZAMAN ARTAR?

Seri (streak) **sadece günlük hedef tamamlandığında** artar:

1. **Günlük hedef tamamlanınca** (`checkDailyGoal()` fonksiyonu):
   - Eğer `dailyProgress >= dailyGoal` ise
   - `updateStreakOnDailyGoalCompletion()` fonksiyonu çağrılır

## 📊 SERİ MANTIĞI

### 1. İlk Defa Hedef Tamamlama
- `currentStreak = 1` olur
- `lastPlayDate = bugünün tarihi` olur
- `playDates` array'ine bugünün tarihi eklenir

### 2. Ardışık Günler (Streak Devam Ediyor)
- Eğer **dün** hedef tamamlandıysa (`lastPlayDate === dün`):
  - `currentStreak++` (1 artar)
  - `lastPlayDate = bugün` olur
  - `playDates` array'ine bugün eklenir

### 3. Streak Kırılması (Gün Atlatma)
- Eğer dünden **önce** son oynanış varsa:
  - `currentStreak = 1` (yeni streak başlar)
  - `lastPlayDate = bugün` olur
  - `playDates` array'ine bugün eklenir

### 4. Best Streak Güncelleme
- Her streak artışında:
  - `bestStreak = Math.max(bestStreak, currentStreak)` ile güncellenir

## ⏰ NE ZAMAN GERÇEKLEŞİR?

### Otomatik Tetikleme:
1. **Oyun bitince** (`endGame()` fonksiyonu):
   - `checkDailyGoal()` çağrılır
   - Eğer günlük hedef tamamlandıysa → Streak artar

### Kontrol Zamanları:
- Oyun sonu (her oyun bitiminde)
- Günlük hedef tamamlanınca

## 📝 ÖRNEK SENARYOLAR

### Senaryo 1: İlk Gün
- **Pazartesi**: 2700 Hasene kazandınız
- ✅ Günlük hedef tamamlandı
- 🔥 Streak: 1 gün

### Senaryo 2: Ardışık Günler
- **Pazartesi**: 2700 Hasene → Streak: 1
- **Salı**: 2700 Hasene → Streak: 2
- **Çarşamba**: 2700 Hasene → Streak: 3

### Senaryo 3: Gün Atlatma
- **Pazartesi**: 2700 Hasene → Streak: 1
- **Salı**: Oyun oynamadınız (hedef tamamlanmadı)
- **Çarşamba**: 2700 Hasene → Streak: 1 (yeni streak başlar)

### Senaryo 4: Hedef Tamamlanmadan Oyun
- **Pazartesi**: 1000 Hasene kazandınız (hedef: 2700)
- ❌ Günlük hedef tamamlanmadı
- 🔥 Streak artmaz (önceki streak korunur veya kırılır)

## 🎯 ÖNEMLİ NOTLAR

1. **Sadece hedef tamamlanınca**: Streak, sadece günlük hedef (örn. 2700 Hasene) tamamlandığında artar
2. **Takvim işaretleme**: `playDates` array'ine sadece hedef tamamlanan günler eklenir
3. **Seri kırılması**: Eğer dün hedef tamamlanmadıysa, bugün hedef tamamlansa bile streak 1'den başlar
4. **Best Streak**: En uzun streak kaydedilir ve takvimde gösterilir

## 💾 VERİ YAPISI

```javascript
streakData = {
    currentStreak: 0,      // Mevcut seri (gün)
    bestStreak: 0,         // En uzun seri (gün)
    totalPlayDays: 0,      // Toplam oynanan gün sayısı
    lastPlayDate: '',      // Son hedef tamamlanan tarih (YYYY-MM-DD)
    playDates: []          // Hedef tamamlanan tüm tarihler (YYYY-MM-DD array)
}
```

## 📍 KOD YERLERİ

- **Streak Güncelleme**: `updateStreakOnDailyGoalCompletion()` (game-core.js:3164)
- **Günlük Hedef Kontrolü**: `checkDailyGoal()` (game-core.js:3247)
- **Takvim Gösterimi**: `showCalendarModal()` (game-core.js:3789)


