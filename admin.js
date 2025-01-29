// Get stored stories
function getStoredStories() {
    try {
        return JSON.parse(localStorage.getItem('stories') || '[]');
    } catch (error) {
        console.error('Error getting stored stories:', error);
        return [];
    }
}

// Save stories to localStorage
function saveStories(stories) {
    try {
        localStorage.setItem('stories', JSON.stringify(stories));
        return true;
    } catch (error) {
        console.error('Error saving stories:', error);
        return false;
    }
}

// Get user data
function getUserData(userId) {
    try {
        return JSON.parse(localStorage.getItem(`user_${userId}`) || '{}');
    } catch (error) {
        console.error('Error getting user data:', error);
        return {};
    }
}

// Send email notification
function sendEmailNotification(userId, subject, message) {
    const userData = getUserData(userId);
    if (userData.email && userData.notifications?.storyApproval) {
        // In a real app, this would send an actual email
        console.log(`Email would be sent to ${userData.email}:`, { subject, message });
    }
}

// Load dashboard data
function loadDashboardData() {
    const stories = getStoredStories();
    const storiesList = document.getElementById('storiesList');
    
    if (storiesList) {
        if (!stories || stories.length === 0) {
            storiesList.innerHTML = '<div class="no-items">لا توجد روايات</div>';
        } else {
            storiesList.innerHTML = stories.map(story => `
                <div class="story-item ${story.status}">
                    <img src="${story.coverImage || 'https://via.placeholder.com/60x80?text=غلاف'}" alt="${story.title}">
                    <div class="story-info">
                        <h3>${story.title}</h3>
                        <div class="story-meta">
                            <span class="author">${story.authorName}</span>
                            <span class="status ${story.status}">${getStatusText(story.status)}</span>
                            <span>${story.chapters ? story.chapters.length : 0} فصول</span>
                            <span>${story.views || 0} مشاهدة</span>
                        </div>
                        <p class="story-summary">${story.summary}</p>
                    </div>
                    <div class="story-actions">
                        ${story.status === 'pending' ? `
                            <button class="btn success-btn" onclick="approveStory('${story.id}')">
                                <i class="fas fa-check"></i> قبول
                            </button>
                            <button class="btn danger-btn" onclick="rejectStory('${story.id}')">
                                <i class="fas fa-times"></i> رفض
                            </button>
                        ` : ''}
                        <button class="btn" onclick="editStory('${story.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn danger-btn" onclick="deleteStory('${story.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Update statistics
    const totalStoriesEl = document.getElementById('totalStories');
    const totalUsersEl = document.getElementById('totalUsers');
    const todayVisitsEl = document.getElementById('todayVisits');
    const totalChaptersEl = document.getElementById('totalChapters');

    if (totalStoriesEl) totalStoriesEl.textContent = stories.length;
    if (totalChaptersEl) totalChaptersEl.textContent = stories.reduce((total, story) => total + (story.chapters?.length || 0), 0);

    // Calculate total users
    const users = Object.keys(localStorage).filter(key => key.startsWith('user_')).length;
    if (totalUsersEl) totalUsersEl.textContent = users;

    // Calculate today's visits
    const today = new Date().toDateString();
    const todayVisits = stories.reduce((total, story) => {
        const storyVisits = story.dailyVisits?.[today] || 0;
        return total + storyVisits;
    }, 0);
    if (todayVisitsEl) todayVisitsEl.textContent = todayVisits;
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'قيد المراجعة';
        case 'approved':
            return 'منشورة';
        case 'rejected':
            return 'مرفوضة';
        default:
            return status;
    }
}

// Story management functions
function approveStory(storyId) {
    const stories = getStoredStories();
    const storyIndex = stories.findIndex(story => story.id === storyId);
    
    if (storyIndex !== -1) {
        const story = stories[storyIndex];
        story.status = 'approved';
        story.approvedDate = new Date().toISOString();

        if (saveStories(stories)) {
            // Send notification to author
            sendEmailNotification(
                story.authorId,
                'تم قبول روايتك',
                `تهانينا! تم قبول روايتك "${story.title}" ويمكن الآن للقراء مشاهدتها.`
            );

            // Add XP to author
            const authorData = getUserData(story.authorId);
            if (authorData) {
                authorData.xp = (authorData.xp || 0) + 100;
                localStorage.setItem(`user_${story.authorId}`, JSON.stringify(authorData));
            }

            loadDashboardData();
            alert('تم قبول الرواية بنجاح');
        }
    }
}

function rejectStory(storyId) {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;

    const stories = getStoredStories();
    const storyIndex = stories.findIndex(story => story.id === storyId);
    
    if (storyIndex !== -1) {
        const story = stories[storyIndex];
        story.status = 'rejected';
        story.rejectionReason = reason;
        story.rejectedDate = new Date().toISOString();

        if (saveStories(stories)) {
            // Send notification to author
            sendEmailNotification(
                story.authorId,
                'تم رفض روايتك',
                `عذراً، تم رفض روايتك "${story.title}" للسبب التالي: ${reason}`
            );

            loadDashboardData();
            alert('تم رفض الرواية');
        }
    }
}

function deleteStory(storyId) {
    if (confirm('هل أنت متأكد من حذف هذه الرواية؟')) {
        const stories = getStoredStories();
        const updatedStories = stories.filter(story => story.id !== storyId);
        if (saveStories(updatedStories)) {
            loadDashboardData();
            alert('تم حذف الرواية بنجاح');
        }
    }
}

// Filter stories
function filterStories(status) {
    const stories = getStoredStories();
    const storiesList = document.getElementById('storiesList');
    
    if (!storiesList) return;

    const filteredStories = status === 'all' ? stories : stories.filter(story => story.status === status);
    
    if (filteredStories.length === 0) {
        storiesList.innerHTML = '<div class="no-items">لا توجد روايات</div>';
    } else {
        storiesList.innerHTML = filteredStories.map(story => `
            <div class="story-item ${story.status}">
                <img src="${story.coverImage || 'https://via.placeholder.com/60x80?text=غلاف'}" alt="${story.title}">
                <div class="story-info">
                    <h3>${story.title}</h3>
                    <div class="story-meta">
                        <span class="author">${story.authorName}</span>
                        <span class="status ${story.status}">${getStatusText(story.status)}</span>
                        <span>${story.chapters ? story.chapters.length : 0} فصول</span>
                        <span>${story.views || 0} مشاهدة</span>
                    </div>
                    <p class="story-summary">${story.summary}</p>
                </div>
                <div class="story-actions">
                    ${story.status === 'pending' ? `
                        <button class="btn success-btn" onclick="approveStory('${story.id}')">
                            <i class="fas fa-check"></i> قبول
                        </button>
                        <button class="btn danger-btn" onclick="rejectStory('${story.id}')">
                            <i class="fas fa-times"></i> رفض
                        </button>
                    ` : ''}
                    <button class="btn" onclick="editStory('${story.id}')">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn danger-btn" onclick="deleteStory('${story.id}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function showCreateStoryModal() {
    // إنشاء نموذج لإنشاء رواية جديدة
    const modalHtml = `
        <div class='modal'>
            <div class='modal-content'>
                <span class='close' onclick='closeModal()'>&times;</span>
                <h2>إنشاء رواية جديدة</h2>
                <form id='createStoryForm'>
                    <label for='title'>عنوان الرواية:</label>
                    <input type='text' id='title' name='title' required>
                    <label for='summary'>ملخص الرواية:</label>
                    <textarea id='summary' name='summary' required></textarea>
                    <button type='submit'>نشر الرواية</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('createStoryForm').onsubmit = function(event) {
        event.preventDefault();
        // هنا يمكنك إضافة الكود لحفظ الرواية
        closeModal();
    };
}

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.dataset.section;
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show target section
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });

    // Handle filter buttons
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.dataset.status;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter stories
            filterStories(status);
        });
    });

    // Handle search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const stories = getStoredStories();
            const storiesList = document.getElementById('storiesList');

            if (!storiesList) return;

            const filteredStories = stories.filter(story => 
                story.title.toLowerCase().includes(query) ||
                story.authorName.toLowerCase().includes(query) ||
                story.summary.toLowerCase().includes(query)
            );

            if (filteredStories.length === 0) {
                storiesList.innerHTML = '<div class="no-items">لا توجد نتائج للبحث</div>';
            } else {
                filterStories(filteredStories);
            }
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        });
    }

    // Check admin login
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');

    if (isAdmin) {
        if (loginForm) loginForm.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        loadDashboardData();
    } else {
        if (loginForm) loginForm.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    // Handle admin login
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // In a real app, this would be a server request
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('isAdmin', 'true');
                loginForm.style.display = 'none';
                dashboard.style.display = 'block';
                loadDashboardData();
            } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        });
    }
});
