# 🎮 HASENE ARAPÇA DERSİ - KAPSAMLI PROJE DOKÜMANTASYONU

**Proje Adı**: Hasene Arapça Dersi  
**Tür**: PWA (Progressive Web App) - Eğitim Oyunu  
**Platform**: Web (Mobil + Masaüstü)  
**Dil**: Türkçe + Arapça  
**Veritabanı**: Firebase Firestore + localStorage  

---

## 📁 1. DOSYA YAPISI

```
hasene-arapca-dersi/
├── index.html                 # Ana HTML dosyası (TÜM UI)
├── style.css                  # Ana CSS (iOS 16 Liquid Glass tasarımı)
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (offline support)
├── LICENSE                    # MIT License
├── README.md                  # Proje açıklaması
│
├── js/                        # JavaScript dosyaları
│   ├── config.js             # Global ayarlar (DEBUG, POINTS, vs)
│   ├── constants.js          # Sabitler (LEVELS, BADGES, TASKS)
│   ├── utils.js              # Yardımcı fonksiyonlar
│   ├── firebase-config.js    # Firebase yapılandırması
│   ├── firebase-init.js      # Firebase başlatma
│   ├── auth.js               # Kullanıcı girişi/çıkışı
│   ├── api-service.js        # Firebase API wrapper
│   ├── data-loader.js        # JSON veri yükleme
│   ├── points-manager.js     # Puan/level hesaplama
│   ├── leaderboard.js        # Lig sistemi
│   ├── game-core.js          # Ana oyun mantığı (4500+ satır)
│   ├── quick-test.js         # Test araçları
│   └── firebase-debug.js     # Firebase debug
│
├── data/                      # JSON veri dosyaları
│   ├── kelimebul.json        # Kelimeler (3 harfli)
│   ├── ayetoku.json          # Ayetler
│   ├── duaet.json            # Dualar
│   ├── hadisoku.json         # Hadisler
│   ├── harf.json             # Harfler
│   ├── ustn.json             # Üstün (harekeler)
│   ├── esre.json             # Esre
│   ├── otre.json             # Ötre
│   ├── cezm.json             # Cezm
│   ├── sedde.json            # Şedde
│   ├── tenvin.json           # Tenvin
│   ├── uzatma_med.json       # Uzatma (med)
│   └── uc_harfli_kelimeler.json  # 3 harfli kelimeler
│
├── ASSETS/                    # Görseller ve sesler
│   ├── badges/               # Rozet görselleri (PNG)
│   │   ├── icon-512.png
│   │   ├── rozet1.png - rozet42.png
│   │   └── ... (42 rozet)
│   │
│   ├── game-icons/           # Oyun modu ikonları
│   │   ├── kelime-cevir.png
│   │   ├── ayet-oku.png
│   │   ├── dua-et.png
│   │   ├── hadis-oku.png
│   │   ├── bosluk-doldur.png
│   │   └── dinle-bul.png
│   │
│   ├── elifba-cover/         # Elifba ikonları
│   │   ├── harf-tablosu-icon.png
│   │   ├── ustn-icon.png
│   │   ├── esre-icon.png
│   │   └── ... (9 ikon)
│   │
│   ├── fonts/                # Arapça font
│   │   └── KFGQPC Uthmanic Script HAFS Regular.otf
│   │
│   └── audio/                # Ses dosyaları
│       ├── okuma/            # btn_1.mp3 - btn_27.mp3
│       ├── ustun_ses_dosyalari/
│       ├── esre/
│       ├── otre/
│       ├── cezm/
│       ├── sedde/
│       └── tenvin/
│
└── docs/                      # Dokümantasyon
    ├── FIREBASE_SETUP.md
    └── CODE_QUALITY_ANALYSIS.md
```

---

## 🎨 2. UI/UX TASARIMI

### 2.1 Tasarım Stili
- **Tema**: iOS 16 Liquid Glass Effect
- **Renk Paleti**:
  - Primary: `#9d8aff` (Mor)
  - Secondary: `#00d4ff` (Mavi)
  - Success: `#10b981` (Yeşil)
  - Error: `#ef4444` (Kırmızı)
  - Background: Gradient (mor-mavi)
- **Font**: System UI (SF Pro Display benzeri)
- **Efektler**: Glassmorphism, blur, glow

### 2.2 Ana Ekranlar

#### **A. ANA MENÜ (Main Screen)**
```
┌─────────────────────────────────┐
│  Stats Header                   │
│  ┌──────────────────────────┐  │
│  │ Avatar | Username         │  │
│  │ 🟢 Giriş Yapıldı         │  │
│  │ 🔄 Sıfırla | Çıkış Yap   │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 1234 Hasene | ⭐ 5        │  │
│  │ 🔥 3 Seri | Seviye 2     │  │
│  └──────────────────────────┘  │
│                                 │
│  🎯 Günlük Hedef: 0 / 2700     │
│  ▓▓▓▓▓░░░░░░░░░░ 35%           │
│                                 │
│  Zorluk: [Kolay] [Orta] [Zor] │
│                                 │
│  ┌─────────────────┐           │
│  │  OYUN MODLARI   │           │
│  │                 │           │
│  │  🔤 Kelime Bul  │           │
│  │  📖 Ayet Oku    │           │
│  │  🤲 Dua Et      │           │
│  │  📚 Hadis Oku   │           │
│  │  ✍️ Boşluk Doldur│          │
│  │  🎧 Dinle ve Bul│           │
│  │  🔤 Elifba      │           │
│  └─────────────────┘           │
│                                 │
│  Alt Menü:                      │
│  [🏠 Ana][📊 İstatistik][⚙️]   │
└─────────────────────────────────┘
```

#### **B. OYUN EKRANI (Generic)**
```
┌─────────────────────────────────┐
│  Soru 3/10 | Combo: 5🔥         │
│  Session: 125 puan              │
│                                 │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │    SORU METNİ ALANI     │  │
│  │    (Arapça/Türkçe)      │  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                 │
│  Seçenekler:                    │
│  ┌──────────────────────────┐  │
│  │      Seçenek A          │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │      Seçenek B          │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │      Seçenek C          │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │      Seçenek D          │  │
│  └──────────────────────────┘  │
│                                 │
│  [🔊 Sesli Oku] [💡 İpucu]     │
│  [❌ Vazgeç]                    │
└─────────────────────────────────┘
```

#### **C. SONUÇ EKRANI**
```
┌─────────────────────────────────┐
│         TEBRIKLER! 🎉          │
│                                 │
│  Doğru: 8 ✅ | Yanlış: 2 ❌    │
│  En Uzun Combo: 6 🔥           │
│                                 │
│  Kazandığın Puan: +125         │
│  Toplam Puan: 1234             │
│                                 │
│  Açılan Başarılar:              │
│  🏆 İlk Adım (10 soru)         │
│  🔥 Ateş Topu (5 combo)        │
│                                 │
│  [🏠 Ana Menü] [🔄 Tekrar]     │
└─────────────────────────────────┘
```

---

## 🎮 3. OYUN MODLARI

### 3.1 Kelime Bul (kelimebul)
**Amaç**: Arapça kelimeyi Türkçe'ye çevir  
**Veri**: `data/kelimebul.json`  
**Soru Sayısı**: 10  
**Zorluk**: Easy (10p), Medium (15p), Hard (20p)  
**Özellikler**:
- 4 seçenek (1 doğru, 3 yanlış)
- Sesli okuma desteği
- İpucu sistemi (1 seçeneği eleme)
- Combo sistemi (ardışık doğru = bonus)

**Veri Yapısı**:
```json
[
  {
    "arabic": "بَيْتٌ",
    "turkish": "Ev",
    "pronunciation": "beyt",
    "category": "İsim"
  }
]
```

### 3.2 Ayet Oku (ayetoku)
**Amaç**: Ayeti oku ve anlamını öğren  
**Veri**: `data/ayetoku.json`  
**Soru Sayısı**: 5  
**Puan**: 15p (soru başı)  
**Özellikler**:
- Arapça metin gösterimi
- Türkçe meal
- Sure/ayet bilgisi
- Sesli okuma
- Favori ekleme

**Veri Yapısı**:
```json
[
  {
    "sure_adi": "Fatiha",
    "sure_no": 1,
    "ayet_no": 1,
    "ayet_metni": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "meal": "Rahman ve Rahim olan Allah'ın adıyla",
    "okunus": "Bismillahirrahmanirrahim"
  }
]
```

### 3.3 Dua Et (duaet)
**Amaç**: Duaları öğren  
**Veri**: `data/duaet.json`  
**Soru Sayısı**: 5  
**Puan**: 10p  
**Özellikler**:
- Dua metni (Arapça)
- Türkçe anlamı
- Okunuş
- Kategori (sabah, akşam, vs)

### 3.4 Hadis Oku (hadisoku)
**Amaç**: Hadisleri öğren  
**Veri**: `data/hadisoku.json`  
**Soru Sayısı**: 5  
**Puan**: 20p  
**Özellikler**:
- Hadis metni (Arapça)
- Türkçe meal
- Kaynak (Buhari, Muslim, vs)
- Hadis no

### 3.5 Boşluk Doldur (boslukdoldur)
**Amaç**: Ayetteki eksik kelimeyi bul  
**Veri**: `data/ayetoku.json` (aynı)  
**Soru Sayısı**: 10  
**Puan**: 20p (Hard)  
**Özellikler**:
- Ayetten rastgele kelime çıkarılır
- 4 seçenek sunulur
- Meal ipucu verilir

### 3.6 Dinle ve Bul (dinlebul)
**Amaç**: Ses dosyasını dinle, doğru kelimeyi bul  
**Veri**: `data/kelimebul.json` + `ASSETS/audio/`  
**Soru Sayısı**: 10  
**Puan**: 25p (Hard)  
**Özellikler**:
- Otomatik ses çalma
- Tekrar dinleme
- 4 seçenek (Arapça yazılı)

### 3.7 Elifba (elifba)
**Alt Modlar**:
- **Harfler** (`harf.json`)
- **Üstün** (`ustn.json`)
- **Esre** (`esre.json`)
- **Ötre** (`otre.json`)
- **Cezm** (`cezm.json`)
- **Şedde** (`sedde.json`)
- **Tenvin** (`tenvin.json`)
- **Uzatma** (`uzatma_med.json`)

**Özellikler**:
- Her hareke için ayrı mod
- Harf gösterimi
- Okunuş öğretimi
- Sesli okuma

---

## 💾 4. VERİ YAPILARI

### 4.1 localStorage Keys
```javascript
// Kullanıcı
hasene_user_id                    // "local-1234567890"
hasene_username                   // "YZOKUMUS"
hasene_user_email                 // ""
hasene_user_gender                // "male" | "female" | "none"
hasene_user_type                  // "local" | "firebase"
hasene_firebase_user_id           // Firebase UID

// Oyun Verileri
hasene_totalPoints                // 1234 (integer)
hasene_streakData                 // {currentStreak: 3, longestStreak: 10, lastPlayDate: "2024-12-25"}
hasene_dailyTasks                 // {date: "2024-12-25", tasks: [...], rewardsClaimed: false}
hasene_gameStats                  // {kelimebul: {played: 10, correct: 85, wrong: 15}, ...}
hasene_dailyGoal                  // 2700
hasene_dailyProgress              // {date: "2024-12-25", points: 1234}

// Kelime İstatistikleri (SM-2 Algorithm)
hasene_word_stats                 // {word_id: {easiness: 2.5, interval: 1, repetitions: 0, lastReview: timestamp}}

// Favoriler
hasene_favorites                  // [{type: "ayet", id: 123, data: {...}}]

// Başarılar & Rozetler
hasene_achievements               // ["first_game", "combo_master", ...]
hasene_badges                     // {"2024-12-25": "badge_id"}

// Haftalık XP (Lig)
hasene_weekly_xp_2024-12-25       // {username: "YZOKUMUS", xp: 1234, league: "talib"}
```

### 4.2 Firebase Collections

#### **A. user_stats**
```javascript
{
  "yzokumus": {
    user_id: "firebase_uid",
    username: "YZOKUMUS",
    total_points: 1234,
    streak_data: {
      currentStreak: 3,
      longestStreak: 10,
      lastPlayDate: "2024-12-25"
    },
    game_stats: {
      kelimebul: {played: 10, correct: 85, wrong: 15},
      ayetoku: {played: 5, correct: 20, wrong: 2}
    },
    daily_goal: 2700,
    daily_progress: 1234,
    updated_at: timestamp
  }
}
```

#### **B. daily_tasks**
```javascript
{
  "yzokumus": {
    user_id: "firebase_uid",
    username: "YZOKUMUS",
    date: "2024-12-25",
    tasks: [
      {id: 1, title: "5 Oyun Oyna", target: 5, current: 3, completed: false},
      {id: 2, title: "50 Puan Kazan", target: 50, current: 35, completed: false}
    ],
    rewardsClaimed: false,
    updated_at: timestamp
  }
}
```

#### **C. weekly_leaderboard**
```javascript
{
  "2024-12-25": {  // Haftanın Pazartesi tarihi (key)
    users: [
      {
        username: "YZOKUMUS",
        user_id: "firebase_uid",
        xp: 1234,
        league: "talib",
        rank: 5
      }
    ],
    updated_at: timestamp
  }
}
```

---

## 🎯 5. PUAN SİSTEMİ

### 5.1 Puan Hesaplama
```javascript
// Temel Puan
const BASE_POINTS = {
  easy: 10,
  medium: 15,
  hard: 20
};

// Combo Bonusu
combo >= 3: +5 puan
combo >= 5: +10 puan
combo >= 10: +20 puan

// Hız Bonusu
cevap_süresi < 3 saniye: +5 puan
cevap_süresi < 5 saniye: +2 puan

// Toplam = BASE + COMBO_BONUS + HIZ_BONUS
```

### 5.2 Level Sistemi
```javascript
const LEVELS = [
  {level: 1, minPoints: 0, stars: 0},
  {level: 2, minPoints: 50, stars: 1},
  {level: 3, minPoints: 150, stars: 2},
  {level: 4, minPoints: 300, stars: 3},
  {level: 5, minPoints: 500, stars: 4},
  // ... 50 seviyeye kadar
  {level: 50, minPoints: 100000, stars: 50}
];

// Yıldız Hesaplama
stars = Math.floor(totalPoints / 100);
```

### 5.3 Streak (Seri) Sistemi
```javascript
// Her gün oyun oyna = streak +1
// 1 gün atla = streak sıfırlanır
// Longest streak kaydedilir

streakData = {
  currentStreak: 5,        // Şu anki seri
  longestStreak: 12,       // En uzun seri
  lastPlayDate: "2024-12-25"
};
```

---

## 🏆 6. BAŞARILAR (ACHIEVEMENTS)

### 6.1 Başarı Tipleri
```javascript
const ACHIEVEMENTS = [
  // İlk Adımlar
  {id: "first_game", title: "İlk Oyun", desc: "İlk oyununu oynadın", icon: "🎮", reward: 10},
  {id: "first_win", title: "İlk Zafer", desc: "İlk oyunu kazandın", icon: "🏆", reward: 20},
  
  // Combo
  {id: "combo_3", title: "Üçlü Combo", desc: "3 doğru üst üste", icon: "🔥", reward: 15},
  {id: "combo_5", title: "Beşli Combo", desc: "5 doğru üst üste", icon: "💥", reward: 25},
  {id: "combo_10", title: "Ateş Topu", desc: "10 doğru üst üste", icon: "⚡", reward: 50},
  
  // Oyun Sayısı
  {id: "games_10", title: "Yolculuk Başladı", desc: "10 oyun oyna", icon: "🚀", reward: 30},
  {id: "games_50", title: "Kararlı", desc: "50 oyun oyna", icon: "💪", reward: 100},
  {id: "games_100", title: "Adanmış", desc: "100 oyun oyna", icon: "🌟", reward: 200},
  
  // Puan Milestones
  {id: "points_100", title: "İlk Yüz", desc: "100 puan kazan", icon: "💯", reward: 10},
  {id: "points_500", title: "Beş Yüz Kulübü", desc: "500 puan kazan", icon: "💎", reward: 50},
  {id: "points_1000", title: "Bin Puan", desc: "1000 puan kazan", icon: "👑", reward: 100},
  
  // Streak
  {id: "streak_3", title: "3 Gün", desc: "3 gün üst üste oyna", icon: "🔥", reward: 20},
  {id: "streak_7", title: "Bir Hafta", desc: "7 gün üst üste oyna", icon: "📅", reward: 50},
  {id: "streak_30", title: "Bir Ay", desc: "30 gün üst üste oyna", icon: "🌙", reward: 200},
  
  // Perfect Game
  {id: "perfect_game", title: "Mükemmel Oyun", desc: "10/10 doğru cevap", icon: "💯", reward: 50}
];
```

### 6.2 Rozet (Badge) Sistemi
```javascript
// Günlük rozet kazanma
// Her gün yeni rozet (42 farklı rozet)
const BADGES = [
  {id: 1, name: "Deve Kervanı", image: "deve-kervani.png", date: "2024-12-25"},
  {id: 2, name: "Hira Mağarası", image: "hira-magarasi.png", date: "2024-12-26"},
  // ... 42 rozet
];

// Rozet kazanma koşulu:
// - Günlük hedefin %50'sini tamamla
// - Her gün farklı rozet
```

---

## 📊 7. LİG (LEADERBOARD) SİSTEMİ

### 7.1 Lig Seviyeleri
```javascript
const LEAGUE_LEVELS = [
  {id: "ulama", name: "Ulema", arabic: "علماء", minXP: 10000, icon: "👑"},
  {id: "imam", name: "İmam", arabic: "إمام", minXP: 8000, icon: "🕌"},
  {id: "faqih", name: "Fakih", arabic: "فقيه", minXP: 6000, icon: "📚"},
  {id: "muhaddis", name: "Muhaddis", arabic: "محدث", minXP: 4000, icon: "📖"},
  {id: "mujtahid", name: "Müctehid", arabic: "مجتهد", minXP: 3000, icon: "⚖️"},
  {id: "alim", name: "Alim", arabic: "عالم", minXP: 2000, icon: "🌟"},
  {id: "kurra", name: "Kurra", arabic: "قراء", minXP: 1500, icon: "📿"},
  {id: "hafiz", name: "Hafız", arabic: "حافظ", minXP: 1000, icon: "⭐"},
  {id: "mutebahhir", name: "Mütebahhir", arabic: "متبحر", minXP: 500, icon: "🌿"},
  {id: "mutavassit", name: "Mutavassıt", arabic: "متوسط", minXP: 250, icon: "💧"},
  {id: "talib", name: "Talib", arabic: "طالب", minXP: 100, icon: "📝"},
  {id: "mubtedi", name: "Mübtedi", arabic: "مبتدئ", minXP: 0, icon: "🌱"}
];
```

### 7.2 Haftalık XP Sistemi
```javascript
// Hafta başlangıcı: Pazartesi 00:00
// Hafta bitişi: Pazar 23:59
// Her Pazartesi sıfırlanır

// XP Kazanma:
// Oyun kazanma = +10 XP
// Doğru cevap = +1 XP
// Combo bonus = +2 XP

// Sıralama:
// En yüksek XP'li ilk 10 kullanıcı gösterilir
```

---

## 🎯 8. GÜNLÜK GÖREVLER

### 8.1 Görev Tipleri
```javascript
const DAILY_TASKS = [
  {
    id: 1,
    title: "İlk Adım",
    description: "1 oyun oyna",
    target: 1,
    type: "games_played",
    reward: 10
  },
  {
    id: 2,
    title: "Puan Avcısı",
    description: "50 puan kazan",
    target: 50,
    type: "points_earned",
    reward: 20
  },
  {
    id: 3,
    title: "Combo Ustası",
    description: "5 combo yap",
    target: 5,
    type: "max_combo",
    reward: 15
  },
  {
    id: 4,
    title: "Doğruluk Kralı",
    description: "10 doğru cevap ver",
    target: 10,
    type: "correct_answers",
    reward: 25
  },
  {
    id: 5,
    title: "Günlük Hedef",
    description: "Günlük hedefine ulaş",
    target: 2700,
    type: "daily_goal",
    reward: 50
  }
];
```

### 8.2 Görev Ödülü
```javascript
// Tüm görevler tamamlandığında:
// - Rastgele İslami öğüt gösterilir
// - Rastgele sevap miktarı verilir (50-1000 arası)

const ISLAMIC_TEACHINGS = [
  {
    text: "Kim Allah'ın kitabından bir harf okursa ona bir sevap vardır.",
    source: "Tirmizi",
    rewardAmounts: [10, 100, 1000]
  }
];
```

---

## 🔧 9. ANA FONKSİYONLAR

### 9.1 Oyun Döngüsü
```javascript
// 1. Oyun Başlatma
async function startGame(gameMode, difficulty) {
  // - Veri yükleme (JSON)
  // - Soruları karıştırma
  // - İlk soruyu gösterme
}

// 2. Soru Yükleme
function loadQuestion() {
  // - Mevcut soruyu getir
  // - Seçenekleri oluştur
  // - UI'ı güncelle
}

// 3. Cevap Kontrolü
function checkAnswer(selectedIndex, selectedAnswer) {
  // - Doğru/yanlış kontrolü
  // - Puan hesaplama
  // - Combo güncelleme
  // - Sonraki soruya geç
}

// 4. Oyun Bitişi
function endGame() {
  // - Toplam skor hesaplama
  // - İstatistik güncelleme
  // - Başarı kontrolü
  // - Sonuç ekranı gösterme
}
```

### 9.2 Veri Yönetimi
```javascript
// localStorage
function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Firebase
async function loadUserStats() {
  // 1. Firebase'den oku
  // 2. localStorage'a kaydet
  // 3. Return
}

async function saveUserStats(stats) {
  // 1. localStorage'a kaydet
  // 2. Firebase'e sync (arka planda)
}
```

### 9.3 Puan Yönetimi
```javascript
function addPoints(basePoints, combo, speed) {
  // Combo bonus
  let comboBonus = 0;
  if (combo >= 10) comboBonus = 20;
  else if (combo >= 5) comboBonus = 10;
  else if (combo >= 3) comboBonus = 5;
  
  // Hız bonusu
  let speedBonus = 0;
  if (speed < 3000) speedBonus = 5;
  else if (speed < 5000) speedBonus = 2;
  
  // Toplam
  const totalPoints = basePoints + comboBonus + speedBonus;
  
  // Ekle
  totalPoints += totalPoints;
  sessionScore += totalPoints;
  dailyProgress += totalPoints;
  
  // Kaydet
  saveStats();
  
  // UI güncelle
  updateStatsDisplay();
}

function calculateLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

function calculateStars(points) {
  return Math.floor(points / 100);
}
```

### 9.4 Başarı Kontrolü
```javascript
function checkAchievements(stats) {
  const newAchievements = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Zaten açılmışsa atla
    if (unlockedAchievements.includes(achievement.id)) return;
    
    // Koşul kontrolü
    let unlocked = false;
    switch (achievement.id) {
      case "first_game":
        unlocked = stats.gamesPlayed >= 1;
        break;
      case "combo_5":
        unlocked = stats.maxCombo >= 5;
        break;
      case "points_1000":
        unlocked = totalPoints >= 1000;
        break;
      // ...
    }
    
    if (unlocked) {
      newAchievements.push(achievement);
      unlockedAchievements.push(achievement.id);
      totalPoints += achievement.reward;
    }
  });
  
  // Yeni başarıları göster
  if (newAchievements.length > 0) {
    showAchievementModal(newAchievements);
  }
}
```

---

## 🎨 10. UI KOMPONENTLERİ

### 10.1 Modal Sistemi
```javascript
// Modal Açma
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('hidden');
  currentOpenModal = modalId;
}

// Modal Kapama
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('hidden');
  currentOpenModal = null;
}

// Tüm Modalları Kapat
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => {
    m.classList.add('hidden');
  });
}
```

### 10.2 Toast Bildirimleri
```javascript
function showToast(message, type = 'info', duration = 2000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

### 10.3 Progress Bar
```javascript
function updateProgressBar(current, target) {
  const progress = Math.min(100, (current / target) * 100);
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('progress-text').textContent = 
    `${current} / ${target}`;
}
```

---

## 🔊 11. SES SİSTEMİ

### 11.1 Ses Çalma
```javascript
let currentPlayingAudio = null;

function playSafeAudio(url) {
  // Önceki sesi durdur
  stopAllAudio();
  
  try {
    const audio = new Audio(url);
    audio.volume = 0.7;
    audio.play();
    currentPlayingAudio = audio;
    
    audio.onended = () => {
      currentPlayingAudio = null;
    };
    
    return audio;
  } catch (e) {
    console.error('Audio play error:', e);
    return null;
  }
}

function stopAllAudio() {
  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio.currentTime = 0;
    currentPlayingAudio = null;
  }
}
```

### 11.2 Ses Dosyası Yapısı
```
ASSETS/audio/
├── okuma/
│   ├── btn_1.mp3  (elif)
│   ├── btn_2.mp3  (be)
│   └── ... (27 harf)
├── ustun_ses_dosyalari/
├── esre/
├── otre/
├── cezm/
├── sedde/
└── tenvin/
```

---

## 🔐 12. KULLANICI YÖNETİMİ (AUTH)

### 12.1 Kullanıcı Tipleri
```javascript
// LOCAL USER (Varsayılan)
{
  id: "local-1703501234567",
  username: "Kullanıcı123",
  email: "",
  type: "local"
}

// FIREBASE USER (Anonymous)
{
  id: "firebase_uid_abc123",
  username: "YZOKUMUS",
  email: "",
  type: "firebase"
}
```

### 12.2 Auth Flow
```javascript
// 1. Giriş
function confirmUsername() {
  const username = usernameInput.value.trim();
  
  // Validation
  if (!username || username.length > 50) {
    showToast('Geçersiz kullanıcı adı', 'error');
    return;
  }
  
  // Farklı kullanıcı kontrolü
  const currentUser = getCurrentUser();
  const isDifferentUser = currentUser && currentUser.username !== username;
  
  // Kullanıcı oluştur/güncelle
  if (isDifferentUser) {
    // Önceki kullanıcının verilerini temizle
    clearGameData();
  }
  
  createLocalUser(username);
  
  // Firebase anonymous auth (opsiyonel)
  if (FIREBASE_ENABLED) {
    autoSignInAnonymous();
  }
  
  // Stats yükle
  loadStats();
  updateStatsDisplay();
  
  closeModal('username-login-modal');
}

// 2. Çıkış
async function signOut() {
  // Firebase'den ÇIKMA (anonymous session koru)
  // localStorage temizle
  localStorage.removeItem('hasene_user_id');
  localStorage.removeItem('hasene_username');
  // Oyun verilerini temizle
  clearGameData();
  
  updateUserStatusUI();
  showToast('Çıkış yapıldı', 'info');
}
```

---

## 🔥 13. FIREBASE ENTEGRASYONU

### 13.1 Firebase Config
```javascript
// js/firebase-config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};
```

### 13.2 Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // user_stats - Username bazlı
    match /user_stats/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // daily_tasks
    match /daily_tasks/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // weekly_leaderboard - Public read
    match /weekly_leaderboard/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### 13.3 Firebase Functions
```javascript
// Veri Okuma
async function firestoreGet(collection, docId) {
  const doc = await firestore.collection(collection).doc(docId).get();
  return doc.exists ? doc.data() : null;
}

// Veri Yazma
async function firestoreSet(collection, docId, data) {
  await firestore.collection(collection).doc(docId).set(data, {merge: true});
}

// Veri Silme
async function firestoreDelete(collection, docId) {
  await firestore.collection(collection).doc(docId).delete();
}
```

---

## 📱 14. PWA (PROGRESSIVE WEB APP)

### 14.1 Manifest
```json
{
  "name": "Hasene Arapça Dersi",
  "short_name": "Hasene",
  "description": "Arapça öğrenme oyunu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#9d8aff",
  "theme_color": "#9d8aff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "ASSETS/badges/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 14.2 Service Worker
```javascript
const CACHE_NAME = 'hasene-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/js/game-core.js',
  // ... tüm dosyalar
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

---

## ⚙️ 15. AYARLAR (CONFIG)

### 15.1 Global Config
```javascript
// js/config.js
const CONFIG = {
  // Debug Mode
  DEBUG: true,  // Production'da false
  
  // Oyun Ayarları
  QUESTIONS_PER_GAME: 10,
  TIME_PER_QUESTION: 30, // saniye
  
  // Puan Ayarları
  POINTS: {
    easy: 10,
    medium: 15,
    hard: 20
  },
  
  // Combo Bonusları
  COMBO_BONUS: {
    3: 5,
    5: 10,
    10: 20
  },
  
  // Zorluk Seviyeleri
  DIFFICULTY: {
    easy: {
      wrongOptionsCount: 3,
      timeLimit: 30,
      hintsAllowed: 2
    },
    medium: {
      wrongOptionsCount: 3,
      timeLimit: 20,
      hintsAllowed: 1
    },
    hard: {
      wrongOptionsCount: 3,
      timeLimit: 15,
      hintsAllowed: 0
    }
  },
  
  // localStorage Keys
  STORAGE_KEYS: {
    TOTAL_POINTS: 'hasene_totalPoints',
    STREAK_DATA: 'hasene_streakData',
    DAILY_TASKS: 'hasene_dailyTasks',
    GAME_STATS: 'hasene_gameStats',
    DAILY_GOAL: 'hasene_dailyGoal',
    DAILY_PROGRESS: 'hasene_dailyProgress'
  },
  
  // Ses Ayarları
  AUDIO: {
    enabled: true,
    volume: 0.7
  },
  
  // Firebase
  FIREBASE_ENABLED: true
};
```

---

## 🎨 16. CSS YAPISI

### 16.1 Glassmorphism Effect
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 16.2 Gradient Background
```css
body {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### 16.3 Button Styles
```css
.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  border-radius: 15px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.primary-btn:active {
  transform: translateY(0);
}
```

---

## 🔧 17. UTILITY FONKSİYONLAR

### 17.1 Tarih/Saat
```javascript
function getLocalDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // "2024-12-25"
}

function formatDate(date) {
  const options = {day: 'numeric', month: 'long', year: 'numeric'};
  return new Date(date).toLocaleDateString('tr-TR', options);
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
```

### 17.2 Array İşlemleri
```javascript
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomItems(array, count) {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}
```

### 17.3 Sayı Formatlama
```javascript
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
```

### 17.4 Debounce
```javascript
function debounce(func, delay) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Kullanım
const debouncedSaveStats = debounce(saveStats, 500);
```

---

## 🧪 18. TEST SİSTEMİ

### 18.1 Quick Test Functions
```javascript
// js/quick-test.js

// Hızlı Test Butonu
function quickTestAll() {
  console.log('🧪 QUICK TEST BAŞLADI');
  
  // 1. LocalStorage Test
  testLocalStorage();
  
  // 2. Firebase Test
  testFirebase();
  
  // 3. Veri Yükleme Test
  testDataLoading();
  
  // 4. Puan Sistemi Test
  testPointsSystem();
  
  // 5. UI Test
  testUI();
  
  console.log('✅ TÜM TESTLER TAMAMLANDI');
}

function testLocalStorage() {
  console.log('📦 localStorage Test...');
  localStorage.setItem('test_key', 'test_value');
  const value = localStorage.getItem('test_key');
  console.assert(value === 'test_value', 'localStorage çalışıyor');
  localStorage.removeItem('test_key');
}

function testFirebase() {
  console.log('🔥 Firebase Test...');
  if (window.firebase && window.firestore) {
    console.log('✅ Firebase initialized');
  } else {
    console.warn('⚠️ Firebase not available');
  }
}
```

---

## 🚀 19. DEPLOYMENT (YAYINLAMA)

### 19.1 Build Checklist
```
□ DEBUG mode'u kapat (CONFIG.DEBUG = false)
□ Console.log'ları temizle/suppress et
□ Firebase config doğru mu kontrol et
□ Firestore rules yayınlandı mı?
□ Service Worker cache version güncelle
□ Manifest.json kontrol et
□ Tüm ASSETS yüklü mü?
□ Responsive tasarım test et (mobil/tablet)
□ Offline mode test et
□ Browser compatibility test (Chrome, Safari, Firefox)
```

### 19.2 Hosting Options
```
1. Firebase Hosting (Önerilen)
   - firebase deploy

2. Netlify
   - Git push ile otomatik deploy

3. Vercel
   - Git integration

4. GitHub Pages
   - gh-pages branch
```

---

## 📚 20. KAYNAKLAR VE VERİLER

### 20.1 Veri Kaynakları
- **Kelimeler**: 3 harfli Arapça kelimeler (300+ kelime)
- **Ayetler**: Kur'an ayetleri (meal dahil)
- **Dualar**: Günlük dualar (Sabah/Akşam/Yemek/vs)
- **Hadisler**: Kısa hadisler (kaynak belirtili)
- **Elifba**: 29 harf + harekeler

### 20.2 Ses Dosyaları
- **Toplam**: ~200 ses dosyası
- **Format**: MP3
- **Kalite**: 128kbps
- **Kaynak**: Profesyonel ses kaydı gerekli

### 20.3 Görseller
- **Rozetler**: 42 adet (PNG, 512x512)
- **İkonlar**: 15 adet oyun modu ikonu
- **Logo**: Ana logo (512x512, maskable)

---

## 🎯 21. GELİŞTİRME SIRASI (ROADMAP)

### Phase 1: Temel Yapı (1-2 hafta)
```
1. HTML yapısı (index.html)
2. CSS tasarımı (style.css)
3. Temel JavaScript (config, utils)
4. localStorage implementasyonu
5. Kullanıcı auth sistemi
6. Ana menü ve navigasyon
```

### Phase 2: Oyun Modları (2-3 hafta)
```
1. Kelime Bul oyunu
2. Ayet Oku
3. Dua Et
4. Hadis Oku
5. Boşluk Doldur
6. Dinle ve Bul
7. Elifba modları (8 alt mod)
```

### Phase 3: Özellikler (1-2 hafta)
```
1. Puan sistemi
2. Level sistemi
3. Başarılar
4. Rozetler
5. Günlük görevler
6. Streak sistemi
7. Favoriler
```

### Phase 4: Sosyal (1 hafta)
```
1. Lig sistemi
2. Leaderboard
3. Haftalık XP
```

### Phase 5: Firebase (1 hafta)
```
1. Firebase setup
2. Firestore entegrasyonu
3. Authentication
4. Data sync
```

### Phase 6: PWA (3-5 gün)
```
1. Manifest.json
2. Service Worker
3. Offline support
4. Install prompt
```

### Phase 7: Polish (1 hafta)
```
1. Bug fixes
2. Performance optimization
3. UI/UX iyileştirmeleri
4. Ses efektleri
5. Animasyonlar
```

### Phase 8: Test & Deploy (3-5 gün)
```
1. Cross-browser testing
2. Mobile testing
3. Performance testing
4. Deployment
```

---

## 🔑 22. ÖNEMLİ NOTLAR

### 22.1 Performans
```
- JSON dosyaları lazy load edilmeli (sadece ihtiyaç duyulunca)
- Büyük arrayler için virtual scrolling kullan
- Image'ler lazy load olmalı
- Debounce kullan (save, search, vs)
- Service Worker ile agresif caching
```

### 22.2 Güvenlik
```
- XSS koruması: textContent kullan (innerHTML DEĞİL)
- Input validation: Her kullanıcı input'u kontrol et
- Firebase rules: Sadece authenticated kullanıcılar yazabilir
- Rate limiting: API çağrılarını sınırla
```

### 22.3 Offline Support
```
- Tüm kritik dosyalar cache'lenmeli
- localStorage her zaman çalışmalı
- Firebase offline persistence aktif
- Sync queue: Offline'ken yapılan değişiklikler online olunca sync olsun
```

### 22.4 Mobil Optimizasyon
```
- Touch-friendly button'lar (min 44x44px)
- Viewport meta tag doğru ayarlanmalı
- No zoom on input (font-size >= 16px)
- Swipe gestures
- iOS safe area desteği
```

---

## 📦 23. DEPENDENCIES (BAĞIMLILIKLAR)

### 23.1 Harici Kütüphaneler
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>

<!-- Font (Opsiyonel - Arapça için) -->
<style>
@font-face {
  font-family: 'KFGQPC';
  src: url('ASSETS/fonts/KFGQPC Uthmanic Script HAFS Regular.otf');
}
</style>
```

### 23.2 Gerekli Paketler (npm)
```json
{
  "devDependencies": {
    "firebase-tools": "^12.0.0",
    "live-server": "^1.2.2"
  }
}
```

---

## 🎓 24. EĞİTİM İÇERİĞİ

### 24.1 Kelime Kategorileri
```
- İsimler (Ev, Su, Kitap, vs)
- Fiiller (Oku, Yaz, Git, vs)
- Sıfatlar (Büyük, Küçük, vs)
- Zamirler (Ben, Sen, O, vs)
- Sayılar (Bir, İki, Üç, vs)
- Renkler (Kırmızı, Mavi, vs)
- Hayvanlar
- Yiyecekler
- Mekanlar
```

### 24.2 Hareke Sistemleri
```
1. Üstün (َ) - Fetha
2. Esre (ِ) - Kesra
3. Ötre (ُ) - Damma
4. Cezm (ْ) - Sukun
5. Şedde (ّ) - Teshdid
6. Tenvin (ً ٍ ٌ) - Tanvin
7. Uzatma (med)
   - Elif (ا)
   - Vav (و)
   - Ya (ي)
```

---

## 🏁 25. BİTİRME KRİTERLERİ

Proje tamamlandı sayılır eğer:

```
✅ Tüm 7 oyun modu çalışıyor
✅ Firebase entegrasyonu tam
✅ Offline mode çalışıyor
✅ PWA olarak yüklenebiliyor
✅ Mobil responsive
✅ Puan sistemi tam çalışıyor
✅ Başarılar ve rozetler çalışıyor
✅ Lig sistemi aktif
✅ Günlük görevler çalışıyor
✅ Sesli okuma çalışıyor
✅ Kullanıcı auth sistemi tam
✅ localStorage <-> Firebase sync çalışıyor
✅ Cross-browser uyumlu (Chrome, Safari, Firefox)
✅ Bug-free (kritik bug yok)
✅ Performance iyi (< 3s load time)
```

---

## 📞 26. DESTEK VE İLETİŞİM

### 26.1 Dokümantasyon
- README.md: Genel bilgiler
- FIREBASE_SETUP.md: Firebase kurulumu
- CODE_QUALITY_ANALYSIS.md: Kod kalitesi raporu

### 26.2 GitHub
```
Repository: https://github.com/YZOKUMUS/YZOKUMUS_PROJE_SON
Issues: GitHub Issues kullan
Pull Requests: Kod katkıları için PR aç
```

---

**SON NOTLAR**:
- Bu dokümantasyon ile projeyi SIFIRDAN yazabilirsin
- Her bölüm bağımsız çalışabilir
- Adım adım implement edebilirsin
- Test-driven development önerilir
- Git kullan (sık commit)
- Her feature için ayrı branch

**İYİ ŞANSLAR! 🚀**

---

*Versiyon: 1.0*  
*Tarih: 25 Aralık 2024*  
*Hazırlayan: Claude (Anthropic)*

