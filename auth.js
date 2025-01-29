// User management
const auth = {
    // Initialize user data
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        this.updateNavigation();
    },

    // Register new user
    register(username, password, email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if username already exists
        if (users.find(user => user.username === username)) {
            throw new Error('اسم المستخدم موجود بالفعل');
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            username,
            password, // In a real app, this should be hashed
            email,
            xp: 0,
            readStories: [],
            notifications: {
                storyApproval: true,
                newChapter: true
            },
            dateCreated: new Date().toISOString()
        };

        // Add user to storage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Initialize user data
        localStorage.setItem(`user_${newUser.id}`, JSON.stringify({
            email,
            xp: 0,
            readStories: [],
            notifications: {
                storyApproval: true,
                newChapter: true
            }
        }));

        return newUser;
    },

    // Login user
    login(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }

        // Set current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateNavigation();
        return user;
    },

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        window.location.href = 'index.html';
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('currentUser');
    },

    // Get current user
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    // Update navigation based on auth state
    updateNavigation() {
        const isLoggedIn = this.isLoggedIn();
        const user = this.getCurrentUser();

        // Update navigation links
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const publishLink = document.getElementById('publishLink');
        const profileLink = document.getElementById('profileLink');

        if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
        if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
        if (publishLink) publishLink.style.display = isLoggedIn ? 'inline-block' : 'none';
        if (profileLink) profileLink.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
};

// Initialize auth system
auth.init();

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>تسجيل الدخول</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label>اسم المستخدم</label>
                    <input type="text" id="loginUsername" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">تسجيل الدخول</button>
                    <button type="button" class="btn" onclick="this.closest('.modal').remove()">إلغاء</button>
                </div>
            </form>
            <p>ليس لديك حساب؟ <a href="#" onclick="showRegisterModal(); this.closest('.modal').remove();">إنشاء حساب</a></p>
        </div>
    `;
    document.body.appendChild(modal);

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            await auth.login(username, password);
            modal.remove();
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Show register modal
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>إنشاء حساب</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label>اسم المستخدم</label>
                    <input type="text" id="registerUsername" required>
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="registerPassword" required>
                </div>
                <div class="form-group">
                    <label>تأكيد كلمة المرور</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary-btn">إنشاء حساب</button>
                    <button type="button" class="btn" onclick="this.closest('.modal').remove()">إلغاء</button>
                </div>
            </form>
            <p>لديك حساب بالفعل؟ <a href="#" onclick="showLoginModal(); this.closest('.modal').remove();">تسجيل الدخول</a></p>
        </div>
    `;
    document.body.appendChild(modal);

    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                throw new Error('كلمات المرور غير متطابقة');
            }

            await auth.register(username, password, email);
            await auth.login(username, password);
            modal.remove();
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
