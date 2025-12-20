# Firebase Firestore Index Kurulumu

## Leaderboard Index

Liderlik tablosu için Firestore composite index gereklidir. Bu index, haftalık XP'ye göre sıralama yapmak için kullanılır.

### Otomatik Index Oluşturma

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenizi seçin (`hasene-da146`)
3. Firestore Database > Indexes bölümüne gidin
4. Hata mesajındaki linki kullanarak direkt index oluşturabilirsiniz

### Manuel Index Oluşturma

**Collection ID**: `weekly_leaderboard`

**Index Alanları**:
- `week_start` (Ascending)
- `weekly_xp` (Descending)

**Query Scope**: Collection

### Index Oluşturma Adımları

1. Firebase Console'da projenizi açın
2. Sol menüden **Firestore Database** > **Indexes** sekmesine gidin
3. **Create Index** butonuna tıklayın
4. **Collection ID** olarak `weekly_leaderboard` girin
5. **Fields** bölümüne şunları ekleyin:
   - Field 1: `week_start` - Ascending
   - Field 2: `weekly_xp` - Descending
6. **Create** butonuna tıklayın
7. Index'in oluşturulması birkaç dakika sürebilir (index durumu "Building" olarak görünür)

### Not

Index oluşturulana kadar, liderlik tablosu manuel sıralama ile çalışacaktır (yavaş olabilir). Index oluşturulduktan sonra, sorgular daha hızlı çalışacaktır.

### Index Oluşturma URL'si

Hata mesajında verilen link ile direkt index oluşturma sayfasına gidebilirsiniz:

```
https://console.firebase.google.com/v1/r/project/hasene-da146/firestore/indexes?create_composite=...
```

Bu link, doğru index parametreleriyle birlikte gelir ve tek tıkla index oluşturmanızı sağlar.


