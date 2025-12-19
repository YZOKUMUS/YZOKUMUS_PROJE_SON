# Firebase API Key Hatası Çözümü

## Sorun
Console'da şu hata görünüyor:
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Çözüm

Firebase Console'da **"CDN"** seçeneğini seçmeniz gerekiyor (npm değil).

### Adımlar:

1. **Firebase Console**'a gidin: https://console.firebase.google.com/
2. Projenizi seçin: **hasene-da146**
3. **⚙️ Project Settings** (Ayarlar ikonu) → **General** sekmesi
4. **Your apps** bölümünde web app'inizi bulun: **YZOKUMUS_PROJE_SON**
5. **SDK setup and configuration** bölümünde:
   - ❌ **npm** (şu an seçili - yanlış)
   - ✅ **CDN** (bunu seçin - doğru)
6. **CDN** seçeneğini seçtikten sonra, aşağıda şöyle bir kod bloğu göreceksiniz:

```html
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAYvi2qwedAUdca72paBKTiAwx7FxORlxg",
    authDomain: "hasene-da146.firebaseapp.com",
    projectId: "hasene-da146",
    storageBucket: "hasene-da146.firebasestorage.app",
    messagingSenderId: "892544118538",
    appId: "1:892544110530:web:7aa1c422624593a6cd505b",
    measurementId: "G-ZXT1P7ESXM"
  };
</script>
```

**VEYA daha iyi, "Config" sekmesine tıklayın** - Orada sadece config objesi gösterilir:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAYvi2qwedAUdca72paBKTiAwx7FxORlxg",
  authDomain: "hasene-da146.firebaseapp.com",
  projectId: "hasene-da146",
  storageBucket: "hasene-da146.firebasestorage.app",
  messagingSenderId: "892544118538",
  appId: "1:892544110530:web:7aa1c422624593a6cd505b",
  measurementId: "G-ZXT1P7ESXM"
};
```

7. Bu config'i kopyalayın ve `js/firebase-config.js` dosyasındaki `firebaseConfig` objesini güncelleyin.

8. Sayfayı yenileyin (F5).

## Not
API key aynı görünse de, Firebase Console'da CDN/Config sekmesinden kopyalamak önemlidir çünkü bazen farklı API key'ler olabilir veya format farklı olabilir.

