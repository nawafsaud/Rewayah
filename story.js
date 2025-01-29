document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const modal = document.getElementById('chapterModal');
    const addChapterBtn = document.getElementById('addChapterBtn');
    const closeBtn = document.querySelector('.close-btn');
    const chapterForm = document.getElementById('chapterForm');
    const chaptersList = document.getElementById('chaptersList');

    // Get story ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id');

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

    // Initialize PayPal buttons
    function initPayPalButton(story) {
        const supportSection = document.querySelector('.support-author');
        const buttonContainer = document.getElementById('paypalButtonContainer');

        // Clear any existing PayPal buttons
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
        }

        // Hide support section if no PayPal email
        if (!story.paypalEmail) {
            if (supportSection) {
                supportSection.style.display = 'none';
                supportSection.classList.remove('visible');
            }
            return;
        }

        // Show support section
        if (supportSection) {
            supportSection.style.display = 'block';
            // Use setTimeout to ensure display:block has taken effect
            setTimeout(() => {
                supportSection.classList.add('visible');
            }, 50);
        }

        // Wait for PayPal SDK to be ready
        if (window.paypal) {
            renderPayPalButton();
        } else {
            // If PayPal SDK is not loaded yet, wait for it
            window.paypalButtonInitialized = false;
            const scriptCheck = setInterval(() => {
                if (window.paypal && !window.paypalButtonInitialized) {
                    clearInterval(scriptCheck);
                    window.paypalButtonInitialized = true;
                    renderPayPalButton();
                }
            }, 100);

            // Add timeout to stop checking after 10 seconds
            setTimeout(() => {
                clearInterval(scriptCheck);
                if (!window.paypalButtonInitialized) {
                    console.error('PayPal SDK failed to load');
                    if (supportSection) {
                        supportSection.style.display = 'none';
                        supportSection.classList.remove('visible');
                    }
                }
            }, 10000);
        }

        function renderPayPalButton() {
            paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '5.00', // Default support amount
                                currency_code: 'USD'
                            },
                            payee: {
                                email_address: story.paypalEmail
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        // Show success message
                        alert('شكراً لدعمك! تم إرسال مبلغ الدعم إلى الكاتب.');
                    });
                },
                onError: function(err) {
                    console.error('PayPal Error:', err);
                    alert('عذراً، حدث خطأ أثناء معالجة عملية الدفع. الرجاء المحاولة مرة أخرى.');
                    if (supportSection) {
                        supportSection.style.display = 'none';
                        supportSection.classList.remove('visible');
                    }
                }
            }).render('#paypalButtonContainer').catch(err => {
                console.error('PayPal render error:', err);
                if (supportSection) {
                    supportSection.style.display = 'none';
                    supportSection.classList.remove('visible');
                }
            });
        }
    }

    // Initialize story page
    function initStoryPage() {
        const story = getCurrentStory();
        if (!story) {
            document.querySelector('.story-container').innerHTML = '<div class="no-stories">الرواية غير موجودة</div>';
            return;
        }

        // Update story information
        document.getElementById('storyTitle').textContent = story.title;
        document.getElementById('authorName').textContent = story.authorName;
        document.getElementById('authorType').textContent = story.isTranslation ? 'مترجم' : 'كاتب أصلي';
        document.getElementById('viewCount').textContent = story.views || 0;
        document.getElementById('likeCount').textContent = story.likes || 0;
        document.getElementById('chapterCount').textContent = story.chapters ? story.chapters.length : 0;
        document.getElementById('storySummary').textContent = story.summary;

        // Set cover image
        const coverImg = document.getElementById('storyCover');
        if (story.coverImage) {
            coverImg.src = story.coverImage;
        } else {
            coverImg.src = 'https://via.placeholder.com/300x400?text=غلاف+الرواية';
        }

        // Add tags
        const tagsContainer = document.getElementById('storyTags');
        if (story.tags && story.tags.length > 0) {
            tagsContainer.innerHTML = story.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        } else {
            tagsContainer.innerHTML = '<span class="tag">لا توجد وسوم</span>';
        }

        // Show/hide add chapter button based on author
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && story.authorId === currentUser.id) {
            addChapterBtn.style.display = 'block';
        } else {
            addChapterBtn.style.display = 'none';
        }

        // Initialize PayPal button
        initPayPalButton(story);

        // Update chapters list
        updateChaptersList();

        // Increment view count
        story.views = (story.views || 0) + 1;
        saveCurrentStory(story);
    }

    // Update chapters list
    function updateChaptersList() {
        const story = getCurrentStory();
        if (!story || !story.chapters || story.chapters.length === 0) {
            chaptersList.innerHTML = '<div class="no-chapters">لم يتم نشر أي فصول بعد</div>';
            return;
        }

        chaptersList.innerHTML = story.chapters.map((chapter, index) => `
            <div class="chapter-item">
                <div class="chapter-info">
                    <h3>الفصل ${index + 1}: ${chapter.title}</h3>
                    <div class="chapter-meta">
                        <span><i class="fas fa-clock"></i> ${new Date(chapter.date).toLocaleDateString('ar-SA')}</span>
                        <span><i class="fas fa-eye"></i> ${chapter.views || 0}</span>
                    </div>
                </div>
                <a href="chapter.html?story=${storyId}&chapter=${index}" class="read-more">قراءة</a>
            </div>
        `).join('');
    }

    // Show modal
    if (addChapterBtn) {
        addChapterBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle chapter form submission
    if (chapterForm) {
        chapterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            try {
                const title = document.getElementById('chapterTitle').value.trim();
                const content = document.getElementById('chapterContent').value.trim();

                if (!title || !content) {
                    alert('الرجاء ملء جميع الحقول المطلوبة');
                    return;
                }

                const story = getCurrentStory();
                if (!story) {
                    alert('الرواية غير موجودة');
                    return;
                }

                // Add new chapter
                if (!story.chapters) story.chapters = [];
                story.chapters.push({
                    title,
                    content,
                    date: new Date().toISOString(),
                    views: 0
                });

                // Save story
                saveCurrentStory(story);

                // Update UI
                updateChaptersList();
                document.getElementById('chapterCount').textContent = story.chapters.length;

                // Reset form and close modal
                chapterForm.reset();
                modal.style.display = 'none';

                alert('تم إضافة الفصل بنجاح');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Initialize page
    initStoryPage();
});
