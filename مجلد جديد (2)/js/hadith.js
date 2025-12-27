// Hadith Module - قسم الحديث الشريف (Enhanced)
const HADITH = {
    currentUser: null,
    currentHadith: null,

    // Initialize hadith module
    init(user) {
        if (!user) {
            console.warn('Hadith module initialized without user');
            return;
        }
        this.currentUser = user;
        this.loadHadithList();
        this.updateStats();
        this.setupCategoryFilter();
    },

    // Setup category filter
    setupCategoryFilter() {
        const filterContainer = document.getElementById('hadith-category-filter');
        if (filterContainer) {
            const categories = HADITH_DATA.getCategories();
            filterContainer.innerHTML = `
                <button class="tab active" onclick="HADITH.filterByCategory('')">الكل</button>
                ${categories.map(cat => `
                    <button class="tab" onclick="HADITH.filterByCategory('${cat}')">${cat}</button>
                `).join('')}
            `;
        }
    },

    // Filter by category
    filterByCategory(category) {
        const items = document.querySelectorAll('.hadith-item');

        // Update active tab
        document.querySelectorAll('#hadith-category-filter .tab').forEach(tab => {
            tab.classList.toggle('active',
                (category === '' && tab.textContent === 'الكل') ||
                tab.textContent === category
            );
        });

        items.forEach(item => {
            if (category === '' || item.dataset.category === category) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    },

    // Load hadith list
    loadHadithList() {
        const container = document.getElementById('hadith-list');
        if (!container) return;

        const hadiths = HADITH_DATA.hadiths;
        const progress = this.currentUser.hadithProgress || [];

        container.innerHTML = hadiths.map(hadith => {
            const isMemorized = progress.includes(hadith.id);

            return `
                <div class="hadith-item ${isMemorized ? 'memorized' : ''}" 
                     onclick="HADITH.openHadith(${hadith.id})"
                     data-category="${hadith.category}">
                    <div class="hadith-number">${hadith.id}</div>
                    <div class="hadith-info">
                        <div class="hadith-title">${AUTH.sanitize(hadith.title)}</div>
                        <div class="hadith-preview">${AUTH.sanitize(hadith.text.substring(0, 100))}...</div>
                        <div class="hadith-category-tag">${AUTH.sanitize(hadith.category)}</div>
                    </div>
                    ${isMemorized ? '<div class="hadith-status"><i class="fas fa-check-circle"></i></div>' : ''}
                </div>
            `;
        }).join('');
    },

    // Open hadith modal
    openHadith(hadithId) {
        const hadith = HADITH_DATA.getHadith(hadithId);
        if (!hadith) return;

        this.currentHadith = hadith;

        const modal = document.getElementById('hadith-modal');
        const title = document.getElementById('hadith-modal-title');
        const content = document.getElementById('hadith-modal-content');

        title.textContent = `الحديث ${hadith.id}: ${AUTH.sanitize(hadith.title)}`;

        const isMemorized = (this.currentUser.hadithProgress || []).includes(hadith.id);

        content.innerHTML = `
            <div class="hadith-category-badge">
                <i class="fas fa-tag"></i> ${AUTH.sanitize(hadith.category)}
            </div>
            <div class="hadith-text">${AUTH.sanitize(hadith.text)}</div>
            <div class="hadith-meta">
                <div class="hadith-narrator">
                    <i class="fas fa-user"></i> 
                    <span><strong>الراوي:</strong> ${AUTH.sanitize(hadith.narrator)}</span>
                </div>
                <div class="hadith-source">
                    <i class="fas fa-book"></i>
                    <span><strong>المصدر:</strong> ${AUTH.sanitize(hadith.source)}</span>
                </div>
            </div>
        `;

        // Update button state
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = isMemorized ? `
            <button class="btn btn-success" disabled>
                <i class="fas fa-check"></i> تم الحفظ
            </button>
        ` : `
            <button class="btn btn-primary" onclick="HADITH.markAsMemorized()">
                <i class="fas fa-check"></i> تم حفظه
            </button>
        `;

        modal.classList.remove('hidden');
    },

    // Close hadith modal
    closeModal() {
        document.getElementById('hadith-modal').classList.add('hidden');
        this.currentHadith = null;
    },

    // Mark hadith as memorized
    markAsMemorized() {
        if (!this.currentHadith) return;

        const progress = this.currentUser.hadithProgress || [];

        if (!progress.includes(this.currentHadith.id)) {
            progress.push(this.currentHadith.id);
            AUTH.updateUser(this.currentUser.id, { hadithProgress: progress });

            // Add activity
            AUTH.addActivity(this.currentUser.id, {
                type: 'hadith',
                text: `حفظت حديث: ${this.currentHadith.title}`
            });

            // Add points
            if (typeof STUDENT !== 'undefined') {
                STUDENT.addPoints(5, `حفظ حديث ${this.currentHadith.title}`);
            }

            showToast(`🎉 أحسنت! تم حفظ حديث "${this.currentHadith.title}"`, 'success');
        }

        this.closeModal();
        this.loadHadithList();
        this.updateStats();

        // Update student stats
        if (typeof STUDENT !== 'undefined') {
            STUDENT.updateStats();
        }
    },

    // Update stats
    updateStats() {
        const progress = this.currentUser.hadithProgress || [];
        const total = HADITH_DATA.getTotal();
        const memorized = progress.length;
        const masteryLevel = Math.round((memorized / total) * 100);

        // Update displays
        const totalEl = document.getElementById('total-hadiths');
        if (totalEl) totalEl.textContent = total;

        const memorizedEl = document.getElementById('memorized-hadiths');
        if (memorizedEl) memorizedEl.textContent = memorized;

        const masteryEl = document.getElementById('mastery-level');
        if (masteryEl) masteryEl.textContent = masteryLevel + '%';

        // Update progress bar if exists
        const progressBar = document.getElementById('hadith-progress-bar');
        if (progressBar) {
            progressBar.style.width = masteryLevel + '%';
        }
    },

    // Search hadiths
    search(query) {
        const results = HADITH_DATA.search(query);
        const container = document.getElementById('hadith-list');

        if (!query.trim()) {
            this.loadHadithList();
            return;
        }

        const progress = this.currentUser.hadithProgress || [];

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على نتائج</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(hadith => {
            const isMemorized = progress.includes(hadith.id);
            return `
                <div class="hadith-item ${isMemorized ? 'memorized' : ''}" 
                     onclick="HADITH.openHadith(${hadith.id})"
                     data-category="${hadith.category}">
                    <div class="hadith-number">${hadith.id}</div>
                    <div class="hadith-info">
                        <div class="hadith-title">${hadith.title}</div>
                        <div class="hadith-preview">${hadith.text.substring(0, 100)}...</div>
                    </div>
                    ${isMemorized ? '<div class="hadith-status"><i class="fas fa-check-circle"></i></div>' : ''}
                </div>
            `;
        }).join('');
    },

    // Show hadith test
    showTest() {
        const modal = document.getElementById('hadith-test-modal');
        const content = document.getElementById('hadith-test-content');

        const progress = this.currentUser.hadithProgress || [];

        if (progress.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>لم تحفظ أي حديث بعد</p>
                    <small>ابدأ بحفظ الأحاديث ثم عد للاختبار</small>
                </div>
            `;
            modal.classList.remove('hidden');
            return;
        }

        // Pick random memorized hadith
        const randomId = progress[Math.floor(Math.random() * progress.length)];
        const hadith = HADITH_DATA.getHadith(randomId);

        // Create test - complete the hadith
        const words = hadith.text.split(' ');
        const splitPoint = Math.floor(words.length / 2);

        const visiblePart = words.slice(0, splitPoint).join(' ');
        const hiddenPart = words.slice(splitPoint).join(' ');

        content.innerHTML = `
            <div class="test-question">
                <div class="test-surah-name">
                    <i class="fas fa-book-open"></i>
                    ${hadith.title}
                </div>
                <h4>أكمل الحديث:</h4>
                <div class="test-hint">
                    <p class="hint-ayah">${visiblePart}...</p>
                </div>
                <div class="test-input">
                    <textarea id="hadith-test-answer" rows="3" placeholder="اكتب تكملة الحديث..." dir="rtl"></textarea>
                </div>
                <div class="test-actions">
                    <button class="btn btn-primary" onclick="HADITH.checkAnswer('${encodeURIComponent(hiddenPart.substring(0, 30))}')">
                        <i class="fas fa-check"></i> تحقق
                    </button>
                    <button class="btn btn-outline" onclick="HADITH.showAnswer('${encodeURIComponent(hiddenPart)}')">
                        <i class="fas fa-eye"></i> عرض الإجابة
                    </button>
                    <button class="btn btn-outline" onclick="HADITH.showTest()">
                        <i class="fas fa-redo"></i> سؤال آخر
                    </button>
                </div>
                <div id="hadith-test-result"></div>
            </div>
        `;

        modal.classList.remove('hidden');
    },

    // Check hadith test answer
    checkAnswer(encodedCorrect) {
        const correct = decodeURIComponent(encodedCorrect);
        const answer = document.getElementById('hadith-test-answer').value.trim();
        const resultDiv = document.getElementById('hadith-test-result');

        // Simple check - if answer contains key words
        const correctWords = correct.split(' ').filter(w => w.length > 3);
        const answerWords = answer.split(' ');
        const matchCount = correctWords.filter(w =>
            answerWords.some(a => a.includes(w) || w.includes(a))
        ).length;
        const matchRatio = matchCount / Math.max(correctWords.length, 1);

        if (matchRatio >= 0.3) {
            resultDiv.innerHTML = `
                <div class="result-success">
                    <i class="fas fa-check-circle"></i>
                    <span>أحسنت! ${matchRatio >= 0.6 ? 'إجابة ممتازة' : 'إجابة جيدة'}</span>
                </div>
            `;

            // Add points
            if (typeof STUDENT !== 'undefined') {
                STUDENT.addPoints(2, 'اختبار حديث');
            }
        } else {
            resultDiv.innerHTML = `
                <div class="result-error">
                    <i class="fas fa-times-circle"></i>
                    <span>حاول مرة أخرى</span>
                </div>
            `;
        }
    },

    // Show correct answer
    showAnswer(encodedAnswer) {
        const answer = decodeURIComponent(encodedAnswer);
        const resultDiv = document.getElementById('hadith-test-result');

        resultDiv.innerHTML = `
            <div class="result-answer">
                <strong>التكملة الصحيحة:</strong>
                <p class="correct-ayah">...${answer}</p>
            </div>
        `;
    },

    // Close test modal
    closeTest() {
        document.getElementById('hadith-test-modal').classList.add('hidden');
    },

    // Show daily hadith
    showDailyHadith() {
        const hadith = HADITH_DATA.getRandom();
        showToast(`💎 ${hadith.title}: ${hadith.text.substring(0, 50)}...`, 'info');
    }
};

// Global functions
function closeHadithModal() { HADITH.closeModal(); }
function markHadithMemorized() { HADITH.markAsMemorized(); }
function showHadithTest() { HADITH.showTest(); }
function closeHadithTest() { HADITH.closeTest(); }
function searchHadiths() {
    const query = document.getElementById('hadith-search')?.value || '';
    HADITH.search(query);
}
