// Main Application - التطبيق الرئيسي
const APP = {
    // Initialize application
    init() {
        console.log('🌙 منصة نور العلم - Islamic LMS');

        // Hide loading screen after delay
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('fade-out');

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.getElementById('app').classList.remove('hidden');

                // Initialize auth
                AUTH.init();
            }, 500);
        }, 1500);

        // Setup global event listeners
        this.setupGlobalListeners();
    },

    // Setup global event listeners
    setupGlobalListeners() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
};

// Toast notification system
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');

    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Scoring calculation utility
function calculateStudentScore(student) {
    if (!student) return 0;
    const quranScore = Object.values(student.quranProgress || {}).filter(s => s.status === 'memorized').length * 10;
    const hadithScore = (student.hadithProgress || []).length * 5;
    const lessonsScore = (student.lessonsWatched || []).length * 2;
    const reportsScore = (student.reports || []).length * 3;
    const activityCount = (student.activities || []).length;
    return quranScore + hadithScore + lessonsScore + reportsScore + activityCount + (student.points || 0);
}

// Check for top student (Incentive System)
function checkTopStudent() {
    const users = AUTH.getUsers();
    const students = users.filter(u => u.accountType === 'student');

    if (students.length === 0) return null;

    // Calculate scores for all students
    const scores = students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        totalScore: calculateStudentScore(student)
    })).sort((a, b) => b.totalScore - a.totalScore);

    return scores[0] || null;
}

// Display incentive info
function displayIncentiveInfo() {
    const topStudent = checkTopStudent();
    const currentUser = AUTH.getCurrentUser();

    if (!currentUser) return;

    // Update leaderboard in rewards section
    if (typeof STUDENT !== 'undefined' && currentUser.accountType === 'student') {
        STUDENT.loadLeaderboard();
    }
}

// Global error handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Global Error:', msg, 'at', url, 'line', lineNo);
    return false;
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
}

function generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP, AUTH, STUDENT, TEACHER, QURAN, HADITH, LESSONS, REPORTS, CHARTS };
}
