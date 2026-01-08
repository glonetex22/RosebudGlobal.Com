}

function uploadImages() {
    const category = document.getElementById('uploadCategory').value;
    const files = document.getElementById('modalFileInput').files;
    
    if (files.length === 0) {
        alert('Please select files to upload');
        return;
    }
    
    showNotification(`Uploading ${files.length} image(s) to ${category}...`);
    
    setTimeout(() => {
        closeModal();
        showNotification(`${files.length} image(s) uploaded successfully!`);
        loadImages();
    }, 1500);
}

function showContentTab(tabId) {
    document.querySelectorAll('.content-editor').forEach(editor => {
        editor.style.display = 'none';
    });
    
    const contentMap = {
        'homepage': 'homepageContent',
        'social': 'socialContent',
        'banners': 'bannersContent'
    };
    document.getElementById(contentMap[tabId]).style.display = 'block';
    
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

function saveHomepageContent() {
    const content = {
        headline: document.getElementById('heroHeadline').value,
        subheadline: document.getElementById('heroSubheadline').value
    };
    localStorage.setItem('cmsHomepageContent', JSON.stringify(content));
    showNotification('Homepage content saved!');
}

function saveSocialLinks() {
    const links = {
        instagram: document.getElementById('instagramUrl').value,
        facebook: document.getElementById('facebookUrl').value,
        youtube: document.getElementById('youtubeUrl').value
    };
    localStorage.setItem('cmsSocialLinks', JSON.stringify(links));
    showNotification('Social media links saved!');
}

function updateBanner(type) {
    const text = document.getElementById('notificationText').value;
    localStorage.setItem('cmsNotificationBanner', text);
    showNotification('Banner updated!');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#141718;color:white;padding:16px 24px;border-radius:8px;font-size:14px;z-index:2000;';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../index.html';
    }
}
