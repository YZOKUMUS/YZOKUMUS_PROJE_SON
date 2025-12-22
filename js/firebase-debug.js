/**
 * Firebase Debug Helper
 * Firebase hatalarını ve durumlarını console'a loglar
 */

// Debug mode kontrolü
if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG) {
    console.log('🔍 Firebase Debug Mode Enabled');
    
    // Firebase Auth state değişikliklerini izle
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (CONFIG.DEBUG) {
                console.log('👤 Firebase Auth State Changed:', user ? user.email || user.uid : 'Signed out');
            }
        });
    }
    
    // Firestore hatalarını yakala
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.code && event.reason.code.startsWith('firestore/')) {
            console.error('❌ Firebase Error:', event.reason);
        }
    });
} else {
    // Debug mode kapalıysa boş bir modül
    console.log('ℹ️ Firebase Debug Mode Disabled');
}

