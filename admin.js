function getStoredStories() {
    try {
        return JSON.parse(localStorage.getItem('stories') || '[]');
    } catch (error) {
        console.error('Error getting stored stories:', error);
        return [];
    }
}

function saveStories(stories) {
    try {
        localStorage.setItem('stories', JSON.stringify(stories));
        return true;
    } catch (error) {
        console.error('Error saving stories:', error);
        return false;
    }
}

function loadStories() {
    const stories = getStoredStories();
    const storiesList = document.getElementById('storiesList');

    if (storiesList) {
        if (!stories || stories.length === 0) {
            storiesList.innerHTML = '<div class="no-items">لا توجد روايات</div>';
        } else {
            storiesList.innerHTML = stories.map(story => `
                <div class="story-item">
                    <h3>${story.title}</h3>
                    <p>${story.summary}</p>
                    <button onclick="editStory('${story.id}')">تعديل</button>
                    <button onclick="deleteStory('${story.id}')">حذف</button>
                </div>
            `).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadStories);

function showCreateStoryModal() {
    const modalHtml = `
        <div class='modal'>
            <div class='modal-content'>
                <span class='close' onclick='closeModal()'>&times;</span>
                <h2>إنشاء رواية جديدة</h2>
                <form id='createStoryForm'>
                    <label for='name'>اسم الرواية:</label>
                    <input type='text' id='name' name='name' required>
                    <label for='summary'>ملخص الرواية:</label>
                    <textarea id='summary' name='summary' required></textarea>
                    <label for='coverImage'>رابط صورة الغلاف:</label>
                    <input type='text' id='coverImage' name='coverImage' required>
                    <button type='submit'>نشر الرواية</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('createStoryForm').onsubmit = function(event) {
        event.preventDefault();
        const newStory = {
            id: Date.now(),
            name: document.getElementById('name').value,
            summary: document.getElementById('summary').value,
            coverImage: document.getElementById('coverImage').value
        };
        console.log('نموذج نشر الرواية:', newStory); // تسجيل القيم المدخلة
        const stories = getStoredStories();
        stories.push(newStory);
        saveStories(stories);
        closeModal();
        loadStories();
    };
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function editStory(storyId) {
    const stories = getStoredStories();
    const storyIndex = stories.findIndex(story => story.id === storyId);
    if (storyIndex !== -1) {
        const story = stories[storyIndex];
        const modalHtml = `
            <div class='modal'>
                <div class='modal-content'>
                    <span class='close' onclick='closeModal()'>&times;</span>
                    <h2>تعديل رواية: ${story.name}</h2>
                    <form id='editStoryForm'>
                        <label for='name'>اسم الرواية:</label>
                        <input type='text' id='name' name='name' value='${story.name}' required>
                        <label for='summary'>ملخص الرواية:</label>
                        <textarea id='summary' name='summary' required>${story.summary}</textarea>
                        <button type='submit'>تحديث الرواية</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('editStoryForm').onsubmit = function(event) {
            event.preventDefault();
            story.name = document.getElementById('name').value;
            story.summary = document.getElementById('summary').value;
            saveStories(stories);
            closeModal();
            loadStories();
        };
    }
}

function deleteStory(storyId) {
    const stories = getStoredStories();
    const updatedStories = stories.filter(story => story.id !== storyId);
    saveStories(updatedStories);
    loadStories();
}