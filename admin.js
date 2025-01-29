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
        const newStory = {
            id: Date.now(),
            title: document.getElementById('title').value,
            summary: document.getElementById('summary').value
        };
        const stories = getStoredStories();
        stories.push(newStory);
        const saved = saveStories(stories);
        if (saved) {
            console.log('تم حفظ الرواية بنجاح');
        } else {
            console.log('فشل في حفظ الرواية');
        }
        console.log('Saved stories:', saved, stories); // تسجيل الروايات المحفوظة
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
                    <h2>تعديل رواية: ${story.title}</h2>
                    <form id='editStoryForm'>
                        <label for='title'>عنوان الرواية:</label>
                        <input type='text' id='title' name='title' value='${story.title}' required>
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
            story.title = document.getElementById('title').value;
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