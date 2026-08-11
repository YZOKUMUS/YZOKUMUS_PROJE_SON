/**
 * Hasene Arapça Dersi - Authentication
 * Kullanıcı kimlik doğrulama sistemi
 * Local kullanıcı (varsayılan) + Firebase (opsiyonel)
 */

// ========================================
// LOCAL USER MANAGEMENT
// ========================================

/**
 * Get current user
 * @returns {Object|null} User object { id, username, email, type: 'local'|'firebase' }
 */
function getCurrentUser() {
    // Check for Firebase user first (if Firebase is enabled and authenticated)
    if (window.FIREBASE_ENABLED && window.firebaseAuth && window.firebaseAuth.currentUser) {
        const firebaseUser = window.firebaseAuth.currentUser;
        // Check localStorage for saved username (user might have set a custom username)
        const savedUsername = localStorage.getItem('hasene_username');
        const savedUsernameDisplay = localStorage.getItem('hasene_username_display');
        return {
            id: firebaseUser.uid,
            username: savedUsername || firebaseUser.displayName || 'Anonim Kullanıcı',
            usernameDisplay: savedUsernameDisplay || savedUsername || firebaseUser.displayName || 'Anonim Kullanıcı',
            email: firebaseUser.email || '',
            type: 'firebase'
        };
    }
    
    // Check localStorage for Firebase user ID (in case Firebase isn't loaded yet)
    const firebaseUserId = localStorage.getItem('hasene_firebase_user_id');
    const userType = localStorage.getItem('hasene_user_type');
    if (firebaseUserId && userType === 'firebase') {
        const savedUsername = localStorage.getItem('hasene_username');
        const savedUsernameDisplay = localStorage.getItem('hasene_username_display');
        return {
            id: firebaseUserId,
            username: savedUsername || 'Anonim Kullanıcı',
            usernameDisplay: savedUsernameDisplay || savedUsername || 'Anonim Kullanıcı',
            email: '',
            type: 'firebase'
        };
    }
    
    // Fallback to local user
    const userId = localStorage.getItem('hasene_user_id');
    const username = localStorage.getItem('hasene_username');
    const usernameDisplay = localStorage.getItem('hasene_username_display');
    const email = localStorage.getItem('hasene_user_email') || '';
    
    if (!userId || !username) {
        return ensureDefaultUser();
    }
    
    return {
        id: userId,
        username: username,
        usernameDisplay: usernameDisplay || username,
        email: email,
        type: 'local'
    };
}

/**
 * Create new local user
 * @param {string} username - Optional username
 * @param {string} email - Optional email
 * @returns {Object} User object
 */
function createLocalUser(username = 'Kullanıcı', email = '') {
    const userId = `local-${Date.now()}`;
    const usernameLower = username.toLowerCase(); // Normalize to lowercase
    
    localStorage.setItem('hasene_user_id', userId);
    localStorage.setItem('hasene_username', usernameLower); // Store lowercase for DB operations
    localStorage.setItem('hasene_username_display', username); // Store original for display
    if (email) {
        localStorage.setItem('hasene_user_email', email);
    }
    
    console.log('✅ Yeni local kullanıcı oluşturuldu:', userId);
    
    return {
        id: userId,
        username: usernameLower,
        usernameDisplay: username,
        email: email,
        type: 'local'
    };
}

/**
 * Update local user info
 * @param {string} username - New username
 * @param {string} email - New email
 */
function updateLocalUser(username, email = '') {
    const userId = getCurrentUser()?.id;
    if (!userId || !userId.startsWith('local-')) {
        console.warn('Cannot update non-local user');
        return false;
    }
    
    if (username) {
        const usernameLower = username.toLowerCase(); // Normalize to lowercase
        localStorage.setItem('hasene_username', usernameLower); // Store lowercase for DB
        localStorage.setItem('hasene_username_display', username); // Store original for display
    }
    if (email) {
        localStorage.setItem('hasene_user_email', email);
    }
    
    return true;
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    ensureDefaultUser();
    return true;
}

/**
 * Otomatik misafir kullanıcı (giriş ekranı yok)
 * @returns {Object} User object
 */
function ensureDefaultUser() {
    const userId = localStorage.getItem('hasene_user_id');
    const username = localStorage.getItem('hasene_username');
    if (userId && username) {
        return {
            id: userId,
            username: username,
            usernameDisplay: localStorage.getItem('hasene_username_display') || username,
            email: localStorage.getItem('hasene_user_email') || '',
            type: 'local'
        };
    }
    const user = createLocalUser('Misafir');
    if (!localStorage.getItem('hasene_user_gender')) {
        localStorage.setItem('hasene_user_gender', 'male');
    }
    return user;
}

/**
 * Get backend type based on user
 * @returns {string} 'localStorage' or 'firebase'
 */
function getBackendType() {
    const user = getCurrentUser();
    if (user && user.type === 'firebase') {
        return 'firebase';
    }
    return 'localStorage';
}

/**
 * Sign out (clear local user or Firebase user)
 */
async function signOut() {
    const user = getCurrentUser();
    
    // Sign out from Firebase if Firebase user
    if (user && user.type === 'firebase' && window.firebaseAuth) {
        try {
            await window.firebaseAuth.signOut();
            console.log('✅ Firebase kullanıcı çıkış yaptı');
        } catch (error) {
            console.error('Firebase sign-out error:', error);
        }
    }
    
    // Clear all user data (both local and Firebase)
    localStorage.removeItem('hasene_user_id');
    localStorage.removeItem('hasene_username');
    localStorage.removeItem('hasene_username_display'); // Also remove display username
    localStorage.removeItem('hasene_user_email');
    localStorage.removeItem('hasene_user_gender');
    localStorage.removeItem('hasene_firebase_user_id');
    localStorage.removeItem('hasene_user_type');
    
    // Clear all game data (puanlar, rozetler, günlük görevler, streak vb.)
    // Bu sayede yeni kullanıcı giriş yaptığında sıfırdan başlar
    if (typeof window.CONFIG !== 'undefined' && window.CONFIG.STORAGE_KEYS) {
        const storageKeys = [
            window.CONFIG.STORAGE_KEYS.TOTAL_POINTS,
            window.CONFIG.STORAGE_KEYS.STREAK_DATA,
            window.CONFIG.STORAGE_KEYS.DAILY_TASKS,
            window.CONFIG.STORAGE_KEYS.GAME_STATS,
            window.CONFIG.STORAGE_KEYS.DAILY_GOAL,
            window.CONFIG.STORAGE_KEYS.DAILY_PROGRESS,
            'hasene_word_stats',
            'hasene_favorites',
            'hasene_achievements',
            'hasene_badges'
        ];
        
        storageKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear all weekly XP data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('hasene_weekly_xp_')) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('✅ Oyun verileri temizlendi');
    }
    
    // Reset UI display values to zero
    if (document.getElementById('total-hasene')) {
        document.getElementById('total-hasene').textContent = '0';
    }
    if (document.getElementById('total-stars')) {
        document.getElementById('total-stars').textContent = '⭐ 0';
    }
    if (document.getElementById('streak-count')) {
        document.getElementById('streak-count').textContent = '🔥 0';
    }
    if (document.getElementById('level-display')) {
        document.getElementById('level-display').textContent = '1';
    }
    
    // Reset global variables if they exist
    if (typeof window.totalPoints !== 'undefined') {
        window.totalPoints = 0;
    }
    if (typeof window.currentLevel !== 'undefined') {
        window.currentLevel = 1;
    }
    if (typeof window.streakData !== 'undefined') {
        window.streakData = { currentStreak: 0, longestStreak: 0, lastPlayedDate: null };
    }
    
    // Update stats display if function exists
    if (typeof window.updateStatsDisplay === 'function') {
        window.updateStatsDisplay();
    }
    
    // Update user UI
    updateUserStatusUI();
    
    // Clear leaderboard modal if it exists
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (leaderboardContent) {
        leaderboardContent.innerHTML = '';
    }
    
    // Clear weekly leaderboard from Firebase if user is logged in
    if (user && window.FIREBASE_ENABLED && typeof window.firestoreDelete === 'function') {
        try {
            const username = localStorage.getItem('hasene_username') || user.username;
            const weekStart = typeof window.getWeekStartString === 'function' ? 
                window.getWeekStartString() : new Date().toISOString().split('T')[0];
            const docId = `${username}_${weekStart}`;
            await window.firestoreDelete('weekly_leaderboard', docId);
            console.log('✅ Firebase leaderboard verisi silindi');
        } catch (error) {
            console.warn('⚠️ Firebase leaderboard silme hatası:', error);
        }
    }
    
    console.log('✅ Kullanıcı çıkış yaptı ve UI temizlendi');
    
    // Show toast and reload page for clean state
    if (typeof window.showToast === 'function') {
        window.showToast('Çıkış yapıldı. Sayfa yenileniyor...', 'success', 1500);
    }
    
    // Reload page after 1.5 seconds
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// ========================================
// FIREBASE AUTH (OPSIYONEL - Placeholder)
// ========================================

/**
 * Sign in with Firebase Anonymous Auth
 */
async function signInWithFirebaseAnonymous() {
    // Check if Firebase is available
    if (!window.firebaseAuth || !window.FIREBASE_ENABLED) {
        console.log('ℹ️ Firebase not configured, using local user');
        return createLocalUser();
    }
    
    try {
        // Check if already signed in
        const currentUser = window.firebaseAuth.currentUser;
        if (currentUser) {
            return {
                id: currentUser.uid,
                username: 'Anonim Kullanıcı',
                email: '',
                type: 'firebase'
            };
        }
        
        // Sign in anonymously
        const result = await window.firebaseAuth.signInAnonymously();
        console.log('✅ Firebase anonymous sign-in successful');
        
        return {
            id: result.user.uid,
            username: 'Anonim Kullanıcı',
            email: '',
            type: 'firebase'
        };
    } catch (error) {
        console.error('Firebase sign-in error:', error);
        // Fallback to local user
        return createLocalUser();
    }
}

// ========================================
// UI (giriş kaldırıldı — misafir otomatik)
// ========================================

function showUsernameLoginModal() {
    ensureDefaultUser();
    if (typeof window.updateUserStatusUI === 'function') {
        updateUserStatusUI();
    }
}

function selectGender(gender) {
    localStorage.setItem('hasene_user_gender', gender);
    if (typeof window.updateUserStatusUI === 'function') {
        updateUserStatusUI();
    }
}

async function confirmUsername() {
    ensureDefaultUser();
}

async function handleUserLogout() {
    /* giriş/çıkış kaldırıldı */
}

async function handleUserAuth() {
    /* giriş/çıkış kaldırıldı */
}

/**
 * Update user status UI
 */
function updateUserStatusUI() {
    ensureDefaultUser();

    const usernameDisplayText = localStorage.getItem('hasene_username_display')
        || localStorage.getItem('hasene_username')
        || 'Misafir';

    const usernameDisplay = document.getElementById('current-username-display');
    const statusIndicator = document.getElementById('user-status-indicator');
    const userAvatar = document.getElementById('user-avatar');
    const userActions = document.querySelector('.user-actions');

    document.getElementById('user-auth-btn')?.remove();
    document.getElementById('user-login-btn')?.remove();
    document.getElementById('user-logout-btn')?.remove();

    if (userActions) {
        userActions.querySelectorAll('button').forEach(btn => {
            const btnText = btn.textContent.trim();
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (btnText === 'Giriş yap' || btnText === 'Giriş Yap'
                || btnText === 'Çıkış yap' || btnText === 'Çıkış Yap'
                || onclickAttr.includes('handleUserAuth')
                || onclickAttr.includes('showUsernameLoginModal')
                || onclickAttr.includes('handleUserLogout')) {
                btn.remove();
            }
        });
    }

    if (!usernameDisplay || !statusIndicator) {
        return;
    }

    const currentUser = getCurrentUser();
    const isFirebaseUser = currentUser && currentUser.type === 'firebase';

    usernameDisplay.textContent = usernameDisplayText;
    statusIndicator.textContent = isFirebaseUser ? '🟢 Bulut' : '🟢 Yerel';
    statusIndicator.style.color = '#10b981';
    statusIndicator.classList.remove('hidden');
    statusIndicator.setAttribute('aria-hidden', 'false');

    const gender = localStorage.getItem('hasene_user_gender') || 'male';
    if (userAvatar) {
        userAvatar.textContent = gender === 'female' ? '👩' : '👨';
    }
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.getCurrentUser = getCurrentUser;
    window.createLocalUser = createLocalUser;
    window.updateLocalUser = updateLocalUser;
    window.isLoggedIn = isLoggedIn;
    window.getBackendType = getBackendType;
    window.signOut = signOut;
    window.signInWithFirebaseAnonymous = signInWithFirebaseAnonymous;
    window.showUsernameLoginModal = showUsernameLoginModal;
    window.confirmUsername = confirmUsername;
    window.selectGender = selectGender;
    window.handleUserLogout = handleUserLogout;
    window.handleUserAuth = handleUserAuth;
    window.ensureDefaultUser = ensureDefaultUser;
    window.updateUserStatusUI = updateUserStatusUI;

    function initGuestUserUI() {
        ensureDefaultUser();
        updateUserStatusUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initGuestUserUI, 100);
        });
    } else {
        setTimeout(initGuestUserUI, 100);
    }
    
    // Also update when page becomes visible (in case of tab switching)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(() => {
                updateUserStatusUI();
            }, 100);
        }
    });
}

