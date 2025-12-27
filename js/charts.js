// Charts Module - الرسوم البيانية
const CHARTS = {
    currentUser: null,
    charts: {},

    // Initialize charts module
    init(user) {
        this.currentUser = user;

        if (user.accountType === 'student') {
            this.initStudentCharts();
        } else {
            this.initTeacherCharts();
        }
    },

    // Initialize student charts
    initStudentCharts() {
        this.createWeeklyProgressChart();
    },

    // Initialize teacher charts
    initTeacherCharts() {
        this.createStudentsProgressChart();
        this.createWeeklyActivityChart();
    },

    // Create weekly progress chart for students
    createWeeklyProgressChart() {
        const canvas = document.getElementById('weekly-progress-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Generate sample data based on user activity
        const labels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const activities = this.currentUser.activities || [];

        // Count activities per day for the last 7 days
        const today = new Date();
        const activityData = labels.map((_, i) => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - (6 - i));

            return activities.filter(a => {
                const actDate = new Date(a.timestamp);
                return actDate.toDateString() === targetDate.toDateString();
            }).length;
        });

        if (this.charts.weeklyProgress) {
            this.charts.weeklyProgress.destroy();
        }

        this.charts.weeklyProgress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'النشاط اليومي',
                    data: activityData,
                    borderColor: '#1a7a5c',
                    backgroundColor: 'rgba(26, 122, 92, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1a7a5c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { family: 'Tajawal' }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Tajawal' }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Create students progress chart for teachers
    createStudentsProgressChart() {
        const canvas = document.getElementById('students-progress-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const students = this.getConnectedStudents();

        // Calculate progress distribution
        let excellent = 0, good = 0, average = 0, beginner = 0;

        students.forEach(student => {
            const quranProgress = Object.values(student.quranProgress || {}).filter(s => s.status === 'memorized').length;
            const percentage = (quranProgress / 114) * 100;

            if (percentage >= 50) excellent++;
            else if (percentage >= 25) good++;
            else if (percentage >= 10) average++;
            else beginner++;
        });

        if (this.charts.studentsProgress) {
            this.charts.studentsProgress.destroy();
        }

        this.charts.studentsProgress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['متميز', 'جيد', 'متوسط', 'مبتدئ'],
                datasets: [{
                    data: [excellent, good, average, beginner],
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#6c757d'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: { family: 'Tajawal' },
                            padding: 15
                        }
                    }
                }
            }
        });
    },

    // Create weekly activity chart for teachers
    createWeeklyActivityChart() {
        const canvas = document.getElementById('weekly-activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const students = this.getConnectedStudents();

        const labels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const today = new Date();

        // Aggregate activity data
        const activityData = labels.map((_, i) => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - (6 - i));

            let count = 0;
            students.forEach(student => {
                const activities = student.activities || [];
                count += activities.filter(a => {
                    const actDate = new Date(a.timestamp);
                    return actDate.toDateString() === targetDate.toDateString();
                }).length;
            });

            return count;
        });

        if (this.charts.weeklyActivity) {
            this.charts.weeklyActivity.destroy();
        }

        this.charts.weeklyActivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'نشاط الطلاب',
                    data: activityData,
                    backgroundColor: 'rgba(201, 162, 39, 0.8)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { family: 'Tajawal' }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Tajawal' }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Get connected students (for teacher)
    getConnectedStudents() {
        const users = AUTH.getUsers();
        return users.filter(u => u.accountType === 'student' && u.connectedTeacher === this.currentUser.id);
    },

    // Load teacher statistics page
    loadTeacherStats() {
        this.createStudentsActivityChart();
        this.createQuranStatsChart();
        this.createHadithStatsChart();
        this.loadTopStudents();
    },

    // Students activity chart
    createStudentsActivityChart() {
        const canvas = document.getElementById('students-activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const students = this.getConnectedStudents();

        // Get labels and data for each student
        const labels = students.map(s => s.name);
        const quranData = students.map(s => Object.values(s.quranProgress || {}).filter(p => p.status === 'memorized').length);
        const hadithData = students.map(s => (s.hadithProgress || []).length);

        if (this.charts.studentsActivity) {
            this.charts.studentsActivity.destroy();
        }

        this.charts.studentsActivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'سور محفوظة',
                        data: quranData,
                        backgroundColor: 'rgba(26, 122, 92, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'أحاديث محفوظة',
                        data: hadithData,
                        backgroundColor: 'rgba(201, 162, 39, 0.8)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: { family: 'Tajawal' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: 'Tajawal' }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Tajawal' }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Quran stats chart
    createQuranStatsChart() {
        const canvas = document.getElementById('quran-stats-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const students = this.getConnectedStudents();

        // Calculate total memorization distribution
        let juz30 = 0, juz29 = 0, juz28 = 0, other = 0;

        students.forEach(student => {
            const progress = student.quranProgress || {};
            Object.keys(progress).forEach(surahId => {
                if (progress[surahId].status === 'memorized') {
                    const surah = QURAN_DATA.getSurah(parseInt(surahId));
                    if (surah) {
                        if (surah.juz === 30) juz30++;
                        else if (surah.juz === 29) juz29++;
                        else if (surah.juz === 28) juz28++;
                        else other++;
                    }
                }
            });
        });

        if (this.charts.quranStats) {
            this.charts.quranStats.destroy();
        }

        this.charts.quranStats = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['جزء 30', 'جزء 29', 'جزء 28', 'أجزاء أخرى'],
                datasets: [{
                    data: [juz30, juz29, juz28, other],
                    backgroundColor: [
                        'rgba(26, 122, 92, 0.8)',
                        'rgba(42, 157, 124, 0.8)',
                        'rgba(74, 189, 156, 0.8)',
                        'rgba(106, 221, 188, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: { family: 'Tajawal' }
                        }
                    }
                }
            }
        });
    },

    // Hadith stats chart
    createHadithStatsChart() {
        const canvas = document.getElementById('hadith-stats-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const students = this.getConnectedStudents();

        // Calculate total hadith memorization
        let ranges = [0, 0, 0, 0]; // 0-10, 11-20, 21-30, 31-40

        students.forEach(student => {
            const count = (student.hadithProgress || []).length;
            if (count <= 10) ranges[0]++;
            else if (count <= 20) ranges[1]++;
            else if (count <= 30) ranges[2]++;
            else ranges[3]++;
        });

        if (this.charts.hadithStats) {
            this.charts.hadithStats.destroy();
        }

        this.charts.hadithStats = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['1-10 أحاديث', '11-20 حديث', '21-30 حديث', '31-40 حديث'],
                datasets: [{
                    data: ranges,
                    backgroundColor: [
                        'rgba(201, 162, 39, 0.6)',
                        'rgba(201, 162, 39, 0.7)',
                        'rgba(201, 162, 39, 0.85)',
                        'rgba(201, 162, 39, 1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: { family: 'Tajawal' }
                        }
                    }
                }
            }
        });
    },

    // Load top students
    loadTopStudents() {
        const container = document.getElementById('top-students-list');
        if (!container) return;

        const students = this.getConnectedStudents();

        // Calculate scores
        const scored = students.map(student => {
            const quranScore = Object.values(student.quranProgress || {}).filter(s => s.status === 'memorized').length * 10;
            const hadithScore = (student.hadithProgress || []).length * 5;
            const reportsScore = (student.reports || []).length * 3;

            return {
                name: student.name,
                score: quranScore + hadithScore + reportsScore + (student.points || 0)
            };
        }).sort((a, b) => b.score - a.score);

        if (scored.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد بيانات</p></div>';
            return;
        }

        container.innerHTML = scored.slice(0, 5).map((student, i) => `
            <div class="top-student-item">
                <div class="rank">${i + 1}</div>
                <div class="name">${student.name}</div>
                <div class="score">${student.score} نقطة</div>
            </div>
        `).join('');
    }
};

// Filter stats by time period
function filterStats(period) {
    document.querySelectorAll('#statistics-section .time-filter .tab').forEach((tab, i) => {
        tab.classList.toggle('active',
            (period === 'week' && i === 0) ||
            (period === 'month' && i === 1) ||
            (period === 'quarter' && i === 2)
        );
    });

    // Reload charts with filtered data
    CHARTS.loadTeacherStats();
}
