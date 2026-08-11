# Android yayınlama kılavuzu — Hasene

Bu proje **Capacitor** ile Android uygulamasına sarılır; aynı zamanda **PWA** olarak GitHub Pages'te çalışır.

| Bilgi | Değer |
|--------|--------|
| Paket adı | `com.yzokumus.hasene` |
| Web adresi | https://yzokumus.github.io/YZOKUMUS_PROJE_SON/ |
| Gizlilik | https://yzokumus.github.io/YZOKUMUS_PROJE_SON/privacy.html |
| Mağaza metinleri | [PLAY_STORE_LISTING.md](./PLAY_STORE_LISTING.md) |
| Sosyal tanıtım | [SOCIAL_PROMO.md](./SOCIAL_PROMO.md) |

---

## 1. Gereksinimler

1. **Node.js** 18+ — https://nodejs.org/
2. **Android Studio** — https://developer.android.com/studio  
   - Kurulumda: Android SDK, SDK Build-Tools, bir emülatör veya USB ile telefon
3. **Google Play Console** hesabı (yayın için, ~25 USD tek seferlik)
4. Ortam değişkeni (Windows):

```powershell
# Android SDK yolu (Studio kurulumuna göre düzenleyin)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

Android Studio → **Settings → Android SDK** yolunu kontrol edin.

---

## 2. Projeyi Android’e hazırlama (bu repoda)

Proje kökünde:

```powershell
cd C:\Users\ziyao\Desktop\YZOKUMUS_PROJE_SON
npm install
npm run cap:sync
```

- `npm run www:prepare` — `www/` klasörüne yayın dosyalarını kopyalar  
- `npx cap sync android` — `android/` native projesini günceller  

Android Studio’yu açmak için:

```powershell
npm run cap:open
```

---

## 3. İmzalı APK / AAB üretme

1. Android Studio’da **Build → Generate Signed Bundle / APK**
2. **Android App Bundle (.aab)** seçin (Play Store için zorunlu)
3. Yeni **keystore** oluşturun; şifreyi ve dosyayı **güvenli yedekleyin** (kaybederseniz güncelleme yapamazsınız)
4. Release build alın

Keystore SHA-256 parmak izi (TWA için gerekli):

```powershell
keytool -list -v -keystore release.keystore -alias hasene
```

Çıktıdaki `SHA256:` değerini kopyalayın.

---

## 4. Google Play’e yükleme

1. https://play.google.com/console → **Uygulama oluştur**
2. **Üretim** → Yeni sürüm → `.aab` yükleyin
3. Mağaza listesi:
   - Kısa açıklama, uzun açıklama (Türkçe)
   - Ekran görüntüleri (telefon, en az 2)
   - İkon 512×512, feature graphic 1024×500
   - Kategori: **Eğitim**
   - **Gizlilik politikası URL:**  
     `https://yzokumus.github.io/YZOKUMUS_PROJE_SON/privacy.html`
4. **Veri güvenliği** formu: localStorage, isteğe bağlı Firebase
5. İçerik derecelendirmesi anketini doldurun
6. İncelemeye gönderin

---

## 5. Firebase (liderlik / bulut)

Firebase Console → **Authentication** → **Settings** → **Authorized domains**:

- `yzokumus.github.io`
- `localhost` (Capacitor geliştirme)

Android uygulamasında sorun olursa **Google Play App Signing** SHA-1/SHA-256’yı Firebase’e **Android uygulaması** olarak ekleyin (Project settings → Your apps → Add app → Android).

---

## 6. Alternatif: PWA Builder (web sürümünü sarmalama)

Kod değiştirmeden Play’e web URL’si ile girmek için:

1. https://www.pwabuilder.com/  
2. URL: `https://yzokumus.github.io/YZOKUMUS_PROJE_SON/`  
3. **Package for stores → Android** → `.aab` indirin  
4. **Digital Asset Links:** `.well-known/assetlinks.json.template` dosyasını doldurup  
   repoda `.well-known/assetlinks.json` olarak kaydedin ve GitHub Pages’e push edin  
5. Paket adı: `com.yzokumus.hasene` (şablonla aynı olmalı)

---

## 7. Güncelleme akışı

Web içeriğini değiştirdikten sonra Android paketi için:

```powershell
npm run cap:sync
```

Android Studio’da sürüm kodunu artırın (`android/app/build.gradle` → `versionCode`), yeni `.aab` üretin, Play Console’a yükleyin.

---

## 8. Sık sorunlar

| Sorun | Çözüm |
|--------|--------|
| `ANDROID_HOME` bulunamadı | Android Studio SDK yolunu ortam değişkenine ekleyin |
| Beyaz ekran | `npm run www:prepare` sonra `cap:sync` tekrarlayın |
| Firebase auth hatası | Authorized domains + Android SHA fingerprint |
| Play gizlilik reddi | `privacy.html` URL’sinin canlı ve erişilebilir olduğunu doğrulayın |

---

## 9. Dosya özeti

| Dosya | Açıklama |
|--------|-----------|
| `package.json` | npm script’leri |
| `capacitor.config.json` | Uygulama kimliği |
| `scripts/prepare-www.js` | www/ kopyalama |
| `privacy.html` | Play Store gizlilik sayfası |
| `manifest.json` | PWA + mağaza meta |
| `.well-known/assetlinks.json.template` | TWA (PWA Builder) şablonu |
