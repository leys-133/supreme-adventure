// Authentication System - نظام المصادقة
const AUTH = {
    TEACHER_SECRET_CODE: '7777',

    // Initialize auth system
    init() {
        this.setupEventListeners();
        this.checkSession();

        // Cross-tab synchronization
        window.addEventListener('storage', (e) => {
            if (e.key === 'islamic_lms_session') {
                if (!e.newValue) {
                    location.reload();
                } else {
                    const user = JSON.parse(e.newValue);
                    this.loginUser(user);
                }
            }
        });
    },

    // Setup event listeners
    setupEventListeners() {
        // Account type change
        document.querySelectorAll('input[name="account-type"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const teacherSection = document.getElementById('teacher-code-section');
                if (e.target.value === 'teacher') {
                    teacherSection.classList.remove('hidden');
                } else {
                    teacherSection.classList.add('hidden');
                }
            });
        });
    },

    // Check existing session
    checkSession() {
        const session = this.getSession();
        if (session) {
            this.loginUser(session);
        }
    },

    // Get session from localStorage
    getSession() {
        try {
            const session = localStorage.getItem('islamic_lms_session');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    },

    // Save session
    saveSession(user) {
        try {
            localStorage.setItem('islamic_lms_session', JSON.stringify(user));
        } catch (error) {
            console.error('Error saving session:', error);
            showToast('خطأ في حفظ الجلسة', 'error');
        }
    },

    // Clear session
    clearSession() {
        localStorage.removeItem('islamic_lms_session');
    },

    // Get all users
    getUsers() {
        try {
            const users = localStorage.getItem('islamic_lms_users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Error reading users:', error);
            return [];
        }
    },

    // Save users
    saveUsers(users) {
        try {
            localStorage.setItem('islamic_lms_users', JSON.stringify(users));
        } catch (error) {
            console.error('Error saving users:', error);
            showToast('خطأ في حفظ البيانات', 'error');
        }
    },

    // Find user by email
    findUser(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    // Generate unique ID
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Generate room code for teachers
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Sanitize input to prevent basic XSS
    sanitize(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Simple hash function for passwords with a small salt
    hashPassword(password) {
        const salt = "noor_ilm_2024";
        const saltedPassword = password + salt;
        let hash = 0;
        for (let i = 0; i < saltedPassword.length; i++) {
            const char = saltedPassword.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = (hash & hash) ^ 0x55555555; // XOR with a constant for a bit more complexity
        }
        return hash.toString(16); // Hex output
    },

    // Register new user
    register(name, email, password, accountType, teacherCode = '') {
        // Validate inputs
        if (!name || !email || !password) {
            return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة' };
        }

        if (password.length < 6) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        // Check if user exists
        if (this.findUser(email)) {
            return { success: false, message: 'هذا البريد الإلكتروني مسجل مسبقاً' };
        }

        // Validate teacher code
        if (accountType === 'teacher') {
            if (teacherCode !== this.TEACHER_SECRET_CODE) {
                return { success: false, message: 'رمز الأستاذ غير صحيح' };
            }
        }

        // Create user object
        const user = {
            id: this.generateId(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password),
            accountType: accountType,
            createdAt: new Date().toISOString(),
            roomCode: accountType === 'teacher' ? this.generateRoomCode() : null,
            connectedTeacher: null,
            points: 0,
            quranProgress: {},
            hadithProgress: [],
            lessonsWatched: [],
            reports: [],
            messages: [],
            activities: []
        };

        // Save user
        const users = this.getUsers();
        users.push(user);
        this.saveUsers(users);

        // Save session and login
        this.saveSession(user);
        this.loginUser(user);

        return { success: true, user: user };
    },

    // Login user
    login(email, password) {
        const user = this.findUser(email);

        if (!user) {
            return { success: false, message: 'البريد الإلكتروني غير مسجل' };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'كلمة المرور غير صحيحة' };
        }

        // Save session and login
        this.saveSession(user);
        this.loginUser(user);

        return { success: true, user: user };
    },

    // After successful login
    loginUser(user) {
        // Hide auth section
        document.getElementById('auth-section').classList.add('hidden');

        if (user.accountType === 'student') {
            // Show student dashboard
            document.getElementById('student-dashboard').classList.remove('hidden');
            document.getElementById('student-name').textContent = user.name;

            // Initialize student module
            if (typeof STUDENT !== 'undefined') {
                STUDENT.init(user);
            }
        } else {
            // Show teacher dashboard
            document.getElementById('teacher-dashboard').classList.remove('hidden');
            document.getElementById('teacher-name').textContent = AUTH.sanitize(user.name);
            const roomCodeEl = document.getElementById('teacher-room-code');
            if (roomCodeEl) {
                roomCodeEl.textContent = user.roomCode || '---';
            }

            // Initialize teacher module
            if (typeof TEACHER !== 'undefined') {
                TEACHER.init(user);
            }
        }

        // Initialize other modules
        if (typeof QURAN !== 'undefined') QURAN.init(user);
        if (typeof HADITH !== 'undefined') HADITH.init(user);
        if (typeof LESSONS !== 'undefined') LESSONS.init(user);
        if (typeof REPORTS !== 'undefined') REPORTS.init(user);
        if (typeof CHARTS !== 'undefined') CHARTS.init(user);
    },

    // Logout
    logout() {
        this.clearSession();
        location.reload();
    },

    // Update user data
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);

        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);

            // Update session if current user
            const session = this.getSession();
            if (session && session.id === userId) {
                this.saveSession(users[index]);
            }

            return users[index];
        }

        return null;
    },

    // Get user by ID
    getUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    },

    // Get current user
    getCurrentUser() {
        return this.getSession();
    },

    // Add activity to user
    addActivity(userId, activity) {
        const user = this.getUserById(userId);
        if (user) {
            if (!user.activities) user.activities = [];
            user.activities.unshift({
                ...activity,
                timestamp: new Date().toISOString()
            });
            // Keep only last 50 activities
            user.activities = user.activities.slice(0, 50);
            this.updateUser(userId, { activities: user.activities });
        }
    }
};

// Global functions for HTML onclick handlers
function showWelcome() {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showLoginForm() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const result = AUTH.login(email, password);

    if (!result.success) {
        errorDiv.textContent = result.message;
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
    }
}

function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const accountType = document.querySelector('input[name="account-type"]:checked').value;
    const teacherCode = document.getElementById('teacher-code').value;
    const errorDiv = document.getElementById('register-error');

    const result = AUTH.register(name, email, password, accountType, teacherCode);

    if (!result.success) {
        errorDiv.textContent = result.message;
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
        showToast('تم إنشاء الحساب بنجاح!', 'success');
    }
}

function handleLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        AUTH.logout();
    }
}
