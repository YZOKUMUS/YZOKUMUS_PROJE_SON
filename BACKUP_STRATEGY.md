# 🔒 Proje Yedekleme ve Koruma Stratejisi

## 📋 Kritik Dosyalar Listesi

Bu dosyalar **MUTLAKA** yedeklenmeli ve korunmalıdır:

### 🎯 Çok Kritik (Oyun Çalışmazsa)
- `index.html` - Ana HTML dosyası
- `style.css` - Tüm stiller
- `js/game-core.js` - Ana oyun mantığı
- `js/config.js` - Yapılandırma
- `js/constants.js` - Sabitler (seviyeler, rozetler)
- `js/utils.js` - Yardımcı fonksiyonlar
- `js/data-loader.js` - Veri yükleme
- `js/points-manager.js` - Puan sistemi
- `js/auth.js` - Kimlik doğrulama
- `js/api-service.js` - API servisi
- `js/firebase-config.js` - Firebase yapılandırması
- `js/firebase-init.js` - Firebase başlatma
- `sw.js` - Service Worker
- `manifest.json` - PWA manifest

### 📊 Veri Dosyaları (Çok Büyük, Önemli)
- `data/kelimebul.json` - 118,698 satır (3.5 MB)
- `data/ayetoku.json` - 43,000+ ayet (3.4 MB)
- `data/hadisoku.json` - 53,000+ hadis (4.2 MB)
- `data/duaet.json` - 300+ dua (25 KB)
- `data/harf.json` - 28 harf (6.8 KB)
- `data/fetha.json` - 28 harf (14.7 KB)
- `data/harf1.json` - 27 kelime (10.1 KB)

### 🎨 Asset Dosyaları
- `ASSETS/badges/*.png` - Rozet görselleri
- `ASSETS/game-icons/*.png` - Oyun ikonları
- `ASSETS/fonts/*.otf` - Arapça font
- `ASSETS/elifba-cover/*.png` - Elif Ba görselleri

### ⚙️ Yapılandırma
- `firestore.rules` - Firebase güvenlik kuralları
- `.gitignore` - Git ignore kuralları

---

## 🛡️ Koruma Stratejileri

### 1. Git Backup (Mevcut)
✅ **Zaten aktif:**
- GitHub remote: `origin/main`
- Düzenli commit ve push yapın

**Öneriler:**
```bash
# Her önemli değişiklikten sonra:
git add .
git commit -m "Açıklayıcı mesaj"
git push origin main
```

### 2. Git Tag Oluşturma (Önemli Versiyonlar İçin)
```bash
# Önemli bir versiyon için tag oluştur:
git tag -a v1.0.0 -m "Stable version"
git push origin v1.0.0
```

### 3. Local Backup Klasörü
Kritik dosyaları düzenli olarak başka bir yere kopyalayın.

### 4. .gitignore Kontrolü
Kritik dosyaların `.gitignore`'da olmadığından emin olun.

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **JSON dosyaları çok büyük** - GitHub'da saklanıyor ama local'de de yedek tutun
2. **Firebase config** - API key'ler güvenli tutulmalı
3. **localStorage verileri** - Tarayıcı cache'inde, yedeklenmez
4. **Service Worker cache** - Tarayıcı tarafından yönetilir

---

## 🔄 Otomatik Yedekleme Önerileri

1. **GitHub Actions** - Otomatik backup workflow'u
2. **Local script** - Kritik dosyaları otomatik kopyalama
3. **Cloud backup** - Google Drive, Dropbox, OneDrive

---

## 📝 Yedekleme Kontrol Listesi

- [ ] Tüm kritik dosyalar Git'te
- [ ] GitHub'a push edildi
- [ ] Local backup klasörü var
- [ ] JSON dosyaları yedeklendi
- [ ] Asset dosyaları yedeklendi
- [ ] Firebase config güvenli

