# Android — hızlı başlangıç

## İlk kurulum (bir kez)

1. [Node.js](https://nodejs.org/) ve [Android Studio](https://developer.android.com/studio) kurun.
2. Proje klasöründe:

```powershell
cd C:\Users\ziyao\Desktop\YZOKUMUS_PROJE_SON
npm install
npm run cap:open
```

3. Android Studio açılınca Gradle sync bitsin, emülatör veya telefon seçip **Run ▶**.

## Web değişikliğinden sonra

```powershell
npm run cap:sync
```

Sonra Android Studio’da tekrar çalıştırın.

## Play Store’a yükleme

Ayrıntılı adımlar: **[docs/ANDROID_PUBLISH.md](docs/ANDROID_PUBLISH.md)**

- Gizlilik: `privacy.html` (canlı URL Play formunda gerekli)
- Paket: `com.yzokumus.hasene`
- İmzalı `.aab`: Android Studio → Build → Generate Signed Bundle
