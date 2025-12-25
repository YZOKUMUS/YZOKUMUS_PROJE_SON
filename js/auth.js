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
        return {
            id: firebaseUser.uid,
            username: savedUsername || firebaseUser.displayName || 'Anonim Kullanıcı',
            email: firebaseUser.email || '',
            type: 'firebase'
        };
    }
    
    // Check localStorage for Firebase user ID (in case Firebase isn't loaded yet)
    const firebaseUserId = localStorage.getItem('hasene_firebase_user_id');
    const userType = localStorage.getItem('hasene_user_type');
    if (firebaseUserId && userType === 'firebase') {
        const savedUsername = localStorage.getItem('hasene_username');
        return {
            id: firebaseUserId,
            username: savedUsername || 'Anonim Kullanıcı',
            email: '',
            type: 'firebase'
        };
    }
    
    // Fallback to local user
    const userId = localStorage.getItem('hasene_user_id');
    const username = localStorage.getItem('hasene_username');
    const email = localStorage.getItem('hasene_user_email') || '';
    
    // Only return user if userId exists (user has logged in)
    if (!userId || !username) {
        return null; // No user logged in
    }
    
    return {
        id: userId,
        username: username,
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
    
    localStorage.setItem('hasene_user_id', userId);
    localStorage.setItem('hasene_username', username);
    if (email) {
        localStorage.setItem('hasene_user_email', email);
    }
    
    console.log('✅ Yeni local kullanıcı oluşturuldu:', userId);
    
    return {
        id: userId,
        username: username,
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
        localStorage.setItem('hasene_username', username);
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
    const userId = localStorage.getItem('hasene_user_id');
    const username = localStorage.getItem('hasene_username');
    return !!(userId && username);
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
    
    console.log('✅ Kullanıcı çıkış yaptı ve UI temizlendi');
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
// UI FUNCTIONS
// ========================================

/**
 * Show username login modal
 */
function showUsernameLoginModal() {
    // Eğer logout işlemi devam ediyorsa, modal açma
    if (isLoggingOut) {
        console.log('⚠️ Logout in progress, cannot open login modal');
        return;
    }
    
    try {
        const modal = document.getElementById('username-login-modal');
        if (!modal) {
            console.error('Username login modal not found in DOM');
            alert('Modal bulunamadı. Sayfayı yenileyin.');
            return;
        }
        
        // Önce tüm modalları kapat
        if (typeof window.closeAllModals === 'function') {
            window.closeAllModals();
        }
        
        // Modal'ı göster
        if (typeof window.openModal === 'function') {
            window.openModal('username-login-modal');
        } else {
            // Fallback: manually show modal
            modal.classList.remove('hidden');
            console.warn('openModal function not available, using fallback');
        }
        
        // Mobilde modal'ın görünür olduğundan emin ol
        setTimeout(() => {
            if (modal.classList.contains('hidden')) {
                modal.classList.remove('hidden');
            }
            // Z-index kontrolü (mobilde bazen sorun olabilir)
            if (modal.style) {
                modal.style.display = 'flex';
                modal.style.zIndex = '1000';
            }
        }, 50);
        
        // Wait for modal to be visible before accessing DOM elements
        setTimeout(() => {
            try {
                // Restore previously selected gender if exists
                const savedGender = localStorage.getItem('hasene_user_gender') || 'none';
                selectGender(savedGender);
                
                // Pre-fill username if user exists
                const savedUsername = localStorage.getItem('hasene_username');
                const input = document.getElementById('username-input');
                if (input) {
                    if (savedUsername && savedUsername !== 'Kullanıcı' && savedUsername !== 'Misafir') {
                        input.value = savedUsername;
                    } else {
                        input.value = '';
                    }
                    // Focus on input (mobilde bazen çalışmaz, bu normal)
                    try {
                        input.focus();
                    } catch (e) {
                        // Mobilde focus bazen çalışmaz, bu normal
                        console.log('Input focus failed (mobile may not support):', e);
                    }
                } else {
                    console.warn('Username input not found');
                }
            } catch (error) {
                console.error('Error initializing modal content:', error);
            }
        }, 150);
    } catch (error) {
        console.error('Error showing username login modal:', error);
        alert('Modal açılırken bir hata oluştu. Sayfayı yenileyin.');
    }
}

/**
 * Select gender for user
 * @param {string} gender - 'male', 'female', or 'none'
 */
function selectGender(gender) {
    try {
        // Remove active class from all gender buttons
        const genderButtons = document.querySelectorAll('.gender-btn');
        if (genderButtons.length === 0) {
            console.warn('Gender buttons not found in DOM');
            return;
        }
        
        genderButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        const buttonId = `gender-${gender}-btn`;
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('active');
        } else {
            console.warn(`Gender button not found: ${buttonId}`);
        }
        
        // Store selected gender
        localStorage.setItem('hasene_user_gender', gender);
    } catch (error) {
        console.error('Error in selectGender:', error);
    }
}

/**
 * Confirm username and login
 */
function confirmUsername() {
    try {
        const usernameInput = document.getElementById('username-input');
        if (!usernameInput) {
            console.error('Username input not found');
            alert('Kullanıcı adı alanı bulunamadı.');
            return;
        }
        
        const username = usernameInput.value.trim();
        
        if (!username || username.length === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast('Lütfen bir kullanıcı adı girin', 'error');
            } else {
                alert('Lütfen bir kullanıcı adı girin');
            }
            usernameInput.focus();
            return;
        }
        
        if (username.length > 50) {
            if (typeof window.showToast === 'function') {
                window.showToast('Kullanıcı adı en fazla 50 karakter olabilir', 'error');
            } else {
                alert('Kullanıcı adı en fazla 50 karakter olabilir');
            }
            usernameInput.focus();
            return;
        }
        
        // Get selected gender
        let gender = 'none';
        try {
            const activeGenderBtn = document.querySelector('.gender-btn.active');
            if (activeGenderBtn) {
                const buttonId = activeGenderBtn.id;
                gender = buttonId.replace('gender-', '').replace('-btn', '');
            }
        } catch (error) {
            console.warn('Error getting selected gender:', error);
        }
        
        // Get current user
        const currentUser = getCurrentUser();
        const previousUsername = currentUser ? currentUser.username : null;
        const previousUserId = currentUser ? currentUser.id : null;
        
        // Check if this is a different user logging in
        const isDifferentUser = previousUsername && previousUsername !== username;
        
        // Update or create user
        let newUserId = null;
        try {
            if (currentUser && currentUser.id && !isDifferentUser) {
                // Update existing user (same user, just updating username)
                if (currentUser.type === 'local') {
                    updateLocalUser(username);
                    newUserId = currentUser.id;
                } else {
                    // For Firebase users, just update username in localStorage
                    localStorage.setItem('hasene_username', username);
                    newUserId = currentUser.id;
                }
            } else {
                // Create new user (user is logging in for the first time OR different user)
                if (isDifferentUser) {
                    // Different user is logging in - clear all game data first
                    console.log('🔄 Farklı kullanıcı giriş yapıyor, oyun verileri temizleniyor...');
                    
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
                        
                        console.log('✅ Önceki kullanıcının oyun verileri temizlendi');
                    }
                }
                
                const newUser = createLocalUser(username);
                newUserId = newUser.id;
            }
        } catch (error) {
            console.error('Error updating/creating user:', error);
            alert('Kullanıcı bilgileri kaydedilirken bir hata oluştu.');
            return;
        }
        
        // Save gender
        try {
            localStorage.setItem('hasene_user_gender', gender);
        } catch (error) {
            console.warn('Error saving gender:', error);
        }
        
        // Update UI
        try {
            updateUserStatusUI();
        } catch (error) {
            console.warn('Error updating UI:', error);
        }
        
        // Close modal - önce tüm modalları kapat
        try {
            // Önce tüm modalları kapat
            if (typeof window.closeAllModals === 'function') {
                window.closeAllModals();
            } else if (typeof window.closeModal === 'function') {
                window.closeModal('username-login-modal');
            } else {
                // Fallback: manually hide modal
                const modal = document.getElementById('username-login-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    if (modal.style) {
                        modal.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.warn('Error closing modal:', error);
            // Fallback: force close
            const modal = document.getElementById('username-login-modal');
            if (modal) {
                modal.classList.add('hidden');
                if (modal.style) {
                    modal.style.display = 'none';
                }
            }
        }
        
        // Clear input
        usernameInput.value = '';
        
        // Show success message
        if (typeof window.showToast === 'function') {
            window.showToast(`Hoş geldiniz, ${username}!`, 'success');
        }
        
        // Reload stats after login (for both same and different users)
        // This ensures Firebase data is synced to localStorage
        console.log('🔄 Kullanıcı giriş yaptı, istatistikler Firebase\'den yükleniyor...');
        
        if (typeof window.loadStats === 'function') {
            // For different users, skip streak check to reset properly
            const skipStreakCheck = isDifferentUser;
            
            window.loadStats(skipStreakCheck).then(() => {
                // Update stats display
                if (typeof window.updateStatsDisplay === 'function') {
                    window.updateStatsDisplay();
                }
                
                if (isDifferentUser) {
                    console.log('✅ Yeni kullanıcı için istatistikler sıfırlandı');
                } else {
                    console.log('✅ Kullanıcı istatistikleri Firebase\'den yüklendi');
                }
            }).catch(err => {
                console.error('Error reloading stats:', err);
            });
        }
        
        // Backend'e senkronize et (Firebase'e veri gönder)
        try {
            // Kullanıcı istatistiklerini senkronize et
            if (typeof window.saveUserStats === 'function') {
                const currentPoints = parseInt(localStorage.getItem('hasene_totalPoints') || '0');
                window.saveUserStats({ total_points: currentPoints }).catch(err => {
                    console.warn('User stats sync to Firebase failed:', err);
                });
            }
            
            // Günlük görevleri senkronize et
            if (typeof window.saveDailyTasks === 'function' && typeof window.loadDailyTasks === 'function') {
                window.loadDailyTasks().then(tasks => {
                    if (tasks) {
                        window.saveDailyTasks(tasks).catch(err => {
                            console.warn('Daily tasks sync to Firebase failed:', err);
                        });
                    }
                }).catch(err => {
                    console.warn('Daily tasks load failed:', err);
                });
            }
        } catch (error) {
            console.warn('Backend sync error (non-critical):', error);
        }
        
        console.log('✅ Kullanıcı giriş yaptı:', username);
    } catch (error) {
        console.error('Error in confirmUsername:', error);
        alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// Logout işlemi devam ederken modal açılmasını engellemek için flag
let isLoggingOut = false;

/**
 * Handle user logout
 */
async function handleUserLogout() {
    // Eğer zaten logout işlemi devam ediyorsa, tekrar çalıştırma
    if (isLoggingOut) {
        console.log('⚠️ Logout already in progress, skipping...');
        return;
    }
    
    isLoggingOut = true;
    
    try {
        // Önce tüm modalları kapat (giriş modalı dahil)
        if (typeof window.closeAllModals === 'function') {
            window.closeAllModals();
        }
        
        // Giriş modalını özellikle kapat
        const loginModal = document.getElementById('username-login-modal');
        if (loginModal) {
            loginModal.classList.add('hidden');
            if (loginModal.style) {
                loginModal.style.display = 'none';
            }
        }
        
        // Tüm modalları da kapat (ekstra güvenlik)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
            if (modal.style) {
                modal.style.display = 'none';
            }
        });
        
        await signOut();
        
        // UI'ı güncelle
        if (typeof window.updateUserStatusUI === 'function') {
            updateUserStatusUI();
        }
        
        // Toast göster
        if (typeof window.showToast === 'function') {
            window.showToast('Çıkış yapıldı', 'info');
        }
        
        console.log('✅ Kullanıcı çıkış yaptı');
    } catch (error) {
        console.error('Logout error:', error);
        // Hata olsa bile UI'ı güncelle
        if (typeof window.updateUserStatusUI === 'function') {
            updateUserStatusUI();
        }
    } finally {
        // Flag'i sıfırla (kısa bir gecikme ile, modal açılmasını engellemek için)
        setTimeout(() => {
            isLoggingOut = false;
        }, 500);
    }
}

/**
 * Handle user authentication (login/logout toggle)
 */
async function handleUserAuth() {
    // Eğer logout işlemi devam ediyorsa, hiçbir şey yapma
    if (isLoggingOut) {
        console.log('⚠️ Logout in progress, ignoring auth request');
        return;
    }
    
    try {
        const userId = localStorage.getItem('hasene_user_id');
        const username = localStorage.getItem('hasene_username');
        const isLoggedIn = !!(userId && username);
        
        console.log('🔐 handleUserAuth called. isLoggedIn:', isLoggedIn, 'userId:', userId, 'username:', username);
        
        if (isLoggedIn) {
            // User is logged in, logout (no modal needed)
            await handleUserLogout();
            // Return early to prevent any modal from opening
            return;
        } else {
            // User is not logged in, show login modal
            console.log('📱 Opening login modal...');
            // Önce tüm modalları kapat
            if (typeof window.closeAllModals === 'function') {
                window.closeAllModals();
            }
            // Sonra giriş modalını aç
            showUsernameLoginModal();
        }
    } catch (error) {
        console.error('Error in handleUserAuth:', error);
        // Only show login modal if there's an error and user is not logged in
        const userId = localStorage.getItem('hasene_user_id');
        const username = localStorage.getItem('hasene_username');
        const isLoggedIn = !!(userId && username);
        
        if (!isLoggedIn && !isLoggingOut) {
            try {
                // Önce tüm modalları kapat
                if (typeof window.closeAllModals === 'function') {
                    window.closeAllModals();
                }
                showUsernameLoginModal();
            } catch (e) {
                console.error('Failed to show login modal:', e);
                alert('Giriş yapılırken bir hata oluştu. Sayfayı yenileyin.');
            }
        }
    }
}

/**
 * Update user status UI
 */
function updateUserStatusUI() {
    // Check if user is actually logged in by checking localStorage directly
    const userId = localStorage.getItem('hasene_user_id');
    const username = localStorage.getItem('hasene_username');
    const isLoggedIn = !!(userId && username);
    
    const usernameDisplay = document.getElementById('current-username-display');
    const statusIndicator = document.getElementById('user-status-indicator');
    const authBtn = document.getElementById('user-auth-btn');
    const userAvatar = document.getElementById('user-avatar');
    const userActions = document.querySelector('.user-actions');
    
    // Force remove old buttons if they exist (check by ID and also by text content)
    const oldLoginBtn = document.getElementById('user-login-btn');
    const oldLogoutBtn = document.getElementById('user-logout-btn');
    
    // Remove old buttons immediately
    if (oldLoginBtn) {
        console.log('🗑️ Removing old login button');
        oldLoginBtn.remove();
    }
    if (oldLogoutBtn) {
        console.log('🗑️ Removing old logout button');
        oldLogoutBtn.remove();
    }
    
    // Also check for buttons by their text content and onclick handlers
    if (userActions) {
        const allButtons = Array.from(userActions.querySelectorAll('button'));
        let authButtonCount = 0;
        
        allButtons.forEach(btn => {
            const btnText = btn.textContent.trim();
            const btnId = btn.id;
            const onclickAttr = btn.getAttribute('onclick') || '';
            
            // Count auth buttons
            if (btnId === 'user-auth-btn' || 
                btnText === 'Giriş Yap' || 
                btnText === 'Çıkış Yap' ||
                onclickAttr.includes('handleUserAuth') ||
                onclickAttr.includes('showUsernameLoginModal') ||
                onclickAttr.includes('handleUserLogout')) {
                authButtonCount++;
            }
            
            // Remove if it's an old login/logout button
            if (btnId === 'user-login-btn' || btnId === 'user-logout-btn') {
                console.log('🗑️ Removing old button by ID:', btnId);
                btn.remove();
                return;
            }
            
            // Remove duplicate auth buttons (keep only the first one with id="user-auth-btn")
            if ((btnText === 'Giriş Yap' || btnText === 'Çıkış Yap') && btnId !== 'user-auth-btn') {
                console.log('🗑️ Removing duplicate auth button:', btnId, btnText);
                btn.remove();
                return;
            }
            
            // Remove if it has old onclick handlers but wrong ID
            if ((onclickAttr.includes('showUsernameLoginModal') || onclickAttr.includes('handleUserLogout')) && btnId !== 'user-auth-btn') {
                console.log('🗑️ Removing button with old onclick:', btnId, onclickAttr);
                btn.remove();
                return;
            }
        });
        
        console.log('📊 Auth button count:', authButtonCount);
    }
    
    if (oldLoginBtn) {
        console.log('Removing old login button');
        oldLoginBtn.remove();
    }
    if (oldLogoutBtn) {
        console.log('Removing old logout button');
        oldLogoutBtn.remove();
    }
    
    if (!usernameDisplay || !statusIndicator) {
        console.warn('User status UI elements not found');
        return;
    }
    
    if (!authBtn) {
        console.error('user-auth-btn not found! Check HTML.');
        // Try to create it if it doesn't exist
        if (userActions) {
            const newBtn = document.createElement('button');
            newBtn.id = 'user-auth-btn';
            newBtn.className = 'secondary-btn user-action-btn';
            newBtn.onclick = handleUserAuth;
            newBtn.textContent = isLoggedIn ? 'Çıkış Yap' : 'Giriş Yap';
            userActions.appendChild(newBtn);
            console.log('Created user-auth-btn');
        }
        return;
    }
    
    // Ensure the auth button is visible and has correct onclick
    authBtn.style.display = 'inline-block';
    authBtn.style.visibility = 'visible';
    authBtn.onclick = handleUserAuth;
    authBtn.setAttribute('onclick', 'handleUserAuth()');
    
    if (isLoggedIn) {
        // User is logged in
        usernameDisplay.textContent = username;
        statusIndicator.textContent = '🟢 Giriş Yapıldı';
        statusIndicator.style.color = '#10b981';
        authBtn.textContent = 'Çıkış Yap';
        
        // Update avatar based on gender
        const gender = localStorage.getItem('hasene_user_gender');
        if (gender === 'male') {
            if (userAvatar) userAvatar.textContent = '👨';
        } else if (gender === 'female') {
            if (userAvatar) userAvatar.textContent = '👩';
        } else {
            if (userAvatar) userAvatar.textContent = '👤';
        }
    } else {
        // User is not logged in
        usernameDisplay.textContent = 'Misafir';
        statusIndicator.textContent = '🔴 Çıkış Yapıldı';
        statusIndicator.style.color = '#ef4444';
        authBtn.textContent = 'Giriş Yap';
        if (userAvatar) userAvatar.textContent = '👤';
    }
    
    console.log('✅ User status UI updated. Auth button:', authBtn.textContent);
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
    window.updateUserStatusUI = updateUserStatusUI;
    
    // Ensure UI is updated when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                updateUserStatusUI();
            }, 100);
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            updateUserStatusUI();
        }, 100);
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

