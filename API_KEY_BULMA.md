# 🔍 API Key'i Bulma - Görsel Kılavuz

## 📍 ADIM ADIM

### ADIM 1: Google Cloud Console'u Açın

Tarayıcınızda bu linki açın:
```
https://console.cloud.google.com/apis/credentials?project=hasene-da146
```

VEYA manuel olarak:

1. **https://console.cloud.google.com/** adresine gidin
2. Üstte **proje seçici dropdown**'a tıklayın (muhtemelen "Select a project" yazıyor)
3. **"hasene-da146"** projesini seçin
4. Sol menüden **"APIs & Services"** → **"Credentials"** tıklayın

### ADIM 2: API Keys Listesini Bulun

Sayfada şunları göreceksiniz:

```
┌─────────────────────────────────────────┐
│  APIs & Services > Credentials          │
├─────────────────────────────────────────┤
│                                         │
│  + CREATE CREDENTIALS                   │
│                                         │
│  API keys                               │
│  ┌──────────────────────────────────┐  │
│  │ Name          | API key          │  │
│  ├──────────────────────────────────┤  │
│  │ Browser key   | AIzaSyAYvi2qwe...│  │ ← BURAYA TIKLA
│  │ (auto creat..)                   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  OAuth 2.0 Client IDs                   │
│  ...                                    │
└─────────────────────────────────────────┘
```

### ADIM 3: API Key'e Tıklayın

**"API keys"** bölümünün altında bir liste var. Listede:

- **"Name"** kolonunda muhtemelen **"Browser key (auto created by Firebase)"** gibi bir isim yazıyor
- **"API key"** kolonunda şu key'i göreceksiniz: **`AIzaSyAYvi2qwedAUdca72paBKTiAwr7FxORlxg`** (veya başlangıcı görünüyor)

**⚠️ ÖNEMLİ:** API key'in **adına (Name)** tıklayın, API key'in kendisine değil.

### ADIM 4: Restrictions Sayfası Açılacak

Tıkladıktan sonra yeni bir sayfa açılacak:

```
┌─────────────────────────────────────────┐
│  Edit API key                           │
├─────────────────────────────────────────┤
│                                         │
│  Name                                   │
│  Browser key (auto created by Firebase) │
│                                         │
│  API key                                │
│  AIzaSyAYvi2qwedAUdca72paBKTiAwr7Fx... │
│                                         │
│  API restrictions                       │
│  ○ Don't restrict key                   │ ← BUNU SEÇ
│  ● Restrict key                         │
│                                         │
│  Application restrictions               │
│  ● None                                 │ ← BUNU SEÇ
│  ○ HTTP referrers                       │
│                                         │
│              [CANCEL]  [SAVE]           │ ← BURAYA TIKLA
└─────────────────────────────────────────┘
```

### ADIM 5: Restrictions'ı Değiştirin

1. **"API restrictions"** bölümünde **"Don't restrict key"** seçeneğini işaretleyin (radio button)
2. **"Application restrictions"** bölümünde **"None"** seçili olduğundan emin olun
3. Sayfanın **altındaki** **"SAVE"** butonuna tıklayın

### ADIM 6: Kaydetme Onayı

Bazı durumlarda bir onay penceresi çıkabilir:
- **"Continue"** veya **"Devam Et"** butonuna tıklayın

## 🎯 KISA ÖZET

1. **https://console.cloud.google.com/apis/credentials?project=hasene-da146** açın
2. **"API keys"** listesinde API key'in **adına (Name)** tıklayın
3. **"API restrictions"** → **"Don't restrict key"** seçin
4. **"SAVE"** butonuna tıklayın

## ❓ HALA BULAMADINIZ MI?

Eğer **"API keys"** bölümünü göremiyorsanız:

1. Üstteki **proje seçicisini** kontrol edin - **"hasene-da146"** seçili olmalı
2. Sayfanın **yenilenmesini** bekleyin
3. Sol menüden **"APIs & Services"** → **"Credentials"** yolunu tekrar takip edin

## 🆘 YARDIM GEREKİYOR MU?

Eğer hala bulamıyorsanız, sayfada gördüğünüz şeyleri paylaşın, yardımcı olabilirim!

