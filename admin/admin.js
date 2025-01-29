// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'bem',
    password: '1111'
};

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    } else if (isLoggedIn && window.location.href.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Handle login form
if (document.getElementById('adminLoginForm')) {
    const loginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            loginMessage.textContent = 'تم تسجيل الدخول بنجاح...';
            loginMessage.className = 'login-message success';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            loginMessage.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            loginMessage.className = 'login-message error';
        }
    });
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });
}

// Initialize admin dashboard
function initDashboard() {
    if (!document.querySelector('.admin-dashboard')) return;

    // Here you would typically fetch real data from your backend
    // For now, we'll just simulate some data
    const stats = {
        totalStories: 0,
        activeUsers: 0,
        translatedStories: 0
    };

    // Update stats
    document.querySelectorAll('.stat-card .number').forEach((el, index) => {
        el.textContent = Object.values(stats)[index];
    });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initDashboard();
});
