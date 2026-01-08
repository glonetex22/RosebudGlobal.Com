/**
 * RoseBud Global - Main JavaScript
 * Version 1.6.0
 */

// Inventory Data for Search
const inventory = [
    { name: 'Custom 100% Cotton Dyed Terry Hand Towels', sku: 'RBG-C2600', manufacturer: 'RoseBud Global', category: 'Custom Gift Items', price: 0, image: 'images/new-items/New Items - Custom Towels.png' },
    { name: 'Special Shaped Plate Series Ceramic Plate', sku: 'RBG-P31005', manufacturer: 'OH OHERE', category: 'Fine China & Crystal', price: 0, image: 'images/new-items/plate-cleaned.png' },
    { name: 'Custom Exotic Material Loveseat', sku: 'RBG-F29055', manufacturer: 'RoseBud Global', category: 'Specialty Items', price: 0, image: 'images/new-items/New Item - Exotic Loveseat.png' },
    { name: 'Olivia Riegel Priscilla Picture Frame', sku: 'RT1189', manufacturer: 'Olivia Riegel', category: 'Specialty Items', price: 300, image: 'images/new-items/New Item - Frame.webp' },
    { name: 'Noritake Fine China Dinner Set', sku: 'NOR-2024-001', manufacturer: 'Noritake', category: 'Fine China & Crystal', price: 450, image: 'images/hero/Noritake.webp' },
    { name: 'Mikasa Italian Countryside Collection', sku: 'MIK-IC-500', manufacturer: 'Mikasa', category: 'Fine China & Crystal', price: 275, image: '' },
    { name: 'Lenox Butterfly Meadow Dinnerware', sku: 'LNX-BM-100', manufacturer: 'Lenox', category: 'Fine China & Crystal', price: 320, image: '' },
    { name: 'Two\'s Company Decorative Vases', sku: 'TC-DV-200', manufacturer: 'Two\'s Company', category: 'Home Decor', price: 85, image: 'images/Twos_Company.png' },
    { name: 'Tozai Home Candle Holders Set', sku: 'TZH-CH-150', manufacturer: 'Tozai Home', category: 'Home Decor', price: 120, image: 'images/hero/Tozai_Home.png' },
    { name: 'Studio Nova Porcelain Collection', sku: 'SN-PC-300', manufacturer: 'Studio Nova', category: 'Fine China & Crystal', price: 195, image: '' },
    { name: 'Custom Wireless Earbuds', sku: 'RBG-WE-001', manufacturer: 'RoseBud Global', category: 'Custom Gift Items', price: 0, image: 'images/custom-gifts/Custom Wireless Earplugs.png' },
    { name: 'Custom Power Bank Charger', sku: 'RBG-PB-002', manufacturer: 'RoseBud Global', category: 'Custom Gift Items', price: 0, image: 'images/custom-gifts/Custom Charge bank.png' },
    { name: 'Corporate Gift Basket Deluxe', sku: 'RBG-GB-500', manufacturer: 'RoseBud Global', category: 'Corporate Gifts', price: 250, image: '' }
];

// Brand logos for carousel - all with transparent/white backgrounds
const brandLogos = [
    { src: 'images/brands-new/mikasa-seeklogo.png', alt: 'Mikasa' },
    { src: 'images/brands-new/studio-nova-transparent.png', alt: 'Studio Nova' },
    { src: 'images/brands-new/noritake-seeklogo.png', alt: 'Noritake' },
    { src: 'images/brands-new/lenox-logo.png', alt: 'Lenox' },
    { src: 'images/brands-new/kate-spade-logo.png', alt: 'Kate Spade' },
    { src: 'images/brands-new/olivia-riegel-logo.png', alt: 'Olivia Riegel' },
    { src: 'images/brands-new/twos-company-transparent.png', alt: 'Two\'s Company' },
    { src: 'images/brands-new/tozai-home-transparent.png', alt: 'Tozai Home' }
];

// Cart state - use localStorage for persistence across pages
let cart = [];

// Build version check (must match cart.js)
const MAIN_BUILD_VERSION = '3.2.0';

// Initialize cart from localStorage
function initCartFromStorage() {
    // Check build version first
    const savedVersion = localStorage.getItem('rosebudBuildVersion');
    if (savedVersion !== MAIN_BUILD_VERSION) {
        // New build - cart will be reset by cart.js
        cart = [];
        return;
    }
    
    try {
        const savedCart = localStorage.getItem('rosebudCart');
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            // Filter out invalid items
            cart = Array.isArray(parsed) ? parsed.filter(item => item && item.name && item.id) : [];
        } else {
            cart = [];
        }
    } catch (e) {
        console.warn('Error loading cart:', e);
        cart = [];
    }
}

// Initialize cart on script load
initCartFromStorage();

document.addEventListener('DOMContentLoaded', function() {
    initNotificationBar();
    initHeroSlider();
    initNavigation();
    initBrandCarousel();
    initSearch();
    initProductCarousel();
    initChat();
    initAnimations();
    
    // Initialize cart UI on page load
    updateCartUI();
    renderSidebarCart();
});

function initNotificationBar() {
    const closeBtn = document.querySelector('.notification-close');
    const notificationBar = document.querySelector('.notification-bar');
    if (closeBtn && notificationBar) {
        closeBtn.addEventListener('click', function() {
            notificationBar.style.transform = 'translateY(-100%)';
            notificationBar.style.opacity = '0';
            setTimeout(() => notificationBar.style.display = 'none', 300);
        });
    }
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;
    let autoplayInterval;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }
    
    function nextSlide() { showSlide((currentSlide + 1) % slides.length); }
    function prevSlide() { showSlide((currentSlide - 1 + slides.length) % slides.length); }
    function startAutoplay() { autoplayInterval = setInterval(nextSlide, 5000); }
    function stopAutoplay() { clearInterval(autoplayInterval); }
    
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { stopAutoplay(); showSlide(index); startAutoplay(); });
    });
    if (slides.length > 1) startAutoplay();
}

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
    });
}

// Brand Carousel - Dynamic loading
function initBrandCarousel() {
    const track = document.getElementById('brandCarousel');
    if (!track) return;
    
    // Generate logos twice for seamless loop
    let html = '';
    for (let i = 0; i < 2; i++) {
        brandLogos.forEach(logo => {
            // Add data attribute for specific logo sizing
            const brandSlug = logo.alt.toLowerCase().replace(/['\s]/g, '-');
            html += `<div class="brand-logo-item" data-brand="${brandSlug}"><img src="${logo.src}" alt="${logo.alt}" class="brand-logo"></div>`;
        });
    }
    track.innerHTML = html;
}

// Search with Autocomplete
function toggleSearch() {
    const dropdown = document.getElementById('searchDropdown');
    const input = document.getElementById('searchInput');
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
        input.focus();
        input.value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const results = inventory.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.manufacturer.toLowerCase().includes(query)
        );
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="search-no-results">No products found matching your search</p>';
            return;
        }
        
        // Group by category
        const grouped = {};
        results.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });
        
        let html = '';
        for (const category in grouped) {
            html += `<div class="search-category">${category}</div>`;
            grouped[category].slice(0, 3).forEach(item => {
                const imgHtml = item.image ? `<img src="${item.image}" alt="${item.name}">` : `<span>📦</span>`;
                html += `
                    <div class="search-result-item" onclick="selectSearchResult('${item.name}', ${item.price}, '${item.sku}')">
                        <div class="result-icon">${imgHtml}</div>
                        <div class="result-info">
                            <div class="result-name">${item.name}</div>
                            <div class="result-meta"><span class="result-sku">${item.sku}</span> • ${item.manufacturer}</div>
                        </div>
                    </div>
                `;
            });
        }
        searchResults.innerHTML = html;
    });
    
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('searchDropdown');
        const searchContainer = document.querySelector('.search-container');
        if (dropdown && searchContainer && !searchContainer.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// Global Search Toggle Function
function toggleSearch() {
    let searchModal = document.getElementById('globalSearchModal');
    let searchOverlay = document.getElementById('globalSearchOverlay');
    
    // Create search modal if it doesn't exist
    if (!searchModal) {
        const modalHTML = `
            <div class="global-search-overlay" id="globalSearchOverlay" onclick="toggleSearch()"></div>
            <div class="global-search-modal" id="globalSearchModal">
                <div class="search-modal-header">
                    <input type="text" id="globalSearchInput" placeholder="Search products, brands, categories..." autocomplete="off">
                    <button class="search-close-btn" onclick="toggleSearch()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                <div class="search-results-container" id="globalSearchResults"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add search modal styles
        const style = document.createElement('style');
        style.textContent = `
            .global-search-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9998; display: none; }
            .global-search-overlay.active { display: block; }
            .global-search-modal { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 600px; background: white; border-radius: 12px; z-index: 9999; display: none; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
            .global-search-modal.active { display: block; animation: searchSlideDown 0.3s ease; }
            @keyframes searchSlideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
            .search-modal-header { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid #E8ECEF; }
            .search-modal-header input { flex: 1; border: none; outline: none; font-size: 16px; font-family: 'Inter', sans-serif; padding: 8px 0; }
            .search-modal-header input::placeholder { color: #6C7275; }
            .search-close-btn { background: none; border: none; cursor: pointer; padding: 8px; color: #6C7275; }
            .search-close-btn:hover { color: #141718; }
            .search-results-container { max-height: 400px; overflow-y: auto; padding: 8px 0; }
            .search-results-container:empty { display: none; }
            .search-result-category { padding: 12px 20px 8px; font-size: 12px; font-weight: 600; color: #6C7275; text-transform: uppercase; letter-spacing: 0.5px; }
            .search-result-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; cursor: pointer; transition: background 0.2s; }
            .search-result-item:hover { background: #F3F5F7; }
            .search-result-item img { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; background: #F3F5F7; }
            .search-result-item .result-info { flex: 1; }
            .search-result-item .result-name { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #141718; margin-bottom: 2px; }
            .search-result-item .result-meta { font-size: 12px; color: #6C7275; }
            .search-result-item .result-price { font-weight: 600; color: #D63585; }
            .search-no-results { padding: 24px 20px; text-align: center; color: #6C7275; font-size: 14px; }
        `;
        document.head.appendChild(style);
        
        searchModal = document.getElementById('globalSearchModal');
        searchOverlay = document.getElementById('globalSearchOverlay');
        
        // Setup search input listener
        const searchInput = document.getElementById('globalSearchInput');
        searchInput.addEventListener('input', handleGlobalSearch);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') toggleSearch();
        });
    }
    
    const isOpen = searchModal.classList.contains('active');
    searchModal.classList.toggle('active');
    searchOverlay.classList.toggle('active');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    
    if (!isOpen) {
        setTimeout(() => document.getElementById('globalSearchInput').focus(), 100);
    }
}

// Global search handler with autocomplete
async function handleGlobalSearch() {
    const query = this.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('globalSearchResults');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Search in local inventory first
    let results = inventory.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    
    // Try to load more products from shop_products.json
    try {
        const response = await fetch('data/shop_products.json');
        if (response.ok) {
            const allProducts = await response.json();
            const additionalResults = allProducts.filter(item => 
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.sku && item.sku.toLowerCase().includes(query)) ||
                (item.brand && item.brand.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query))
            ).slice(0, 20);
            
            // Merge results avoiding duplicates
            additionalResults.forEach(item => {
                if (!results.find(r => r.sku === item.sku)) {
                    results.push({
                        name: item.name,
                        sku: item.sku,
                        manufacturer: item.brand || 'RoseBud Global',
                        category: item.category || 'General',
                        price: item.price || 0,
                        image: item.image || item.images?.[0] || ''
                    });
                }
            });
        }
    } catch (e) {
        console.log('Using local inventory only');
    }
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="search-no-results">No products found matching "' + query + '"</p>';
        return;
    }
    
    // Group by category
    const grouped = {};
    results.slice(0, 15).forEach(item => {
        const cat = item.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });
    
    let html = '';
    for (const category in grouped) {
        html += `<div class="search-result-category">${category}</div>`;
        grouped[category].slice(0, 4).forEach(item => {
            const imgHtml = item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">` : `<img src="images/avatar-placeholder.png" alt="${item.name}">`;
            const priceHtml = item.price > 0 ? `<span class="result-price">$${parseFloat(item.price).toFixed(2)}</span>` : '<span class="result-price">Contact for Price</span>';
            html += `
                <div class="search-result-item" onclick="goToProduct('${encodeURIComponent(item.sku)}', '${encodeURIComponent(item.name)}')">
                    ${imgHtml}
                    <div class="result-info">
                        <div class="result-name">${item.name}</div>
                        <div class="result-meta">${item.sku} • ${item.manufacturer} • ${priceHtml}</div>
                    </div>
                </div>
            `;
        });
    }
    resultsContainer.innerHTML = html;
}

// Navigate to product page from search
function goToProduct(sku, name) {
    toggleSearch();
    window.location.href = `product.html?sku=${sku}`;
}

function selectSearchResult(name, price, sku) {
    document.getElementById('searchDropdown').classList.remove('active');
    window.location.href = `product.html?sku=${encodeURIComponent(sku)}`;
}

// Go to Account - check if logged in
function goToAccount() {
    const isLoggedIn = localStorage.getItem('rosebudLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'account.html';
    } else {
        window.location.href = 'signin.html';
    }
}

// Login Modal
function openLogin(e) {
    e.preventDefault();
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLogin() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    alert(`Welcome! Login successful for: ${email}\n\n(Demo mode - full authentication requires backend integration)`);
    closeLogin();
}

function showSignup() {
    alert('Sign up functionality coming soon!');
}

// Cart Functions
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const isOpen = sidebar.classList.contains('open');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    
    // Re-render cart when opening
    if (!isOpen) {
        renderSidebarCart();
    }
}

function addToCart(name, price, sku) {
    if (price === 0) {
        alert(`Contact us for wholesale pricing on:\n${name}\nSKU: ${sku}\n\nEmail: sales@rosebudglobal.com\nPhone: (555) 123-4567`);
        return;
    }
    
    const existingIndex = cart.findIndex(item => item.id === sku);
    const product = inventory.find(p => p.sku === sku) || { image: 'images/avatar-placeholder.png' };
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({ 
            id: sku,
            name: name, 
            price: price, 
            sku: sku, 
            quantity: 1, 
            image: product.image || 'images/avatar-placeholder.png',
            color: 'Default',
            isCustom: price === 0,
            category: product.category || ''
        });
    }
    
    saveCart();
    updateCartUI();
    renderSidebarCart();
    toggleCart();
    
    // Show notification
    showCartNotification(`${name} added to cart!`);
}

function updateQty(sku, delta) {
    const item = cart.find(i => i.id === sku);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== sku);
        }
    }
    saveCart();
    updateCartUI();
    renderSidebarCart();
}

function removeFromCart(sku) {
    cart = cart.filter(item => item.id !== sku);
    saveCart();
    updateCartUI();
    renderSidebarCart();
}

function saveCart() {
    localStorage.setItem('rosebudCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

function renderSidebarCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotalEl) cartTotalEl.textContent = '$0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const imgSrc = item.image || 'images/avatar-placeholder.png';
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imgSrc}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-sku">${item.id}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        <span class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
}

function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    // Navigate to cart page for full checkout workflow
    window.location.href = 'cart.html';
}

function showCartNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#D63585' : '#38CB89'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

function initProductCarousel() {
    const carousel = document.getElementById('productsCarousel');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.querySelector('.carousel-progress');
    
    if (carousel && progressBar) {
        carousel.addEventListener('scroll', function() {
            const scrollWidth = carousel.scrollWidth - carousel.clientWidth;
            const progress = scrollWidth > 0 ? (carousel.scrollLeft / scrollWidth) * 100 : 0;
            progressBar.style.width = `${Math.max(10, Math.min(100, progress))}%`;
        });
        
        if (progressContainer) {
            progressContainer.addEventListener('click', function(e) {
                const rect = progressContainer.getBoundingClientRect();
                const percentage = (e.clientX - rect.left) / rect.width;
                carousel.scrollLeft = (carousel.scrollWidth - carousel.clientWidth) * percentage;
            });
        }
    }
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            const svg = this.querySelector('svg path');
            if (this.classList.contains('active')) {
                svg.setAttribute('fill', '#D63585');
                svg.setAttribute('stroke', '#D63585');
            } else {
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
            }
        });
    });
}

// Newsletter
function handleNewsletter(e) {
    e.preventDefault();
    const input = e.target.querySelector('.newsletter-input');
    const btn = e.target.querySelector('.newsletter-submit');
    if (input.value) {
        btn.textContent = 'Subscribed!';
        btn.style.color = '#38CB89';
        input.value = '';
        setTimeout(() => { btn.textContent = 'Signup'; btn.style.color = ''; }, 3000);
    }
}

// Contact Form
function handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('input[name="name"]').value;
    alert(`Thank you ${name}!\n\nYour message has been received. We'll respond within 24 hours.`);
    form.reset();
}

// Chat Widget
function initChat() {
    updateChatStatus();
    setInterval(updateChatStatus, 60000);
}

function updateChatStatus() {
    const statusEl = document.getElementById('chatStatus');
    const availabilityEl = document.getElementById('chatAvailability');
    
    const now = new Date();
    const estOffset = -5;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const estTime = new Date(utc + (3600000 * estOffset));
    
    const day = estTime.getDay();
    const hour = estTime.getHours();
    const isOnline = day >= 1 && day <= 5 && hour >= 9 && hour < 17;
    
    if (statusEl) {
        statusEl.className = 'chat-status ' + (isOnline ? 'online' : 'offline');
    }
    if (availabilityEl) {
        availabilityEl.textContent = isOnline ? 'Online • Mon-Fri 9am-5pm EST' : 'Offline • Mon-Fri 9am-5pm EST';
    }
}

function toggleChat() {
    document.getElementById('chatBox').classList.toggle('active');
}

function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    messages.innerHTML += `<div class="chat-message user"><p>${message}</p></div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    setTimeout(() => {
        const responses = [
            "Thank you for your message! A team member will respond shortly.",
            "We appreciate your inquiry. How else can we assist you today?",
            "Thanks for reaching out! For immediate assistance, call (555) 123-4567.",
            "Got it! We'll get back to you within 24 hours."
        ];
        messages.innerHTML += `<div class="chat-message bot"><p>${responses[Math.floor(Math.random() * responses.length)]}</p></div>`;
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.banner-card, .value-card, .blog-card, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        const href = link.getAttribute('href');
        if (href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
});

// Go to Account / Sign In
function goToAccount() {
    const isLoggedIn = localStorage.getItem('rosebudLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'account.html';
    } else {
        window.location.href = 'signin.html';
    }
}

// Global Search Toggle
function toggleSearch() {
    const searchOverlay = document.getElementById('searchOverlay') || createSearchOverlay();
    const searchModal = document.getElementById('searchModal') || createSearchModal();
    
    const isActive = searchModal.classList.contains('active');
    
    if (isActive) {
        searchModal.classList.remove('active');
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        searchModal.classList.add('active');
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const input = document.getElementById('globalSearchInput');
            if (input) input.focus();
        }, 100);
    }
}

function createSearchOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.className = 'search-overlay';
    overlay.onclick = toggleSearch;
    document.body.appendChild(overlay);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .search-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9998; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
        .search-overlay.active { opacity: 1; visibility: visible; }
        .search-modal { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 600px; background: white; border-radius: 12px; z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .search-modal.active { opacity: 1; visibility: visible; }
        .search-modal-content { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid #E8ECEF; }
        .search-modal-content input { flex: 1; border: none; outline: none; font-size: 16px; font-family: 'Inter', sans-serif; }
        .search-close-btn { background: none; border: none; font-size: 24px; color: #6C7275; cursor: pointer; padding: 4px 8px; }
        .search-results-container { max-height: 400px; overflow-y: auto; padding: 16px; }
        .search-result-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
        .search-result-item:hover { background: #F3F5F7; }
        .search-result-item img { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; }
        .search-result-info { flex: 1; }
        .search-result-name { font-family: 'Poppins', sans-serif; font-weight: 500; font-size: 14px; color: #141718; }
        .search-result-category { font-size: 12px; color: #6C7275; }
        .search-result-price { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; color: #D63585; }
        .search-no-results { text-align: center; color: #6C7275; padding: 24px; }
    `;
    document.head.appendChild(style);
    
    return overlay;
}

function createSearchModal() {
    const modal = document.createElement('div');
    modal.id = 'searchModal';
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-right: 12px; flex-shrink: 0;">
                <circle cx="11" cy="11" r="7" stroke="#6C7275" stroke-width="1.5"/>
                <path d="M20 20L16 16" stroke="#6C7275" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input type="text" id="globalSearchInput" placeholder="Search products, categories..." autocomplete="off">
            <button class="search-close-btn" onclick="toggleSearch()">&times;</button>
        </div>
        <div class="search-results-container" id="globalSearchResults"></div>
    `;
    document.body.appendChild(modal);
    
    // Add input listener for autocomplete
    const input = modal.querySelector('#globalSearchInput');
    input.addEventListener('input', handleGlobalSearch);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') toggleSearch();
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = document.querySelector('.search-result-item');
            if (firstResult) firstResult.click();
        }
    });
    
    return modal;
}

// All products for search (loaded from shop_products.json or fallback)
let allSearchProducts = [];

async function loadSearchProducts() {
    if (allSearchProducts.length > 0) return;
    
    try {
        const response = await fetch('data/shop_products.json');
        if (response.ok) {
            allSearchProducts = await response.json();
        }
    } catch (e) {
        console.warn('Could not load products for search, using inventory');
        allSearchProducts = inventory;
    }
}

function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('globalSearchResults');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '<p class="search-no-results">Type at least 2 characters to search</p>';
        return;
    }
    
    // Combine all products for search
    const searchData = allSearchProducts.length > 0 ? allSearchProducts : inventory;
    
    const results = searchData.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.sku && item.sku.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.brand && item.brand.toLowerCase().includes(query))
    ).slice(0, 10);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="search-no-results">No products found matching "' + query + '"</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(item => `
        <div class="search-result-item" onclick="goToProduct(${item.id || 0}, '${(item.sku || '').replace(/'/g, "\\'")}')">
            <img src="${item.image || item.images?.[0] || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
            <div class="search-result-info">
                <div class="search-result-name">${item.name}</div>
                <div class="search-result-category">${item.category || 'General'} • ${item.sku || ''}</div>
            </div>
            <div class="search-result-price">${item.price > 0 ? '$' + parseFloat(item.price).toFixed(2) : 'Contact'}</div>
        </div>
    `).join('');
}

function goToProduct(id, sku) {
    toggleSearch();
    const product = allSearchProducts.find(p => p.id === id || p.sku === sku) || 
                   inventory.find(p => p.sku === sku);
    if (product) {
        sessionStorage.setItem('currentProduct', JSON.stringify(product));
    }
    window.location.href = `product.html?id=${id}&sku=${encodeURIComponent(sku)}`;
}

// Load search products on page load
document.addEventListener('DOMContentLoaded', loadSearchProducts);

// Export functions globally
window.goToAccount = goToAccount;
window.toggleSearch = toggleSearch;
window.goToProduct = goToProduct;

console.log('RoseBud Global v2.9.0 - Loaded');
