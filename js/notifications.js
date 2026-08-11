/**
 * Hasene Arapça Dersi - Notifications System
 * Push Notifications ve bildirim yönetimi
 */

// Notification settings
let notificationSettings = {
    enabled: false,
    dailyReminder: false,
    reminderTime: '09:00', // Default 09:00
    streakWarning: true,
    taskReminder: true,
    weeklySummary: false
};

// Load notification settings from storage
function loadNotificationSettings() {
    try {
        const saved = localStorage.getItem('hasene_notification_settings');
        if (saved) {
            notificationSettings = { ...notificationSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('⚠️ Notification settings yüklenemedi:', e);
    }
}

// Save notification settings
function saveNotificationSettings() {
    try {
        localStorage.setItem('hasene_notification_settings', JSON.stringify(notificationSettings));
    } catch (e) {
        console.warn('⚠️ Notification settings kaydedilemedi:', e);
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('⚠️ Bu tarayıcı bildirimleri desteklemiyor');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

// Check if notifications are enabled and permission is granted
function isNotificationAvailable() {
    return 'Notification' in window && Notification.permission === 'granted';
}

// Show a notification
function showNotification(title, options = {}) {
    if (!isNotificationAvailable()) {
        return null;
    }
    
    const defaultOptions = {
        icon: './ASSETS/badges/icon-512.png',
        badge: './ASSETS/badges/icon-512.png',
        tag: 'hasene-notification',
        requireInteraction: false,
        ...options
    };
    
    try {
        const notification = new Notification(title, defaultOptions);
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        return notification;
    } catch (e) {
        console.warn('⚠️ Bildirim gösterilemedi:', e);
        return null;
    }
}

// Daily reminder notification
function scheduleDailyReminder() {
    if (!notificationSettings.dailyReminder || !notificationSettings.enabled) {
        return;
    }
    
    // Cancel existing reminder if any
    if (window.dailyReminderTimeout) {
        clearTimeout(window.dailyReminderTimeout);
    }
    
    const [hours, minutes] = notificationSettings.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // If reminder time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const msUntilReminder = reminderTime.getTime() - now.getTime();
    
    window.dailyReminderTimeout = setTimeout(() => {
        if (notificationSettings.enabled && notificationSettings.dailyReminder) {
            showNotification('🕌 Hasene Hatırlatması', {
                body: 'Günlük hedefini tamamlamayı unutma! Bugün de öğrenmeye devam et. 💪',
                requireInteraction: true
            });
            
            // Schedule next day's reminder
            scheduleDailyReminder();
        }
    }, msUntilReminder);
    
    console.log(`✅ Günlük hatırlatma planlandı: ${reminderTime.toLocaleString('tr-TR')}`);
}

// Streak warning notification
function checkStreakWarning() {
    if (!notificationSettings.streakWarning || !notificationSettings.enabled) {
        return;
    }
    
    // Check if streak is in danger (check once per day, after 18:00)
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 18) {
        const today = typeof getLocalDateString === 'function'
            ? getLocalDateString()
            : new Date().toLocaleDateString('sv-SE');
        const streakKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS?.STREAK_DATA)
            ? CONFIG.STORAGE_KEYS.STREAK_DATA
            : 'hasene_streakData';
        const streakDataStr = localStorage.getItem(streakKey);

        if (streakDataStr) {
            try {
                const streakData = JSON.parse(streakDataStr);
                if (streakData.currentStreak > 0 && streakData.lastPlayDate !== today) {
                    showNotification('🔥 Serin Kırılmasın!', {
                        body: `${streakData.currentStreak} günlük serini korumak için bugün oyun oyna!`,
                        requireInteraction: true
                    });
                }
            } catch (e) {
                // Ignore
            }
        }
    }
}

// Task reminder notification (if tasks are incomplete)
function checkTaskReminder() {
    if (!notificationSettings.taskReminder || !notificationSettings.enabled) {
        return;
    }
    
    // Check daily tasks progress (check in the evening, after 19:00)
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 19) {
        try {
            const tasksStr = localStorage.getItem('hasene_dailyTasks');
            if (tasksStr) {
                const tasks = JSON.parse(tasksStr);
                const allTasks = [...(tasks.tasks || []), ...(tasks.bonusTasks || [])];
                const completedCount = allTasks.filter(t => (t.progress || 0) >= t.target).length;
                
                if (completedCount < allTasks.length && allTasks.length > 0) {
                    const remaining = allTasks.length - completedCount;
                    showNotification('📋 Günlük Görevler', {
                        body: `${remaining} görevin tamamlanması kaldı! Tüm görevleri tamamla ve ödülü kazan. 🎁`,
                        requireInteraction: false
                    });
                }
            }
        } catch (e) {
            // Ignore
        }
    }
}

// Weekly summary notification
function scheduleWeeklySummary() {
    if (!notificationSettings.weeklySummary || !notificationSettings.enabled) {
        return;
    }
    
    // Schedule for Sunday evening (end of week)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7; // Next Sunday
    
    const summaryTime = new Date();
    summaryTime.setDate(summaryTime.getDate() + daysUntilSunday);
    summaryTime.setHours(20, 0, 0, 0); // 20:00 on Sunday
    
    const msUntilSummary = summaryTime.getTime() - now.getTime();
    
    setTimeout(() => {
        if (notificationSettings.enabled && notificationSettings.weeklySummary) {
            // Calculate weekly stats
            const totalPoints = parseInt(localStorage.getItem('hasene_totalPoints') || '0');
            const gameStatsStr = localStorage.getItem('hasene_gameStats');
            let weeklyCorrect = 0;
            
            try {
                if (gameStatsStr) {
                    const gameStats = JSON.parse(gameStatsStr);
                    weeklyCorrect = gameStats.totalCorrect || 0;
                }
            } catch (e) {
                // Ignore
            }
            
            showNotification('📊 Haftalık Özet', {
                body: `Bu hafta ${weeklyCorrect} doğru cevap verdin ve ${totalPoints} Hasene kazandın! 🎉`,
                requireInteraction: false
            });
            
            // Schedule next week's summary
            scheduleWeeklySummary();
        }
    }, msUntilSummary);
}

// Initialize notifications
async function initNotifications() {
    loadNotificationSettings();
    
    // Request permission if not already granted
    if (!isNotificationAvailable() && notificationSettings.enabled) {
        await requestNotificationPermission();
    }
    
    // Schedule reminders if enabled
    if (notificationSettings.enabled && isNotificationAvailable()) {
        if (notificationSettings.dailyReminder) {
            scheduleDailyReminder();
        }
        
        if (notificationSettings.streakWarning) {
            // Check streak warning once per day
            setInterval(checkStreakWarning, 60 * 60 * 1000); // Check every hour
        }
        
        if (notificationSettings.taskReminder) {
            // Check task reminder once per day
            setInterval(checkTaskReminder, 60 * 60 * 1000); // Check every hour
        }
        
        if (notificationSettings.weeklySummary) {
            scheduleWeeklySummary();
        }
    }
    
    console.log('✅ Bildirim sistemi başlatıldı');
}

// Enable notifications
async function enableNotifications() {
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
        notificationSettings.enabled = true;
        saveNotificationSettings();
        initNotifications();
        return true;
    } else {
        return false;
    }
}

// Disable notifications
function disableNotifications() {
    notificationSettings.enabled = false;
    saveNotificationSettings();
    
    // Clear scheduled reminders
    if (window.dailyReminderTimeout) {
        clearTimeout(window.dailyReminderTimeout);
    }
}

// Toggle notification enabled
async function toggleNotificationEnabled() {
    const checkbox = document.getElementById('notification-enabled-checkbox');
    if (!checkbox) return;
    
    if (checkbox.checked) {
        const hasPermission = await enableNotifications();
        if (!hasPermission) {
            checkbox.checked = false;
            if (typeof showToast === 'function') {
                showToast('❌ Bildirim izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.', 'error');
            }
        }
    } else {
        disableNotifications();
    }
}

// Show notification settings modal (helper function)
function showNotificationSettings() {
    // This will be called from game-core.js
    const modal = document.getElementById('notification-settings-modal');
    if (modal) {
        // Populate settings
        document.getElementById('notification-enabled-checkbox').checked = notificationSettings.enabled;
        document.getElementById('daily-reminder-checkbox').checked = notificationSettings.dailyReminder;
        document.getElementById('reminder-time-input').value = notificationSettings.reminderTime;
        document.getElementById('streak-warning-checkbox').checked = notificationSettings.streakWarning;
        document.getElementById('task-reminder-checkbox').checked = notificationSettings.taskReminder;
        document.getElementById('weekly-summary-checkbox').checked = notificationSettings.weeklySummary;
        
        // Show modal (will be implemented in game-core.js)
        if (typeof openModal === 'function') {
            openModal('notification-settings-modal');
        }
    }
}

// Save notification settings from UI
function saveNotificationSettingsFromUI() {
    notificationSettings.enabled = document.getElementById('notification-enabled-checkbox').checked;
    notificationSettings.dailyReminder = document.getElementById('daily-reminder-checkbox').checked;
    notificationSettings.reminderTime = document.getElementById('reminder-time-input').value;
    notificationSettings.streakWarning = document.getElementById('streak-warning-checkbox').checked;
    notificationSettings.taskReminder = document.getElementById('task-reminder-checkbox').checked;
    notificationSettings.weeklySummary = document.getElementById('weekly-summary-checkbox').checked;
    
    saveNotificationSettings();
    
    // Reinitialize notifications with new settings
    initNotifications();
    
    if (typeof showToast === 'function') {
        showToast('✅ Bildirim ayarları kaydedildi', 'success');
    }
    
    if (typeof closeModal === 'function') {
        closeModal('notification-settings-modal');
    }
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.initNotifications = initNotifications;
    window.enableNotifications = enableNotifications;
    window.disableNotifications = disableNotifications;
    window.showNotification = showNotification;
    window.showNotificationSettings = showNotificationSettings;
    window.saveNotificationSettingsFromUI = saveNotificationSettingsFromUI;
    window.isNotificationAvailable = isNotificationAvailable;
    window.toggleNotificationEnabled = toggleNotificationEnabled;
}

