# Firestore Security Rules Deploy Rehberi

## Yöntem 1: Firebase Console (ÖNERİLEN - En Kolay)

1. https://console.firebase.google.com/ adresine gidin
2. Projenizi seçin
3. Sol menüden **Firestore Database** → **Rules** sekmesine gidin
4. Mevcut rules'u silin
5. `firestore.rules` dosyasının içeriğini kopyalayıp yapıştırın
6. **Publish** / **Yayınla** butonuna tıklayın
7. Deploy işlemi birkaç saniye sürecek

## Yöntem 2: Firebase CLI ile Deploy

### Adım 1: Firebase'e Login Olun
```bash
firebase login
```
Tarayıcı açılacak, Google hesabınızla giriş yapın.

### Adım 2: Projeyi Seçin (İlk defa)
```bash
firebase use --add
```
Listeden Firebase projenizi seçin ve bir alias verin (örn: `default`).

### Adım 3: Rules'u Deploy Edin
```bash
firebase deploy --only firestore:rules
```

### Tüm Komutlar:
```bash
# 1. Login
firebase login

# 2. Proje seç (ilk defa ise)
firebase use --add

# 3. Rules deploy et
firebase deploy --only firestore:rules

# VEYA sadece rules'u kontrol etmek için:
firebase deploy --only firestore:rules --dry-run
```

## Deploy Sonrası Kontrol

1. Firebase Console → Firestore Database → Rules
2. Rules'un güncellenip güncellenmediğini kontrol edin
3. Tarayıcıda sayfayı yenileyin ve test edin

## Önemli Notlar

- Rules deploy edildikten sonra birkaç saniye içinde aktif olur
- Yanlış rules deploy ederseniz, Firebase Console'dan geri alabilirsiniz
- Rules'u test etmek için Firebase Console'da Rules Playground kullanabilirsiniz
