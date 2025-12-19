# 🔍 KULLANICI TİPİ KONTROL KOMUTLARI

## ⚠️ Eğer `window.getCurrentUser()` `undefined` döndürüyorsa:

Script henüz yüklenmemiş olabilir. Aşağıdaki alternatif yöntemleri kullanın:

---

## 🎯 YÖNTEM 1: localStorage'dan Direkt Kontrol (En Güvenilir)

Tarayıcı konsolunda (F12) şunu çalıştırın:

```javascript
// 1. Firebase kullanıcı ID'si var mı?
const firebaseUserId = localStorage.getItem('hasene_firebase_user_id');
const userType = localStorage.getItem('hasene_user_type');

console.log('=== KULLANICI TİPİ KONTROLÜ ===');
console.log('Firebase User ID:', firebaseUserId);
console.log('User Type:', userType);

if (firebaseUserId && userType === 'firebase') {
    console.log('✅ FIREBASE KULLANICISI');
    console.log('User ID:', firebaseUserId);
    console.log('Username:', localStorage.getItem('hasene_username'));
    console.log('🔴 Sıfırlama: localStorage + Firebase SİLİNECEK');
} else {
    const localUserId = localStorage.getItem('hasene_user_id');
    console.log('❌ LOCAL KULLANICI');
    console.log('User ID:', localUserId);
    console.log('Username:', localStorage.getItem('hasene_username'));
    console.log('🔴 Sıfırlama: Sadece localStorage SİLİNECEK');
}
```

---

## 🎯 YÖNTEM 2: Firebase Auth'dan Kontrol

```javascript
// Firebase Auth durumunu kontrol et
if (window.firebaseAuth && window.firebaseAuth.currentUser) {
    const uid = window.firebaseAuth.currentUser.uid;
    console.log('✅ FIREBASE KULLANICISI');
    console.log('Firebase UID:', uid);
    console.log('🔴 Sıfırlama: localStorage + Firebase SİLİNECEK');
} else {
    console.log('❌ LOCAL KULLANICI veya Firebase yüklü değil');
    console.log('🔴 Sıfırlama: Sadece localStorage SİLİNECEK');
}
```

---

## 🎯 YÖNTEM 3: Tüm Bilgileri Göster (Kapsamlı)

```javascript
(function() {
    console.log('=== KULLANICI BİLGİLERİ ===');
    
    // 1. Firebase durumu
    console.log('\n1. Firebase Durumu:');
    console.log('  - Firebase Enabled:', window.FIREBASE_ENABLED);
    console.log('  - Firebase Auth:', window.firebaseAuth ? 'Yüklü' : 'Yok');
    console.log('  - Firebase User:', window.firebaseAuth?.currentUser ? window.firebaseAuth.currentUser.uid : 'Yok');
    
    // 2. localStorage durumu
    console.log('\n2. localStorage Durumu:');
    console.log('  - hasene_firebase_user_id:', localStorage.getItem('hasene_firebase_user_id'));
    console.log('  - hasene_user_id:', localStorage.getItem('hasene_user_id'));
    console.log('  - hasene_user_type:', localStorage.getItem('hasene_user_type'));
    console.log('  - hasene_username:', localStorage.getItem('hasene_username'));
    
    // 3. Sonuç
    console.log('\n3. SONUÇ:');
    const firebaseUserId = localStorage.getItem('hasene_firebase_user_id');
    const userType = localStorage.getItem('hasene_user_type');
    
    if (firebaseUserId && userType === 'firebase') {
        console.log('  ✅ FIREBASE KULLANICISI');
        console.log('  🔴 Sıfırlama: localStorage + Firebase SİLİNECEK');
    } else if (window.firebaseAuth?.currentUser) {
        console.log('  ✅ FIREBASE KULLANICISI (Firebase Auth\'dan)');
        console.log('  🔴 Sıfırlama: localStorage + Firebase SİLİNECEK');
    } else {
        console.log('  ❌ LOCAL KULLANICI');
        console.log('  🔴 Sıfırlama: Sadece localStorage SİLİNECEK');
    }
    
    console.log('==========================');
})();
```

---

## 🎯 YÖNTEM 4: Basit Tek Satır Kontrol

```javascript
// En basit kontrol - tek satır
localStorage.getItem('hasene_firebase_user_id') ? '🔥 FIREBASE' : '💾 LOCAL'
```

---

## 📋 SIFIRLAMA ÖZETİ

### Firebase Kullanıcısıysanız (`hasene_firebase_user_id` varsa):
- ✅ localStorage → SİLİNECEK
- ✅ Firebase `user_stats` → SİLİNECEK  
- ✅ Firebase `daily_tasks` → SİLİNECEK
- ✅ Firebase `weekly_leaderboard` → SİLİNECEK

### Local Kullanıcıysanız (`hasene_user_id` varsa):
- ✅ localStorage → SİLİNECEK
- ❌ Firebase → SİLİNMEYECEK (zaten Firebase kullanıcısı değilsiniz)

---

## ⚡ HIZLI TEST

Konsolda şunu kopyalayıp yapıştırın:

```javascript
const uid = localStorage.getItem('hasene_firebase_user_id');
const type = localStorage.getItem('hasene_user_type');
console.log(uid && type === 'firebase' ? '🔥 FIREBASE - Her şey sıfırlanacak' : '💾 LOCAL - Sadece localStorage sıfırlanacak');
```

