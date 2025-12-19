# 🕌 Hasene Arapça Dersi

> Kuran kelimelerini öğren, rozet topla, günlük görevleri tamamla!

Hasene Arapça Dersi, Kuran'da geçen kelimeleri ve ilgili ayet/dua/hadis içeriklerini oyunlaştırarak öğreten bir Progressive Web App (PWA) uygulamasıdır.

## ✨ Özellikler

- 🎮 **6 Oyun/Okuma Modu** (8 alt mod ile)
  - Kelime Çevir (4 alt mod: Klasik, 30. cüz, Tekrar Et, Favoriler)
  - Dinle Bul
  - Boşluk Doldur
  - Ayet Oku, Dua Et, Hadis Oku
  - Elif Ba (4 alt mod: Harfler, Kelimeler, Harekeler, Harf Tablosu)

- 🏆 **Gamification Sistemi**
  - Hasene puan sistemi + combo bonus + perfect bonus
  - Yıldız / Seviye (mertebe) / Rozet sistemi
  - 44 başarım (achievements)
  - Günlük vird ve günlük görevler
  - Streak (seri) + takvim görünümü

- 📊 **İstatistikler ve Öğrenme**
  - Detaylı kelime istatistikleri (SM-2 algoritması ile)
  - Favoriler sistemi
  - Akıllı kelime seçimi (tekrar zamanı gelmiş kelimeler öncelikli)

- 📱 **PWA Özellikleri**
  - Offline çalışma
  - Ana ekrana eklenebilir
  - Mobil uyumlu tasarım

## 🚀 Hızlı Başlangıç

### Yerel Geliştirme

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/YZOKUMUS/YZOKUMUS_PROJE_SON.git
   cd YZOKUMUS_PROJE_SON
   ```

2. **Uygulamayı açın**
   - `index.html` dosyasını tarayıcıda açın
   - Veya VS Code Live Server extension kullanın

3. **Geliştirme**
   - Değişiklikler anında yansır
   - Herhangi bir build süreci gerekmez

### GitHub Pages ile Yayınlama

1. **Repository Ayarları**
   - Settings → Pages → Source: GitHub Actions

2. **Otomatik Deploy**
   - `main` veya `master` branch'ine push yapın
   - GitHub Actions otomatik olarak deploy eder

3. **Canlı Site**
   - `https://yzokumus.github.io/YZOKUMUS_PROJE_SON/` adresinde yayında

## 📁 Proje Yapısı

```
YZOKUMUS_PROJE_SON/
├── index.html          # Ana HTML dosyası
├── style.css           # Tüm stil ve responsive tasarım
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline + cache)
├── js/
│   ├── config.js       # Genel ayarlar
│   ├── constants.js    # Sabitler (LEVELS, ACHIEVEMENTS, BADGE_DEFINITIONS)
│   ├── utils.js        # Yardımcı fonksiyonlar
│   ├── auth.js         # Kullanıcı kimlik doğrulama
│   ├── api-service.js  # Backend API servisi (Firebase + localStorage)
│   ├── data-loader.js  # JSON veri yükleme
│   ├── points-manager.js # Seviye ve rozet hesaplama
│   └── game-core.js    # Ana oyun mantığı
├── data/
│   ├── kelimebul.json  # Kelime listesi
│   ├── ayetoku.json    # Ayet verileri
│   ├── duaet.json      # Dua verileri
│   ├── hadisoku.json   # Hadis verileri
│   └── harf.json       # Elif Ba harf verileri
└── ASSETS/
    ├── badges/         # Rozet ikonları
    ├── fonts/          # Arapça fontlar
    └── game-icons/     # Oyun mod ikonları
```

## 🛠️ Teknolojiler

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: localStorage + (opsiyonel) Firebase Firestore
- **PWA**: manifest.json + Service Worker
- **Styling**: CSS3 (Glassmorphism, Responsive Design)

## 📚 Dokümantasyon

Detaylı teknik dokümantasyon için [README.md](README.md) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Geliştirici

**YZOKUMUS**

- GitHub: [@YZOKUMUS](https://github.com/YZOKUMUS)
- Repository: [YZOKUMUS_PROJE_SON](https://github.com/YZOKUMUS/YZOKUMUS_PROJE_SON)

## 🙏 Teşekkürler

- Kuran kelimeleri verileri için kaynaklar
- Arapça font desteği
- PWA standartları

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

