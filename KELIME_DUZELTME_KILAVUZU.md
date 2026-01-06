# 🔧 Kelime Düzeltme Sistemi - Kullanım Kılavuzu

Bu kılavuz, oyun içinde yanlış okunuşlu kelimeleri düzeltip projeye uygulama adımlarını açıklar.

---

## 📋 Adım Adım İşlem

### 1️⃣ Oyun Sırasında Düzeltmeleri Topla

1. **Oyunu oynarken** hatalı okunuşlu bir kelime ile karşılaştığınızda
2. Kelime gösterildiğinde **🔧 (Düzelt)** butonuna tıklayın
3. Açılan modal'da:
   - **Arapça kelime** otomatik olarak gösterilir
   - **Mevcut okunuş** (yanlış olan) gösterilir
   - **Doğru okunuşu** yazın
4. **💾 Kaydet** butonuna tıklayın
5. Düzeltme otomatik olarak `localStorage`'a kaydedilir
6. Bu işlemi **tüm hatalı kelimeler için tekrarlayın**

> 💡 **Not:** Düzeltmeler oyun sırasında toplanır ve `localStorage`'da saklanır. Sayfayı yenileseniz bile düzeltmeler kaybolmaz.

---

### 2️⃣ Düzeltmeleri Kontrol Et

1. Ana ekranda **kullanıcı durum çubuğunda** (sağ üstte) **🧪 (Test Araçları)** butonuna tıklayın
2. Açılan modal'da **"🔧 Kelime Düzeltmeleri"** bölümünde:
   - Toplam düzeltme sayısını görebilirsiniz
   - Örnek: `✨ Düzeltmeleri Uygula & İndir (5 düzeltme)`

> 💡 **Not:** Düzeltme sayısı, oyun sırasında topladığınız tüm düzeltmeleri gösterir.

---

### 3️⃣ Düzeltmeleri Uygula ve İndir

1. Test araçları modalında **"✨ Düzeltmeleri Uygula & İndir"** butonuna tıklayın
2. Sistem otomatik olarak:
   - ✅ Tüm data dosyalarını yükler
   - ✅ Düzeltmeleri data dosyalarına uygular
   - ✅ Güncellenmiş JSON dosyalarını indirir
3. İndirme işlemi tamamlandığında:
   - Ekranda başarı mesajı görünür
   - Konsolda detaylı log'lar görünür
   - Tarayıcının indirme klasöründe güncellenmiş dosyalar bulunur

> 💡 **Not:** Hangi dosyaların güncellendiği konsolda gösterilir. Örneğin:
> - `uc_harfli_kelimeler.json` (eğer üç harfli kelimeler düzeltildiyse)
> - `harf.json` (eğer harfler düzeltildiyse)
> - `kelimebul.json` (eğer kelimeler düzeltildiyse)

---

### 4️⃣ İndirilen Dosyaları Projeye Kopyala

1. **İndirilen dosyaları bulun:**
   - Genellikle **Downloads** (İndirilenler) klasöründe
   - Dosya adları: `uc_harfli_kelimeler.json`, `harf.json`, `kelimebul.json` vb.

2. **Proje klasörüne kopyalayın:**
   - İndirilen dosyaları **`data/`** klasörüne kopyalayın
   - Mevcut dosyaların üzerine yazın (değiştir)

3. **Örnek:**
   ```
   Downloads/uc_harfli_kelimeler.json → data/uc_harfli_kelimeler.json
   Downloads/harf.json → data/harf.json
   ```

> ⚠️ **Önemli:** Dosyaları kopyalamadan önce **yedek almanız** önerilir!

---

### 5️⃣ Değişiklikleri Test Et

1. **Sayfayı yenileyin** (F5 veya Ctrl+R)
2. **Oyunu tekrar oynayın**
3. Düzelttiğiniz kelimelerin artık **doğru okunuşla** gösterildiğini kontrol edin

---

## 🔄 Tam İşlem Akışı Özeti

```
1. Oyun Oyna
   ↓
2. Hatalı Kelime Bul → 🔧 Butonuna Tıkla
   ↓
3. Doğru Okunuşu Yaz → 💾 Kaydet
   ↓
4. Tüm Düzeltmeleri Topla (Tekrarla)
   ↓
5. 🧪 Test Araçları → ✨ Düzeltmeleri Uygula & İndir
   ↓
6. İndirilen Dosyaları data/ Klasörüne Kopyala
   ↓
7. Sayfayı Yenile ve Test Et
```

---

## 📊 Konsol Log'ları

İşlem sırasında konsolda (F12) şu bilgileri görebilirsiniz:

- `📦 Tüm datalar yükleniyor...` - Data dosyaları yükleniyor
- `✅ Datalar yüklendi` - Data yükleme tamamlandı
- `🔍 Düzeltmeler uygulanıyor...` - Düzeltmeler uygulanıyor
- `✅ [1/5] "kelime" düzeltildi` - Her düzeltme için detay
- `📥 uc_harfli_kelimeler.json indirildi` - İndirilen dosyalar
- `📊 Özet:` - İşlem özeti

---

## ❓ Sık Sorulan Sorular

### Düzeltmeler kaybolur mu?
**Hayır.** Düzeltmeler `localStorage`'da saklanır. Sayfayı yenileseniz bile kaybolmaz. Ancak tarayıcı verilerini temizlerseniz kaybolabilir.

### Kaç düzeltme yapabilirim?
**Sınırsız.** İstediğiniz kadar düzeltme toplayabilirsiniz.

### Hangi dosyalar güncellenir?
Sadece **düzeltme yapılan kelimelerin bulunduğu dosyalar** güncellenir. Örneğin:
- Üç harfli kelimeler düzeltildiyse → `uc_harfli_kelimeler.json`
- Harfler düzeltildiyse → `harf.json`
- Kelimeler düzeltildiyse → `kelimebul.json`

### Aynı kelimeyi birden fazla düzeltebilir miyim?
**Evet.** Aynı kelimeyi tekrar düzeltirseniz, son düzeltme geçerli olur.

### Düzeltmeleri silmek istersem?
Test araçları modalında **"🗑️ Düzeltmeleri Sil"** butonunu kullanabilirsiniz (eğer varsa).

---

## 🎯 İpuçları

1. **Toplu Düzeltme:** Oyunu oynarken tüm hatalı kelimeleri toplayın, sonra tek seferde uygulayın
2. **Yedek Al:** Dosyaları kopyalamadan önce mutlaka yedek alın
3. **Konsol Kontrolü:** İşlem sırasında konsolu açık tutun, hataları görebilirsiniz
4. **Test Et:** Her düzeltme sonrası oyunu test edin, doğru çalıştığından emin olun

---

## 🐛 Sorun Giderme

### Düzeltmeler uygulanmıyor
- Konsolu kontrol edin (F12)
- Data dosyalarının yüklendiğinden emin olun
- Sayfayı yenileyip tekrar deneyin

### Dosyalar indirilmiyor
- Tarayıcının indirme izinlerini kontrol edin
- Pop-up engelleyiciyi kapatın
- Farklı bir tarayıcı deneyin

### Düzeltmeler kayboldu
- `localStorage` temizlenmiş olabilir
- Tarayıcı verilerini kontrol edin
- Düzeltmeleri tekrar toplayın

---

**Son Güncelleme:** 2026-01-04  
**Versiyon:** 1.0

