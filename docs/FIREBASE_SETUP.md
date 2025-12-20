# 🔥 Firebase Kurulum Kılavuzu

Bu dosya, Hasene Arapça Dersi projesine Firebase entegrasyonunu kurmak için adım adım kılavuzdur.

## 📋 Ön Gereksinimler

1. **Google Hesabı** (Firebase Console'a giriş için)
2. **Firebase Console Erişimi**: https://console.firebase.google.com/

## 🚀 Adım Adım Kurulum

### 1. Firebase Projesi Oluşturma veya Mevcut Projeyi Kullanma

#### Seçenek A: Yeni Proje Oluşturma (Eğer limit yoksa)

1. **Firebase Console'a gidin**: https://console.firebase.google.com/
2. **"Add project"** veya **"Proje Ekle"** butonuna tıklayın
3. **Proje bilgilerini girin**:
   - Project name: `Hasene Arapça Dersi` (veya istediğiniz isim)
   - Google Analytics: İsterseniz açabilirsiniz (opsiyonel)
4. **"Create project"** / **"Proje oluştur"** butonuna tıklayın
5. Birkaç saniye bekleyin, proje oluşturulacak

#### Seçenek B: Mevcut Projeyi Kullanma (Limit dolduysa veya tercih ederseniz)

1. **Firebase Console'a gidin**: https://console.firebase.google.com/
2. Mevcut bir projenizi seçin (veya yeni bir tane oluşturun)
3. ⚠️ **Not**: Eğer "project limit" hatası alıyorsanız:
   - Mevcut bir projeyi kullanabilirsiniz
   - Veya [Firebase Support](https://firebase.google.com/support) ile iletişime geçerek limit artırımı talep edebilirsiniz
4. Projeyi seçtikten sonra aşağıdaki adımlara devam edin

### 2. Authentication Ayarları (Anonymous Auth)

1. Firebase Console'da projenizi seçin
2. Sol menüden **"Authentication"** / **"Kimlik Doğrulama"** seçin
3. **"Get started"** / **"Başlat"** butonuna tıklayın
4. **"Sign-in method"** / **"Oturum açma yöntemi"** sekmesine gidin
5. **"Anonymous"** / **"Anonim"** yöntemini bulun ve tıklayın
6. **"Enable"** / **"Etkinleştir"** butonuna tıklayın
7. **"Save"** / **"Kaydet"** butonuna tıklayın

### 3. Firestore Database Oluşturma

1. Sol menüden **"Firestore Database"** / **"Firestore Veritabanı"** seçin
2. **"Create database"** / **"Veritabanı oluştur"** butonuna tıklayın
3. **Güvenlik kuralları** seçin:
   - **"Start in test mode"** / **"Test modunda başlat"** (başlangıç için)
   - ⚠️ **ÖNEMLİ**: Sonra `firestore.rules` dosyasındaki kuralları yükleyeceğiz
4. **Location** / **"Konum"** seçin (örnek: `europe-west1`, `us-central1`)
5. **"Enable"** / **"Etkinleştir"** butonuna tıklayın

### 4. Firestore Güvenlik Kurallarını Yükleme

1. **Firestore Database** → **"Rules"** / **"Kurallar"** sekmesine gidin
2. **`firestore.rules`** dosyasındaki içeriği kopyalayın
3. Firebase Console'daki Rules editörüne yapıştırın
4. **"Publish"** / **"Yayınla"** butonuna tıklayın

### 5. Web App Yapılandırması

1. Firebase Console'da projenizi seçin
2. ⚙️ **"Project Settings"** / **"Proje Ayarları"** (dişli ikon) → **"General"** / **"Genel"** sekmesi
3. **"Your apps"** / **"Uygulamalarınız"** bölümünde **"</>"** (Web) ikonuna tıklayın
4. **App nickname**: `Hasene Web App` (veya istediğiniz isim)
5. **"Register app"** / **"Uygulamayı kaydet"** butonuna tıklayın
6. **Config bilgilerini kopyalayın**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### 6. Config Bilgilerini Projeye Ekleme

1. Projede **`js/firebase-config.js`** dosyasını açın
2. Firebase Console'dan kopyaladığınız config bilgilerini yapıştırın:
   ```javascript
   const firebaseConfig = {
       apiKey: "AIza...", // Firebase Console'dan kopyaladığınız apiKey
       authDomain: "your-project.firebaseapp.com", // Firebase Console'dan kopyaladığınız authDomain
       projectId: "your-project-id", // Firebase Console'dan kopyaladığınız projectId
       storageBucket: "your-project.appspot.com", // Firebase Console'dan kopyaladığınız storageBucket
       messagingSenderId: "123456789", // Firebase Console'dan kopyaladığınız messagingSenderId
       appId: "1:123456789:web:abcdef" // Firebase Console'dan kopyaladığınız appId
   };
   ```
3. Dosyayı kaydedin

### 7. Test Etme

1. Uygulamayı tarayıcıda açın
2. **Browser Console**'u açın (F12)
3. Şu mesajları görmelisiniz:
   - `✅ Firebase initialized`
   - `✅ Firestore offline persistence enabled` (veya uyarı)
   - `✅ Firebase anonymous sign-in successful: [USER_ID]`
   - `👤 Current user: {id: "...", type: "firebase"}`

### 8. Veri Senkronizasyonunu Kontrol Etme

1. Uygulamada bir oyun oynayın ve puan kazanın
2. **Firebase Console** → **Firestore Database** → **Data** sekmesine gidin
3. **`user_stats`** collection'ında kullanıcı ID'nizle bir doküman görmelisiniz
4. **`daily_tasks`** collection'ında da günlük görevler görmelisiniz

## 📊 Firestore Collections Yapısı

### `user_stats/{userId}`
```javascript
{
  total_points: 1250,
  badges: { "badge1": "2024-01-01", ... },
  streak_data: {
    currentStreak: 5,
    bestStreak: 10,
    totalPlayDays: 30,
    lastPlayDate: "2024-01-15",
    playDates: ["2024-01-01", ...]
  },
  game_stats: {
    totalCorrect: 150,
    totalWrong: 20,
    perfectLessons: 5,
    gameModeCounts: { "kelime-cevir": 10, ... }
  },
  perfect_lessons_count: 5
}
```

### `daily_tasks/{userId}`
```javascript
{
  lastTaskDate: "2024-01-15",
  tasks: [...],
  bonusTasks: [...],
  todayStats: {
    toplamDogru: 10,
    toplamPuan: 500,
    comboCount: 5,
    allGameModes: [],
    ayet_oku: 0,
    dua_et: 0,
    hadis_oku: 0
  }
}
```

## 🔒 Güvenlik Notları

1. **Firestore Rules**: Mutlaka `firestore.rules` dosyasını yükleyin
2. **API Key Güvenliği**: API key public olsa da, Firestore Rules ile korumalıyız
3. **Test Mode**: Test mode'da herkes okuyup yazabilir, production'da rules kullanın

## 🐛 Sorun Giderme

### "Firebase SDK is not loaded" Hatası

- HTML'de Firebase SDK script'lerinin yüklendiğinden emin olun
- Internet bağlantınızı kontrol edin
- Browser console'da hata var mı kontrol edin

### "Permission denied" Hatası

- Firestore Rules'ın doğru yüklendiğinden emin olun
- Kullanıcının authenticated olduğundan emin olun (console'da `firebaseAuth.currentUser` kontrol edin)

### "Firebase is not configured" Mesajı

- `js/firebase-config.js` dosyasındaki config bilgilerini kontrol edin
- `YOUR_API_KEY` gibi placeholder'ların değiştirildiğinden emin olun

### Veriler Firebase'de Görünmüyor

- Browser console'da hata var mı kontrol edin
- `api-service.js` içindeki `saveUserStats()` ve `saveDailyTasks()` fonksiyonlarının çalıştığını kontrol edin
- Firestore Console'da collection'ların oluşturulduğunu kontrol edin

## ✅ Kontrol Listesi

- [ ] Firebase projesi oluşturuldu
- [ ] Anonymous Authentication etkinleştirildi
- [ ] Firestore Database oluşturuldu
- [ ] Firestore Rules yüklendi
- [ ] Web app config bilgileri alındı
- [ ] `firebase-config.js` dosyası güncellendi
- [ ] Uygulama test edildi
- [ ] Veriler Firebase'de görünüyor

## 📚 Ek Kaynaklar

- [Firebase Dokümantasyonu](https://firebase.google.com/docs)
- [Firestore Dokümantasyonu](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

Sorularınız için: GitHub Issues kullanabilirsiniz! 🔥

