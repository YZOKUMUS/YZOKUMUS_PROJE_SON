# 📱 Mobil Test Kontrol Listesi

## ✅ Test Edilecekler

### 1. 🎮 Oyun Kartları Görünürlüğü
- [ ] Tüm 9 oyun kartı görünüyor mu?
  - Talim Et
  - Kelime Çevir
  - Dinle Bul
  - Boşluk Doldur
  - Ayet Oku
  - Dua Et
  - Hadis Oku
  - Günlük Okumalar
  - Elif Ba

### 2. 📤 Paylaşım Kalitesi
- [ ] WhatsApp'ta paylaş → Görsel görünüyor mu?
- [ ] Telegram'da paylaş → Görsel görünüyor mu?
- [ ] Facebook'ta paylaş → Görsel görünüyor mu?

**Test Adımları:**
1. Mobilde uygulamayı aç
2. Tarayıcı menüsünden "Paylaş" seç
3. WhatsApp/Telegram seç
4. Kendine gönder
5. **Kontrol:** Görsel ve açıklama görünüyor mu?

### 3. 🎯 Oyun Fonksiyonları
- [ ] Oyun başlatılıyor mu?
- [ ] Puanlar kaydediliyor mu?
- [ ] Seviye artıyor mu?
- [ ] Rozetler kazanılıyor mu?

### 4. ♿ Erişilebilirlik (Opsiyonel)
- [ ] Screen reader açıkken butonlar anlaşılır mı?
  - iOS: Ayarlar → Erişilebilirlik → VoiceOver
  - Android: Ayarlar → Erişilebilirlik → TalkBack

### 5. 📱 PWA Özellikleri
- [ ] Ana ekrana eklenebiliyor mu?
- [ ] Offline çalışıyor mu?
- [ ] Icon görünüyor mu?

---

## 🐛 Olası Sorunlar ve Çözümleri

### Sorun: Oyun kartları görünmüyor
**Çözüm:** 
- Sayfayı yenile (Ctrl+R veya F5)
- Cache'i temizle
- Hard refresh yap (Ctrl+Shift+R)

### Sorun: Paylaşımda görsel görünmüyor
**Çözüm:**
- GitHub Pages deploy'unun tamamlanmasını bekle (2-3 dakika)
- Link'i tekrar paylaş
- Tarayıcı cache'ini temizle

### Sorun: Puanlar kaydedilmiyor
**Çözüm:**
- Console'da hata var mı kontrol et
- localStorage çalışıyor mu kontrol et
- Giriş yaptığınızdan emin olun

---

## 📊 Test Sonuçları

Test tarihi: _______________

**Oyun Kartları:**
- [ ] Tüm kartlar görünüyor
- [ ] Tıklanabiliyor
- [ ] Oyunlar başlıyor

**Paylaşım:**
- [ ] WhatsApp: ✅ / ❌
- [ ] Telegram: ✅ / ❌
- [ ] Facebook: ✅ / ❌

**Oyun Fonksiyonları:**
- [ ] Puanlar: ✅ / ❌
- [ ] Seviye: ✅ / ❌
- [ ] Rozetler: ✅ / ❌

**Genel:**
- [ ] Her şey çalışıyor: ✅ / ❌
- [ ] Sorun var: _______________

---

## 🎯 Hızlı Test Senaryosu

1. **Uygulamayı aç**
2. **Oyun kartlarını kontrol et** → 9 kart görünüyor mu?
3. **Bir oyun başlat** → Çalışıyor mu?
4. **Puan kazan** → Kaydediliyor mu?
5. **Paylaş** → Görsel görünüyor mu?

**Süre:** 5 dakika

---

**İyi testler! 🚀**
