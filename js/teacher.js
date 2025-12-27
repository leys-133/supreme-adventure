// Teacher Module - نظام الأستاذ
const TEACHER = {
    currentUser: null,

    // Initialize teacher module
    init(user) {
        this.currentUser = user;
        this.setupNavigation();
        this.loadDashboard();
    },

    // Setup sidebar navigation
    setupNavigation() {
        const navItems = document.querySelectorAll('#teacher-dashboard .nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;

                // Update active nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Show section
                this.showSection(sectionId);

                // Update page title
                const title = item.querySelector('span').textContent;
                document.getElementById('teacher-page-title').textContent = title;

                // Close mobile sidebar
                document.querySelector('.sidebar').classList.remove('open');
                document.querySelector('.sidebar-overlay')?.classList.remove('active');
            });
        });
    },

    // Show specific section
    showSection(sectionId) {
        // Refresh state
        this.currentUser = AUTH.getCurrentUser();

        const sections = document.querySelectorAll('#teacher-dashboard .content-section');
        sections.forEach(section => section.classList.remove('active'));

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');

            // Load section-specific data
            if (sectionId === 'students-section') this.loadStudents();
            if (sectionId === 'teacher-reports-section') this.loadReports();
            if (sectionId === 'add-lessons-section') this.loadLessons();
            if (sectionId === 'teacher-messages-section') this.loadMessageForm();
            if (sectionId === 'statistics-section') this.loadStatistics();
        }
    },

    // Load dashboard data
    loadDashboard() {
        this.updateStats();
        this.loadRecentReports();
    },

    // Get connected students
    getConnectedStudents() {
        const users = AUTH.getUsers();
        return users.filter(u => u.accountType === 'student' && u.connectedTeacher === this.currentUser.id);
    },

    // Update stats
    updateStats() {
        const students = this.getConnectedStudents();

        // Total students
        document.getElementById('total-students').textContent = students.length;

        // Pending reports
        const allReports = students.flatMap(s => (s.reports || []).filter(r => !r.reviewed));
        document.getElementById('pending-reports').textContent = allReports.length;

        // Update badge
        const badge = document.getElementById('teacher-reports-badge');
        if (allReports.length > 0) {
            badge.textContent = allReports.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        // Total lessons
        const lessons = this.getLessons();
        document.getElementById('total-lessons').textContent = lessons.length;

        // Active students (students who have activity in the last week)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const activeStudents = students.filter(s => {
            const lastActivity = (s.activities || [])[0];
            return lastActivity && new Date(lastActivity.timestamp) > weekAgo;
        });
        document.getElementById('active-students').textContent = activeStudents.length;
    },

    // Get lessons
    getLessons() {
        const lessonsData = localStorage.getItem(`lessons_${this.currentUser.id}`);
        return lessonsData ? JSON.parse(lessonsData) : [];
    },

    // Save lessons
    saveLessons(lessons) {
        localStorage.setItem(`lessons_${this.currentUser.id}`, JSON.stringify(lessons));
    },

    // Load students section
    loadStudents() {
        const students = this.getConnectedStudents();
        const container = document.getElementById('students-grid');

        if (students.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-users"></i>
                    <p>لا يوجد طلاب مسجلين بعد</p>
                    <small>شارك رمز الحلقة مع طلابك للانضمام</small>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => {
            const quranProgress = Object.values(student.quranProgress || {}).filter(s => s.status === 'memorized').length;
            const hadithProgress = (student.hadithProgress || []).length;
            const reportsCount = (student.reports || []).length;

            return `
                <div class="student-card" onclick="TEACHER.showStudentDetail('${student.id}')">
                    <div class="student-avatar">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="student-name">${AUTH.sanitize(student.name)}</div>
                    <div class="student-email">${AUTH.sanitize(student.email)}</div>
                    <div class="student-progress">
                        <div class="progress-item">
                            <span class="value">${quranProgress}</span>
                            <span class="label">سور</span>
                        </div>
                        <div class="progress-item">
                            <span class="value">${hadithProgress}</span>
                            <span class="label">أحاديث</span>
                        </div>
                        <div class="progress-item">
                            <span class="value">${reportsCount}</span>
                            <span class="label">تقارير</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Show student detail
    showStudentDetail(studentId) {
        const student = AUTH.getUserById(studentId);
        if (!student) return;

        const modal = document.getElementById('student-detail-modal');
        const content = document.getElementById('student-detail-content');

        document.getElementById('student-detail-name').textContent = AUTH.sanitize(student.name);

        // Calculate stats
        const quranProgress = Object.values(student.quranProgress || {}).filter(s => s.status === 'memorized').length;
        const quranPercentage = Math.round((quranProgress / 114) * 100);
        const hadithProgress = (student.hadithProgress || []).length;
        const hadithPercentage = Math.round((hadithProgress / 40) * 100);
        const reportsCount = (student.reports || []).length;
        const lessonsWatched = (student.lessonsWatched || []).length;

        content.innerHTML = `
            <div class="student-detail-stats">
                <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <div class="stat-card quran-stat">
                        <div class="stat-icon"><i class="fas fa-quran"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${quranPercentage}%</span>
                            <span class="stat-label">حفظ القرآن</span>
                        </div>
                    </div>
                    <div class="stat-card hadith-stat">
                        <div class="stat-icon"><i class="fas fa-book-open"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${hadithProgress}/40</span>
                            <span class="stat-label">الأحاديث</span>
                        </div>
                    </div>
                    <div class="stat-card lessons-stat">
                        <div class="stat-icon"><i class="fas fa-video"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${lessonsWatched}</span>
                            <span class="stat-label">دروس مشاهدة</span>
                        </div>
                    </div>
                    <div class="stat-card reports-stat">
                        <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${reportsCount}</span>
                            <span class="stat-label">تقارير</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 1rem;">
                <div class="card-header">
                    <h4><i class="fas fa-history"></i> آخر النشاطات</h4>
                </div>
                <div class="activity-list">
                    ${this.renderActivities(student.activities || [])}
                </div>
            </div>
            
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="TEACHER.sendMessageToStudent('${studentId}')">
                    <i class="fas fa-paper-plane"></i> إرسال رسالة
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    },

    // Render activities
    renderActivities(activities) {
        if (!activities.length) {
            return '<div class="empty-state"><p>لا توجد نشاطات</p></div>';
        }

        return activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-star"></i></div>
                <div class="activity-info">
                    <div class="activity-text">${AUTH.sanitize(activity.text)}</div>
                    <div class="activity-time">${STUDENT.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    },

    // Close student detail
    closeStudentDetail() {
        document.getElementById('student-detail-modal').classList.add('hidden');
    },

    // Load reports section
    loadReports(filter = 'pending') {
        const students = this.getConnectedStudents();
        const container = document.getElementById('teacher-reports-list');

        let allReports = [];
        students.forEach(student => {
            (student.reports || []).forEach(report => {
                allReports.push({
                    ...report,
                    studentId: student.id,
                    studentName: student.name
                });
            });
        });

        // Filter reports
        if (filter === 'pending') {
            allReports = allReports.filter(r => !r.reviewed);
        } else if (filter === 'reviewed') {
            allReports = allReports.filter(r => r.reviewed);
        }

        // Sort by date (newest first)
        allReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (allReports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>لا توجد تقارير ${filter === 'pending' ? 'بانتظار المراجعة' : ''}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allReports.map(report => `
            <div class="report-item ${report.reviewed ? 'reviewed' : 'pending'}">
                <div class="report-header">
                    <div>
                        <strong>${AUTH.sanitize(report.studentName)}</strong>
                        <span class="report-date">${STUDENT.formatTime(report.timestamp)}</span>
                    </div>
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
                ${!report.reviewed ? `
                    <div class="report-actions">
                        <button class="btn btn-primary" onclick="TEACHER.reviewReport('${report.studentId}', '${report.id}')">
                            <i class="fas fa-eye"></i> مراجعة
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    // Load recent reports for dashboard
    loadRecentReports() {
        const students = this.getConnectedStudents();
        const container = document.getElementById('recent-reports-preview');

        let allReports = [];
        students.forEach(student => {
            (student.reports || []).forEach(report => {
                allReports.push({
                    ...report,
                    studentId: student.id,
                    studentName: student.name
                });
            });
        });

        allReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recent = allReports.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>لا توجد تقارير حديثة</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recent.map(report => `
            <div class="report-preview-item" onclick="TEACHER.reviewReport('${report.studentId}', '${report.id}')">
                <span class="student-name">${AUTH.sanitize(report.studentName)}</span>
                <span class="report-time">${STUDENT.formatTime(report.timestamp)}</span>
            </div>
        `).join('');
    },

    // Review report
    currentReviewReport: null,
    reviewReport(studentId, reportId) {
        const student = AUTH.getUserById(studentId);
        if (!student) return;

        const report = (student.reports || []).find(r => r.id === reportId);
        if (!report) return;

        this.currentReviewReport = { studentId, reportId, report };

        const modal = document.getElementById('report-review-modal');
        const content = document.getElementById('report-review-content');

        content.innerHTML = `
            <div class="report-detail">
                <div style="margin-bottom: 1rem;">
                    <strong>الطالب:</strong> ${AUTH.sanitize(student.name)}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>التاريخ:</strong> ${new Date(report.timestamp).toLocaleDateString('ar-SA')}
                </div>
                
                <div class="report-summary" style="margin-bottom: 1rem;">
                    <div class="summary-item">
                        <span class="value">${report.surah || '-'}</span>
                        <span class="label">السورة</span>
                    </div>
                    <div class="summary-item">
                        <span class="value">${report.ayahFrom || '-'} - ${report.ayahTo || '-'}</span>
                        <span class="label">الآيات</span>
                    </div>
                    <div class="summary-item">
                        <span class="value">${report.hadithCount || 0}</span>
                        <span class="label">الأحاديث</span>
                    </div>
                </div>
                
                ${report.notes ? `
                    <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                        <strong>ملاحظات الطالب:</strong>
                        <p style="margin-top: 0.5rem;">${AUTH.sanitize(report.notes)}</p>
                    </div>
                ` : ''}
            </div>
        `;

        // Reset rating
        document.querySelectorAll('#rating-input i').forEach(star => star.classList.remove('active'));
        document.getElementById('review-notes').value = '';

        // Setup rating clicks
        document.querySelectorAll('#rating-input i').forEach(star => {
            star.onclick = () => {
                const rating = parseInt(star.dataset.rating);
                document.querySelectorAll('#rating-input i').forEach((s, i) => {
                    s.classList.toggle('active', i < rating);
                });
            };
        });

        modal.classList.remove('hidden');
    },

    // Close report review
    closeReportReview() {
        document.getElementById('report-review-modal').classList.add('hidden');
        this.currentReviewReport = null;
    },

    // Submit review
    submitReview(event) {
        event.preventDefault();

        if (!this.currentReviewReport) return;

        const rating = document.querySelectorAll('#rating-input i.active').length;
        const notes = document.getElementById('review-notes').value;

        if (rating === 0) {
            showToast('يرجى اختيار التقييم', 'error');
            return;
        }

        const { studentId, reportId } = this.currentReviewReport;
        const student = AUTH.getUserById(studentId);

        if (student) {
            const reports = student.reports || [];
            const reportIndex = reports.findIndex(r => r.id === reportId);

            if (reportIndex !== -1) {
                reports[reportIndex].reviewed = true;
                reports[reportIndex].rating = rating;
                reports[reportIndex].teacherNotes = notes;
                reports[reportIndex].reviewedAt = new Date().toISOString();

                AUTH.updateUser(studentId, { reports });

                // Send feedback to student
                const messages = student.messages || [];
                messages.push({
                    id: 'msg_' + Date.now(),
                    from: this.currentUser.id,
                    title: 'تقييم تقريرك',
                    content: `تم تقييم تقريرك بـ ${rating} نجوم.\n${notes ? 'ملاحظات الأستاذ: ' + notes : ''}`,
                    timestamp: new Date().toISOString(),
                    read: false
                });
                AUTH.updateUser(studentId, { messages });

                showToast('تم إرسال التقييم بنجاح', 'success');
                this.closeReportReview();
                this.loadReports();
                this.updateStats();
            }
        }
    },

    // Load lessons management
    loadLessons() {
        const lessons = this.getLessons();
        const container = document.getElementById('lessons-manage-grid');

        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-video"></i>
                    <p>لم تضف أي دروس بعد</p>
                    <button class="btn btn-primary" onclick="showAddLessonModal()">
                        <i class="fas fa-plus"></i> إضافة درس
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = lessons.map(lesson => `
            <div class="lesson-card">
                <div class="lesson-thumbnail">
                    <img src="https://img.youtube.com/vi/${this.getYouTubeId(lesson.url)}/mqdefault.jpg" alt="${lesson.title}">
                    <div class="lesson-play"><i class="fas fa-play"></i></div>
                </div>
                <div class="lesson-content">
                    <div class="lesson-title">${AUTH.sanitize(lesson.title)}</div>
                    <div class="lesson-description">${AUTH.sanitize(lesson.description) || ''}</div>
                </div>
                <div class="lesson-actions">
                    <button class="btn btn-outline" onclick="TEACHER.deleteLesson('${lesson.id}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Get YouTube video ID
    getYouTubeId(url) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : '';
    },

    // Add lesson
    addLesson(event) {
        event.preventDefault();

        const title = document.getElementById('lesson-title').value;
        const url = document.getElementById('lesson-url').value;
        const description = document.getElementById('lesson-description').value;

        if (!title || !url) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        const videoId = this.getYouTubeId(url);
        if (!videoId) {
            showToast('رابط يوتيوب غير صالح', 'error');
            return;
        }

        const lessons = this.getLessons();
        lessons.push({
            id: 'lesson_' + Date.now(),
            title,
            url,
            description,
            videoId,
            createdAt: new Date().toISOString()
        });

        this.saveLessons(lessons);

        // Clear form
        document.getElementById('add-lesson-form').reset();
        closeAddLessonModal();

        showToast('تم إضافة الدرس بنجاح', 'success');
        this.loadLessons();
        this.updateStats();
    },

    // Delete lesson
    deleteLesson(lessonId) {
        if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

        let lessons = this.getLessons();
        lessons = lessons.filter(l => l.id !== lessonId);
        this.saveLessons(lessons);

        showToast('تم حذف الدرس', 'success');
        this.loadLessons();
        this.updateStats();
    },

    // Load message form
    loadMessageForm() {
        const students = this.getConnectedStudents();
        const select = document.getElementById('message-recipient');

        // Clear existing options except first two
        while (select.options.length > 2) {
            select.remove(2);
        }

        // Add students
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            select.appendChild(option);
        });

        // Load sent messages
        this.loadSentMessages();
    },

    // Load sent messages
    loadSentMessages() {
        const sentMessages = JSON.parse(localStorage.getItem(`sent_messages_${this.currentUser.id}`) || '[]');
        const container = document.getElementById('sent-messages-list');

        if (sentMessages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-paper-plane"></i>
                    <p>لم ترسل أي رسائل بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sentMessages.slice(0, 10).map(msg => `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-title">${AUTH.sanitize(msg.title)}</span>
                    <span class="message-date">${STUDENT.formatTime(msg.timestamp)}</span>
                </div>
                <div class="message-content">${AUTH.sanitize(msg.content.substring(0, 100))}${msg.content.length > 100 ? '...' : ''}</div>
                <div class="message-from">
                    <i class="fas fa-user"></i>
                    إلى: ${AUTH.sanitize(msg.recipientName)}
                </div>
            </div>
        `).join('');
    },

    // Send message
    sendMessage(event) {
        event.preventDefault();

        const recipient = document.getElementById('message-recipient').value;
        const title = document.getElementById('message-title').value;
        const content = document.getElementById('message-content').value;

        if (!recipient || !title || !content) {
            showToast('يرجى ملء جميع الحقول', 'error');
            return;
        }

        const students = recipient === 'all' ? this.getConnectedStudents() : [AUTH.getUserById(recipient)];

        students.forEach(student => {
            if (student) {
                const messages = student.messages || [];
                messages.unshift({
                    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    from: this.currentUser.id,
                    title,
                    content,
                    timestamp: new Date().toISOString(),
                    read: false
                });
                AUTH.updateUser(student.id, { messages });
            }
        });

        // Save to sent messages (Local Storage)
        const sentMessages = JSON.parse(localStorage.getItem(`sent_messages_${this.currentUser.id}`) || '[]');
        sentMessages.unshift({
            title,
            content,
            recipientName: recipient === 'all' ? 'جميع الطلاب' : students[0]?.name || '',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(`sent_messages_${this.currentUser.id}`, JSON.stringify(sentMessages));

        // Clear form
        document.getElementById('teacher-message-form').reset();

        showToast('تم إرسال الرسالة بنجاح', 'success');
        this.loadSentMessages();
    },

    // Send message to specific student
    sendMessageToStudent(studentId) {
        this.closeStudentDetail();
        this.showSection('teacher-messages-section');

        // Update nav
        document.querySelectorAll('#teacher-dashboard .nav-item').forEach(nav => {
            nav.classList.toggle('active', nav.dataset.section === 'teacher-messages-section');
        });
        document.getElementById('teacher-page-title').textContent = 'الرسائل';

        // Select the student
        setTimeout(() => {
            document.getElementById('message-recipient').value = studentId;
        }, 100);
    },

    // Load statistics
    loadStatistics() {
        // This will be handled by the charts module
        if (typeof CHARTS !== 'undefined') {
            CHARTS.loadTeacherStats();
        }
    }
};

// Global functions
function closeStudentDetail() { TEACHER.closeStudentDetail(); }
function filterTeacherReports(filter) {
    document.querySelectorAll('#teacher-reports-section .tabs-container .tab').forEach((tab, i) => {
        tab.classList.toggle('active',
            (filter === 'pending' && i === 0) ||
            (filter === 'reviewed' && i === 1) ||
            (filter === 'all' && i === 2)
        );
    });
    TEACHER.loadReports(filter);
}
function closeReportReview() { TEACHER.closeReportReview(); }
function submitReview(event) { TEACHER.submitReview(event); }
function showAddLessonModal() { document.getElementById('add-lesson-modal').classList.remove('hidden'); }
function closeAddLessonModal() { document.getElementById('add-lesson-modal').classList.add('hidden'); }
function addLesson(event) { TEACHER.addLesson(event); }
function sendTeacherMessage(event) { TEACHER.sendMessage(event); }
function copyRoomCode() {
    const code = document.getElementById('teacher-room-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('تم نسخ رمز الحلقة', 'success');
    });
}
function navigateToSection(sectionId) {
    TEACHER.showSection(sectionId);
    document.querySelectorAll('#teacher-dashboard .nav-item').forEach(nav => {
        nav.classList.toggle('active', nav.dataset.section === sectionId);
    });
}

// Search students
function searchStudents() {
    const query = document.getElementById('student-search').value.toLowerCase();
    const cards = document.querySelectorAll('.student-card');

    cards.forEach(card => {
        const name = card.querySelector('.student-name').textContent.toLowerCase();
        card.style.display = name.includes(query) ? '' : 'none';
    });
}
