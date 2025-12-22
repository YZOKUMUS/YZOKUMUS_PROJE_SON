/**
 * Hasene Arapça Dersi - Constants
 * Seviye, rozet ve görev sabitleri
 */

// Level Thresholds
const LEVELS = {
    THRESHOLDS: {
        1: 0,
        2: 2500,
        3: 5000,
        4: 8500,
        5: 13000,
        6: 18500,
        7: 25000,
        8: 32500,
        9: 41000,
        10: 50000
    },
    INCREMENT_AFTER_10: 15000,
    NAMES: {
        1: 'Mübtedi',
        2: 'Müterakki',
        3: 'Mürid',
        4: 'Talib',
        5: 'Müteallim',
        6: 'Hafız',
        7: 'Alim',
        8: 'Müderris',
        9: 'Mütehassıs',
        10: 'Usta'
    }
};

// Daily Tasks Template
const DAILY_TASKS_TEMPLATE = [
    {
        id: 'daily_3_modes',
        name: '3 Oyun Modu',
        description: '🎮 3 farklı oyun modu oyna',
        target: 3,
        type: 'game_modes',
        reward: 50,
        icon: '🎮'
    },
    {
        id: 'daily_ayet_oku',
        name: 'Ayet Oku',
        description: '📖 5 ayet oku',
        target: 5,
        type: 'ayet_oku',
        reward: 30,
        icon: '📖'
    },
    {
        id: 'daily_dua_et',
        name: 'Dua Et',
        description: '🤲 3 dua oku',
        target: 3,
        type: 'dua_et',
        reward: 30,
        icon: '🤲'
    },
    {
        id: 'daily_hadis_oku',
        name: 'Hadis Oku',
        description: '📜 3 hadis oku',
        target: 3,
        type: 'hadis_oku',
        reward: 30,
        icon: '📜'
    }
];

// Bonus Tasks Template
const DAILY_BONUS_TASKS_TEMPLATE = [
    {
        id: 'daily_30_correct',
        name: '30 Doğru Cevap',
        description: '✅ 30 doğru cevap ver',
        target: 30,
        type: 'correct',
        reward: 100,
        icon: '✅'
    },
    {
        id: 'daily_500_hasene',
        name: '500 Hasene',
        description: '💰 500 Hasene kazan',
        target: 500,
        type: 'hasene',
        reward: 50,
        icon: '💰'
    }
];

// Achievements - 44 adet başarım
const ACHIEVEMENTS = [
    // İlk Adımlar (1-6 Yıldız)
    { id: 'first_victory', name: '🕌 İlk Kelime', description: '1 Yıldız kazan - İlk adımını at', check: (stats) => stats.stars >= 1 },
    { id: 'bismillah', name: 'بِسْمِ اللَّهِ', description: '2 Yıldız kazan', check: (stats) => stats.stars >= 2 },
    { id: 'combo_master', name: '🕌 Muvazebet Ustası', description: '3 Yıldız kazan', check: (stats) => stats.stars >= 3 },
    { id: 'first_step', name: '🌱 İlk Adım', description: '4 Yıldız kazan', check: (stats) => stats.stars >= 4 },
    { id: 'level_1', name: '📖 Mübtedi', description: '5 Yıldız kazan', check: (stats) => stats.stars >= 5 },
    { id: 'perfect_lesson_1', name: '✨ Mükemmel Ders', description: '6 Yıldız kazan', check: (stats) => stats.stars >= 6 },
    
    // Başlangıç (8-50 Yıldız)
    { id: 'alhamdulillah', name: 'الْحَمْدُ لِلَّهِ', description: '8 Yıldız kazan', check: (stats) => stats.stars >= 8 },
    { id: 'combo_10', name: '🕋 On Muvazebet', description: '10 Yıldız kazan', check: (stats) => stats.stars >= 10 },
    { id: 'bronze_traveler', name: '📿 Mübtedi Talebe', description: '12 Yıldız kazan', check: (stats) => stats.stars >= 12 },
    { id: 'streak_3', name: '📿 Üç Gün Vird', description: '3 günlük seri yap', check: (stats) => stats.bestStreak >= 3 },
    { id: 'daily_hero', name: '📿 Günlük Vird', description: '18 Yıldız kazan', check: (stats) => stats.stars >= 18 },
    { id: 'mashallah', name: 'مَا شَاءَ اللَّهُ', description: '20 Yıldız kazan', check: (stats) => stats.stars >= 20 },
    { id: 'fast_student', name: '🕌 Hızlı Talebe', description: '25 Yıldız kazan', check: (stats) => stats.stars >= 25 },
    { id: 'perfect_lesson_5', name: '🌟 Beş Mükemmel', description: '5 mükemmel ders tamamla', check: (stats) => stats.perfectLessons >= 5 },
    { id: 'all_modes', name: '📚 Tüm Modlar', description: '35 Yıldız kazan', check: (stats) => stats.stars >= 35 },
    { id: 'streak_7', name: '🕌 Haftalık Vird', description: '7 günlük seri yap', check: (stats) => stats.bestStreak >= 7 },
    { id: 'level_5', name: '🕌 Mütebahhir', description: '50 Yıldız kazan', check: (stats) => stats.stars >= 50 },
    
    // İlerleme (60-250 Yıldız)
    { id: 'thousand_correct_250', name: '🕌 İki Yüz Elli Doğru', description: '250 doğru cevap ver', check: (stats) => stats.totalCorrect >= 250 },
    { id: 'silver_master', name: '🕋 Gümüş Mertebe', description: '75 Yıldız kazan', check: (stats) => stats.stars >= 75 },
    { id: 'combo_20', name: '☪️ Yirmi Muvazebet', description: '90 Yıldız kazan', check: (stats) => stats.stars >= 90 },
    { id: 'perfect_lesson_10', name: '💎 On Mükemmel', description: '10 mükemmel ders tamamla', check: (stats) => stats.perfectLessons >= 10 },
    { id: 'streak_14', name: '🌙 İki Hafta Vird', description: '14 günlük seri yap', check: (stats) => stats.bestStreak >= 14 },
    { id: 'thousand_correct_500', name: '🕌 Beş Yüz Doğru', description: '500 doğru cevap ver', check: (stats) => stats.totalCorrect >= 500 },
    { id: 'level_10', name: '🕋 Alim', description: '180 Yıldız kazan', check: (stats) => stats.stars >= 180 },
    { id: 'streak_21', name: '☪️ Üç Hafta Vird', description: '21 günlük seri yap', check: (stats) => stats.bestStreak >= 21 },
    { id: 'streak_30', name: '🕋 Ramazan Virdi', description: '30 günlük seri yap', check: (stats) => stats.bestStreak >= 30 },
    
    // Ustalık (300-700 Yıldız)
    { id: 'second_silver', name: '☪️ İkinci Gümüş', description: '300 Yıldız kazan', check: (stats) => stats.stars >= 300 },
    { id: 'thousand_correct', name: '🕌 Bin Doğru', description: '1000 doğru cevap ver', check: (stats) => stats.totalCorrect >= 1000 },
    { id: 'gold_master', name: '🌟 Altın Mertebe', description: '400 Yıldız kazan', check: (stats) => stats.stars >= 400 },
    { id: 'level_15', name: '☪️ Fakih', description: '500 Yıldız kazan', check: (stats) => stats.stars >= 500 },
    { id: 'streak_40', name: '🌟 Kırk Gün Vird', description: '40 günlük seri yap', check: (stats) => stats.bestStreak >= 40 },
    { id: 'level_20', name: '🌟 Muhaddis', description: '700 Yıldız kazan', check: (stats) => stats.stars >= 700 },
    
    // Master (800-1500 Yıldız)
    { id: 'second_gold', name: '💎 İkinci Altın', description: '800 Yıldız kazan', check: (stats) => stats.stars >= 800 },
    { id: 'perfect_lesson_50', name: '🌟 Elli Mükemmel', description: '50 mükemmel ders tamamla', check: (stats) => stats.perfectLessons >= 50 },
    { id: 'diamond_master', name: '✨ Elmas Mertebe', description: '1000 Yıldız kazan', check: (stats) => stats.stars >= 1000 },
    { id: 'level_25', name: '💎 Müfessir', description: '1200 Yıldız kazan', check: (stats) => stats.stars >= 1200 },
    { id: 'streak_100', name: '💎 Yüz Gün Vird', description: '100 günlük seri yap', check: (stats) => stats.bestStreak >= 100 },
    
    // Efsane (2000-10000 Yıldız)
    { id: 'master_of_masters', name: '📖 Ustalar Ustası', description: '2000 Yıldız kazan', check: (stats) => stats.stars >= 2000 },
    { id: 'level_30', name: '✨ Hafız', description: '2500 Yıldız kazan', check: (stats) => stats.stars >= 2500 },
    { id: 'perfect_lesson_100', name: '🕋 Yüz Mükemmel', description: '100 mükemmel ders tamamla', check: (stats) => stats.perfectLessons >= 100 },
    { id: 'five_thousand_correct', name: '🕋 Beş Bin Doğru', description: '5000 doğru cevap ver', check: (stats) => stats.totalCorrect >= 5000 },
    { id: 'diamond_master_final', name: '✨ Elmas Mertebe II', description: '5000 Yıldız kazan', check: (stats) => stats.stars >= 5000 },
    { id: 'master_of_masters_final', name: '📖 Ustalar Ustası II', description: '6000 Yıldız kazan', check: (stats) => stats.stars >= 6000 },
    { id: 'hafiz', name: '🕋 Kurra Hafız', description: '10000 Yıldız kazan (≈2.5M Hasene)', check: (stats) => stats.stars >= 10000 }
];

// Badge Definitions - Daha fazla rozet
const BADGE_DEFINITIONS = [
    // Temel Rozetler (1-10)
    { id: 'badge_1', name: 'İlk Adım', image: 'rozet1.png', description: '250 Hasene kazan', threshold: 250, icon: '🌱' },
    { id: 'badge_2', name: 'Başlangıç', image: 'rozet2.png', description: '500 Hasene kazan', threshold: 500, icon: '🌿' },
    { id: 'badge_3', name: 'İlk Seri', image: 'rozet3.png', description: '750 Hasene kazan', threshold: 750, icon: '🔥' },
    { id: 'badge_4', name: 'Hızlı Öğrenci', image: 'rozet4.png', description: '1000 Hasene kazan', threshold: 1000, icon: '⚡' },
    { id: 'badge_5', name: 'Combo Ustası', image: 'rozet5.png', description: '1500 Hasene kazan', threshold: 1500, icon: '💫' },
    { id: 'badge_6', name: 'Mükemmel Ders', image: 'rozet6.png', description: '2000 Hasene kazan', threshold: 2000, icon: '✨' },
    { id: 'badge_7', name: 'Haftalık Kahraman', image: 'rozet7.png', description: '2500 Hasene kazan', threshold: 2500, icon: '🏆' },
    { id: 'badge_8', name: 'Kelime Ustası', image: 'rozet8.png', description: '3500 Hasene kazan', threshold: 3500, icon: '📚' },
    { id: 'badge_9', name: 'İlerleme', image: 'rozet9.png', description: '5000 Hasene kazan', threshold: 5000, icon: '🚀' },
    { id: 'badge_10', name: 'Çoklu Mod', image: 'rozet10.png', description: '7500 Hasene kazan', threshold: 7500, icon: '🎮' },
    
    // Orta Seviye Rozetler (11-20)
    { id: 'badge_11', name: '2 Hafta Seri', image: 'rozet11.png', description: '10000 Hasene kazan', threshold: 10000, icon: '🗓️' },
    { id: 'badge_12', name: 'Bronz Yolcu', image: 'rozet12.png', description: '15000 Hasene kazan', threshold: 15000, icon: '🥉' },
    { id: 'badge_13', name: 'Azimli Talebe', image: 'rozet13.png', description: '17500 Hasene kazan', threshold: 17500, icon: '💪' },
    { id: 'badge_14', name: '10x Combo', image: 'rozet14.png', description: '20000 Hasene kazan', threshold: 20000, icon: '🔟' },
    { id: 'badge_15', name: '100 Doğru', image: 'rozet15.png', description: '25000 Hasene kazan', threshold: 25000, icon: '✅' },
    { id: 'badge_16', name: '3 Hafta Seri', image: 'rozet16.png', description: '30000 Hasene kazan', threshold: 30000, icon: '📆' },
    { id: 'badge_17', name: '5 Mükemmel', image: 'rozet17.png', description: '40000 Hasene kazan', threshold: 40000, icon: '⭐' },
    { id: 'badge_18', name: 'Gümüş Yolcu', image: 'rozet18.png', description: '50000 Hasene kazan', threshold: 50000, icon: '🥈' },
    { id: 'badge_19', name: 'Ay Boyunca', image: 'rozet19.png', description: '60000 Hasene kazan', threshold: 60000, icon: '🌙' },
    { id: 'badge_20', name: '250 Doğru', image: 'rozet20.png', description: '75000 Hasene kazan', threshold: 75000, icon: '🎯' },
    
    // İleri Seviye Rozetler (21-30)
    { id: 'badge_21', name: 'Mertebe 5', image: 'rozet21.png', description: '85000 Hasene kazan', threshold: 85000, icon: '5️⃣' },
    { id: 'badge_22', name: 'Altın Yolcu', image: 'rozet22.png', description: '100000 Hasene kazan', threshold: 100000, icon: '🥇' },
    { id: 'badge_23', name: '20x Combo', image: 'rozet23.png', description: '125000 Hasene kazan', threshold: 125000, icon: '2️⃣0️⃣' },
    { id: 'badge_24', name: '500 Doğru', image: 'rozet24.png', description: '150000 Hasene kazan', threshold: 150000, icon: '🎖️' },
    { id: 'badge_25', name: '10 Mükemmel', image: 'rozet25.png', description: '200000 Hasene kazan', threshold: 200000, icon: '🌟' },
    { id: 'badge_26', name: 'Mertebe 10', image: 'rozet26.png', description: '250000 Hasene kazan', threshold: 250000, icon: '🔟' },
    { id: 'badge_27', name: 'Elmas Yolcu', image: 'rozet27.png', description: '300000 Hasene kazan', threshold: 300000, icon: '💎' },
    { id: 'badge_28', name: '1000 Doğru', image: 'rozet28.png', description: '400000 Hasene kazan', threshold: 400000, icon: '🏅' },
    { id: 'badge_29', name: '50 Gün Seri', image: 'rozet29.png', description: '500000 Hasene kazan', threshold: 500000, icon: '🗓️' },
    { id: 'badge_30', name: 'Ustalar Ustası', image: 'rozet30.png', description: '600000 Hasene kazan', threshold: 600000, icon: '👑' },
    
    // Uzman Seviye Rozetler (31-42)
    { id: 'badge_31', name: 'Mertebe 15', image: 'rozet31.png', description: '700000 Hasene kazan', threshold: 700000, icon: '1️⃣5️⃣' },
    { id: 'badge_32', name: 'Mertebe 20', image: 'rozet32.png', description: '750000 Hasene kazan', threshold: 750000, icon: '2️⃣0️⃣' },
    { id: 'badge_33', name: '100 Mükemmel', image: 'rozet33.png', description: '850000 Hasene kazan', threshold: 850000, icon: '💯' },
    { id: 'badge_34', name: '100 Gün Seri', image: 'rozet34.png', description: '1000000 Hasene kazan', threshold: 1000000, icon: '📅' },
    { id: 'badge_35', name: '5000 Doğru', image: 'rozet35.png', description: '1250000 Hasene kazan', threshold: 1250000, icon: '🏆' },
    { id: 'badge_36', name: 'HAFIZ', image: 'rozet36.png', description: '1500000 Hasene kazan', threshold: 1500000, icon: '📖' },
    { id: 'badge_37', name: 'Alim', image: 'rozet37.png', description: '1750000 Hasene kazan', threshold: 1750000, icon: '🎓' },
    { id: 'badge_38', name: 'Muhaddis', image: 'rozet38.png', description: '2000000 Hasene kazan', threshold: 2000000, icon: '📜' },
    { id: 'badge_39', name: 'Müfessir', image: 'rozet39.png', description: '2250000 Hasene kazan', threshold: 2250000, icon: '📕' },
    { id: 'badge_40', name: 'Fakih', image: 'rozet40.png', description: '2400000 Hasene kazan', threshold: 2400000, icon: '⚖️' },
    { id: 'badge_41', name: 'İmam', image: 'rozet41.png', description: '2450000 Hasene kazan', threshold: 2450000, icon: '🕌' },
    { id: 'badge_42', name: 'Efsane', image: 'rozet42.png', description: '2500000 Hasene kazan', threshold: 2500000, icon: '👑' }
];

// Asr-ı Saadet Rozetleri - 41 Adet (4 Dönem)
const ASR_I_SAADET_BADGES = {
    // Mekke Dönemi (1-13) - 610 öncesi ve Hicret öncesi
    mekke: [
        { id: 'asr_1', name: 'Doğum', year: 571, description: 'Hz. Muhammed (sav) doğumu', threshold: 250, image: 'rozet1.png' },
        { id: 'asr_2', name: 'Sütannesi Halime', year: 575, description: 'Sütannesi Halime dönemini yad et', threshold: 500, image: 'rozet2.png' },
        { id: 'asr_3', name: 'Dedesi Abdülmuttalib', year: 578, description: 'Dedesi Abdülmuttalib vefatı', threshold: 750, image: 'rozet3.png' },
        { id: 'asr_4', name: 'Amcası Ebu Talib', year: 579, description: 'Amcası Ebu Talib himayesi', threshold: 1000, image: 'rozet4.png' },
        { id: 'asr_5', name: 'Hz. Hatice ile Evlilik', year: 595, description: 'Hz. Hatice ile evlilik', threshold: 1250, image: 'rozet5.png' },
        { id: 'asr_6', name: 'İlk Vahiy', year: 610, description: 'Hira Mağarası - İlk Vahiy', threshold: 1500, image: 'hira-magarasi.png' },
        { id: 'asr_7', name: 'İlk Müslümanlar', year: 610, description: 'İlk iman edenler', threshold: 1750, image: 'rozet7.png' },
        { id: 'asr_8', name: 'Açık Davet', year: 613, description: 'Açık davet dönemi', threshold: 2000, image: 'rozet8.png' },
        { id: 'asr_9', name: 'Habeşistan Hicreti', year: 615, description: 'İlk Hicret - Habeşistan', threshold: 2500, image: 'rozet9.png' },
        { id: 'asr_10', name: 'Hüzün Yılı', year: 619, description: 'Hz. Hatice ve Ebu Talib vefatı', threshold: 3000, image: 'rozet10.png' },
        { id: 'asr_11', name: 'İsra ve Miraç', year: 620, description: 'Miracı yad et', threshold: 3500, image: 'gokyuzu.png' },
        { id: 'asr_12', name: 'Birinci Akabe Biatı', year: 621, description: '1. Akabe Biatı', threshold: 4000, image: 'rozet12.png' },
        { id: 'asr_13', name: 'İkinci Akabe Biatı', year: 622, description: '2. Akabe Biatı', threshold: 4500, image: 'rozet42.png' }
    ],
    
    // Medine Dönemi (14-27) - Hicret sonrası
    medine: [
        { id: 'asr_14', name: 'Hicret', year: 622, description: 'Medine\'ye Hicret (Hicri 1)', threshold: 5000, image: 'deve-kervani.png' },
        { id: 'asr_15', name: 'Mescid-i Nebevi İnşası', year: 622, description: 'Mescid-i Nebevi inşa edildi', threshold: 6000, image: 'rozet15.png' },
        { id: 'asr_16', name: 'Kardeşlik Antlaşması', year: 622, description: 'Muhacir-Ensar kardeşliği', threshold: 7000, image: 'rozet16.png' },
        { id: 'asr_17', name: 'Bedir Savaşı', year: 624, description: 'Bedir Zaferi (Hicri 2)', threshold: 8000, image: 'rozet17.png' },
        { id: 'asr_18', name: 'Ramazan Orucu', year: 624, description: 'Ramazan orucu farz kılındı', threshold: 9000, image: 'rozet18.png' },
        { id: 'asr_19', name: 'Uhud Savaşı', year: 625, description: 'Uhud Savaşı (Hicri 3)', threshold: 10000, image: 'rozet19.png' },
        { id: 'asr_20', name: 'Hendek Savaşı', year: 627, description: 'Hendek Savaşı (Hicri 5)', threshold: 12000, image: 'rozet20.png' },
        { id: 'asr_21', name: 'Hudeybiye Antlaşması', year: 628, description: 'Hudeybiye Barışı (Hicri 6)', threshold: 14000, image: 'rozet21.png' },
        { id: 'asr_22', name: 'Hayber\'in Fethi', year: 629, description: 'Hayber Fethi (Hicri 7)', threshold: 16000, image: 'rozet22.png' },
        { id: 'asr_23', name: 'Mekke\'nin Fethi', year: 630, description: 'Mekke Fethi (Hicri 8)', threshold: 18000, image: 'rozet23.png' },
        { id: 'asr_24', name: 'Huneyn Savaşı', year: 630, description: 'Huneyn Zaferi', threshold: 20000, image: 'rozet24.png' },
        { id: 'asr_25', name: 'Tebük Seferi', year: 630, description: 'Tebük Seferi (Hicri 9)', threshold: 22000, image: 'rozet25.png' },
        { id: 'asr_26', name: 'Veda Haccı', year: 631, description: 'Veda Hutbesi (Hicri 9)', threshold: 24000, image: 'rozet26.png' },
        { id: 'asr_27', name: 'Vefat', year: 632, description: 'Hz. Peygamber vefatı (Hicri 11)', threshold: 26000, image: 'mezar-tasi.png' }
    ],
    
    // Hz. Ebu Bekir & Hz. Ömer Dönemi (28-34)
    ilkIkiHalife: [
        { id: 'asr_28', name: 'Hz. Ebu Bekir Halife', year: 632, description: 'Hz. Ebu Bekir halife seçildi', threshold: 28000, image: 'rozet28.png' },
        { id: 'asr_29', name: 'Ridde Savaşları', year: 633, description: 'Ridde Savaşları (632-633)', threshold: 30000, image: 'rozet29.png' },
        { id: 'asr_30', name: 'Hz. Ömer Halife', year: 634, description: 'Hz. Ömer halife seçildi', threshold: 32000, image: 'rozet30.png' },
        { id: 'asr_31', name: 'Kadisiyye Savaşı', year: 636, description: 'Kadisiyye Zaferi', threshold: 35000, image: 'rozet14.png' },
        { id: 'asr_32', name: 'Kudüs\'ün Fethi', year: 637, description: 'Kudüs\'ün barışla fethi', threshold: 38000, image: 'rozet32.png' },
        { id: 'asr_33', name: 'Hicri Takvim', year: 638, description: 'Hicri Takvim başlatıldı', threshold: 42000, image: 'rozet33.png' },
        { id: 'asr_34', name: 'Hz. Ömer Şehadeti', year: 644, description: 'Hz. Ömer şehit edildi', threshold: 45000, image: 'rozet34.png' }
    ],
    
    // Hz. Osman & Hz. Ali Dönemi (35-41)
    sonIkiHalife: [
        { id: 'asr_35', name: 'Hz. Osman Halife', year: 644, description: 'Hz. Osman halife seçildi', threshold: 50000, image: 'rozet35.png' },
        { id: 'asr_36', name: 'Kuran\'ın Çoğaltılması', year: 650, description: 'Mushaf çoğaltıldı', threshold: 55000, image: 'rozet36.png' },
        { id: 'asr_37', name: 'Hz. Osman Şehadeti', year: 656, description: 'Hz. Osman şehit edildi', threshold: 60000, image: 'rozet6.png' },
        { id: 'asr_38', name: 'Hz. Ali Halife', year: 656, description: 'Hz. Ali halife seçildi', threshold: 65000, image: 'rozet11.png' },
        { id: 'asr_39', name: 'Cemel Vakası', year: 656, description: 'Cemel (Deve) Vakası', threshold: 70000, image: 'rozet111.png' },
        { id: 'asr_40', name: 'Sıffin Savaşı', year: 657, description: 'Sıffin Savaşı', threshold: 75000, image: 'rozet27.png' },
        { id: 'asr_41', name: 'Hz. Ali Şehadeti', year: 661, description: 'Hz. Ali şehit edildi', threshold: 80000, image: 'rozet42.png' }
    ]
};

// Islamic Teachings for Rewards
const ISLAMIC_TEACHINGS = [
    {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        turkish: 'Rahman ve Rahim olan Allah\'ın adıyla',
        explanation: 'Her işe Allah\'ın adıyla başlamak sünnettir.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'سُبْحَانَ اللَّهِ',
        turkish: 'Allah noksan sıfatlardan münezzehtir',
        explanation: 'Tesbih, Allah\'ı anmak için en güzel zikirlerdendir.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'الْحَمْدُ لِلَّهِ',
        turkish: 'Hamd Allah\'a mahsustur',
        explanation: 'Her durumda Allah\'a hamd etmek şükrün temelidir.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'اللهُ أَكْبَرُ',
        turkish: 'Allah en büyüktür',
        explanation: 'Tekbir, Allah\'ın büyüklüğünü hatırlamamızı sağlar.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
        turkish: 'Allah\'tan başka ilah yoktur',
        explanation: 'Tevhid, İslam\'ın temel inanç esasıdır.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
        turkish: 'Allah bize yeter, O ne güzel vekildir',
        explanation: 'Her durumda Allah\'a tevekkül etmek müminlerin özelliğidir.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
        turkish: 'Güç ve kuvvet ancak Allah iledir',
        explanation: 'Havkale, cennet hazinelerinden bir hazinedir.',
        rewardAmounts: [100, 250, 500]
    },
    {
        arabic: 'رَبِّ زِدْنِي عِلْمًا',
        turkish: 'Rabbim, benim ilmimi artır',
        explanation: 'İlim talep etmek her Müslümanın görevidir.',
        rewardAmounts: [100, 250, 500]
    }
];

// Onboarding Slides
const ONBOARDING_SLIDES = [
    {
        icon: '🕌',
        title: 'Hasene\'ye Hoş Geldiniz!',
        description: 'Kuran kelimeleri ve İslami içeriklerle dolu eğlenceli bir öğrenme yolculuğuna başlayın.'
    },
    {
        icon: '🎯',
        title: 'Kimler İçin?',
        description: 'Kuran\'daki Arapça kelimeleri öğrenmek isteyen herkes için tasarlandı. Başlangıç seviyesinden ileri seviyeye kadar.'
    },
    {
        icon: '📚',
        title: '7 Oyun Modu',
        description: 'Kelime Çevir, Dinle Bul, Boşluk Doldur, Ayet Oku, Dua Et, Hadis Oku ve Elif Ba modlarıyla öğrenin.'
    },
    {
        icon: '💰',
        title: 'Hasene Puan Sistemi',
        description: 'Her doğru cevap için Hasene kazanın. Combo yaparak bonus puan toplayın. 250 Hasene = 1 Yıldız!'
    },
    {
        icon: '📅',
        title: 'Günlük Görevler & Seri',
        description: 'Günlük görevleri tamamlayın, seri yapın ve özel ödüller kazanın. Düzenli çalışma başarının anahtarıdır.'
    },
    {
        icon: '🏆',
        title: '44 Başarım & 42 Rozet',
        description: 'Başarımlar kazanın, rozetler toplayın ve seviyenizi yükseltin. Hedef: Kurra Hafız olmak!'
    }
];

// Make them globally available
if (typeof window !== 'undefined') {
    window.LEVELS = LEVELS;
    window.DAILY_TASKS_TEMPLATE = DAILY_TASKS_TEMPLATE;
    window.DAILY_BONUS_TASKS_TEMPLATE = DAILY_BONUS_TASKS_TEMPLATE;
    window.ACHIEVEMENTS = ACHIEVEMENTS;
    window.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
    window.ASR_I_SAADET_BADGES = ASR_I_SAADET_BADGES;
    window.ISLAMIC_TEACHINGS = ISLAMIC_TEACHINGS;
    window.ONBOARDING_SLIDES = ONBOARDING_SLIDES;
}
