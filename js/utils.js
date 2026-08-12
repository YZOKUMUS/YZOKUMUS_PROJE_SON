/**
 * Hasene Arapça Dersi - Utils
 * Yardımcı fonksiyonlar
 */

/**
 * Production-safe logging
 * Only logs if DEBUG is enabled
 */
function debugLog(...args) {
    if (window.CONFIG && window.CONFIG.DEBUG) {
        console.log(...args);
    }
}

function debugWarn(...args) {
    if (window.CONFIG && window.CONFIG.DEBUG) {
        console.warn(...args);
    }
}

function debugError(...args) {
    // Errors are always logged, even in production
    console.error(...args);
}

/**
 * Get current date as YYYY-MM-DD string
 */
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Add days to a YYYY-MM-DD date string (local calendar, no UTC shift)
 */
function addDaysToLocalDateString(dateStr, days) {
    const parts = dateStr.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    date.setDate(date.getDate() + days);
    return getLocalDateString(date);
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {string} separator - Separator to use (default: ',', can be '.' for Turkish locale)
 */
function formatNumber(num, separator = ',') {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Shuffle options with equal distribution of correct answer position
 * Ensures correct answer appears in each position roughly equally over time
 * @param {Array} options - All options including correct answer
 * @param {string} correctAnswer - The correct answer
 * @param {Array} positionCounts - Array tracking usage count per position [0, 0, 0, 0]
 * @returns {Object} { options: Array, correctIndex: number }
 */
function shuffleWithEqualDistribution(options, correctAnswer, positionCounts) {
    if (!positionCounts || positionCounts.length !== options.length) {
        // Fallback to normal shuffle if positionCounts not provided
        const shuffled = shuffleArray(options);
        const correctIndex = shuffled.indexOf(correctAnswer);
        return { options: shuffled, correctIndex };
    }
    
    // 1. Find least used positions
    const minCount = Math.min(...positionCounts);
    const leastUsedPositions = positionCounts
        .map((count, index) => ({ count, index }))
        .filter(item => item.count === minCount)
        .map(item => item.index);
    
    // 2. Place correct answer in one of the least used positions
    const targetPosition = leastUsedPositions[Math.floor(Math.random() * leastUsedPositions.length)];
    
    // 3. Shuffle other options
    const otherOptions = options.filter(opt => opt !== correctAnswer);
    const shuffledOthers = shuffleArray(otherOptions);
    
    // 4. Place correct answer at target position
    const result = [...shuffledOthers];
    result.splice(targetPosition, 0, correctAnswer);
    
    // 5. Update position counter
    positionCounts[targetPosition]++;
    
    return {
        options: result,
        correctIndex: targetPosition
    };
}

/**
 * Get random item from array
 */
function getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random items from array without duplicates
 */
function getRandomItems(array, count) {
    if (!array || array.length === 0) return [];
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Filter words by difficulty
 */
function filterByDifficulty(words, difficulty) {
    if (!words || words.length === 0) return [];
    
    const settings = CONFIG.DIFFICULTY[difficulty] || CONFIG.DIFFICULTY.medium;
    
    return words.filter(word => {
        const wordDifficulty = word.difficulty || 10;
        return wordDifficulty >= settings.min && wordDifficulty <= settings.max;
    });
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Play audio from URL - Güvenli versiyon (üst üste binmeyi önler)
 */
function playAudio(url) {
    if (!url || !CONFIG.AUDIO.enabled) return null;
    
    // game-core.js'deki güvenli ses fonksiyonunu kullan
    if (typeof window.playSafeAudio === 'function') {
        return window.playSafeAudio(url);
    }
    
    // Fallback: Basit ses çalma
    try {
        const audio = new Audio(url);
        audio.volume = CONFIG.AUDIO.volume;
        audio.play().catch(err => {
            console.warn('Audio play failed:', err);
        });
        return audio;
    } catch (err) {
        console.warn('Audio creation failed:', err);
        return null;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#9d8aff'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Local Storage helpers
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (err) {
        console.error('Storage save error:', err);
        return false;
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (err) {
        console.error('Storage load error:', err);
        return defaultValue;
    }
}

/**
 * Generate unique ID
 */
const HASENE_SHARE_URL = 'https://yzokumus.github.io/YZOKUMUS_PROJE_SON/';
const HASENE_SHARE_TITLE = 'Hasene — Kur\'an Kelimelerini Oyunla Öğren';
const HASENE_SHARE_TEXT = 'Kur\'an kelimelerini oyunla öğren! Cüz Yolculuğu, akıllı tekrar, rozetler ve lig. YZOKUMUS tarafından geliştirildi · Allah rızası için ücretsiz — hemen dene:';
const HASENE_DEVELOPER_CREDIT = 'Geliştirici: YZOKUMUS · Allah rızası için ücretsiz';

/**
 * Uygulamayı paylaş (Web Share API veya panoya kopyala)
 */
async function shareHaseneApp() {
    const payload = {
        title: HASENE_SHARE_TITLE,
        text: `${HASENE_SHARE_TEXT}\n${HASENE_SHARE_URL}`,
        url: HASENE_SHARE_URL
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            await navigator.share({
                title: payload.title,
                text: HASENE_SHARE_TEXT,
                url: payload.url
            });
            return;
        } catch (err) {
            if (err && err.name === 'AbortError') {
                return;
            }
        }
    }

    const copyText = `${HASENE_SHARE_TEXT}\n${HASENE_SHARE_URL}`;
    try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(copyText);
            showToast('Link kopyalandı! WhatsApp veya mesajla gönderebilirsin.', 'success', 3500);
            return;
        }
    } catch (e) {
        // fallback below
    }

    if (typeof window.prompt === 'function') {
        window.prompt('Linki kopyala:', HASENE_SHARE_URL);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const DEV_MODE_STORAGE_KEY = 'hasene_dev_mode';
const DEV_MODE_TAP_TARGET = 7;
const DEV_MODE_TAP_WINDOW_MS = 2500;

let devModeTapCount = 0;
let devModeTapTimer = null;

function isDeveloperMode() {
    if (window.CONFIG && window.CONFIG.DEBUG) {
        return true;
    }
    try {
        return localStorage.getItem(DEV_MODE_STORAGE_KEY) === '1';
    } catch (err) {
        return false;
    }
}

function enableDeveloperMode() {
    try {
        localStorage.setItem(DEV_MODE_STORAGE_KEY, '1');
    } catch (err) {
        // ignore
    }
    updateDeveloperToolsVisibility();
    if (typeof showToast === 'function') {
        showToast('Geliştirici araçları etkinleştirildi', 'info', 2500);
    }
}

function updateDeveloperToolsVisibility() {
    const btn = document.getElementById('dev-tools-btn');
    if (!btn) {
        return;
    }
    if (isDeveloperMode()) {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
}

function initDeveloperModeSecretTap() {
    const avatar = document.getElementById('user-avatar');
    if (!avatar || avatar.dataset.devTapBound === '1') {
        return;
    }
    avatar.dataset.devTapBound = '1';

    avatar.addEventListener('click', () => {
        if (isDeveloperMode()) {
            return;
        }

        devModeTapCount += 1;
        clearTimeout(devModeTapTimer);

        if (devModeTapCount >= DEV_MODE_TAP_TARGET) {
            devModeTapCount = 0;
            enableDeveloperMode();
            return;
        }

        devModeTapTimer = setTimeout(() => {
            devModeTapCount = 0;
        }, DEV_MODE_TAP_WINDOW_MS);
    });
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.getLocalDateString = getLocalDateString;
    window.addDaysToLocalDateString = addDaysToLocalDateString;
    window.formatNumber = formatNumber;
    window.shuffleArray = shuffleArray;
    window.shuffleWithEqualDistribution = shuffleWithEqualDistribution;
    window.getRandomItem = getRandomItem;
    window.getRandomItems = getRandomItems;
    window.filterByDifficulty = filterByDifficulty;
    // Note: openModal and closeModal are defined in game-core.js with enhanced functionality
    window.debounce = debounce;
    window.throttle = throttle;
    window.playAudio = playAudio;
    window.showToast = showToast;
    window.saveToStorage = saveToStorage;
    window.loadFromStorage = loadFromStorage;
    window.generateId = generateId;
    window.shareHaseneApp = shareHaseneApp;
    window.HASENE_SHARE_URL = HASENE_SHARE_URL;
    window.HASENE_DEVELOPER_CREDIT = HASENE_DEVELOPER_CREDIT;
    window.isDeveloperMode = isDeveloperMode;
    window.enableDeveloperMode = enableDeveloperMode;
    window.updateDeveloperToolsVisibility = updateDeveloperToolsVisibility;
    window.initDeveloperModeSecretTap = initDeveloperModeSecretTap;
    // Production-safe logging functions
    window.debugLog = debugLog;
    window.debugWarn = debugWarn;
    window.debugError = debugError;
}
