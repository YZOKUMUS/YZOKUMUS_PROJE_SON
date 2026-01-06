# Okunuş Düzeltmeleri Kullanım Kılavuzu

## 📋 Adım Adım İşlem

### 1️⃣ Oyun Sırasında Düzeltmeleri Topla

1. Oyunu oynarken hatalı okunuşlu kelimeleri tespit edin
2. Kelime gösterildiğinde **🔧** (Düzelt) butonuna tıklayın
3. Doğru okunuşu yazın ve kaydedin
4. Düzeltmeler otomatik olarak localStorage'a kaydedilir

### 2️⃣ Düzeltmeleri İndir

1. Test araçları modalını açın (🧪 butonu)
2. **📥 Düzeltmeleri İndir** butonuna tıklayın
3. `pronunciation-fixes.json` dosyası indirilecek

### 3️⃣ JSON Dosyasını Proje Klasörüne Kopyala

1. İndirilen `pronunciation-fixes.json` dosyasını bulun (genellikle Downloads klasöründe)
2. Dosyayı proje klasörüne (root) kopyalayın
   - Örnek: `C:\Users\ziyao\Desktop\YZOKUMUS_PROJE_SON\pronunciation-fixes.json`

### 4️⃣ Düzeltmeleri Data Dosyalarına Uygula

#### Yöntem A: Otomatik (Önerilen) 🚀

1. Terminal/Command Prompt'u açın
2. Proje klasörüne gidin:
   ```bash
   cd C:\Users\ziyao\Desktop\YZOKUMUS_PROJE_SON
   ```
3. Node.js scriptini çalıştırın:
   ```bash
   node apply-pronunciation-fixes.js
   ```
4. Script otomatik olarak:
   - `pronunciation-fixes.json` dosyasını bulur
   - Her düzeltmeyi ilgili data dosyasında arar
   - Okunuşları günceller
   - Backup dosyaları oluşturur (`.backup` uzantılı)
   - Sonuçları gösterir

#### Yöntem B: Manuel 📝

1. `pronunciation-fixes.json` dosyasını açın
2. Her düzeltme için:
   - `submode` alanına bakın (hangi data dosyası olduğunu gösterir)
   - İlgili data dosyasını açın (örn: `data/uc_harfli_kelimeler.json`)
   - `kelime` alanına göre kelimeyi bulun
   - `okunus` alanını `newOkunus` değeri ile değiştirin
3. Data dosyasını kaydedin

## 📁 Data Dosyası Mapping

| Submode | Data Dosyası |
|---------|-------------|
| `uc-harfli-kelimeler` | `data/uc_harfli_kelimeler.json` |
| `uzatma-med` | `data/uzatma_med.json` |
| `harf` | `data/harf.json` |
| `ustn` | `data/ustn.json` |
| `esre` | `data/esre.json` |
| `otre` | `data/otre.json` |
| `sedde` | `data/sedde.json` |
| `cezm` | `data/cezm.json` |
| `tenvin` | `data/tenvin.json` |
| `kelime` | `data/kelimebul.json` |

## ⚠️ Önemli Notlar

1. **Backup Dosyaları**: Script otomatik olarak `.backup` uzantılı yedek dosyalar oluşturur
2. **Sayfa Yenileme**: Runtime'da uygulanan düzeltmeler sayfa yenilendiğinde kaybolur
3. **Kalıcı Düzeltmeler**: Data dosyalarına uygulanan düzeltmeler kalıcıdır
4. **Test**: Düzeltmeleri uyguladıktan sonra oyunu test edin

## 🔄 İşlem Akışı

```
Oyun Oynarken
    ↓
Hatalı Kelime Tespit Et
    ↓
🔧 Düzelt Butonuna Tıkla
    ↓
Doğru Okunuşu Yaz
    ↓
Kaydet
    ↓
[localStorage'a kaydedilir]
    ↓
Test Araçları > 📥 Düzeltmeleri İndir
    ↓
pronunciation-fixes.json indirilir
    ↓
Proje klasörüne kopyala
    ↓
node apply-pronunciation-fixes.js
    ↓
Data dosyaları güncellenir
    ↓
✅ Kalıcı düzeltmeler uygulandı!
```

## 🛠️ Sorun Giderme

### Script çalışmıyor
- Node.js yüklü mü kontrol edin: `node --version`
- `pronunciation-fixes.json` dosyası proje klasöründe mi?

### Düzeltmeler uygulanmadı
- Console log'ları kontrol edin
- Kelime eşleşmesi doğru mu? (Arapça karakterler önemli)
- Okunuş eşleşmesi doğru mu? (`oldOkunus` değeri mevcut okunuşla eşleşiyor mu?)

### Backup dosyaları
- `.backup` uzantılı dosyalar güvenli bir şekilde silinebilir
- Sorun olursa backup dosyalarından geri yükleyebilirsiniz

