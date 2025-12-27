// Quran Module - قسم القرآن الكريم (Enhanced with API)
const QURAN = {
    currentUser: null,
    currentSurah: null,
    isLoading: false,

    // Initialize quran module
    init(user) {
        if (!user) {
            console.warn('Quran module initialized without user');
            return;
        }
        this.currentUser = user;
        this.loadSurahGrid();
        this.populateReportSurahSelect();
        this.updateProgress();
    },

    // Load surah grid
    loadSurahGrid() {
        const container = document.getElementById('surah-grid');
        if (!container) return;

        const surahs = QURAN_DATA.surahs;
        const progress = this.currentUser.quranProgress || {};

        container.innerHTML = surahs.map(surah => {
            const status = progress[surah.id]?.status || 'not-started';

            return `
                <div class="surah-card ${status}" onclick="QURAN.openSurah(${surah.id})" data-status="${status}" data-juz="${surah.juz}">
                    <div class="surah-number">${surah.id}</div>
                    <div class="surah-info">
                        <div class="surah-name">${AUTH.sanitize(surah.name)}</div>
                        <div class="surah-meta">
                            <span class="ayahs-count">${surah.ayahs} آية</span>
                            <span class="surah-type">${AUTH.sanitize(surah.type)}</span>
                        </div>
                    </div>
                    <div class="surah-status">
                        ${status === 'memorized' ? '<i class="fas fa-check-circle"></i>' :
                    status === 'in-progress' ? '<i class="fas fa-hourglass-half"></i>' :
                        '<i class="fas fa-book-open"></i>'}
                    </div>
                </div>
            `;
        }).join('');

        // Setup filter tabs
        this.setupFilterTabs();
        this.setupSearch();
    },

    // Setup filter tabs
    setupFilterTabs() {
        const tabs = document.querySelectorAll('#quran-section .filter-tabs .tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filter = tab.dataset.filter;
                this.filterSurahs(filter);
            });
        });
    },

    // Setup search
    setupSearch() {
        const searchInput = document.getElementById('surah-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchSurahs(e.target.value);
            });
        }
    },

    // Search surahs
    searchSurahs(query) {
        const cards = document.querySelectorAll('.surah-card');
        const lowerQuery = query.toLowerCase().trim();

        cards.forEach(card => {
            const name = card.querySelector('.surah-name').textContent.toLowerCase();
            const number = card.querySelector('.surah-number').textContent;

            const matches = name.includes(lowerQuery) || number.includes(lowerQuery);
            card.style.display = matches ? '' : 'none';
        });
    },

    // Filter surahs
    filterSurahs(filter) {
        const cards = document.querySelectorAll('.surah-card');

        cards.forEach(card => {
            const status = card.dataset.status;

            if (filter === 'all') {
                card.style.display = '';
            } else if (filter === 'memorized') {
                card.style.display = status === 'memorized' ? '' : 'none';
            } else if (filter === 'in-progress') {
                card.style.display = status === 'in-progress' ? '' : 'none';
            } else if (filter === 'not-started') {
                card.style.display = status === 'not-started' ? '' : 'none';
            } else if (filter === 'juz30') {
                card.style.display = card.dataset.juz === '30' ? '' : 'none';
            }
        });
    },

    // Open surah for reading (with async API loading)
    async openSurah(surahId) {
        const surah = QURAN_DATA.getSurah(surahId);
        if (!surah) return;

        this.currentSurah = surah;

        const modal = document.getElementById('quran-reader-modal');
        const content = document.getElementById('quran-reader-content');
        const title = document.getElementById('reader-surah-name');

        title.textContent = `سورة ${AUTH.sanitize(surah.name)}`;

        // Show loading state
        content.innerHTML = `
            <div class="loading-ayahs">
                <div class="spinner"></div>
                <p>جاري تحميل الآيات...</p>
            </div>
        `;

        modal.classList.remove('hidden');

        // Fetch ayahs from API
        this.isLoading = true;
        let ayahs;

        try {
            ayahs = await QURAN_DATA.fetchSurah(surahId);
        } catch (error) {
            console.error('Error loading surah:', error);
            ayahs = QURAN_DATA.getLocalAyahs(surahId);
        }

        this.isLoading = false;

        // Build content
        let html = '<div class="bismillah">';
        if (surahId !== 1 && surahId !== 9) {
            html += 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
        }
        html += '</div><div class="ayahs-container">';

        ayahs.forEach(ayah => {
            html += `
                <span class="ayah" data-number="${ayah.number}">${AUTH.sanitize(ayah.text)}</span>
                <span class="ayah-number">${this.toArabicNumber(ayah.number)}</span>
            `;
        });

        html += '</div>';

        // Add audio player if available
        if (ayahs[0]?.audio) {
            html += `
                <div class="audio-controls">
                    <button class="btn btn-outline" onclick="QURAN.playAudio(${surahId})">
                        <i class="fas fa-play"></i> استماع للسورة
                    </button>
                </div>
            `;
        }

        content.innerHTML = html;
    },

    // Convert to Arabic numbers
    toArabicNumber(num) {
        const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return String(num).split('').map(d => arabicNums[parseInt(d)]).join('');
    },

    // Play audio
    playAudio(surahId) {
        const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahId}.mp3`;

        // Create or get audio element
        let audio = document.getElementById('quran-audio');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'quran-audio';
            document.body.appendChild(audio);
        }

        audio.src = audioUrl;
        audio.play();

        showToast('جاري تشغيل السورة...', 'info');
    },

    // Close quran reader
    closeReader() {
        document.getElementById('quran-reader-modal').classList.add('hidden');
        this.currentSurah = null;

        // Stop audio if playing
        const audio = document.getElementById('quran-audio');
        if (audio) {
            audio.pause();
            audio.src = '';
        }
    },

    // Mark surah as reviewed
    markAsReviewed() {
        if (!this.currentSurah) return;

        const progress = this.currentUser.quranProgress || {};

        if (!progress[this.currentSurah.id]) {
            progress[this.currentSurah.id] = { status: 'in-progress', reviewCount: 1 };
        } else {
            progress[this.currentSurah.id].reviewCount = (progress[this.currentSurah.id].reviewCount || 0) + 1;
            progress[this.currentSurah.id].lastReviewed = new Date().toISOString();
        }

        AUTH.updateUser(this.currentUser.id, { quranProgress: progress });

        // Add activity
        AUTH.addActivity(this.currentUser.id, {
            type: 'quran',
            text: `راجعت سورة ${this.currentSurah.name}`
        });

        // Add points
        if (typeof STUDENT !== 'undefined') {
            STUDENT.addPoints(1, `مراجعة سورة ${this.currentSurah.name}`);
        }

        showToast('تم تسجيل المراجعة', 'success');
        this.closeReader();
        this.loadSurahGrid();
        this.updateProgress();
    },

    // Mark surah as memorized
    markAsMemorized() {
        if (!this.currentSurah) return;

        const progress = this.currentUser.quranProgress || {};
        progress[this.currentSurah.id] = {
            status: 'memorized',
            memorizedAt: new Date().toISOString(),
            reviewCount: progress[this.currentSurah.id]?.reviewCount || 1
        };

        AUTH.updateUser(this.currentUser.id, { quranProgress: progress });

        // Add activity
        AUTH.addActivity(this.currentUser.id, {
            type: 'quran',
            text: `أتممت حفظ سورة ${this.currentSurah.name}`
        });

        // Add points based on surah length
        const points = Math.min(Math.ceil(this.currentSurah.ayahs / 10), 20);
        if (typeof STUDENT !== 'undefined') {
            STUDENT.addPoints(points, `حفظ سورة ${this.currentSurah.name}`);
        }

        showToast(`🎉 مبارك! أتممت حفظ سورة ${this.currentSurah.name}`, 'success');
        this.closeReader();
        this.loadSurahGrid();
        this.updateProgress();
    },

    // Update progress display
    updateProgress() {
        const progress = this.currentUser.quranProgress || {};
        const memorizedSurahs = Object.values(progress).filter(s => s.status === 'memorized').length;
        const inProgressSurahs = Object.values(progress).filter(s => s.status === 'in-progress').length;
        const totalSurahs = 114;
        const percentage = Math.round((memorizedSurahs / totalSurahs) * 100);

        // Calculate memorized ayahs
        let memorizedAyahs = 0;
        Object.entries(progress).forEach(([surahId, data]) => {
            if (data.status === 'memorized') {
                const surah = QURAN_DATA.getSurah(parseInt(surahId));
                if (surah) memorizedAyahs += surah.ayahs;
            }
        });

        // Update percentage display
        const percentageEl = document.getElementById('quran-percentage');
        if (percentageEl) percentageEl.textContent = percentage + '%';

        // Update circle progress
        const circleProgress = document.getElementById('quran-circle-progress');
        if (circleProgress) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (percentage / 100) * circumference;
            circleProgress.style.strokeDashoffset = offset;
        }

        // Update stats
        const memorizedEl = document.getElementById('memorized-surahs');
        if (memorizedEl) memorizedEl.textContent = memorizedSurahs;

        const inProgressEl = document.getElementById('in-progress-surahs');
        if (inProgressEl) inProgressEl.textContent = inProgressSurahs;

        const ayahsEl = document.getElementById('memorized-ayahs');
        if (ayahsEl) ayahsEl.textContent = memorizedAyahs;

        // Calculate juz (based on memorized surahs in each juz)
        const juzProgress = {};
        Object.entries(progress).forEach(([surahId, data]) => {
            if (data.status === 'memorized') {
                const surah = QURAN_DATA.getSurah(parseInt(surahId));
                if (surah) {
                    juzProgress[surah.juz] = (juzProgress[surah.juz] || 0) + 1;
                }
            }
        });

        // Count complete juz (simplified - juz 30 has 37 surahs)
        const completedJuz = Object.entries(juzProgress).filter(([juz, count]) => {
            if (juz === '30') return count >= 30; // Most of juz 30
            return count >= 3; // Simplified for other juz
        }).length;

        const juzEl = document.getElementById('memorized-juz');
        if (juzEl) juzEl.textContent = completedJuz;
    },

    // Populate report surah select
    populateReportSurahSelect() {
        const select = document.getElementById('report-surah');
        if (!select) return;

        select.innerHTML = '<option value="">اختر السورة</option>';
        QURAN_DATA.surahs.forEach(surah => {
            select.innerHTML += `<option value="${AUTH.sanitize(surah.name)}">${surah.id}. ${AUTH.sanitize(surah.name)}</option>`;
        });
    },

    // Show quran test
    async showTest() {
        const modal = document.getElementById('quran-test-modal');
        const content = document.getElementById('quran-test-content');

        // Get memorized surahs for testing
        const progress = this.currentUser.quranProgress || {};
        const memorizedIds = Object.entries(progress)
            .filter(([id, data]) => data.status === 'memorized')
            .map(([id]) => parseInt(id));

        if (memorizedIds.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-quran"></i>
                    <p>لم تحفظ أي سورة بعد</p>
                    <small>ابدأ بحفظ السور ثم عد للاختبار</small>
                </div>
            `;
            modal.classList.remove('hidden');
            return;
        }

        // Show loading
        content.innerHTML = `
            <div class="loading-ayahs">
                <div class="spinner"></div>
                <p>جاري تحضير الاختبار...</p>
            </div>
        `;
        modal.classList.remove('hidden');

        // Pick random surah for test
        const randomId = memorizedIds[Math.floor(Math.random() * memorizedIds.length)];
        const surah = QURAN_DATA.getSurah(randomId);

        // Fetch ayahs
        let ayahs;
        try {
            ayahs = await QURAN_DATA.fetchSurah(randomId);
        } catch (error) {
            ayahs = QURAN_DATA.getLocalAyahs(randomId);
        }

        if (ayahs.length < 2) {
            content.innerHTML = '<p>لا تتوفر بيانات كافية للاختبار</p>';
            return;
        }

        // Pick random ayah (excluding first)
        const randomAyahIndex = Math.floor(Math.random() * Math.min(ayahs.length - 1, 10)) + 1;
        const testAyah = ayahs[randomAyahIndex];
        const hintAyah = ayahs[randomAyahIndex - 1];

        content.innerHTML = `
            <div class="test-question">
                <div class="test-surah-name">
                    <i class="fas fa-quran"></i>
                    سورة ${surah.name}
                </div>
                <h4>أكمل الآية التالية:</h4>
                <div class="test-hint">
                    <p class="hint-ayah">${hintAyah.text}</p>
                    <span class="ayah-num">${this.toArabicNumber(hintAyah.number)}</span>
                </div>
                <div class="test-input">
                    <textarea id="test-answer" rows="3" placeholder="اكتب الآية التالية..." dir="rtl"></textarea>
                </div>
                <div class="test-actions">
                    <button class="btn btn-primary" onclick="QURAN.checkAnswer('${encodeURIComponent(testAyah.text.substring(0, 30))}')">
                        <i class="fas fa-check"></i> تحقق
                    </button>
                    <button class="btn btn-outline" onclick="QURAN.showAnswer('${encodeURIComponent(testAyah.text)}')">
                        <i class="fas fa-eye"></i> عرض الإجابة
                    </button>
                    <button class="btn btn-outline" onclick="QURAN.showTest()">
                        <i class="fas fa-redo"></i> سؤال آخر
                    </button>
                </div>
                <div id="test-result"></div>
            </div>
        `;
    },

    // Check test answer
    checkAnswer(encodedCorrect) {
        const correctStart = decodeURIComponent(encodedCorrect);
        const answer = document.getElementById('test-answer').value.trim();
        const resultDiv = document.getElementById('test-result');

        // Clean and compare
        const cleanAnswer = answer.replace(/[\u064B-\u0652]/g, '').trim();
        const cleanCorrect = correctStart.replace(/[\u064B-\u0652]/g, '').trim();

        if (cleanAnswer.length > 5 && cleanCorrect.includes(cleanAnswer.substring(0, 10))) {
            resultDiv.innerHTML = `
                <div class="result-success">
                    <i class="fas fa-check-circle"></i>
                    <span>ممتاز! إجابة صحيحة</span>
                </div>
            `;

            // Add points
            if (typeof STUDENT !== 'undefined') {
                STUDENT.addPoints(3, 'اختبار قرآن');
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
        const resultDiv = document.getElementById('test-result');

        resultDiv.innerHTML = `
            <div class="result-answer">
                <strong>الإجابة الصحيحة:</strong>
                <p class="correct-ayah">${answer}</p>
            </div>
        `;
    },

    // Close test modal
    closeTest() {
        document.getElementById('quran-test-modal').classList.add('hidden');
    }
};

// Global functions
function closeQuranReader() { QURAN.closeReader(); }
function markAsReviewed() { QURAN.markAsReviewed(); }
function markAsMemorized() { QURAN.markAsMemorized(); }
function showQuranTest() { QURAN.showTest(); }
function closeQuranTest() { QURAN.closeTest(); }
