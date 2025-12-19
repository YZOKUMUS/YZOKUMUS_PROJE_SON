/**
 * Hasene Arapça Dersi - Config
 * Genel yapılandırma ayarları
 */

const CONFIG = {
    // Debug Mode
    DEBUG: false,

    // Game Settings
    QUESTIONS_PER_GAME: 10,
    COMBO_BONUS_PER_CORRECT: 2,
    PERFECT_BONUS: 50,
    DAILY_GOAL_BONUS: 100,

    // Points per star
    POINTS_PER_STAR: 250,

    // Difficulty Settings
    DIFFICULTY: {
        easy: { min: 1, max: 7, basePoints: 5 },
        medium: { min: 5, max: 12, basePoints: 10 },
        hard: { min: 10, max: 20, basePoints: 15 }
    },

    // Daily Goals
    DAILY_GOALS: {
        easy: 1300,
        normal: 2700,
        hard: 5400,
        extreme: 6000
    },

    // LocalStorage Keys
    STORAGE_KEYS: {
        TOTAL_POINTS: 'hasene_totalPoints',
        STREAK_DATA: 'hasene_streakData',
        DAILY_TASKS: 'hasene_dailyTasks',
        WORD_STATS: 'hasene_wordStats',
        GAME_STATS: 'hasene_gameStats',
        DAILY_GOAL: 'hasene_dailyGoal',
        DAILY_PROGRESS: 'hasene_dailyProgress',
        ACHIEVEMENTS: 'hasene_achievements'
    },

    // Audio Settings
    AUDIO: {
        enabled: true,
        volume: 0.8
    }
};

// Make it globally available
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
