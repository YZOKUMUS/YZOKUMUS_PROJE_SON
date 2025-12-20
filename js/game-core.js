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
            // AbortError is normal when audio is interrupted by pause() - ignore it
            if (err.name === 'AbortError') {
                // This is expected when stopAllAudio() interrupts play() - silently ignore
                return;
            }
            // Only log unexpected errors
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
        currentOpenModal = modalId;
    }
}

/**
 * Modal kapatma
 */
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
    
    // Alt menüleri gizle (submode screens are already game-screen class, so they're hidden by the above querySelectorAll)
    
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
    
    // Initialize Firebase (if enabled)
    if (typeof window.initFirebase === 'function') {
        await window.initFirebase();
    }
    
    // Initialize user (create local user if doesn't exist, or use Firebase user)
    if (typeof window.getCurrentUser === 'function') {
        const user = window.getCurrentUser();
        console.log('👤 Current user:', user);
    }
    
    // Cleanup: After reset, remove any remaining Firebase entries by saved username
    // This handles cases where old entries weren't deleted during reset
    const resetUsername = localStorage.getItem('hasene_reset_username');
    if (resetUsername && window.firestore && window.firestore.collection && typeof window.firestoreDelete === 'function') {
        try {
            console.log('🧹 Reset sonrası temizlik: Username ile eski veriler kontrol ediliyor...', resetUsername);
            
            // Check if there are any weekly_leaderboard entries with this username
            const cleanupQuery = await window.firestore
                .collection('weekly_leaderboard')
                .where('username', '==', resetUsername)
                .limit(100)
                .get();
            
            if (!cleanupQuery.empty) {
                console.log(`⚠️ Reset sonrası ${cleanupQuery.size} eski kayıt bulundu, siliniyor...`);
                const cleanupPromises = [];
                cleanupQuery.forEach(doc => {
                    cleanupPromises.push(window.firestoreDelete('weekly_leaderboard', doc.id));
                });
                await Promise.all(cleanupPromises);
                console.log('✅ Reset sonrası temizlik tamamlandı');
            }
            
            // Remove the reset flag after cleanup
            localStorage.removeItem('hasene_reset_username');
        } catch (cleanupError) {
            console.warn('⚠️ Reset sonrası temizlik hatası (normal olabilir):', cleanupError);
            // Remove the flag even if cleanup failed
            localStorage.removeItem('hasene_reset_username');
        }
    }
    
    // Load stats
    await loadStats();
    
    // Load difficulty setting from localStorage
    const savedDifficulty = localStorage.getItem('hasene_difficulty');
    if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
        currentDifficulty = savedDifficulty;
    }
    
    // Setup UI
    setupEventListeners();
    
    // Update difficulty UI to match loaded setting
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === currentDifficulty) {
            btn.classList.add('active');
        }
    });
    
    updateStatsDisplay(); // This also calls updateUserStatusDisplay()
    
    // Setup page visibility change listener to check for day change
    // This ensures tasks reset when user switches tabs/apps and comes back after midnight
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden) {
            // Page became visible, check if day changed
            const today = getLocalDateString();
            if (dailyTasks.lastTaskDate !== today) {
                console.log('👁️ Sayfa görünür oldu, gün kontrolü yapılıyor...');
                await checkDailyTasks();
                updateStatsDisplay();
            }
        }
    });
    
    // Setup window focus listener (for mobile PWA when app comes to foreground)
    window.addEventListener('focus', async () => {
        const today = getLocalDateString();
        if (dailyTasks.lastTaskDate !== today) {
            console.log('📱 Uygulama ön plana geldi, gün kontrolü yapılıyor...');
            await checkDailyTasks();
            updateStatsDisplay();
        }
    });
    
    // Setup periodic check for day change (every 60 seconds)
    // This ensures tasks reset even if page stays open past midnight
    setInterval(async () => {
        const today = getLocalDateString();
        if (dailyTasks.lastTaskDate && dailyTasks.lastTaskDate !== today) {
            console.log('⏰ Periyodik kontrol: Yeni gün tespit edildi, vazifeler sıfırlanıyor...');
            await checkDailyTasks();
            updateStatsDisplay();
        }
    }, 60000); // Check every 60 seconds
    
    // Browser geri tuşu dinleyicisi
    setupBackButtonHandler();
    
    // Preload data in background
    preloadAllData();
    
    // Register service worker
    registerServiceWorker();
    
    // Setup PWA install banner
    setupPWAInstall();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        
        // Check if first time (show onboarding)
        const onboardingComplete = localStorage.getItem('hasene_onboarding_complete');
        if (!onboardingComplete) {
            setTimeout(() => showOnboarding(), 500);
        }
        // Daily reward will be shown via reward box when all tasks are completed
        // No need to show it automatically on page load
    }, 1500);
    
    console.log('✅ Uygulama başlatıldı');
}

/**
 * Load all saved stats
 * Tries Firebase first (if Firebase user), then falls back to localStorage
 */
async function loadStats() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const isFirebaseUser = user && !user.id.startsWith('local-');
    
    // If Firebase user, try to load from Firebase first
    if (isFirebaseUser && typeof window.loadUserStats === 'function' && typeof window.loadDailyTasks === 'function') {
        try {
            console.log('🔥 Loading stats from Firebase...');
            const firebaseStats = await window.loadUserStats();
            const firebaseTasks = await window.loadDailyTasks();
            
            if (firebaseStats && firebaseStats.total_points !== undefined) {
                // Load from Firebase data
                totalPoints = firebaseStats.total_points || 0;
                currentLevel = calculateLevel(totalPoints);
                
                // Update streak data from Firebase
                if (firebaseStats.streak_data) {
                    streakData = { ...streakData, ...firebaseStats.streak_data };
                }
                
                // Update game stats from Firebase
                if (firebaseStats.game_stats) {
                    gameStats = { ...gameStats, ...firebaseStats.game_stats };
                }
                
                // Update badges from Firebase
                if (firebaseStats.badges) {
                    badgesUnlocked = firebaseStats.badges;
                }
                
                // Update achievements from Firebase
                if (firebaseStats.achievements) {
                    unlockedAchievements = firebaseStats.achievements;
                }
                
                // Update daily progress and goal from Firebase
                // IMPORTANT: daily_progress sadece bugün için geçerlidir, eski günlerden gelen veriyi yok say
                const today = getLocalDateString();
                const savedProgress = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: '', points: 0 });
                
                // Eğer Firebase'den gelen daily_progress bugünün tarihi değilse veya total_points'ten fazlaysa, sıfırla
                if (firebaseStats.daily_progress !== undefined) {
                    // Mantık kontrolü: daily_progress total_points'ten fazla olamaz (ilk oyun hariç)
                    if (totalPoints === 0 || firebaseStats.daily_progress > totalPoints) {
                        // Eski günlerden gelen veri veya mantık hatası - bugün için 0 yap
                        dailyProgress = 0;
                        console.log('ℹ️ Firebase daily_progress sıfırlandı (totalPoints:', totalPoints + ', daily_progress:', firebaseStats.daily_progress + ')');
                    } else {
                        dailyProgress = firebaseStats.daily_progress;
                    }
                } else {
                    // Firebase'de daily_progress yoksa, localStorage'dan kontrol et
                    if (savedProgress.date === today) {
                        dailyProgress = savedProgress.points;
                    } else {
                        dailyProgress = 0;
                    }
                }
                
                if (firebaseStats.daily_goal !== undefined) {
                    dailyGoal = firebaseStats.daily_goal;
                }
                
                // Sync to localStorage for offline access
                saveToStorage(CONFIG.STORAGE_KEYS.TOTAL_POINTS, totalPoints);
                saveToStorage(CONFIG.STORAGE_KEYS.STREAK_DATA, streakData);
                saveToStorage(CONFIG.STORAGE_KEYS.GAME_STATS, gameStats);
                saveToStorage('hasene_badges', badgesUnlocked);
                saveToStorage('hasene_achievements', unlockedAchievements);
                saveToStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: getLocalDateString(), points: dailyProgress });
                saveToStorage(CONFIG.STORAGE_KEYS.DAILY_GOAL, dailyGoal);
                
                console.log('✅ Stats loaded from Firebase:', { totalPoints, currentLevel });
            }
            
            // Load daily tasks from Firebase
            if (firebaseTasks) {
                dailyTasks = { ...dailyTasks, ...firebaseTasks };
                saveToStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
                console.log('✅ Daily tasks loaded from Firebase');
            }
        } catch (error) {
            console.warn('⚠️ Firebase load failed, falling back to localStorage:', error);
            // Fall through to localStorage loading
        }
    }
    
    // If not Firebase user, or Firebase load failed, load from localStorage
    // Also load additional data that might not be in Firebase yet
    if (totalPoints === undefined || totalPoints === 0) {
        totalPoints = loadFromStorage(CONFIG.STORAGE_KEYS.TOTAL_POINTS, 0);
    }
    currentLevel = calculateLevel(totalPoints);
    
    // Merge localStorage data (in case Firebase doesn't have all fields or for local users)
    const localStreakData = loadFromStorage(CONFIG.STORAGE_KEYS.STREAK_DATA, {});
    if (Object.keys(localStreakData).length > 0 && (!isFirebaseUser || Object.keys(streakData).length === 0)) {
        streakData = { ...streakData, ...localStreakData };
    }
    
    const localGameStats = loadFromStorage(CONFIG.STORAGE_KEYS.GAME_STATS, {});
    if (Object.keys(localGameStats).length > 0 && (!isFirebaseUser || Object.keys(gameStats).length === 0)) {
        gameStats = { ...gameStats, ...localGameStats };
    }
    
    const localBadges = loadFromStorage('hasene_badges', {});
    if (Object.keys(localBadges).length > 0 && (!isFirebaseUser || Object.keys(badgesUnlocked).length === 0)) {
        badgesUnlocked = { ...badgesUnlocked, ...localBadges };
    }
    
    // Achievements - merge only if Firebase didn't load them or for local users
    const localAchievements = loadFromStorage('hasene_achievements', []);
    if (localAchievements.length > 0 && (!isFirebaseUser || unlockedAchievements.length === 0)) {
        unlockedAchievements = localAchievements;
    }
    
    // Daily goal - use Firebase value if available, otherwise localStorage
    if (!isFirebaseUser || dailyGoal === undefined || dailyGoal === 2700) {
        dailyGoal = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_GOAL, 2700);
    }
    
    // Daily progress (check date) - use Firebase value if available, otherwise localStorage
    const today = getLocalDateString();
    const savedProgress = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: '', points: 0 });
    
    // If Firebase didn't load dailyProgress or we're a local user, use localStorage
    if (!isFirebaseUser || (dailyProgress === undefined || dailyProgress === 0)) {
        if (savedProgress.date === today) {
            dailyProgress = savedProgress.points;
        } else {
            dailyProgress = 0;
            saveToStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: today, points: 0 });
            // Reset daily goal completion flag for new day
            localStorage.removeItem('hasene_last_daily_goal_completed');
        }
    }
    
    // Word stats (localStorage only for now)
    wordStats = loadFromStorage('hasene_word_stats', {});
    
    // Favorites (localStorage only for now)
    favorites = loadFromStorage('hasene_favorites', []);
    
    // Unlocked achievements (localStorage only for now)
    unlockedAchievements = loadFromStorage('hasene_achievements', []);
    
    // Daily tasks - if not loaded from Firebase, load from localStorage
    if (!isFirebaseUser || !dailyTasks || !dailyTasks.tasks || dailyTasks.tasks.length === 0) {
        await checkDailyTasks();
    }
    
    // Check streak
    checkStreak();
    
    console.log('📊 Stats loaded:', { totalPoints, currentLevel, streakData, source: isFirebaseUser ? 'Firebase+localStorage' : 'localStorage' });
}

/**
 * Save all stats
 * Saves to localStorage first (always), then syncs to Firebase if Firebase user
 */
async function saveStats() {
    // 1. Always save to localStorage (primary storage for local users)
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
    
    // 2. Sync to Firebase if Firebase user (don't wait, fire and forget)
    if (typeof window.saveUserStats === 'function' && typeof window.saveDailyTasks === 'function') {
        const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        console.log('💾 saveStats - User check:', { user: user ? { id: user.id, type: user.type } : null });
        
        if (user && !user.id.startsWith('local-')) {
            console.log('🔥 Syncing to Firebase...');
            // Get username from localStorage (most up-to-date)
            const username = localStorage.getItem('hasene_username') || user.username || 'Anonim Kullanıcı';
            // Sync user stats to Firebase (include username for backend reporting)
            window.saveUserStats({
                total_points: totalPoints,
                badges: badgesUnlocked,
                streak_data: streakData,
                game_stats: gameStats,
                perfect_lessons_count: gameStats.perfectLessons || 0,
                achievements: unlockedAchievements, // Sync achievements
                daily_progress: dailyProgress, // Sync daily progress
                daily_goal: dailyGoal, // Sync daily goal
                username: username // Explicitly include username
            }).then(success => {
                if (success) {
                    console.log('✅ Firebase user stats sync completed');
                } else {
                    console.warn('⚠️ Firebase user stats sync failed');
                }
            }).catch(err => {
                console.error('❌ Firebase sync error:', err);
            });
            
            // Sync daily tasks to Firebase
            window.saveDailyTasks(dailyTasks).then(success => {
                if (success) {
                    console.log('✅ Firebase daily tasks sync completed');
                } else {
                    console.warn('⚠️ Firebase daily tasks sync failed');
                }
            }).catch(err => {
                console.error('❌ Firebase daily tasks sync error:', err);
            });
        } else {
            console.log('ℹ️ Local user, Firebase sync skipped');
        }
    } else {
        console.warn('⚠️ Firebase sync functions not available');
    }
}

// Debounced save (async version)
const debouncedSaveStats = debounce(() => {
    saveStats().catch(err => {
        console.error('Save stats error:', err);
    });
}, 500);

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
            goToMainMenu();
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

/**
 * Setup PWA Install Banner
 */
let deferredPrompt = null;

function setupPWAInstall() {
    // Sadece mobil cihazlarda göster
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    // Zaten yüklü mü kontrol et
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        return; // Zaten PWA olarak yüklü
    }
    
    // Daha önce reddedildi mi kontrol et
    const installDismissed = localStorage.getItem('hasene_install_dismissed');
    if (installDismissed) {
        const dismissedDate = new Date(installDismissed);
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
            return; // 7 gün içinde reddedildiyse tekrar gösterme
        }
    }
    
    // beforeinstallprompt event'ini yakala
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Banner'ı göster
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('hidden');
            banner.style.display = 'block';
        }
    });
    
    // Install butonu
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) {
                // iOS Safari için manuel talimatlar
                showIOSInstallInstructions();
                return;
            }
            
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ PWA yükleme kabul edildi');
            } else {
                console.log('❌ PWA yükleme reddedildi');
            }
            
            deferredPrompt = null;
            hideInstallBanner();
        });
    }
    
    // Dismiss butonu
    const dismissBtn = document.getElementById('install-dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            localStorage.setItem('hasene_install_dismissed', new Date().toISOString());
            hideInstallBanner();
        });
    }
    
    // PWA yüklendiğinde banner'ı gizle
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA yüklendi');
        hideInstallBanner();
        deferredPrompt = null;
    });
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.add('hidden');
        banner.style.display = 'none';
    }
}

function showIOSInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
        showToast('📱 iOS: Paylaş butonuna (⬆️) basın ve "Ana Ekrana Ekle" seçeneğini seçin', 'info', 5000);
    } else {
        showToast('📱 Tarayıcı menüsünden "Ana ekrana ekle" seçeneğini kullanın', 'info', 4000);
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
            // Save difficulty to localStorage
            localStorage.setItem('hasene_difficulty', currentDifficulty);
            console.log(`📊 Difficulty changed to: ${currentDifficulty}`);
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
            const newGoal = parseInt(btn.dataset.goal);
            dailyGoal = newGoal;
            saveStats();
            updateDailyGoalDisplay();
            
            // IMPORTANT: If goal is changed during the day, check if new goal is already reached
            // This prevents issues like: user has 2000 points, changes goal from 2700 to 1300,
            // and should get bonus if not already awarded today
            checkDailyGoal();
            
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
    
    // Check if day has changed (in case user kept app open past midnight)
    const today = getLocalDateString();
    if (dailyTasks.lastTaskDate !== today) {
        await checkDailyTasks();
    }
    
    // Check if username is set (per README: "Kullanıcı adı ile direkt giriş yapılır")
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const username = user?.username || localStorage.getItem('hasene_username') || '';
    
    // If no username or default username (including Firebase default), show login modal
    const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı'];
    if (!username || defaultUsernames.includes(username) || username.trim() === '') {
        // Store the game mode to start after login
        window.pendingGameMode = gameMode;
        showUsernameLoginModal();
        return;
    }
    
    currentGameMode = gameMode;
    
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
    document.getElementById('kelime-cevir-screen').classList.add('hidden');
    document.getElementById('kelime-submode-screen').classList.remove('hidden');
}

/**
 * Go to Elif Ba submodes
 */
function goToElifBaSubmodes() {
    document.getElementById('elif-ba-screen').classList.add('hidden');
    document.getElementById('elif-ba-tablo-screen').classList.add('hidden');
    document.getElementById('elif-ba-isimler-tablo-screen').classList.add('hidden');
    document.getElementById('elif-ba-submode-screen').classList.remove('hidden');
}

// ========================================
// ACHIEVEMENT SYSTEM
// ========================================

/**
 * Check badges and achievements after earning points
 * Called after each correct answer to check for immediate unlocks
 */
function checkBadgesAndAchievementsAfterPoints() {
    // Geçici totalPoints hesapla (henüz eklenmedi ama kontrol için)
    const tempTotalPoints = totalPoints + sessionScore;
    
    // Rozetleri kontrol et
    const badges = window.BADGE_DEFINITIONS || [];
    const asrBadges = window.ASR_I_SAADET_BADGES || {};
    const today = getLocalDateString();
    
    badges.forEach(badge => {
        if (!badgesUnlocked[badge.id] && badge.threshold && tempTotalPoints >= badge.threshold) {
            badgesUnlocked[badge.id] = today;
            // Toast mesajı kaldırıldı - gereksiz pop-up, endGame'de zaten kontrol ediliyor
        }
    });
    
    // Asr-ı Saadet rozetlerini kontrol et
    Object.values(asrBadges).forEach(periodBadges => {
        periodBadges.forEach(badge => {
            if (!badgesUnlocked[badge.id] && badge.threshold && tempTotalPoints >= badge.threshold) {
                badgesUnlocked[badge.id] = today;
                // Toast mesajı kaldırıldı - gereksiz pop-up, endGame'de zaten kontrol ediliyor
            }
        });
    });
    
    // Başarıları kontrol et
    const stars = calculateStars(tempTotalPoints);
    const stats = { 
        stars, 
        bestStreak: streakData.bestStreak,
        perfectLessons: gameStats.perfectLessons,
        totalCorrect: (gameStats.totalCorrect || 0) + correctCount
    };
    const newAchievements = checkAchievements(stats);
    if (newAchievements.length > 0) {
        newAchievements.forEach(ach => saveAchievement(ach.id));
        setTimeout(() => showAchievementModal(newAchievements[0]), 500);
    }
    
    // Seviye kontrolü
    const newLevel = calculateLevel(tempTotalPoints);
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        setTimeout(() => showLevelUpModal(newLevel), 800);
    }
    
    // UI'ı güncelle (geçici totalPoints ile)
    const tempHaseneEl = document.getElementById('total-hasene');
    const tempStarsEl = document.getElementById('total-stars');
    const tempLevelEl = document.getElementById('level-display');
    if (tempHaseneEl) tempHaseneEl.textContent = formatNumber(tempTotalPoints);
    if (tempStarsEl) tempStarsEl.textContent = `⭐ ${stars}`;
    if (tempLevelEl) tempLevelEl.textContent = newLevel > currentLevel ? newLevel : currentLevel;
}

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
 * Go back to main menu
 */
function goToMainMenu() {
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
    
    currentGameMode = null;
    currentOpenPanel = null;
}

/**
 * End game and show results
 */
function endGame() {
    // Calculate perfect bonus
    let perfectBonus = 0;
    if (wrongCount === 0 && correctCount >= 3) {
        perfectBonus = CONFIG.PERFECT_BONUS;
        sessionScore += perfectBonus;
        // Perfect bonus'u dailyProgress'e de ekle (mantık tutarlılığı için)
        dailyProgress += perfectBonus;
        gameStats.perfectLessons = (gameStats.perfectLessons || 0) + 1;
    }
    
    // Add to total points
    totalPoints += sessionScore;
    // NOT: dailyProgress zaten her soruda + perfect bonus ekleniyor, burada tekrar eklemeye gerek yok
    
    // Update game stats
    gameStats.totalCorrect = (gameStats.totalCorrect || 0) + correctCount;
    gameStats.totalWrong = (gameStats.totalWrong || 0) + wrongCount;
    gameStats.gameModeCounts = gameStats.gameModeCounts || {};
    gameStats.gameModeCounts[currentGameMode] = (gameStats.gameModeCounts[currentGameMode] || 0) + 1;
    
    // Update task progress (sadece oyun modu için, doğru cevaplar zaten her soruda güncelleniyor)
    updateTaskProgress('game_modes', currentGameMode);
    // Hasene görevi için toplam sessionScore'u güncelle (görev ilerlemesi için)
    updateTaskProgress('hasene', sessionScore);
    
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
    
    // Check daily goal (this will also update streak if goal is completed)
    checkDailyGoal();
    
    // Update weekly XP for leaderboard
    if (typeof window.updateWeeklyXP === 'function') {
        window.updateWeeklyXP(sessionScore).then(newWeeklyXP => {
            console.log('✅ Weekly XP updated:', newWeeklyXP);
            // Check if league changed
            const newLeague = typeof window.getUserLeague === 'function' ? window.getUserLeague() : null;
            if (newLeague) {
                console.log('📊 Current league:', newLeague.name);
            }
        }).catch(err => {
            console.warn('⚠️ Weekly XP update failed:', err);
        });
    }
    
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
    startGame(currentGameMode);
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
                // Toast mesajı kaldırıldı - gereksiz pop-up
                filtered = filterByDifficulty(data, currentDifficulty);
            }
            useIntelligentSelection = true;
            break;
            
        case 'review':
            isReviewMode = true;
            // Get words that need review (struggling + due for review)
            const reviewWordIds = [];
            
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
                // Toast mesajı kaldırıldı - gereksiz pop-up
            } else {
                // Toast mesajı kaldırıldı - gereksiz pop-up
                useIntelligentSelection = true;
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
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        // Wrong answer
        wrongCount++;
        comboCount = 0;
        
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
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
        // Toast mesajı kaldırıldı - gereksiz pop-up
        return;
    }
    
    if (hintsUsedToday >= MAX_HINTS_PER_DAY) {
        // Toast mesajı kaldırıldı - gereksiz pop-up
        return;
    }
    
    const options = document.querySelectorAll('#kelime-options .answer-option:not(.eliminated)');
    if (options.length <= 2) {
        // Toast mesajı kaldırıldı - gereksiz pop-up
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
    
    // Toast mesajı kaldırıldı - gereksiz pop-up, buton zaten güncelleniyor
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
        // Toast mesajı kaldırıldı - gereksiz pop-up, UI'da zaten gösteriliyor
    } else {
        favorites.push(wordId);
        if (favBtn) favBtn.textContent = '❤️';
        // Toast mesajı kaldırıldı - gereksiz pop-up, UI'da zaten gösteriliyor
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
        
        // SM-2 Interval Hesaplama
        if (previousAttempts === 0) {
            // İlk öğrenme: 1 gün sonra tekrar
            stats.interval = 1;
        } else if (previousAttempts === 1 && stats.correct === 2) {
            // İkinci doğru cevap: 6 gün sonra tekrar
            stats.interval = 6;
        } else {
            // Sonraki doğru cevaplar: interval * easeFactor
            stats.interval = Math.max(1, Math.floor(stats.interval * stats.easeFactor));
        }
        
        // SM-2 Ease Factor Güncellemesi
        const currentSuccessRate = (stats.correct / stats.attempts) * 100;
        if (currentSuccessRate >= 90) {
            stats.easeFactor = Math.min(2.5, stats.easeFactor + 0.15);
        } else if (currentSuccessRate >= 70) {
            stats.easeFactor = Math.min(2.5, stats.easeFactor + 0.05);
        } else if (currentSuccessRate < 50) {
            stats.easeFactor = Math.max(1.3, stats.easeFactor - 0.15);
        }
        
        // Sonraki tekrar tarihini hesapla
        stats.nextReviewDate = addDaysToDate(today, stats.interval);
    } else {
        stats.wrong++;
        stats.lastWrong = today;
        
        // Yanlış cevap: interval sıfırla, ease factor azalt
        stats.interval = 1;
        stats.easeFactor = Math.max(1.3, stats.easeFactor - 0.20);
        
        // Review listesine ekle
        addToReviewList(wordId);
        
        // Yanlış cevap durumunda da nextReviewDate hesapla (1 gün sonra)
        stats.nextReviewDate = addDaysToDate(today, 1);
    }
    
    // Başarı oranı ve ustalık seviyesi
    stats.successRate = Math.round((stats.correct / stats.attempts) * 100);
    stats.masteryLevel = Math.min(10, Math.floor(stats.successRate / 10));
    
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
    
    // Kategorize words by priority
    const prioritizedWords = words.map(word => {
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
    return Object.keys(wordStats)
        .filter(wordId => {
            const stats = wordStats[wordId];
            return stats.attempts >= 2 && stats.successRate < 50;
        })
        .map(wordId => ({
            id: wordId,
            ...wordStats[wordId]
        }))
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, 20);
}

/**
 * Get word statistics for analysis modal
 * @returns {Object} Word analysis data
 */
function getWordAnalysis() {
    const allStats = Object.entries(wordStats);
    const totalWords = allStats.length;
    
    if (totalWords === 0) {
        return {
            totalWords: 0,
            mastered: 0,
            learning: 0,
            struggling: 0,
            averageSuccessRate: 0,
            dueForReview: 0,
            recentlyViewed: [],
            mostPracticed: [],
            newlyLearned: []
        };
    }
    
    const today = new Date(getLocalDateString());
    const todayStr = getLocalDateString();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let mastered = 0;
    let learning = 0;
    let struggling = 0;
    let dueForReview = 0;
    let totalSuccessRate = 0;
    
    const wordsWithDates = [];
    
    allStats.forEach(([id, stats]) => {
        totalSuccessRate += stats.successRate || 0;
        
        if (stats.masteryLevel >= 8) {
            mastered++;
        } else if (stats.masteryLevel >= 4) {
            learning++;
        } else {
            struggling++;
        }
        
        if (stats.nextReviewDate) {
            const reviewDate = new Date(stats.nextReviewDate);
            if (reviewDate <= today) {
                dueForReview++;
            }
        }
        
        // Collect data for detailed analysis
        wordsWithDates.push({
            id,
            lastReview: stats.lastReview || null,
            lastCorrect: stats.lastWrong || stats.lastCorrect || null,
            attempts: stats.attempts || 0,
            successRate: stats.successRate || 0,
            masteryLevel: stats.masteryLevel || 0
        });
    });
    
    // En son görülen kelimeler (lastReview'e göre sırala)
    const recentlyViewed = [...wordsWithDates]
        .filter(w => w.lastReview)
        .sort((a, b) => {
            const dateA = new Date(a.lastReview);
            const dateB = new Date(b.lastReview);
            return dateB - dateA;
        })
        .slice(0, 10);
    
    // En çok çalışılan kelimeler (attempts'e göre sırala)
    const mostPracticed = [...wordsWithDates]
        .filter(w => w.attempts > 0)
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 10);
    
    // Son 7 günde öğrenilen kelimeler (yeni öğrenilen)
    const newlyLearned = [...wordsWithDates]
        .filter(w => {
            if (!w.lastCorrect) return false;
            const learnedDate = new Date(w.lastCorrect);
            return learnedDate >= sevenDaysAgo;
        })
        .sort((a, b) => {
            const dateA = new Date(a.lastCorrect);
            const dateB = new Date(b.lastCorrect);
            return dateB - dateA;
        })
        .slice(0, 10);
    
    return {
        totalWords,
        mastered,
        learning,
        struggling,
        averageSuccessRate: Math.round(totalSuccessRate / totalWords),
        dueForReview,
        recentlyViewed,
        mostPracticed,
        newlyLearned
    };
}

/**
 * Get word details from wordId
 * @param {string} wordId - Word ID
 * @returns {Object|null} Word data or null
 */
function getWordDetails(wordId) {
    if (!wordId || !window.kelimeData) return null;
    return window.kelimeData.find(w => (w.id === wordId || w.kelime_id === wordId));
}

/**
 * Format date for display
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
function formatDateForDisplay(dateStr) {
    if (!dateStr) return 'Hiç görülmedi';
    const date = new Date(dateStr);
    const today = new Date(getLocalDateString());
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
}

/**
 * Show word analysis modal
 */
function showWordAnalysisModal() {
    const analysis = getWordAnalysis();
    const struggling = getStrugglingWords();
    
    let content = `
        <div class="analysis-summary" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
            <div class="analysis-stat" style="text-align: center; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <span class="stat-value" style="display: block; font-size: 24px; font-weight: bold; color: rgba(26,26,46,0.9);">${analysis.totalWords}</span>
                <span class="stat-label" style="display: block; font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">Toplam Kelime</span>
            </div>
            <div class="analysis-stat mastered" style="text-align: center; padding: 16px; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
                <span class="stat-value" style="display: block; font-size: 24px; font-weight: bold; color: #4caf50;">${analysis.mastered}</span>
                <span class="stat-label" style="display: block; font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">Ustalaşılan</span>
            </div>
            <div class="analysis-stat learning" style="text-align: center; padding: 16px; background: rgba(255, 152, 0, 0.1); border-radius: 8px;">
                <span class="stat-value" style="display: block; font-size: 24px; font-weight: bold; color: #ff9800;">${analysis.learning}</span>
                <span class="stat-label" style="display: block; font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">Öğreniliyor</span>
            </div>
            <div class="analysis-stat struggling" style="text-align: center; padding: 16px; background: rgba(244, 67, 54, 0.1); border-radius: 8px;">
                <span class="stat-value" style="display: block; font-size: 24px; font-weight: bold; color: #f44336;">${analysis.struggling}</span>
                <span class="stat-label" style="display: block; font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">Zorlanılan</span>
            </div>
        </div>
        
        <div class="analysis-progress" style="margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div class="progress-bar" style="height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-bottom: 12px; display: flex;">
                <div class="progress-mastered" style="height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); width: ${analysis.totalWords > 0 ? (analysis.mastered / analysis.totalWords * 100) : 0}%"></div>
                <div class="progress-learning" style="height: 100%; background: linear-gradient(90deg, #ff9800, #ffc107); width: ${analysis.totalWords > 0 ? (analysis.learning / analysis.totalWords * 100) : 0}%"></div>
                <div class="progress-struggling" style="height: 100%; background: linear-gradient(90deg, #f44336, #e91e63); width: ${analysis.totalWords > 0 ? (analysis.struggling / analysis.totalWords * 100) : 0}%"></div>
            </div>
            <p style="margin: 8px 0; color: rgba(26,26,46,0.9);">Ortalama Başarı: <strong>${analysis.averageSuccessRate}%</strong></p>
            <p style="margin: 8px 0; color: rgba(26,26,46,0.9);">Tekrar Bekleyen: <strong>${analysis.dueForReview}</strong> kelime</p>
        </div>
    `;
    
    // En son görülen kelimeler
    if (analysis.recentlyViewed && analysis.recentlyViewed.length > 0) {
        content += `
            <div class="analysis-section" style="margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: rgba(26,26,46,0.9); font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    <span>📅</span>
                    <span>En Son Görülen Kelimeler</span>
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${analysis.recentlyViewed.slice(0, 5).map(w => {
                        const word = getWordDetails(w.id);
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; color: rgba(26,26,46,0.9); font-size: 18px; font-family: 'KFGQPC Uthmanic Script HAFS', serif;">${word ? (word.kelime || word.arabic) : w.id}</div>
                                    ${word ? `<div style="font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">${word.anlam || word.translation}</div>` : ''}
                                </div>
                                <span style="font-size: 12px; color: rgba(26,26,46,0.75); margin-left: 12px; white-space: nowrap;">${formatDateForDisplay(w.lastReview)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // En çok çalışılan kelimeler
    if (analysis.mostPracticed && analysis.mostPracticed.length > 0) {
        content += `
            <div class="analysis-section" style="margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: rgba(26,26,46,0.9); font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    <span>🔥</span>
                    <span>En Çok Çalışılan Kelimeler</span>
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${analysis.mostPracticed.slice(0, 5).map(w => {
                        const word = getWordDetails(w.id);
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; color: rgba(26,26,46,0.9); font-size: 18px; font-family: 'KFGQPC Uthmanic Script HAFS', serif;">${word ? (word.kelime || word.arabic) : w.id}</div>
                                    ${word ? `<div style="font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">${word.anlam || word.translation}</div>` : ''}
                                </div>
                                <div style="display: flex; gap: 12px; align-items: center; margin-left: 12px;">
                                    <span style="font-size: 12px; color: rgba(26,26,46,0.75); white-space: nowrap;">${w.attempts} deneme</span>
                                    <span style="font-size: 12px; color: ${w.successRate >= 70 ? '#4caf50' : w.successRate >= 50 ? '#ff9800' : '#f44336'}; font-weight: 500; white-space: nowrap;">${w.successRate}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Yeni öğrenilen kelimeler (son 7 gün)
    if (analysis.newlyLearned && analysis.newlyLearned.length > 0) {
        content += `
            <div class="analysis-section" style="margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: rgba(26,26,46,0.9); font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    <span>✨</span>
                    <span>Yeni Öğrenilen Kelimeler (Son 7 Gün)</span>
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${analysis.newlyLearned.slice(0, 5).map(w => {
                        const word = getWordDetails(w.id);
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; color: rgba(26,26,46,0.9); font-size: 18px; font-family: 'KFGQPC Uthmanic Script HAFS', serif;">${word ? (word.kelime || word.arabic) : w.id}</div>
                                    ${word ? `<div style="font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">${word.anlam || word.translation}</div>` : ''}
                                </div>
                                <span style="font-size: 12px; color: rgba(26,26,46,0.75); margin-left: 12px; white-space: nowrap;">${formatDateForDisplay(w.lastCorrect)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Zorlanılan kelimeler
    if (struggling.length > 0) {
        content += `
            <div class="analysis-section" style="margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: rgba(26,26,46,0.9); font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    <span>🔴</span>
                    <span>Zorlandığın Kelimeler</span>
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${struggling.slice(0, 5).map(w => {
                        const word = getWordDetails(w.id);
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(244, 67, 54, 0.1); border-radius: 6px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; color: rgba(26,26,46,0.9); font-size: 18px; font-family: 'KFGQPC Uthmanic Script HAFS', serif;">${word ? (word.kelime || word.arabic) : w.id}</div>
                                    ${word ? `<div style="font-size: 12px; color: rgba(26,26,46,0.75); margin-top: 4px;">${word.anlam || word.translation}</div>` : ''}
                                </div>
                                <span style="font-size: 12px; color: #f44336; font-weight: 500; margin-left: 12px; white-space: nowrap;">${w.successRate}% başarı</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Create and show modal
    const modal = document.getElementById('word-analysis-modal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-body') || modal.querySelector('#analysis-content');
        if (modalContent) {
            modalContent.innerHTML = content;
        }
        openModal('word-analysis-modal');
    } else {
        // Fallback: show as toast summary
        showToast(`📊 ${analysis.totalWords} kelime öğrenildi, ${analysis.dueForReview} tekrar bekliyor`, 'info', 3000);
    }
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
    
    // Use intelligent word selection to prioritize wrong answers (SM-2 algorithm)
    if (filtered.length > CONFIG.QUESTIONS_PER_GAME) {
        currentQuestions = selectIntelligentWords(filtered, CONFIG.QUESTIONS_PER_GAME, false);
        console.log('🧠 Dinle Bul: Akıllı kelime seçimi kullanıldı');
    } else {
        currentQuestions = getRandomItems(filtered, Math.min(filtered.length, CONFIG.QUESTIONS_PER_GAME));
    }
    
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
    const correctAnswer = currentQuestion.anlam || currentQuestion.translation;
    const wordId = currentQuestion.id || currentQuestion.kelime_id;
    const buttons = document.querySelectorAll('#dinle-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    // Update word statistics (SM-2 algorithm)
    if (wordId) {
        updateWordStats(wordId, selectedAnswer === correctAnswer);
    }
    
    if (selectedAnswer === correctAnswer) {
        correctCount++;
        comboCount++;
        maxCombo = Math.max(maxCombo, comboCount);
        
        const basePoints = getBasePoints(currentDifficulty);
        const gained = basePoints + CONFIG.COMBO_BONUS_PER_CORRECT;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
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
    const correctWord = currentQuestion._correctWord;
    // For ayet-based questions, we can't track word stats easily, 
    // but we'll try to find the word ID from kelimeData if possible
    const buttons = document.querySelectorAll('#bosluk-options .answer-option');
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    buttons.forEach(btn => {
        if (btn.textContent.trim() === correctWord) {
            btn.classList.add('correct');
        }
    });
    
    // Try to update word stats if we can find the word in kelimeData
    // Note: Boşluk Doldur uses ayet words, so word stats tracking may be limited
    if (window.kelimeData && correctWord) {
        const matchingWord = window.kelimeData.find(w => 
            w.kelime === correctWord || w.arabic === correctWord
        );
        if (matchingWord && matchingWord.id) {
            updateWordStats(matchingWord.id, selectedWord === correctWord);
        }
    }
    
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
        
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
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
        loadElifQuestion();
        
    } else if (submode === 'kelimeler') {
        // Word reading with letters
        await startElifKelimelerGame(data);
        
    } else if (submode === 'harekeler') {
        // Harekeler (vowel marks) game
        await startElifHarekelerGame(data);
    } else if (submode === 'kelime-okuma') {
        // Kelime Okuma (Word Reading) game
        await startKelimeOkumaGame();
    } else if (submode === 'tablo') {
        // Harf Tablosu (Letter Table)
        await showHarfTablosu();
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
    
    // Filter by difficulty first
    let filteredKelime = filterByDifficulty(kelimeData, currentDifficulty);
    if (filteredKelime.length < 20) {
        filteredKelime = kelimeData; // Fallback if not enough words
    }
    
    // Create questions - match words with their starting letter
    const questions = [];
    const usedHarfler = shuffleArray([...harfData]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    
    for (const harf of usedHarfler) {
        const matchingWords = filteredKelime.filter(w => {
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
    loadElifKelimelerQuestion();
}

function loadElifKelimelerQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // JSON'dan harf bilgilerini al (sesTipi ve renkKodu)
    const harfObj = currentQuestion.harf || {};
    const sesTipi = harfObj.sesTipi || '';
    const renkKodu = harfObj.renkKodu || '';
    
    // Kalın sesli ve peltek sesli harf kontrolü - JSON'daki sesTipi alanından
    const isKalinSesli = sesTipi.includes('kalın') || sesTipi.includes('kalin');
    const isPeltekSesli = sesTipi.includes('peltek');
    
    // Harf rengi siyah (kart arka planı renkli olacak, harf siyah)
    const harfColor = '#000000'; // Siyah harfler
    
    // Harfi göster ve renk uygula
    const elifLetterEl = document.getElementById('elif-letter');
    elifLetterEl.textContent = harfObj.harf || currentQuestion.harf.harf;
    elifLetterEl.style.color = harfColor;
    
    // Açıklama metnini ayrı elementte göster ve göster
    const instructionEl = document.getElementById('elif-question-instruction');
    if (instructionEl) {
        instructionEl.textContent = `"${harfObj.harf || currentQuestion.harf.harf}" harfiyle başlayan kelimeyi seç`;
        instructionEl.style.display = 'block';
    }
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
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
    setTimeout(() => {
        questionIndex++;
        loadElifKelimelerQuestion();
    }, 1200);
}

/**
 * Elif Ba Kelime Okuma submode - read and learn Arabic words
 */
async function startKelimeOkumaGame() {
    const data = await loadHarf1Data();
    
    if (data.length === 0) {
        showToast('Kelime Okuma verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Shuffle questions
    currentQuestions = shuffleArray([...data]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    questionIndex = 0;
    loadKelimeOkumaQuestion();
}

function loadKelimeOkumaQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Kelimeyi göster
    const elifLetterEl = document.getElementById('elif-letter');
    elifLetterEl.textContent = currentQuestion.kelime;
    elifLetterEl.style.color = '#000000'; // Siyah
    
    // Açıklama metnini gizle, ses butonunu göster
    const instructionEl = document.getElementById('elif-question-instruction');
    if (instructionEl) {
        instructionEl.style.display = 'none';
    }
    
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    // Audio button'a ses dosyasını bağla
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
        audioBtn.onclick = () => {
            if (currentQuestion.audioUrl) {
                playSafeAudio(currentQuestion.audioUrl);
            }
        };
    }
    
    // Doğru cevap: kelimenin okunuşu
    const correctAnswer = currentQuestion.okunus;
    const allKelimeler = window.harf1Data || [];
    
    // Yanlış seçenekler: diğer kelimelerin okunuşları
    const wrongOptions = getRandomItems(
        allKelimeler.filter(k => k.id !== currentQuestion.id),
        3
    ).map(k => k.okunus);
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkKelimeOkumaAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkKelimeOkumaAnswer(index, selectedAnswer) {
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
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
    setTimeout(() => {
        questionIndex++;
        loadKelimeOkumaQuestion();
    }, 1200);
}

/**
 * Elif Ba Cezm submode - learn words with sukun (cezm)
 */
async function startCezmGame() {
    const data = await loadHarf2Data();
    
    if (data.length === 0) {
        showToast('Cezm verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Shuffle questions
    currentQuestions = shuffleArray([...data]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    questionIndex = 0;
    loadCezmQuestion();
}

function loadCezmQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Kelimeyi göster
    const elifLetterEl = document.getElementById('elif-letter');
    elifLetterEl.textContent = currentQuestion.kelime;
    elifLetterEl.style.color = '#000000'; // Siyah
    elifLetterEl.style.fontSize = '3.5rem'; // Büyük font
    elifLetterEl.style.fontWeight = '600'; // Kalın
    
    // Açıklama metnini gizle
    const instructionEl = document.getElementById('elif-question-instruction');
    if (instructionEl) {
        instructionEl.style.display = 'none';
    }
    
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    // Audio button'a ses dosyasını bağla
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.onclick = () => {
            if (currentQuestion.audioUrl) {
                playSafeAudio(currentQuestion.audioUrl);
            }
        };
    }
    
    // Doğru cevap: kelimenin okunuşu
    const correctAnswer = currentQuestion.okunus;
    const allKelimeler = window.harf2Data || [];
    
    // Yanlış seçenekler: diğer kelimelerin okunuşları
    const wrongOptions = getRandomItems(
        allKelimeler.filter(k => k.id !== currentQuestion.id),
        3
    ).map(k => k.okunus);
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkCezmAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkCezmAnswer(index, selectedAnswer) {
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
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained;
        updateTaskProgress('correct', 1);
        
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    updateDailyGoalDisplay();
    
    setTimeout(() => {
        questionIndex++;
        loadCezmQuestion();
    }, 1200);
}

/**
 * Elif Ba Harfler ve İsimler submode - learn letters with their names
 */
async function startHarflerVeIsimlerGame() {
    const data = await loadHarf3Data();
    
    if (data.length === 0) {
        showToast('Harf verisi yüklenemedi', 'error');
        goToMainMenu();
        return;
    }
    
    // Shuffle questions
    currentQuestions = shuffleArray([...data]).slice(0, CONFIG.QUESTIONS_PER_GAME);
    
    document.getElementById('elif-ba-screen').classList.remove('hidden');
    document.getElementById('elif-total-questions').textContent = currentQuestions.length;
    
    questionIndex = 0;
    loadHarflerVeIsimlerQuestion();
}

function loadHarflerVeIsimlerQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // Rastgele olarak harf->isim veya isim->harf soruları sor
    const questionType = Math.random() < 0.5 ? 'harf_to_isim' : 'isim_to_harf';
    currentQuestion._questionType = questionType; // Geçici olarak sakla
    
    const elifLetterEl = document.getElementById('elif-letter');
    
    // Soru tipine göre gösterilecek içeriği belirle
    if (questionType === 'isim_to_harf') {
        // İsim gösterilir, harf sorulur
        elifLetterEl.textContent = currentQuestion.isim;
        elifLetterEl.style.fontSize = '2.5rem'; // İsimler için biraz daha küçük
    } else {
        // Harf gösterilir, isim sorulur
        elifLetterEl.textContent = currentQuestion.harf;
        elifLetterEl.style.fontSize = '3.5rem'; // Harfler için büyük font
    }
    
    elifLetterEl.style.color = '#000000'; // Siyah
    elifLetterEl.style.fontWeight = '600'; // Kalın
    elifLetterEl.classList.remove('hareke-symbol'); // Harekeler class'ını kaldır
    
    // Açıklama metnini gizle, ses butonunu göster
    const instructionEl = document.getElementById('elif-question-instruction');
    if (instructionEl) {
        instructionEl.style.display = 'none';
    }
    
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    // Audio button'a ses dosyasını bağla
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
        audioBtn.onclick = () => {
            if (currentQuestion.audioUrl) {
                playSafeAudio(currentQuestion.audioUrl);
            }
        };
    }
    
    const allHarfler = window.harf3Data || [];
    let correctAnswer;
    let wrongOptions;
    
    if (questionType === 'isim_to_harf') {
        // Doğru cevap: harf
        correctAnswer = currentQuestion.harf;
        // Yanlış seçenekler: diğer harflerin harfleri (benzersiz harflerden seç)
        const uniqueHarfler = [...new Set(allHarfler.map(h => h.harf))];
        wrongOptions = getRandomItems(
            uniqueHarfler.filter(h => h !== correctAnswer),
            3
        );
    } else {
        // Doğru cevap: harfin ismi
        correctAnswer = currentQuestion.isim;
        // Yanlış seçenekler: diğer harflerin isimleri
        wrongOptions = getRandomItems(
            allHarfler.filter(h => h.id !== currentQuestion.id && h.isim !== correctAnswer),
            3
        ).map(h => h.isim);
    }
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    const optionsContainer = document.getElementById('elif-options');
    optionsContainer.innerHTML = options.map((option, index) => `
        <button class="answer-option" onclick="checkHarflerVeIsimlerAnswer(${index}, '${option.replace(/'/g, "\\'")}')">
            ${option}
        </button>
    `).join('');
}

function checkHarflerVeIsimlerAnswer(index, selectedAnswer) {
    const questionType = currentQuestion._questionType || 'harf_to_isim';
    const correctAnswer = questionType === 'isim_to_harf' ? currentQuestion.harf : currentQuestion.isim;
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
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained;
        updateTaskProgress('correct', 1);
        
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    updateDailyGoalDisplay();
    
    setTimeout(() => {
        questionIndex++;
        loadHarflerVeIsimlerQuestion();
    }, 1200);
}

/**
 * Elif Ba Harekeler submode - vowel marks game
 */
async function startElifHarekelerGame(harfData) {
    const harekeler = [
        { name: 'Fetha', symbol: 'ـَ', sound: 'e' },
        { name: 'Kesra', symbol: 'ـِ', sound: 'i' },
        { name: 'Damme', symbol: 'ـُ', sound: 'u' },
        { name: 'Sukun', symbol: 'ـْ', sound: '-' },
        { name: 'Şedde', symbol: 'ـّ', sound: 'çift' },
        { name: 'Tenvin Fetha', symbol: 'ـً', sound: 'en' },
        { name: 'Tenvin Kesra', symbol: 'ـٍ', sound: 'in' },
        { name: 'Tenvin Damme', symbol: 'ـٌ', sound: 'un' }
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
    loadElifHarekelerQuestion();
}

function loadElifHarekelerQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    
    currentQuestion = currentQuestions[questionIndex];
    
    document.getElementById('elif-question-number').textContent = questionIndex + 1;
    
    // JSON'dan harf bilgilerini al (sesTipi ve renkKodu) - harekeler modunda harf objesi mevcut
    const harfObj = currentQuestion.harf || {};
    const sesTipi = harfObj.sesTipi || '';
    const renkKodu = harfObj.renkKodu || '';
    
    // Kalın sesli ve peltek sesli harf kontrolü - JSON'daki sesTipi alanından
    const isKalinSesli = sesTipi.includes('kalın') || sesTipi.includes('kalin');
    const isPeltekSesli = sesTipi.includes('peltek');
    
    // Hareke sembolünü göster - kırmızı hareke, siyah çizgi
    const elifLetterEl = document.getElementById('elif-letter');
    elifLetterEl.textContent = currentQuestion.hareke.symbol;
    elifLetterEl.classList.add('hareke-symbol'); // Harekeler için özel class ekle
    
    // Harekeler modunda açıklama metnini ve ses butonunu gizle
    const instructionEl = document.getElementById('elif-question-instruction');
    if (instructionEl) {
        instructionEl.style.display = 'none';
    }
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = 'none';
    }
    document.getElementById('elif-combo').textContent = comboCount;
    document.getElementById('elif-session-score').textContent = formatNumber(sessionScore);
    
    const harekeler = [
        { name: 'Fetha', symbol: 'ـَ' },
        { name: 'Kesra', symbol: 'ـِ' },
        { name: 'Damme', symbol: 'ـُ' },
        { name: 'Sukun', symbol: 'ـْ' },
        { name: 'Şedde', symbol: 'ـّ' },
        { name: 'Tenvin Fetha', symbol: 'ـً' },
        { name: 'Tenvin Kesra', symbol: 'ـٍ' },
        { name: 'Tenvin Damme', symbol: 'ـٌ' }
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
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
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
    
    // JSON'dan sesTipi ve renkKodu bilgilerini al
    const sesTipi = currentQuestion.sesTipi || '';
    const renkKodu = currentQuestion.renkKodu || '';
    
    // Kalın sesli ve peltek sesli harf kontrolü - JSON'daki sesTipi alanından
    const isKalinSesli = sesTipi.includes('kalın') || sesTipi.includes('kalin');
    const isPeltekSesli = sesTipi.includes('peltek');
    
    // Harf rengi siyah (kart arka planı renkli olacak, harf siyah)
    const harfColor = '#000000'; // Siyah harfler
    
    // Harfi göster ve renk uygula
    const elifLetterEl = document.getElementById('elif-letter');
    elifLetterEl.textContent = currentQuestion.harf;
    elifLetterEl.style.color = harfColor;
    elifLetterEl.classList.remove('hareke-symbol'); // Harekeler class'ını kaldır
    
    // Normal harfler modunda açıklama metnini gizle, ses butonunu göster
    const instructionEl = document.getElementById('elif-question-instruction');
    if (instructionEl) {
        instructionEl.style.display = 'none';
    }
    const audioBtn = document.getElementById('elif-audio-btn');
    if (audioBtn) {
        audioBtn.style.display = '';
    }
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
        
        const basePoints = getBasePoints(currentDifficulty);
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
    } else {
        wrongCount++;
        comboCount = 0;
        buttons[index].classList.add('wrong');
    }
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
    setTimeout(() => {
        questionIndex++;
        loadElifQuestion();
    }, 1200);
}

function playCurrentLetterAudio() {
    if (!currentQuestion) return;
    
    // Harekeler modunda ses çalma
    if (currentElifBaSubmode === 'harekeler') {
        return;
    }
    
    // Kelimeler modunda harf.audioUrl kullan
    let audioUrl = null;
    if (currentQuestion.harf && currentQuestion.harf.audioUrl) {
        audioUrl = currentQuestion.harf.audioUrl;
    } else if (currentQuestion.audioUrl) {
        audioUrl = currentQuestion.audioUrl;
    }
    
    if (audioUrl) {
        playSafeAudio(audioUrl);
    }
}

// ========================================
// DAILY TASKS & STREAK
// ========================================

async function checkDailyTasks() {
    const today = getLocalDateString();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Load daily tasks - try Firebase first for Firebase users, then localStorage
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const isFirebaseUser = user && !user.id.startsWith('local-');
    
    if (isFirebaseUser && typeof window.loadDailyTasks === 'function') {
        try {
            const firebaseTasks = await window.loadDailyTasks();
            if (firebaseTasks && firebaseTasks.tasks && firebaseTasks.tasks.length > 0) {
                dailyTasks = firebaseTasks;
            }
        } catch (error) {
            console.warn('⚠️ Firebase daily tasks load failed, using localStorage:', error);
        }
    }
    
    // If still empty, load from localStorage
    if (!dailyTasks || !dailyTasks.tasks || dailyTasks.tasks.length === 0) {
        const savedTasks = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, {
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
        dailyTasks = savedTasks;
    }
    
    // Check if date has changed (new day started)
    if (!dailyTasks.lastTaskDate || dailyTasks.lastTaskDate !== today) {
        console.log(`📅 Yeni gün başladı! Eski tarih: ${dailyTasks.lastTaskDate || 'yok'}, Yeni tarih: ${today}, Saat: ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
        
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
            },
            rewardClaimedDate: null // Yeni gün başladığında ödül kutusunu reset et
        };
        saveToStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
        
        // Also reset daily progress for new day
        dailyProgress = 0;
        saveToStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: today, points: 0 });
        localStorage.removeItem('hasene_last_daily_goal_completed');
        
        // Update UI
        updateStatsDisplay();
    }
}

function updateTaskProgress(type, value) {
    // Check if day has changed before updating (in case user kept app open past midnight)
    const today = getLocalDateString();
    if (dailyTasks.lastTaskDate !== today) {
        checkDailyTasks();
    }
    
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
// ISLAMIC_TEACHINGS is defined in constants.js

function checkRewardBoxStatus() {
    const rewardBox = document.getElementById('reward-box');
    const statusEl = document.getElementById('reward-box-status');
    if (!rewardBox || !statusEl) return;
    
    const today = getLocalDateString();
    
    // Bugün zaten alındı mı? - ÖNCELİKLE BU KONTROL EDİLMELİ
    if (dailyTasks.rewardClaimedDate === today) {
        // Ödül alındıysa kesinlikle pasif yap
        rewardBox.classList.remove('active');
        rewardBox.classList.add('claimed');
        statusEl.textContent = '✓ Bugünkü ödül alındı!';
        // Tıklamayı engelle
        rewardBox.style.pointerEvents = 'none';
        rewardBox.style.cursor = 'not-allowed';
        rewardBox.style.opacity = '0.6';
        return;
    }
    
    // Tüm görevler tamamlandı mı?
    const allTasksComplete = areAllTasksComplete();
    
    if (allTasksComplete) {
        // Görevler tamamlandı ve ödül alınmamış - aktif yap
        rewardBox.classList.add('active');
        rewardBox.classList.remove('claimed');
        statusEl.textContent = '🎉 Tıkla ve ödülünü al!';
        // Tıklanabilir yap
        rewardBox.style.pointerEvents = 'auto';
        rewardBox.style.cursor = 'pointer';
        rewardBox.style.opacity = '1';
    } else {
        // Görevler tamamlanmadı - pasif yap
        rewardBox.classList.remove('active', 'claimed');
        statusEl.textContent = 'Görevleri tamamla!';
        // Tıklamayı engelle
        rewardBox.style.pointerEvents = 'none';
        rewardBox.style.cursor = 'not-allowed';
        rewardBox.style.opacity = '0.6';
    }
}

function areAllTasksComplete() {
    if (!dailyTasks.tasks || dailyTasks.tasks.length === 0) return false;
    
    // Ana görevlerin hepsinin tamamlanmış olması gerekiyor
    return dailyTasks.tasks.every(task => task.progress >= task.target);
}

function claimDailyReward() {
    const rewardBox = document.getElementById('reward-box');
    if (!rewardBox) return;
    
    const today = getLocalDateString();
    
    // Zaten alındıysa çık - hem class hem de date kontrolü
    if (dailyTasks.rewardClaimedDate === today || rewardBox.classList.contains('claimed')) {
        showToast('Bugünkü ödül zaten alındı!', 'info');
        checkRewardBoxStatus(); // UI'ı güncelle
        return;
    }
    
    // Aktif değilse çık
    if (!rewardBox.classList.contains('active')) {
        return;
    }
    
    // Ödül alınırken kutuya tıklamayı engelle (double-click koruması)
    rewardBox.style.pointerEvents = 'none';
    
    // Rastgele ödül seç
    const rewardAmount = DAILY_REWARDS[Math.floor(Math.random() * DAILY_REWARDS.length)];
    
    // Rastgele öğreti seç
    const teachings = window.ISLAMIC_TEACHINGS || [];
    const teaching = teachings[Math.floor(Math.random() * teachings.length)];
    
    // Hasene ekle
    totalPoints += rewardAmount;
    
    // Ödül alındı olarak işaretle - ÖNCE bu set edilmeli
    dailyTasks.rewardClaimedDate = today;
    
    // Hemen storage'a kaydet (async olmadan)
    saveToStorage(CONFIG.STORAGE_KEYS.DAILY_TASKS, dailyTasks);
    debouncedSaveStats();
    
    // UI güncelle - ÖDÜL KUTUSUNU HEMEN PASİF YAP
    checkRewardBoxStatus();
    updateDisplay();
    
    // Ödül modalı göster
    showRewardModal(rewardAmount, teaching);
    
    // Pointer events'i geri aç (modal kapandıktan sonra)
    setTimeout(() => {
        rewardBox.style.pointerEvents = '';
    }, 100);
}

function showRewardModal(amount, teaching) {
    // Mevcut modal varsa kapat
    closeAllModals();
    
    if (!teaching) {
        // Fallback if teaching is not available
        const modalHTML = `
            <div id="reward-result-modal" class="modal" style="display: flex;">
                <div class="modal-content glass-card reward-result-content">
                    <div class="reward-celebration">🎉</div>
                    <h2>Tebrikler!</h2>
                    <div class="reward-amount">+${formatNumber(amount)} Hasene</div>
                    <button class="primary-btn" onclick="closeRewardModal()">Tamam</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return;
    }
    
    // Modal oluştur - constants.js yapısına göre (arabic, turkish, explanation)
    const modalHTML = `
        <div id="reward-result-modal" class="modal" style="display: flex;">
            <div class="modal-content glass-card reward-result-content">
                <div class="reward-celebration">🎉</div>
                <h2>Tebrikler!</h2>
                <div class="reward-amount">+${formatNumber(amount)} Hasene</div>
                <div class="reward-teaching">
                    <div class="teaching-arabic">${teaching.arabic || ''}</div>
                    <div class="teaching-turkish">${teaching.turkish || ''}</div>
                    <div class="teaching-explanation">${teaching.explanation || ''}</div>
                </div>
                <button class="primary-btn" onclick="closeRewardModal()">Tamam</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Konfeti efekti (basit)
    playSafeAudio && typeof playSuccessSound === 'function' && playSuccessSound();
}

function closeRewardModal() {
    const modal = document.getElementById('reward-result-modal');
    if (modal) {
        modal.remove();
    }
}

// Window'a export et
window.claimDailyReward = claimDailyReward;
window.closeRewardModal = closeRewardModal;

/**
 * Check and update streak based on daily goal completion
 * Streak only increases when daily goal is completed (per README)
 */
function updateStreakOnDailyGoalCompletion() {
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
    
    // Only update streak if daily goal was completed today
    // Check if we already updated streak for today's goal completion
    if (streakData.lastPlayDate === today) {
        // Already updated streak for today
        return;
    }
    
    // Check if yesterday's goal was completed (to continue streak)
    if (streakData.lastPlayDate === yesterday) {
        // Continue streak - yesterday's goal was completed
        streakData.currentStreak++;
    } else if (streakData.lastPlayDate && streakData.lastPlayDate !== today && streakData.lastPlayDate !== yesterday) {
        // Streak broken - gap in days
        streakData.currentStreak = 1; // Start new streak
    } else if (!streakData.lastPlayDate || streakData.lastPlayDate === '') {
        // First time completing daily goal
        streakData.currentStreak = 1;
    }
    
    // Update last play date to today (goal completed)
    streakData.lastPlayDate = today;
    streakData.bestStreak = Math.max(streakData.bestStreak, streakData.currentStreak);
    
    if (!streakData.playDates.includes(today)) {
        streakData.playDates.push(today);
        streakData.totalPlayDays++;
    }
    
    debouncedSaveStats();
}

/**
 * Check streak status on app load (to reset if needed)
 * This checks if streak should be reset due to gap in days
 */
function checkStreak() {
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
    
    // If last play date is not today and not yesterday, streak might be broken
    // But don't update streak here - only update when daily goal is completed
    // This function just validates streak state on load
    if (streakData.lastPlayDate && streakData.lastPlayDate !== today && streakData.lastPlayDate !== yesterday && streakData.lastPlayDate !== '') {
        // There's a gap, but don't reset streak until we check if goal was completed today
        // Streak will be reset when daily goal is completed (if yesterday wasn't completed)
        // or will continue if today's goal is completed
    }
}

/**
 * Handle user logout
 */
async function handleUserLogout() {
    if (!confirm('Çıkış yapmak istediğinize emin misiniz? Tüm veriler kaydedilecek.')) {
        return;
    }
    
    // Sign out using auth.js function
    if (typeof window.signOut === 'function') {
        await window.signOut();
    } else {
        // Fallback: Clear localStorage
        localStorage.removeItem('hasene_user_id');
        localStorage.removeItem('hasene_username');
        localStorage.removeItem('hasene_user_email');
    }
    
    // Update UI
    updateUserStatusDisplay();
    
    // Show logout message
    showToast('👋 Çıkış yapıldı', 'info', 2000);
    
    // If in game, go to main menu
    if (currentGameMode) {
        goToMainMenu();
    }
}

function checkDailyGoal() {
    const today = getLocalDateString();
    const lastGoalCompleted = localStorage.getItem('hasene_last_daily_goal_completed');
    
    // Check if daily goal is reached and not already completed today
    if (dailyProgress >= dailyGoal && lastGoalCompleted !== today) {
        // Daily goal completed!
        // Toast mesajı kaldırıldı - gereksiz pop-up
        totalPoints += CONFIG.DAILY_GOAL_BONUS;
        dailyProgress += CONFIG.DAILY_GOAL_BONUS; // Bonus da günlük vird'e eklenir
        
        // Mark as completed today
        localStorage.setItem('hasene_last_daily_goal_completed', today);
        
        // Update streak when daily goal is completed (per README: "Her gün, günlük vird hedefi tamamlanırsa seri artar")
        updateStreakOnDailyGoalCompletion();
        
        // Save stats immediately
        debouncedSaveStats();
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
    updateUserStatusDisplay();
}

/**
 * Update user status display (username, login/logout buttons)
 */
function updateUserStatusDisplay() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const usernameDisplay = document.getElementById('current-username-display');
    const statusIndicator = document.getElementById('user-status-indicator');
    const loginBtn = document.getElementById('user-login-btn');
    const logoutBtn = document.getElementById('user-logout-btn');
    const avatarEl = document.getElementById('user-avatar');
    
    if (!usernameDisplay || !statusIndicator || !loginBtn || !logoutBtn) return;
    
    const username = user?.username || localStorage.getItem('hasene_username') || 'Misafir';
    const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı'];
    const isLoggedIn = user && username && !defaultUsernames.includes(username) && username.trim() !== '';
    
    // Avatar'ı cinsiyete göre güncelle
    if (avatarEl) {
        if (isLoggedIn) {
            const gender = localStorage.getItem('hasene_user_gender');
            if (gender === 'male') {
                avatarEl.textContent = '👨';
            } else if (gender === 'female') {
                avatarEl.textContent = '👩';
            } else {
                avatarEl.textContent = '👤'; // Varsayılan
            }
        } else {
            avatarEl.textContent = '👤'; // Misafir için varsayılan
        }
    }
    
    // Update username display
    usernameDisplay.textContent = isLoggedIn ? username : 'Misafir';
    
    // Update status indicator
    if (isLoggedIn) {
        statusIndicator.textContent = '🟢 Giriş Yapıldı';
        statusIndicator.style.background = 'rgba(76, 175, 80, 0.2)';
        statusIndicator.style.color = '#4caf50';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        statusIndicator.textContent = '🔴 Çıkış Yapıldı';
        statusIndicator.style.background = 'rgba(244, 67, 54, 0.2)';
        statusIndicator.style.color = '#f44336';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

/**
 * Handle user logout
 */
async function handleUserLogout() {
    if (!confirm('Çıkış yapmak istediğinize emin misiniz? Tüm veriler kaydedilecek.')) {
        return;
    }
    
    // Sign out using auth.js function
    if (typeof window.signOut === 'function') {
        await window.signOut();
    } else {
        // Fallback: Clear localStorage
        localStorage.removeItem('hasene_user_id');
        localStorage.removeItem('hasene_username');
        localStorage.removeItem('hasene_user_email');
    }
    
    // Update UI
    updateUserStatusDisplay();
    
    // Show logout message
    showToast('👋 Çıkış yapıldı', 'info', 2000);
    
    // If in game, go to main menu
    if (currentGameMode) {
        goToMainMenu();
    }
}

function updateDailyGoalDisplay() {
    // Mantık açıklaması:
    // - totalPoints: Tüm zamanlardan birikmiş toplam Hasene (birikimli, sıfırlanmaz)
    // - dailyProgress: Sadece bugün kazanılan Hasene (her gün sıfırlanır)
    // 
    // Normal durum: totalPoints >= dailyProgress
    //   - İlk oyunda: totalPoints = dailyProgress (eşit)
    //   - Sonraki günlerde: totalPoints > dailyProgress (çünkü önceki günlerden birikmiş)
    //
    // Ancak mantık hatası varsa (örneğin dailyProgress yanlış kaydedilmişse), düzelt:
    // Eğer dailyProgress > totalPoints ise (ve önceki günlerden birikim yoksa), bu hata demektir
    // Çünkü dailyProgress sadece bugünkü puan, totalPoints ise birikimli
    
    // İlk oyunda (totalPoints = 0 veya çok küçükse) ve dailyProgress fazlaysa, hata var
    // Ancak önceki günlerden birikim varsa (totalPoints büyükse), fark normaldir
    if (totalPoints < 500 && dailyProgress > totalPoints) {
        // İlk oyunda veya az puan varsa, dailyProgress toplam puandan fazla olamaz
        // Sessizce düzelt (console.warn yerine console.log kullan - çok fazla uyarı vermesin)
        const today = getLocalDateString();
        const savedProgress = loadFromStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { date: '', points: 0 });
        if (savedProgress.date !== today) {
            // Tarih farklıysa, dailyProgress'i 0 yap (yeni gün)
            dailyProgress = 0;
        } else {
            // Aynı günse, totalPoints'e eşitle (ama totalPoints 0 ise, dailyProgress de 0 olmalı)
            dailyProgress = totalPoints || 0;
        }
        saveToStorage(CONFIG.STORAGE_KEYS.DAILY_PROGRESS, { 
            date: getLocalDateString(), 
            points: dailyProgress 
        });
        // Sadece bir kere log (çok fazla tekrar etmesin)
        if (!window.dailyProgressFixLogged) {
            console.log(`ℹ️ dailyProgress mantık hatası düzeltildi: ${dailyProgress} (totalPoints: ${totalPoints})`);
            window.dailyProgressFixLogged = true;
        }
    }
    
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
    
    // Ödül kutusu durumunu güncelle (modal içindeki ödül kutusu için)
    checkRewardBoxStatus();
    
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
    
    // Populate the harf grid - Harfler zaten doğru sırada (Elif'ten başlayarak)
    // RTL direction CSS'te eklenmeli (sağdan sola)
    const harfGrid = document.getElementById('harf-grid');
    if (harfGrid) {
        harfGrid.innerHTML = data.map((harf, index) => {
            // Güvenli string escape için data attribute kullan
            const audioUrl = harf.audioUrl || '';
            const harfName = harf.harf || '';
            const harfIsim = harf.isim || harf.okunus || '';
            // JSON'dan sesTipi ve renkKodu bilgilerini al
            const sesTipi = harf.sesTipi || '';
            const renkKodu = harf.renkKodu || '';
            
            // Kalın sesli ve peltek sesli harf kontrolü - JSON'daki sesTipi alanından alınıyor
            const isKalinSesli = sesTipi.includes('kalın') || sesTipi.includes('kalin');
            const isPeltekSesli = sesTipi.includes('peltek');
            const kalinClass = isKalinSesli ? ' kalin-sesli' : '';
            const peltekClass = isPeltekSesli ? ' peltek-sesli' : '';
            
            // Harf rengi siyah (kart arka planı renkli olacak, harf siyah)
            const harfColor = '#000000'; // Siyah harfler
            
            return `
            <div class="harf-card${kalinClass}${peltekClass}" 
                 data-audio-url="${audioUrl.replace(/"/g, '&quot;')}" 
                 data-harf-name="${harfName.replace(/"/g, '&quot;')}" 
                 data-ses-tipi="${sesTipi.replace(/"/g, '&quot;')}"
                 data-renk-kodu="${renkKodu.replace(/"/g, '&quot;')}">
                <div class="harf-arabic" style="color: ${harfColor};">${harf.harf}</div>
                <div class="harf-name">${harfIsim}</div>
            </div>
        `;
        }).join('');
        
        // Event listener'ları ekle
        harfGrid.querySelectorAll('.harf-card').forEach(card => {
            card.addEventListener('click', function() {
                const audioUrl = this.getAttribute('data-audio-url') || '';
                const harfName = this.getAttribute('data-harf-name') || '';
                playHarfAudio(audioUrl, harfName);
            });
        });
    }
    
    // Hide all screens and show Harf Tablosu
    hideAllScreens();
    document.getElementById('elif-ba-tablo-screen').classList.remove('hidden');
}

function playHarfAudio(audioUrl, harfName) {
    // audioUrl kontrolü - boş string veya null/undefined kontrolü
    if (audioUrl && audioUrl.trim() !== '') {
        try {
            playSafeAudio(audioUrl);
        } catch (err) {
            console.warn('Harf sesi çalınamadı:', err);
            if (harfName) {
                showToast(`${harfName} harfinin sesi bulunamadı`, 'info', 2000);
            }
        }
    } else {
        // Ses yoksa harf adını göster
        if (harfName) {
            showToast(`${harfName}`, 'info', 1000);
        }
    }
}

/**
 * Show Harfler ve İsimleri Tablosu
 * Displays harf3.json data in a table format similar to Harf Tablosu
 */
async function showHarflerVeIsimleriTablosu() {
    const data = await loadHarf3Data();
    
    if (data.length === 0) {
        showToast('Harf verisi yüklenemedi', 'error');
        return;
    }
    
    // Populate the harf isimler grid
    const harfIsimlerGrid = document.getElementById('harf-isimler-grid');
    if (harfIsimlerGrid) {
        harfIsimlerGrid.innerHTML = data.map((item, index) => {
            const audioUrl = item.audioUrl || '';
            const harfText = item.harf || '';
            const harfIsim = item.isim || item.okunus || '';
            
            // Harf rengi siyah
            const harfColor = '#000000';
            
            return `
            <div class="harf-isimler-card" 
                 data-audio-url="${audioUrl.replace(/"/g, '&quot;')}" 
                 data-harf-text="${harfText.replace(/"/g, '&quot;')}"
                 onclick="playHarfAudio('${audioUrl.replace(/'/g, "\\'")}', '${harfIsim.replace(/'/g, "\\'")}')">
                <div class="harf-isimler-arabic" style="color: ${harfColor};">${harfText}</div>
                <div class="harf-isimler-name">${harfIsim}</div>
            </div>
        `;
        }).join('');
    }
    
    // Hide all screens and show Harfler ve İsimleri Tablosu
    hideAllScreens();
    document.getElementById('elif-ba-isimler-tablo-screen').classList.remove('hidden');
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

function claimDailyReward() {
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
    console.log('🔀 Karma Oyun başlatılıyor...');
    
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
    
    // 1. Kelime Çevir soruları (4 adet) - Akıllı seçim ile yanlış cevaplanan kelimeler öncelikli
    const filteredKelime = filterByDifficulty(kelimeData, currentDifficulty);
    const selectedKelime = filteredKelime.length > 4 
        ? selectIntelligentWords(filteredKelime, 4, false)
        : getRandomItems(filteredKelime, Math.min(4, filteredKelime.length));
    const kelimeQuestions = selectedKelime.map(word => ({
        type: 'kelime-cevir',
        data: word,
        question: word.kelime,
        correctAnswer: word.anlam,
        options: generateOptions(word.anlam, kelimeData.map(w => w.anlam))
    }));
    
    // 2. Dinle Bul soruları (3 adet) - Akıllı seçim ile yanlış cevaplanan kelimeler öncelikli
    const audioWords = kelimeData.filter(w => w.ses_dosyasi || w.audio);
    const filteredAudio = filterByDifficulty(audioWords, currentDifficulty);
    const selectedAudio = filteredAudio.length > 3 
        ? selectIntelligentWords(filteredAudio, 3, false)
        : getRandomItems(filteredAudio, Math.min(3, filteredAudio.length));
    const dinleQuestions = selectedAudio.map(word => ({
        type: 'dinle-bul',
        data: word,
        question: '🔊 Dinle ve doğru anlamı seç',
        audioUrl: word.ses_dosyasi || word.audio,
        correctAnswer: word.anlam,
        options: generateOptions(word.anlam, kelimeData.map(w => w.anlam))
    }));
    
    // 3. Eşleştirme sorusu (2 adet - her biri 4 çift) - Akıllı seçim ile
    const matchQuestions = [];
    for (let i = 0; i < 2; i++) {
        const filteredMatch = filterByDifficulty(kelimeData, currentDifficulty);
        const matchWords = filteredMatch.length > 4 
            ? selectIntelligentWords(filteredMatch, 4, false)
            : getRandomItems(filteredMatch, Math.min(4, filteredMatch.length));
        matchQuestions.push({
            type: 'eslestirme',
            pairs: matchWords.map(w => ({
                arabic: w.kelime,
                turkish: w.anlam,
                id: w.id
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
    const harfQuestions = getRandomItems(harfData, 3).map(harf => ({
        type: 'harf-bul',
        data: harf,
        question: harf.harf,
        correctAnswer: harf.okunus || harf.isim,
        options: generateOptions(harf.okunus || harf.isim, harfData.map(h => h.okunus || h.isim))
    }));
    
    // Combine and shuffle all questions
    karmaQuestions = shuffleArray([
        ...kelimeQuestions,
        ...dinleQuestions,
        ...matchQuestions,
        ...boslukQuestions,
        ...harfQuestions
    ]);
    
    console.log(`🔀 ${karmaQuestions.length} karma soru oluşturuldu`);
    
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
    const uniqueAnswers = [...new Set(allAnswers.filter(a => a && a !== correctAnswer))];
    const wrongAnswers = getRandomItems(uniqueAnswers, 3);
    return shuffleArray([correctAnswer, ...wrongAnswers]);
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
    }
}

function renderKelimeCevirKarma(container, question) {
    container.innerHTML = `
        <div class="karma-type-badge">📝 Kelime Çevir</div>
        <div class="karma-arabic">${question.question}</div>
        <div class="karma-info">${question.data.sure_adi || ''}</div>
        <div class="karma-options">
            ${question.options.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${opt.replace(/'/g, "\\'")}', '${question.correctAnswer.replace(/'/g, "\\'")}')">
                    ${opt}
                </button>
            `).join('')}
        </div>
    `;
}

function renderDinleBulKarma(container, question) {
    container.innerHTML = `
        <div class="karma-type-badge">🎧 Dinle Bul</div>
        <div class="karma-audio-section">
            <button class="audio-btn large" onclick="playSafeAudio('${question.audioUrl}')">
                <img src="ASSETS/badges/hoparlor.png" alt="Dinle" class="audio-icon-inline"> Dinle
            </button>
        </div>
        <div class="karma-options">
            ${question.options.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${opt.replace(/'/g, "\\'")}', '${question.correctAnswer.replace(/'/g, "\\'")}')">
                    ${opt}
                </button>
            `).join('')}
        </div>
    `;
    // Auto play
    setTimeout(() => playSafeAudio(question.audioUrl), 300);
}

function renderEslestirmeKarma(container, question) {
    // Yeni eşleştirme sorusu için sayaçları sıfırla
    karmaMatchedCount = 0;
    karmaSelectedItem = null;
    
    karmaMatchPairs = question.pairs.map(p => ({ ...p, matched: false }));
    
    const arabicItems = shuffleArray([...question.pairs]);
    const turkishItems = shuffleArray([...question.pairs]);
    
    container.innerHTML = `
        <div class="karma-type-badge">🔗 Eşleştir</div>
        <div class="karma-match-instruction">Arapça kelimeleri Türkçe anlamlarıyla eşleştir</div>
        <div class="karma-match-grid">
            <div class="match-column arabic-column">
                ${arabicItems.map(p => `
                    <button class="match-item arabic" data-id="${p.id}" onclick="selectKarmaMatch(this, 'arabic', '${p.id}')">
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
    // Eşleşmiş öğeleri seçemezsin
    if (element.classList.contains('matched')) return;
    
    if (!karmaSelectedItem) {
        // İlk seçim - öğeyi seçili yap
        karmaSelectedItem = { element, type, id };
        element.classList.add('selected');
    } else if (karmaSelectedItem.element === element) {
        // Aynı öğeye tekrar tıklandı - seçimi kaldır
        element.classList.remove('selected');
        karmaSelectedItem = null;
    } else if (karmaSelectedItem.type === type) {
        // Aynı sütunda farklı öğe seçildi - önceki seçimi kaldır, yenisini seç
        karmaSelectedItem.element.classList.remove('selected');
        karmaSelectedItem = { element, type, id };
        element.classList.add('selected');
    } else {
        // Farklı sütun - eşleşme kontrolü (Duolingo mantığı)
        if (karmaSelectedItem.id === id) {
            // ✅ DOĞRU EŞLEŞME (Duolingo: Yeşil, eşleşmiş, disabled)
            const firstElement = karmaSelectedItem.element;
            
            // Seçili class'ını kaldır
            firstElement.classList.remove('selected');
            element.classList.remove('selected');
            
            // Eşleşmiş olarak işaretle (yeşil, disabled)
            firstElement.classList.add('matched');
            element.classList.add('matched');
            firstElement.disabled = true;
            element.disabled = true;
            
            karmaMatchedCount++;
            
            // Puan hesapla
            comboCount++;
            const basePoints = getBasePoints(currentDifficulty);
            const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
            const points = basePoints + comboBonus;
            sessionScore += points;
            dailyProgress += points;
            updateTaskProgress('correct', 1);
            
            // Rozet ve başarıları kontrol et
            checkBadgesAndAchievementsAfterPoints();
            
            // UI güncellemeleri
            updateDailyGoalDisplay();
            
            // Tüm çiftler eşleşti mi kontrol et
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
            // ❌ YANLIŞ EŞLEŞME (Duolingo: Kırmızı, sonra geri döner)
            const firstElement = karmaSelectedItem.element;
            
            // Kırmızı yap
            firstElement.classList.add('wrong');
            element.classList.add('wrong');
            comboCount = 0;
            
            // Kısa süre sonra geri döndür (seçimi kaldır)
            setTimeout(() => {
                firstElement.classList.remove('selected', 'wrong');
                element.classList.remove('selected', 'wrong');
            }, 800); // 800ms Duolingo benzeri
        }
        
        // Seçimi sıfırla
        karmaSelectedItem = null;
    }
}

function renderBoslukDoldurKarma(container, question) {
    container.innerHTML = `
        <div class="karma-type-badge">✍️ Boşluk Doldur</div>
        <div class="karma-arabic bosluk">${question.question}</div>
        <div class="karma-translation">${question.translation}</div>
        <div class="karma-options">
            ${question.options.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${opt.replace(/'/g, "\\'")}', '${question.correctAnswer.replace(/'/g, "\\'")}')">
                    ${opt}
                </button>
            `).join('')}
        </div>
    `;
}

function renderHarfBulKarma(container, question) {
    container.innerHTML = `
        <div class="karma-type-badge">🔤 Harf Bul</div>
        <div class="karma-arabic harf">${question.question}</div>
        <div class="karma-info">Bu harfin okunuşunu seç</div>
        <div class="karma-options">
            ${question.options.map((opt, i) => `
                <button class="answer-option" onclick="checkKarmaAnswer('${opt.replace(/'/g, "\\'")}', '${question.correctAnswer.replace(/'/g, "\\'")}')">
                    ${opt}
                </button>
            `).join('')}
        </div>
    `;
}

/**
 * Check karma answer
 */
function checkKarmaAnswer(selected, correct) {
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
        const comboBonus = CONFIG.COMBO_BONUS_PER_CORRECT;
        const gained = basePoints + comboBonus;
        sessionScore += gained;
        dailyProgress += gained; // Günlük vird'e ekle
        updateTaskProgress('correct', 1); // Görev ilerlemesine ekle
        
        // Rozet ve başarıları kontrol et (her puan kazanınca)
        checkBadgesAndAchievementsAfterPoints();
        
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
    
    // Günlük vird gösterimini güncelle
    updateDailyGoalDisplay();
    
    // Next question
    setTimeout(() => {
        karmaQuestionIndex++;
        loadKarmaQuestion();
    }, 1200);
}

// ========================================
// RESET ALL DATA (TEST FUNCTION)
// ========================================

/**
 * Reset all game data - TEST FUNCTION (Remove before production)
 */
async function resetAllData() {
    if (!confirm('⚠️ TÜM VERİLER SİLİNECEK!\n\nBu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?')) {
        return;
    }
    
    if (!confirm('Son uyarı: Tüm puanlar, rozetler, başarımlar, favoriler, istatistikler, günlük görevler, takvim, haftalık XP ve LİDER TABLOSU verileri silinecek. Emin misiniz?')) {
        return;
    }
    
    console.log('🔄 Tüm veriler sıfırlanıyor...');
    
    // Clear all localStorage keys - EXHAUSTIVE LIST
    const allStorageKeys = [
        // CONFIG.STORAGE_KEYS
        CONFIG.STORAGE_KEYS.TOTAL_POINTS,
        CONFIG.STORAGE_KEYS.STREAK_DATA,
        CONFIG.STORAGE_KEYS.DAILY_TASKS,
        CONFIG.STORAGE_KEYS.WORD_STATS,
        CONFIG.STORAGE_KEYS.GAME_STATS,
        CONFIG.STORAGE_KEYS.DAILY_GOAL,
        CONFIG.STORAGE_KEYS.DAILY_PROGRESS,
        CONFIG.STORAGE_KEYS.ACHIEVEMENTS,
        CONFIG.STORAGE_KEYS.DIFFICULTY,
        
        // Game data
        'hasene_word_stats',
        'hasene_favorites',
        'hasene_achievements',
        'hasene_badges',
        
        // Daily and calendar
        'hasene_dailyReward',
        'hasene_last_daily_goal_completed',
        'hasene_last_daily_reward',
        
        // Hints
        'hasene_hintsUsedToday',
        'hasene_hintsDate',
        'hasene_lastHintDate',
        'hasene_hintsCount',
        
        // Onboarding
        'hasene_onboarding_complete',
        'hasene_onboarding_seen_v2',
        
        // Weekly XP and leaderboard (all weeks)
        // These will be removed by the hasene_ prefix cleanup below
    ];
    
    // Remove all specific keys
    allStorageKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✓ Removed: ${key}`);
    });
    
    // Clear ALL localStorage items that start with 'hasene_'
    // This includes weekly XP keys, daily stats, calendar data, etc.
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hasene_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✓ Removed: ${key}`);
    });
    
    // Also clear any daily stats keys (format: hasene_daily_YYYY-MM-DD)
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allKeys.push(key);
    }
    allKeys.forEach(key => {
        if (key.startsWith('hasene_daily_') || 
            key.startsWith('hasene_weekly_xp_') ||
            key.startsWith('hasene_calendar_') ||
            key.includes('hasene') && key.includes('daily') ||
            key.includes('hasene') && key.includes('weekly') ||
            key.includes('hasene') && key.includes('calendar')) {
            localStorage.removeItem(key);
            console.log(`✓ Removed: ${key}`);
        }
    });
    
    // Reset global variables
    totalPoints = 0;
    currentLevel = 1;
    sessionScore = 0;
    correctCount = 0;
    wrongCount = 0;
    comboCount = 0;
    maxCombo = 0;
    questionIndex = 0;
    dailyProgress = 0;
    dailyGoal = 2700;
    
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
    
    wordStats = {};
    favorites = [];
    unlockedAchievements = [];
    badgesUnlocked = {};
    
    // Reset reading mode indices
    currentAyetIndex = 0;
    currentDuaIndex = 0;
    currentHadisIndex = 0;
    
    // Reset submode tracking
    currentKelimeSubmode = 'classic';
    currentElifBaSubmode = 'harfler';
    
    // Reset onboarding
    onboardingSlideIndex = 0;
    
    // Close all modals
    closeAllModals();
    
    // Reset current game state
    currentGameMode = null;
    currentDifficulty = 'easy';
    currentQuestions = [];
    currentQuestion = null;
    currentOptions = [];
    
    // CRITICAL: Save username BEFORE clearing localStorage (for later cleanup)
    const savedUsername = localStorage.getItem('hasene_username');
    
    // Delete Firebase data if Firebase user (async operation - MUST WAIT)
    // IMPORTANT: Delete with CURRENT user ID BEFORE signOut
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (user && !user.id.startsWith('local-') && typeof window.firestoreDelete === 'function') {
        console.log('🔥 Firebase verileri siliniyor (user ID:', user.id + ')...');
        
        // Delete weekly leaderboard entries for all weeks (current week and past weeks)
        const deletePromises = [
            window.firestoreDelete('user_stats', user.id),
            window.firestoreDelete('daily_tasks', user.id)
        ];
        
        // Delete current week's leaderboard entry
        if (typeof window.getWeekStartString === 'function') {
            const weekStart = window.getWeekStartString();
            const leaderboardDocId = `${user.id}_${weekStart}`;
            deletePromises.push(window.firestoreDelete('weekly_leaderboard', leaderboardDocId));
            console.log(`🔥 Haftalık XP kaydı siliniyor: ${leaderboardDocId}`);
        }
        
        // Also try to delete last few weeks (just in case) - up to 8 weeks back
        const now = new Date();
        for (let weeksAgo = 1; weeksAgo <= 8; weeksAgo++) {
            const pastWeek = new Date(now);
            pastWeek.setDate(pastWeek.getDate() - (weeksAgo * 7));
            const day = pastWeek.getDay();
            const diff = pastWeek.getDate() - day + (day === 0 ? -6 : 1);
            const pastMonday = new Date(pastWeek.setDate(diff));
            pastMonday.setHours(0, 0, 0, 0);
            const pastWeekStart = pastMonday.toISOString().split('T')[0];
            const pastLeaderboardDocId = `${user.id}_${pastWeekStart}`;
            deletePromises.push(window.firestoreDelete('weekly_leaderboard', pastLeaderboardDocId));
        }
        
        // CRITICAL: Also try to delete ALL weekly_leaderboard entries for this user_id
        // This handles cases where the document ID format might be different
        if (window.firestore && window.firestore.collection) {
            try {
                // Delete by user_id
                const querySnapshot = await window.firestore
                    .collection('weekly_leaderboard')
                    .where('user_id', '==', user.id)
                    .limit(50) // Limit to prevent excessive reads
                    .get();
                
                querySnapshot.forEach(doc => {
                    deletePromises.push(window.firestoreDelete('weekly_leaderboard', doc.id));
                    console.log(`🔥 Ek haftalık XP kaydı siliniyor (user_id ile): ${doc.id}`);
                });
                
                // Also try to delete by username (for reset operations - safety measure)
                // This ensures old entries are deleted even if user_id format changed
                const username = savedUsername || localStorage.getItem('hasene_username') || user.username;
                if (username && username !== 'Anonim Kullanıcı' && username !== 'Kullanıcı' && username !== 'Misafir') {
                    try {
                        const usernameQuerySnapshot = await window.firestore
                            .collection('weekly_leaderboard')
                            .where('username', '==', username)
                            .limit(100) // Increased limit for thorough cleanup
                            .get();
                        
                        let usernameDeleteCount = 0;
                        usernameQuerySnapshot.forEach(doc => {
                            const data = doc.data();
                            // During reset, delete all entries with this username (it's our own reset)
                            deletePromises.push(window.firestoreDelete('weekly_leaderboard', doc.id));
                            usernameDeleteCount++;
                            console.log(`🔥 Ek haftalık XP kaydı siliniyor (username: ${username}): ${doc.id}`);
                        });
                        if (usernameDeleteCount > 0) {
                            console.log(`📊 Toplam ${usernameDeleteCount} username kaydı siliniyor`);
                        }
                    } catch (usernameQueryError) {
                        console.warn('⚠️ Username query hatası (normal olabilir):', usernameQueryError);
                    }
                }
            } catch (queryError) {
                console.warn('⚠️ Weekly leaderboard query hatası (normal olabilir):', queryError);
            }
        }
        
        // IMPORTANT: Wait for Firebase deletion to complete before reloading
        try {
            const deleteResults = await Promise.all(deletePromises);
            const successCount = deleteResults.filter(r => r === true).length;
            console.log(`✅ Firebase verileri silindi: ${successCount}/${deletePromises.length} başarılı (user_stats, daily_tasks, weekly_leaderboard)`);
            
            // If any deletion failed, log warning
            if (successCount < deletePromises.length) {
                console.warn('⚠️ Bazı Firebase verileri silinemedi. Firebase Console\'dan manuel kontrol edin.');
            }
        } catch (error) {
            console.warn('⚠️ Firebase veri silme hatası:', error);
        }
    }
    
    // CRITICAL: Clear weekly XP from localStorage (ensures it's reset even if Firebase delete fails)
    const weekStart = typeof window.getWeekStartString === 'function' ? window.getWeekStartString() : null;
    if (weekStart) {
        const weeklyXPKey = `hasene_weekly_xp_${weekStart}`;
        localStorage.removeItem(weeklyXPKey);
        console.log(`✓ Removed weekly XP: ${weeklyXPKey}`);
        
        // Also clear any past week's XP keys (just in case)
        for (let i = 0; i < 10; i++) {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - (i * 7));
            const day = pastDate.getDay();
            const diff = pastDate.getDate() - day + (day === 0 ? -6 : 1);
            const pastMonday = new Date(pastDate.setDate(diff));
            pastMonday.setHours(0, 0, 0, 0);
            const pastWeekStart = pastMonday.toISOString().split('T')[0];
            const pastXPKey = `hasene_weekly_xp_${pastWeekStart}`;
            if (localStorage.getItem(pastXPKey)) {
                localStorage.removeItem(pastXPKey);
                console.log(`✓ Removed past weekly XP: ${pastXPKey}`);
            }
        }
    }
    
    // Initialize new daily tasks before reload (WAIT for it to complete)
    try {
        await checkDailyTasks();
        console.log('✅ Yeni günlük vazifeler oluşturuldu');
        
        // Also save to Firebase if Firebase user (before reload)
        if (user && !user.id.startsWith('local-') && typeof window.saveDailyTasks === 'function') {
            await window.saveDailyTasks(dailyTasks);
        }
    } catch (error) {
        console.error('⚠️ Günlük görev oluşturma hatası:', error);
    }
    
    console.log('✅ Tüm veriler sıfırlandı. Firebase çıkış yapılıyor...');
    
    // Sign out from Firebase to ensure a new anonymous user is created on next load
    // This ensures old Firebase data is truly cleared
    if (user && !user.id.startsWith('local-') && typeof window.signOutFirebase === 'function') {
        try {
            await window.signOutFirebase();
            console.log('✅ Firebase çıkış yapıldı');
        } catch (error) {
            console.warn('⚠️ Firebase çıkış hatası:', error);
        }
    }
    
    console.log('✅ Sayfa yenileniyor...');
    
    // Immediately reload page to properly reinitialize everything
    // Use setTimeout to ensure all async operations complete before reload
    setTimeout(() => {
        window.location.reload();
    }, 200);
}

// ========================================
// INITIALIZE ON LOAD
// ========================================

/**
 * Show username login modal
 */
function showUsernameLoginModal() {
    const input = document.getElementById('username-input');
    if (input) {
        // Always clear input for fresh entry (user wants to type directly)
        input.value = '';
        input.focus();
        // Select all text if there's any (for immediate replacement)
        input.select();
    }
    
    // Mevcut cinsiyet bilgisini yükle
    const currentGender = localStorage.getItem('hasene_user_gender') || 'none';
    selectedGender = currentGender;
    
    // Gender butonlarını güncelle
    setTimeout(() => {
        selectGender(currentGender);
    }, 50);
    
    openModal('username-login-modal');
}

/**
 * Confirm username and start pending game
 */
// Cinsiyet seçimi için global değişken
let selectedGender = null;

function selectGender(gender) {
    selectedGender = gender;
    
    // Tüm gender butonlarını aktif sınıfından çıkar (CSS class kullan)
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen butonu aktif yap (CSS class otomatik stilleri uygular)
    const btnId = gender === 'male' ? 'gender-male-btn' : (gender === 'female' ? 'gender-female-btn' : 'gender-none-btn');
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.add('active');
    }
}

async function confirmUsername() {
    const input = document.getElementById('username-input');
    if (!input) return;
    
    const username = input.value.trim();
    if (!username || username.length < 2) {
        showToast('Lütfen en az 2 karakterlik bir kullanıcı adı girin', 'error');
        return;
    }
    
    // Cinsiyet bilgisini kaydet
    if (selectedGender && selectedGender !== 'none') {
        localStorage.setItem('hasene_user_gender', selectedGender);
    } else {
        // Varsayılan olarak 'none' veya null
        localStorage.removeItem('hasene_user_gender');
    }
    
    // Update username in localStorage FIRST (before getCurrentUser)
    localStorage.setItem('hasene_username', username);
    
    // Create/update local user - ALWAYS use local user by default
    // Firebase will only be used if explicitly needed and user has a real username
    if (typeof window.createLocalUser === 'function') {
        window.createLocalUser(username);
    }
    
    // Set user type to local (default)
    // Firebase will NOT be automatically activated - user must explicitly request it if needed
    localStorage.setItem('hasene_user_type', 'local');
    
    closeModal('username-login-modal');
    
    // Seçimi sıfırla
    selectedGender = null;
    
    // Update user status display
    updateUserStatusDisplay();
    
    // Show login success message
    showToast(`✅ Giriş yapıldı: ${username}`, 'success', 2000);
    
    // Sync username to Firebase immediately after login (if Firebase is enabled)
    // This creates/updates document with username as document ID for easy tracking
    if (typeof window.saveUserStats === 'function') {
        // Get current stats and save with username
        const currentStats = {
            total_points: totalPoints || 0,
            badges: badgesUnlocked || {},
            streak_data: streakData || {},
            game_stats: gameStats || {},
            perfect_lessons_count: gameStats?.perfectLessons || 0,
            username: username // Explicitly set username
        };
        window.saveUserStats(currentStats).catch(err => {
            console.warn('Username sync to Firebase failed:', err);
        });
    }
    
    // Start pending game if exists
    if (window.pendingGameMode) {
        const gameMode = window.pendingGameMode;
        window.pendingGameMode = null;
        startGame(gameMode);
    }
}

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
    window.checkKelimeOkumaAnswer = checkKelimeOkumaAnswer;
    window.checkCezmAnswer = checkCezmAnswer;
    window.checkHarflerVeIsimlerAnswer = checkHarflerVeIsimlerAnswer;
    window.toggleCurrentWordFavorite = toggleCurrentWordFavorite;
    window.showHarfTablosu = showHarfTablosu;
    window.showHarflerVeIsimleriTablosu = showHarflerVeIsimleriTablosu;
    window.playHarfAudio = playHarfAudio;
    window.showBadgesModal = showBadgesModal;
    window.showBadgeDetail = showBadgeDetail;
    window.showCalendarModal = showCalendarModal;
    window.showOnboarding = showOnboarding;
    window.nextOnboardingSlide = nextOnboardingSlide;
    window.prevOnboardingSlide = prevOnboardingSlide;
    window.showDailyReward = showDailyReward;
    window.claimDailyReward = claimDailyReward;
    window.showAchievementsModal = showAchievementsModal;
    window.goToKelimeSubmodes = goToKelimeSubmodes;
    window.goToElifBaSubmodes = goToElifBaSubmodes;
    window.startKelimeCevirGame = startKelimeCevirGame;
    window.startElifBaGame = startElifBaGame;
    window.hideAllScreens = hideAllScreens;
    window.checkBadges = checkBadges;
    window.showWordAnalysisModal = showWordAnalysisModal;
    window.getWordAnalysis = getWordAnalysis;
    window.getStrugglingWords = getStrugglingWords;
    window.selectIntelligentWords = selectIntelligentWords;
    window.renderAchievementsList = renderAchievementsList;
    window.startKarmaGame = startKarmaGame;
    window.checkKarmaAnswer = checkKarmaAnswer;
    window.selectKarmaMatch = selectKarmaMatch;
    window.useHint = useHint;
    window.handleUserLogout = handleUserLogout;
    window.updateUserStatusDisplay = updateUserStatusDisplay;
    window.showUsernameLoginModal = showUsernameLoginModal;
    window.confirmUsername = confirmUsername;
    window.selectGender = selectGender;
    window.resetAllData = resetAllData;
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
}