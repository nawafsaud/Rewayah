document.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('story');
    const chapterIndex = parseInt(urlParams.get('chapter'));

    // Get DOM elements
    const backToStory = document.getElementById('backToStory');
    const prevChapter = document.getElementById('prevChapter');
    const nextChapter = document.getElementById('nextChapter');
    const prevChapterBottom = document.getElementById('prevChapterBottom');
    const nextChapterBottom = document.getElementById('nextChapterBottom');

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

    // Get current story
    function getCurrentStory() {
        const stories = getStoredStories();
        return stories.find(story => story.id === storyId);
    }

    // Save current story
    function saveCurrentStory(story) {
        const stories = getStoredStories();
        const index = stories.findIndex(s => s.id === storyId);
        if (index !== -1) {
            stories[index] = story;
            if (!saveStories(stories)) {
                throw new Error('فشل حفظ الرواية');
            }
        }
    }

    // Update story views
    function updateStoryViews(story, chapterIndex) {
        try {
            // Increment story views
            story.views = (story.views || 0) + 1;
            
            // Increment chapter views
            if (story.chapters && story.chapters[chapterIndex]) {
                story.chapters[chapterIndex].views = (story.chapters[chapterIndex].views || 0) + 1;
            }

            // Save updated story
            saveCurrentStory(story);
        } catch (error) {
            console.error('Error updating views:', error);
        }
    }

    // Initialize chapter page
    function initChapterPage() {
        const story = getCurrentStory();
        
        // Show error if story doesn't exist
        if (!story) {
            document.querySelector('.chapter-container').innerHTML = `
                <div class="error-message">
                    <h2>الرواية غير موجودة</h2>
                    <p>عذراً، لم يتم العثور على الرواية المطلوبة.</p>
                    <a href="index.html" class="btn">العودة للرئيسية</a>
                </div>
            `;
            return;
        }

        // Show error if chapter doesn't exist
        if (!story.chapters || !story.chapters[chapterIndex]) {
            document.querySelector('.chapter-container').innerHTML = `
                <div class="error-message">
                    <h2>الفصل غير موجود</h2>
                    <p>عذراً، لم يتم العثور على الفصل المطلوب.</p>
                    <a href="story.html?id=${storyId}" class="btn">العودة للرواية</a>
                </div>
            `;
            return;
        }

        const chapter = story.chapters[chapterIndex];

        // Update page title
        document.title = `${chapter.title} - ${story.title}`;

        // Update story and chapter information
        document.getElementById('storyTitle').textContent = story.title;
        document.getElementById('chapterTitle').textContent = chapter.title;
        document.getElementById('authorName').textContent = story.authorName || 'المؤلف';
        document.getElementById('publishDate').textContent = new Date(chapter.date).toLocaleDateString('ar-SA');
        document.getElementById('chapterNumber').textContent = `الفصل ${chapterIndex + 1}`;
        document.getElementById('chapterNumberBottom').textContent = `الفصل ${chapterIndex + 1}`;

        // Set chapter content with proper formatting
        const contentDiv = document.getElementById('chapterContent');
        contentDiv.innerHTML = chapter.content.split('\n').map(paragraph => 
            paragraph.trim() ? `<p>${paragraph}</p>` : ''
        ).join('');

        // Update navigation buttons
        const hasNextChapter = chapterIndex < story.chapters.length - 1;
        const hasPrevChapter = chapterIndex > 0;

        prevChapter.style.visibility = hasPrevChapter ? 'visible' : 'hidden';
        nextChapter.style.visibility = hasNextChapter ? 'visible' : 'hidden';
        prevChapterBottom.style.visibility = hasPrevChapter ? 'visible' : 'hidden';
        nextChapterBottom.style.visibility = hasNextChapter ? 'visible' : 'hidden';

        // Set back to story link
        backToStory.href = `story.html?id=${storyId}`;

        // Update views
        updateStoryViews(story, chapterIndex);
    }

    // Handle navigation
    function navigateToChapter(direction) {
        const newIndex = chapterIndex + direction;
        window.location.href = `chapter.html?story=${storyId}&chapter=${newIndex}`;
    }

    // Add event listeners
    prevChapter.addEventListener('click', () => navigateToChapter(-1));
    nextChapter.addEventListener('click', () => navigateToChapter(1));
    prevChapterBottom.addEventListener('click', () => navigateToChapter(-1));
    nextChapterBottom.addEventListener('click', () => navigateToChapter(1));

    // Initialize the page
    initChapterPage();
});
