/**
 * Hasene Arapça Dersi - Firebase Initialization
 * Firebase'i başlatır ve authentication state'ini yönetir
 */

// ========================================
// FIREBASE INITIALIZATION
// ========================================

/**
 * Initialize Firebase
 * @returns {Promise<boolean>} Success status
 */
async function initFirebase() {
    // Check if Firebase is enabled
    if (!window.FIREBASE_ENABLED) {
        console.log('ℹ️ Firebase is not configured. Using localStorage only.');
        return false;
    }
    
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK is not loaded. Make sure Firebase scripts are included in HTML.');
        return false;
    }
    
    try {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
            console.log('✅ Firebase initialized');
        }
        
        // Initialize Firebase services
        window.firebase = firebase;
        window.firebaseAuth = firebase.auth();
        window.firestore = firebase.firestore();
        
        // Enable offline persistence
        // Note: Multiple tabs will work independently (localStorage still syncs)
        try {
            await window.firestore.enablePersistence({
                synchronizeTabs: false // Single-tab mode to avoid deprecation warnings
            });
            console.log('✅ Firestore offline persistence enabled');
        } catch (persistenceError) {
            // Persistence might fail in some browsers (Safari private mode, etc.)
            if (persistenceError.code === 'failed-precondition') {
                // Multiple tabs open or persistence already enabled - this is normal
                // localStorage still works for cross-tab sync
            } else if (persistenceError.code === 'unimplemented') {
                console.log('ℹ️ Firestore persistence not supported in this browser');
            } else {
                // Only log unexpected errors
                console.warn('⚠️ Firestore persistence error:', persistenceError);
            }
        }
        
        // Set up auth state listener
        setupAuthStateListener();
        
        // DO NOT auto sign in anonymously - wait for user to log in with username first
        // Firebase will only be used after user explicitly logs in with username
        // await autoSignInAnonymous(); // REMOVED - Only sign in after username login
        
        // Suppress ERR_BLOCKED_BY_CLIENT errors from Firestore WebChannel (caused by browser extensions)
        // These are non-critical connection termination errors
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('error', (event) => {
                // Filter out Firestore WebChannel connection errors (non-critical)
                if (event.message && (
                    event.message.includes('ERR_BLOCKED_BY_CLIENT') ||
                    event.message.includes('webchannel_connection') ||
                    (event.filename && event.filename.includes('webchannel_connection'))
                )) {
                    // Suppress these errors - they're caused by browser extensions blocking Firestore connections
                    // Data is still saved successfully via other channels
                    event.preventDefault();
                    return false;
                }
            }, true);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

/**
 * Set up Firebase Auth state listener
 */
function setupAuthStateListener() {
    if (!window.firebaseAuth) return;
    
    window.firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ Firebase user authenticated:', user.uid);
            // User is signed in, update local storage
            localStorage.setItem('hasene_firebase_user_id', user.uid);
            localStorage.setItem('hasene_user_type', 'firebase');
        } else {
            console.log('ℹ️ Firebase user signed out');
            localStorage.removeItem('hasene_firebase_user_id');
            localStorage.setItem('hasene_user_type', 'local');
        }
    });
}

/**
 * Auto sign in with Firebase Anonymous Auth
 * @returns {Promise<Object|null>} User object or null
 */
async function autoSignInAnonymous() {
    if (!window.firebaseAuth) return null;
    
    try {
        // Check if already signed in
        const currentUser = window.firebaseAuth.currentUser;
        if (currentUser) {
            console.log('✅ Already signed in:', currentUser.uid);
            return {
                id: currentUser.uid,
                username: 'Anonim Kullanıcı',
                email: '',
                type: 'firebase'
            };
        }
        
        // Try to sign in anonymously
        const result = await window.firebaseAuth.signInAnonymously();
        console.log('✅ Firebase anonymous sign-in successful:', result.user.uid);
        
        return {
            id: result.user.uid,
            username: 'Anonim Kullanıcı',
            email: '',
            type: 'firebase'
        };
    } catch (error) {
        console.error('❌ Firebase anonymous sign-in error:', error);
        // Fallback to local user
        if (typeof window.createLocalUser === 'function') {
            return window.createLocalUser();
        }
        return null;
    }
}

/**
 * Sign out from Firebase
 */
async function signOutFirebase() {
    if (!window.firebaseAuth) return;
    
    try {
        await window.firebaseAuth.signOut();
        console.log('✅ Firebase sign-out successful');
        localStorage.removeItem('hasene_firebase_user_id');
        localStorage.setItem('hasene_user_type', 'local');
    } catch (error) {
        console.error('❌ Firebase sign-out error:', error);
    }
}

// Initialize Firebase when scripts are loaded
// Firebase SDK'ları yüklendikten sonra otomatik olarak initialize edilir
if (typeof window !== 'undefined') {
    // Script load sırasına göre çalışır (Firebase SDK yüklendikten sonra)
    (function() {
        function tryInit() {
            if (typeof firebase !== 'undefined' && window.firebaseConfig) {
                initFirebase();
            } else {
                // Firebase SDK henüz yüklenmemiş, biraz bekle
                setTimeout(tryInit, 100);
            }
        }
        
        // DOM ready olduğunda dene
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInit);
        } else {
            tryInit();
        }
    })();
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.initFirebase = initFirebase;
    window.signOutFirebase = signOutFirebase;
    window.autoSignInAnonymous = autoSignInAnonymous;
}

