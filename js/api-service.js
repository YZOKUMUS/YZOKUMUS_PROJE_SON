/**
 * Hasene Arapça Dersi - API Service
 * Backend API wrapper with Firebase + localStorage fallback
 * Veri senkronizasyonu: IndexedDB → localStorage → Firebase
 */

// ========================================
// BACKEND TYPE CONFIGURATION
// ========================================

/**
 * Convert username to safe Firestore document ID
 * Removes/replaces invalid characters for Firestore document IDs
 * @param {string} username - Username to convert
 * @returns {string} Safe document ID
 */
function usernameToDocId(username) {
    console.log('🔍 usernameToDocId called with:', username);
    
    if (!username || typeof username !== 'string') {
        console.warn('⚠️ usernameToDocId: Invalid username, returning user_unknown');
        return 'user_unknown';
    }
    
    // Replace spaces and invalid characters with underscores
    // Firestore document IDs: letters, digits, and underscore only (no spaces, slashes, etc.)
    let safeId = username.trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_') // Replace invalid chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
    
    // Ensure it's not empty
    if (!safeId || safeId.length === 0) {
        console.warn('⚠️ usernameToDocId: Result is empty, generating timestamp-based ID');
        safeId = 'user_' + Date.now();
    }
    
    // Firestore document ID max length is 1500 chars, but keep it reasonable
    if (safeId.length > 100) {
        safeId = safeId.substring(0, 100);
    }
    
    console.log('✅ usernameToDocId result:', safeId, '(from input:', username + ')');
    return safeId;
}

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
    if (!window.FIREBASE_ENABLED || !window.firestore) {
        // Firebase not enabled, skip
        return null;
    }
    
    // Check Firebase auth - try to sign in anonymously if not authenticated (for local users)
    let firebaseAuthUID = null;
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        // Already authenticated
        firebaseAuthUID = window.firebaseAuth.currentUser.uid;
    } else {
        // Try anonymous auth for local users
        const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        if (user && typeof window.autoSignInAnonymous === 'function') {
            try {
                await window.autoSignInAnonymous();
                if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                    firebaseAuthUID = window.firebaseAuth.currentUser.uid;
                    console.log('✅ Anonymous Firebase auth for firestoreGet, UID:', firebaseAuthUID);
                } else {
                    console.warn('⚠️ Anonymous auth completed but no current user');
                    return null;
                }
            } catch (error) {
                console.warn('⚠️ Firebase anonymous auth failed in firestoreGet:', error);
                return null;
            }
        } else {
            console.warn('⚠️ Firebase user not authenticated, cannot read from Firestore');
            return null;
        }
    }
    
    try {
        const doc = await window.firestore.collection(collection).doc(docId).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        // Permission errors are expected if user is not authenticated - silently fall back to localStorage
        if (error.code !== 'permission-denied') {
            console.error('Firestore get error:', error);
        }
        // Permission denied is expected for non-authenticated users, no need to log
        return null;
    }
}

/**
 * Delete document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<boolean>} Success status
 */
async function firestoreDelete(collection, docId) {
    const backendType = getBackendTypeFromAuth();
    
    if (backendType !== 'firebase' || !window.firestore) {
        console.warn('⚠️ firestoreDelete: Firebase kullanılamıyor', { backendType, firestoreExists: !!window.firestore });
        return false;
    }
    
    // Check if user is authenticated
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user) {
        console.warn('⚠️ firestoreDelete: Kullanıcı bulunamadı');
        return false;
    }
    
    if (user.id.startsWith('local-')) {
        console.warn('⚠️ firestoreDelete: Local kullanıcı, Firebase silme yapılmıyor', { userId: user.id });
        return false;
    }
    
    // Check Firebase auth
    if (window.firebaseAuth && !window.firebaseAuth.currentUser) {
        console.warn('⚠️ firestoreDelete: Firebase auth kullanıcısı yok');
        return false;
    }
    
    try {
        const docRef = window.firestore.collection(collection).doc(docId);
        // Önce dokümanın var olup olmadığını kontrol et
        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
            console.log('ℹ️ firestoreDelete: Doküman zaten yok:', { collection, docId });
            return true; // Zaten yoksa başarılı say
        }
        
        // Doküman varsa user_id kontrolü yap (güvenlik için)
        const docData = docSnapshot.data();
        const docUserId = docData?.user_id;
        const currentFirebaseUID = window.firebaseAuth?.currentUser?.uid;
        
        if (docUserId && currentFirebaseUID && docUserId !== currentFirebaseUID) {
            console.warn('⚠️ firestoreDelete: Doküman farklı bir kullanıcıya ait, silme işlemi atlanıyor:', { 
                collection, 
                docId, 
                docUserId, 
                currentFirebaseUID 
            });
            // Farklı kullanıcıya aitse de başarılı say (bizim sorumluluğumuz değil)
            return true;
        }
        
        await docRef.delete();
        console.log('✅ Firestore delete successful:', { collection, docId });
        return true;
    } catch (error) {
        // Permission denied hatası, doküman farklı kullanıcıya ait olabilir veya zaten silinmiş olabilir
        if (error.code === 'permission-denied') {
            console.warn('⚠️ firestoreDelete: Permission denied (doküman farklı kullanıcıya ait veya zaten silinmiş olabilir):', { 
                collection, 
                docId, 
                error: error.message 
            });
            // Permission denied durumunda da başarılı say (doküman zaten erişilemez)
            return true;
        }
        console.error('❌ Firestore delete error:', error, { collection, docId, userId: user?.id });
        return false;
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
    // Removed verbose logging - only log on actual errors
    
    // Check if Firebase is enabled and available
    if (!window.FIREBASE_ENABLED || !window.firestore) {
        console.warn('⚠️ Firebase not available:', { FIREBASE_ENABLED: !!window.FIREBASE_ENABLED, firestoreExists: !!window.firestore });
        return false;
    }
    
    // Check if user exists and has a real username
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user) {
        console.warn('⚠️ No user found, not syncing to Firebase');
        return false;
    }
    
    // ALWAYS use localStorage username first - this is the username user explicitly entered
    // Don't fall back to user.username (which might be Firebase displayName) unless localStorage is empty
    const savedUsername = localStorage.getItem('hasene_username') || '';
    const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
    const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
    
    if (!hasRealUsername) {
        console.warn('⚠️ User has no real username in localStorage (hasene_username), not syncing to Firebase. localStorage value:', savedUsername);
        return false;
    }
    
    // Check Firebase auth - try to sign in anonymously if not authenticated (for local users)
    let firebaseAuthUID = null;
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        // Already authenticated, use current user's UID
        firebaseAuthUID = window.firebaseAuth.currentUser.uid;
        console.log('✅ Firebase user authenticated, UID:', firebaseAuthUID);
    } else {
        // For local users, try anonymous auth
        if (user.id.startsWith('local-') && typeof window.autoSignInAnonymous === 'function') {
            try {
                const authResult = await window.autoSignInAnonymous();
                if (authResult && window.firebaseAuth && window.firebaseAuth.currentUser) {
                    firebaseAuthUID = window.firebaseAuth.currentUser.uid;
                    console.log('✅ Anonymous Firebase auth for local user, UID:', firebaseAuthUID);
                } else {
                    console.warn('⚠️ Anonymous auth completed but no current user');
                    return false;
                }
            } catch (error) {
                console.warn('⚠️ Firebase anonymous auth failed:', error);
                return false;
            }
        } else {
            console.warn('⚠️ Firebase user not authenticated and cannot sign in anonymously');
            return false;
        }
    }
    
    // Ensure we have Firebase auth UID
    if (!firebaseAuthUID) {
        console.warn('⚠️ No Firebase auth UID available, cannot save to Firestore');
        return false;
    }
    
    try {
        // Ensure data has user_id field for security rules - MUST use Firebase auth UID, not user.id
        const dataToSave = { ...data };
        // Always use Firebase auth UID for user_id (security rules requirement)
        dataToSave.user_id = firebaseAuthUID;
        
        // Use set with merge to create or update document
        await window.firestore.collection(collection).doc(docId).set(dataToSave, { merge: true });
        return true;
    } catch (error) {
        // Permission denied is expected for users without proper Firebase auth - silently fail
        if (error.code === 'permission-denied') {
            // Silent fail for permission denied - this is expected for local users
            return false;
        }
        // Only log unexpected errors
        console.error('❌ Firestore set error:', error);
        const errorDataUserId = data?.user_id || firebaseAuthUID;
        console.error('Error details:', { 
            code: error.code, 
            message: error.message,
            collection: collection,
            docId: docId
        });
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
    
    console.log('🔍 loadUserStats called with user:', user);
    console.log('🔍 localStorage hasene_username:', localStorage.getItem('hasene_username'));
    console.log('🔍 localStorage hasene_username_display:', localStorage.getItem('hasene_username_display'));
    
    // Try Firebase first if user has a real username (works for both local and Firebase users)
    // ALWAYS use localStorage username - don't fall back to user.username
    if (user && window.FIREBASE_ENABLED && window.firestore) {
        try {
            const savedUsername = localStorage.getItem('hasene_username') || '';
            const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
            const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
            
            console.log('🔍 hasRealUsername:', hasRealUsername, 'savedUsername:', savedUsername);
            
            if (hasRealUsername) {
                const docId = usernameToDocId(savedUsername);
                console.log('🔍 loadUserStats - Attempting to load from Firebase with docId:', docId, 'for username:', savedUsername);
                const firebaseData = await firestoreGet('user_stats', docId);
                console.log('🔍 Firebase data received:', firebaseData);
                if (firebaseData && firebaseData.total_points !== undefined) {
                    console.log('☁️ User stats loaded from Firebase (username:', savedUsername + ')');
                    // ÖNEMLİ: Firebase'den gelen değer 0'dan büyükse veya localStorage'da değer yoksa güncelle
                    // Aksi halde localStorage'daki değeri koru (yanlışlıkla sıfırlanmasını önle)
                    const localPoints = parseInt(localStorage.getItem('hasene_totalPoints') || '0');
                    if (firebaseData.total_points > 0 || localPoints === 0) {
                        // Firebase'deki değer geçerli veya localStorage'da değer yok
                        localStorage.setItem('hasene_totalPoints', firebaseData.total_points.toString());
                        saveToIndexedDB('hasene_totalPoints', firebaseData.total_points).catch(() => {});
                    } else {
                        // localStorage'da değer varsa ve Firebase'de 0 ise, localStorage'daki değeri koru
                        console.log('⚠️ Firebase total_points is 0, keeping localStorage value:', localPoints);
                        // Firebase'i localStorage değeriyle güncelle
                        if (typeof window.saveUserStats === 'function') {
                            window.saveUserStats({ total_points: localPoints }).catch(() => {});
                        }
                    }
                    return firebaseData;
                }
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
    
    // Check if user exists, if not check localStorage directly
    const userId = localStorage.getItem('hasene_user_id');
    const username = localStorage.getItem('hasene_username');
    
    if (!user && (!userId || !username)) {
        console.warn('⚠️ No user found, cannot save stats');
        return false;
    }
    
    console.log('💾 saveUserStats called:', { 
        userId: user?.id || userId, 
        userType: user?.type || 'local', 
        stats: Object.keys(stats) 
    });
    
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
    
    // 3. Save to Firebase if user has a real username
    // IMPORTANT: ALWAYS use localStorage username (hasene_username) - this is what user explicitly entered
    // Don't use user.username which might be Firebase displayName or other default values
    const savedUsername = localStorage.getItem('hasene_username') || '';
    console.log('🔍 saveUserStats - Checking username:', { savedUsername, localStorageHasUsername: !!localStorage.getItem('hasene_username') });
    
    const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
    const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
    
    console.log('🔍 saveUserStats - Username check:', { savedUsername, hasRealUsername, FIREBASE_ENABLED: !!window.FIREBASE_ENABLED, firestore: !!window.firestore });
    
    if (hasRealUsername && window.FIREBASE_ENABLED && window.firestore) {
        console.log('🔥 User has real username, syncing to Firestore...');
        // Use username as document ID for easy tracking
        const docId = usernameToDocId(savedUsername);
        console.log('📝 saveUserStats - Document ID generated:', docId, 'for username:', savedUsername);
        
        // Get display username (original case) for leaderboard display
        const savedUsernameDisplay = localStorage.getItem('hasene_username_display') || savedUsername;
        
        // Add username and user_id to stats for tracking
        const statsWithUsername = {
            ...stats,
            username: savedUsername, // Lowercase for consistency
            usernameDisplay: savedUsernameDisplay, // Original case for display
            user_id: user.id, // Keep original user ID for reference
            user_type: user.type || 'local'
        };
        console.log('📝 Saving username to Firestore (docId:', docId + ', username:', savedUsername + ')');
        promises.push(
            firestoreSet('user_stats', docId, statsWithUsername).then((result) => {
                // Silent fail - permission denied is expected for local users
                // Only log success, not failures
                if (result) {
                    console.log('☁️ ✅ User stats saved to Firebase successfully');
                }
                return result;
            }).catch((error) => {
                // Only log unexpected errors (not permission-denied)
                if (error.code !== 'permission-denied') {
                    console.error('☁️ ❌ User stats Firebase save error:', error);
                }
                return false;
            })
        );
    } else {
        if (!hasRealUsername) {
            console.log('ℹ️ User has no real username, skipping Firebase sync');
        } else {
            console.log('ℹ️ Firebase not enabled, skipping Firebase sync');
        }
    }
    
    // Wait for all async operations (but don't fail if Firebase fails)
    try {
        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;
        
        if (successCount > 0) {
            console.log(`📊 Save operations completed: ${successCount} succeeded${failCount > 0 ? `, ${failCount} failed (non-critical)` : ''}`);
        }
        
        // Log failures only if they're not expected (permission-denied is expected for local users)
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const error = result.reason;
                // Only log unexpected errors (not permission-denied or blocked-by-client)
                if (error && error.code !== 'permission-denied' && 
                    !error.message?.includes('ERR_BLOCKED_BY_CLIENT') &&
                    !error.message?.includes('webchannel')) {
                    console.warn('⚠️ Save operation failed:', error);
                }
            }
        });
    } catch (error) {
        // Only log if it's not a blocked-by-client error
        if (!error.message?.includes('ERR_BLOCKED_BY_CLIENT') &&
            !error.message?.includes('webchannel')) {
            console.warn('Some save operations failed:', error);
        }
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
    
    // Try Firebase first if user has a real username (works for both local and Firebase users)
    // ALWAYS use localStorage username - don't fall back to user.username
    if (user && window.FIREBASE_ENABLED && window.firestore) {
        try {
            const savedUsername = localStorage.getItem('hasene_username') || '';
            const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
            const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
            
            if (hasRealUsername) {
                const docId = usernameToDocId(savedUsername);
                console.log('🔍 loadDailyTasks - Attempting to load from Firebase with docId:', docId, 'for username:', savedUsername);
                const firebaseData = await firestoreGet('daily_tasks', docId);
                if (firebaseData) {
                    console.log('☁️ Daily tasks loaded from Firebase (username:', savedUsername + ')');
                    // Sync to localStorage for offline access
                    localStorage.setItem('hasene_dailyTasks', JSON.stringify(firebaseData));
                    return firebaseData;
                }
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
    
    // 2. Save to Firebase if user has a real username (for both local and Firebase users)
    // ALWAYS use localStorage username - don't fall back to user.username
    const savedUsername = localStorage.getItem('hasene_username') || '';
    const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
    const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
    
    if (hasRealUsername && window.FIREBASE_ENABLED && window.firestore) {
        // Use username as document ID for easy tracking
        const docId = usernameToDocId(savedUsername);
        
        // Add username and user_id to tasks for tracking
        const tasksWithUserInfo = {
            ...tasks,
            username: savedUsername,
            user_id: user.id, // Keep original user ID for reference
            user_type: user.type || 'local'
        };
        
        try {
            const result = await firestoreSet('daily_tasks', docId, tasksWithUserInfo);
            if (result) {
                console.log('☁️ Daily tasks saved to Firebase (docId:', docId + ', username:', savedUsername + ')');
            }
            // Silent fail if permission denied - expected for local users
        } catch (error) {
            // Only log unexpected errors
            if (error.code !== 'permission-denied') {
                console.warn('Firebase save failed (using localStorage only):', error);
            }
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
    if (!user) {
        console.log('ℹ️ No user found, no sync needed');
        return true;
    }
    
        // ALWAYS use localStorage username - don't fall back to user.username
        const savedUsername = localStorage.getItem('hasene_username') || '';
        const defaultUsernames = ['Kullanıcı', 'Misafir', 'Anonim Kullanıcı', ''];
        const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
    
    if (!hasRealUsername) {
        console.log('ℹ️ User has no real username, no sync needed');
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
        const dailyProgress = JSON.parse(localStorage.getItem('hasene_dailyProgress') || '{"date":"","points":0}');
        const dailyGoal = parseInt(localStorage.getItem('hasene_dailyGoal') || '2700');
        
        // Use username as document ID for easy tracking
        const docId = usernameToDocId(savedUsername);
        
        // Save to Firebase with username as document ID
        await firestoreSet('user_stats', docId, {
            total_points: totalPoints,
            badges: badges,
            streak_data: streakData,
            game_stats: gameStats,
            perfect_lessons_count: gameStats.perfectLessons || 0,
            achievements: achievements,
            daily_progress: dailyProgress.points || 0,
            daily_goal: dailyGoal,
            username: savedUsername,
            user_id: user.id,
            user_type: user.type || 'local'
        });
        
        await firestoreSet('daily_tasks', docId, {
            ...dailyTasks,
            username: savedUsername,
            user_id: user.id,
            user_type: user.type || 'local'
        });
        
        console.log('✅ All data synced to Firebase (docId:', docId + ', username:', savedUsername + ')');
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
    window.usernameToDocId = usernameToDocId;
    window.firestoreGet = firestoreGet;
    window.firestoreSet = firestoreSet;
    window.firestoreDelete = firestoreDelete;
    window.loadUserStats = loadUserStats;
    window.saveUserStats = saveUserStats;
    window.loadDailyTasks = loadDailyTasks;
    window.saveDailyTasks = saveDailyTasks;
    window.syncAllDataToBackend = syncAllDataToBackend;
}

