// Reports Module - قسم التقارير
const REPORTS = {
    currentUser: null,

    // Initialize reports module
    init(user) {
        this.currentUser = user;
        this.loadStudentReports();
        this.loadFeedback();
    },

    // Load student's own reports
    loadStudentReports() {
        const container = document.getElementById('student-reports-list');
        if (!container) return;

        const reports = (this.currentUser.reports || []).sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        if (reports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>لم ترسل أي تقارير بعد</p>
                    <button class="btn btn-primary" onclick="showNewReportForm()">
                        <i class="fas fa-plus"></i> إنشاء تقرير
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="report-item ${report.reviewed ? 'reviewed' : 'pending'}">
                <div class="report-header">
                    <span class="report-date">${new Date(report.timestamp).toLocaleDateString('ar-SA')}</span>
                    <span class="report-status ${report.reviewed ? 'reviewed' : 'pending'}">
                        ${report.reviewed ? 'تمت المراجعة' : 'بانتظار المراجعة'}
                    </span>
                </div>
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="value">${AUTH.sanitize(report.surah) || '-'}</span>
                        <span class="label">القرآن</span>
                    </div>
                    <div class="summary-item">
                        <span class="value">${report.hadithCount || 0}</span>
                        <span class="label">أحاديث</span>
                    </div>
                    <div class="summary-item">
                        <span class="value">${report.lessonsCount || 0}</span>
                        <span class="label">دروس</span>
                    </div>
                </div>
                ${report.notes ? `
                    <div class="report-notes">
                        <small>ملاحظاتك: ${AUTH.sanitize(report.notes.substring(0, 100))}${report.notes.length > 100 ? '...' : ''}</small>
                    </div>
                ` : ''}
                ${report.reviewed ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                        <div class="feedback-rating">
                            ${this.renderStars(report.rating)}
                        </div>
                        ${report.teacherNotes ? `
                            <div class="feedback-text" style="margin-top: 0.5rem;">
                                <small>ملاحظات الأستاذ: ${AUTH.sanitize(report.teacherNotes)}</small>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    // Render stars
    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star ${i <= rating ? '' : 'empty'}" style="color: ${i <= rating ? 'var(--secondary)' : '#ddd'}"></i>`;
        }
        return stars;
    },

    // Load feedback from teacher
    loadFeedback() {
        const container = document.getElementById('feedback-list');
        if (!container) return;

        const reports = (this.currentUser.reports || [])
            .filter(r => r.reviewed)
            .sort((a, b) => new Date(b.reviewedAt || b.timestamp) - new Date(a.reviewedAt || a.timestamp));

        if (reports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>لا توجد تقييمات بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="feedback-item">
                <div class="feedback-rating">
                    ${this.renderStars(report.rating)}
                </div>
                ${report.teacherNotes ? `
                    <div class="feedback-text">${AUTH.sanitize(report.teacherNotes)}</div>
                ` : '<div class="feedback-text">لا توجد ملاحظات</div>'}
                <div class="feedback-from">
                    <i class="fas fa-calendar"></i>
                    ${new Date(report.reviewedAt || report.timestamp).toLocaleDateString('ar-SA')}
                </div>
            </div>
        `).join('');
    },

    // Show new report form
    showForm() {
        document.getElementById('new-report-modal').classList.remove('hidden');
    },

    // Close report form
    closeForm() {
        document.getElementById('new-report-modal').classList.add('hidden');
        document.getElementById('report-form').reset();
    },

    // Submit report
    submit(event) {
        event.preventDefault();

        const surah = document.getElementById('report-surah').value;
        const ayahFrom = document.getElementById('report-ayah-from').value;
        const ayahTo = document.getElementById('report-ayah-to').value;
        const hadithCount = document.getElementById('report-hadith-count').value;
        const lessonsCount = document.getElementById('report-lessons-count').value;
        const notes = document.getElementById('report-notes').value;

        // Create report object
        const report = {
            id: 'report_' + Date.now(),
            surah: surah || null,
            ayahFrom: ayahFrom || null,
            ayahTo: ayahTo || null,
            hadithCount: parseInt(hadithCount) || 0,
            lessonsCount: parseInt(lessonsCount) || 0,
            notes: notes,
            timestamp: new Date().toISOString(),
            reviewed: false
        };

        // Save report
        const reports = this.currentUser.reports || [];
        reports.push(report);
        AUTH.updateUser(this.currentUser.id, { reports });

        // Add activity
        AUTH.addActivity(this.currentUser.id, {
            type: 'report',
            text: 'أرسلت تقرير جديد'
        });

        // Add points
        if (typeof STUDENT !== 'undefined') {
            STUDENT.addPoints(3, 'إرسال تقرير');
        }

        showToast('تم إرسال التقرير بنجاح!', 'success');

        this.closeForm();
        this.loadStudentReports();

        // Update student stats
        if (typeof STUDENT !== 'undefined') {
            STUDENT.updateStats();
        }
    }
};

// Global functions
function showNewReportForm() { REPORTS.showForm(); }
function closeReportModal() { REPORTS.closeForm(); }
function submitReport(event) { REPORTS.submit(event); }
function showReportsTab(tabId) {
    // Update tabs
    document.querySelectorAll('#reports-section .tabs-container .tab').forEach((tab, i) => {
        tab.classList.toggle('active',
            (tabId === 'my-reports' && i === 0) || (tabId === 'feedback' && i === 1)
        );
    });

    // Show tab content
    document.querySelectorAll('#reports-section .tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    // Load data
    if (tabId === 'feedback') {
        REPORTS.loadFeedback();
    }
}
