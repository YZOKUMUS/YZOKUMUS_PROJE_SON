# 🔍 Firebase Veri Kontrol Rehberi

**Tarih**: 25 Aralık 2024  
**Amaç**: YZOKUMUS kullanıcısı için Firebase'de veri olup olmadığını kontrol etmek

---

## 🛠️ Debug Tool Eklendi

### Yeni Dosya: `js/firebase-debug-tool.js`

Bu tool Firebase'deki verileri kontrol etmenizi sağlar.

---

## 📋 Kullanım Adımları

### 1. Sayfayı Yenile
```
- Uygulamayı tarayıcıda aç
- F5 ile sayfayı yenile
```

### 2. Console'u Aç
```
- Chrome: F12 veya Ctrl+Shift+J
- Firefox: F12 veya Ctrl+Shift+K
- Safari: Cmd+Option+C
```

### 3. Debug Komutunu Çalıştır
```javascript
// Console'a şunu yaz:
debugFirebase("YZOKUMUS")
```

veya

```javascript
// Detaylı versiyonu:
window.checkFirebaseData("YZOKUMUS")
```

---

## 📊 Console'da Görecekleriniz

### ✅ Eğer Firebase'de veri VARSA:
```
🔍 FIREBASE VERİ KONTROL ARACI
============================================================
Kullanıcı adı: YZOKUMUS
Firebase Document ID: yzokumus

☁️ FIREBASE'DEN VERİ OKUMA:
  - user_stats doc exists: true
  - user_stats data:
    • total_points: 1500
    • user_id: abc123...
    • streak_data: {...}
    • game_stats: {...}

✅ Kontrol tamamlandı!
```

### ❌ Eğer Firebase'de veri YOKSA:
```
🔍 FIREBASE VERİ KONTROL ARACI
============================================================
Kullanıcı adı: YZOKUMUS
Firebase Document ID: yzokumus

☁️ FIREBASE'DEN VERİ OKUMA:
  - user_stats doc exists: false
  ❌ Firebase'de user_stats bulunamadı!
  ℹ️ Bu kullanıcı için hiç veri kaydedilmemiş olabilir.

✅ Kontrol tamamlandı!
```

---

## 🔍 Ne Kontrol Edilecek?

Tool şunları kontrol eder:

1. **Username → Document ID Dönüşümü**
   - `YZOKUMUS` → `yzokumus` (küçük harf)
   
2. **Firebase Durum**
   - Firebase enabled mi?
   - Firestore bağlantısı var mı?
   - Kullanıcı giriş yapmış mı?

3. **LocalStorage Durum**
   - `hasene_username`: YZOKUMUS
   - `hasene_totalPoints`: ?
   - `hasene_user_type`: local veya firebase

4. **Firebase'den Veri Okuma**
   - `user_stats/yzokumus` document var mı?
   - `total_points` değeri ne?
   - `daily_tasks` verisi var mı?

5. **Firebase Auth Durum**
   - Kullanıcı giriş yapmış mı?
   - UID nedir?

---

## 🎯 Sonuç Analizi

### Senaryo 1: Firebase'de veri YOK
```
Sebep: Hiç oyun oynanmamış veya sync başarısız olmuş
Çözüm: Oyun oyna, puan kazan, Firebase'e sync olacak
```

### Senaryo 2: Firebase'de veri VAR ama gelmiyor
```
Sebep: loadUserStats() fonksiyonunda sorun
Çözüm: Console'da hata mesajlarını kontrol et
```

### Senaryo 3: Permission Denied
```
Sebep: Firebase auth gerekli
Çözüm: window.autoSignInAnonymous() çalıştır
```

---

## 🔧 Manuel Veri Kaydetme (Test)

Eğer Firebase'de veri yoksa, manuel olarak kaydedebilirsin:

```javascript
// Console'da çalıştır:

// 1. Anonymous auth
await window.autoSignInAnonymous();

// 2. Kullanıcı adını ayarla
localStorage.setItem('hasene_username', 'YZOKUMUS');

// 3. Puan ekle
localStorage.setItem('hasene_totalPoints', '1500');

// 4. Firebase'e sync et
await window.saveUserStats({ 
    total_points: 1500,
    streak_data: { current: 0, longest: 0 },
    game_stats: {}
});

// 5. Kontrol et
debugFirebase("YZOKUMUS");
```

---

## 📝 Örnek Console Çıktısı

```
🔍 usernameToDocId called with: YZOKUMUS
✅ usernameToDocId result: yzokumus (from input: YZOKUMUS)

🔍 loadUserStats - Attempting to load from Firebase with docId: yzokumus for username: YZOKUMUS

☁️ User stats loaded from Firebase (username: YZOKUMUS)

✅ Kullanıcı istatistikleri Firebase'den yüklendi
```

---

## ⚠️ Sorun Giderme

### Sorun 1: "Firebase not enabled"
```javascript
// Çözüm: Firebase config'i kontrol et
console.log(window.FIREBASE_ENABLED);
console.log(window.firebaseConfig);
```

### Sorun 2: "Permission denied"
```javascript
// Çözüm: Anonymous auth yap
await window.autoSignInAnonymous();
console.log(window.firebaseAuth.currentUser);
```

### Sorun 3: "Document not found"
```javascript
// Çözüm: Veri kaydedilmemiş, oyun oyna
// Veya manuel kaydet (yukarıdaki kodu kullan)
```

---

## 🎯 Sonuç

Bu tool ile Firebase'de YZOKUMUS kullanıcısı için:
1. ✅ Veri var mı yok mu göreceksin
2. ✅ total_points değerini göreceksin
3. ✅ Auth durumunu kontrol edeceksin
4. ✅ Hangi collection'larda veri olduğunu göreceksin

**Kullanım**: Console'da `debugFirebase("YZOKUMUS")` yaz! 🚀

