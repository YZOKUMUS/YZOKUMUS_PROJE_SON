/**
 * Hasene Arapça Dersi - API Service
 * Backend API wrapper with Firebase + localStorage fallback
 * Veri senkronizasyonu: IndexedDB → localStorage → Firebase
 */

// ========================================
// BACKEND TYPE CONFIGURATION
// ========================================

/**
 * Get backend type helper - uses auth.js function
 * @returns {string} 'localStorage' | 'firebase'
 */
function getBackendTypeFromAuth() {
    // Always use auth.js function - it's loaded before api-service.js
    if (typeof window.getBackendType === 'function') {
        return window.getBackendType();
    }
    
    // Fallback: Check for Firebase availability directly (if auth.js not loaded yet)
    if (window.firebase && window.firebase.firestore) {
        const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        if (user && user.type === 'firebase') {
            return 'firebase';
        }
    }
    
    return 'localStorage';
}

// ========================================
// INDEXEDDB HELPERS (OPSIYONEL - Placeholder)
// ========================================

/**
 * Load from IndexedDB (placeholder - implement if needed)
 * @param {string} key - Storage key
 * @returns {Promise<any>} Cached value or null
 */
async function loadFromIndexedDB(key) {
    // Placeholder for IndexedDB implementation
    // Uncomment and implement when IndexedDB cache is needed:
    /*
    try {
        const db = await openIndexedDB();
        const tx = db.transaction(['gameData'], 'readonly');
        const store = tx.objectStore('gameData');
        const result = await store.get(key);
        return result ? result.value : null;
    } catch (error) {
        console.error('IndexedDB load error:', error);
        return null;
    }
    */
    
    return null; // IndexedDB not implemented yet
}

/**
 * Save to IndexedDB (placeholder)
 * @param {string} key - Storage key
 * @param {any} value - Value to save
 * @returns {Promise<boolean>} Success status
 */
async function saveToIndexedDB(key, value) {
    // Placeholder for IndexedDB implementation
    return false;
}

// ========================================
// FIREBASE FIRESTORE HELPERS (OPSIYONEL)
// ========================================

/**
 * Get document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<any>} Document data or null
 */
async function firestoreGet(collection, docId) {
    const backendType = getBackendTypeFromAuth();
    if (backendType !== 'firebase' || !window.firestore) {
        return null;
    }
    
    try {
        const doc = await window.firestore.collection(collection).doc(docId).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Firestore get error:', error);
        return null;
    }
}

/**
 * Set document in Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {any} data - Document data
 * @returns {Promise<boolean>} Success status
 */
async function firestoreSet(collection, docId, data) {
    const backendType = getBackendTypeFromAuth();
    
    console.log('🔍 firestoreSet called:', { collection, docId, backendType, firestoreExists: !!window.firestore });
    
    if (backendType !== 'firebase' || !window.firestore) {
        console.warn('⚠️ Firebase not available:', { backendType, firestoreExists: !!window.firestore });
        return false;
    }
    
    // Check if user is authenticated
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user || user.id.startsWith('local-')) {
        console.warn('⚠️ User is local, not syncing to Firebase:', user);
        return false;
    }
    
    // Check Firebase auth
    if (window.firebaseAuth && !window.firebaseAuth.currentUser) {
        console.warn('⚠️ Firebase user not authenticated');
        return false;
    }
    
    try {
        console.log('📤 Sending to Firestore:', { collection, docId, dataSize: JSON.stringify(data).length });
        await window.firestore.collection(collection).doc(docId).set(data, { merge: true });
        console.log('✅ Firestore set successful:', { collection, docId });
        return true;
    } catch (error) {
        console.error('❌ Firestore set error:', error);
        console.error('Error details:', { code: error.code, message: error.message });
        return false;
    }
}

// ========================================
// USER STATS API
// ========================================

/**
 * Load user stats from all sources
 * For Firebase users: Firebase → localStorage → IndexedDB
 * For local users: localStorage → IndexedDB
 * @returns {Promise<Object>} User stats object
 */
async function loadUserStats() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const isFirebaseUser = user && !user.id.startsWith('local-');
    
    // For Firebase users, try Firebase first (source of truth)
    if (isFirebaseUser) {
        try {
            const firebaseData = await firestoreGet('user_stats', user.id);
            if (firebaseData && firebaseData.total_points !== undefined) {
                console.log('☁️ User stats loaded from Firebase');
                // Sync to localStorage and IndexedDB for offline access
                if (firebaseData.total_points !== undefined) {
                    localStorage.setItem('hasene_totalPoints', firebaseData.total_points.toString());
                    saveToIndexedDB('hasene_totalPoints', firebaseData.total_points).catch(() => {});
                }
                return firebaseData;
            }
        } catch (error) {
            console.warn('Firebase load failed:', error);
        }
    }
    
    // Try localStorage (works for both Firebase and local users as cache)
    try {
        const localPoints = localStorage.getItem('hasene_totalPoints');
        if (localPoints !== null) {
            console.log('💾 User stats loaded from localStorage');
            return { total_points: parseInt(localPoints) || 0 };
        }
    } catch (error) {
        console.warn('localStorage load failed:', error);
    }
    
    // Try IndexedDB as last resort
    try {
        const indexedData = await loadFromIndexedDB('hasene_totalPoints');
        if (indexedData) {
            console.log('📦 User stats loaded from IndexedDB');
            return { total_points: parseInt(indexedData) || 0 };
        }
    } catch (error) {
        console.warn('IndexedDB load failed:', error);
    }
    
    // Default value
    console.log('🆕 Using default user stats');
    return { total_points: 0 };
}

/**
 * Save user stats to all sources (localStorage + Firebase in parallel)
 * @param {Object} stats - User stats object
 * @returns {Promise<boolean>} Success status
 */
async function saveUserStats(stats) {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user) {
        console.warn('⚠️ No user found, cannot save stats');
        return false;
    }
    
    console.log('💾 saveUserStats called:', { userId: user.id, userType: user.type, stats: Object.keys(stats) });
    
    const promises = [];
    let success = false;
    
    // 1. Always save to localStorage (primary storage for local users)
    try {
        if (stats.total_points !== undefined) {
            localStorage.setItem('hasene_totalPoints', stats.total_points.toString());
        }
        success = true;
        console.log('💾 User stats saved to localStorage');
    } catch (error) {
        console.error('localStorage save failed:', error);
    }
    
    // 2. Save to IndexedDB (async, don't wait)
    promises.push(saveToIndexedDB('hasene_totalPoints', stats.total_points || 0));
    
    // 3. Save to Firebase (if Firebase user)
    if (!user.id.startsWith('local-')) {
        console.log('🔥 Firebase user detected, syncing to Firestore...');
        // Get username from localStorage (most up-to-date) or user object
        const savedUsername = localStorage.getItem('hasene_username') || user.username || 'Anonim Kullanıcı';
        // Add username to stats for backend reporting
        const statsWithUsername = {
            ...stats,
            username: savedUsername
        };
        console.log('📝 Saving username to Firestore:', savedUsername);
        promises.push(
            firestoreSet('user_stats', user.id, statsWithUsername).then((result) => {
                if (result) {
                    console.log('☁️ ✅ User stats saved to Firebase successfully');
                } else {
                    console.warn('☁️ ❌ User stats save to Firebase failed');
                }
                return result;
            }).catch((error) => {
                console.error('☁️ ❌ User stats Firebase save error:', error);
                return false;
            })
        );
    } else {
        console.log('ℹ️ Local user, skipping Firebase sync');
    }
    
    // Wait for all async operations (but don't fail if Firebase fails)
    try {
        const results = await Promise.allSettled(promises);
        console.log('📊 Save operations completed:', results.map(r => r.status));
    } catch (error) {
        console.warn('Some save operations failed:', error);
    }
    
    return success;
}

// ========================================
// DAILY TASKS API
// ========================================

/**
 * Load daily tasks from all sources
 * For Firebase users: Firebase → localStorage
 * For local users: localStorage
 * @returns {Promise<Object>} Daily tasks object
 */
async function loadDailyTasks() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const isFirebaseUser = user && !user.id.startsWith('local-');
    
    // For Firebase users, try Firebase first (source of truth)
    if (isFirebaseUser) {
        try {
            const firebaseData = await firestoreGet('daily_tasks', user.id);
            if (firebaseData) {
                console.log('☁️ Daily tasks loaded from Firebase');
                // Sync to localStorage for offline access
                localStorage.setItem('hasene_dailyTasks', JSON.stringify(firebaseData));
                return firebaseData;
            }
        } catch (error) {
            console.warn('Firebase load failed:', error);
        }
    }
    
    // Try localStorage (works for both Firebase and local users as cache)
    try {
        const localTasks = localStorage.getItem('hasene_dailyTasks');
        if (localTasks) {
            const parsed = JSON.parse(localTasks);
            console.log('💾 Daily tasks loaded from localStorage');
            return parsed;
        }
    } catch (error) {
        console.warn('localStorage load failed:', error);
    }
    
    // Default value
    return null; // Will be initialized by game-core.js
}

/**
 * Save daily tasks to all sources
 * @param {Object} tasks - Daily tasks object
 * @returns {Promise<boolean>} Success status
 */
async function saveDailyTasks(tasks) {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user) {
        return false;
    }
    
    // 1. Always save to localStorage
    try {
        localStorage.setItem('hasene_dailyTasks', JSON.stringify(tasks));
        console.log('💾 Daily tasks saved to localStorage');
    } catch (error) {
        console.error('localStorage save failed:', error);
        return false;
    }
    
    // 2. Save to Firebase (if Firebase user)
    if (!user.id.startsWith('local-')) {
        try {
            await firestoreSet('daily_tasks', user.id, tasks);
            console.log('☁️ Daily tasks saved to Firebase');
        } catch (error) {
            console.warn('Firebase save failed (using localStorage only):', error);
        }
    }
    
    return true;
}

// ========================================
// SYNC ALL DATA (For manual sync button)
// ========================================

/**
 * Sync all user data to Firebase (if Firebase user)
 * @returns {Promise<boolean>} Success status
 */
async function syncAllDataToBackend() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user || user.id.startsWith('local-')) {
        console.log('ℹ️ Local user, no sync needed');
        return true;
    }
    
    if (getBackendTypeFromAuth() !== 'firebase') {
        console.log('ℹ️ Firebase not configured, no sync needed');
        return true;
    }
    
    try {
        // Load all data from localStorage
        const totalPoints = parseInt(localStorage.getItem('hasene_totalPoints') || '0');
        const streakData = JSON.parse(localStorage.getItem('hasene_streakData') || '{}');
        const gameStats = JSON.parse(localStorage.getItem('hasene_gameStats') || '{}');
        const dailyTasks = JSON.parse(localStorage.getItem('hasene_dailyTasks') || '{}');
        const badges = JSON.parse(localStorage.getItem('hasene_badges') || '{}');
        const achievements = JSON.parse(localStorage.getItem('hasene_achievements') || '[]');
        
        // Save to Firebase
        await firestoreSet('user_stats', user.id, {
            total_points: totalPoints,
            badges: badges,
            streak_data: streakData,
            game_stats: gameStats,
            perfect_lessons_count: gameStats.perfectLessons || 0
        });
        
        await firestoreSet('daily_tasks', user.id, dailyTasks);
        
        console.log('✅ All data synced to Firebase');
        return true;
    } catch (error) {
        console.error('Sync failed:', error);
        return false;
    }
}

// Make functions globally available
// Note: getBackendType is NOT exported - use window.getBackendType from auth.js instead
if (typeof window !== 'undefined') {
    // window.getBackendType is already set by auth.js, don't override it
    window.loadFromIndexedDB = loadFromIndexedDB;
    window.saveToIndexedDB = saveToIndexedDB;
    window.firestoreGet = firestoreGet;
    window.firestoreSet = firestoreSet;
    window.loadUserStats = loadUserStats;
    window.saveUserStats = saveUserStats;
    window.loadDailyTasks = loadDailyTasks;
    window.saveDailyTasks = saveDailyTasks;
    window.syncAllDataToBackend = syncAllDataToBackend;
}

