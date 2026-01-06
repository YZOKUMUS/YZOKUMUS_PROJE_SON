/**
 * Hasene Arapça Dersi - Game Core
 * Ana oyun mantığı ve state yönetimi
 */

// ========================================
// GLOBAL STATE
// ========================================

// User & Points
let totalPoints = 0;
let sessionScore = 0;
let currentLevel = 1;

// Game State
let currentGameMode = null;
let currentDifficulty = 'easy';
let questionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let comboCount = 0;
let maxCombo = 0;
let gameCompleted = false; // Oyun tamamlandı mı (puanlar kaydedildi)

// Current Questions
let currentQuestions = [];
let currentQuestion = null;
let currentOptions = []; // Current answer options for hint system

// Reading Mode Indices
let currentAyetIndex = 0;
let currentDuaIndex = 0;
let currentHadisIndex = 0;

// Submode tracking
let currentKelimeSubmode = 'classic';
let currentElifBaSubmode = 'harfler';

// Word Stats for SM-2 Algorithm
let wordStats = {};

// Favorites
let favorites = [];

// Unlocked Achievements
let unlockedAchievements = [];

// Unlocked Badges (date keyed)
let badgesUnlocked = {};

// Onboarding
let onboardingSlideIndex = 0;

// ========================================
// MODAL, PANEL & AUDIO YÖNETİMİ
// ========================================

// Açık olan modal ve panel takibi
let currentOpenModal = null;
let currentOpenPanel = null;
let currentPlayingAudio = null;
let isAudioPlaying = false;

/**
 * Tüm sesleri durdur
 */
function stopAllAudio() {
    if (currentPlayingAudio) {
        try {
            currentPlayingAudio.pause();
            currentPlayingAudio.currentTime = 0;
        } catch (e) {}
        currentPlayingAudio = null;
    }
    isAudioPlaying = false;
}

/**
 * Güvenli ses çalma - üst üste binmeyi önler
 */
function playSafeAudio(url) {
    if (!url) return null;
    
    // Önce mevcut sesi durdur
    stopAllAudio();
    
    try {
        const audio = new Audio(url);
        audio.volume = typeof CONFIG !== 'undefined' ? CONFIG.AUDIO.volume : 0.8;
        
        audio.onended = () => {
            currentPlayingAudio = null;
            isAudioPlaying = false;
        };
        
        audio.onerror = () => {
            currentPlayingAudio = null;
            isAudioPlaying = false;
        };
        
        currentPlayingAudio = audio;
        isAudioPlaying = true;
        
        audio.play().catch(err => {
            console.warn('Audio play failed:', err);
            currentPlayingAudio = null;
            isAudioPlaying = false;
        });
        
        return audio;
    } catch (err) {
        console.warn('Audio creation failed:', err);
        return null;
    }
}

/**
 * Tüm modalları kapat
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    currentOpenModal = null;
}

/**
 * Güvenli modal açma - önce diğer modalları kapatır
 */
function openModal(modalId) {
    // Önce tüm modalları kapat
    closeAllModals();
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Mobilde modal'ın görünür olduğundan emin ol
        if (modal.style) {
            modal.style.display = 'flex';
            modal.style.zIndex = '1000';
        }
        currentOpenModal = modalId;
        
        // Mobilde scroll'u en üste al
        if (modal.scrollTop !== undefined) {
            modal.scrollTop = 0;
        }
    } else {
        console.error('Modal not found:', modalId);
    }
}

/**
 * Modal kapatma
 */
function showTestToolsModal() {
    const modal = document.getElementById('test-tools-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Update fix count in modal
        if (typeof updateFixCount === 'function') {
            updateFixCount();
        }
        // Also update modal's fix count
        const fixCountModal = document.getElementById('fix-count-modal');
        const fixCount = document.getElementById('fix-count');
        if (fixCountModal && fixCount) {
            fixCountModal.textContent = fixCount.textContent || '0';
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
    if (currentOpenModal === modalId) {
        currentOpenModal = null;
    }
}

/**
 * Tüm panelleri (ekranları) gizle
 */
function hideAllPanels() {
    // Oyun ekranlarını gizle
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Alt menüleri gizle
    document.getElementById('kelime-submode-selection')?.classList.add('hidden');
    document.getElementById('elif-ba-submode-selection')?.classList.add('hidden');
    
    currentOpenPanel = null;
}

/**
 * Panel (ekran) göster - önce diğerlerini kapatır
 */
function showPanel(panelId) {
    // Önce sesi durdur
    stopAllAudio();
    
    // Tüm panelleri gizle
    hideAllPanels();
    
    // Modalları da kapat
    closeAllModals();
    
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('hidden');
        currentOpenPanel = panelId;
    }
}

/**
 * Ana ekrana dön - sesleri durdur, modalları/panelleri kapat
 */
function goToMainScreen() {
    // Sesi durdur
    stopAllAudio();
    
    // Tüm modalları kapat
    closeAllModals();
    
    // Tüm panelleri gizle
    hideAllPanels();
    
    // Ana container'ı göster
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.classList.remove('hidden');
    }
    
    // State'i sıfırla
    currentGameMode = null;
    currentOpenPanel = null;
}

/**
 * Geri dön butonu davranışı
 */
function handleBackButton() {
    // Önce sesi durdur
    stopAllAudio();
    
    // Modal açıksa önce onu kapat
    if (currentOpenModal) {
        closeModal(currentOpenModal);
        return;
    }
    
    // Panel (oyun ekranı) açıksa ana ekrana dön
    if (currentOpenPanel) {
        goToMainScreen();
        return;
    }
    
    // Hiçbiri açık değilse zaten ana ekrandayız
}

// Streak & Stats
let streakData = {
    currentStreak: 0,
    bestStreak: 0,
    totalPlayDays: 0,
    lastPlayDate: '',
    playDates: []
};

// Game Stats
let gameStats = {
    totalCorrect: 0,
    totalWrong: 0,
    perfectLessons: 0,
    gameModeCounts: {}
};

// Daily Tasks
let dailyTasks = {
    lastTaskDate: '',
    tasks: [],
    bonusTasks: [],
    todayStats: {
        toplamDogru: 0,
        toplamPuan: 0,
        comboCount: 0,
        allGameModes: [],
        ayet_oku: 0,
        dua_et: 0,
        hadis_oku: 0
    }
};

// Daily Goal
let dailyGoal = 2700;
let dailyProgress = 0;

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize the application
 */
async function initApp() {
    console.log('🚀 Hasene Arapça Dersi başlatılıyor...');
    
    // Initialize notifications
    if (typeof window.initNotifications === 'function') {
        await window.initNotifications();
    }
    
    // Load stats
    await loadStats();
    
    // Setup UI
    setupEventListeners();
    updateStatsDisplay();
    
    // Update user status UI
    if (typeof window.updateUserStatusUI === 'function') {
        window.updateUserStatusUI();
    }
    
    // Browser geri tuşu dinleyicisi
    setupBackButtonHandler();
    
    // Preload data in background
    preloadAllData();
    
    // Register service worker
    registerServiceWorker();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        
        // Check if first time (show onboarding)
        const onboardingComplete = localStorage.getItem('hasene_onboarding_complete');
        if (!onboardingComplete) {
            setTimeout(() => showOnboarding(), 500);
        }
        // Günlük ödül artık otomatik gösterilmiyor
        // Kullanıcı bir aktivite yaptıktan sonra (oyun tamamlandığında veya görevler tamamlandığında) gösterilecek
    }, 1500);
    
    console.log('✅ Uygulama başlatıldı');
}

/**
 * Check and show daily reward if not claimed today
 */
function checkAndShowDailyReward() {
    const today = getLocalDateString();
    const lastReward = localStorage.getItem('hasene_last_daily_reward');
    
    if (lastReward !== today) {
        setTimeout(() => showDailyReward(), 500);
    }
}

/**
 * Load all saved stats
 */
/**
 * Load all stats from localStorage
 * @param {boolean} skipStreakCheck - If true, skip checkStreak() call (used when resetting data)
 */
async function loadStats(skipStreakCheck = false) {
    // Total points - ÖNCE localStorage'dan oku
    const localPoints = loadFromStorage(CONFIG.STORAGE_KEYS.TOTAL_POINTS, 0);
    
    // ✅ HER ZAMAN Firebase'den kontrol et (kullanıcı giriş yaptıysa)
    // Bu sayede çıkış/giriş sonrası veriler Firebase'den gelir
    let firebaseUserStats = null;
    if (typeof window.loadUserStats === 'function') {
        try {
            console.log('🔄 Firebase\'den kullanıcı istatistikleri yükleniyor...');
            firebaseUserStats = await window.loadUserStats();
            
            if (firebaseUserStats && firebaseUserStats.total_points !== undefined && firebaseUserStats.total_points !== null) {
                console.log('☁️ Firebase\'den veri geldi:', firebaseUserStats.total_points, 'puan');
                
                // Firebase'den gelen değeri kullan
                totalPoints = firebaseUserStats.total_points;
                
                // Firebase'den yüklenen değeri localStorage'a kaydet
                saveToStorage(CONFIG.STORAGE_KEYS.TOTAL_POINTS, totalPoints);
                
                console.log('✅ Firebase verisi localStorage\'a kaydedildi');
            } else {
                // Firebase'de veri yoksa localStorage'daki değeri kullan
                console.log('ℹ️ Firebase\'de veri yok, localStorage değeri kullanılıyor:', localPoints);
                totalPoints = localPoints;
            }
        } catch (error) {
            console.warn('⚠️ Firebase load failed, using localStorage value:', error);
            // Hata durumunda localStorage'daki değeri kullan
            totalPoints = localPoints;
        }
    } else {
        // loadUserStats fonksiyonu yoksa localStorage'daki değeri kullan
        totalPoints = localPoints;
    }
    
    // Current level
    currentLevel = calculateLevel(totalPoints);
    
    // Streak data - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.streak_data) {
        streakData = firebaseUserStats.streak_data;
        console.log('✅ Streak data Firebase\'den yüklendi:', streakData);
    } else {
        streakData = loadFromStorage(CONFIG.STORAGE_KEYS.STREAK_DATA, streakData);
    }
    
    // Game stats - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.game_stats) {
        gameStats = firebaseUserStats.game_stats;
        console.log('✅ Game stats Firebase\'den yüklendi');
    } else {
        gameStats = loadFromStorage(CONFIG.STORAGE_KEYS.GAME_STATS, gameStats);
    }
    
    // Daily goal - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.daily_goal !== undefined) {
        dailyGoal = firebaseUserStats.daily_goal;
        console.log('✅ Daily goal Firebase\'den yüklendi:', dailyGoal);
    } else {
        dailyGoal = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_GOAL, 2700);
    }
    
    // Daily progress (check date)
    const today = getLocalDateString();
    let savedProgress = null;
    
    // Firebase'den gelen varsa onu kullan
    if (firebaseUserStats && firebaseUserStats.daily_progress !== undefined) {
        savedProgress = { date: today, points: firebaseUserStats.daily_progress };
        console.log('✅ Daily progress Firebase\'den yüklendi:', firebaseUserStats.daily_progress);
    } else {
        savedProgress = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: '', points: 0 });
    }
    
    if (savedProgress.date === today) {
        dailyProgress = savedProgress.points;
    } else {
        dailyProgress = 0;
        saveToStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: today, points: 0 });
    }
    
    // Word stats - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.word_stats) {
        wordStats = firebaseUserStats.word_stats;
        // localStorage'a da kaydet ki sayfa yenilendiğinde kaybolmasın
        saveToStorage('hasene_word_stats', wordStats);
        const wordStatsCount = Object.keys(wordStats).length;
        console.log('✅ Word stats Firebase\'den yüklendi:', wordStatsCount, 'kelime');
        if (wordStatsCount === 0) {
            console.warn('⚠️ Firebase\'den yüklenen word_stats boş!');
        }
    } else {
        wordStats = loadFromStorage('hasene_word_stats', {});
        const wordStatsCount = Object.keys(wordStats).length;
        if (wordStatsCount > 0) {
            console.log('ℹ️ Word stats localStorage\'dan yüklendi:', wordStatsCount, 'kelime');
        }
        // Only log warning if we have word stats in localStorage but not in Firebase (for debugging)
        if (firebaseUserStats && !firebaseUserStats.word_stats && wordStatsCount > 0) {
            console.log('ℹ️ Firebase\'de word_stats verisi yok, localStorage kullanılıyor');
        }
    }
    
    // Favorites - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.favorites) {
        favorites = Array.isArray(firebaseUserStats.favorites) ? firebaseUserStats.favorites : [];
        // localStorage'a da kaydet ki sayfa yenilendiğinde kaybolmasın
        saveToStorage('hasene_favorites', favorites);
        console.log('✅ Favorites Firebase\'den yüklendi:', favorites.length, 'favori');
    } else {
        favorites = loadFromStorage('hasene_favorites', []);
    }
    
    // Unlocked achievements - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.achievements) {
        unlockedAchievements = Array.isArray(firebaseUserStats.achievements) ? firebaseUserStats.achievements : [];
        // localStorage'a da kaydet ki sayfa yenilendiğinde kaybolmasın
        saveToStorage('hasene_achievements', unlockedAchievements);
        console.log('✅ Achievements Firebase\'den yüklendi:', unlockedAchievements.length, 'adet');
    } else {
        unlockedAchievements = loadFromStorage('hasene_achievements', []);
    }
    
    // Unlocked badges - Firebase'den gelen varsa onu kullan, yoksa localStorage'dan oku
    if (firebaseUserStats && firebaseUserStats.badges) {
        badgesUnlocked = firebaseUserStats.badges;
        // localStorage'a da kaydet ki sayfa yenilendiğinde kaybolmasın
        saveToStorage('hasene_badges', badgesUnlocked);
        console.log('✅ Badges Firebase\'den yüklendi:', Object.keys(badgesUnlocked).length, 'rozet');
    } else {
        badgesUnlocked = loadFromStorage('hasene_badges', {});
    }
    
    // Daily tasks
    await checkDailyTasks();
    
    // Load weekly XP from Firebase
    if (typeof window.loadWeeklyXPFromFirebase === 'function') {
        await window.loadWeeklyXPFromFirebase();
    }
    
    // Load daily stats from Firebase if available
    if (firebaseUserStats && firebaseUserStats.daily_stats) {
        // Daily stats are already loaded to localStorage by loadUserStats()
        console.log('✅ Daily stats Firebase\'den yüklendi:', Object.keys(firebaseUserStats.daily_stats).length, 'gün');
    } else {
        // If Firebase doesn't have daily_stats but localStorage does, sync to Firebase
        const localDailyStats = getAllDailyStats();
        if (localDailyStats && Object.keys(localDailyStats).length > 0) {
            console.log('🔄 Firebase\'de daily_stats yok ama localStorage\'da var, Firebase\'e kaydediliyor...');
            if (typeof window.saveUserStats === 'function') {
                window.saveUserStats({ 
                    daily_stats: localDailyStats
                }).catch(err => {
                    console.warn('⚠️ Daily stats Firebase sync failed:', err);
                });
            }
        }
    }
    
    // Eğer Firebase'de word_stats yoksa ama localStorage'da varsa, Firebase'e kaydet
    // Bu sayede mobildeki veriler masaüstünde Firebase'e kaydedilmiş olur
    if (!firebaseUserStats || !firebaseUserStats.word_stats) {
        const localWordStats = loadFromStorage('hasene_word_stats', {});
        if (localWordStats && Object.keys(localWordStats).length > 0) {
            console.log('🔄 Firebase\'de word_stats yok ama localStorage\'da var, Firebase\'e kaydediliyor...');
            // saveStats() fonksiyonu zaten wordStats'ı Firebase'e kaydedecek
            // Ama şimdi kaydetmek için saveStats() çağıralım
            if (typeof window.saveUserStats === 'function') {
                // Mevcut wordStats değişkenini kullan (yukarıda yüklenmiş olmalı)
                window.saveUserStats({ 
                    word_stats: wordStats || localWordStats
                }).catch(err => {
                    console.warn('⚠️ Word stats Firebase sync failed:', err);
                });
            }
        }
    }
    
    // DON'T check streak on page load - only when user actually plays
    // Streak will be updated when user completes a game and earns points
    // if (!skipStreakCheck) {
    //     checkStreak();
    // }
    
    // Update UI display after loading stats
    updateStatsDisplay();
    
    console.log('📊 Stats loaded:', { totalPoints, currentLevel, streakData });
}

/**
 * Save all stats
 */
function saveStats() {
    // Save to localStorage (always)
    saveToStorage(CONFIG.STORAGE_KEYS.TOTAL_POINTS, totalPoints);
    saveToStorage(CONFIG.STORAGE_KEYS.STREAK_DATA, streakData);
    saveToStorage(CONFIG.STORAGE_KEYS.GAME_STATS, gameStats);
    saveToStorage(CONFIG.STORAGE_KEYS.DAILY_GOAL, dailyGoal);
    saveToStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { 
        date: getLocalDateString(), 
        points: dailyProgress 
    });
    saveToStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
    saveToStorage('hasene_word_stats', wordStats);
    saveToStorage('hasene_favorites', favorites);
    saveToStorage('hasene_achievements', unlockedAchievements);
    saveToStorage('hasene_badges', badgesUnlocked);
    
    // Sync to Firebase backend (if user has real username)
    if (typeof window.saveUserStats === 'function') {
            // Get all daily stats before saving
            const allDailyStats = getAllDailyStats();
            
            window.saveUserStats({ 
                total_points: totalPoints,
                streak_data: streakData,
                game_stats: gameStats,
                daily_goal: dailyGoal,
                daily_progress: dailyProgress,
                badges: badgesUnlocked,
                achievements: unlockedAchievements,
                word_stats: wordStats,
                favorites: favorites,
                daily_stats: allDailyStats
            }).catch(err => {
            // Silent fail - Firebase sync is optional
            console.warn('User stats Firebase sync failed (non-critical):', err);
        });
    }
    
    // Sync daily tasks to Firebase
    if (typeof window.saveDailyTasks === 'function') {
        window.saveDailyTasks(dailyTasks).catch(err => {
            // Silent fail - Firebase sync is optional
            console.warn('Daily tasks Firebase sync failed (non-critical):', err);
        });
    }
}

// Debounced save
const debouncedSaveStats = debounce(saveStats, 500);

/**
 * Save daily statistics for charts
 * @param {number} correct - Correct answers count
 * @param {number} wrong - Wrong answers count
 * @param {number} points - Points earned
 * @param {number} combo - Max combo
 */
function saveDailyStats(correct, wrong, points, combo) {
    const today = getLocalDateString();
    const key = `hasene_daily_${today}`;
    
    try {
        // Get existing daily stats or create new
        const existing = localStorage.getItem(key);
        let dailyData = existing ? JSON.parse(existing) : {
            date: today,
            points: 0,
            correct: 0,
            wrong: 0,
            combo: 0,
            gamesPlayed: 0,
            perfectLessons: 0
        };
        
        // Update with new stats
        dailyData.points += points;
        dailyData.correct += correct;
        dailyData.wrong += wrong;
        dailyData.combo = Math.max(dailyData.combo || 0, combo);
        dailyData.gamesPlayed = (dailyData.gamesPlayed || 0) + 1;
        
        // Check if perfect lesson (no wrong answers)
        if (wrong === 0 && correct > 0) {
            dailyData.perfectLessons = (dailyData.perfectLessons || 0) + 1;
        }
        
        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(dailyData));
        
        // Save to Firebase
        if (typeof window.saveUserStats === 'function') {
            // Get all daily stats and save to Firebase
            const allDailyStats = getAllDailyStats();
            window.saveUserStats({ 
                daily_stats: allDailyStats
            }).catch(err => {
                console.warn('⚠️ Daily stats Firebase sync failed:', err);
            });
        }
    } catch (e) {
        console.warn('⚠️ Daily stats save failed:', e);
    }
}

/**
 * Get all daily stats from localStorage
 * @returns {Object} Object with date keys and daily stats values
 */
function getAllDailyStats() {
    const allDailyStats = {};
    const today = new Date();
    
    // Get last 90 days of daily stats
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const key = `hasene_daily_${dateStr}`;
        
        try {
            const dayData = localStorage.getItem(key);
            if (dayData) {
                const parsed = JSON.parse(dayData);
                allDailyStats[dateStr] = parsed;
            }
        } catch (e) {
            // Ignore invalid data
        }
    }
    
    return allDailyStats;
}

/**
 * Reset all game data (TEST function)
 */
async function resetAllData() {
    if (!confirm('Tüm oyun verilerini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }
    
    // Stop all audio
    stopAllAudio();
    
    // ÖNEMLİ: Kullanıcı bilgilerini sakla (giriş/çıkış durumunu koru)
    const savedUsername = localStorage.getItem('hasene_username');
    const savedUserId = localStorage.getItem('hasene_user_id');
    const savedUserEmail = localStorage.getItem('hasene_user_email');
    const savedUserGender = localStorage.getItem('hasene_user_gender');
    const savedFirebaseUserId = localStorage.getItem('hasene_firebase_user_id');
    const savedUserType = localStorage.getItem('hasene_user_type');
    
    // Clear all localStorage keys
    const storageKeys = [
        CONFIG.STORAGE_KEYS.TOTAL_POINTS,
        CONFIG.STORAGE_KEYS.STREAK_DATA,
        CONFIG.STORAGE_KEYS.DAILY_TASKS,
        CONFIG.STORAGE_KEYS.GAME_STATS,
        CONFIG.STORAGE_KEYS.DAILY_GOAL,
        CONFIG.STORAGE_KEYS.DAILY_PROGRESS,
        CONFIG.STORAGE_KEYS.DIFFICULTY,
        'hasene_word_stats',
        'hasene_favorites',
        'hasene_achievements',
        'hasene_badges',
        'hasene_onboarding_complete'
        // hasene_username ve hasene_user_id silinmeyecek - kullanıcı giriş durumu korunacak
    ];
    
    // Clear all weekly XP data from localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hasene_weekly_xp_')) {
            localStorage.removeItem(key);
        }
    });
    
    // Clear all daily stats (for charts)
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hasene_daily_') && key.match(/hasene_daily_\d{4}-\d{2}-\d{2}$/)) {
            localStorage.removeItem(key);
        }
    });
    
    // Clear notification settings
    localStorage.removeItem('hasene_notification_settings');
    
    // Clear all hasene_* keys from localStorage (comprehensive cleanup)
    // Ama kullanıcı bilgilerini koru
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hasene_') && 
            key !== 'hasene_username' && 
            key !== 'hasene_user_id' && 
            key !== 'hasene_user_email' && 
            key !== 'hasene_user_gender' &&
            key !== 'hasene_firebase_user_id' &&
            key !== 'hasene_user_type') {
            localStorage.removeItem(key);
        }
    });
    
    // Also clear the specific keys (in case some were missed)
    storageKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Kullanıcı bilgilerini geri yükle (giriş durumunu koru)
    if (savedUsername) localStorage.setItem('hasene_username', savedUsername);
    if (savedUserId) localStorage.setItem('hasene_user_id', savedUserId);
    if (savedUserEmail) localStorage.setItem('hasene_user_email', savedUserEmail);
    if (savedUserGender) localStorage.setItem('hasene_user_gender', savedUserGender);
    if (savedFirebaseUserId) localStorage.setItem('hasene_firebase_user_id', savedFirebaseUserId);
    if (savedUserType) localStorage.setItem('hasene_user_type', savedUserType);
    
    // Clear IndexedDB if available (placeholder implementation)
    if (typeof window.saveToIndexedDB === 'function') {
        // IndexedDB is currently placeholder, but clear it anyway
        try {
            // Clear all known IndexedDB keys
            const indexedDBKeys = ['hasene_totalPoints', 'hasene_streakData', 'hasene_gameStats'];
            indexedDBKeys.forEach(async (key) => {
                try {
                    await window.saveToIndexedDB(key, null).catch(() => {});
                } catch (e) {
                    // IndexedDB not implemented yet, ignore
                }
            });
        } catch (error) {
            // IndexedDB not available, ignore
        }
    }
    
    // Reset global state variables
    totalPoints = 0;
    sessionScore = 0;
    currentLevel = 1;
    currentGameMode = null;
    questionIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    comboCount = 0;
    maxCombo = 0;
    currentQuestions = [];
    currentQuestion = null;
    currentOptions = [];
    currentAyetIndex = 0;
    currentDuaIndex = 0;
    currentHadisIndex = 0;
    wordStats = {};
    favorites = [];
    unlockedAchievements = [];
    badgesUnlocked = {};
    dailyGoal = 2700;
    dailyProgress = 0;
    
    streakData = {
        currentStreak: 0,
        bestStreak: 0,
        totalPlayDays: 0,
        lastPlayDate: '',
        playDates: []
    };
    
    gameStats = {
        totalCorrect: 0,
        totalWrong: 0,
        perfectLessons: 0,
        gameModeCounts: {}
    };
    
    dailyTasks = {
        lastTaskDate: '',
        tasks: [],
        bonusTasks: [],
        todayStats: {
            toplamDogru: 0,
            toplamPuan: 0,
            comboCount: 0,
            allGameModes: [],
            ayet_oku: 0,
            dua_et: 0,
            hadis_oku: 0
        }
    };
    
    // Save the reset values to localStorage
    saveStats();
    
    // Delete Firebase data if user is logged in
    // Kullanıcı bilgilerini saklanan değerlerden al (localStorage'dan değil, çünkü silinmiş olabilir)
    const user = savedUserId ? {
        id: savedUserId,
        username: savedUsername,
        type: savedUserType || 'local'
    } : null;
    const username = savedUsername;
    
    if (user && user.id && typeof window.firestoreDelete === 'function') {
        // Delete user stats from Firebase
        // Use usernameToDocId if available, otherwise create safe docId manually
        let docId;
        if (typeof window.usernameToDocId === 'function') {
            docId = window.usernameToDocId(username || 'user_unknown');
        } else {
            // Fallback: manual conversion
            docId = (username || 'user_unknown').trim()
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_+|_+$/g, '') || 'user_unknown';
        }
        
        // Get current week start for leaderboard deletion
        let weekStart = '';
        if (typeof window.getWeekStartString === 'function') {
            weekStart = window.getWeekStartString();
        } else {
            // Fallback: calculate week start manually
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
            const monday = new Date(now.getFullYear(), now.getMonth(), diff);
            weekStart = monday.toISOString().split('T')[0];
        }
        
        console.log('🔄 Firebase silme işlemi başlatılıyor:', { userId: user.id, username, docId, weekStart });
        
        // Delete from Firebase (non-blocking)
        const deletePromises = [
            window.firestoreDelete('user_stats', docId).catch((e) => {
                console.warn('⚠️ user_stats silme hatası:', e);
                return false;
            }),
            window.firestoreDelete('daily_tasks', docId).catch((e) => {
                console.warn('⚠️ daily_tasks silme hatası:', e);
                return false;
            })
        ];
        
        // Delete weekly leaderboard data for current week and previous weeks
        // ÖNEMLİ: weekly_leaderboard docId formatı: username_weekStart (user.id değil!)
        if (weekStart && weekStart.length > 0 && username) {
            // Delete current week
            const leaderboardDocId = `${username}_${weekStart}`;
            console.log('🔄 Mevcut hafta lig verisi siliniyor:', leaderboardDocId);
            deletePromises.push(
                window.firestoreDelete('weekly_leaderboard', leaderboardDocId).catch((e) => {
                    console.warn('⚠️ weekly_leaderboard (mevcut hafta) silme hatası:', e, { docId: leaderboardDocId });
                    return false;
                })
            );
            
            // Delete ALL weekly leaderboard entries for this user using query
            // First, ensure Firebase auth (try anonymous auth for local users)
            let firebaseAuthUID = null;
            if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                firebaseAuthUID = window.firebaseAuth.currentUser.uid;
            } else if (user.id.startsWith('local-') && typeof window.autoSignInAnonymous === 'function') {
                try {
                    await window.autoSignInAnonymous();
                    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                        firebaseAuthUID = window.firebaseAuth.currentUser.uid;
                        console.log('✅ Anonymous Firebase auth for resetAllData, UID:', firebaseAuthUID);
                    }
                } catch (error) {
                    console.warn('⚠️ Firebase anonymous auth failed in resetAllData:', error);
                }
            }
            
            if (window.firestore && firebaseAuthUID) {
                try {
                    console.log('🔄 Tüm weekly_leaderboard dokümanları sorgulanıyor...');
                    
                    // Query all weekly_leaderboard documents for this username
                    const querySnapshot = await window.firestore
                        .collection('weekly_leaderboard')
                        .where('username', '==', username.toLowerCase())
                        .get();
                    
                    console.log(`📊 ${querySnapshot.size} weekly_leaderboard dokümanı bulundu`);
                    
                    // Delete all found documents
                    querySnapshot.forEach((doc) => {
                        const docData = doc.data();
                        // Only delete if user_id matches (security check)
                        if (docData.user_id === firebaseAuthUID) {
                            deletePromises.push(
                                doc.ref.delete().then(() => {
                                    console.log('✅ Weekly leaderboard dokümanı silindi:', doc.id);
                                    return true;
                                }).catch((error) => {
                                    console.warn('⚠️ Weekly leaderboard silme hatası:', error, { docId: doc.id });
                                    return false;
                                })
                            );
                        } else {
                            console.warn('⚠️ Doküman farklı kullanıcıya ait, atlanıyor:', { docId: doc.id });
                        }
                    });
                } catch (error) {
                    console.warn('⚠️ Weekly leaderboard query hatası:', error);
                    // Fallback: Try to delete last 52 weeks manually
                    console.log('🔄 Fallback: Son 52 hafta manuel olarak siliniyor...');
                    for (let i = 1; i <= 52; i++) {
                        try {
                            const prevWeekDate = new Date(weekStart + 'T00:00:00');
                            prevWeekDate.setDate(prevWeekDate.getDate() - (i * 7));
                            const prevWeekStart = prevWeekDate.toISOString().split('T')[0];
                            const prevLeaderboardDocId = `${username}_${prevWeekStart}`;
                            deletePromises.push(
                                window.firestoreDelete('weekly_leaderboard', prevLeaderboardDocId).catch((e) => {
                                    return false;
                                })
                            );
                        } catch (e) {
                            // Ignore
                        }
                    }
                }
            } else {
                // Fallback: Delete last 52 weeks manually if query not available
                console.log('🔄 Query yapılamıyor, son 52 hafta manuel olarak siliniyor...');
                for (let i = 1; i <= 52; i++) {
                    try {
                        const prevWeekDate = new Date(weekStart + 'T00:00:00');
                        prevWeekDate.setDate(prevWeekDate.getDate() - (i * 7));
                        const prevWeekStart = prevWeekDate.toISOString().split('T')[0];
                        const prevLeaderboardDocId = `${username}_${prevWeekStart}`;
                        deletePromises.push(
                            window.firestoreDelete('weekly_leaderboard', prevLeaderboardDocId).catch((e) => {
                                return false;
                            })
                        );
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        } else {
            // If weekStart is invalid, try to delete all weekly_leaderboard entries for this user
            // by querying Firebase (if available)
            console.warn('⚠️ weekStart hesaplanamadı, haftalık lig verileri manuel silinmeli');
        }
        
        Promise.all(deletePromises).then(async (results) => {
            const successCount = results.filter(r => r === true).length;
            const totalCount = deletePromises.length;
            const weeklyLeaderboardCount = results.slice(2).filter(r => r === true).length; // İlk 2: user_stats ve daily_tasks
            const userStatsSuccess = results[0] === true;
            const dailyTasksSuccess = results[1] === true;
            
            console.log(`✅ Firebase verileri silindi: ${successCount}/${totalCount} başarılı (user_stats, daily_tasks, weekly_leaderboard dahil)`);
            console.log('📊 Silme sonuçları:', results);
            
            // Firebase'e boş veriler kaydet (temiz durum için)
            if (typeof window.saveUserStats === 'function' && username) {
                try {
                    await window.saveUserStats({
                        total_points: 0,
                        streak_data: {
                            currentStreak: 0,
                            bestStreak: 0,
                            totalPlayDays: 0,
                            lastPlayDate: '',
                            playDates: []
                        },
                        game_stats: {
                            totalCorrect: 0,
                            totalWrong: 0,
                            perfectLessons: 0,
                            gameModeCounts: {}
                        },
                        badges: {},
                        achievements: [],
                        word_stats: {},
                        favorites: [],
                        daily_stats: {},
                        daily_goal: 2700,
                        daily_progress: 0
                    });
                    console.log('✅ Firebase\'e boş veriler kaydedildi');
                } catch (err) {
                    console.warn('⚠️ Firebase boş veri kaydetme hatası:', err);
                }
            }
            
            // Firebase'e boş daily_tasks kaydet
            if (typeof window.saveDailyTasks === 'function' && username) {
                try {
                    await window.saveDailyTasks({
                        lastTaskDate: '',
                        tasks: [],
                        bonusTasks: [],
                        todayStats: {
                            toplamDogru: 0,
                            toplamPuan: 0,
                            comboCount: 0,
                            allGameModes: [],
                            ayet_oku: 0,
                            dua_et: 0,
                            hadis_oku: 0
                        }
                    });
                    console.log('✅ Firebase\'e boş daily_tasks kaydedildi');
                } catch (err) {
                    console.warn('⚠️ Firebase daily_tasks kaydetme hatası:', err);
                }
            }
            
            // Başarısız işlemleri belirle
            const failedItems = [];
            if (!userStatsSuccess) failedItems.push('user_stats');
            if (!dailyTasksSuccess) failedItems.push('daily_tasks');
            const failedWeeklyCount = results.slice(2).filter(r => r === false).length;
            if (failedWeeklyCount > 0) {
                failedItems.push(`${failedWeeklyCount} lig verisi`);
            }
            
            // Leaderboard modal açıksa yeniden yükle
            const leaderboardModal = document.getElementById('leaderboard-modal');
            if (leaderboardModal && !leaderboardModal.classList.contains('hidden')) {
                if (typeof window.showLeaderboardModal === 'function') {
                    setTimeout(() => {
                        window.showLeaderboardModal();
                    }, 500);
                }
            }
            
            if (typeof window.showToast === 'function') {
                if (successCount === totalCount) {
                    window.showToast(`✅ Tüm veriler sıfırlandı! (${successCount}/${totalCount} başarılı, ${weeklyLeaderboardCount} lig verisi silindi)`, 'success', 4000);
                } else if (weeklyLeaderboardCount > 0) {
                    // Lig verileri silinmiş ama bazı işlemler başarısız
                    const failedText = failedItems.length > 0 ? ` (Başarısız: ${failedItems.join(', ')})` : '';
                    window.showToast(`✅ Lig verileri sıfırlandı! (${successCount}/${totalCount} başarılı, ${weeklyLeaderboardCount} lig verisi silindi${failedText})`, 'success', 5000);
                } else if (successCount > 0) {
                    window.showToast(`⚠️ Veriler kısmen sıfırlandı! (${successCount}/${totalCount} başarılı${failedItems.length > 0 ? ', Başarısız: ' + failedItems.join(', ') : ''})`, 'info', 5000);
                } else {
                    window.showToast('⚠️ Frontend temizlendi, ancak Firebase verileri silinemedi. Kullanıcı giriş yapmamış olabilir.', 'warning', 5000);
                }
            }
        }).catch((error) => {
            console.error('❌ Firebase verileri silinirken hata:', error);
            console.log('ℹ️ Firebase verileri silinemedi (beklenen - kullanıcı giriş yapmamış olabilir):', error);
            if (typeof window.showToast === 'function') {
                window.showToast('⚠️ Frontend temizlendi, ancak Firebase verileri silinemedi.', 'warning', 4000);
            }
        });
    } else {
        // Even if not logged in, show success message
        if (typeof window.showToast === 'function') {
            window.showToast('Tüm veriler sıfırlandı! Frontend temizlendi.', 'success', 3000);
        }
    }
    
    // Close all modals (including word analysis modal if open)
    closeAllModals();
    
    // Clear any cached word analysis data
    if (typeof window.getStrugglingWords === 'function') {
        // Force refresh by clearing any cached results
        const analysisContent = document.getElementById('analysis-content');
        if (analysisContent) {
            analysisContent.innerHTML = '';
        }
    }
    
    goToMainMenu();
    
    // Reload stats (skip streak check to preserve reset values) and update display
    loadStats(true).then(() => {
        updateStatsDisplay();
        
        // Kullanıcı durumunu güncelle (giriş/çıkış durumu)
        if (typeof window.updateUserStatusUI === 'function') {
            window.updateUserStatusUI();
        }
        
        showToast('Tüm veriler sıfırlandı! Kelime analizi verileri de temizlendi.', 'success', 3000);
    });
}

/**
 * Browser geri tuşu için handler
 */
function setupBackButtonHandler() {
    // History state ekle
    window.history.pushState({ page: 'main' }, '');
    
    // Popstate (geri tuşu) dinleyicisi
    window.addEventListener('popstate', (event) => {
        // Sesi durdur
        stopAllAudio();
        
        // Modal açıksa kapat
        if (currentOpenModal) {
            closeModal(currentOpenModal);
            // State'i geri ekle (çıkmasın)
            window.history.pushState({ page: 'main' }, '');
            return;
        }
        
        // Panel açıksa ana menüye dön
        if (currentOpenPanel || currentGameMode) {
            goToMainMenu(false); // false = uyarı göster
            // State'i geri ekle
            window.history.pushState({ page: 'main' }, '');
            return;
        }
        
        // Ana sayfadaysa state'i geri ekle
        window.history.pushState({ page: 'main' }, '');
    });
}

/**
 * Register service worker
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.warn('⚠️ Service Worker registration failed:', err));
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
        });
    });
    
    // Game cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameMode = card.dataset.game;
            startGame(gameMode);
        });
    });
    
    // Goal settings button
    document.getElementById('goal-settings-btn')?.addEventListener('click', showGoalSettings);
    
    // Goal options
    document.querySelectorAll('.goal-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.goal-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            dailyGoal = parseInt(btn.dataset.goal);
            saveStats();
            updateDailyGoalDisplay();
            closeModal('goal-settings-modal');
        });
    });
    
    // Kelime submode buttons
    document.querySelectorAll('[data-submode]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentKelimeSubmode = btn.dataset.submode;
            startKelimeCevirGame(currentKelimeSubmode);
        });
    });
    
    // Elif Ba submode buttons
    document.querySelectorAll('[data-elif-submode]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentElifBaSubmode = btn.dataset.elifSubmode;
            if (currentElifBaSubmode === 'tablo') {
                showHarfTablosu();
            } else {
                startElifBaGame(currentElifBaSubmode);
            }
        });
    });
    
    // Badge tabs
    document.querySelectorAll('.badge-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.badge-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            if (tab === 'badges') {
                document.getElementById('badges-grid').classList.remove('hidden');
                document.getElementById('achievements-list').classList.add('hidden');
            } else {
                document.getElementById('badges-grid').classList.add('hidden');
                document.getElementById('achievements-list').classList.remove('hidden');
                // Başarımları yükle
                renderAchievementsList();
            }
        });
    });
    
    // Favorite button
    document.getElementById('kelime-favorite-btn')?.addEventListener('click', toggleCurrentWordFavorite);
    
    // Audio buttons
    setupAudioButtons();
    
    // Navigation buttons
    setupNavigationButtons();
    
    // Bottom nav
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.page === 'main-menu') {
                goToMainMenu();
            }
        });
    });
}

/**
 * Setup audio buttons
 */
function setupAudioButtons() {
    document.getElementById('kelime-audio-btn')?.addEventListener('click', playCurrentWordAudio);
    document.getElementById('dinle-audio-btn')?.addEventListener('click', playCurrentWordAudio);
    document.getElementById('elif-audio-btn')?.addEventListener('click', playCurrentLetterAudio);
    document.getElementById('ayet-audio-btn')?.addEventListener('click', playCurrentAyetAudio);
    document.getElementById('dua-audio-btn')?.addEventListener('click', playCurrentDuaAudio);
    document.getElementById('bosluk-audio-btn')?.addEventListener('click', playCurrentBoslukAudio);
}

/**
 * Setup navigation buttons for reading modes
 */
function setupNavigationButtons() {
    // Ayet navigation
    document.getElementById('ayet-prev-btn')?.addEventListener('click', () => navigateAyet(-1));
    document.getElementById('ayet-next-btn')?.addEventListener('click', () => navigateAyet(1));
    
    // Dua navigation
    document.getElementById('dua-prev-btn')?.addEventListener('click', () => navigateDua(-1));
    document.getElementById('dua-next-btn')?.addEventListener('click', () => navigateDua(1));
    
    // Hadis navigation
    document.getElementById('hadis-prev-btn')?.addEventListener('click', () => navigateHadis(-1));
    document.getElementById('hadis-next-btn')?.addEventListener('click', () => navigateHadis(1));
}

// ========================================
// GAME FLOW
// ========================================

/**
 * Start a game mode
 */
async function startGame(gameMode) {
    console.log(`🎮 Starting game: ${gameMode}`);
    currentGameMode = gameMode;
    gameCompleted = false; // Reset game completed flag
    
    // Hide main container
    document.getElementById('main-container').classList.add('hidden');
    
    // For kelime-cevir and elif-ba, show submode selection first
    if (gameMode === 'kelime-cevir') {
        document.getElementById('kelime-submode-screen').classList.remove('hidden');
        return;
    }
    
    if (gameMode === 'elif-ba') {
        document.getElementById('elif-ba-submode-screen').classList.remove('hidden');
        return;
    }
    
    // Reset session
    sessionScore = 0;
    questionIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    comboCount = 0;
    maxCombo = 0;
    
    // Start appropriate game
    switch (gameMode) {
        case 'dinle-bul':
            await startDinleBulGame();
            break;
        case 'bosluk-doldur':
            await startBoslukDoldurGame();
            break;
        case 'ayet-oku':
            await startAyetOkuMode();
            break;
        case 'dua-et':
            await startDuaEtMode();
            break;
        case 'hadis-oku':
            await startHadisOkuMode();
            break;
        case 'karma':
            await startKarmaGame();
            break;
        default:
            showToast('Bilinmeyen oyun modu', 'error');
            goToMainMenu();
    }
}

/**
 * Go to Kelime Çevir submodes
 */
function goToKelimeSubmodes() {
    // Eğer oyun ekranındaysa (oyun başlamışsa) uyarı göster
    if (questionIndex > 0 && (correctCount > 0 || wrongCount > 0 || sessionScore > 0)) {
        const confirmed = confirm(
            '⚠️ Oyun devam ediyor!\n\n' +
            `Şu ana kadar: ${correctCount + wrongCount} soru cevapladınız, ${sessionScore} Hasene kazandınız.\n\n` +
            'Çıkmak istediğinizden emin misiniz? İlerlemeniz kaydedilmeyecek!'
        );
        
        if (!confirmed) {
            return; // Kullanıcı iptal etti
        }
    }
    
    document.getElementById('kelime-cevir-screen').classList.add('hidden');
    document.getElementById('kelime-submode-screen').classList.remove('hidden');
}

/**
 * Go to Elif Ba submodes
 */
function goToElifBaSubmodes() {
    // Eğer oyun ekranındaysa uyarı göster
    if (questionIndex > 0 && (correctCount > 0 || wrongCount > 0 || sessionScore > 0)) {
        const confirmed = confirm(
            '⚠️ Oyun devam ediyor!\n\n' +
            `Şu ana kadar: ${correctCount + wrongCount} soru cevapladınız, ${sessionScore} Hasene kazandınız.\n\n` +
            'Çıkmak istediğinizden emin misiniz? İlerlemeniz kaydedilmeyecek!'
        );
        
        if (!confirmed) {
            return; // Kullanıcı iptal etti
        }
    }
    
    document.getElementById('elif-ba-screen').classList.add('hidden');
    document.getElementById('elif-ba-tablo-screen').classList.add('hidden');
    document.getElementById('elif-ba-submode-screen').classList.remove('hidden');
}

// ========================================
// ACHIEVEMENT SYSTEM
// ========================================

/**
 * Check if any new achievements are earned
 * @param {Object} stats - Current game stats
 * @returns {Array} Array of newly earned achievements
 */
function checkAchievements(stats) {
    const achievements = window.ACHIEVEMENTS || [];
    const newlyUnlocked = [];
    
    // Extend stats with additional data
    const extendedStats = {
        ...stats,
        totalCorrect: gameStats.totalCorrect || 0,
        perfectLessons: gameStats.perfectLessons || 0
    };
    
    achievements.forEach(ach => {
        // Skip if already unlocked
        if (unlockedAchievements.includes(ach.id)) return;
        
        let isEarned = false;
        
        // Use the check function if available
        if (ach.check && typeof ach.check === 'function') {
            try {
                isEarned = ach.check(extendedStats);
            } catch (e) {
                console.error('Achievement check error:', ach.id, e);
            }
        }
        
        if (isEarned) {
            newlyUnlocked.push(ach);
        }
    });
    
    return newlyUnlocked;
}

/**
 * Save achievement as unlocked
 * @param {string} achievementId - Achievement ID
 */
function saveAchievement(achievementId) {
    if (!unlockedAchievements.includes(achievementId)) {
        unlockedAchievements.push(achievementId);
        saveToStorage('hasene_achievements', unlockedAchievements);
        
        // Award achievement points
        const ach = (window.ACHIEVEMENTS || []).find(a => a.id === achievementId);
        if (ach && ach.points) {
            totalPoints += ach.points;
        }
    }
}

/**
 * Check and unlock badges based on total points
 */
function checkBadges() {
    const badges = window.BADGE_DEFINITIONS || [];
    const asrBadges = window.ASR_I_SAADET_BADGES || {};
    const today = getLocalDateString();
    
    // Normal rozetleri kontrol et
    badges.forEach(badge => {
        // Skip if already unlocked
        if (badgesUnlocked[badge.id]) return;
        
        // Check if threshold is met
        if (badge.threshold && totalPoints >= badge.threshold) {
            badgesUnlocked[badge.id] = today;
            showToast(`🏅 "${badge.name}" rozeti kazandınız!`, 'success', 3000);
        }
    });
    
    // Asr-ı Saadet rozetlerini kontrol et
    Object.values(asrBadges).forEach(periodBadges => {
        periodBadges.forEach(badge => {
            if (badgesUnlocked[badge.id]) return;
            
            if (badge.threshold && totalPoints >= badge.threshold) {
                badgesUnlocked[badge.id] = today;
                showToast(`🕌 Asr-ı Saadet: "${badge.name}" rozeti kazandınız!`, 'success', 4000);
            }
        });
    });
    
    debouncedSaveStats();
}

/**
 * Hide all game screens
 */
function hideAllScreens() {
    // Sesleri durdur
    stopAllAudio();
    
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById('main-container')?.classList.add('hidden');
    
    currentOpenPanel = null;
}

/**
 * Handle back button click during game
 * Shows warning if game is in progress, otherwise goes back normally
 */
function handleGameBackButton() {
    // Check if we're in a submode selection screen (no warning needed)
    const kelimeSubmodeScreen = document.getElementById('kelime-submode-screen');
    const elifBaSubmodeScreen = document.getElementById('elif-ba-submode-screen');
    
    if (kelimeSubmodeScreen && !kelimeSubmodeScreen.classList.contains('hidden')) {
        // Alt mod seçim ekranından çıkış - direkt ana menüye, uyarı yok
        goToMainMenu(true); // skipWarning = true
        return;
    }
    
    if (elifBaSubmodeScreen && !elifBaSubmodeScreen.classList.contains('hidden')) {
        // Alt mod seçim ekranından çıkış - direkt ana menüye, uyarı yok
        goToMainMenu(true); // skipWarning = true
        return;
    }
    
    // Oyun ekranından çıkış - uyarı göster
    goToMainMenu(false);
}

/**
 * Go back to main menu
 */
function goToMainMenu(skipWarning = false) {
    // Oyun tamamlandıysa (endGame çağrıldıysa) uyarı gösterme
    if (gameCompleted) {
        skipWarning = true;
        gameCompleted = false; // Reset flag
    }
    
    // Oyun devam ediyorsa uyarı göster (alt mod seçim ekranları hariç)
    if (!skipWarning && currentGameMode) {
        let hasProgress = false;
        let warningMessage = '';
        
        // Oyun modları için kontrol (soru-cevap oyunları)
        if (['kelime-cevir', 'dinle-bul', 'bosluk-doldur', 'elif-ba'].includes(currentGameMode)) {
            if (questionIndex > 0) {
                const answeredQuestions = correctCount + wrongCount;
                hasProgress = sessionScore > 0 || answeredQuestions > 0;
                
                if (hasProgress) {
                    warningMessage = `Şu ana kadar: ${answeredQuestions} soru cevapladınız, ${sessionScore} Hasene kazandınız.\n\n`;
                }
            }
        }
        
        // Karma oyun için özel kontrol (karmaQuestionIndex kullanıyor)
        if (currentGameMode === 'karma') {
            if (karmaQuestionIndex > 0) {
                const answeredQuestions = correctCount + wrongCount;
                hasProgress = sessionScore > 0 || answeredQuestions > 0;
                
                if (hasProgress) {
                    warningMessage = `Şu ana kadar: ${answeredQuestions} soru cevapladınız, ${sessionScore} Hasene kazandınız.\n\n`;
                }
            }
        }
        
        // Okuma modları için kontrol (Ayet Oku, Dua Et, Hadis Oku)
        if (currentGameMode === 'ayet-oku' && currentAyetIndex > 0) {
            hasProgress = true;
            warningMessage = `Şu ana kadar ${currentAyetIndex} ayet okudunuz.\n\n`;
        }
        
        if (currentGameMode === 'dua-et' && currentDuaIndex > 0) {
            hasProgress = true;
            warningMessage = `Şu ana kadar ${currentDuaIndex} dua okudunuz.\n\n`;
        }
        
        if (currentGameMode === 'hadis-oku' && currentHadisIndex > 0) {
            hasProgress = true;
            warningMessage = `Şu ana kadar ${currentHadisIndex} hadis okudunuz.\n\n`;
        }
        
        // Eğer ilerleme varsa uyarı göster
        if (hasProgress) {
            const confirmed = confirm(
                '⚠️ Oyun devam ediyor!\n\n' +
                warningMessage +
                'Çıkmak istediğinizden emin misiniz? İlerlemeniz kaydedilmeyecek!'
            );
            
            if (!confirmed) {
                return; // Kullanıcı iptal etti, çıkış yapma
            }
        }
    }
    
    // Sesi durdur
    stopAllAudio();
    
    // Modalları kapat
    closeAllModals();
    
    // Hide all game screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Show main container
    document.getElementById('main-container').classList.remove('hidden');
    
    // Update displays
    updateStatsDisplay();
    
    // Reset session state (oyun bitmediği için kaydedilmemiş)
    currentGameMode = null;
    currentOpenPanel = null;
    // Not: sessionScore, correctCount, wrongCount sıfırlanmıyor - 
    // Ama endGame() çağrılmadığı için zaten totalPoints'a eklenmemiş
}

/**
 * End game and show results
 */
function endGame() {
    // Mark game as completed (puanlar kaydedildi, uyarı gösterme)
    gameCompleted = true;
    
    // Calculate perfect bonus
    let perfectBonus = 0;
    if (wrongCount === 0 && correctCount >= 3) {
        perfectBonus = CONFIG.PERFECT_BONUS;
        sessionScore += perfectBonus;
        gameStats.perfectLessons = (gameStats.perfectLessons || 0) + 1;
    }
    
    // Add to total points
    totalPoints += sessionScore;
    dailyProgress += sessionScore;
    
    // Update streak (only when user actually plays and earns points)
    if (sessionScore > 0) {
        updateStreakOnPlay();
    }
    
    // Update game stats
    gameStats.totalCorrect = (gameStats.totalCorrect || 0) + correctCount;
    gameStats.totalWrong = (gameStats.totalWrong || 0) + wrongCount;
    gameStats.gameModeCounts = gameStats.gameModeCounts || {};
    gameStats.gameModeCounts[currentGameMode] = (gameStats.gameModeCounts[currentGameMode] || 0) + 1;
    
    // Update task progress
    updateTaskProgress('correct', correctCount);
    updateTaskProgress('hasene', sessionScore);
    updateTaskProgress('game_modes', currentGameMode);
    
    // Check level up
    const newLevel = calculateLevel(totalPoints);
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        showLevelUpModal(newLevel);
    }
    
    // Check achievements
    const stars = calculateStars(totalPoints);
    const stats = { 
        stars, 
        bestStreak: streakData.bestStreak,
        perfectLessons: gameStats.perfectLessons 
    };
    const newAchievements = checkAchievements(stats);
    
    if (newAchievements.length > 0) {
        newAchievements.forEach(ach => saveAchievement(ach.id));
        setTimeout(() => showAchievementModal(newAchievements[0]), 1500);
    }
    
    // Check badges based on total points
    checkBadges();
    
    // Check daily goal
    checkDailyGoal();
    
    // Update weekly XP for leaderboard
    if (typeof window.updateWeeklyXP === 'function' && sessionScore > 0) {
        window.updateWeeklyXP(sessionScore).catch(err => {
            console.warn('Weekly XP update failed (non-critical):', err);
        });
    }
    
    // Save daily statistics for charts
    saveDailyStats(correctCount, wrongCount, sessionScore, maxCombo);
    
    // Save stats
    debouncedSaveStats();
    
    // Show result modal
    showResultModal(perfectBonus);
}

/**
 * Show game result modal
 */
function showResultModal(perfectBonus = 0) {
    document.getElementById('result-correct').textContent = correctCount;
    document.getElementById('result-wrong').textContent = wrongCount;
    document.getElementById('result-points').textContent = formatNumber(sessionScore);
    
    const perfectContainer = document.getElementById('result-perfect-container');
    if (perfectBonus > 0) {
        perfectContainer.style.display = 'block';
        document.getElementById('result-perfect').textContent = `+${perfectBonus}`;
    } else {
        perfectContainer.style.display = 'none';
    }
    
    // Set title based on performance
    const title = document.getElementById('result-title');
    if (wrongCount === 0) {
        title.textContent = '🎉 Mükemmel!';
    } else if (correctCount > wrongCount) {
        title.textContent = '👏 Tebrikler!';
    } else {
        title.textContent = '💪 İyi Deneme!';
    }
    
    openModal('game-result-modal');
}

/**
 * Play again
 */
function playAgain() {
    closeModal('game-result-modal');
    
    // If it's elif-ba game mode with a submode, restart the specific submode directly
    if (currentGameMode === 'elif-ba' && currentElifBaSubmode) {
        startElifBaGame(currentElifBaSubmode);
    } 
    // If it's kelime-cevir game mode with a submode, restart the specific submode directly
    else if (currentGameMode === 'kelime-cevir' && currentKelimeSubmode) {
        startKelimeCevirGame(currentKelimeSubmode);
    } 
    // For other games, use standard startGame
    else {
        startGame(currentGameMode);
    }
}

/**
 * Close result and go home
 */
function closeResultAndGoHome() {
    closeModal('game-result-modal');
    goToMainMenu();
}

// ========================================
// KELIME ÇEVIR GAME
// ========================================

async function startKelimeCevirGame(submode = 'classic') {
    currentKelimeSubmode = submode;
    gameCompleted = false; // Reset game completed flag
    
    // Reset session
    sessionScore = 0;
    questionIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    comboCount = 0;
    maxCombo = 0;
    
    const data = await loadKelimeData();
    if (data.length === 0) {
        showToast('Kelime verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Filter by difficulty first
    let filtered = filterByDifficulty(data, currentDifficulty);
    if (filtered.length < 20) {
        filtered = data;
    }
    
    let useIntelligentSelection = false;
    let isReviewMode = false;
    
    // Apply submode filter
    switch (submode) {
        case 'juz30':
            // Filter 30th Juz words (Surah 78-114)
            // id format is "sure:ayet:kelime" e.g. "82:8:6"
            filtered = filtered.filter(word => {
                const wordId = word.id || '';
                const parts = wordId.split(':');
                const sureNum = parts.length > 0 ? parseInt(parts[0]) : 0;
                return sureNum >= 78 && sureNum <= 114;
            });
            console.log(`🕌 30. Cüz kelimeleri bulundu: ${filtered.length}`);
            if (filtered.length < 10) {
                showToast('30. cüz kelimesi yeterli değil, tüm kelimeler kullanılıyor', 'info');
                filtered = filterByDifficulty(data, currentDifficulty);
            }
            useIntelligentSelection = true;
            break;
            
        case 'review':
            isReviewMode = true;
            // Get words that need review (struggling + due for review)
            const reviewWordIds = [];
            
            // Önce wordStats kontrolü yap - hiç oyun oynanmamışsa uyar
            if (!wordStats || Object.keys(wordStats).length === 0) {
                showToast('⚠️ Henüz hiç kelime çalışmadınız! Önce "Klasik Mod" ile başlayın.', 'warning', 3500);
                goToKelimeSubmodes();
                return;
            }
            
            // 1. Zorlanılan kelimeler (başarı oranı < 50%)
            const strugglingIds = Object.keys(wordStats).filter(id => {
                const stats = wordStats[id];
                return stats && stats.attempts >= 2 && stats.successRate < 50;
            });
            reviewWordIds.push(...strugglingIds);
            
            // 2. Tekrar zamanı gelmiş kelimeler
            const today = new Date(getLocalDateString());
            const dueIds = Object.keys(wordStats).filter(id => {
                const stats = wordStats[id];
                if (stats && stats.nextReviewDate) {
                    const reviewDate = new Date(stats.nextReviewDate);
                    return reviewDate <= today;
                }
                return false;
            });
            reviewWordIds.push(...dueIds);
            
            // 3. Bugün yanlış cevaplanan kelimeler
            const todayReview = dailyTasks.todayStats?.reviewWords || [];
            reviewWordIds.push(...todayReview);
            
            // Unique IDs
            const uniqueReviewIds = [...new Set(reviewWordIds)];
            
            console.log(`🔄 Tekrar edilecek kelimeler: ${uniqueReviewIds.length}`);
            
            if (uniqueReviewIds.length >= 5) {
                filtered = filtered.filter(w => uniqueReviewIds.includes(w.id));
                showToast(`${uniqueReviewIds.length} zorlandığın kelime tekrarlanacak`, 'info');
            } else {
                // Yeterli yanlış kelime yok
                showToast('⚠️ Yeterli yanlış kelime yok (en az 5 gerekli). Önce daha fazla kelime çalışın!', 'warning', 3500);
                goToKelimeSubmodes();
                return;
            }
            break;
            
        case 'favorites':
            if (favorites.length >= 5) {
                filtered = filtered.filter(w => favorites.includes(w.id));
                console.log(`⭐ Favori kelimeler: ${filtered.length}`);
            } else {
                showToast('En az 5 favori kelime eklemelisiniz!', 'error');
                goToKelimeSubmodes();
                return;
            }
            break;
            
        case 'classic':
        default:
            // Klasik mod: Akıllı kelime seçimi kullan
            useIntelligentSelection = true;
            break;
    }
    
    // Select questions using intelligent algorithm or random
    if (useIntelligentSelection && filtered.length > CONFIG.QUESTIONS_PER_GAME) {
        currentQuestions = selectIntelligentWords(filtered, CONFIG.QUESTIONS_PER_GAME, isReviewMode);
        console.log('🧠 Akıllı kelime seçimi kullanıldı');
    } else {
        currentQuestions = getRandomItems(filtered, CONFIG.QUESTIONS_PER_GAME);
    }
    
    // Hide submode screen, show game screen
    document.getElementById('kelime-submode-screen').classList.add('hidden');
    document.getElementById('kelime-cevir-screen').classList.remove('hidden');
    document.getElementById('kelime-total-questions').textContent = CONFIG.QUESTIONS_PER_GAME;
    
    // Load first question
    loadKelimeQuestion();
}

function loadKelimeQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    // Reset hint for new question
    hintUsedThisQuestion = false;
    const hintBtn = document.getElementById('kelime-hint-btn');
    if (hintBtn) {
        hintBtn.classList.remove('used');
        hintBtn.disabled = hintsUsedToday >= MAX_HINTS_PER_DAY;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    // Update UI
    document.getElementById('kelime-question-number').textContent = questionIndex + 1;
    document.getElementById('kelime-arabic').textContent = currentQuestion.kelime || currentQuestion.arabic;
    document.getElementById('kelime-info').textContent = currentQuestion.sure_adi || '';
    document.getElementById('kelime-combo').textContent = comboCount;
    document.getElementById('kelime-session-score').textContent = formatNumber(sessionScore);
    
    // Update favorite button
    const wordId = currentQuestion.kelime_id || currentQuestion.id;
    const favBtn = document.getElementById('kelime-favorite-btn');
    if (favBtn) {
        favBtn.textContent = favorites.includes(wordId) ? '❤️' : '♡';
    }
    
    // Generate options
    const correctAnswer = currentQuestion.anlam || currentQuestion.translation;
    const allWords = window.kelimeData || currentQuestions || [];
    
    // Get wrong options - ensure we have at least 3
    let wrongAnswerPool = allWords.filter(w => {
        const answer = w.anlam || w.translation;
        return answer && answer !== correctAnswer;
    });
    
    // If not enough wrong answers, use current questions
    if (wrongAnswerPool.length < 3) {
        wrongAnswerPool = currentQuestions.filter(w => {
            const answer = w.anlam || w.translation;
            return answer && answer !== correctAnswer;
        });
    }
    
    const wrongOptions = getRandomItems(wrongAnswerPool, 3).map(w => w.anlam || w.translation);
    
    // Ensure we always have 4 options
    while (wrongOptions.length < 3) {
        wrongOptions.push(`Seçenek ${wrongOptions.length + 2}`);
    }
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    currentOptions = options; // Store for hint system
    
    // Render options
    const optionsContainer = document.getElementById('kelime-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkKelimeAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkKelimeAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.anlam || currentQuestion.translation;
    const wordId = currentQuestion.kelime_id || currentQuestion.id;
    const buttons = document.querySelectorAll('#kelime-options .answer-option');
    
    // Disable all buttons
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    // Find correct button
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    // Update word stats
    updateWordStats(wordId, selectedAnswer === correctAnswer);
    
    if (selectedAnswer === correctAnswer) {
        // Correct answer
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        
        sessionScore += gained;
    } else {
        // Wrong answer
        wrongCount++;
        comboCount = 0;
        
        buttons[index].classList.add('wrong');
    }
    
    // Next question after delay
    setTimeout(() => {
        questionIndex++;
        loadKelimeQuestion();
    }, 1200);
}

/**
 * Use hint - eliminate 2 wrong answers
 */
let hintUsedThisQuestion = false;
let hintsUsedToday = 0;
const MAX_HINTS_PER_DAY = 10;

function useHint() {
    if (hintUsedThisQuestion) {
        showToast('Bu soru için ipucu zaten kullanıldı', 'info');
        return;
    }
    
    if (hintsUsedToday >= MAX_HINTS_PER_DAY) {
        showToast(`Günlük ipucu hakkınız bitti (${MAX_HINTS_PER_DAY})`, 'warning');
        return;
    }
    
    const options = document.querySelectorAll('#kelime-options .answer-option:not(.eliminated)');
    if (options.length <= 2) {
        showToast('Yeterli şık yok', 'info');
        return;
    }
    
    // Find wrong options to eliminate
    const wrongOptions = [];
    options.forEach((option, index) => {
        if (!option.classList.contains('correct') && currentOptions && currentOptions[index] !== currentQuestion.turkce_anlam && currentOptions[index] !== currentQuestion.translation) {
            wrongOptions.push(option);
        }
    });
    
    // Eliminate 1 wrong option
    const toEliminate = wrongOptions.slice(0, 1);
    toEliminate.forEach(option => {
        option.classList.add('eliminated');
        option.disabled = true;
        option.style.opacity = '0.3';
        option.style.textDecoration = 'line-through';
    });
    
    hintUsedThisQuestion = true;
    hintsUsedToday++;
    
    // Update hint button
    const hintBtn = document.getElementById('kelime-hint-btn');
    if (hintBtn) {
        hintBtn.classList.add('used');
        hintBtn.title = `İpucu kullanıldı (${MAX_HINTS_PER_DAY - hintsUsedToday} kaldı)`;
    }
    
    showToast(`💡 1 yanlış şık elendi! (${MAX_HINTS_PER_DAY - hintsUsedToday} ipucu kaldı)`, 'success', 2000);
}

/**
 * Toggle favorite for current word
 */
function toggleCurrentWordFavorite() {
    if (!currentQuestion) return;
    
    const wordId = currentQuestion.kelime_id || currentQuestion.id;
    const favBtn = document.getElementById('kelime-favorite-btn');
    
    if (favorites.includes(wordId)) {
        favorites = favorites.filter(id => id !== wordId);
        if (favBtn) favBtn.textContent = '♡';
        showToast('Favorilerden çıkarıldı', 'info', 1000);
    } else {
        favorites.push(wordId);
        if (favBtn) favBtn.textContent = '❤️';
        showToast('Favorilere eklendi!', 'success', 1000);
    }
    
    debouncedSaveStats();
}

/**
 * Update word statistics with SM-2 Algorithm
 * @param {string} wordId - Word ID
 * @param {boolean} isCorrect - Whether answer was correct
 */
function updateWordStats(wordId, isCorrect) {
    if (!wordId) return;
    
    const today = getLocalDateString();
    
    if (!wordStats[wordId]) {
        wordStats[wordId] = {
            attempts: 0,
            correct: 0,
            wrong: 0,
            successRate: 0,
            masteryLevel: 0,
            lastCorrect: null,
            lastWrong: null,
            easeFactor: 2.5,       // SM-2: başlangıç kolaylık faktörü
            interval: 0,           // SM-2: tekrar aralığı (gün)
            nextReviewDate: null,  // SM-2: sonraki tekrar tarihi
            lastReview: null       // Son tekrar tarihi
        };
    }
    
    const stats = wordStats[wordId];
    const previousAttempts = stats.attempts;
    stats.attempts++;
    stats.lastReview = today;
    
    if (isCorrect) {
        stats.correct++;
        stats.lastCorrect = today;
        
        // SM-2 Interval Hesaplama (SuperMemo 2 Algorithm)
        if (stats.interval === 0) {
            // İlk öğrenme: 1 gün sonra tekrar
            stats.interval = 1;
        } else if (stats.interval === 1) {
            // İkinci tekrar: 6 gün sonra
            stats.interval = 6;
        } else {
            // Sonraki tekrarlar: interval * easeFactor
            stats.interval = Math.max(1, Math.floor(stats.interval * stats.easeFactor));
        }
        
        // SM-2 Ease Factor Güncellemesi (Quality-based, success rate'e göre)
        // Quality 5 = Mükemmel (>=95%), Quality 4 = Kolay (>=85%), Quality 3 = Normal (>=70%)
        const currentSuccessRate = (stats.correct / stats.attempts) * 100;
        let quality = 3; // Varsayılan normal
        
        if (currentSuccessRate >= 95) {
            quality = 5; // Mükemmel
        } else if (currentSuccessRate >= 85) {
            quality = 4; // Kolay
        } else if (currentSuccessRate >= 70) {
            quality = 3; // Normal
        } else if (currentSuccessRate >= 50) {
            quality = 2; // Zor
        } else {
            quality = 1; // Çok zor
        }
        
        // SM-2 Ease Factor formülü: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        // Basitleştirilmiş versiyon: Quality'ye göre ease factor güncelle
        if (quality >= 4) {
            // Kolay/Mükemmel: Ease factor artır
            stats.easeFactor = Math.min(2.5, stats.easeFactor + (quality === 5 ? 0.15 : 0.10));
        } else if (quality === 3) {
            // Normal: Ease factor sabit kalır (çok küçük artış)
            stats.easeFactor = Math.min(2.5, stats.easeFactor + 0.02);
        } else {
            // Zor/Çok zor: Ease factor azalt
            stats.easeFactor = Math.max(1.3, stats.easeFactor - (quality === 1 ? 0.20 : 0.15));
        }
        
    } else {
        stats.wrong++;
        stats.lastWrong = today;
        
        // Yanlış cevap: interval sıfırla, ease factor azalt
        stats.interval = 1;
        stats.easeFactor = Math.max(1.3, stats.easeFactor - 0.20);
        
        // Review listesine ekle
        addToReviewList(wordId);
    }
    
    // Başarı oranı ve ustalık seviyesi (önce hesapla, interval için kullanılacak)
    stats.successRate = Math.round((stats.correct / stats.attempts) * 100);
    const oldMasteryLevel = stats.masteryLevel || 0;
    stats.masteryLevel = Math.min(10, Math.floor(stats.successRate / 10));
    
    // Sonraki tekrar tarihini hesapla
    // Ustalaşılan kelimeler için maksimum interval: 365 gün (1 yıl)
    // Bu, kelimenin tamamen unutulmasını önler ama çok nadiren sorar
    const currentMasteryLevel = stats.masteryLevel;
    const maxInterval = currentMasteryLevel >= 8 ? 365 : Infinity;
    stats.interval = Math.min(stats.interval, maxInterval);
    stats.nextReviewDate = addDaysToDate(today, stats.interval);
    
    debouncedSaveStats();
}

/**
 * Add word to review list for "Tekrar Et" mode
 * @param {string} wordId - Word ID to add
 */
function addToReviewList(wordId) {
    if (!dailyTasks.todayStats.reviewWords) {
        dailyTasks.todayStats.reviewWords = [];
    }
    if (!dailyTasks.todayStats.reviewWords.includes(wordId)) {
        dailyTasks.todayStats.reviewWords.push(wordId);
    }
}

/**
 * Add days to a date string (YYYY-MM-DD format)
 * @param {string} dateStr - Date string
 * @param {number} days - Days to add
 * @returns {string} New date string
 */
function addDaysToDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Select words intelligently using SM-2 spaced repetition
 * @param {Array} words - All available words
 * @param {number} count - Number of words to select
 * @param {boolean} isReviewMode - Whether in review mode
 * @returns {Array} Selected words
 */
function selectIntelligentWords(words, count, isReviewMode = false) {
    const today = getLocalDateString();
    const todayDate = new Date(today);
    
    // Önce kelimeleri filtrele: Ustalaşılan kelimeler sadece tekrar zamanı gelmişse dahil edilir
    const filteredWords = words.filter(word => {
        const stats = wordStats[word.id];
        
        // İstatistik yoksa dahil et (yeni kelime)
        if (!stats) {
            return true;
        }
        
        const masteryLevel = stats.masteryLevel || 0;
        
        // Ustalaşılan kelimeler (masteryLevel >= 8): Sadece tekrar zamanı gelmişse dahil et
        if (masteryLevel >= 8) {
            if (stats.nextReviewDate) {
                const reviewDate = new Date(stats.nextReviewDate);
                // Tekrar zamanı gelmişse (bugün veya geçmiş) dahil et
                return reviewDate <= todayDate;
            }
            // nextReviewDate yoksa (eski sistem uyumluluğu) dahil etme
            return false;
        }
        
        // Diğer tüm kelimeler dahil edilir
        return true;
    });
    
    // Yeterli kelime yoksa, ustalaşılan kelimeleri de dahil et (fallback)
    if (filteredWords.length < count) {
        console.log(`⚠️ Yeterli kelime yok (${filteredWords.length}/${count}), ustalaşılan kelimeler de dahil ediliyor`);
        return shuffleArray(words).slice(0, count);
    }
    
    // Kategorize words by priority
    const prioritizedWords = filteredWords.map(word => {
        const stats = wordStats[word.id];
        let priority = 1;
        
        if (!stats) {
            // Hiç denenmemiş kelimeler
            priority = 5;
        } else {
            // 1. Tekrar Zamanı Geçmiş Kelimeler (en yüksek öncelik)
            if (stats.nextReviewDate) {
                const reviewDate = new Date(stats.nextReviewDate);
                const overdueDays = Math.floor((todayDate - reviewDate) / (1000 * 60 * 60 * 24));
                if (overdueDays > 0) {
                    priority = 200 + (overdueDays * 10);
                } else if (overdueDays >= -2 && overdueDays <= 0) {
                    // Tekrar zamanı 1-2 gün içinde
                    priority = 1.5;
                }
            }
            
            // 2. Son Yanlış Cevap Verilen Kelimeler
            if (stats.lastWrong) {
                const lastWrongDate = new Date(stats.lastWrong);
                const daysSinceWrong = Math.floor((todayDate - lastWrongDate) / (1000 * 60 * 60 * 24));
                if (daysSinceWrong === 0) {
                    priority = Math.max(priority, 100);
                } else if (daysSinceWrong === 1) {
                    priority = Math.max(priority, 50);
                } else if (daysSinceWrong === 2) {
                    priority = Math.max(priority, 25);
                } else if (daysSinceWrong === 3) {
                    priority = Math.max(priority, 12);
                }
            }
            
            // 3. Zorlanılan Kelimeler
            if (stats.attempts >= 2 && stats.successRate < 50) {
                priority = Math.max(priority, isReviewMode ? 10 : 3);
            }
            
            // 4. Düşük Ustalık Seviyesi
            if (stats.masteryLevel <= 3 && stats.attempts >= 1) {
                priority = Math.max(priority, 2);
            }
            
            // 5. Ustalaşılan kelimeler için düşük öncelik (tekrar zamanı gelmiş olsa bile nadiren sor)
            if (stats.masteryLevel >= 8) {
                priority = Math.min(priority, 0.5); // Çok düşük öncelik
            }
        }
        
        return { word, priority };
    });
    
    // Sort by priority (highest first)
    prioritizedWords.sort((a, b) => b.priority - a.priority);
    
    // High priority selection (top half)
    const highPriorityCount = Math.min(Math.floor(count / 2), prioritizedWords.filter(w => w.priority >= 10).length);
    const selectedWords = prioritizedWords.slice(0, highPriorityCount).map(w => w.word);
    
    // Remaining words via weighted random selection
    const remainingCandidates = prioritizedWords.slice(highPriorityCount);
    
    while (selectedWords.length < count && remainingCandidates.length > 0) {
        const totalPriority = remainingCandidates.reduce((sum, w) => sum + w.priority, 0);
        let random = Math.random() * totalPriority;
        
        for (let i = 0; i < remainingCandidates.length; i++) {
            random -= remainingCandidates[i].priority;
            if (random <= 0) {
                selectedWords.push(remainingCandidates[i].word);
                remainingCandidates.splice(i, 1);
                break;
            }
        }
    }
    
    // Shuffle to avoid predictable order
    return shuffleArray(selectedWords);
}

/**
 * Get struggling words for analysis/review
 * @returns {Array} Array of struggling words with stats
 */
function getStrugglingWords() {
    if (!wordStats || Object.keys(wordStats).length === 0) {
        return [];
    }
    
    return Object.keys(wordStats)
        .filter(wordId => {
            const stats = wordStats[wordId];
            if (!stats) return false;
            const masteryLevel = stats.masteryLevel || 0;
            const successRate = stats.successRate || 0;
            // Zorlanılan kelimeler: masteryLevel < 4 VE başarı oranı < 100%
            // Başarı oranı %100 olan kelimeler listeden çıkar
            return masteryLevel < 4 && successRate < 100;
        })
        .map(wordId => ({
            id: wordId,
            ...wordStats[wordId],
            successRate: wordStats[wordId].successRate || 0
        }))
        .sort((a, b) => (a.successRate || 0) - (b.successRate || 0))
        .slice(0, 20);
}

/**
 * Get learning words (masteryLevel 4-7)
 * @returns {Array} Array of learning words with stats
 */
function getLearningWords() {
    if (!wordStats || Object.keys(wordStats).length === 0) {
        return [];
    }
    
    return Object.keys(wordStats)
        .filter(wordId => {
            const stats = wordStats[wordId];
            if (!stats) return false;
            const masteryLevel = stats.masteryLevel || 0;
            // Öğreniliyor kelimeler: masteryLevel >= 4 && masteryLevel < 8
            return masteryLevel >= 4 && masteryLevel < 8;
        })
        .map(wordId => ({
            id: wordId,
            ...wordStats[wordId],
            successRate: wordStats[wordId].successRate || 0
        }))
        .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
        .slice(0, 20);
}

/**
 * Get mastered words (masteryLevel >= 8)
 * @returns {Array} Array of mastered words with stats
 */
function getMasteredWords() {
    if (!wordStats || Object.keys(wordStats).length === 0) {
        return [];
    }
    
    return Object.keys(wordStats)
        .filter(wordId => {
            const stats = wordStats[wordId];
            if (!stats) return false;
            const masteryLevel = stats.masteryLevel || 0;
            // Ustalaşılan kelimeler: masteryLevel >= 8
            return masteryLevel >= 8;
        })
        .map(wordId => ({
            id: wordId,
            ...wordStats[wordId],
            successRate: wordStats[wordId].successRate || 0
        }))
        .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
        .slice(0, 20);
}

/**
 * Get word statistics for analysis modal
 * @returns {Object} Word analysis data
 */
async function getWordAnalysis() {
    // Ensure wordStats is loaded
    if (!wordStats || Object.keys(wordStats).length === 0) {
        // Try to reload from storage
        wordStats = loadFromStorage('hasene_word_stats', {});
        
        // If still empty, try to reload from Firebase
        if ((!wordStats || Object.keys(wordStats).length === 0) && typeof window.loadUserStats === 'function') {
            try {
                console.log('🔄 Word stats boş, Firebase\'den yeniden yükleniyor...');
                const firebaseUserStats = await window.loadUserStats();
                if (firebaseUserStats && firebaseUserStats.word_stats) {
                    wordStats = firebaseUserStats.word_stats;
                    // localStorage'a da kaydet
                    saveToStorage('hasene_word_stats', wordStats);
                    console.log('✅ Word stats Firebase\'den yeniden yüklendi:', Object.keys(wordStats).length, 'kelime');
                }
            } catch (error) {
                console.warn('⚠️ Firebase word stats reload failed:', error);
            }
        }
    }
    
    const allStats = Object.entries(wordStats || {});
    const totalWords = allStats.length;
    
    if (totalWords === 0) {
        return {
            totalWords: 0,
            mastered: 0,
            learning: 0,
            struggling: 0,
            averageSuccessRate: 0,
            dueForReview: 0
        };
    }
    
    const today = new Date(getLocalDateString());
    
    let mastered = 0;
    let learning = 0;
    let struggling = 0;
    let dueForReview = 0;
    let totalSuccessRate = 0;
    
    allStats.forEach(([id, stats]) => {
        if (!stats) return;
        
        const successRate = stats.successRate || 0;
        const masteryLevel = stats.masteryLevel || 0;
        
        totalSuccessRate += successRate;
        
        if (masteryLevel >= 8) {
            mastered++;
        } else if (masteryLevel >= 4) {
            learning++;
        } else {
            struggling++;
        }
        
        if (stats.nextReviewDate) {
            try {
                const reviewDate = new Date(stats.nextReviewDate);
                if (reviewDate <= today) {
                    dueForReview++;
                }
            } catch (e) {
                // Invalid date, skip
            }
        }
    });
    
    return {
        totalWords,
        mastered,
        learning,
        struggling,
        averageSuccessRate: totalWords > 0 ? Math.round(totalSuccessRate / totalWords) : 0,
        dueForReview
    };
}

/**
 * Calculate word learning speed (weekly/monthly new words)
 * @returns {Object} Learning speed stats
 */
function getWordLearningSpeed() {
    if (!wordStats || Object.keys(wordStats).length === 0) {
        return {
            weeklyNewWords: 0,
            monthlyNewWords: 0,
            weeklyTrend: 0, // Percentage change
            monthlyTrend: 0
        };
    }
    
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
    
    let weeklyNewWords = 0;
    let monthlyNewWords = 0;
    let previousWeeklyNewWords = 0;
    let previousMonthlyNewWords = 0;
    
    Object.entries(wordStats).forEach(([wordId, stats]) => {
        if (!stats || !stats.lastReview) return;
        
        try {
            const lastReview = new Date(stats.lastReview);
            
            // Weekly (last 7 days)
            if (lastReview >= weekAgo) {
                weeklyNewWords++;
            }
            
            // Previous week (7-14 days ago)
            if (lastReview >= twoWeeksAgo && lastReview < weekAgo) {
                previousWeeklyNewWords++;
            }
            
            // Monthly (last 30 days)
            if (lastReview >= monthAgo) {
                monthlyNewWords++;
            }
            
            // Previous month (30-60 days ago)
            if (lastReview >= twoMonthsAgo && lastReview < monthAgo) {
                previousMonthlyNewWords++;
            }
        } catch (e) {
            // Invalid date, skip
        }
    });
    
    // Calculate trends
    const weeklyTrend = previousWeeklyNewWords > 0 
        ? Math.round(((weeklyNewWords - previousWeeklyNewWords) / previousWeeklyNewWords) * 100)
        : 0;
    const monthlyTrend = previousMonthlyNewWords > 0
        ? Math.round(((monthlyNewWords - previousMonthlyNewWords) / previousMonthlyNewWords) * 100)
        : 0;
    
    return {
        weeklyNewWords,
        monthlyNewWords,
        weeklyTrend,
        monthlyTrend
    };
}

/**
 * Get hardest words (lowest success rate)
 * @param {number} limit - Maximum number of words to return
 * @returns {Array} Hardest words array
 */
function getHardestWords(limit = 20) {
    if (!wordStats || Object.keys(wordStats).length === 0) {
        return [];
    }
    
    const wordsWithStats = Object.entries(wordStats)
        .map(([wordId, stats]) => ({
            id: wordId,
            ...stats,
            successRate: stats.successRate || 0,
            attempts: stats.attempts || 0
        }))
        .filter(w => w.attempts >= 2) // At least 2 attempts to be considered
        .sort((a, b) => {
            // Sort by success rate (lowest first), then by attempts (most attempts first)
            if (a.successRate !== b.successRate) {
                return a.successRate - b.successRate;
            }
            return b.attempts - a.attempts;
        })
        .slice(0, limit);
    
    return wordsWithStats;
}

/**
 * Get words with most wrong answers
 * @param {number} limit - Maximum number of words to return
 * @returns {Array} Words with most wrong answers
 */
function getWordsWithMostWrongs(limit = 20) {
    if (!wordStats || Object.keys(wordStats).length === 0) {
        return [];
    }
    
    const wordsWithStats = Object.entries(wordStats)
        .map(([wordId, stats]) => ({
            id: wordId,
            ...stats,
            wrong: stats.wrong || 0,
            attempts: stats.attempts || 0
        }))
        .filter(w => w.wrong > 0) // At least 1 wrong answer
        .sort((a, b) => {
            // Sort by wrong count (highest first), then by success rate (lowest first)
            if (b.wrong !== a.wrong) {
                return b.wrong - a.wrong;
            }
            return a.successRate - b.successRate;
        })
        .slice(0, limit);
    
    return wordsWithStats;
}

/**
 * Show word analysis modal
 */
async function showWordAnalysisModal() {
    const analysis = await getWordAnalysis();
    const struggling = getStrugglingWords();
    const learning = getLearningWords();
    const mastered = getMasteredWords();
    const learningSpeed = getWordLearningSpeed();
    const hardestWords = getHardestWords(20);
    const mostWrongWords = getWordsWithMostWrongs(20);
    
    // Load kelime data to get word details
    const kelimeData = await loadKelimeData();
    
    // Helper function to find word by ID
    const findWordById = (wordId) => {
        if (!wordId || !kelimeData || kelimeData.length === 0) return null;
        return kelimeData.find(w => 
            (w.id && w.id.toString() === wordId.toString()) || 
            (w.kelime_id && w.kelime_id.toString() === wordId.toString())
        );
    };
    
    // Helper function to render word list
    const renderWordList = (words, maxCount = 10, category = '') => {
        if (!words || words.length === 0) return '';
        
        return words.slice(0, maxCount).map((w, index) => {
            const wordDetail = findWordById(w.id);
            const arabicWord = wordDetail ? (wordDetail.kelime || wordDetail.arabic || '') : '';
            const turkishMeaning = wordDetail ? (wordDetail.anlam || wordDetail.translation || '') : '';
            const attempts = w.attempts || 0;
            const correct = w.correct || 0;
            const wrong = w.wrong || 0;
            const masteryLevel = w.masteryLevel || 0;
            const successRate = Math.round(w.successRate || 0);
            
            // Progress bar for success rate
            const progressBar = `
                <div class="word-progress-bar">
                    <div class="word-progress-fill" style="width: ${successRate}%"></div>
                </div>
            `;
            
            return `
                <div class="word-card ${category}">
                    <div class="word-card-header">
                        <div class="word-number">#${index + 1}</div>
                        <div class="word-main-info">
                            <div class="word-arabic-large">${arabicWord || w.id}</div>
                            <div class="word-meaning-large">${turkishMeaning || 'Bilinmiyor'}</div>
                        </div>
                    </div>
                    <div class="word-card-body">
                        <div class="word-stats-grid">
                            <div class="word-stat-item">
                                <span class="stat-icon">📊</span>
                                <div class="stat-info">
                                    <span class="stat-label-small">Başarı</span>
                                    <span class="stat-value-small">${successRate}%</span>
                                </div>
                            </div>
                            <div class="word-stat-item">
                                <span class="stat-icon">🎯</span>
                                <div class="stat-info">
                                    <span class="stat-label-small">Seviye</span>
                                    <span class="stat-value-small">${masteryLevel}/10</span>
                                </div>
                            </div>
                            <div class="word-stat-item">
                                <span class="stat-icon">✓</span>
                                <div class="stat-info">
                                    <span class="stat-label-small">Doğru</span>
                                    <span class="stat-value-small">${correct}</span>
                                </div>
                            </div>
                            <div class="word-stat-item">
                                <span class="stat-icon">✗</span>
                                <div class="stat-info">
                                    <span class="stat-label-small">Yanlış</span>
                                    <span class="stat-value-small">${wrong}</span>
                                </div>
                            </div>
                        </div>
                        ${progressBar}
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // Prepare hardest and most wrong words with word details
    const hardestWordsWithDetails = hardestWords.map(w => {
        const wordDetail = findWordById(w.id);
        return {
            ...w,
            kelime: wordDetail ? (wordDetail.kelime || wordDetail.arabic || '') : '',
            anlam: wordDetail ? (wordDetail.anlam || wordDetail.translation || '') : ''
        };
    });
    
    const mostWrongWordsWithDetails = mostWrongWords.map(w => {
        const wordDetail = findWordById(w.id);
        return {
            ...w,
            kelime: wordDetail ? (wordDetail.kelime || wordDetail.arabic || '') : '',
            anlam: wordDetail ? (wordDetail.anlam || wordDetail.translation || '') : ''
        };
    });
    
    // Calculate percentages
    const masteredPercent = analysis.totalWords > 0 ? Math.round((analysis.mastered / analysis.totalWords) * 100) : 0;
    const learningPercent = analysis.totalWords > 0 ? Math.round((analysis.learning / analysis.totalWords) * 100) : 0;
    const strugglingPercent = analysis.totalWords > 0 ? Math.round((analysis.struggling / analysis.totalWords) * 100) : 0;
    
    let content = `
        <div class="analysis-summary-compact">
            <div class="analysis-stat-card-compact total">
                <div class="stat-icon-compact">📚</div>
                <div class="stat-content-compact">
                    <span class="stat-value-compact">${analysis.totalWords}</span>
                    <span class="stat-label-compact">Toplam</span>
                </div>
            </div>
            <div class="analysis-stat-card-compact mastered">
                <div class="stat-icon-compact">✅</div>
                <div class="stat-content-compact">
                    <span class="stat-value-compact">${analysis.mastered}</span>
                    <span class="stat-label-compact">Ustalaşılan</span>
                    <span class="stat-percent-compact">${masteredPercent}%</span>
                </div>
            </div>
            <div class="analysis-stat-card-compact learning">
                <div class="stat-icon-compact">🟡</div>
                <div class="stat-content-compact">
                    <span class="stat-value-compact">${analysis.learning}</span>
                    <span class="stat-label-compact">Öğreniliyor</span>
                    <span class="stat-percent-compact">${learningPercent}%</span>
                </div>
            </div>
            <div class="analysis-stat-card-compact struggling">
                <div class="stat-icon-compact">🔴</div>
                <div class="stat-content-compact">
                    <span class="stat-value-compact">${analysis.struggling}</span>
                    <span class="stat-label-compact">Zorlanılan</span>
                    <span class="stat-percent-compact">${strugglingPercent}%</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-progress-section-compact">
            <div class="progress-info-compact">
                <div class="progress-item-compact">
                    <span class="progress-label-compact">Ortalama Başarı</span>
                    <span class="progress-value-compact">${analysis.averageSuccessRate}%</span>
                </div>
                <div class="progress-item-compact">
                    <span class="progress-label-compact">Tekrar Bekleyen</span>
                    <span class="progress-value-compact">${analysis.dueForReview}</span>
                </div>
                <div class="progress-item-compact">
                    <span class="progress-label-compact">📈 Haftalık Yeni Kelime</span>
                    <span class="progress-value-compact">${learningSpeed.weeklyNewWords} ${learningSpeed.weeklyTrend !== 0 ? (learningSpeed.weeklyTrend > 0 ? `↑${learningSpeed.weeklyTrend}%` : `↓${Math.abs(learningSpeed.weeklyTrend)}%`) : ''}</span>
                </div>
                <div class="progress-item-compact">
                    <span class="progress-label-compact">📊 Aylık Yeni Kelime</span>
                    <span class="progress-value-compact">${learningSpeed.monthlyNewWords} ${learningSpeed.monthlyTrend !== 0 ? (learningSpeed.monthlyTrend > 0 ? `↑${learningSpeed.monthlyTrend}%` : `↓${Math.abs(learningSpeed.monthlyTrend)}%`) : ''}</span>
                </div>
            </div>
            <div class="progress-bar-container-compact">
                <div class="progress-bar-full">
                    <div class="progress-mastered" style="width: ${masteredPercent}%"></div>
                    <div class="progress-learning" style="width: ${learningPercent}%"></div>
                    <div class="progress-struggling" style="width: ${strugglingPercent}%"></div>
                </div>
                <div class="progress-legend-compact">
                    <span class="legend-item-compact"><span class="legend-color mastered"></span> Ustalaşılan</span>
                    <span class="legend-item-compact"><span class="legend-color learning"></span> Öğreniliyor</span>
                    <span class="legend-item-compact"><span class="legend-color struggling"></span> Zorlanılan</span>
                </div>
            </div>
        </div>
    `;
    
    // Word categories with tabs
    content += `
        <div class="word-categories-section">
            <div class="category-tabs">
                <button class="category-tab active" data-category="mastered" onclick="switchWordCategory('mastered')">
                    <span class="tab-icon">✅</span>
                    <span class="tab-label">Ustalaşılan</span>
                    <span class="tab-count">${mastered.length}</span>
                </button>
                <button class="category-tab" data-category="learning" onclick="switchWordCategory('learning')">
                    <span class="tab-icon">🟡</span>
                    <span class="tab-label">Öğreniliyor</span>
                    <span class="tab-count">${learning.length}</span>
                </button>
                <button class="category-tab" data-category="struggling" onclick="switchWordCategory('struggling')">
                    <span class="tab-icon">🔴</span>
                    <span class="tab-label">Zorlanılan</span>
                    <span class="tab-count">${struggling.length}</span>
                </button>
                <button class="category-tab" data-category="hardest" onclick="switchWordCategory('hardest')">
                    <span class="tab-icon">🔥</span>
                    <span class="tab-label">En Zor</span>
                    <span class="tab-count">${hardestWords.length}</span>
                </button>
                <button class="category-tab" data-category="most-wrong" onclick="switchWordCategory('most-wrong')">
                    <span class="tab-icon">❌</span>
                    <span class="tab-label">Çok Yanlış</span>
                    <span class="tab-count">${mostWrongWords.length}</span>
                </button>
            </div>
            
            <div class="category-content">
                <div class="category-panel active" id="category-mastered">
                    ${mastered.length > 0 ? `
                        <div class="category-header">
                            <h4>✅ Ustalaştığın Kelimeler</h4>
                            <span class="category-badge">${mastered.length} kelime</span>
                        </div>
                        <div class="word-list">
                            ${renderWordList(mastered, 10, 'mastered')}
                        </div>
                    ` : '<div class="empty-state">Henüz ustalaştığın kelime yok. Devam et! 💪</div>'}
                </div>
                
                <div class="category-panel" id="category-learning">
                    ${learning.length > 0 ? `
                        <div class="category-header">
                            <h4>🟡 Öğrendiğin Kelimeler</h4>
                            <span class="category-badge">${learning.length} kelime</span>
                        </div>
                        <div class="word-list">
                            ${renderWordList(learning, 10, 'learning')}
                        </div>
                    ` : '<div class="empty-state">Henüz öğrenmekte olduğun kelime yok. Başla! 🚀</div>'}
                </div>
                
                <div class="category-panel" id="category-struggling">
                    ${struggling.length > 0 ? `
                        <div class="category-header">
                            <h4>🔴 Zorlandığın Kelimeler</h4>
                            <span class="category-badge">${struggling.length} kelime</span>
                        </div>
                        <div class="word-list">
                            ${renderWordList(struggling, 10, 'struggling')}
                        </div>
                    ` : '<div class="empty-state">Harika! Zorlandığın kelime yok. 🎉</div>'}
                </div>
                
                <div class="category-panel" id="category-hardest">
                    ${hardestWordsWithDetails.length > 0 ? `
                        <div class="category-header">
                            <h4>🔥 En Zor Kelimeler (En Düşük Başarı Oranı)</h4>
                            <span class="category-badge">${hardestWordsWithDetails.length} kelime</span>
                        </div>
                        <div class="word-list">
                            ${hardestWordsWithDetails.slice(0, 20).map((w, index) => {
                                const progressBar = `
                                    <div class="word-progress-bar">
                                        <div class="word-progress-fill" style="width: ${Math.round(w.successRate || 0)}%; background: #ef4444;"></div>
                                    </div>
                                `;
                                return `
                                    <div class="word-card hardest">
                                        <div class="word-card-header">
                                            <div class="word-number">#${index + 1}</div>
                                            <div class="word-main-info">
                                                <div class="word-arabic-large">${w.kelime || w.id}</div>
                                                <div class="word-meaning-large">${w.anlam || 'Bilinmiyor'}</div>
                                            </div>
                                        </div>
                                        <div class="word-card-body">
                                            <div class="word-stats-grid">
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">📊</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Başarı</span>
                                                        <span class="stat-value-small" style="color: #ef4444;">${Math.round(w.successRate || 0)}%</span>
                                                    </div>
                                                </div>
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">✗</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Yanlış</span>
                                                        <span class="stat-value-small">${w.wrong || 0}</span>
                                                    </div>
                                                </div>
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">📝</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Deneme</span>
                                                        <span class="stat-value-small">${w.attempts || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            ${progressBar}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : '<div class="empty-state">Henüz istatistik toplanmadı. Oyun oynayarak başla! 🚀</div>'}
                </div>
                
                <div class="category-panel" id="category-most-wrong">
                    ${mostWrongWordsWithDetails.length > 0 ? `
                        <div class="category-header">
                            <h4>❌ En Çok Yanlış Yapılan Kelimeler</h4>
                            <span class="category-badge">${mostWrongWordsWithDetails.length} kelime</span>
                        </div>
                        <div class="word-list">
                            ${mostWrongWordsWithDetails.slice(0, 20).map((w, index) => {
                                const progressBar = `
                                    <div class="word-progress-bar">
                                        <div class="word-progress-fill" style="width: ${Math.round(w.successRate || 0)}%; background: #f59e0b;"></div>
                                    </div>
                                `;
                                return `
                                    <div class="word-card most-wrong">
                                        <div class="word-card-header">
                                            <div class="word-number">#${index + 1}</div>
                                            <div class="word-main-info">
                                                <div class="word-arabic-large">${w.kelime || w.id}</div>
                                                <div class="word-meaning-large">${w.anlam || 'Bilinmiyor'}</div>
                                            </div>
                                        </div>
                                        <div class="word-card-body">
                                            <div class="word-stats-grid">
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">✗</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Yanlış</span>
                                                        <span class="stat-value-small" style="color: #ef4444; font-weight: bold;">${w.wrong || 0}</span>
                                                    </div>
                                                </div>
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">✓</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Doğru</span>
                                                        <span class="stat-value-small">${w.correct || 0}</span>
                                                    </div>
                                                </div>
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">📊</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Başarı</span>
                                                        <span class="stat-value-small">${Math.round(w.successRate || 0)}%</span>
                                                    </div>
                                                </div>
                                                <div class="word-stat-item">
                                                    <span class="stat-icon">📝</span>
                                                    <div class="stat-info">
                                                        <span class="stat-label-small">Toplam</span>
                                                        <span class="stat-value-small">${w.attempts || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            ${progressBar}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : '<div class="empty-state">Henüz yanlış cevap verilmedi. Devam et! 💪</div>'}
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modal = document.getElementById('word-analysis-modal');
    if (modal) {
        // Try multiple selectors to find the content container
        const modalContent = document.getElementById('analysis-content') || 
                            modal.querySelector('#analysis-content') ||
                            modal.querySelector('.analysis-content') ||
                            modal.querySelector('.modal-body');
        
        if (modalContent) {
            modalContent.innerHTML = content;
            openModal('word-analysis-modal');
        } else {
            console.error('Analysis content container not found');
            // Fallback: show as toast summary
            showToast(`📊 ${analysis.totalWords} kelime öğrenildi, ${analysis.dueForReview} tekrar bekliyor`, 'info', 3000);
        }
    } else {
        console.error('Word analysis modal not found');
        // Fallback: show as toast summary
        showToast(`📊 ${analysis.totalWords} kelime öğrenildi, ${analysis.dueForReview} tekrar bekliyor`, 'info', 3000);
    }
}

/**
 * Switch word category tab
 */
function switchWordCategory(category) {
    // Store category in a way that showWordAnalysisModal can access it
    // For now, we'll just update the UI directly
    // Update tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    // Update panels
    document.querySelectorAll('.category-panel').forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `category-${category}`) {
            panel.classList.add('active');
        }
    });
}

function playCurrentWordAudio() {
    if (currentQuestion) {
        const audioUrl = currentQuestion.ses_dosyasi || currentQuestion.audio;
        if (audioUrl) {
            playSafeAudio(audioUrl);
        }
    }
}

// ========================================
// DINLE BUL GAME
// ========================================

async function startDinleBulGame() {
    const data = await loadKelimeData();
    if (data.length === 0) {
        showToast('Kelime verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Filter words with audio
    let filtered = data.filter(w => w.ses_dosyasi || w.audio);
    filtered = filterByDifficulty(filtered, currentDifficulty);
    
    if (filtered.length < 10) {
        filtered = data.filter(w => w.ses_dosyasi || w.audio);
    }
    
    currentQuestions = getRandomItems(filtered, CONFIG.QUESTIONS_PER_GAME);
    
    document.getElementById('dinle-bul-screen').classList.remove('hidden');
    document.getElementById('dinle-total-questions').textContent = CONFIG.QUESTIONS_PER_GAME;
    
    loadDinleQuestion();
}

function loadDinleQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('dinle-question-number').textContent = questionIndex + 1;
    document.getElementById('dinle-combo').textContent = comboCount;
    document.getElementById('dinle-session-score').textContent = formatNumber(sessionScore);
    
    const correctAnswer = currentQuestion.anlam || currentQuestion.translation;
    const allWords = window.kelimeData || currentQuestions || [];
    
    // Get wrong options - ensure we have at least 3
    let wrongAnswerPool = allWords.filter(w => {
        const answer = w.anlam || w.translation;
        return answer && answer !== correctAnswer;
    });
    
    // If not enough wrong answers, use current questions
    if (wrongAnswerPool.length < 3) {
        wrongAnswerPool = currentQuestions.filter(w => {
            const answer = w.anlam || w.translation;
            return answer && answer !== correctAnswer;
        });
    }
    
    const wrongOptions = getRandomItems(wrongAnswerPool, 3).map(w => w.anlam || w.translation);
    
    // Ensure we always have 4 options
    while (wrongOptions.length < 3) {
        wrongOptions.push(`Seçenek ${wrongOptions.length + 2}`);
    }
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('dinle-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkDinleAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Auto play audio
    setTimeout(() => playCurrentWordAudio(), 500);
}

function checkDinleAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.anlam || currentQuestion.translation;
    const buttons = document.querySelectorAll('#dinle-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const basePoints = getBasePoints(currentDifficulty);
        const gained = basePoints + CONFIG.COMBO_BONUS_PER_CORRECT;
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadDinleQuestion();
    }, 1200);
}

// ========================================
// BOŞLUK DOLDUR GAME
// ========================================

async function startBoslukDoldurGame() {
    const data = await loadAyetData();
    if (data.length === 0) {
        showToast('Ayet verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Filter verses with enough words
    const filtered = data.filter(ayet => {
        const text = ayet.ayet_metni || '';
        const words = text.split(' ').filter(w => w.length > 1);
        return words.length >= 3;
    });
    
    currentQuestions = getRandomItems(filtered, CONFIG.QUESTIONS_PER_GAME);
    
    document.getElementById('bosluk-doldur-screen').classList.remove('hidden');
    document.getElementById('bosluk-total-questions').textContent = CONFIG.QUESTIONS_PER_GAME;
    
    loadBoslukQuestion();
}

function loadBoslukQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('bosluk-question-number').textContent = questionIndex + 1;
    document.getElementById('bosluk-combo').textContent = comboCount;
    document.getElementById('bosluk-session-score').textContent = formatNumber(sessionScore);
    
    const arabicText = currentQuestion.ayet_metni || '';
    const words = arabicText.split(' ').filter(w => w.length > 1);
    
    // Pick random word to blank
    const blankIndex = Math.floor(Math.random() * words.length);
    const correctWord = words[blankIndex];
    
    // Create text with blank
    const displayWords = [...words];
    displayWords[blankIndex] = '<span class="blank-word" id="bosluk-blank"></span>';
    
    document.getElementById('bosluk-arabic').innerHTML = displayWords.join(' ');
    document.getElementById('bosluk-translation').textContent = currentQuestion.meal || '';
    
    // Generate wrong options from other words in verse or other verses
    let wrongOptions = words.filter((w, i) => i !== blankIndex && w.length > 1).slice(0, 3);
    
    // If not enough, get from other verses
    if (wrongOptions.length < 3) {
        const otherWords = shuffleArray(
            window.ayetData
                .flatMap(a => (a.ayet_metni || '').split(' '))
                .filter(w => w.length > 1 && w !== correctWord)
        ).slice(0, 3 - wrongOptions.length);
        wrongOptions = [...wrongOptions, ...otherWords];
    }
    
    // Store correct word for checking
    currentQuestion._correctWord = correctWord;
    
    const options = shuffleArray([correctWord, ...wrongOptions.slice(0, 3)]);
    
    const optionsContainer = document.getElementById('bosluk-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkBoslukAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkBoslukAnswer(index, selectedWord) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctWord = currentQuestion._correctWord;
    const buttons = document.querySelectorAll('#bosluk-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctWord) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedWord === correctWord) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        // Doğru kelimeyi boşluğa yerleştir
        const blankSpan = document.getElementById('bosluk-blank');
        if (blankSpan) {
            blankSpan.textContent = correctWord;
            blankSpan.classList.add('filled');
        }
        
        const gained = 10 + CONFIG.COMBO_BONUS_PER_CORRECT;
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadBoslukQuestion();
    }, 1200);
}

function playCurrentBoslukAudio() {
    if (currentQuestion && currentQuestion.ayet_ses_dosyasi) {
        playSafeAudio(currentQuestion.ayet_ses_dosyasi);
    }
}

// ========================================
// AYET OKU MODE
// ========================================

async function startAyetOkuMode() {
    const data = await loadAyetData();
    if (data.length === 0) {
        showToast('Ayet verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Shuffle and set random starting point
    window.shuffledAyetData = shuffleArray(data);
    currentAyetIndex = 0;
    
    document.getElementById('ayet-oku-screen').classList.remove('hidden');
    displayAyet();
}

function displayAyet() {
    const data = window.shuffledAyetData || window.ayetData;
    if (!data || data.length === 0) return;
    
    if (currentAyetIndex < 0) currentAyetIndex = data.length - 1;
    if (currentAyetIndex >= data.length) currentAyetIndex = 0;
    
    const ayet = data[currentAyetIndex];
    
    document.getElementById('ayet-surah-info').textContent = ayet.sure_adı || '';
    document.getElementById('ayet-arabic').textContent = ayet.ayet_metni || '';
    document.getElementById('ayet-translation').textContent = ayet.meal || '';
    
    // Update task progress
    updateTaskProgress('ayet_oku', 1);
}

function navigateAyet(direction) {
    // Önce sesi durdur
    stopAllAudio();
    
    currentAyetIndex += direction;
    displayAyet();
}

function playCurrentAyetAudio() {
    const data = window.shuffledAyetData || window.ayetData;
    if (data && data[currentAyetIndex]) {
        const audioUrl = data[currentAyetIndex].ayet_ses_dosyasi;
        if (audioUrl) playSafeAudio(audioUrl);
    }
}

// ========================================
// DUA ET MODE
// ========================================

async function startDuaEtMode() {
    const data = await loadDuaData();
    if (data.length === 0) {
        showToast('Dua verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    window.shuffledDuaData = shuffleArray(data);
    currentDuaIndex = 0;
    
    document.getElementById('dua-et-screen').classList.remove('hidden');
    displayDua();
}

function displayDua() {
    const data = window.shuffledDuaData || window.duaData;
    if (!data || data.length === 0) return;
    
    if (currentDuaIndex < 0) currentDuaIndex = data.length - 1;
    if (currentDuaIndex >= data.length) currentDuaIndex = 0;
    
    const dua = data[currentDuaIndex];
    
    document.getElementById('dua-reference').textContent = dua.ayet || '';
    document.getElementById('dua-arabic').textContent = dua.dua || '';
    document.getElementById('dua-translation').textContent = dua.tercume || '';
    
    updateTaskProgress('dua_et', 1);
}

function navigateDua(direction) {
    // Önce sesi durdur
    stopAllAudio();
    
    currentDuaIndex += direction;
    displayDua();
}

function playCurrentDuaAudio() {
    const data = window.shuffledDuaData || window.duaData;
    if (data && data[currentDuaIndex]) {
        const audioUrl = data[currentDuaIndex].ses_url;
        if (audioUrl) playSafeAudio(audioUrl);
    }
}

// ========================================
// HADIS OKU MODE
// ========================================

async function startHadisOkuMode() {
    const data = await loadHadisData();
    if (data.length === 0) {
        showToast('Hadis verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    window.shuffledHadisData = shuffleArray(data);
    currentHadisIndex = 0;
    
    document.getElementById('hadis-oku-screen').classList.remove('hidden');
    displayHadis();
}

function displayHadis() {
    const data = window.shuffledHadisData || window.hadisData;
    if (!data || data.length === 0) return;
    
    if (currentHadisIndex < 0) currentHadisIndex = data.length - 1;
    if (currentHadisIndex >= data.length) currentHadisIndex = 0;
    
    const hadis = data[currentHadisIndex];
    
    document.getElementById('hadis-section').textContent = hadis.section || '';
    document.getElementById('hadis-header').textContent = hadis.header || '';
    document.getElementById('hadis-text').textContent = hadis.text || '';
    document.getElementById('hadis-reference').textContent = hadis.refno || '';
    
    updateTaskProgress('hadis_oku', 1);
}

function navigateHadis(direction) {
    // Önce sesi durdur
    stopAllAudio();
    
    currentHadisIndex += direction;
    displayHadis();
}

// ========================================
// ELIF BA GAME
// ========================================

/**
 * Start Elif Ba game with selected submode
 * @param {string} submode - 'harfler' | 'kelimeler' | 'harekeler'
 */
async function startElifBaGame(submode = 'harfler') {
    currentElifBaSubmode = submode;
    gameCompleted = false; // Reset game completed flag
    
    const data = await loadHarfData();
    
    if (data.length === 0) {
        showToast('Harf verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Reset session
    questionIndex = 0;
    sessionScore = 0;
    comboCount = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;
    
    // Hide submode screen
    hideAllScreens();
    
    if (submode === 'harfler') {
        // Original letter recognition game
        currentQuestions = shuffleArray([...data]).slice(0, CONFIG.QUESTIONS_PER_GAME);
        document.getElementById('elif-ba-screen').classList.remove('hidden');
        document.getElementById('elif-total-questions').textContent = CONFIG.QUESTIONS_PER_GAME;
        
        // Show audio button for harfler game
        const audioBtn = document.getElementById('elif-audio-btn');
        if (audioBtn) {
            audioBtn.style.display = '';
        }
        
        loadElifQuestion();
        
    } else if (submode === 'kelimeler') {
        // Word reading with letters
        await startElifKelimelerGame(data);
        
    } else if (submode === 'harekeler') {
        // Harekeler (vowel marks) game
        await startElifHarekelerGame(data);
    } else if (submode === 'fetha') {
        // Fetha (Ustun) game - uses ustn.json
        await startElifFethaGame();
    } else if (submode === 'esre') {
        // Esre game - uses esre.json
        await startElifEsreGame();
    } else if (submode === 'otre') {
        // Otre game - uses otre.json
        await startElifOtreGame();
    } else if (submode === 'uc-harfli-kelimeler') {
        // Üç Harfli Kelimeler game - uses uc_harfli_kelimeler.json
        await startUcHarfliKelimelerGame();
    } else if (submode === 'tenvin') {
        // Tenvin game - uses tenvin.json
        await startElifTenvinGame();
    } else if (submode === 'sedde') {
        // Şedde game - uses sedde.json
        await startSeddeGame();
    } else if (submode === 'cezm') {
        // Cezm game - uses cezm.json
        await startCezmGame();
    } else if (submode === 'uzatma-med') {
        // Uzatma (Med) Harfleri game - uses uzatma_med.json
        await startUzatmaMedGame();
    }
}

/**
 * Elif Ba Kelimeler submode - identify word starting with specific letter
 */
async function startElifKelimelerGame(harfData) {
    // Load kelime data to get words starting with specific letters
    const kelimeData = await loadKelimeData();
    
    if (kelimeData.length === 0) {
        showToast('Kelime verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Create questions - match words with their starting letter
    const questions = [];
    const usedHarfler = shuffleArray([...harfData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    
    for (const harf of usedHarfler) {
        const matchingWords = kelimeData.filter(w => {
            const kelime = w.kelime || w.arabic || '';
            return kelime.startsWith(harf.harf);
        });
        
        if (matchingWords.length > 0) {
            const word = matchingWords[Math.floor(Math.random() * matchingWords.length)];
            questions.push({
                type: 'kelimeler',
                harf: harf,
                word: word,
                correctAnswer: word.kelime || word.arabic
            });
        }
    }
    
    if (questions.length < 5) {
        // Fallback to normal harf game if not enough words
        currentQuestions = shuffleArray([...harfData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
        document.getElementById('elif-ba-screen').classList.remove('hidden');
        document.getElementById('elif-total-questions').textContent = CONFIG.QUESTIONS_PER_GAME;
        loadElifQuestion();
        return;
    }
    
    currentQuestions = questions.slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for kelimeler game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    loadElifKelimelerQuestion();
}

function loadElifKelimelerQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    document.getElementById('elif-letter').textContent = `"${currentQuestion.harf.harf}" harfiyle başlayan kelimeyi seç`;
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    const correctAnswer = currentQuestion.correctAnswer;
    const kelimeData = window.kelimeData || [];
    
    // Get wrong options (words NOT starting with this letter)
    const wrongWords = kelimeData.filter(w => {
        const kelime = w.kelime || w.arabic || '';
        return !kelime.startsWith(currentQuestion.harf.harf) && kelime.length > 0;
    });
    
    const wrongOptions = getRandomItems(wrongWords, 3).map(w => w.kelime || w.arabic);
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option arabic-text" onclick="checkElifKelimelerAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkElifKelimelerAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.correctAnswer;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        const gained = 5 + CONFIG.COMBO_BONUS_PER_CORRECT;
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifKelimelerQuestion();
    }, 1200);
}

/**
 * Elif Ba Fetha submode - uses ustn.json data
 */
async function startElifFethaGame() {
    const ustnData = await loadUstnData();
    
    if (ustnData.length === 0) {
        showToast('Ustun verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Create questions from ustn data
    currentQuestions = shuffleArray([...ustnData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for fetha game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadElifFethaQuestion();
}

function loadElifFethaQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set letter with color and type label
    const letterElement = document.getElementById('elif-letter');
    const renkKodu = currentQuestion.renkKodu || '#1a1a2e';
    const sesTipi = currentQuestion.sesTipi || '';
    
    // Convert sesTipi to display text
    let tipText = '';
    if (sesTipi === 'ince_sesli_harf') {
        tipText = 'İnce';
    } else if (sesTipi === 'kalın_sesli_harf') {
        tipText = 'Kalın';
    } else if (sesTipi === 'peltek_sesli_harf') {
        tipText = 'Peltek';
    }
    
    // Reset styles - use arabic-word class styling
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(3rem, 7vw, 4.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    
    const harfWithUstun = currentQuestion.harfWithUstun || '';
    letterElement.textContent = harfWithUstun;
    
    // Set tip text in word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = tipText || '';
    }
    
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    // For options, we need to create wrong answers from other harfler
    const allUstnData = window.ustnData || [];
    const correctAnswer = currentQuestion.okunus;
    
    const wrongOptions = getRandomItems(
        allUstnData.filter(h => h.okunus !== correctAnswer),
        3
    ).map(h => h.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkElifFethaAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkElifFethaAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifFethaQuestion();
    }, 1200);
}

/**
 * Elif Ba Esre submode - uses esre.json data
 */
async function startElifEsreGame() {
    const esreData = await loadEsreData();
    
    if (esreData.length === 0) {
        showToast('Esre verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Create questions from esre data
    currentQuestions = shuffleArray([...esreData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for esre game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadElifEsreQuestion();
}

function loadElifEsreQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set letter with color and type label
    const letterElement = document.getElementById('elif-letter');
    const renkKodu = currentQuestion.renkKodu || '#1a1a2e';
    const sesTipi = currentQuestion.sesTipi || '';
    
    // Convert sesTipi to display text
    let tipText = '';
    if (sesTipi === 'ince_sesli_harf') {
        tipText = 'İnce';
    } else if (sesTipi === 'kalın_sesli_harf') {
        tipText = 'Kalın';
    } else if (sesTipi === 'peltek_sesli_harf') {
        tipText = 'Peltek';
    }
    
    // Reset styles - use arabic-word class styling
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(3rem, 7vw, 4.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    
    const harfWithEsre = currentQuestion.harfWithEsre || '';
    letterElement.textContent = harfWithEsre;
    
    // Set tip text in word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = tipText || '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allEsreData = window.esreData || [];
    const wrongOptions = getRandomItems(
        allEsreData.filter(h => h.okunus !== correctAnswer),
        3
    ).map(h => h.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkElifEsreAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkElifEsreAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifEsreQuestion();
    }, 1200);
}

/**
 * Elif Ba Otre submode - uses otre.json data
 */
async function startElifOtreGame() {
    const otreData = await loadOtreData();
    
    if (otreData.length === 0) {
        showToast('Otre verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Create questions from otre data
    currentQuestions = shuffleArray([...otreData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for otre game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadElifOtreQuestion();
}

function loadElifOtreQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set letter with color and type label
    const letterElement = document.getElementById('elif-letter');
    const renkKodu = currentQuestion.renkKodu || '#1a1a2e';
    const sesTipi = currentQuestion.sesTipi || '';
    
    // Convert sesTipi to display text
    let tipText = '';
    if (sesTipi === 'ince_sesli_harf') {
        tipText = 'İnce';
    } else if (sesTipi === 'kalın_sesli_harf') {
        tipText = 'Kalın';
    } else if (sesTipi === 'peltek_sesli_harf') {
        tipText = 'Peltek';
    }
    
    // Reset styles - use arabic-word class styling
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(3rem, 7vw, 4.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    
    const harfWithOtre = currentQuestion.harfWithOtre || '';
    letterElement.textContent = harfWithOtre;
    
    // Set tip text in word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = tipText || '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allOtreData = window.otreData || [];
    const wrongOptions = getRandomItems(
        allOtreData.filter(h => h.okunus !== correctAnswer),
        3
    ).map(h => h.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkElifOtreAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkElifOtreAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifOtreQuestion();
    }, 1200);
}

/**
 * Tenvin game - uses tenvin.json
 */
async function startElifTenvinGame() {
    const tenvinData = await loadTenvinData();
    
    if (tenvinData.length === 0) {
        showToast('Tenvin verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Reset session
    questionIndex = 0;
    sessionScore = 0;
    comboCount = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;
    
    // Create questions from tenvin data
    currentQuestions = shuffleArray([...tenvinData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for tenvin game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadElifTenvinQuestion();
}

function loadElifTenvinQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set letter with color and type label
    const letterElement = document.getElementById('elif-letter');
    const renkKodu = currentQuestion.renkKodu || '#1a1a2e';
    const sesTipi = currentQuestion.sesTipi || '';
    
    // Convert sesTipi to display text
    let tipText = '';
    if (sesTipi === 'ince_sesli_harf') {
        tipText = 'İnce';
    } else if (sesTipi === 'kalın_sesli_harf') {
        tipText = 'Kalın';
    } else if (sesTipi === 'peltek_sesli_harf') {
        tipText = 'Peltek';
    }
    
    // Reset styles - use arabic-word class styling
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(3rem, 7vw, 4.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    
    const harfWithTenvin = currentQuestion.harfWithTenvin || '';
    letterElement.textContent = harfWithTenvin;
    
    // Set tip text in word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = tipText || '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allTenvinData = window.tenvinData || [];
    const wrongOptions = getRandomItems(
        allTenvinData.filter(h => h.okunus !== correctAnswer),
        3
    ).map(h => h.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkElifTenvinAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkElifTenvinAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifTenvinQuestion();
    }, 1200);
}

/**
 * Üç Harfli Kelimeler game - uses uc_harfli_kelimeler.json
 */
async function startUcHarfliKelimelerGame() {
    const ucHarfliKelimelerData = await loadUcHarfliKelimelerData();
    
    if (ucHarfliKelimelerData.length === 0) {
        showToast('Üç Harfli Kelimeler verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Reset session
    questionIndex = 0;
    sessionScore = 0;
    comboCount = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;
    
    // Create questions from uc harfli kelimeler data
    currentQuestions = shuffleArray([...ucHarfliKelimelerData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for uc harfli kelimeler game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadUcHarfliKelimelerQuestion();
}

function loadUcHarfliKelimelerQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set word display - use arabic-word class styling
    const letterElement = document.getElementById('elif-letter');
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(2.5rem, 7vw, 3.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    letterElement.textContent = currentQuestion.kelime || '';
    
    // Set Turkish meaning in word-info (same as uzatma-med)
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = currentQuestion.anlam || '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allUcHarfliKelimelerData = window.ucHarfliKelimelerData || [];
    const wrongOptions = getRandomItems(
        allUcHarfliKelimelerData.filter(k => k.okunus !== correctAnswer),
        3
    ).map(k => k.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkUcHarfliKelimelerAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkUcHarfliKelimelerAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        // Check if this was the last question before loading next
        if (questionIndex >= currentQuestions.length) {
            endGame();
        } else {
            loadUcHarfliKelimelerQuestion();
        }
    }, 1200);
}

/**
 * Uzatma (Med) Harfleri game - uses uzatma_med.json
 */
async function startUzatmaMedGame() {
    const uzatmaMedData = await loadUzatmaMedData();
    
    if (uzatmaMedData.length === 0) {
        showToast('Uzatma (Med) Harfleri verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Reset session
    questionIndex = 0;
    sessionScore = 0;
    comboCount = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;
    
    // Create questions from uzatma med data
    currentQuestions = shuffleArray([...uzatmaMedData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for uzatma med game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadUzatmaMedQuestion();
}

function loadUzatmaMedQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set word display - use arabic-word class styling
    const letterElement = document.getElementById('elif-letter');
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(2.5rem, 7vw, 3.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    letterElement.textContent = currentQuestion.kelime || '';
    
    // Set Turkish meaning in word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = currentQuestion.anlam || '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allUzatmaMedData = window.uzatmaMedData || [];
    const wrongOptions = getRandomItems(
        allUzatmaMedData.filter(k => k.okunus !== correctAnswer),
        3
    ).map(k => k.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkUzatmaMedAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkUzatmaMedAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadUzatmaMedQuestion();
    }, 1200);
}

/**
 * Şedde game - uses sedde.json
 */
async function startSeddeGame() {
    const seddeData = await loadSeddeData();
    
    if (seddeData.length === 0) {
        showToast('Şedde verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Reset session
    questionIndex = 0;
    sessionScore = 0;
    comboCount = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;
    
    // Create questions from sedde data
    currentQuestions = shuffleArray([...seddeData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for sedde game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadSeddeQuestion();
}

function loadSeddeQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set word display - use arabic-word class styling
    const letterElement = document.getElementById('elif-letter');
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(2.5rem, 7vw, 3.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    letterElement.textContent = currentQuestion.kelime || '';
    
    // Clear word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allSeddeData = window.seddeData || [];
    const wrongOptions = getRandomItems(
        allSeddeData.filter(k => k.okunus !== correctAnswer),
        3
    ).map(k => k.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkSeddeAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkSeddeAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadSeddeQuestion();
    }, 1200);
}

/**
 * Cezm game - uses cezm.json
 */
async function startCezmGame() {
    const cezmData = await loadCezmData();
    
    if (cezmData.length === 0) {
        showToast('Cezm verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Reset session
    questionIndex = 0;
    sessionScore = 0;
    comboCount = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;
    
    // Create questions from cezm data
    currentQuestions = shuffleArray([...cezmData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Show audio button for cezm game
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadCezmQuestion();
}

function loadCezmQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Set word display - use arabic-word class styling
    const letterElement = document.getElementById('elif-letter');
    letterElement.className = 'arabic-word';
    letterElement.style.background = 'none';
    letterElement.style.border = 'none';
    letterElement.style.padding = '0';
    letterElement.style.borderRadius = '0';
    letterElement.style.boxShadow = 'none';
    letterElement.style.fontSize = 'clamp(2.5rem, 7vw, 3.5rem)';
    letterElement.style.fontWeight = 'bold';
    letterElement.style.color = 'var(--text-primary)';
    letterElement.textContent = currentQuestion.kelime || '';
    
    // Clear word-info
    const wordInfoElement = document.getElementById('elif-question-instruction');
    if (wordInfoElement) {
        wordInfoElement.textContent = '';
    }
    
    // Generate options with only Turkish pronunciation
    const correctAnswer = currentQuestion.okunus;
    const allCezmData = window.cezmData || [];
    const wrongOptions = getRandomItems(
        allCezmData.filter(k => k.okunus !== correctAnswer),
        3
    ).map(k => k.okunus);
    
    // Create options with only okunus (Turkish pronunciation)
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkCezmAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
    
    // Audio will be played when user clicks the audio button
}

function checkCezmAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadCezmQuestion();
    }, 1200);
}

/**
 * Elif Ba Harekeler submode - vowel marks game
 */
async function startElifHarekelerGame(harfData) {
    const harekeler = [
        { name: 'Üstün', symbol: 'ـَ', sound: 'e' },
        { name: 'Esre', symbol: 'ـِ', sound: 'i' },
        { name: 'Ötre', symbol: 'ـُ', sound: 'u' },
        { name: 'Cezm', symbol: 'ـْ', sound: '-' },
        { name: 'Şedde', symbol: 'ـّ', sound: 'çift' },
        { name: 'Tenvin Üstün', symbol: 'ـً', sound: 'en' },
        { name: 'Tenvin Esre', symbol: 'ـٍ', sound: 'in' },
        { name: 'Tenvin Ötre', symbol: 'ـٌ', sound: 'un' }
    ];
    
    // Create questions about harekeler
    const questions = [];
    for (let i = 0; i < CONFIG.QUESTIONS_PER_GAME; i++) {
        const hareke = harekeler[i % harekeler.length];
        const harf = harfData[Math.floor(Math.random() * harfData.length)];
        questions.push({
            type: 'harekeler',
            hareke: hareke,
            harf: harf,
            correctAnswer: hareke.name
        });
    }
    
    currentQuestions = shuffleArray(questions);
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    // Hide audio button for harekeler game (no audio in this mode)
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = 'none';
    }
    
    // Show info button in word-actions
    const infoBtn = document.getElementById('elif-info-btn-header');
    if (infoBtn) {
        infoBtn.style.display = 'flex';
    }
    
    loadElifHarekelerQuestion();
}

function loadElifHarekelerQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    document.getElementById('elif-letter').textContent = currentQuestion.hareke.symbol;
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    const harekeler = [
        { name: 'Üstün', symbol: 'ـَ' },
        { name: 'Esre', symbol: 'ـِ' },
        { name: 'Ötre', symbol: 'ـُ' },
        { name: 'Cezm', symbol: 'ـْ' },
        { name: 'Şedde', symbol: 'ـّ' },
        { name: 'Tenvin Üstün', symbol: 'ـً' },
        { name: 'Tenvin Esre', symbol: 'ـٍ' },
        { name: 'Tenvin Ötre', symbol: 'ـٌ' }
    ];
    
    const correctAnswer = currentQuestion.correctAnswer;
    const wrongOptions = harekeler
        .filter(h => h.name !== correctAnswer)
        .slice(0, 3)
        .map(h => h.name);
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkElifHarekelerAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkElifHarekelerAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.correctAnswer;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        const gained = 5 + CONFIG.COMBO_BONUS_PER_CORRECT;
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifHarekelerQuestion();
    }, 1200);
}

function loadElifQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    document.getElementById('elif-letter').textContent = currentQuestion.harf;
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    const correctAnswer = currentQuestion.okunus || currentQuestion.isim;
    const allHarfler = window.harfData || [];
    
    const wrongOptions = getRandomItems(
        allHarfler.filter(h => (h.okunus || h.isim) !== correctAnswer),
        3
    ).map(h => h.okunus || h.isim);
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkElifAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkElifAnswer(index, selectedAnswer) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const correctAnswer = currentQuestion.okunus || currentQuestion.isim;
    const buttons = document.querySelectorAll('#elif-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const gained = 5 + CONFIG.COMBO_BONUS_PER_CORRECT;
        sessionScore += gained;
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    setTimeout(() => {
        questionIndex++;
        loadElifQuestion();
    }, 1200);
}

function playCurrentLetterAudio() {
    if (currentQuestion && currentQuestion.audioUrl) {
        playSafeAudio(currentQuestion.audioUrl);
    }
}

// ========================================
// DAILY TASKS & STREAK
// ========================================

async function checkDailyTasks() {
    const today = getLocalDateString();
    dailyTasks = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
    
    if (dailyTasks.lastTaskDate !== today) {
        // New day, reset tasks
        dailyTasks = {
            lastTaskDate: today,
            tasks: JSON.parse(JSON.stringify(DAILY_TASKS_TEMPLATE)).map(t => ({ ...t, progress: 0 })),
            bonusTasks: JSON.parse(JSON.stringify(DAILY_BONUS_TASKS_TEMPLATE)).map(t => ({ ...t, progress: 0 })),
            todayStats: {
                toplamDogru: 0,
                toplamPuan: 0,
                comboCount: 0,
                allGameModes: [],
                ayet_oku: 0,
                dua_et: 0,
                hadis_oku: 0
            }
        };
        saveToStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
    }
}

function updateTaskProgress(type, value) {
    if (!dailyTasks.tasks) return;
    
    // Update stats
    if (type === 'correct') {
        dailyTasks.todayStats.toplamDogru += value;
    } else if (type === 'hasene') {
        dailyTasks.todayStats.toplamPuan += value;
    } else if (type === 'game_modes') {
        if (!dailyTasks.todayStats.allGameModes.includes(value)) {
            dailyTasks.todayStats.allGameModes.push(value);
        }
    } else if (type === 'ayet_oku') {
        dailyTasks.todayStats.ayet_oku += value;
    } else if (type === 'dua_et') {
        dailyTasks.todayStats.dua_et += value;
    } else if (type === 'hadis_oku') {
        dailyTasks.todayStats.hadis_oku += value;
    }
    
    // Update task progress
    dailyTasks.tasks.forEach(task => {
        if (task.type === type) {
            if (type === 'game_modes') {
                task.progress = dailyTasks.todayStats.allGameModes.length;
            } else if (type === 'ayet_oku') {
                task.progress = dailyTasks.todayStats.ayet_oku;
            } else if (type === 'dua_et') {
                task.progress = dailyTasks.todayStats.dua_et;
            } else if (type === 'hadis_oku') {
                task.progress = dailyTasks.todayStats.hadis_oku;
            }
        }
    });
    
    dailyTasks.bonusTasks.forEach(task => {
        if (task.type === 'correct') {
            task.progress = dailyTasks.todayStats.toplamDogru;
        } else if (task.type === 'hasene') {
            task.progress = dailyTasks.todayStats.toplamPuan;
        }
    });
    
    debouncedSaveStats();
    
    // Ödül kutusunu kontrol et
    checkRewardBoxStatus();
}

// ========================================
// GÜNLÜK ÖDÜL KUTUSU (SÜRPRİZ KUTUSU)
// ========================================

const DAILY_REWARDS = [100, 250, 500];
const DAILY_REWARD_TEACHINGS = [
    { type: 'zikir', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', meaning: 'Subhanallahi ve bihamdihi - Allah\'ı hamd ile tesbih ederim' },
    { type: 'zikir', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', meaning: 'La havle ve la kuvvete illa billah - Güç ve kuvvet ancak Allah\'tandır' },
    { type: 'zikir', text: 'أَسْتَغْفِرُ اللَّهَ', meaning: 'Estağfirullah - Allah\'tan bağışlanma dilerim' },
    { type: 'dua', text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', meaning: 'Rabbena atina fid-dünya haseneten - Rabbimiz, bize dünyada iyilik ver' },
    { type: 'dua', text: 'رَبِّ زِدْنِي عِلْمًا', meaning: 'Rabbi zidni ilmen - Rabbim, ilmimi artır' },
    { type: 'hadis', text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', meaning: 'En hayırlınız Kuran\'ı öğrenen ve öğretendir' },
    { type: 'hadis', text: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ', meaning: 'Müslüman, dilinden ve elinden Müslümanların emin olduğu kişidir' },
    { type: 'zikir', text: 'الْحَمْدُ لِلَّهِ', meaning: 'Elhamdülillah - Hamd Allah\'a mahsustur' }
];

function checkRewardBoxStatus() {
    const rewardBox = document.getElementById('reward-box');
    const statusEl = document.getElementById('reward-box-status');
    if (!rewardBox || !statusEl) return;
    
    const today = getLocalDateString();
    
    // Bugün zaten alındı mı?
    if (dailyTasks.rewardClaimedDate === today) {
        rewardBox.classList.remove('active');
        rewardBox.classList.add('claimed');
        rewardBox.style.pointerEvents = 'none'; // Tıklamayı devre dışı bırak
        rewardBox.style.opacity = '0.6'; // Görsel olarak devre dışı olduğunu göster
        statusEl.textContent = '✓ Bugünkü ödül alındı!';
        return;
    }
    
    // Tüm görevler tamamlandı mı?
    const allTasksComplete = areAllTasksComplete();
    
    if (allTasksComplete) {
        rewardBox.classList.add('active');
        rewardBox.classList.remove('claimed');
        rewardBox.style.pointerEvents = 'auto'; // Tıklamayı aktif et
        rewardBox.style.opacity = '1'; // Tam opaklık
        statusEl.textContent = '🎉 Tıkla ve ödülünü al!';
    } else {
        rewardBox.classList.remove('active', 'claimed');
        rewardBox.style.pointerEvents = 'none'; // Tıklamayı devre dışı bırak
        rewardBox.style.opacity = '0.6'; // Görsel olarak devre dışı olduğunu göster
        statusEl.textContent = 'Görevleri tamamla!';
    }
}

function areAllTasksComplete() {
    if (!dailyTasks.tasks || dailyTasks.tasks.length === 0) return false;
    
    // Ana görevlerin hepsinin tamamlanmış olması gerekiyor
    const mainTasksComplete = dailyTasks.tasks.every(task => task.progress >= task.target);
    
    // Bonus görevlerin de hepsinin tamamlanmış olması gerekiyor (500 Hasene dahil)
    if (!dailyTasks.bonusTasks || dailyTasks.bonusTasks.length === 0) {
        return mainTasksComplete;
    }
    
    const bonusTasksComplete = dailyTasks.bonusTasks.every(task => task.progress >= task.target);
    
    return mainTasksComplete && bonusTasksComplete;
}

function claimDailyReward() {
    const rewardBox = document.getElementById('reward-box');
    if (!rewardBox) return;
    
    const today = getLocalDateString();
    
    // ÖNCE kontrol et - zaten alındıysa çık (en önemli kontrol)
    if (dailyTasks.rewardClaimedDate === today) {
        showToast('Bugünkü ödül zaten alındı!', 'info');
        // UI'ı güncelle
        checkRewardBoxStatus();
        return;
    }
    
    // Active class kontrolü
    if (!rewardBox.classList.contains('active')) {
        showToast('Önce tüm görevleri tamamlamalısınız!', 'info');
        return;
    }
    
    // Ödül verilmeden ÖNCE hemen active class'ını kaldır ve butonu devre dışı bırak (çift tıklamayı önlemek için)
    rewardBox.classList.remove('active');
    rewardBox.classList.add('claimed');
    rewardBox.style.pointerEvents = 'none'; // Tıklamayı devre dışı bırak
    rewardBox.style.opacity = '0.6'; // Görsel olarak devre dışı olduğunu göster
    
    // Ödül alındı olarak HEMEN işaretle (çift tıklamayı önlemek için)
    dailyTasks.rewardClaimedDate = today;
    saveToStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
    
    // Rastgele ödül seç
    const rewardAmount = DAILY_REWARDS[Math.floor(Math.random() * DAILY_REWARDS.length)];
    
    // Rastgele öğreti seç
    const teaching = DAILY_REWARD_TEACHINGS[Math.floor(Math.random() * DAILY_REWARD_TEACHINGS.length)];
    
    // Hasene ekle
    totalHasene += rewardAmount;
    
    // Stats kaydet (localStorage + Firebase)
    debouncedSaveStats();
    
    // Günlük görevleri Firebase'e senkronize et
    if (typeof window.saveDailyTasks === 'function') {
        window.saveDailyTasks(dailyTasks).catch(err => {
            console.warn('Daily tasks sync to Firebase failed:', err);
        });
    }
    
    // UI güncelle
    updateDisplay();
    checkRewardBoxStatus();
    
    // Ödül modalı göster
    showRewardModal(rewardAmount, teaching);
}

function showRewardModal(amount, teaching) {
    // Mevcut modal varsa kapat
    closeAllModals();
    
    const typeLabels = {
        'zikir': '📿 Zikir',
        'dua': '🤲 Dua',
        'hadis': '📖 Hadis'
    };
    
    // Modal oluştur
    const modalHTML = `
        <div id="reward-result-modal" class="modal" style="display: flex;">
            <div class="modal-content glass-card reward-result-content">
                <div class="reward-celebration">🎉</div>
                <h2>Tebrikler!</h2>
                <div class="reward-amount">+${formatNumber(amount)} Hasene</div>
                <div class="reward-teaching">
                    <div class="teaching-type">${typeLabels[teaching.type]}</div>
                    <div class="teaching-arabic">${teaching.text}</div>
                    <div class="teaching-meaning">${teaching.meaning}</div>
                </div>
                <button class="primary-btn" onclick="closeRewardModal()">Tamam</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Modal backdrop'a tıklanınca kapat
    const modal = document.getElementById('reward-result-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Eğer modal içeriğine değil de backdrop'a tıklandıysa kapat
            if (e.target === modal) {
                closeRewardModal();
            }
        });
        // currentOpenModal'ı güncelle
        currentOpenModal = 'reward-result-modal';
    }
    
    // Konfeti efekti (basit)
    playSafeAudio && typeof playSuccessSound === 'function' && playSuccessSound();
}

function closeRewardModal() {
    const modal = document.getElementById('reward-result-modal');
    if (modal) {
        // Modal'ı hemen kaldır
        modal.remove();
        // currentOpenModal'ı temizle
        if (currentOpenModal === 'reward-result-modal') {
            currentOpenModal = null;
        }
    }
    
    // Ana ekrana dön
    goToMainMenu();
    
    // Görevler modalı açıksa kapat
    const tasksModal = document.getElementById('tasks-modal');
    if (tasksModal && !tasksModal.classList.contains('hidden')) {
        closeModal('tasks-modal');
    }
    
    // Başarı mesajı göster
    showToast('✅ Günlük ödül alındı! Ana menüye döndürüldünüz.', 'success', 2000);
}

// Window'a export et
window.claimDailyReward = claimDailyReward;
window.closeRewardModal = closeRewardModal;

function checkStreak() {
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
    
    if (streakData.lastPlayDate === today) {
        // Already played today
        return;
    }
    
    // Only update streak if user actually plays (not just on page load)
    // This function should be called when user completes a game, not on app init
    if (!streakData.lastPlayDate || streakData.lastPlayDate === '') {
        // First time playing - don't set streak yet
        return;
    }
    
    if (streakData.lastPlayDate === yesterday) {
        // Continue streak
        streakData.currentStreak++;
    } else {
        // Streak broken
        streakData.currentStreak = 1;
    }
    
    streakData.lastPlayDate = today;
    streakData.bestStreak = Math.max(streakData.bestStreak, streakData.currentStreak);
    
    if (!streakData.playDates.includes(today)) {
        streakData.playDates.push(today);
        streakData.totalPlayDays++;
    }
    
    debouncedSaveStats();
}

/**
 * Update streak when user actually plays a game
 * Called from endGameSession() only when user earns points
 */
function updateStreakOnPlay() {
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
    
    // Already updated today
    if (streakData.lastPlayDate === today) {
        return;
    }
    
    // First time ever playing
    if (!streakData.lastPlayDate || streakData.lastPlayDate === '') {
        streakData.currentStreak = 1;
        streakData.bestStreak = 1;
        streakData.lastPlayDate = today;
        streakData.playDates = [today];
        streakData.totalPlayDays = 1;
        debouncedSaveStats();
        return;
    }
    
    // Check if yesterday was last play date (streak continues)
    if (streakData.lastPlayDate === yesterday) {
        streakData.currentStreak++;
    } else {
        // Streak broken - start new streak
        streakData.currentStreak = 1;
    }
    
    // Update data
    streakData.lastPlayDate = today;
    streakData.bestStreak = Math.max(streakData.bestStreak, streakData.currentStreak);
    
    if (!streakData.playDates.includes(today)) {
        streakData.playDates.push(today);
        streakData.totalPlayDays++;
    }
    
    debouncedSaveStats();
}

function checkDailyGoal() {
    if (dailyProgress >= dailyGoal) {
        // Daily goal completed!
        showToast(`🎯 Günlük hedef tamamlandı! +${CONFIG.DAILY_GOAL_BONUS} Hasene`, 'success', 3000);
        totalPoints += CONFIG.DAILY_GOAL_BONUS;
        dailyProgress += CONFIG.DAILY_GOAL_BONUS;
    }
}

// ========================================
// UI UPDATES
// ========================================

function updateStatsDisplay() {
    document.getElementById('total-hasene').textContent = formatNumber(totalPoints);
    document.getElementById('total-stars').textContent = `⭐ ${calculateStars(totalPoints)}`;
    document.getElementById('streak-count').textContent = `🔥 ${streakData.currentStreak}`;
    document.getElementById('level-display').textContent = currentLevel;
    
    updateDailyGoalDisplay();
}

function updateDailyGoalDisplay() {
    document.getElementById('daily-goal-text').textContent = 
        `${formatNumber(dailyProgress)} / ${formatNumber(dailyGoal)}`;
    
    const progress = Math.min(100, (dailyProgress / dailyGoal) * 100);
    document.getElementById('daily-goal-progress').style.width = `${progress}%`;
}

function showGoalSettings() {
    // Update active button
    document.querySelectorAll('.goal-option').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.goal) === dailyGoal);
    });
    
    openModal('goal-settings-modal');
}

function showStatsModal() {
    document.getElementById('modal-total-hasene').textContent = formatNumber(totalPoints);
    document.getElementById('modal-total-stars').textContent = calculateStars(totalPoints);
    document.getElementById('modal-total-correct').textContent = formatNumber(gameStats.totalCorrect || 0);
    document.getElementById('modal-total-wrong').textContent = formatNumber(gameStats.totalWrong || 0);
    document.getElementById('modal-best-streak').textContent = streakData.bestStreak;
    document.getElementById('modal-total-days').textContent = streakData.totalPlayDays;
    
    openModal('stats-modal');
}

function showTasksModal() {
    const tasksList = document.getElementById('tasks-list');
    
    const allTasks = [...(dailyTasks.tasks || []), ...(dailyTasks.bonusTasks || [])];
    const completedCount = allTasks.filter(t => (t.progress || 0) >= t.target).length;
    const allComplete = completedCount === allTasks.length && allTasks.length > 0;
    
    let html = allTasks.map(task => {
        const isComplete = (task.progress || 0) >= task.target;
        const progressPercent = Math.min(100, ((task.progress || 0) / task.target) * 100);
        return `
            <div class="task-item ${isComplete ? 'completed' : ''}">
                <div class="task-icon">${task.icon || '📋'}</div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-progress-bar">
                        <div class="task-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="task-progress-text">${task.progress || 0} / ${task.target}</div>
                </div>
                <div class="task-status">${isComplete ? '✅' : '⏳'}</div>
            </div>
        `;
    }).join('');
    
    // Add reward button if all tasks complete
    if (allComplete && !dailyTasks.rewardsClaimed) {
        html += `
            <div class="task-reward-box">
                <div class="reward-box-icon">🎁</div>
                <h3>Tüm Görevler Tamamlandı!</h3>
                <p>Ödülünüzü almak için tıklayın</p>
                <button class="claim-reward-btn pulse" onclick="claimTaskRewards()">Ödülü Al 🎁</button>
            </div>
        `;
    } else if (dailyTasks.rewardsClaimed) {
        html += `
            <div class="task-reward-claimed">
                <div class="reward-claimed-icon">✨</div>
                <p>Bugünkü ödülünüz alındı!</p>
            </div>
        `;
    }
    
    tasksList.innerHTML = html;
    openModal('tasks-modal');
}

/**
 * Claim rewards for completing all daily tasks
 */
function claimTaskRewards() {
    if (dailyTasks.rewardsClaimed) {
        showToast('Bugünkü ödülünüzü zaten aldınız!', 'info');
        return;
    }
    
    const teachings = window.ISLAMIC_TEACHINGS || [];
    if (teachings.length === 0) {
        // Fallback
        const reward = 250;
        totalPoints += reward;
        dailyTasks.rewardsClaimed = true;
        showToast(`+${reward} Hasene kazandınız! 🎁`, 'success', 3000);
        updateStatsDisplay();
        debouncedSaveStats();
        closeModal('tasks-modal');
        return;
    }
    
    // Random teaching and reward
    const teaching = teachings[Math.floor(Math.random() * teachings.length)];
    const reward = teaching.rewardAmounts[Math.floor(Math.random() * teaching.rewardAmounts.length)];
    
    totalPoints += reward;
    dailyTasks.rewardsClaimed = true;
    
    // Show teaching modal
    showTeachingRewardModal(teaching, reward);
    
    updateStatsDisplay();
    debouncedSaveStats();
}

/**
 * Show Islamic teaching reward modal
 */
function showTeachingRewardModal(teaching, reward) {
    closeModal('tasks-modal');
    
    const modal = document.getElementById('daily-reward-modal');
    if (!modal) {
        showToast(`+${reward} Hasene! ${teaching.turkish}`, 'success', 4000);
        return;
    }
    
    document.getElementById('daily-reward-amount').textContent = reward;
    
    const streakEl = document.getElementById('daily-reward-streak');
    if (streakEl) {
        streakEl.innerHTML = `
            <div class="teaching-content">
                <div class="teaching-arabic">${teaching.arabic}</div>
                <div class="teaching-turkish">${teaching.turkish}</div>
                <div class="teaching-explanation">${teaching.explanation}</div>
            </div>
        `;
    }
    
    openModal('daily-reward-modal');
}

function showLevelUpModal(newLevel) {
    document.getElementById('new-level-display').textContent = `Seviye ${newLevel}`;
    document.getElementById('new-level-name').textContent = getLevelName(newLevel);
    openModal('level-up-modal');
}

function showAchievementModal(achievement) {
    // Simple toast for achievement
    showToast(`🏆 ${achievement.name} başarımı kazandınız!`, 'success', 3000);
}

// ========================================
// HARF TABLOSU (LETTER TABLE)
// ========================================

async function showHarfTablosu() {
    const data = await loadHarfData();
    
    if (data.length === 0) {
        showToast('Harf verisi yüklenemedi', 'error');
        return;
    }
    
    // Populate the harf grid
    const harfGrid = document.getElementById('harf-grid');
    if (harfGrid) {
        harfGrid.innerHTML = data.map(harf => {
            const renkKodu = harf.renkKodu || '#1a1a2e';
            const audioUrl = harf.audioUrl || '';
            const harfName = harf.isim || harf.okunus || harf.harf;
            
            return `
                <div class="harf-card" 
                     style="background-color: ${renkKodu};" 
                     onclick="playHarfAudio('${audioUrl.replace(/'/g, "\\'")}', '${harfName.replace(/'/g, "\\'")}')">
                    <div class="harf-arabic">${harf.harf}</div>
                    <div class="harf-name">${harfName}</div>
                </div>
            `;
        }).join('');
    }
    
    // Hide all screens and show Harf Tablosu
    hideAllScreens();
    document.getElementById('elif-ba-tablo-screen').classList.remove('hidden');
}

function playHarfAudio(audioUrl, harfName) {
    if (audioUrl && audioUrl.trim() !== '') {
        playSafeAudio(audioUrl);
    } else {
        showToast(`${harfName}`, 'info', 1000);
    }
}

// ========================================
// ROZET (BADGES) MODAL
// ========================================

let currentBadgeTab = 'badges';
let currentAsrTab = 'mekke';

function showBadgesModal() {
    currentBadgeTab = 'badges';
    currentAsrTab = 'mekke';
    
    renderNormalBadges();
    renderAsrSaadetBadges();
    renderAchievementsList();
    
    // Tab event listeners
    setupBadgeTabListeners();
    setupAsrTabListeners();
    
    // Show/hide correct content
    updateBadgeTabDisplay();
    
    openModal('badges-modal');
}

function setupBadgeTabListeners() {
    const tabs = document.querySelectorAll('.badge-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            currentBadgeTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateBadgeTabDisplay();
        };
    });
}

function setupAsrTabListeners() {
    const asrTabs = document.querySelectorAll('.asr-tab');
    asrTabs.forEach(tab => {
        tab.onclick = () => {
            currentAsrTab = tab.dataset.asrTab;
            asrTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateAsrTabDisplay();
        };
    });
}

function updateBadgeTabDisplay() {
    const badgesGrid = document.getElementById('badges-grid');
    const asrContainer = document.getElementById('asr-saadet-container');
    const achievementsList = document.getElementById('achievements-list');
    
    if (badgesGrid) badgesGrid.classList.toggle('hidden', currentBadgeTab !== 'badges');
    if (asrContainer) asrContainer.classList.toggle('hidden', currentBadgeTab !== 'asr-i-saadet');
    if (achievementsList) achievementsList.classList.toggle('hidden', currentBadgeTab !== 'achievements');
    
    if (currentBadgeTab === 'asr-i-saadet') {
        updateAsrTabDisplay();
    }
}

function updateAsrTabDisplay() {
    const grids = {
        'mekke': document.getElementById('mekke-grid'),
        'medine': document.getElementById('medine-grid'),
        'ilk-iki-halife': document.getElementById('ilk-iki-halife-grid'),
        'son-iki-halife': document.getElementById('son-iki-halife-grid')
    };
    
    Object.entries(grids).forEach(([key, grid]) => {
        if (grid) {
            grid.classList.toggle('hidden', key !== currentAsrTab);
            grid.classList.toggle('active', key === currentAsrTab);
        }
    });
}

function renderNormalBadges() {
    const badgesGrid = document.getElementById('badges-grid');
    const unlockedBadgesList = Object.keys(badgesUnlocked);
    
    if (badgesGrid) {
        const badges = window.BADGE_DEFINITIONS || [];
        badgesGrid.innerHTML = badges.map(badge => {
            const isUnlocked = unlockedBadgesList.includes(badge.id);
            const badgeImage = badge.image ? 
                `<img src="ASSETS/badges/${badge.image}" alt="${badge.name}" class="badge-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <span class="badge-icon-fallback" style="display:none;">${badge.icon || '🏅'}</span>` :
                `<span class="badge-icon-emoji">${badge.icon || '🏅'}</span>`;
            
            return `
                <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                     onclick="showBadgeDetail('${badge.id}', 'normal')">
                    <div class="badge-icon-container">
                        ${isUnlocked ? badgeImage : `<span class="badge-locked-icon">🔒</span>`}
                    </div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-threshold">${formatNumber(badge.threshold)} Hasene</div>
                </div>
            `;
        }).join('');
    }
}

function renderAsrSaadetBadges() {
    const asrBadges = window.ASR_I_SAADET_BADGES || {};
    const unlockedBadgesList = Object.keys(badgesUnlocked);
    
    const gridMapping = {
        'mekke': 'mekke-grid',
        'medine': 'medine-grid',
        'ilkIkiHalife': 'ilk-iki-halife-grid',
        'sonIkiHalife': 'son-iki-halife-grid'
    };
    
    Object.entries(asrBadges).forEach(([period, badges]) => {
        const gridId = gridMapping[period];
        const grid = document.getElementById(gridId);
        
        if (grid && badges) {
            grid.innerHTML = badges.map(badge => {
                const isUnlocked = unlockedBadgesList.includes(badge.id);
                const badgeImage = badge.image ? 
                    `<img src="ASSETS/badges/${badge.image}" alt="${badge.name}" onerror="this.outerHTML='<span class=\\'emoji\\'>🕌</span>';">` :
                    `<span class="emoji">🕌</span>`;
                
                return `
                    <div class="asr-badge-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                         onclick="showBadgeDetail('${badge.id}', 'asr')">
                        ${badge.year ? `<div class="asr-badge-year">${badge.year}</div>` : ''}
                        <div class="asr-badge-icon">
                            ${isUnlocked ? badgeImage : `<span class="emoji">🔒</span>`}
                        </div>
                        <div class="asr-badge-name">${badge.name}</div>
                        <div class="asr-badge-threshold">${formatNumber(badge.threshold)} Hasene</div>
                    </div>
                `;
            }).join('');
        }
    });
}

function renderAchievementsList() {
    const achievementsList = document.getElementById('achievements-list');
    if (achievementsList) {
        const achievements = window.ACHIEVEMENTS || [];
        achievementsList.innerHTML = achievements.map(ach => {
            const isUnlocked = achievementsData[ach.id];
            return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${isUnlocked ? ach.icon : '🔒'}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${ach.name}</div>
                        <div class="achievement-desc">${ach.description}</div>
                    </div>
                    <div class="achievement-status">${isUnlocked ? '✅' : ''}</div>
                </div>
            `;
        }).join('');
    }
}

function showBadgeDetail(badgeId, type = 'normal') {
    let badge = null;
    
    if (type === 'asr') {
        // Search in Asr-ı Saadet badges
        const asrBadges = window.ASR_I_SAADET_BADGES || {};
        for (const period in asrBadges) {
            const found = asrBadges[period].find(b => b.id === badgeId);
            if (found) {
                badge = found;
                break;
            }
        }
    } else {
        // Search in normal badges
        const badges = window.BADGE_DEFINITIONS || [];
        badge = badges.find(b => b.id === badgeId);
    }
    
    const isUnlocked = badgesUnlocked[badgeId];
    
    if (badge) {
        const iconContainer = document.getElementById('badge-detail-icon');
        if (isUnlocked && badge.image) {
            iconContainer.innerHTML = `<img src="ASSETS/badges/${badge.image}" alt="${badge.name}" class="badge-detail-img" onerror="this.outerHTML='${badge.icon || '🏅'}';">`;
        } else {
            iconContainer.textContent = isUnlocked ? (badge.icon || '🏅') : '🔒';
        }
        
        document.getElementById('badge-detail-name').textContent = badge.name;
        
        // Description - for Asr-ı Saadet badges include year
        let description = badge.description;
        if (type === 'asr' && badge.year) {
            description = `📅 ${badge.year}\n\n${description}`;
        }
        document.getElementById('badge-detail-description').textContent = description;
        
        const statusEl = document.getElementById('badge-detail-status');
        if (isUnlocked) {
            statusEl.textContent = `✅ Kazanıldı: ${badgesUnlocked[badgeId]}`;
            statusEl.className = 'badge-detail-status unlocked';
        } else {
            const remaining = badge.threshold - totalPoints;
            statusEl.textContent = remaining > 0 ? 
                `🔒 ${formatNumber(remaining)} Hasene daha kazan` : 
                'Henüz kazanılmadı';
            statusEl.className = 'badge-detail-status locked';
        }
        
        openModal('badge-detail-modal');
    }
}

// ========================================
// TAKVIM (CALENDAR) MODAL
// ========================================

function showCalendarModal() {
    const calendarGrid = document.getElementById('calendar-grid');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Day names
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    
    // Generate calendar
    let html = '<div class="calendar-header">';
    html += `<span>${today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>`;
    html += '</div>';
    
    html += '<div class="calendar-days">';
    dayNames.forEach(day => {
        html += `<div class="calendar-day-name">${day}</div>`;
    });
    html += '</div>';
    
    html += '<div class="calendar-dates">';
    
    // Empty cells for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
        html += '<div class="calendar-date empty"></div>';
    }
    
    // Days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isPlayed = streakData.playDates && streakData.playDates.includes(dateStr);
        const isToday = day === today.getDate();
        
        html += `
            <div class="calendar-date ${isPlayed ? 'played' : ''} ${isToday ? 'today' : ''}">
                ${day}
                ${isPlayed ? '<span class="played-dot"></span>' : ''}
            </div>
        `;
    }
    
    html += '</div>';
    
    if (calendarGrid) {
        calendarGrid.innerHTML = html;
    }
    
    // Update streak info
    const currentStreakEl = document.getElementById('calendar-current-streak');
    const bestStreakEl = document.getElementById('calendar-best-streak');
    const totalDaysEl = document.getElementById('calendar-total-days');
    
    if (currentStreakEl) currentStreakEl.textContent = streakData.currentStreak || 0;
    if (bestStreakEl) bestStreakEl.textContent = streakData.bestStreak || 0;
    if (totalDaysEl) totalDaysEl.textContent = streakData.totalPlayDays || 0;
    
    openModal('calendar-modal');
}

// ========================================
// ONBOARDING
// ========================================

function showOnboarding() {
    onboardingSlideIndex = 0;
    updateOnboardingSlide();
    openModal('onboarding-modal');
}

function updateOnboardingSlide() {
    const slides = window.ONBOARDING_SLIDES || [];
    if (slides.length === 0) return;
    
    const slide = slides[onboardingSlideIndex];
    
    document.getElementById('onboarding-icon').textContent = slide.icon || '📱';
    document.getElementById('onboarding-title').textContent = slide.title || '';
    document.getElementById('onboarding-text').textContent = slide.description || slide.text || '';
    
    // Update dots
    const dotsContainer = document.getElementById('onboarding-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, i) => 
            `<span class="onboarding-dot ${i === onboardingSlideIndex ? 'active' : ''}"></span>`
        ).join('');
    }
    
    // Update buttons
    const prevBtn = document.getElementById('onboarding-prev');
    const nextBtn = document.getElementById('onboarding-next');
    
    if (prevBtn) prevBtn.style.visibility = onboardingSlideIndex === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = onboardingSlideIndex === slides.length - 1 ? 'Başla!' : 'İleri →';
}

function nextOnboardingSlide() {
    const slides = window.ONBOARDING_SLIDES || [];
    
    if (onboardingSlideIndex < slides.length - 1) {
        onboardingSlideIndex++;
        updateOnboardingSlide();
    } else {
        // Finish onboarding
        closeModal('onboarding-modal');
        localStorage.setItem('hasene_onboarding_complete', 'true');
    }
}

function prevOnboardingSlide() {
    if (onboardingSlideIndex > 0) {
        onboardingSlideIndex--;
        updateOnboardingSlide();
    }
}

// ========================================
// DAILY REWARD
// ========================================

function showDailyReward() {
    const today = getLocalDateString();
    const lastReward = localStorage.getItem('hasene_last_daily_reward');
    
    if (lastReward === today) {
        showToast('Bugünkü ödülünüzü zaten aldınız!', 'info');
        return;
    }
    
    // Calculate streak bonus
    const streakBonus = Math.min(streakData.currentStreak * 5, 50);
    const baseReward = 20;
    const totalReward = baseReward + streakBonus;
    
    document.getElementById('daily-reward-amount').textContent = totalReward;
    document.getElementById('daily-reward-streak').textContent = 
        streakBonus > 0 ? `+${streakBonus} seri bonusu dahil!` : '';
    
    openModal('daily-reward-modal');
}

// Eski günlük ödül fonksiyonu - artık kullanılmıyor, yeni sistem claimDailyReward() kullanıyor
// Bu fonksiyon sadece eski modal için tutuluyor, ama artık çağrılmıyor
function claimDailyRewardOld() {
    const today = getLocalDateString();
    const streakBonus = Math.min(streakData.currentStreak * 5, 50);
    const baseReward = 20;
    const totalReward = baseReward + streakBonus;
    
    totalPoints += totalReward;
    localStorage.setItem('hasene_last_daily_reward', today);
    
    closeModal('daily-reward-modal');
    showToast(`+${totalReward} Hasene kazandınız! 🎁`, 'success', 2000);
    updateStatsDisplay();
    debouncedSaveStats();
}

// ========================================
// ACHIEVEMENTS MODAL
// ========================================

/**
 * Render achievements list in badges modal
 */
function renderAchievementsList() {
    const achievementsList = document.getElementById('achievements-list');
    const achievements = window.ACHIEVEMENTS || [];
    
    if (!achievementsList || achievements.length === 0) return;
    
    // Calculate current stats for achievement progress
    const stars = calculateStars(totalPoints);
    const currentStats = {
        stars,
        bestStreak: streakData.bestStreak || 0,
        totalCorrect: gameStats.totalCorrect || 0,
        perfectLessons: gameStats.perfectLessons || 0
    };
    
    // Sort: unlocked first, then by progress
    const sortedAchievements = [...achievements].sort((a, b) => {
        const aUnlocked = unlockedAchievements.includes(a.id);
        const bUnlocked = unlockedAchievements.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });
    
    achievementsList.innerHTML = sortedAchievements.map(ach => {
        const isUnlocked = unlockedAchievements.includes(ach.id);
        const icon = ach.name.match(/[\p{Emoji}]/u)?.[0] || '⭐';
        
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${isUnlocked ? icon : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.description}</div>
                </div>
                <div class="achievement-status">${isUnlocked ? '✓' : ''}</div>
            </div>
        `;
    }).join('');
}

function showAchievementsModal() {
    renderAchievementsList();
    openModal('badges-modal');
    // Switch to achievements tab
    document.querySelectorAll('.badge-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.badge-tab[data-tab="achievements"]')?.classList.add('active');
    document.getElementById('badges-grid')?.classList.add('hidden');
    document.getElementById('achievements-list')?.classList.remove('hidden');
}

// ========================================
// KARMA OYUN MODU (Mixed Game Mode)
// ========================================

// Karma oyun değişkenleri
let karmaQuestions = [];
let karmaQuestionIndex = 0;
let karmaMatchPairs = [];

/**
 * Start Karma (Mixed) Game Mode
 * Combines all game types: Kelime Çevir, Dinle Bul, Eşleştirme, Boşluk Doldur
 */
async function startKarmaGame() {
    console.log('🎲 Karma Oyun başlatılıyor...');
    
    // Reset session
    sessionScore = 0;
    questionIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    comboCount = 0;
    maxCombo = 0;
    karmaQuestionIndex = 0;
    karmaQuestions = [];
    
    // Load all necessary data
    const [kelimeData, ayetData, harfData] = await Promise.all([
        loadKelimeData(),
        loadAyetData(),
        loadHarfData()
    ]);
    
    if (kelimeData.length === 0) {
        showToast('Veri yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Generate mixed questions (15 total)
    const questionCount = 15;
    
    // 1. Kelime Çevir soruları (4 adet)
    const kelimeQuestions = getRandomItems(kelimeData, 4).map(word => ({
        type: 'kelime-cevir',
        data: word,
        question: word.kelime,
        correctAnswer: word.anlam,
        options: generateOptions(word.anlam, kelimeData.map(w => w.anlam))
    }));
    
    // 2. Dinle Bul soruları (3 adet)
    const audioWords = kelimeData.filter(w => w.ses_dosyasi);
    const dinleQuestions = getRandomItems(audioWords, 3).map(word => ({
        type: 'dinle-bul',
        data: word,
        question: '🔊 Dinle ve doğru anlamı seç',
        audioUrl: word.ses_dosyasi,
        correctAnswer: word.anlam,
        options: generateOptions(word.anlam, kelimeData.map(w => w.anlam))
    }));
    
    // 3. Eşleştirme sorusu (2 adet - her biri 4 çift)
    const matchQuestions = [];
    for (let i = 0; i < 2; i++) {
        const matchWords = getRandomItems(kelimeData, 4);
        matchQuestions.push({
            type: 'eslestirme',
            pairs: matchWords.map(w => ({
                arabic: w.kelime,
                turkish: w.anlam,
                id: w.id,
                audioUrl: w.ses_dosyasi || w.audioUrl || ''
            }))
        });
    }
    
    // 4. Boşluk Doldur soruları (3 adet)
    const suitableAyets = ayetData.filter(a => {
        const words = (a.ayet_metni || '').split(' ').filter(w => w.length > 1);
        return words.length >= 3;
    });
    const boslukQuestions = getRandomItems(suitableAyets, 3).map(ayet => {
        const words = ayet.ayet_metni.split(' ').filter(w => w.length > 1);
        const blankIndex = Math.floor(Math.random() * words.length);
        const correctWord = words[blankIndex];
        const displayWords = [...words];
        displayWords[blankIndex] = '____';
        
        return {
            type: 'bosluk-doldur',
            data: ayet,
            question: displayWords.join(' '),
            translation: ayet.meal,
            correctAnswer: correctWord,
            options: generateOptions(correctWord, words.filter((w, i) => i !== blankIndex))
        };
    });
    
    // 5. Harf soruları (3 adet)
    const harfQuestions = getRandomItems(
        harfData.filter(h => h && h.harf && h.okunus), // Sadece geçerli harfler
        3
    ).map(harf => ({
        type: 'harf-bul',
        data: harf,
        question: harf.harf,
        correctAnswer: harf.okunus || '',
        options: generateOptions(
            harf.okunus || '', 
            harfData.filter(h => h && h.okunus).map(h => h.okunus)
        )
    }));
    
    // 6. Bağlamsal Öğrenme soruları (3 adet)
    const baglamsalQuestions = [];
    const suitableAyetsForBaglamsal = ayetData.filter(a => {
        const words = (a.ayet_metni || '').split(' ').filter(w => w.length > 2);
        return words.length >= 3 && a.meal && a.meal.length > 10;
    });
    
    const selectedAyets = getRandomItems(suitableAyetsForBaglamsal, 3);
    
    for (const ayet of selectedAyets) {
        const ayetWords = ayet.ayet_metni.split(' ').filter(w => w.length > 2);
        
        // Ayet içindeki kelimeleri kelimeData'da ara
        const foundWords = [];
        for (const ayetWord of ayetWords) {
            // Kelime verisinde bu kelimeyi ara (basit eşleşme)
            const matchedWord = kelimeData.find(k => {
                // Arapça kelimelerde harekeleri temizle ve karşılaştır
                const cleanAyetWord = ayetWord.replace(/[\u064E\u0650\u064F\u0652\u0651\u064B\u064D\u064C]/g, '').trim();
                const cleanKelime = k.kelime.replace(/[\u064E\u0650\u064F\u0652\u0651\u064B\u064D\u064C]/g, '').trim();
                return cleanKelime === cleanAyetWord || k.kelime === ayetWord;
            });
            
            if (matchedWord && matchedWord.anlam) {
                foundWords.push({
                    kelime: matchedWord.kelime,
                    anlam: matchedWord.anlam,
                    original: ayetWord
                });
            }
        }
        
        if (foundWords.length > 0) {
            const selectedWord = getRandomItems(foundWords, 1)[0];
            const wrongAnswers = kelimeData
                .filter(k => k.anlam && k.anlam !== selectedWord.anlam)
                .map(k => k.anlam);
            
            baglamsalQuestions.push({
                type: 'baglamsal-ogrenme',
                data: ayet,
                ayetMetni: ayet.ayet_metni,
                ayetMeal: ayet.meal,
                sureAdi: ayet.sure_adı || ayet.sureAdi || '',
                audioUrl: ayet.ayet_ses_dosyasi || ayet.audioUrl || '',
                questionWord: selectedWord.original,
                correctAnswer: selectedWord.anlam,
                options: generateOptions(selectedWord.anlam, wrongAnswers)
            });
        }
    }
    
    // Combine and shuffle all questions
    karmaQuestions = shuffleArray([
        ...kelimeQuestions,
        ...dinleQuestions,
        ...matchQuestions,
        ...boslukQuestions,
        ...harfQuestions,
        ...baglamsalQuestions
    ]);
    
    console.log(`🎲 ${karmaQuestions.length} karma soru oluşturuldu`);
    
    // Show karma game screen
    hideAllScreens();
    document.getElementById('karma-game-screen').classList.remove('hidden');
    document.getElementById('karma-total-questions').textContent = karmaQuestions.length;
    
    // Load first question
    loadKarmaQuestion();
}

/**
 * Generate 4 options including the correct answer
 */
function generateOptions(correctAnswer, allAnswers) {
    // Filter out undefined/null/empty values
    const cleanAllAnswers = (allAnswers || []).filter(a => a != null && a !== '' && typeof a === 'string');
    const cleanCorrectAnswer = correctAnswer != null && correctAnswer !== '' ? String(correctAnswer) : '';
    
    if (!cleanCorrectAnswer) {
        return [];
    }
    
    const uniqueAnswers = [...new Set(cleanAllAnswers.filter(a => a !== cleanCorrectAnswer))];
    const wrongAnswers = getRandomItems(uniqueAnswers, 3);
    return shuffleArray([cleanCorrectAnswer, ...wrongAnswers]).filter(opt => opt != null && opt !== '');
}

/**
 * Load current karma question
 */
function loadKarmaQuestion() {
    if (karmaQuestionIndex >= karmaQuestions.length) {
        endGame();
        return;
    }
    
    const question = karmaQuestions[karmaQuestionIndex];
    
    // Update progress
    document.getElementById('karma-question-number').textContent = karmaQuestionIndex + 1;
    document.getElementById('karma-combo').textContent = comboCount;
    document.getElementById('karma-session-score').textContent = formatNumber(sessionScore);
    
    // Get question container
    const container = document.getElementById('karma-question-container');
    
    // Render based on question type
    switch (question.type) {
        case 'kelime-cevir':
            renderKelimeCevirKarma(container, question);
            break;
        case 'dinle-bul':
            renderDinleBulKarma(container, question);
            break;
        case 'eslestirme':
            renderEslestirmeKarma(container, question);
            break;
        case 'bosluk-doldur':
            renderBoslukDoldurKarma(container, question);
            break;
        case 'harf-bul':
            renderHarfBulKarma(container, question);
            break;
        case 'baglamsal-ogrenme':
            renderBaglamsalOgrenmeKarma(container, question);
            break;
    }
}

function renderKelimeCevirKarma(container, question) {
    const validOptions = (question.options || []).filter(opt => opt != null && opt !== '');
    
    if (validOptions.length === 0) {
        container.innerHTML = '<div class="error-message">Soru yüklenemedi</div>';
        return;
    }
    
    const audioUrl = question.data?.ses_dosyasi || question.data?.audioUrl || question.audioUrl || '';
    
    container.innerHTML = `
        <div style="position: relative;">
            <div class="karma-type-badge">📝 Kelime Çevir</div>
            ${audioUrl ? `
                <button class="karma-audio-btn-top" onclick="playSafeAudio('${audioUrl.replace(/'/g, "\\'")}')" title="Dinle">🔊</button>
            ` : ''}
        </div>
        <p class="karma-instruction">Arapça kelimenin Türkçe karşılığını seç</p>
        <div class="karma-arabic">${question.question || ''}</div>
        <div class="karma-info">${question.data?.sure_adi || ''}</div>
        <div class="karma-options">
            ${validOptions.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${String(opt || '').replace(/'/g, "\\'")}', '${String(question.correctAnswer || '').replace(/'/g, "\\'")}')">
                    ${opt || ''}
                </button>
            `).join('')}
        </div>
    `;
}

function renderDinleBulKarma(container, question) {
    const validOptions = (question.options || []).filter(opt => opt != null && opt !== '');
    
    if (validOptions.length === 0) {
        container.innerHTML = '<div class="error-message">Soru yüklenemedi</div>';
        return;
    }
    
    container.innerHTML = `
        <div style="position: relative;">
            <div class="karma-type-badge">🎧 Dinle Bul</div>
            ${question.audioUrl ? `
                <button class="karma-audio-btn-top" onclick="playSafeAudio('${(question.audioUrl || '').replace(/'/g, "\\'")}')" title="Dinle">🔊</button>
            ` : ''}
        </div>
        <p class="karma-instruction">Kelimeyi dinle ve doğru çeviriyi bul</p>
        <div class="karma-options">
            ${validOptions.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${String(opt || '').replace(/'/g, "\\'")}', '${String(question.correctAnswer || '').replace(/'/g, "\\'")}')">
                    ${opt || ''}
                </button>
            `).join('')}
        </div>
    `;
}

function renderEslestirmeKarma(container, question) {
    // Reset match state
    karmaMatchPairs = question.pairs.map(p => ({ ...p, matched: false }));
    karmaSelectedItem = null;
    karmaMatchedCount = 0;
    
    const arabicItems = shuffleArray([...question.pairs]);
    const turkishItems = shuffleArray([...question.pairs]);
    
    container.innerHTML = `
        <div style="position: relative;">
            <div class="karma-type-badge">🔗 Eşleştir</div>
        </div>
        <p class="karma-instruction">Arapça kelimeleri Türkçe anlamlarıyla eşleştir</p>
        <div class="karma-match-grid">
            <div class="match-column arabic-column">
                ${arabicItems.map(p => `
                    <button class="match-item arabic" data-id="${p.id}" data-audio="${(p.audioUrl || '').replace(/"/g, '&quot;')}" onclick="selectKarmaMatch(this, 'arabic', '${p.id}')">
                        ${p.arabic}
                    </button>
                `).join('')}
            </div>
            <div class="match-column turkish-column">
                ${turkishItems.map(p => `
                    <button class="match-item turkish" data-id="${p.id}" onclick="selectKarmaMatch(this, 'turkish', '${p.id}')">
                        ${p.turkish}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

let karmaSelectedItem = null;
let karmaMatchedCount = 0;

function selectKarmaMatch(element, type, id) {
    if (element.classList.contains('matched')) return;
    
    // Arapça kelime tıklandığında ses çal
    if (type === 'arabic') {
        const audioUrl = element.getAttribute('data-audio');
        if (audioUrl) {
            playSafeAudio(audioUrl);
        }
    }
    
    if (!karmaSelectedItem) {
        // First selection
        karmaSelectedItem = { element, type, id };
        element.classList.add('selected');
    } else if (karmaSelectedItem.type === type) {
        // Same column - switch selection
        karmaSelectedItem.element.classList.remove('selected');
        karmaSelectedItem = { element, type, id };
        element.classList.add('selected');
    } else {
        // Different column - check match
        // İkinci seçim yapılmadan önce, tıklanan butona selected ekleme (sadece kontrol için)
        element.classList.remove('selected'); // Eğer varsa kaldır
        
        if (karmaSelectedItem.id === id) {
            // Correct match!
            karmaSelectedItem.element.classList.remove('selected');
            karmaSelectedItem.element.classList.add('matched', 'correct');
            element.classList.add('matched', 'correct');
            karmaMatchedCount++;
            
            comboCount++;
            const points = 25 + (comboCount * 5);
            sessionScore += points;
            
            // Check if all matched
            if (karmaMatchedCount >= 4) {
                correctCount++;
                maxCombo = Math.max(maxCombo, comboCount);
                karmaMatchedCount = 0;
                setTimeout(() => {
                    karmaQuestionIndex++;
                    loadKarmaQuestion();
                }, 1000);
            }
        } else {
            // Wrong match
            karmaSelectedItem.element.classList.remove('selected');
            karmaSelectedItem.element.classList.add('wrong');
            element.classList.remove('selected'); // Türkçe butondan da selected kaldır
            element.classList.add('wrong');
            comboCount = 0;
            
            setTimeout(() => {
                karmaSelectedItem.element.classList.remove('wrong', 'selected');
                element.classList.remove('wrong', 'selected');
                karmaSelectedItem = null;
            }, 500);
            return; // Don't reset karmaSelectedItem here, wait for timeout
        }
        karmaSelectedItem = null;
    }
}

function renderBoslukDoldurKarma(container, question) {
    const validOptions = (question.options || []).filter(opt => opt != null && opt !== '');
    
    if (validOptions.length === 0) {
        container.innerHTML = '<div class="error-message">Soru yüklenemedi</div>';
        return;
    }
    
    const audioUrl = question.data?.ayet_ses_dosyasi || question.data?.audioUrl || question.audioUrl || '';
    
    container.innerHTML = `
        <div style="position: relative;">
            <div class="karma-type-badge">📖 Boşluk Doldur</div>
            ${audioUrl ? `
                <button class="karma-audio-btn-top" onclick="playSafeAudio('${audioUrl.replace(/'/g, "\\'")}')" title="Dinle">🔊</button>
            ` : ''}
        </div>
        <p class="karma-instruction">Boşluğa uygun kelimeyi seç</p>
        <div class="karma-arabic bosluk">${question.question || ''}</div>
        <div class="karma-translation">${question.translation || ''}</div>
        <div class="karma-options">
            ${validOptions.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${String(opt || '').replace(/'/g, "\\'")}', '${String(question.correctAnswer || '').replace(/'/g, "\\'")}')">
                    ${opt || ''}
                </button>
            `).join('')}
        </div>
    `;
}

function renderHarfBulKarma(container, question) {
    // Filter out undefined/null options
    const validOptions = (question.options || []).filter(opt => opt != null && opt !== '');
    
    if (validOptions.length === 0) {
        container.innerHTML = '<div class="error-message">Soru yüklenemedi</div>';
        return;
    }
    
    const audioUrl = question.data?.audioUrl || question.audioUrl || '';
    
    container.innerHTML = `
        <div style="position: relative;">
            <div class="karma-type-badge">🔤 Harf Bul</div>
            ${audioUrl ? `
                <button class="karma-audio-btn-top" onclick="playSafeAudio('${audioUrl.replace(/'/g, "\\'")}')" title="Dinle">🔊</button>
            ` : ''}
        </div>
        <p class="karma-instruction">Bu harfin okunuşunu seç</p>
        <div class="karma-arabic harf">${question.question || ''}</div>
        <div class="karma-options">
            ${validOptions.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${String(opt || '').replace(/'/g, "\\'")}', '${String(question.correctAnswer || '').replace(/'/g, "\\'")}')">
                    ${opt || ''}
                </button>
            `).join('')}
        </div>
    `;
}

function renderBaglamsalOgrenmeKarma(container, question) {
    const validOptions = (question.options || []).filter(opt => opt != null && opt !== '');
    
    if (validOptions.length === 0) {
        container.innerHTML = '<div class="error-message">Soru yüklenemedi</div>';
        return;
    }
    
    container.innerHTML = `
        <div style="position: relative;">
            <div class="karma-type-badge">📚 Bağlamsal Öğrenme</div>
            ${question.audioUrl ? `
                <button class="karma-audio-btn-top" onclick="playSafeAudio('${(question.audioUrl || '').replace(/'/g, "\\'")}')" title="Dinle">🔊</button>
            ` : ''}
        </div>
        <div class="karma-baglamsal-question">
            <p>Aşağıdaki cümlede <strong>"${question.questionWord || ''}"</strong> kelimesinin anlamı nedir?</p>
        </div>
        <div class="karma-ayet-container">
            <div class="karma-ayet-arabic">${question.ayetMetni || ''}</div>
            <div class="karma-ayet-meal">${question.ayetMeal || ''}</div>
        </div>
        <div class="karma-options">
            ${validOptions.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${String(opt || '').replace(/'/g, "\\'")}', '${String(question.correctAnswer || '').replace(/'/g, "\\'")}')">
                    ${opt || ''}
                </button>
            `).join('')}
        </div>
    `;
}

/**
 * Show Elif Ba info modal with detailed explanation
 */
function showElifBaInfo() {
    const infoData = {
        'fetha': {
            title: 'Üstün Hakkında',
            content: 'Harfin üzerine gelen bu işaret ince harfleri "e" sesi ile, kalın okunan harfleriyse "a" sesi ile okutur. İnce harflerden ع – ر – ح üstünlü olduğu zaman a sesiyle okunur.'
        },
        'esre': {
            title: 'Esre Hakkında',
            content: 'Harfin altına gelen bu işaret ince harfleri "i" sesi ile, kalın okunan harfleriyse "ı" sesi ile okutur.'
        },
        'otre': {
            title: 'Ötre Hakkında',
            content: 'Harfin üstüne gelen bu işaret ince harfleri "u" ile "ü" sesi arasında bir sesle, kalın okunan harfleriyse "u" sesi ile okutur.'
        },
        'sedde': {
            title: 'Şedde Hakkında',
            content: 'Şedde, üzerinde bulunduğu harfin iki defa okunmasını sağlar. Yani, birinci defa cezimli, ikinci defa ise kendi harekesi gibi okutur.'
        },
        'cezm': {
            title: 'Cezm Hakkında',
            content: 'Cezm üzerinde bulunduğu harfi kendinden önceki harekeli harfe bağlar.'
        },
        'tenvin': {
            title: 'Tenvin Hakkında',
            content: 'Tenvin bir harfin sesine "n" sesi ilave etmektir. Kalın harfleri okurken harfin kendisi kalın, tenvini ince okunur. Sadece kelimelerin son harfinin üstünde görülen Tenvin\'e aynı zamanda iki üstün, iki esre ve iki ötre de denilmektedir.'
        },
        'harekeler': {
            title: 'Harekeler Hakkında',
            content: 'Harekeler, Arapça harflerin üzerine veya altına konulan işaretlerdir. Üstün, esre, ötre, cezm ve şedde olmak üzere beş temel hareke vardır. Her hareke harfin okunuşunu değiştirir.'
        },
        'tablo': {
            title: 'Harf Tablosu Hakkında',
            content: 'Arapça harflerin yazılışı ve okunuşu. Her harfin başta, ortada ve sonda yazılış şekilleri farklıdır.'
        },
        'uc-harfli-kelimeler': {
            title: 'Üç Harfli Kelimeler Hakkında',
            content: 'Üç harfli Arapça kelimeleri gör ve okunuşlarını öğren. Bu mod, temel kelime yapılarını öğrenmek için idealdir.'
        },
        'uzatma-med': {
            title: 'Uzatma (Med) Harfleri Hakkında',
            content: '<div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(157, 138, 255, 0.1); border-radius: 12px; border-left: 4px solid var(--accent-primary);"><div style="text-align: center; margin-bottom: 0.75rem;"><img src="ASSETS/elifba-cover/uzatma-elif.png" alt="Harekesiz Elif" style="max-width: 100%; height: auto; max-height: 120px; object-fit: contain;" onerror="this.style.display=\'none\'"></div><p style="margin: 0; line-height: 1.6;"><strong style="color: var(--accent-primary);">Harekesiz Elif:</strong> Üstünlü bir harften sonra görebileceğimiz harekesiz Elif harfi kendinden önce gelen harfi bir elif miktarı uzatır. Harekesiz Elif, kalın harfleri a sesiyle, ince okunan harfleri ise e ile a arası bir sesle uzatarak okutur.</p></div>\n\n<div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(157, 138, 255, 0.1); border-radius: 12px; border-left: 4px solid var(--accent-primary);"><div style="text-align: center; margin-bottom: 0.75rem;"><img src="ASSETS/elifba-cover/uzatma-vav.png" alt="Harekesiz Vav" style="max-width: 100%; height: auto; max-height: 120px; object-fit: contain;" onerror="this.style.display=\'none\'"></div><p style="margin: 0; line-height: 1.6;"><strong style="color: var(--accent-primary);">Harekesiz Vav:</strong> Vav harekesiz ise ve kendinden önce gelen harfin harekesi ötre ise kendinden önce gelen harfi bir elif miktarı uzatır. Harekesiz Vav, kalın okunan harfleri u sesiyle, ince okunan harfleriyse u ile ü arasında bir sesle uzatarak okutur.</p></div>\n\n<div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(157, 138, 255, 0.1); border-radius: 12px; border-left: 4px solid var(--accent-primary);"><div style="text-align: center; margin-bottom: 0.75rem;"><img src="ASSETS/elifba-cover/uzatma-ya.png" alt="Harekesiz Ya" style="max-width: 100%; height: auto; max-height: 120px; object-fit: contain;" onerror="this.style.display=\'none\'"></div><p style="margin: 0; line-height: 1.6;"><strong style="color: var(--accent-primary);">Harekesiz Ya:</strong> Ya harfi harekesiz ise ve kendinden önce gelen harfin harekesi esre ise kendinden önce gelen harfi bir elif miktarı uzatır. Harekesiz Ya, kalın okunan harfleri ı\'dan i\'ye geçen bir sesle, ince okunan harfleriyse i sesiyle uzatarak okutur.</p></div>\n\n<div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(157, 138, 255, 0.1); border-radius: 12px; border-left: 4px solid var(--accent-primary);"><div style="text-align: center; margin-bottom: 0.75rem;"><img src="ASSETS/elifba-cover/uzatma-ceker.png" alt="Çeker" style="max-width: 100%; height: auto; max-height: 120px; object-fit: contain;" onerror="this.style.display=\'none\'"></div><p style="margin: 0; line-height: 1.6;"><strong style="color: var(--accent-primary);">Çeker (Dik Çizgi):</strong> Harfin üzerine veya altına (Çeker) gelen dik çizgi harfi bir elif miktarı uzatır. Harfin üzerindeki dik çizgi kalın okunan harfleri a sesiyle, ince okunan harfleriyse a ile e arasında bir sesle uzatarak okutur.</p></div>\n\n<div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(157, 138, 255, 0.1); border-radius: 12px; border-left: 4px solid var(--accent-primary);"><div style="text-align: center; margin-bottom: 0.75rem;"><img src="ASSETS/elifba-cover/uzatma-yatay-cizgi.png" alt="Yatay Çizgi" style="max-width: 100%; height: auto; max-height: 120px; object-fit: contain;" onerror="this.style.display=\'none\'"></div><p style="margin: 0; line-height: 1.6;"><strong style="color: var(--accent-primary);">Yatay Çizgi:</strong> Harfin üzerine gelen yatay çizgi, harfi bir elif miktarından fazla uzatır. Yatay çizginin bulunduğu harfler en fazla dört elif miktarı uzatılır.</p></div>'
        }
    };
    
    const submode = currentElifBaSubmode || 'harfler';
    const info = infoData[submode] || {
        title: 'Bilgi',
        content: 'Bu mod hakkında bilgi bulunmamaktadır.'
    };
    
    document.getElementById('elif-info-title').textContent = info.title;
    const contentElement = document.getElementById('elif-info-content');
    
    // Check if content contains HTML (for uzatma-med with Arabic examples)
    if (info.content.includes('<div') || info.content.includes('<strong>')) {
        contentElement.innerHTML = info.content;
    } else {
        // Use textContent for plain text with line breaks
        contentElement.textContent = info.content;
        contentElement.style.whiteSpace = 'pre-line'; // Preserve line breaks from \n
    }
    
    openModal('elif-ba-info-modal');
}

/**
 * Check karma answer
 */
function checkKarmaAnswer(selected, correct) {
    // Stop all audio immediately when answer is clicked
    stopAllAudio();
    
    const buttons = document.querySelectorAll('#karma-question-container .answer-option');
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    // Highlight correct answer
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correct) {
            btn.classList.add('correct');
        }
    });
    
    const question = karmaQuestions[karmaQuestionIndex];
    const wordId = question.data?.id;
    
    if (selected === correct) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const basePoints = getBasePoints(currentDifficulty);
        const gained = basePoints + (comboCount * CONFIG.COMBO_BONUS_PER_CORRECT);
        sessionScore += gained;
        
        if (wordId) updateWordStats(wordId, true);
    } else {
        wrongCount++;
        comboCount = 0;
        
        // Find and highlight wrong
        buttons.forEach(btn => {
            if (btn.textContent.trim() === selected) {
                btn.classList.add('wrong');
            }
        });
        
        if (wordId) updateWordStats(wordId, false);
    }
    
    // Next question
    setTimeout(() => {
        karmaQuestionIndex++;
        loadKarmaQuestion();
    }, 1200);
}

// ========================================
// INITIALIZE ON LOAD
// ========================================

window.addEventListener('load', initApp);

// Make functions globally available
if (typeof window !== 'undefined') {
    window.goToMainMenu = goToMainMenu;
    window.playAgain = playAgain;
    window.closeResultAndGoHome = closeResultAndGoHome;
    window.showStatsModal = showStatsModal;
    window.showTasksModal = showTasksModal;
    window.showGoalSettings = showGoalSettings;
    window.startGame = startGame;
    window.checkKelimeAnswer = checkKelimeAnswer;
    window.checkDinleAnswer = checkDinleAnswer;
    window.checkBoslukAnswer = checkBoslukAnswer;
    window.checkElifAnswer = checkElifAnswer;
    window.checkElifKelimelerAnswer = checkElifKelimelerAnswer;
    window.checkElifHarekelerAnswer = checkElifHarekelerAnswer;
    window.checkElifFethaAnswer = checkElifFethaAnswer;
    window.checkElifEsreAnswer = checkElifEsreAnswer;
    window.checkElifOtreAnswer = checkElifOtreAnswer;
    window.checkUcHarfliKelimelerAnswer = checkUcHarfliKelimelerAnswer;
    window.checkSeddeAnswer = checkSeddeAnswer;
    window.checkCezmAnswer = checkCezmAnswer;
    window.checkUzatmaMedAnswer = checkUzatmaMedAnswer;
    window.toggleCurrentWordFavorite = toggleCurrentWordFavorite;
    window.showHarfTablosu = showHarfTablosu;
    window.playHarfAudio = playHarfAudio;
    window.showBadgesModal = showBadgesModal;
    window.showBadgeDetail = showBadgeDetail;
    window.showCalendarModal = showCalendarModal;
    window.showOnboarding = showOnboarding;
    window.nextOnboardingSlide = nextOnboardingSlide;
    window.prevOnboardingSlide = prevOnboardingSlide;
    window.showDailyReward = showDailyReward;
    // claimDailyReward zaten yukarıda tanımlı (günlük görevler sistemi için)
    // window.claimDailyReward = claimDailyReward; // Bu satır kaldırıldı - çakışmayı önlemek için
    window.showAchievementsModal = showAchievementsModal;
    window.goToKelimeSubmodes = goToKelimeSubmodes;
    window.goToElifBaSubmodes = goToElifBaSubmodes;
    window.handleGameBackButton = handleGameBackButton;
    window.startKelimeCevirGame = startKelimeCevirGame;
    window.startElifBaGame = startElifBaGame;
    window.hideAllScreens = hideAllScreens;
    window.checkBadges = checkBadges;
    window.showWordAnalysisModal = showWordAnalysisModal;
    window.getWordAnalysis = getWordAnalysis;
    window.getStrugglingWords = getStrugglingWords;
    window.getLearningWords = getLearningWords;
    window.getMasteredWords = getMasteredWords;
    window.switchWordCategory = switchWordCategory;
    window.selectIntelligentWords = selectIntelligentWords;
    window.renderAchievementsList = renderAchievementsList;
    window.startKarmaGame = startKarmaGame;
    window.checkKarmaAnswer = checkKarmaAnswer;
    window.selectKarmaMatch = selectKarmaMatch;
    window.useHint = useHint;
    window.claimTaskRewards = claimTaskRewards;
    window.showTeachingRewardModal = showTeachingRewardModal;
    
    // Modal, Panel ve Ses Yönetimi
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.closeAllModals = closeAllModals;
    window.stopAllAudio = stopAllAudio;
    window.playSafeAudio = playSafeAudio;
    window.goToMainScreen = goToMainScreen;
    window.handleBackButton = handleBackButton;
    
    // Stats and Data Management
    window.resetAllData = resetAllData;
    window.saveStats = saveStats;
    window.loadStats = loadStats;
    window.getAllDailyStats = getAllDailyStats;
    window.updateStatsDisplay = updateStatsDisplay;
    
    // Test Tools (also exported immediately after function definitions)
    window.clearStorageData = clearStorageData;
    window.testPoints = testPoints;
    window.nuclearClear = nuclearClear;
}

/**
 * Clear storage data (TEST function)
 */
function clearStorageData() {
    if (!confirm('Storage verilerini temizlemek istediğinize emin misiniz?')) {
        return;
    }
    
    try {
        // Clear localStorage (keep user info)
        const savedUsername = localStorage.getItem('hasene_username');
        const savedUserId = localStorage.getItem('hasene_user_id');
        const savedUserEmail = localStorage.getItem('hasene_user_email');
        const savedUserGender = localStorage.getItem('hasene_user_gender');
        const savedFirebaseUserId = localStorage.getItem('hasene_firebase_user_id');
        const savedUserType = localStorage.getItem('hasene_user_type');
        
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore user info
        if (savedUsername) localStorage.setItem('hasene_username', savedUsername);
        if (savedUserId) localStorage.setItem('hasene_user_id', savedUserId);
        if (savedUserEmail) localStorage.setItem('hasene_user_email', savedUserEmail);
        if (savedUserGender) localStorage.setItem('hasene_user_gender', savedUserGender);
        if (savedFirebaseUserId) localStorage.setItem('hasene_firebase_user_id', savedFirebaseUserId);
        if (savedUserType) localStorage.setItem('hasene_user_type', savedUserType);
        
        // Reload stats
        if (typeof loadStats === 'function' && typeof updateStatsDisplay === 'function') {
            loadStats().then(() => {
                updateStatsDisplay();
                if (typeof showToast === 'function') {
                    showToast('Storage temizlendi', 'success');
                }
                location.reload();
            });
        } else {
            location.reload();
        }
    } catch (error) {
        console.error('Storage clear error:', error);
        if (typeof showToast === 'function') {
            showToast('Hata: ' + error.message, 'error');
        } else {
            alert('Hata: ' + error.message);
        }
    }
}

/**
 * Test points function (TEST function)
 */
function testPoints() {
    const points = prompt('Kaç puan eklemek istersiniz?', '1000');
    if (points === null) return;
    
    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum < 0) {
        if (typeof showToast === 'function') {
            showToast('Geçersiz puan değeri', 'error');
        } else {
            alert('Geçersiz puan değeri');
        }
        return;
    }
    
    if (typeof totalPoints !== 'undefined') {
        totalPoints += pointsNum;
    }
    
    if (typeof saveStats === 'function') {
        saveStats();
    }
    if (typeof updateStatsDisplay === 'function') {
        updateStatsDisplay();
    }
    if (typeof showToast === 'function') {
        showToast(`${pointsNum} puan eklendi!`, 'success');
    } else {
        alert(`${pointsNum} puan eklendi!`);
    }
}

/**
 * Nuclear clear - Delete everything (TEST function)
 */
async function nuclearClear() {
    if (!confirm('⚠️ DİKKAT: TÜM VERİLER KALICI OLARAK SİLİNECEK!\n\nBu işlem:\n- Tüm puanları\n- Tüm rozetleri\n- Tüm kullanıcı verilerini\n- Tüm localStorage verilerini\n- Tüm Firebase verilerini\n\nSİLECEK!\n\nDevam etmek istiyor musunuz?')) {
        return;
    }
    
    if (!confirm('Son bir kez onaylıyor musunuz? Bu işlem GERİ ALINAMAZ!')) {
        return;
    }
    
    try {
        // Önce Firebase'den verileri sil (kullanıcı bilgilerini kaydetmeden önce)
        const savedUsername = localStorage.getItem('hasene_username');
        if (savedUsername) {
            const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
            const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
            
            if (hasRealUsername && window.FIREBASE_ENABLED && window.firestore) {
                try {
                    const docId = typeof window.usernameToDocId === 'function' ? window.usernameToDocId(savedUsername) : savedUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                    
                    // Delete from Firebase
                    await Promise.all([
                        window.firestoreDelete('user_stats', docId).catch(() => false),
                        window.firestoreDelete('daily_tasks', docId).catch(() => false)
                    ]);
                    
                    // Delete ALL weekly leaderboard entries for this user
                    // First, ensure Firebase auth (try anonymous auth for local users)
                    let firebaseAuthUID = null;
                    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                        firebaseAuthUID = window.firebaseAuth.currentUser.uid;
                    } else if (typeof window.autoSignInAnonymous === 'function') {
                        try {
                            await window.autoSignInAnonymous();
                            if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                                firebaseAuthUID = window.firebaseAuth.currentUser.uid;
                                console.log('✅ Anonymous Firebase auth for nuclearClear, UID:', firebaseAuthUID);
                            }
                        } catch (error) {
                            console.warn('⚠️ Firebase anonymous auth failed in nuclearClear:', error);
                        }
                    }
                    
                    if (window.firestore && firebaseAuthUID) {
                        try {
                            console.log('🔄 Tüm weekly_leaderboard dokümanları sorgulanıyor...');
                            
                            // Query all weekly_leaderboard documents for this username
                            const querySnapshot = await window.firestore
                                .collection('weekly_leaderboard')
                                .where('username', '==', savedUsername.toLowerCase())
                                .get();
                            
                            console.log(`📊 ${querySnapshot.size} weekly_leaderboard dokümanı bulundu`);
                            
                            // Delete all found documents
                            const deletePromises = [];
                            querySnapshot.forEach((doc) => {
                                const docData = doc.data();
                                // Only delete if user_id matches (security check)
                                if (docData.user_id === firebaseAuthUID) {
                                    deletePromises.push(
                                        doc.ref.delete().then(() => {
                                            console.log('✅ Weekly leaderboard dokümanı silindi:', doc.id);
                                            return true;
                                        }).catch((error) => {
                                            console.warn('⚠️ Weekly leaderboard silme hatası:', error, { docId: doc.id });
                                            return false;
                                        })
                                    );
                                } else {
                                    console.warn('⚠️ Doküman farklı kullanıcıya ait, atlanıyor:', { docId: doc.id, docUserId: docData.user_id, currentUID: firebaseUID });
                                }
                            });
                            
                            if (deletePromises.length > 0) {
                                const results = await Promise.all(deletePromises);
                                const successCount = results.filter(r => r === true).length;
                                console.log(`✅ ${successCount}/${deletePromises.length} weekly_leaderboard dokümanı silindi`);
                            } else {
                                console.log('ℹ️ Silinecek weekly_leaderboard dokümanı bulunamadı');
                            }
                        } catch (error) {
                            console.warn('⚠️ Weekly leaderboard query/silme hatası:', error);
                            // Fallback: Try to delete last 52 weeks manually
                            if (typeof window.getWeekStartString === 'function') {
                                console.log('🔄 Fallback: Son 52 hafta manuel olarak siliniyor...');
                                const today = new Date();
                                for (let i = 0; i < 52; i++) {
                                    const weekDate = new Date(today);
                                    weekDate.setDate(weekDate.getDate() - (i * 7));
                                    const dayOfWeek = weekDate.getDay();
                                    const diff = weekDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                                    weekDate.setDate(diff);
                                    weekDate.setHours(0, 0, 0, 0);
                                    const weekStart = weekDate.toISOString().split('T')[0];
                                    const weeklyDocId = `${savedUsername}_${weekStart}`;
                                    await window.firestoreDelete('weekly_leaderboard', weeklyDocId).catch(() => false);
                                }
                            }
                        }
                    } else {
                        // Fallback: Delete last 52 weeks manually if query not available
                        console.log('🔄 Query yapılamıyor, son 52 hafta manuel olarak siliniyor...');
                        if (typeof window.getWeekStartString === 'function') {
                            const today = new Date();
                            for (let i = 0; i < 52; i++) {
                                const weekDate = new Date(today);
                                weekDate.setDate(weekDate.getDate() - (i * 7));
                                const dayOfWeek = weekDate.getDay();
                                const diff = weekDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                                weekDate.setDate(diff);
                                weekDate.setHours(0, 0, 0, 0);
                                const weekStart = weekDate.toISOString().split('T')[0];
                                const weeklyDocId = `${savedUsername}_${weekStart}`;
                                await window.firestoreDelete('weekly_leaderboard', weeklyDocId).catch(() => false);
                            }
                        }
                    }
                    
                    console.log('✅ Firebase verileri silindi');
                } catch (error) {
                    console.warn('⚠️ Firebase silme hatası:', error);
                }
            }
        }
        
        // Clear everything
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
            indexedDB.databases().then(databases => {
                databases.forEach(db => {
                    indexedDB.deleteDatabase(db.name);
                });
            });
        }
        
        // Clear Service Worker caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Unregister Service Workers
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(reg => reg.unregister());
            });
        }
        
        if (typeof showToast === 'function') {
            showToast('Tüm veriler silindi. Sayfa yenileniyor...', 'success');
        }
        
        setTimeout(() => {
            location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Nuclear clear error:', error);
        if (typeof showToast === 'function') {
            showToast('Hata: ' + error.message, 'error');
        } else {
            alert('Hata: ' + error.message);
        }
    }
}

// Export functions to window immediately (before initApp is called)
if (typeof window !== 'undefined') {
    window.clearStorageData = clearStorageData;
    window.testPoints = testPoints;
    window.nuclearClear = nuclearClear;
}