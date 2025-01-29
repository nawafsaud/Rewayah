// Constants
const XP_PER_STORY = 100;
const XP_PER_LEVEL = 100;

// Get user data from localStorage
function getUserData() {
    const userId = auth.getCurrentUser().id;
    return JSON.parse(localStorage.getItem(`user_${userId}`) || '{}');
}

// Save user data to localStorage
function saveUserData(data) {
    const userId = auth.getCurrentUser().id;
    localStorage.setItem(`user_${userId}`, JSON.stringify(data));
}

// Calculate level and progress
function calculateLevel(xp) {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const progress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
    return { level, progress };
}

// Update profile UI
function updateProfileUI() {
    const user = auth.getCurrentUser();
    const userData = getUserData();

    // Update username and avatar
    document.getElementById('username').textContent = user.username;
    document.getElementById('userAvatar').src = userData.avatar || 'https://via.placeholder.com/150?text=صورة';

    // Update level and XP
    const { level, progress } = calculateLevel(userData.xp || 0);
    document.getElementById('userLevel').textContent = level;
    document.getElementById('userExp').textContent = userData.xp || 0;
    document.getElementById('nextLevelExp').textContent = level * XP_PER_LEVEL;
    document.getElementById('levelProgress').style.width = `${progress}%`;

    // Update stats
    const publishedStories = getPublishedStories();
    const readStories = getReadStories();
    document.getElementById('publishedCount').textContent = publishedStories.length;
    document.getElementById('readCount').textContent = readStories.length;

    // Update email and PayPal settings
    document.getElementById('emailInput').value = userData.email || '';
    document.getElementById('paypalEmailInput').value = userData.paypalEmail || '';
    document.getElementById('storyApprovalNotif').checked = userData.notifications?.storyApproval ?? true;
    document.getElementById('newChapterNotif').checked = userData.notifications?.newChapter ?? true;
    document.getElementById('supportNotif').checked = userData.notifications?.support ?? true;
}

// Get user's published stories
function getPublishedStories() {
    const userId = auth.getCurrentUser().id;
    const allStories = JSON.parse(localStorage.getItem('stories') || '[]');
    return allStories.filter(story => story.authorId === userId);
}

// Get user's read stories
function getReadStories() {
    const userData = getUserData();
    return userData.readStories || [];
}

// Display published stories
function displayPublishedStories() {
    const stories = getPublishedStories();
    const container = document.getElementById('publishedStories');

    if (stories.length === 0) {
        container.innerHTML = '<div class="no-items">لم تنشر أي رواية بعد</div>';
        return;
    }

    container.innerHTML = stories.map(story => `
        <div class="story-card">
            <img src="${story.coverImage}" alt="${story.title}" class="story-cover">
            <div class="story-info">
                <h3 class="story-title">${story.title}</h3>
                <div class="story-meta">
                    <span class="story-status ${story.status}">${getStatusText(story.status)}</span>
                    <span>${story.views || 0} مشاهدة</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Display reading list
function displayReadingList() {
    const readStories = getReadStories();
    const container = document.getElementById('readingList');

    if (readStories.length === 0) {
        container.innerHTML = '<div class="no-items">لم تقرأ أي رواية بعد</div>';
        return;
    }

    container.innerHTML = readStories.map(story => `
        <div class="story-card">
            <img src="${story.coverImage}" alt="${story.title}" class="story-cover">
            <div class="story-info">
                <h3 class="story-title">${story.title}</h3>
                <div class="story-meta">
                    <span>${story.progress || 0}% مقروء</span>
                    <span>آخر قراءة: ${new Date(story.lastRead).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `).join('');
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

// Handle avatar upload
function handleAvatarUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const userData = getUserData();
        userData.avatar = e.target.result;
        saveUserData(userData);
        document.getElementById('userAvatar').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Handle settings form submission
function handleSettingsSubmit(e) {
    e.preventDefault();
    const userData = getUserData();
    
    // Get form values
    const paypalEmail = document.getElementById('paypalEmailInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();

    // Validate PayPal email if provided
    if (paypalEmail && !isValidEmail(paypalEmail)) {
        alert('الرجاء إدخال بريد PayPal صحيح');
        return;
    }

    // Update user data
    userData.email = email;
    userData.paypalEmail = paypalEmail;
    userData.notifications = {
        storyApproval: document.getElementById('storyApprovalNotif').checked,
        newChapter: document.getElementById('newChapterNotif').checked,
        support: document.getElementById('supportNotif').checked
    };

    // Save user data
    saveUserData(userData);

    // Update all stories with the new PayPal email
    if (paypalEmail !== userData.paypalEmail) {
        const stories = JSON.parse(localStorage.getItem('stories') || '[]');
        const userId = auth.getCurrentUser().id;
        
        stories.forEach(story => {
            if (story.authorId === userId) {
                story.paypalEmail = paypalEmail;
            }
        });

        localStorage.setItem('stories', JSON.stringify(stories));
    }

    alert('تم حفظ التغييرات بنجاح');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add story to reading list
function addToReadingList(storyId) {
    const userData = getUserData();
    if (!userData.readStories) {
        userData.readStories = [];
    }
    
    if (!userData.readStories.find(s => s.id === storyId)) {
        const allStories = JSON.parse(localStorage.getItem('stories') || '[]');
        const story = allStories.find(s => s.id === storyId);
        
        if (story) {
            userData.readStories.push({
                id: story.id,
                title: story.title,
                coverImage: story.coverImage,
                progress: 0,
                lastRead: new Date().toISOString()
            });
            saveUserData(userData);
        }
    }
}

// Update reading progress
function updateReadingProgress(storyId, progress) {
    const userData = getUserData();
    const story = userData.readStories?.find(s => s.id === storyId);
    
    if (story) {
        story.progress = progress;
        story.lastRead = new Date().toISOString();
        saveUserData(userData);
    }
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize UI
    updateProfileUI();
    displayPublishedStories();
    displayReadingList();

    // Handle avatar upload
    document.getElementById('avatarInput').addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleAvatarUpload(e.target.files[0]);
        }
    });

    // Handle settings form submission
    document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);

    // Handle tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active tab content
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');

            // Refresh content if needed
            if (button.dataset.tab === 'published') {
                displayPublishedStories();
            } else if (button.dataset.tab === 'reading') {
                displayReadingList();
            }
        });
    });

    // Update navigation
    auth.updateNavigation();
});
