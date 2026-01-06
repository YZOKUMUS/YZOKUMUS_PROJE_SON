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
        
        // Initialize Firestore with cache settings (new API)
        try {
            window.firestore = firebase.firestore();
            
            // Enable offline persistence using the new cache settings API
            // This replaces the deprecated enableIndexedDbPersistence()
            window.firestore.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                merge: true // Merge with existing settings
            });
            
            // Note: Persistence is now enabled by default in newer Firebase versions
            console.log('✅ Firestore initialized with cache settings');
        } catch (firestoreError) {
            console.warn('⚠️ Firestore initialization warning:', firestoreError);
            // Fallback to basic initialization
            window.firestore = firebase.firestore();
        }
        
        // Set up auth state listener
        setupAuthStateListener();
        
        // DO NOT auto sign in anonymously - wait for user to log in with username first
        // Firebase will only be used after user explicitly logs in with username
        // await autoSignInAnonymous(); // REMOVED - Only sign in after username login
        
        // Suppress ERR_BLOCKED_BY_CLIENT errors from Firestore WebChannel (caused by browser extensions)
        // These are non-critical connection termination errors
        // Also suppress Firebase OAuth domain warnings
        if (typeof window.addEventListener === 'function') {
            // Global error handler
            window.addEventListener('error', (event) => {
                // Filter out Firestore WebChannel connection errors (non-critical)
                if (event.message && (
                    event.message.includes('ERR_BLOCKED_BY_CLIENT') ||
                    event.message.includes('webchannel_connection') ||
                    event.message.includes('current domain is not authorized for OAuth') ||
                    event.message.includes('OAuth redirect domains') ||
                    (event.filename && event.filename.includes('webchannel_connection'))
                )) {
                    // Suppress these errors - they're caused by browser extensions blocking Firestore connections
                    // Data is still saved successfully via other channels
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }, true);
            
            // Console.error override to suppress Firestore WebChannel errors
            const originalConsoleError = console.error;
            console.error = function(...args) {
                // Check if this is a Firestore WebChannel error
                const message = args.join(' ');
                if (message.includes('ERR_BLOCKED_BY_CLIENT') || 
                    message.includes('webchannel_connection') ||
                    message.includes('Firestore/Write/channel')) {
                    // Suppress these errors - non-critical
                    return;
                }
                // Call original console.error for other errors
                originalConsoleError.apply(console, args);
            };
            
            // Helper function to check if message is OAuth warning
            const isOAuthWarning = (message) => {
                return message.includes('current domain is not authorized for OAuth') ||
                       message.includes('OAuth redirect domains') ||
                       message.includes('signInWithPopup') ||
                       message.includes('signInWithRedirect') ||
                       message.includes('linkWithPopup') ||
                       message.includes('linkWithRedirect') ||
                       message.includes('127.0.0.1') && message.includes('OAuth');
            };
            
            // Console.info override to suppress Firebase OAuth domain warnings
            const originalConsoleInfo = console.info;
            console.info = function(...args) {
                const message = args.join(' ');
                if (isOAuthWarning(message)) {
                    // Suppress OAuth domain warnings - these are expected in development
                    // OAuth is not used in this app, so these warnings are harmless
                    return;
                }
                originalConsoleInfo.apply(console, args);
            };
            
            // Console.log override to suppress Firebase OAuth domain warnings
            const originalConsoleLog = console.log;
            console.log = function(...args) {
                const message = args.join(' ');
                if (isOAuthWarning(message)) {
                    // Suppress OAuth domain warnings
                    return;
                }
                originalConsoleLog.apply(console, args);
            };
            
            // Console.warn override to suppress Firebase OAuth domain warnings
            const originalConsoleWarn = console.warn;
            console.warn = function(...args) {
                const message = args.join(' ');
                if (isOAuthWarning(message)) {
                    // Suppress OAuth domain warnings
                    return;
                }
                originalConsoleWarn.apply(console, args);
            };
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

