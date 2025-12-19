/**
 * Hasene Arapça Dersi - Points Manager
 * Puan, seviye ve rozet hesaplama
 */

/**
 * Calculate level from total points
 */
function calculateLevel(points) {
    if (!LEVELS || !LEVELS.THRESHOLDS) return 1;
    
    let level = 1;
    
    // Check first 10 levels
    for (let i = 1; i <= 10; i++) {
        if (points >= (LEVELS.THRESHOLDS[i] || 0)) {
            level = i;
        } else {
            break;
        }
    }
    
    // Calculate levels beyond 10
    if (points >= LEVELS.THRESHOLDS[10]) {
        const extra = points - LEVELS.THRESHOLDS[10];
        const extraLevels = Math.floor(extra / LEVELS.INCREMENT_AFTER_10);
        level = 10 + extraLevels;
    }
    
    return level;
}

/**
 * Get level name
 */
function getLevelName(level) {
    if (!LEVELS || !LEVELS.NAMES) return 'Mübtedi';
    
    if (level <= 10) {
        return LEVELS.NAMES[level] || 'Mübtedi';
    }
    
    // Beyond level 10
    return 'Usta';
}

/**
 * Calculate stars from points
 */
function calculateStars(points) {
    return Math.floor(points / CONFIG.POINTS_PER_STAR);
}

/**
 * Calculate badges from stars
 */
function calculateBadges(stars) {
    return {
        stars: stars,
        bronze: Math.floor(stars / 5),
        silver: Math.floor(stars / 25),
        gold: Math.floor(stars / 125),
        diamond: Math.floor(stars / 625)
    };
}

/**
 * Get next level threshold
 */
function getNextLevelThreshold(currentLevel) {
    if (currentLevel < 10) {
        return LEVELS.THRESHOLDS[currentLevel + 1] || LEVELS.THRESHOLDS[10];
    }
    
    // Beyond level 10
    const levelsAfter10 = currentLevel - 10;
    return LEVELS.THRESHOLDS[10] + ((levelsAfter10 + 1) * LEVELS.INCREMENT_AFTER_10);
}

/**
 * Get current level threshold
 */
function getCurrentLevelThreshold(currentLevel) {
    if (currentLevel <= 10) {
        return LEVELS.THRESHOLDS[currentLevel] || 0;
    }
    
    // Beyond level 10
    const levelsAfter10 = currentLevel - 10;
    return LEVELS.THRESHOLDS[10] + (levelsAfter10 * LEVELS.INCREMENT_AFTER_10);
}

/**
 * Calculate level progress percentage
 */
function calculateLevelProgress(points) {
    const level = calculateLevel(points);
    const currentThreshold = getCurrentLevelThreshold(level);
    const nextThreshold = getNextLevelThreshold(level);
    
    const pointsInLevel = points - currentThreshold;
    const pointsNeeded = nextThreshold - currentThreshold;
    
    return Math.min(100, Math.floor((pointsInLevel / pointsNeeded) * 100));
}

/**
 * Check earned badges
 */
function checkEarnedBadges(totalPoints) {
    const earnedBadges = [];
    
    if (!BADGE_DEFINITIONS) return earnedBadges;
    
    for (const badge of BADGE_DEFINITIONS) {
        if (totalPoints >= badge.threshold) {
            earnedBadges.push(badge);
        }
    }
    
    return earnedBadges;
}

/**
 * Check unlocked achievements
 */
function checkAchievements(stats) {
    const unlocked = [];
    
    if (!ACHIEVEMENTS) return unlocked;
    
    const savedAchievements = loadFromStorage(CONFIG.STORAGE_KEYS.ACHIEVEMENTS, []);
    
    for (const achievement of ACHIEVEMENTS) {
        if (!savedAchievements.includes(achievement.id) && achievement.check(stats)) {
            unlocked.push(achievement);
        }
    }
    
    return unlocked;
}

/**
 * Save achievement
 */
function saveAchievement(achievementId) {
    const saved = loadFromStorage(CONFIG.STORAGE_KEYS.ACHIEVEMENTS, []);
    if (!saved.includes(achievementId)) {
        saved.push(achievementId);
        saveToStorage(CONFIG.STORAGE_KEYS.ACHIEVEMENTS, saved);
    }
}

/**
 * Get all saved achievements
 */
function getSavedAchievements() {
    return loadFromStorage(CONFIG.STORAGE_KEYS.ACHIEVEMENTS, []);
}

/**
 * Calculate base points for difficulty
 */
function getBasePoints(difficulty) {
    const settings = CONFIG.DIFFICULTY[difficulty] || CONFIG.DIFFICULTY.medium;
    return settings.basePoints;
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.calculateLevel = calculateLevel;
    window.getLevelName = getLevelName;
    window.calculateStars = calculateStars;
    window.calculateBadges = calculateBadges;
    window.getNextLevelThreshold = getNextLevelThreshold;
    window.getCurrentLevelThreshold = getCurrentLevelThreshold;
    window.calculateLevelProgress = calculateLevelProgress;
    window.checkEarnedBadges = checkEarnedBadges;
    window.checkAchievements = checkAchievements;
    window.saveAchievement = saveAchievement;
    window.getSavedAchievements = getSavedAchievements;
    window.getBasePoints = getBasePoints;
}
