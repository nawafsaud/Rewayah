// Function to get stored stories
function getStoredStories() {
    try {
        return JSON.parse(localStorage.getItem('stories') || '[]');
    } catch (error) {
        console.error('Error getting stored stories:', error);
        return [];
    }
}

// Function to save stories to localStorage
function saveStories(stories) {
    try {
        localStorage.setItem('stories', JSON.stringify(stories));
        return true;
    } catch (error) {
        console.error('Error saving stories:', error);
        return false;
    }
}

// Function to create story card
function createStoryCard(story) {
    const coverImage = story.coverImage || 'https://via.placeholder.com/300x400?text=غلاف+الرواية';
    return `
        <div class="story-card">
            <img src="${coverImage}" alt="${story.title}" class="story-image">
            <div class="story-info">
                <div class="story-title">${story.title}</div>
                <div class="story-author">بقلم ${story.authorName || 'مجهول'}</div>
                <div class="story-stats">
                    <span><i class="fas fa-eye"></i> ${story.views || 0}</span>
                    <span><i class="fas fa-heart"></i> ${story.likes || 0}</span>
                    <span><i class="fas fa-book"></i> ${story.chapters?.length || 0}</span>
                </div>
                <a href="story.html?id=${story.id}" class="read-more">قراءة المزيد</a>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const storiesGrid = document.getElementById('storiesGrid');
    
    // Check if stories container exists
    if (!storiesGrid) {
        console.error('Stories grid container not found');
        return;
    }

    // Get stored stories
    const stories = getStoredStories();
    
    // Only show approved stories
    const approvedStories = stories.filter(story => story.status === 'approved');
    
    // Render stories
    if (approvedStories.length === 0) {
        storiesGrid.innerHTML = '<div class="no-stories">لا توجد روايات منشورة بعد</div>';
    } else {
        storiesGrid.innerHTML = approvedStories.map(createStoryCard).join('');
    }

    // Update navigation
    if (typeof auth !== 'undefined') {
        auth.updateNavigation();
    }
});
