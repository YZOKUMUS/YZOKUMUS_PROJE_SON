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
        
        // Enable offline persistence (optional but recommended)
        // Note: This will show a deprecation warning in console, but still works
        // Multiple tabs warning is normal when multiple tabs are open - localStorage still works
        try {
            await window.firestore.enablePersistence({
                synchronizeTabs: true
            });
            console.log('✅ Firestore offline persistence enabled');
        } catch (persistenceError) {
            // Persistence might fail in some browsers (Safari private mode, etc.)
            // Multiple tabs is a normal condition - not an error
            if (persistenceError.code === 'failed-precondition') {
                // Multiple tabs open - this is normal, localStorage still works
                // Silently handle - no need to show warning
            } else if (persistenceError.code === 'unimplemented') {
                console.log('ℹ️ Firestore persistence not supported in this browser');
            } else {
                // Only log unexpected errors
                console.warn('⚠️ Firestore persistence error:', persistenceError);
            }
        }
        
        // Set up auth state listener
        setupAuthStateListener();
        
        // Try to sign in anonymously (if not already signed in)
        await autoSignInAnonymous();
        
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

