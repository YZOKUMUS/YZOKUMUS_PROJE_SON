# 🔑 API Key Restrictions Kontrolü - Adım Adım Kılavuz

## 📍 Sorun
Firebase'de `auth/api-key-not-valid` hatası alıyorsunuz. Bu genellikle API key'de restrictions olduğunda olur.

## ✅ Çözüm: Adım Adım

### ADIM 1: Google Cloud Console'a Gidin

1. Tarayıcınızda şu adresi açın:
   ```
   https://console.cloud.google.com/
   ```

2. Üst kısımda **proje seçici** (dropdown) var - tıklayın

3. **"hasene-da146"** projesini seçin (eğer görünmüyorsa arama kutusuna yazın)

### ADIM 2: APIs & Services Menüsüne Gidin

1. Sol taraftaki **☰ (Hamburger menü)** ikonuna tıklayın

2. Aşağı kaydırın ve şunu bulun:
   - **"APIs & Services"** (API'ler ve Hizmetler)
   - Bunun altında **"Credentials"** (Kimlik Bilgileri) seçeneği var

3. **"APIs & Services" → "Credentials"** yolunu takip edin

   VEYA direkt bu linki kullanın:
   ```
   https://console.cloud.google.com/apis/credentials?project=hasene-da146
   ```

### ADIM 3: API Key'i Bulun

1. Sayfada **"API keys"** bölümünü bulun

2. Listede şu API key'i arayın (başlangıcı):
   ```
   AIzaSyAYv12qwedAUdca72paBKT1Awx7Fx0Rlxg
   ```

3. Bu API key'in yanında **✏️ (düzenle)** ikonuna tıklayın
   VEYA direkt API key'in adına tıklayın

### ADIM 4: API Restrictions'ı Kontrol Edin ve Düzeltin

#### A) "API restrictions" Bölümü

1. Sayfada **"API restrictions"** başlığını bulun

2. İki seçenek göreceksiniz:
   - **"Don't restrict key"** (Anahtarı kısıtlama) - ✅ Bu seçili olmalı
   - **"Restrict key"** (Anahtarı kısıtla)

3. Eğer **"Restrict key"** seçiliyse:
   - Geçici olarak **"Don't restrict key"** seçin (önerilen)
   
   VEYA eğer restrictions'ı tutmak istiyorsanız:
   - "Restrict key" seçili kalsın
   - "Select APIs" (API'leri seç) listesinde şunların seçili olduğundan emin olun:
     - ✅ **Identity Toolkit API**
     - ✅ **Cloud Firestore API**
     - ✅ **Cloud Resource Manager API** (opsiyonel)

#### B) "Application restrictions" Bölümü

1. Sayfada **"Application restrictions"** başlığını bulun

2. Eğer **"None"** değilse:
   - **"None"** seçin (test için)
   
   VEYA eğer HTTP referrers kullanmak istiyorsanız:
   - **"HTTP referrers (web sites)"** seçin
   - "Add an item" (Öğe ekle) butonuna tıklayın
   - Şunları ekleyin:
     ```
     localhost/*
     127.0.0.1/*
     http://localhost/*
     http://127.0.0.1/*
     ```

### ADIM 5: Değişiklikleri Kaydedin

1. Sayfanın en altında **"SAVE"** (KAYDET) butonuna tıklayın

2. "This API key has restrictions. Continue?" (Bu API key'in kısıtlamaları var. Devam edilsin mi?) gibi bir uyarı çıkarsa **"CONTINUE"** (DEVAM ET) tıklayın

3. Birkaç saniye bekleyin - kayıt tamamlanacak

### ADIM 6: Uygulamayı Test Edin

1. Tarayıcınızda uygulamanızın sayfasına gidin

2. **Hard refresh** yapın:
   - Windows: `Ctrl + Shift + R` veya `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

3. **F12** ile Console'u açın

4. Console'da şu mesajları görmelisiniz:
   - ✅ `✅ Firebase initialized`
   - ✅ `✅ Firebase anonymous sign-in successful: [USER_ID]`

5. Eğer hala hata varsa, Console'daki hata mesajını paylaşın

## 🔍 Alternatif: API Key'i Yeniden Oluşturun

Eğer yukarıdaki adımlar işe yaramazsa, yeni bir API key oluşturabilirsiniz:

1. **APIs & Services → Credentials** sayfasına gidin

2. Üstte **"+ CREATE CREDENTIALS"** (Kimlik Bilgileri Oluştur) butonuna tıklayın

3. **"API key"** seçin

4. Yeni API key oluşturulacak - kopyalayın

5. **firebase-config.js** dosyasındaki `apiKey` değerini yeni key ile değiştirin

6. Yukarıdaki ADIM 4'teki restrictions ayarlarını yapın

7. Sayfayı yenileyin

## ⚠️ Önemli Notlar

- API key restrictions'ı kaldırmak geçici bir çözümdür (test için)
- Production'da restrictions'ı uygun şekilde ayarlayın
- API key'inizi asla public repository'lere commit etmeyin

## 🆘 Hala Çalışmıyor mu?

1. **Firebase Console**'da config'i tekrar kontrol edin
2. **Browser cache**'i temizleyin
3. **Farklı bir tarayıcı** deneyin
4. Console'daki **tam hata mesajını** paylaşın

