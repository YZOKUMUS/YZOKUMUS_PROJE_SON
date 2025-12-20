# 🚀 GitHub Kurulum Kılavuzu

Bu dosya, projeyi GitHub'a yüklemek ve GitHub Pages ile yayınlamak için adım adım kılavuzdur.

## 📋 Ön Gereksinimler

1. **Git** kurulu olmalı
2. **GitHub hesabı** olmalı (Kullanıcı adı: YZOKUMUS)
3. **GitHub Desktop** veya **Git CLI** kullanılabilir

## 🔧 Adım Adım Kurulum

### 1. GitHub Repository Oluşturma

1. GitHub'a giriş yapın: https://github.com/login
2. Sağ üstteki **"+"** butonuna tıklayın → **"New repository"**
3. Repository bilgilerini girin:
   - **Repository name**: `YZOKUMUS_PROJE_SON`
   - **Description**: `Hasene Arapça Dersi - Kuran kelimelerini öğren, rozet topla!`
   - **Visibility**: Public (veya Private)
   - **Initialize repository**: ❌ Boş bırakın (README, .gitignore, license ekleme)
4. **"Create repository"** butonuna tıklayın

### 2. Yerel Projeyi GitHub'a Yükleme

#### Seçenek A: Git CLI ile

```bash
# 1. Proje klasörüne git
cd C:\Users\ziyao\Desktop\YZOKUMUS_PROJE_SON

# 2. Git repository başlat (eğer yoksa)
git init

# 3. Tüm dosyaları ekle
git add .

# 4. İlk commit
git commit -m "Initial commit: Hasene Arapça Dersi"

# 5. GitHub repository'yi remote olarak ekle
git remote add origin https://github.com/YZOKUMUS/YZOKUMUS_PROJE_SON.git

# 6. Ana branch'i main olarak ayarla
git branch -M main

# 7. GitHub'a push et
git push -u origin main
```

#### Seçenek B: GitHub Desktop ile

1. GitHub Desktop'u açın
2. **File** → **Add Local Repository**
3. Proje klasörünü seçin: `C:\Users\ziyao\Desktop\YZOKUMUS_PROJE_SON`
4. **"Publish repository"** butonuna tıklayın
5. Repository adını girin: `YZOKUMUS_PROJE_SON`
6. **"Publish repository"** butonuna tıklayın

### 3. GitHub Pages'i Aktif Etme

1. GitHub repository sayfasına gidin: `https://github.com/YZOKUMUS/YZOKUMUS_PROJE_SON`
2. **Settings** sekmesine gidin
3. Sol menüden **"Pages"** seçin
4. **Source** kısmından:
   - **Deploy from a branch** yerine
   - **"GitHub Actions"** seçin (eğer varsa)
   - Veya **"main"** branch'ini seçin ve **"/ (root)"** klasörünü seçin
5. **"Save"** butonuna tıklayın

### 4. İlk Deploy'u Başlatma

GitHub Actions workflow'u otomatik olarak çalışacaktır. Eğer manuel başlatmak isterseniz:

1. **Actions** sekmesine gidin
2. **"Deploy to GitHub Pages"** workflow'unu seçin
3. **"Run workflow"** butonuna tıklayın

### 5. Canlı Siteyi Kontrol Etme

Deploy tamamlandıktan sonra (birkaç dakika sürebilir):

1. Repository **Settings** → **Pages** sayfasına gidin
2. **"Your site is live at"** bağlantısını görüntüleyin
3. Site adresi: `https://yzokumus.github.io/YZOKUMUS_PROJE_SON/`

## 🔄 Güncelleme Yapma

Projede değişiklik yaptıktan sonra:

### Git CLI ile:

```bash
# 1. Değişiklikleri kontrol et
git status

# 2. Değişiklikleri ekle
git add .

# 3. Commit yap
git commit -m "Açıklayıcı commit mesajı"

# 4. GitHub'a push et
git push origin main
```

### GitHub Desktop ile:

1. Değişiklikleri yapın
2. Sol panelde değişiklikleri görüntüleyin
3. Commit mesajı yazın
4. **"Commit to main"** butonuna tıklayın
5. **"Push origin"** butonuna tıklayın

GitHub Actions otomatik olarak deploy edecektir.

## 📝 Önemli Notlar

### .gitignore Dosyası

Proje root'unda `.gitignore` dosyası oluşturulmuştur. Bu dosya, Git'in ignore etmesi gereken dosyaları belirler (örn: `.DS_Store`, `node_modules`, vb.).

### README Dosyaları

- **README.md**: Detaylı teknik dokümantasyon (mevcut)
- **README_GITHUB.md**: GitHub için kısa ve öz açıklama

### LICENSE Dosyası

Proje MIT lisansı altında lisanslanmıştır. `LICENSE` dosyasında detaylar bulunur.

### GitHub Actions

`.github/workflows/deploy.yml` dosyası, otomatik deploy işlemini yönetir. Her `main` branch'ine push yapıldığında otomatik olarak GitHub Pages'e deploy eder.

## 🐛 Sorun Giderme

### "Permission denied" Hatası

GitHub'a push yaparken authentication hatası alırsanız:

1. **Personal Access Token** oluşturun:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - **"Generate new token"** → `repo` permission'ını seçin
   - Token'ı kopyalayın

2. Push yaparken kullanıcı adı yerine token kullanın:
   ```bash
   git push https://[TOKEN]@github.com/YZOKUMUS/YZOKUMUS_PROJE_SON.git
   ```

### Pages Çalışmıyor

1. **Settings** → **Pages** → **Source** kontrol edin
2. **Actions** sekmesinde deploy hatası var mı kontrol edin
3. Repository public mi kontrol edin (free hesapta private repo'da Pages çalışmaz)

### Service Worker Çalışmıyor

GitHub Pages HTTPS kullanır, Service Worker çalışır. Eğer sorun yaşıyorsanız:

1. Tarayıcı cache'ini temizleyin
2. Service Worker'ı unregister edin (DevTools → Application → Service Workers)
3. Sayfayı yenileyin

## 📚 Ek Kaynaklar

- [GitHub Pages Dokümantasyonu](https://docs.github.com/en/pages)
- [Git CLI Kılavuzu](https://git-scm.com/doc)
- [GitHub Desktop](https://desktop.github.com/)

## ✅ Kontrol Listesi

- [ ] GitHub repository oluşturuldu
- [ ] Proje GitHub'a yüklendi
- [ ] GitHub Pages aktif edildi
- [ ] İlk deploy tamamlandı
- [ ] Canlı site çalışıyor
- [ ] README_GITHUB.md yüklendi
- [ ] LICENSE dosyası eklendi
- [ ] .gitignore dosyası çalışıyor

---

Sorularınız için: GitHub Issues kullanabilirsiniz! 🚀


