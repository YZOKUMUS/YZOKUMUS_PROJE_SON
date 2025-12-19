/**
 * Hasene Arapça Dersi - Utils
 * Yardımcı fonksiyonlar
 */

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
 * Format number with thousand separators
 */
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.getLocalDateString = getLocalDateString;
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
}
