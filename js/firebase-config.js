/**
 * Hasene Arapça Dersi - Firebase Configuration
 * Firebase yapılandırma dosyası
 * 
 * KURULUM:
 * 1. Firebase Console'da yeni bir proje oluşturun: https://console.firebase.google.com/
 * 2. Authentication → Sign-in method → Anonymous → Enable
 * 3. Firestore Database → Create database → Start in test mode (sonra rules güncellenecek)
 * 4. Project Settings → General → Your apps → Web (</>) → Config bilgilerini kopyalayın
 * 5. Aşağıdaki firebaseConfig objesini doldurun
 */

// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyAYvi2qwedAUdca72paBKTiAwr7FxORlxg",
    authDomain: "hasene-da146.firebaseapp.com",
    projectId: "hasene-da146",
    storageBucket: "hasene-da146.firebasestorage.app",
    messagingSenderId: "892544118538",
    appId: "1:892544110530:web:7aa1c422624593a6cd505b",
    measurementId: "G-ZXT1P7ESXW" // Google Analytics (opsiyonel)
};

// Firebase enabled kontrolü
const FIREBASE_ENABLED = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                         firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// Make config globally available
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.FIREBASE_ENABLED = FIREBASE_ENABLED;
}

