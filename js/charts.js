/**
 * Hasene Arapça Dersi - Charts System
 * Grafik gösterimi için Chart.js kullanımı
 */

// Chart instances storage
let chartInstances = {};

/**
 * Get daily stats data for charts
 * @returns {Array} Array of daily stats
 */
function getDailyStatsForCharts() {
    const dailyStats = [];
    const today = new Date();
    
    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const key = `hasene_daily_${dateStr}`;
        
        try {
            const dayData = localStorage.getItem(key);
            if (dayData) {
                const parsed = JSON.parse(dayData);
                dailyStats.push({
                    date: dateStr,
                    points: parsed.points || 0,
                    correct: parsed.correct || 0,
                    wrong: parsed.wrong || 0,
                    combo: parsed.combo || 0,
                    gamesPlayed: parsed.gamesPlayed || 0
                });
            } else {
                // No data for this day
                dailyStats.push({
                    date: dateStr,
                    points: 0,
                    correct: 0,
                    wrong: 0,
                    combo: 0,
                    gamesPlayed: 0
                });
            }
        } catch (e) {
            // Invalid data, use zeros
            dailyStats.push({
                date: dateStr,
                points: 0,
                correct: 0,
                wrong: 0,
                combo: 0,
                gamesPlayed: 0
            });
        }
    }
    
    return dailyStats;
}

/**
 * Get weekly stats data
 * @returns {Array} Array of weekly stats (last 8 weeks)
 */
function getWeeklyStatsForCharts() {
    const weeklyStats = [];
    const today = new Date();
    
    // Get last 8 weeks
    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        
        // Find Monday of the week
        const dayOfWeek = weekStart.getDay();
        const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        let weekPoints = 0;
        let weekCorrect = 0;
        let weekWrong = 0;
        let weekGames = 0;
        
        // Aggregate daily stats for the week
        for (let d = 0; d < 7; d++) {
            const checkDate = new Date(weekStart);
            checkDate.setDate(checkDate.getDate() + d);
            const dateStr = checkDate.toISOString().split('T')[0];
            const key = `hasene_daily_${dateStr}`;
            
            try {
                const dayData = localStorage.getItem(key);
                if (dayData) {
                    const parsed = JSON.parse(dayData);
                    weekPoints += parsed.points || 0;
                    weekCorrect += parsed.correct || 0;
                    weekWrong += parsed.wrong || 0;
                    weekGames += parsed.gamesPlayed || 0;
                }
            } catch (e) {
                // Ignore
            }
        }
        
        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
        weeklyStats.push({
            label: weekLabel,
            points: weekPoints,
            correct: weekCorrect,
            wrong: weekWrong,
            games: weekGames,
            successRate: weekCorrect + weekWrong > 0 
                ? Math.round((weekCorrect / (weekCorrect + weekWrong)) * 100) 
                : 0
        });
    }
    
    return weeklyStats;
}

/**
 * Get monthly stats data
 * @returns {Array} Array of monthly stats (last 6 months)
 */
function getMonthlyStatsForCharts() {
    const monthlyStats = [];
    const today = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        
        let monthPoints = 0;
        let monthCorrect = 0;
        let monthWrong = 0;
        let monthGames = 0;
        
        // Aggregate daily stats for the month
        for (let d = 1; d <= monthEnd.getDate(); d++) {
            const checkDate = new Date(month.getFullYear(), month.getMonth(), d);
            const dateStr = checkDate.toISOString().split('T')[0];
            const key = `hasene_daily_${dateStr}`;
            
            try {
                const dayData = localStorage.getItem(key);
                if (dayData) {
                    const parsed = JSON.parse(dayData);
                    monthPoints += parsed.points || 0;
                    monthCorrect += parsed.correct || 0;
                    monthWrong += parsed.wrong || 0;
                    monthGames += parsed.gamesPlayed || 0;
                }
            } catch (e) {
                // Ignore
            }
        }
        
        const monthLabel = month.toLocaleDateString('tr-TR', { month: 'short' });
        monthlyStats.push({
            label: monthLabel,
            points: monthPoints,
            correct: monthCorrect,
            wrong: monthWrong,
            games: monthGames,
            successRate: monthCorrect + monthWrong > 0 
                ? Math.round((monthCorrect / (monthCorrect + monthWrong)) * 100) 
                : 0
        });
    }
    
    return monthlyStats;
}

/**
 * Get success rate trend data
 * @returns {Array} Success rate over time
 */
function getSuccessRateTrend() {
    const dailyStats = getDailyStatsForCharts();
    return dailyStats.map(day => ({
        date: day.date.split('-')[2], // Day of month
        rate: day.correct + day.wrong > 0 
            ? Math.round((day.correct / (day.correct + day.wrong)) * 100) 
            : 0
    }));
}

/**
 * Destroy all chart instances
 */
function destroyAllCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances = {};
}

/**
 * Create daily activity chart
 * @param {string} canvasId - Canvas element ID
 */
function createDailyActivityChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Destroy existing chart
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const dailyStats = getDailyStatsForCharts();
    const labels = dailyStats.map(d => d.date.split('-')[2]); // Day of month
    
    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Doğru',
                    data: dailyStats.map(d => d.correct),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Yanlış',
                    data: dailyStats.map(d => d.wrong),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Günlük Aktivite (Son 30 Gün)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Create weekly progress chart
 * @param {string} canvasId - Canvas element ID
 */
function createWeeklyProgressChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const weeklyStats = getWeeklyStatsForCharts();
    const labels = weeklyStats.map(w => w.label);
    
    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hasene Puanları',
                data: weeklyStats.map(w => w.points),
                backgroundColor: 'rgba(157, 138, 255, 0.8)',
                borderColor: '#9d8aff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Haftalık İlerleme (Son 8 Hafta)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Create monthly success chart
 * @param {string} canvasId - Canvas element ID
 */
function createMonthlySuccessChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const monthlyStats = getMonthlyStatsForCharts();
    const labels = monthlyStats.map(m => m.label);
    
    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Doğru Cevap',
                    data: monthlyStats.map(m => m.correct),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 2
                },
                {
                    label: 'Yanlış Cevap',
                    data: monthlyStats.map(m => m.wrong),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: '#ef4444',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Aylık Başarı (Son 6 Ay)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false
                }
            }
        }
    });
}

/**
 * Create success rate trend chart
 * @param {string} canvasId - Canvas element ID
 */
function createSuccessRateTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const trendData = getSuccessRateTrend();
    const labels = trendData.map(t => t.date);
    
    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Başarı Oranı (%)',
                data: trendData.map(t => t.rate),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Başarı Oranı Eğilimi (Son 30 Gün)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Show charts modal
 */
function showChartsModal() {
    // Destroy existing charts first
    destroyAllCharts();
    
    // Create charts after a small delay to ensure canvas elements are rendered
    setTimeout(() => {
        createDailyActivityChart('daily-activity-chart');
        createWeeklyProgressChart('weekly-progress-chart');
        createMonthlySuccessChart('monthly-success-chart');
        createSuccessRateTrendChart('success-rate-trend-chart');
    }, 100);
    
    if (typeof openModal === 'function') {
        openModal('charts-modal');
    }
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.showChartsModal = showChartsModal;
    window.destroyAllCharts = destroyAllCharts;
    window.getDailyStatsForCharts = getDailyStatsForCharts;
    window.getWeeklyStatsForCharts = getWeeklyStatsForCharts;
    window.getMonthlyStatsForCharts = getMonthlyStatsForCharts;
}

