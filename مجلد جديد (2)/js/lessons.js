// Lessons Module - قسم الدروس المرئية
const LESSONS = {
    currentUser: null,
    currentLesson: null,

    // Initialize lessons module
    init(user) {
        this.currentUser = user;
        this.loadLessons();
    },

    // Get lessons from teacher
    getLessons() {
        if (!this.currentUser.connectedTeacher) return [];

        const lessonsData = localStorage.getItem(`lessons_${this.currentUser.connectedTeacher}`);
        return lessonsData ? JSON.parse(lessonsData) : [];
    },

    // Load lessons grid
    loadLessons() {
        const container = document.getElementById('lessons-grid');
        if (!container) return;

        const lessons = this.getLessons();
        const watchedLessons = this.currentUser.lessonsWatched || [];

        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="empty-state" id="no-lessons" style="grid-column: 1/-1;">
                    <i class="fas fa-video-slash"></i>
                    <p>لا توجد دروس متاحة حالياً</p>
                    <small>${this.currentUser.connectedTeacher ? 'سيقوم الأستاذ بإضافة الدروس قريباً' : 'قم بالربط بأستاذ أولاً'}</small>
                </div>
            `;
            return;
        }

        container.innerHTML = lessons.map(lesson => {
            const isWatched = watchedLessons.includes(lesson.id);

            return `
                <div class="lesson-card" onclick="LESSONS.openLesson('${lesson.id}')">
                    <div class="lesson-thumbnail">
                        <img src="https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg" alt="${lesson.title}">
                        <div class="lesson-play"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="lesson-content">
                        <div class="lesson-title">${AUTH.sanitize(lesson.title)}</div>
                        <div class="lesson-description">${AUTH.sanitize(lesson.description) || ''}</div>
                        <div class="lesson-meta">
                            ${isWatched ? '<span class="lesson-watched"><i class="fas fa-check-circle"></i> تمت المشاهدة</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Open lesson
    openLesson(lessonId) {
        const lessons = this.getLessons();
        const lesson = lessons.find(l => l.id === lessonId);

        if (!lesson) return;

        this.currentLesson = lesson;

        const modal = document.getElementById('video-modal');
        const videoContainer = document.getElementById('video-container');
        const titleEl = document.getElementById('video-title');
        const descEl = document.getElementById('video-description');

        titleEl.textContent = AUTH.sanitize(lesson.title);
        descEl.textContent = AUTH.sanitize(lesson.description) || '';

        // Embed YouTube video
        videoContainer.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${lesson.videoId}?rel=0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;

        modal.classList.remove('hidden');
    },

    // Close video modal
    closeVideo() {
        const videoContainer = document.getElementById('video-container');
        videoContainer.innerHTML = '';
        document.getElementById('video-modal').classList.add('hidden');
        this.currentLesson = null;
    },

    // Mark lesson as watched
    markAsWatched() {
        if (!this.currentLesson) return;

        const watched = this.currentUser.lessonsWatched || [];

        if (!watched.includes(this.currentLesson.id)) {
            watched.push(this.currentLesson.id);
            AUTH.updateUser(this.currentUser.id, { lessonsWatched: watched });

            // Add activity
            AUTH.addActivity(this.currentUser.id, {
                type: 'lesson',
                text: `شاهدت درس: ${this.currentLesson.title}`
            });

            // Add points
            if (typeof STUDENT !== 'undefined') {
                STUDENT.addPoints(2, `مشاهدة درس`);
            }

            showToast('تم تسجيل مشاهدة الدرس', 'success');
        }

        this.closeVideo();
        this.loadLessons();

        // Update student stats
        if (typeof STUDENT !== 'undefined') {
            STUDENT.updateStats();
        }
    }
};

// Global functions
function closeVideoModal() { LESSONS.closeVideo(); }
function markLessonWatched() { LESSONS.markAsWatched(); }
