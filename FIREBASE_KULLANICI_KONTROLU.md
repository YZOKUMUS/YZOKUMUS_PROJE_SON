# FIREBASE KULLANICISI KONTROLÜ VE SIFIRLAMA KURALLARI

## 🔍 FIREBASE KULLANICISI NASIL OLUNUR?

### Otomatik Olarak Firebase Kullanıcısı Olma Şartları:

1. **Firebase Yapılandırması Aktif Olmalı:**
   - `firebase-config.js` dosyasında `apiKey` ve `projectId` gerçek değerler olmalı
   - `FIREBASE_ENABLED = true` olmalı

2. **Firebase Başarıyla Başlatılmalı:**
   - `initFirebase()` fonksiyonu başarılı olmalı
   - Firebase SDK yüklenmiş olmalı
   - İnternet bağlantısı olmalı

3. **Anonymous Authentication Başarılı Olmalı:**
   - `autoSignInAnonymous()` otomatik olarak çalışır
   - Firebase Anonymous Auth başarılı olursa → Firebase kullanıcısı olursunuz
   - Başarısız olursa → Local kullanıcı olursunuz

### Firebase Kullanıcısı ID Formatı:
- ✅ **Firebase Kullanıcı**: ID `pDAbkb42QxWTf30NWlcd65mwh2F3` gibi (Firebase UID)
- ❌ **Local Kullanıcı**: ID `local-1734789123456` gibi (`local-` ile başlar)

---

## 📊 KULLANICI TİPİ NASIL KONTROL EDİLİR?

### Tarayıcı Konsolunda (F12):

```javascript
// 1. Mevcut kullanıcı bilgisini görüntüle
window.getCurrentUser()

// Beklenen Sonuçlar:
// Firebase Kullanıcı: {id: "pDAbkb42QxWTf30NWlcd65mwh2F3", type: "firebase", username: "YZOKUMUS", ...}
// Local Kullanıcı: {id: "local-1734789123456", type: "local", username: "YZOKUMUS", ...}
```

```javascript
// 2. Firebase durumunu kontrol et
window.checkFirebaseStatus()

// Çıktı:
// Firebase enabled: true/false
// Current Firebase user: {...} veya null
// App user: {...}
```

```javascript
// 3. Backend tipini kontrol et
window.getBackendType()

// Sonuç: "firebase" veya "localStorage"
```

### localStorage Kontrolü:

Tarayıcı Konsolu → Application → Local Storage → Kontrol edin:

```javascript
// Firebase kullanıcısıysa:
localStorage.getItem('hasene_firebase_user_id')  // Firebase UID döner
localStorage.getItem('hasene_user_type')          // "firebase" döner

// Local kullanıcıysa:
localStorage.getItem('hasene_user_id')            // "local-..." döner
localStorage.getItem('hasene_user_type')          // "local" veya null
```

---

## 🔄 "TÜM OYUNU SIFIRLA" BUTONU - SIFIRLAMA KURALLARI

### resetAllData() Fonksiyonu Mantığı:

```javascript
// 1. HER ZAMAN SİLİNEN (Tüm kullanıcılar için):
// ✅ localStorage'daki TÜM 'hasene_*' keyleri
// ✅ Global değişkenler (totalPoints, streakData, gameStats, vb.)

// 2. SADECE FIREBASE KULLANICILARI İÇİN SİLİNEN:
if (user && !user.id.startsWith('local-') && typeof window.firestoreDelete === 'function') {
    // ✅ Firebase 'user_stats' collection
    // ✅ Firebase 'daily_tasks' collection  
    // ✅ Firebase 'weekly_leaderboard' collection (mevcut hafta + son 4 hafta)
}
```

### Sıfırlama Şartları Tablosu:

| Durum | localStorage | Firebase | Açıklama |
|-------|--------------|----------|----------|
| **Firebase Kullanıcı** | ✅ Sıfırlanır | ✅ Sıfırlanır | `user.id` `local-` ile başlamıyor |
| **Local Kullanıcı** | ✅ Sıfırlanır | ❌ Sıfırlanmaz | `user.id` `local-` ile başlıyor |
| **Firebase Yüklü Değil** | ✅ Sıfırlanır | ❌ Sıfırlanmaz | `firestoreDelete` fonksiyonu yok |

### Sıfırlama Kontrol Mantığı:

```javascript
// resetAllData() içinde:
const user = window.getCurrentUser();  // Kullanıcı bilgisini al

// Firebase kullanıcısı kontrolü:
if (user && !user.id.startsWith('local-')) {
    // Firebase kullanıcısı → Firebase verilerini sil
}
```

**ÖNEMLİ:** `user.id.startsWith('local-')` kontrolü kullanıcı tipini belirler!

---

## 🧪 TEST ETMEK İÇİN:

### Senaryo 1: Firebase Kullanıcısı Olarak Sıfırlama

1. **Firebase Durumunu Kontrol Et:**
   ```javascript
   window.checkFirebaseStatus()
   ```

2. **Kullanıcı Tipini Kontrol Et:**
   ```javascript
   const user = window.getCurrentUser();
   console.log('User Type:', user.type);
   console.log('User ID:', user.id);
   console.log('Is Firebase?', !user.id.startsWith('local-'));
   ```

3. **Sıfırlama Butonuna Bas**

4. **Konsol Loglarını İzle:**
   - `🔥 Firebase verileri siliniyor...` görünmeli
   - `✅ Firebase verileri silindi` görünmeli

5. **Firebase Console'u Kontrol Et:**
   - `user_stats` collection → Doküman silinmiş olmalı
   - `daily_tasks` collection → Doküman silinmiş olmalı
   - `weekly_leaderboard` collection → İlgili dokümanlar silinmiş olmalı

### Senaryo 2: Local Kullanıcı Olarak Sıfırlama

1. **Kullanıcı Tipini Kontrol Et:**
   ```javascript
   const user = window.getCurrentUser();
   console.log('User ID:', user.id);  // "local-..." olmalı
   ```

2. **Sıfırlama Butonuna Bas**

3. **Konsol Loglarını İzle:**
   - `🔥 Firebase verileri siliniyor...` görünMEMELİ
   - Sadece localStorage temizleme logları görünmeli

---

## ⚠️ ÖNEMLİ NOTLAR:

1. **Kullanıcı Adı (YZOKUMUS) Değiştirmez:**
   - Kullanıcı adı sadece `username` alanını değiştirir
   - Kullanıcı **tipini** (local/Firebase) değiştirmez
   - Firebase kullanıcısıysanız Firebase kullanıcısı kalırsınız
   - Local kullanıcıysanız local kullanıcı kalırsınız

2. **Firebase Kullanıcısı Olmak İçin:**
   - Firebase yapılandırması doğru olmalı
   - Firebase başarıyla başlatılmalı
   - Anonymous Auth başarılı olmalı
   - Manuel bir işlem gerekmez (otomatik)

3. **Sıfırlama Sonrası:**
   - Sayfa yenilenir
   - Yeni günlük görevler oluşturulur
   - Firebase kullanıcısıysanız, yeni görevler Firebase'e kaydedilir

---

## 🔧 FIREBASE KULLANICISI OLMAYI ZORLAMAK İÇİN:

Eğer Firebase kullanıcısı olmak istiyorsanız:

1. Firebase Console'da Anonymous Auth'un aktif olduğundan emin olun
2. `firebase-config.js` dosyasının doğru yapılandırıldığını kontrol edin
3. Sayfayı yenileyin - Firebase otomatik başlatılır
4. Konsol loglarında `✅ Firebase anonymous sign-in successful` görünmeli

Eğer hala local kullanıcıysanız:
- Firebase başlatma hatası olabilir
- İnternet bağlantısı sorunu olabilir
- Firebase yapılandırması yanlış olabilir

