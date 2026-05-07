/**
 * Hasene Arapça Dersi - Leaderboard/Lig Sistemi
 * Haftalık XP tabanlı lig sistemi
 */

// ========================================
// LIG SEVİYELERİ
// ========================================

const LEAGUE_LEVELS = [
    { id: 'ulama', name: 'Ulema', arabic: 'علماء', minXP: 10000, color: '#FFD700', icon: '👑' },
    { id: 'imam', name: 'İmam', arabic: 'إمام', minXP: 8000, color: '#8B008B', icon: '🕌' },
    { id: 'faqih', name: 'Fakih', arabic: 'فقيه', minXP: 6000, color: '#006400', icon: '📚' },
    { id: 'muhaddis', name: 'Muhaddis', arabic: 'محدث', minXP: 4000, color: '#000080', icon: '📖' },
    { id: 'mujtahid', name: 'Müctehid', arabic: 'مجتهد', minXP: 3000, color: '#4169E1', icon: '⚖️' },
    { id: 'alim', name: 'Alim', arabic: 'عالم', minXP: 2000, color: '#4B0082', icon: '🌟' },
    { id: 'kurra', name: 'Kurra', arabic: 'قراء', minXP: 1500, color: '#DC143C', icon: '📿' },
    { id: 'hafiz', name: 'Hafız', arabic: 'حافظ', minXP: 1000, color: '#FFD700', icon: '⭐' },
    { id: 'mutebahhir', name: 'Mütebahhir', arabic: 'متبحر', minXP: 500, color: '#228B22', icon: '🌿' },
    { id: 'mutavassit', name: 'Mutavassıt', arabic: 'متوسط', minXP: 250, color: '#4682B4', icon: '💧' },
    { id: 'talib', name: 'Talib', arabic: 'طالب', minXP: 100, color: '#CD7F32', icon: '📝' },
    { id: 'mubtedi', name: 'Mübtedi', arabic: 'مبتدئ', minXP: 0, color: '#8B4513', icon: '🌱' }
];

// ========================================
// HAFTALIK XP YÖNETİMİ
// ========================================

/**
 * Get week start date (Monday)
 * @returns {Date} Monday of current week
 */
function getWeekStart() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/**
 * Get week start string (YYYY-MM-DD, yerel takvim — günlük streak ile aynı mantık)
 * @returns {string} Week start date string
 */
function getWeekStartString() {
    const weekStart = getWeekStart();
    if (typeof window !== 'undefined' && typeof window.getLocalDateString === 'function') {
        return window.getLocalDateString(weekStart);
    }
    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get current weekly XP
 * Loads from localStorage (primary)
 * @returns {number} Current weekly XP
 */
function getCurrentWeeklyXP() {
    const weekStart = getWeekStartString();
    const key = `hasene_weekly_xp_${weekStart}`;
    
    // Check localStorage
    const localXP = localStorage.getItem(key);
    if (localXP !== null && localXP !== '') {
        const xp = parseInt(localXP || '0');
        console.log('📊 getCurrentWeeklyXP() - localStorage\'dan:', xp, '(key:', key + ')');
        return xp;
    }
    
    // If not in localStorage, return 0
    console.log('📊 getCurrentWeeklyXP() - localStorage\'da yok, 0 döndürülüyor (key:', key + ')');
    return 0;
}

/**
 * Load weekly XP from Firebase and save to localStorage
 * @returns {Promise<void>}
 */
async function loadWeeklyXPFromFirebase() {
    if (!window.FIREBASE_ENABLED || !window.firestore) {
        return;
    }
    
    try {
        // Nuclear clear yapıldıysa Firebase'den yükleme yapma
        const nuclearClearFlag = localStorage.getItem('hasene_nuclear_clear_done');
        if (nuclearClearFlag) {
            // Flag'i kaldır (bir kez kullanıldı)
            localStorage.removeItem('hasene_nuclear_clear_done');
            console.log('ℹ️ Nuclear clear flag bulundu, Firebase\'den weekly XP yüklenmeyecek');
            
            // Mevcut hafta için 0 değerini garanti et (MUTLAKA 0 yap)
            const weekStart = getWeekStartString();
            const key = `hasene_weekly_xp_${weekStart}`;
            
            // ÖNCE TÜM weekly XP keylerini temizle
            const allWeeklyKeys = Object.keys(localStorage).filter(k => k.startsWith('hasene_weekly_xp_'));
            console.log('🔍 Nuclear clear sonrası - Tüm weekly XP keyleri:', allWeeklyKeys);
            allWeeklyKeys.forEach(k => {
                localStorage.removeItem(k);
                console.log('🗑️ Weekly XP key silindi:', k);
            });
            
            // Sonra 0 yaz
            localStorage.setItem(key, '0'); // Her zaman 0 yap
            console.log('✅ Weekly XP 0 olarak ayarlandı (nuclear clear sonrası), key:', key);
            console.log('✅ localStorage kontrol:', localStorage.getItem(key));
            console.log('✅ getCurrentWeeklyXP() sonucu:', getCurrentWeeklyXP());
            
            // Final kontrol
            const finalXP = getCurrentWeeklyXP();
            if (finalXP !== 0) {
                console.error('❌ HATA: getCurrentWeeklyXP() hala 0 değil! Değer:', finalXP);
                // Zorla 0 yap
                localStorage.setItem(key, '0');
                console.log('🔧 Zorla 0 yapıldı, tekrar kontrol:', getCurrentWeeklyXP());
            }
            
            return;
        }
        
        const savedUsername = localStorage.getItem('hasene_username') || '';
        const defaultUsernames = ['Kullanıcı', 'Anonim Kullanıcı', ''];
        const hasRealUsername = savedUsername && savedUsername.trim() !== '' && !defaultUsernames.includes(savedUsername.trim());
        
        if (!hasRealUsername) {
            return;
        }
        
        const weekStart = getWeekStartString();
        const key = `hasene_weekly_xp_${weekStart}`;
        const docId = `${savedUsername}_${weekStart}`;
        
        console.log('🔍 loadWeeklyXPFromFirebase - Attempting to load from Firebase with docId:', docId);
        const firebaseData = await window.firestoreGet('weekly_leaderboard', docId);
        if (firebaseData && firebaseData.weekly_xp !== undefined) {
            const xp = parseInt(firebaseData.weekly_xp || '0');
            // Save to localStorage
            localStorage.setItem(key, xp.toString());
            console.log('✅ Weekly XP loaded from Firebase:', xp, '(key:', key + ')');
        }
    } catch (error) {
        console.warn('⚠️ Firebase weekly XP load failed:', error);
    }
}

/**
 * Update weekly XP (add points)
 * @param {number} points - Points to add
 * @returns {Promise<number>} New weekly XP
 */
async function updateWeeklyXP(points) {
    const weekStart = getWeekStartString();
    const key = `hasene_weekly_xp_${weekStart}`;
    
    const currentXP = getCurrentWeeklyXP();
    const newXP = currentXP + points;
    
    // Save to localStorage
    localStorage.setItem(key, newXP.toString());
    
    // Save to Firebase if Firebase is available (works for both Firebase and local users)
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (user && typeof window.firestoreSet === 'function' && window.firestore) {
        const username = localStorage.getItem('hasene_username') || user.username || 'Anonim Kullanıcı';
        const usernameDisplay = localStorage.getItem('hasene_username_display') || username;
        const groupCode = (localStorage.getItem('hasene_group_code') || '').trim();
        
        // Use username instead of user.id for consistency with other collections
        const docId = `${username}_${weekStart}`;
        
        try {
            const result = await window.firestoreSet('weekly_leaderboard', docId, {
                user_id: user.id, // Keep for reference
                username: username, // Lowercase for consistency
                usernameDisplay: usernameDisplay, // Original case for display
                group_code: groupCode,
                weekly_xp: newXP,
                week_start: weekStart,
                updated_at: new Date().toISOString()
            });
            if (result) {
                console.log('✅ Weekly XP saved to Firebase:', newXP, '(user:', username + ')');
            } else {
                console.warn('⚠️ Firebase weekly XP save returned false');
            }
        } catch (error) {
            console.warn('⚠️ Firebase weekly XP save failed:', error);
        }
    } else {
        console.log('📱 Local user - Weekly XP saved to localStorage only:', newXP);
    }
    
    return newXP;
}

// ========================================
// LIG HESAPLAMA
// ========================================

/**
 * Calculate league from weekly XP
 * @param {number} weeklyXP - Weekly XP amount
 * @returns {Object} League object
 */
function calculateLeague(weeklyXP) {
    // Find the highest league that user qualifies for
    for (let i = 0; i < LEAGUE_LEVELS.length; i++) {
        if (weeklyXP >= LEAGUE_LEVELS[i].minXP) {
            return LEAGUE_LEVELS[i];
        }
    }
    // Fallback to lowest league
    return LEAGUE_LEVELS[LEAGUE_LEVELS.length - 1];
}

/**
 * Get user's current league
 * @returns {Object} League object
 */
function getUserLeague() {
    const weeklyXP = getCurrentWeeklyXP();
    return calculateLeague(weeklyXP);
}

// ========================================
// LEADERBOARD YÜKLEME
// ========================================

/**
 * Load leaderboard from Firebase
 * @returns {Promise<Array>} Array of user rankings
 */
async function loadLeaderboard() {
    const weekStart = getWeekStartString();
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    
    // Try to load from Firebase (works for both Firebase and local users if backend is available)
    if (window.firestore) {
        try {
            // Use Firestore directly for querying
            const snapshot = await window.firestore
                .collection('weekly_leaderboard')
                .where('week_start', '==', weekStart)
                .orderBy('weekly_xp', 'desc')
                .limit(100)
                .get();
            
            const rankings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const docId = doc.id;
                
                // Filter: Only accept username-based docIds (format: username_YYYY-MM-DD)
                // Skip old UID-based docIds (format: long alphanumeric string)
                // Check if docId contains underscore and looks like username_date format
                if (docId.includes('_')) {
                    const parts = docId.split('_');
                    const datePart = parts[parts.length - 1]; // Last part should be date
                    
                    // Validate date format (YYYY-MM-DD)
                    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                        rankings.push({
                            user_id: data.user_id || parts.slice(0, -1).join('_'), // Username part
                            username: data.username || parts.slice(0, -1).join('_'),
                            usernameDisplay: data.usernameDisplay || data.username || parts.slice(0, -1).join('_'),
                            group_code: data.group_code || '',
                            weekly_xp: data.weekly_xp || 0,
                            league: calculateLeague(data.weekly_xp || 0)
                        });
                    } else {
                        console.log('⚠️ Skipping old UID-based entry:', docId);
                    }
                } else {
                    console.log('⚠️ Skipping invalid docId format:', docId);
                }
            });
            
            console.log('✅ Leaderboard loaded from Firebase:', rankings.length, 'users');
            return rankings;
        } catch (error) {
            // If orderBy fails (no index), try without orderBy
            if (error.code === 'failed-precondition' && error.message && error.message.includes('index')) {
                // Extract index creation URL from error message if available
                const indexUrlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s)]+/);
                if (indexUrlMatch) {
                    console.info('ℹ️ Firestore index gerekiyor. Liderlik tablosu manuel sıralama ile yükleniyor.');
                    console.info('📋 Index oluşturmak için:', indexUrlMatch[0]);
                } else {
                    console.info('ℹ️ Firestore index gerekiyor. Liderlik tablosu manuel sıralama ile yükleniyor.');
                }
            } else {
                console.warn('⚠️ Firebase leaderboard load failed:', error);
            }
            
            // Try without orderBy (manual sort)
            try {
                const snapshot = await window.firestore
                    .collection('weekly_leaderboard')
                    .where('week_start', '==', weekStart)
                    .limit(100)
                    .get();
                
                const rankings = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    rankings.push({
                        user_id: data.user_id || doc.id.split('_')[0],
                        username: data.username || 'Anonim Kullanıcı',
                        usernameDisplay: data.usernameDisplay || data.username || 'Anonim Kullanıcı',
                        group_code: data.group_code || '',
                        weekly_xp: data.weekly_xp || 0,
                        league: calculateLeague(data.weekly_xp || 0)
                    });
                });
                
                // Sort manually
                rankings.sort((a, b) => b.weekly_xp - a.weekly_xp);
                
                console.log('✅ Leaderboard loaded from Firebase (manual sort):', rankings.length, 'users');
                return rankings;
            } catch (error2) {
                console.warn('⚠️ Firebase leaderboard load failed (fallback):', error2);
            }
        }
    }
    
    // Fallback: Return empty array (Firebase not available)
    console.warn('⚠️ Firebase not available, returning empty leaderboard');
    return [];
}

/**
 * Get user's position in leaderboard
 * @returns {Promise<Object>} User position info
 */
async function getUserPosition() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!user) return null;
    
    // ALWAYS use getCurrentWeeklyXP() - this reads from localStorage which is the source of truth
    // Firebase leaderboard is for ranking only, not for user's own XP value
    const weeklyXP = getCurrentWeeklyXP();
    console.log('📊 getUserPosition() - getCurrentWeeklyXP() sonucu:', weeklyXP);
    
    // Nuclear clear flag kontrolü - eğer flag varsa kesinlikle 0 kullan
    const nuclearClearFlag = localStorage.getItem('hasene_nuclear_clear_done');
    const finalWeeklyXP = nuclearClearFlag ? 0 : weeklyXP;
    
    if (nuclearClearFlag && weeklyXP !== 0) {
        console.warn('⚠️ Nuclear clear flag var ama weeklyXP 0 değil! Zorla 0 yapılıyor.');
        const weekStart = getWeekStartString();
        const key = `hasene_weekly_xp_${weekStart}`;
        localStorage.setItem(key, '0');
        console.log('🔧 Weekly XP zorla 0 yapıldı');
    }
    
    const league = getUserLeague();
    const leaderboard = await loadLeaderboard();
    
    // Find user position in leaderboard (if user exists in Firebase leaderboard)
    // Note: After reset, user might not be in leaderboard if Firebase data was cleared
    const userIndex = leaderboard.findIndex(u => u.user_id === user.id);
    const position = userIndex >= 0 ? userIndex + 1 : null;
    
    // Count users in same league
    const leagueUsers = leaderboard.filter(u => u.league.id === league.id);
    const leaguePosition = leagueUsers.findIndex(u => u.user_id === user.id);
    
    // Return user position with weeklyXP from localStorage (source of truth)
    const result = {
        position: position,
        leaguePosition: leaguePosition >= 0 ? leaguePosition + 1 : null,
        weeklyXP: finalWeeklyXP, // Always from localStorage via getCurrentWeeklyXP()
        league: calculateLeague(finalWeeklyXP), // Recalculate league with final XP
        totalUsers: leaderboard.length,
        totalInLeague: leagueUsers.length
    };
    
    console.log('📊 getUserPosition() - Döndürülen değer:', result);
    return result;
}

// ========================================
// UI GÖSTERİMİ
// ========================================

/**
 * Show leaderboard modal
 */
async function showLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    if (!modal) {
        console.warn('Leaderboard modal not found');
        return;
    }
    
    // Show loading
    const content = document.getElementById('leaderboard-content');
    if (content) {
        content.innerHTML = '<div style="text-align: center; padding: 30px;"><div class="loading-spinner"></div><p style="margin-top: 10px; font-size: 0.9rem;">Liderlik tablosu yükleniyor...</p></div>';
    }
    
    openModal('leaderboard-modal');
    
    // Load leaderboard
    try {
        const leaderboard = await loadLeaderboard();
        const userPos = await getUserPosition();
        
        console.log('📊 Leaderboard loaded, userPos:', userPos);
        console.log('📊 userPos.weeklyXP:', userPos?.weeklyXP);
        console.log('📊 getCurrentWeeklyXP():', getCurrentWeeklyXP());
        
        renderLeaderboard(leaderboard, userPos);
    } catch (error) {
        console.error('Leaderboard load error:', error);
        if (content) {
            content.innerHTML = '<div style="text-align: center; padding: 30px; color: rgba(26,26,46,0.8); font-size: 0.9rem;">Liderlik tablosu yüklenemedi. Lütfen tekrar deneyin.</div>';
        }
    }
}

/**
 * Render leaderboard content
 * @param {Array} leaderboard - Leaderboard data
 * @param {Object} userPos - User position info
 */
function renderLeaderboard(leaderboard, userPos) {
    const content = document.getElementById('leaderboard-content');
    if (!content) return;
    
    const weekStart = getWeekStartString();
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    const groupCode = (localStorage.getItem('hasene_group_code') || '').trim();
    let html = `
        <div class="leaderboard-header" style="margin-bottom: 8px;">
            <h2 style="font-size: 1rem; margin: 0 0 2px 0;">🏆 Haftalık Liderlik Tablosu</h2>
            <p class="leaderboard-week-info" style="font-size: 0.7rem; color: rgba(26,26,46,0.7); margin: 0;">
                ${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}
            </p>
        </div>
    `;

    if (groupCode) {
        html += `
            <div style="margin: 6px 0 10px; font-size: 0.78rem; color: rgba(26,26,46,0.75);">
                🔒 Grup kodu filtresi aktif: <b>${groupCode}</b>
            </div>
        `;
    }
    
    // User's current league and position
    if (userPos) {
        html += `
            <div class="user-league-info" style="background: linear-gradient(135deg, ${userPos.league.color}22, ${userPos.league.color}11); border: 1.5px solid ${userPos.league.color}; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="font-size: 18px; line-height: 1;">${userPos.league.icon}</div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 12px; font-weight: bold; color: ${userPos.league.color}; line-height: 1.2;">
                            ${userPos.league.name} (${userPos.league.arabic})
                        </div>
                        <div style="font-size: 10px; color: rgba(26,26,46,0.75); margin-top: 1px; line-height: 1.2;">
                            XP: ${formatNumber(userPos.weeklyXP, '.')} | ${userPos.position ? `#${userPos.position}` : 'Sıralamada değil'}
                            ${userPos.leaguePosition ? ` | Lig: #${userPos.leaguePosition}` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Leaderboard list
    if (leaderboard.length === 0) {
        html += `
            <div style="text-align: center; padding: 30px; color: rgba(26,26,46,0.8);">
                <p style="font-size: 0.9rem;">Henüz liderlik tablosu verisi yok.</p>
                <p style="margin-top: 8px; font-size: 0.8rem;">Oyun oynayarak haftalık XP kazanın!</p>
            </div>
        `;
    } else {
        html += `
            <div class="leaderboard-list">
                <div class="leaderboard-tabs" style="display: flex; gap: 6px; margin-bottom: 10px;">
                    <button class="leaderboard-tab active" data-tab="all" onclick="switchLeaderboardTab('all')" style="padding: 6px 12px; font-size: 0.85rem;">
                        Genel Sıralama
                    </button>
                    <button class="leaderboard-tab" data-tab="league" onclick="switchLeaderboardTab('league')" style="padding: 6px 12px; font-size: 0.85rem;">
                        Lig İçi
                    </button>
                </div>
                <div id="leaderboard-list-content">
                    ${renderLeaderboardList(leaderboard, userPos, 'all')}
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

/**
 * Render leaderboard list
 * @param {Array} leaderboard - Leaderboard data
 * @param {Object} userPos - User position info
 * @param {string} mode - 'all' or 'league'
 */
function renderLeaderboardList(leaderboard, userPos, mode = 'all') {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    
    let filtered = [...leaderboard];
    const groupCode = (localStorage.getItem('hasene_group_code') || '').trim();
    if (groupCode) {
        filtered = filtered.filter(u => (u.group_code || '').trim() === groupCode);
    }
    
    // Filter by league if mode is 'league'
    if (mode === 'league' && userPos) {
        filtered = leaderboard.filter(u => u.league.id === userPos.league.id);
        if (groupCode) {
            filtered = filtered.filter(u => (u.group_code || '').trim() === groupCode);
        }
    }
    
    // Sort by weekly_xp descending
    filtered.sort((a, b) => b.weekly_xp - a.weekly_xp);
    
    if (filtered.length === 0) {
        return '<div style="text-align: center; padding: 20px; color: rgba(26,26,46,0.8); font-size: 0.85rem;">Bu ligde henüz kullanıcı yok.</div>';
    }
    
    let html = '<div class="leaderboard-items">';
    
    filtered.forEach((entry, index) => {
        const isCurrentUser = user && entry.user_id === user.id;
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        
        html += `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                margin-bottom: 6px;
                background: ${isCurrentUser ? `linear-gradient(135deg, ${entry.league.color}33, ${entry.league.color}11)` : 'rgba(255,255,255,0.05)'};
                border: ${isCurrentUser ? `2px solid ${entry.league.color}` : '1px solid rgba(255,255,255,0.1)'};
                border-radius: 6px;
            ">
                <div style="font-size: 16px; font-weight: bold; min-width: 30px; text-align: center;">
                    ${medal || rank}
                </div>
                <div style="font-size: 18px;">${entry.league.icon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: ${isCurrentUser ? 'bold' : '500'}; color: ${isCurrentUser ? entry.league.color : 'rgba(26,26,46,0.9)'}; line-height: 1.2;">
                        ${entry.usernameDisplay || entry.username}
                    </div>
                    <div style="font-size: 10px; color: rgba(26,26,46,0.7); margin-top: 1px; line-height: 1.2;">
                        ${entry.league.name} • ${formatNumber(entry.weekly_xp, '.')} XP
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Switch leaderboard tab
 * @param {string} tab - 'all' or 'league'
 */
function switchLeaderboardTab(tab) {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    
    // Reload leaderboard with new mode
    loadLeaderboard().then(leaderboard => {
        getUserPosition().then(userPos => {
            const content = document.getElementById('leaderboard-list-content');
            if (content) {
                content.innerHTML = renderLeaderboardList(leaderboard, userPos, tab);
            }
        });
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format date (DD.MM.YYYY)
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Format number with thousand separator
 * Uses utils.js formatNumber function (with comma separator)
 * For Turkish locale with dot separator, we'll use utils version
 */

// ========================================
// EXPORTS
// ========================================

if (typeof window !== 'undefined') {
    window.getWeekStart = getWeekStart;
    window.getWeekStartString = getWeekStartString;
    window.getCurrentWeeklyXP = getCurrentWeeklyXP;
    window.updateWeeklyXP = updateWeeklyXP;
    window.calculateLeague = calculateLeague;
    window.getUserLeague = getUserLeague;
    window.loadLeaderboard = loadLeaderboard;
    window.loadWeeklyXPFromFirebase = loadWeeklyXPFromFirebase;
    window.getUserPosition = getUserPosition;
    window.showLeaderboardModal = showLeaderboardModal;
    window.switchLeaderboardTab = switchLeaderboardTab;
    window.LEAGUE_LEVELS = LEAGUE_LEVELS;
}

