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
    // Check for Firebase user first (if Firebase is enabled)
    if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
        const firebaseUser = window.firebase.auth().currentUser;
        return {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || 'Kullanıcı',
            email: firebaseUser.email || '',
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
 * Sign out (clear local user only, Firebase handled separately)
 */
function signOut() {
    // Only clear local user data
    const userId = getCurrentUser()?.id;
    if (userId && userId.startsWith('local-')) {
        localStorage.removeItem('hasene_user_id');
        localStorage.removeItem('hasene_username');
        localStorage.removeItem('hasene_user_email');
        console.log('✅ Local kullanıcı çıkış yaptı');
    }
    
    // Firebase sign out would be handled here if Firebase is enabled
    // if (window.firebase && window.firebase.auth) {
    //     window.firebase.auth().signOut();
    // }
}

// ========================================
// FIREBASE AUTH (OPSIYONEL - Placeholder)
// ========================================

/**
 * Sign in with Firebase Anonymous Auth
 * This is a placeholder - implement when Firebase is configured
 */
async function signInWithFirebaseAnonymous() {
    // Placeholder for Firebase Anonymous Authentication
    // Uncomment and implement when Firebase is configured:
    /*
    try {
        const auth = window.firebase.auth();
        const result = await auth.signInAnonymously();
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
    */
    
    console.warn('Firebase authentication is not configured. Using local user.');
    return createLocalUser();
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

