document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Get DOM elements
    const publishForm = document.getElementById('publishForm');
    const coverPreview = document.getElementById('coverPreview');
    const coverInput = document.getElementById('coverImage');
    const isTranslationCheckbox = document.getElementById('isTranslation');
    const originalAuthorGroup = document.getElementById('originalAuthorGroup');
    const paypalEmailInput = document.getElementById('paypalEmail');

    // Handle translation checkbox
    if (isTranslationCheckbox) {
        isTranslationCheckbox.addEventListener('change', (e) => {
            if (originalAuthorGroup) {
                originalAuthorGroup.style.display = e.target.checked ? 'block' : 'none';
                const originalAuthorInput = document.getElementById('originalAuthor');
                if (originalAuthorInput) {
                    originalAuthorInput.required = e.target.checked;
                }
            }
        });
    }

    // Validate PayPal email
    function validatePayPalEmail(email) {
        if (!email) return true; // PayPal email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Handle cover image preview
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && coverPreview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    coverPreview.src = e.target.result;
                    coverPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Get stories from localStorage
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

    // Handle form submission
    if (publishForm) {
        publishForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                // Get form elements
                const titleInput = document.getElementById('title');
                const summaryInput = document.getElementById('summary');
                const tagsInput = document.getElementById('tags');
                const isTranslationInput = document.getElementById('isTranslation');
                const originalAuthorInput = document.getElementById('originalAuthor');
                const paypalEmailInput = document.getElementById('paypalEmail');

                // Validate required elements exist
                if (!titleInput || !summaryInput || !tagsInput || !isTranslationInput || !coverPreview) {
                    throw new Error('بعض حقول النموذج مفقودة');
                }

                // Get form values
                const title = titleInput.value.trim();
                const summary = summaryInput.value.trim();
                const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                const isTranslation = isTranslationInput.checked;
                const originalAuthor = isTranslation ? (originalAuthorInput ? originalAuthorInput.value.trim() : '') : '';
                const coverImage = coverPreview.src;
                const paypalEmail = paypalEmailInput ? paypalEmailInput.value.trim() : '';

                // Validate required fields
                if (!title || !summary || tags.length === 0 || !coverImage) {
                    throw new Error('يرجى ملء جميع الحقول المطلوبة');
                }

                // Validate PayPal email if provided
                if (paypalEmail && !validatePayPalEmail(paypalEmail)) {
                    throw new Error('عنوان PayPal غير صالح');
                }

                const currentUser = auth.getCurrentUser();
                if (!currentUser) {
                    throw new Error('يجب تسجيل الدخول لنشر رواية');
                }

                // Create story object
                const newStory = {
                    id: 'story_' + Date.now(),
                    title,
                    summary,
                    tags,
                    isTranslation,
                    originalAuthor,
                    coverImage,
                    authorId: currentUser.id,
                    authorName: currentUser.username,
                    publishDate: new Date().toISOString(),
                    status: 'pending',
                    views: 0,
                    likes: 0,
                    chapters: [],
                    paypalEmail // Add PayPal email to story data
                };

                // Get existing stories and add new story
                const stories = getStoredStories();
                stories.push(newStory);

                // Save to localStorage
                if (!saveStories(stories)) {
                    throw new Error('فشل حفظ الرواية. الرجاء المحاولة مرة أخرى.');
                }

                // Add XP for publishing
                auth.addXP(100);

                // Send email notification if enabled
                const preferences = auth.getEmailPreferences();
                if (preferences?.notifications?.storyApproval) {
                    // In a real app, this would send an actual email
                    console.log(`Email notification would be sent to ${preferences.email}`);
                }

                // Show success message and redirect
                alert('تم إرسال روايتك للمراجعة. سيتم نشرها بعد موافقة المشرف.');
                window.location.href = 'profile.html';

            } catch (error) {
                console.error('Error publishing story:', error);
                alert(error.message || 'حدث خطأ أثناء نشر الرواية. الرجاء المحاولة مرة أخرى.');
            }
        });
    }
});
