/**
 * Firebase Debug Helper Functions
 * Console'da çalıştırarak Firebase durumunu kontrol edebilirsiniz
 */

// Make debug functions globally available
// Wait for DOM to be ready
if (typeof window !== 'undefined') {
    // Wait a bit for other scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initDebugFunctions, 500);
        });
    } else {
        setTimeout(initDebugFunctions, 500);
    }
}

function initDebugFunctions() {
    // Check Firebase status
    window.checkFirebaseStatus = function() {
        console.log('=== Firebase Status Check ===');
        console.log('Firebase enabled:', window.FIREBASE_ENABLED);
        console.log('Firebase SDK loaded:', typeof firebase !== 'undefined');
        console.log('Firebase config:', window.firebaseConfig);
        console.log('Firebase app:', window.firebase);
        console.log('Firebase Auth:', window.firebaseAuth);
        console.log('Firestore:', window.firestore);
        
        if (window.firebaseAuth) {
            console.log('Current Firebase user:', window.firebaseAuth.currentUser);
            console.log('User ID:', window.firebaseAuth.currentUser?.uid);
        }
        
        const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        console.log('App user:', user);
        console.log('Backend type:', typeof window.getBackendType === 'function' ? window.getBackendType() : 'unknown');
        console.log('===========================');
    };
    
    // Test Firebase write
    window.testFirebaseWrite = async function() {
        console.log('=== Testing Firebase Write ===');
        const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        if (!user) {
            console.error('❌ No user found');
            return;
        }
        
        console.log('User:', user);
        
        if (user.id.startsWith('local-')) {
            console.warn('⚠️ User is local, not Firebase user');
            return;
        }
        
        if (typeof window.firestoreSet === 'function') {
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Firebase test write'
            };
            
            console.log('Writing test data to Firestore...');
            const result = await window.firestoreSet('test_collection', user.id, testData);
            console.log('Result:', result);
            
            if (result) {
                console.log('✅ Test write successful! Check Firestore console.');
            } else {
                console.error('❌ Test write failed');
            }
        } else {
            console.error('❌ firestoreSet function not available');
        }
        console.log('=============================');
    };
    
    // Force sync to Firebase
    window.forceSyncToFirebase = async function() {
        console.log('=== Force Sync to Firebase ===');
        const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        if (!user || user.id.startsWith('local-')) {
            console.error('❌ Not a Firebase user');
            return;
        }
        
        if (typeof window.syncAllDataToBackend === 'function') {
            const result = await window.syncAllDataToBackend();
            console.log('Sync result:', result);
        } else {
            console.error('❌ syncAllDataToBackend function not available');
        }
        console.log('==============================');
    };
    
    console.log('✅ Firebase debug functions loaded. Use:');
    console.log('  - checkFirebaseStatus() - Firebase durumunu kontrol et');
    console.log('  - testFirebaseWrite() - Firebase yazma testi');
    console.log('  - forceSyncToFirebase() - Tüm verileri Firebase\'e sync et');
}

