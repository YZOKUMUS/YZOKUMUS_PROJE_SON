# 🔥 FIREBASE DELETE SORUNU ÇÖZÜMÜ

## Sorun

Reset butonuna basıldığında Firebase'deki `weekly_leaderboard` verileri silinmiyordu çünkü Firestore Rules'da DELETE kuralı eksikti veya yanlış yapılandırılmıştı.

## Çözüm

### 1. Firestore Rules Güncellendi

`firestore.rules` dosyasında `weekly_leaderboard` için DELETE kuralı eklendi:

```javascript
// Weekly leaderboard (public read, authenticated write/delete)
match /weekly_leaderboard/{docId} {
  // Anyone can read leaderboard (public ranking)
  allow read: if true;
  // Only authenticated users can write their own data
  allow create, update: if request.auth != null && 
                         request.resource.data.user_id == request.auth.uid;
  // Only authenticated users can delete their own data
  allow delete: if request.auth != null && 
                 resource != null && 
                 resource.data.user_id == request.auth.uid;
}
```

### 2. Firebase Console'da Rules'ı Güncelleme

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. Projenizi seçin: `hasene-da146`
3. **Firestore Database** → **Rules** sekmesine gidin
4. `firestore.rules` dosyasındaki yeni kuralları yapıştırın
5. **Publish** butonuna tıklayın

### 3. Manuel Temizlik (Gerekirse)

Eğer Firebase Console'da eski veriler hala görünüyorsa:

1. Firebase Console → **Firestore Database** → **Data** sekmesi
2. `weekly_leaderboard` koleksiyonunu açın
3. Eski kullanıcı ID'si ile başlayan dokümanları manuel olarak silin
   - Örn: `STzI2Yui2wZ0wFsHGJPNTpSOAEB2_2025-01-XX` formatındaki dokümanlar

### 4. Test

Reset butonuna bastıktan sonra konsolda şu logları görmelisiniz:

```
🔥 Firebase verileri siliniyor...
🔥 Haftalık XP kaydı siliniyor: [user_id]_[week_start]
🔥 Ek haftalık XP kaydı siliniyor (user_id ile): [doc_id]
✅ Firestore delete successful: {collection: 'weekly_leaderboard', docId: '...'}
✅ Firebase verileri silindi: X/Y başarılı
```

## Notlar

- **DELETE kuralı önemli**: Firestore rules'da DELETE için özel kural olmalı, çünkü DELETE işleminde `request.resource` yoktur
- **user_id kontrolü**: Kullanıcı sadece kendi `user_id`'sine sahip dokümanları silebilir
- **localStorage zaten temizleniyor**: Firebase delete başarısız olsa bile localStorage temizlenir, bu yüzden uygulama çalışmaya devam eder

