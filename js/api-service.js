/**
 * Hasene Arapça Dersi - API Service
 * Backend API wrapper with Firebase + localStorage fallback
 * Veri senkronizasyonu: IndexedDB → localStorage → Firebase
 */

// ========================================
// BACKEND TYPE CONFIGURATION
// ========================================

/**
 * Get backend type
 * @returns {string} 'localStorage' | 'firebase'
 */
function getBackendType() {
    // Use auth.js function if available, otherwise default to localStorage
    if (typeof window.getBackendType === 'function') {
        return window.getBackendType();
    }
    
    // Check for Firebase availability
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
    const backendType = getBackendType();
    if (backendType !== 'firebase' || !window.firebase || !window.firebase.firestore) {
        return null;
    }
    
    try {
        const db = window.firebase.firestore();
        const doc = await db.collection(collection).doc(docId).get();
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
    const backendType = getBackendType();
    if (backendType !== 'firebase' || !window.firebase || !window.firebase.firestore) {
        return false;
    }
    
    try {
        const db = window.firebase.firestore();
        await db.collection(collection).doc(docId).set(data, { merge: true });
        return true;
    } catch (error) {
        console.error('Firestore set error:', error);
        return false;
    }
}

// ========================================
// USER STATS API
// ========================================

/**
 * Load user stats from all sources (IndexedDB → localStorage → Firebase)
 * @returns {Promise<Object>} User stats object
 */
async function loadUserStats() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    
    // 1. Try IndexedDB first (fastest, local cache)
    try {
        const indexedData = await loadFromIndexedDB('hasene_totalPoints');
        if (indexedData) {
            console.log('📦 User stats loaded from IndexedDB');
            return { total_points: parseInt(indexedData) || 0 };
        }
    } catch (error) {
        console.warn('IndexedDB load failed:', error);
    }
    
    // 2. Try localStorage (fallback)
    try {
        const localPoints = localStorage.getItem('hasene_totalPoints');
        if (localPoints !== null) {
            console.log('💾 User stats loaded from localStorage');
            return { total_points: parseInt(localPoints) || 0 };
        }
    } catch (error) {
        console.warn('localStorage load failed:', error);
    }
    
    // 3. Try Firebase (if user is Firebase user)
    if (user && !user.id.startsWith('local-')) {
        try {
            const firebaseData = await firestoreGet('user_stats', user.id);
            if (firebaseData) {
                console.log('☁️ User stats loaded from Firebase');
                // Sync to localStorage for offline access
                if (firebaseData.total_points !== undefined) {
                    localStorage.setItem('hasene_totalPoints', firebaseData.total_points.toString());
                }
                return firebaseData;
            }
        } catch (error) {
            console.warn('Firebase load failed:', error);
        }
    }
    
    // 4. Default value
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
        console.warn('No user found, cannot save stats');
        return false;
    }
    
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
        promises.push(
            firestoreSet('user_stats', user.id, stats).then((result) => {
                if (result) {
                    console.log('☁️ User stats saved to Firebase');
                }
                return result;
            })
        );
    }
    
    // Wait for all async operations (but don't fail if Firebase fails)
    try {
        await Promise.allSettled(promises);
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
 * @returns {Promise<Object>} Daily tasks object
 */
async function loadDailyTasks() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    
    // 1. Try localStorage first (most common case)
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
    
    // 2. Try Firebase (if Firebase user)
    if (user && !user.id.startsWith('local-')) {
        try {
            const firebaseData = await firestoreGet('daily_tasks', user.id);
            if (firebaseData) {
                console.log('☁️ Daily tasks loaded from Firebase');
                // Sync to localStorage
                localStorage.setItem('hasene_dailyTasks', JSON.stringify(firebaseData));
                return firebaseData;
            }
        } catch (error) {
            console.warn('Firebase load failed:', error);
        }
    }
    
    // 3. Default value
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
    
    if (getBackendType() !== 'firebase') {
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
if (typeof window !== 'undefined') {
    window.getBackendType = getBackendType;
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

