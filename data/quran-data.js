// Quran Data Module with API Integration
const QURAN_DATA = {
    // API Endpoints
    API_BASE: 'https://api.alquran.cloud/v1',

    // Surah metadata (cached for offline use)
    surahs: [
        { id: 1, name: "الفاتحة", englishName: "Al-Fatiha", ayahs: 7, type: "مكية", juz: 1 },
        { id: 2, name: "البقرة", englishName: "Al-Baqarah", ayahs: 286, type: "مدنية", juz: 1 },
        { id: 3, name: "آل عمران", englishName: "Aal-Imran", ayahs: 200, type: "مدنية", juz: 3 },
        { id: 4, name: "النساء", englishName: "An-Nisa", ayahs: 176, type: "مدنية", juz: 4 },
        { id: 5, name: "المائدة", englishName: "Al-Ma'idah", ayahs: 120, type: "مدنية", juz: 6 },
        { id: 6, name: "الأنعام", englishName: "Al-An'am", ayahs: 165, type: "مكية", juz: 7 },
        { id: 7, name: "الأعراف", englishName: "Al-A'raf", ayahs: 206, type: "مكية", juz: 8 },
        { id: 8, name: "الأنفال", englishName: "Al-Anfal", ayahs: 75, type: "مدنية", juz: 9 },
        { id: 9, name: "التوبة", englishName: "At-Tawbah", ayahs: 129, type: "مدنية", juz: 10 },
        { id: 10, name: "يونس", englishName: "Yunus", ayahs: 109, type: "مكية", juz: 11 },
        { id: 11, name: "هود", englishName: "Hud", ayahs: 123, type: "مكية", juz: 11 },
        { id: 12, name: "يوسف", englishName: "Yusuf", ayahs: 111, type: "مكية", juz: 12 },
        { id: 13, name: "الرعد", englishName: "Ar-Ra'd", ayahs: 43, type: "مدنية", juz: 13 },
        { id: 14, name: "إبراهيم", englishName: "Ibrahim", ayahs: 52, type: "مكية", juz: 13 },
        { id: 15, name: "الحجر", englishName: "Al-Hijr", ayahs: 99, type: "مكية", juz: 14 },
        { id: 16, name: "النحل", englishName: "An-Nahl", ayahs: 128, type: "مكية", juz: 14 },
        { id: 17, name: "الإسراء", englishName: "Al-Isra", ayahs: 111, type: "مكية", juz: 15 },
        { id: 18, name: "الكهف", englishName: "Al-Kahf", ayahs: 110, type: "مكية", juz: 15 },
        { id: 19, name: "مريم", englishName: "Maryam", ayahs: 98, type: "مكية", juz: 16 },
        { id: 20, name: "طه", englishName: "Ta-Ha", ayahs: 135, type: "مكية", juz: 16 },
        { id: 21, name: "الأنبياء", englishName: "Al-Anbiya", ayahs: 112, type: "مكية", juz: 17 },
        { id: 22, name: "الحج", englishName: "Al-Hajj", ayahs: 78, type: "مدنية", juz: 17 },
        { id: 23, name: "المؤمنون", englishName: "Al-Mu'minun", ayahs: 118, type: "مكية", juz: 18 },
        { id: 24, name: "النور", englishName: "An-Nur", ayahs: 64, type: "مدنية", juz: 18 },
        { id: 25, name: "الفرقان", englishName: "Al-Furqan", ayahs: 77, type: "مكية", juz: 18 },
        { id: 26, name: "الشعراء", englishName: "Ash-Shu'ara", ayahs: 227, type: "مكية", juz: 19 },
        { id: 27, name: "النمل", englishName: "An-Naml", ayahs: 93, type: "مكية", juz: 19 },
        { id: 28, name: "القصص", englishName: "Al-Qasas", ayahs: 88, type: "مكية", juz: 20 },
        { id: 29, name: "العنكبوت", englishName: "Al-Ankabut", ayahs: 69, type: "مكية", juz: 20 },
        { id: 30, name: "الروم", englishName: "Ar-Rum", ayahs: 60, type: "مكية", juz: 21 },
        { id: 31, name: "لقمان", englishName: "Luqman", ayahs: 34, type: "مكية", juz: 21 },
        { id: 32, name: "السجدة", englishName: "As-Sajdah", ayahs: 30, type: "مكية", juz: 21 },
        { id: 33, name: "الأحزاب", englishName: "Al-Ahzab", ayahs: 73, type: "مدنية", juz: 21 },
        { id: 34, name: "سبأ", englishName: "Saba", ayahs: 54, type: "مكية", juz: 22 },
        { id: 35, name: "فاطر", englishName: "Fatir", ayahs: 45, type: "مكية", juz: 22 },
        { id: 36, name: "يس", englishName: "Ya-Sin", ayahs: 83, type: "مكية", juz: 22 },
        { id: 37, name: "الصافات", englishName: "As-Saffat", ayahs: 182, type: "مكية", juz: 23 },
        { id: 38, name: "ص", englishName: "Sad", ayahs: 88, type: "مكية", juz: 23 },
        { id: 39, name: "الزمر", englishName: "Az-Zumar", ayahs: 75, type: "مكية", juz: 23 },
        { id: 40, name: "غافر", englishName: "Ghafir", ayahs: 85, type: "مكية", juz: 24 },
        { id: 41, name: "فصلت", englishName: "Fussilat", ayahs: 54, type: "مكية", juz: 24 },
        { id: 42, name: "الشورى", englishName: "Ash-Shura", ayahs: 53, type: "مكية", juz: 25 },
        { id: 43, name: "الزخرف", englishName: "Az-Zukhruf", ayahs: 89, type: "مكية", juz: 25 },
        { id: 44, name: "الدخان", englishName: "Ad-Dukhan", ayahs: 59, type: "مكية", juz: 25 },
        { id: 45, name: "الجاثية", englishName: "Al-Jathiyah", ayahs: 37, type: "مكية", juz: 25 },
        { id: 46, name: "الأحقاف", englishName: "Al-Ahqaf", ayahs: 35, type: "مكية", juz: 26 },
        { id: 47, name: "محمد", englishName: "Muhammad", ayahs: 38, type: "مدنية", juz: 26 },
        { id: 48, name: "الفتح", englishName: "Al-Fath", ayahs: 29, type: "مدنية", juz: 26 },
        { id: 49, name: "الحجرات", englishName: "Al-Hujurat", ayahs: 18, type: "مدنية", juz: 26 },
        { id: 50, name: "ق", englishName: "Qaf", ayahs: 45, type: "مكية", juz: 26 },
        { id: 51, name: "الذاريات", englishName: "Adh-Dhariyat", ayahs: 60, type: "مكية", juz: 26 },
        { id: 52, name: "الطور", englishName: "At-Tur", ayahs: 49, type: "مكية", juz: 27 },
        { id: 53, name: "النجم", englishName: "An-Najm", ayahs: 62, type: "مكية", juz: 27 },
        { id: 54, name: "القمر", englishName: "Al-Qamar", ayahs: 55, type: "مكية", juz: 27 },
        { id: 55, name: "الرحمن", englishName: "Ar-Rahman", ayahs: 78, type: "مدنية", juz: 27 },
        { id: 56, name: "الواقعة", englishName: "Al-Waqi'ah", ayahs: 96, type: "مكية", juz: 27 },
        { id: 57, name: "الحديد", englishName: "Al-Hadid", ayahs: 29, type: "مدنية", juz: 27 },
        { id: 58, name: "المجادلة", englishName: "Al-Mujadilah", ayahs: 22, type: "مدنية", juz: 28 },
        { id: 59, name: "الحشر", englishName: "Al-Hashr", ayahs: 24, type: "مدنية", juz: 28 },
        { id: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", ayahs: 13, type: "مدنية", juz: 28 },
        { id: 61, name: "الصف", englishName: "As-Saff", ayahs: 14, type: "مدنية", juz: 28 },
        { id: 62, name: "الجمعة", englishName: "Al-Jumu'ah", ayahs: 11, type: "مدنية", juz: 28 },
        { id: 63, name: "المنافقون", englishName: "Al-Munafiqun", ayahs: 11, type: "مدنية", juz: 28 },
        { id: 64, name: "التغابن", englishName: "At-Taghabun", ayahs: 18, type: "مدنية", juz: 28 },
        { id: 65, name: "الطلاق", englishName: "At-Talaq", ayahs: 12, type: "مدنية", juz: 28 },
        { id: 66, name: "التحريم", englishName: "At-Tahrim", ayahs: 12, type: "مدنية", juz: 28 },
        { id: 67, name: "الملك", englishName: "Al-Mulk", ayahs: 30, type: "مكية", juz: 29 },
        { id: 68, name: "القلم", englishName: "Al-Qalam", ayahs: 52, type: "مكية", juz: 29 },
        { id: 69, name: "الحاقة", englishName: "Al-Haqqah", ayahs: 52, type: "مكية", juz: 29 },
        { id: 70, name: "المعارج", englishName: "Al-Ma'arij", ayahs: 44, type: "مكية", juz: 29 },
        { id: 71, name: "نوح", englishName: "Nuh", ayahs: 28, type: "مكية", juz: 29 },
        { id: 72, name: "الجن", englishName: "Al-Jinn", ayahs: 28, type: "مكية", juz: 29 },
        { id: 73, name: "المزمل", englishName: "Al-Muzzammil", ayahs: 20, type: "مكية", juz: 29 },
        { id: 74, name: "المدثر", englishName: "Al-Muddaththir", ayahs: 56, type: "مكية", juz: 29 },
        { id: 75, name: "القيامة", englishName: "Al-Qiyamah", ayahs: 40, type: "مكية", juz: 29 },
        { id: 76, name: "الإنسان", englishName: "Al-Insan", ayahs: 31, type: "مدنية", juz: 29 },
        { id: 77, name: "المرسلات", englishName: "Al-Mursalat", ayahs: 50, type: "مكية", juz: 29 },
        { id: 78, name: "النبأ", englishName: "An-Naba", ayahs: 40, type: "مكية", juz: 30 },
        { id: 79, name: "النازعات", englishName: "An-Nazi'at", ayahs: 46, type: "مكية", juz: 30 },
        { id: 80, name: "عبس", englishName: "Abasa", ayahs: 42, type: "مكية", juz: 30 },
        { id: 81, name: "التكوير", englishName: "At-Takwir", ayahs: 29, type: "مكية", juz: 30 },
        { id: 82, name: "الانفطار", englishName: "Al-Infitar", ayahs: 19, type: "مكية", juz: 30 },
        { id: 83, name: "المطففين", englishName: "Al-Mutaffifin", ayahs: 36, type: "مكية", juz: 30 },
        { id: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", ayahs: 25, type: "مكية", juz: 30 },
        { id: 85, name: "البروج", englishName: "Al-Buruj", ayahs: 22, type: "مكية", juz: 30 },
        { id: 86, name: "الطارق", englishName: "At-Tariq", ayahs: 17, type: "مكية", juz: 30 },
        { id: 87, name: "الأعلى", englishName: "Al-A'la", ayahs: 19, type: "مكية", juz: 30 },
        { id: 88, name: "الغاشية", englishName: "Al-Ghashiyah", ayahs: 26, type: "مكية", juz: 30 },
        { id: 89, name: "الفجر", englishName: "Al-Fajr", ayahs: 30, type: "مكية", juz: 30 },
        { id: 90, name: "البلد", englishName: "Al-Balad", ayahs: 20, type: "مكية", juz: 30 },
        { id: 91, name: "الشمس", englishName: "Ash-Shams", ayahs: 15, type: "مكية", juz: 30 },
        { id: 92, name: "الليل", englishName: "Al-Layl", ayahs: 21, type: "مكية", juz: 30 },
        { id: 93, name: "الضحى", englishName: "Ad-Duha", ayahs: 11, type: "مكية", juz: 30 },
        { id: 94, name: "الشرح", englishName: "Ash-Sharh", ayahs: 8, type: "مكية", juz: 30 },
        { id: 95, name: "التين", englishName: "At-Tin", ayahs: 8, type: "مكية", juz: 30 },
        { id: 96, name: "العلق", englishName: "Al-Alaq", ayahs: 19, type: "مكية", juz: 30 },
        { id: 97, name: "القدر", englishName: "Al-Qadr", ayahs: 5, type: "مكية", juz: 30 },
        { id: 98, name: "البينة", englishName: "Al-Bayyinah", ayahs: 8, type: "مدنية", juz: 30 },
        { id: 99, name: "الزلزلة", englishName: "Az-Zalzalah", ayahs: 8, type: "مدنية", juz: 30 },
        { id: 100, name: "العاديات", englishName: "Al-Adiyat", ayahs: 11, type: "مكية", juz: 30 },
        { id: 101, name: "القارعة", englishName: "Al-Qari'ah", ayahs: 11, type: "مكية", juz: 30 },
        { id: 102, name: "التكاثر", englishName: "At-Takathur", ayahs: 8, type: "مكية", juz: 30 },
        { id: 103, name: "العصر", englishName: "Al-Asr", ayahs: 3, type: "مكية", juz: 30 },
        { id: 104, name: "الهمزة", englishName: "Al-Humazah", ayahs: 9, type: "مكية", juz: 30 },
        { id: 105, name: "الفيل", englishName: "Al-Fil", ayahs: 5, type: "مكية", juz: 30 },
        { id: 106, name: "قريش", englishName: "Quraysh", ayahs: 4, type: "مكية", juz: 30 },
        { id: 107, name: "الماعون", englishName: "Al-Ma'un", ayahs: 7, type: "مكية", juz: 30 },
        { id: 108, name: "الكوثر", englishName: "Al-Kawthar", ayahs: 3, type: "مكية", juz: 30 },
        { id: 109, name: "الكافرون", englishName: "Al-Kafirun", ayahs: 6, type: "مكية", juz: 30 },
        { id: 110, name: "النصر", englishName: "An-Nasr", ayahs: 3, type: "مدنية", juz: 30 },
        { id: 111, name: "المسد", englishName: "Al-Masad", ayahs: 5, type: "مكية", juz: 30 },
        { id: 112, name: "الإخلاص", englishName: "Al-Ikhlas", ayahs: 4, type: "مكية", juz: 30 },
        { id: 113, name: "الفلق", englishName: "Al-Falaq", ayahs: 5, type: "مكية", juz: 30 },
        { id: 114, name: "الناس", englishName: "An-Nas", ayahs: 6, type: "مكية", juz: 30 }
    ],

    // Cache for fetched ayahs
    cache: {},

    // Fetch surah from API
    async fetchSurah(surahId) {
        // Check cache first
        if (this.cache[surahId]) {
            return this.cache[surahId];
        }

        try {
            const response = await fetch(`${this.API_BASE}/surah/${surahId}/ar.alafasy`);
            const data = await response.json();

            if (data.code === 200 && data.data) {
                const ayahs = data.data.ayahs.map(ayah => ({
                    number: ayah.numberInSurah,
                    text: ayah.text,
                    audio: ayah.audio
                }));

                // Cache the result
                this.cache[surahId] = ayahs;
                return ayahs;
            }
        } catch (error) {
            console.error('Error fetching surah:', error);
        }

        // Fallback to local data
        return this.getLocalAyahs(surahId);
    },

    // Local ayahs as fallback
    getLocalAyahs(surahId) {
        const localData = {
            1: [
                { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
                { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
                { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
                { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
                { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
                { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
                { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" }
            ],
            112: [
                { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ" },
                { number: 2, text: "اللَّهُ الصَّمَدُ" },
                { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ" },
                { number: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ" }
            ],
            113: [
                { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ" },
                { number: 2, text: "مِن شَرِّ مَا خَلَقَ" },
                { number: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ" },
                { number: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ" },
                { number: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ" }
            ],
            114: [
                { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ" },
                { number: 2, text: "مَلِكِ النَّاسِ" },
                { number: 3, text: "إِلَٰهِ النَّاسِ" },
                { number: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ" },
                { number: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ" },
                { number: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ" }
            ]
        };

        if (localData[surahId]) {
            return localData[surahId];
        }

        // Generate placeholder
        const surah = this.getSurah(surahId);
        if (!surah) return [];

        const ayahs = [];
        for (let i = 1; i <= surah.ayahs; i++) {
            ayahs.push({
                number: i,
                text: `الآية رقم ${i} من سورة ${surah.name}`
            });
        }
        return ayahs;
    },

    // Get ayahs (async version)
    async getAyahsAsync(surahId) {
        return await this.fetchSurah(surahId);
    },

    // Get ayahs (sync version - uses cache or local)
    getAyahs(surahId) {
        if (this.cache[surahId]) {
            return this.cache[surahId];
        }
        return this.getLocalAyahs(surahId);
    },

    // Get total ayahs count
    getTotalAyahs() {
        return this.surahs.reduce((sum, surah) => sum + surah.ayahs, 0);
    },

    // Get surah by id
    getSurah(id) {
        return this.surahs.find(s => s.id === id);
    },

    // Search ayahs
    async searchAyahs(query) {
        try {
            const response = await fetch(`${this.API_BASE}/search/${encodeURIComponent(query)}/all/ar`);
            const data = await response.json();

            if (data.code === 200 && data.data) {
                return data.data.matches;
            }
        } catch (error) {
            console.error('Error searching ayahs:', error);
        }
        return [];
    }
};
