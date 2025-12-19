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
    const username = localStorage.getItem('hasene_username') || 'Kullanıcı';
    const email = localStorage.getItem('hasene_user_email') || '';
    
    if (!userId) {
        // Create new local user if doesn't exist
        return createLocalUser();
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
    const user = getCurrentUser();
    return user !== null && user.id !== null;
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
            localStorage.removeItem('hasene_firebase_user_id');
            localStorage.setItem('hasene_user_type', 'local');
            console.log('✅ Firebase kullanıcı çıkış yaptı');
        } catch (error) {
            console.error('Firebase sign-out error:', error);
        }
    }
    
    // Clear local user data
    if (user && user.id && user.id.startsWith('local-')) {
        localStorage.removeItem('hasene_user_id');
        localStorage.removeItem('hasene_username');
        localStorage.removeItem('hasene_user_email');
        console.log('✅ Local kullanıcı çıkış yaptı');
    }
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

// Make functions globally available
if (typeof window !== 'undefined') {
    window.getCurrentUser = getCurrentUser;
    window.createLocalUser = createLocalUser;
    window.updateLocalUser = updateLocalUser;
    window.isLoggedIn = isLoggedIn;
    window.getBackendType = getBackendType;
    window.signOut = signOut;
    window.signInWithFirebaseAnonymous = signInWithFirebaseAnonymous;
}

