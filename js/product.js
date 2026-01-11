/**
 * RoseBud Global - Product Page JavaScript v2.7
 * Dynamic product loading from shop data
 */

// ========================================
// PRODUCT DATA
// ========================================

let productData = null;
let allProducts = [];
let colorVariants = [];
let currentImageIndex = 0;
let quantity = 1;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadProductData();
    initProductPage();
});

async function loadProductData() {
    // First try to get from sessionStorage (set by shop page)
    const storedProduct = sessionStorage.getItem('currentProduct');
    if (storedProduct) {
        productData = JSON.parse(storedProduct);
    }
    
    // Also get URL params
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productSku = urlParams.get('sku');
    
    // Load all products for color variant checking
    try {
        const response = await fetch('data/shop_products.json');
        if (response.ok) {
            allProducts = await response.json();
            
            // If we don't have product data yet, find by ID or SKU
            if (!productData && (productId || productSku)) {
                productData = allProducts.find(p => 
                    p.id == productId || 
                    p.sku === productSku
                );
            }
            
            // Find color variants (same model/base SKU, different colors)
            if (productData) {
                findColorVariants();
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
    
    // Fallback to demo product if nothing loaded
    if (!productData) {
        productData = {
            id: 0,
            name: 'Sample Product',
            price: 0,
            description: 'Product details not available. Please return to the shop.',
            images: ['images/avatar-placeholder.png'],
            sku: 'N/A',
            category: 'General',
            brand: 'Rose Bud Global'
        };
    }
}

function findColorVariants() {
    if (!productData || !productData.sku) return;
    
    // Extract base model number (remove color suffix like _BLK, _RED, etc.)
    const baseSku = productData.sku.replace(/[-_](BLK|RED|BLU|WHT|GRY|PNK|YEL|GRN|BRN|TAN|GLD|SLV|MUL|NAV|BGE|CRM|ORG|PRP|CRN|IVY|ROY|ROS|TEL|BUR|CHR|COG|TRQ|PEA|OAT)$/i, '');
    
    // Find all products with matching base SKU but different colors
    colorVariants = allProducts.filter(p => {
        if (!p.sku || p.id === productData.id) return false;
        const pBaseSku = p.sku.replace(/[-_](BLK|RED|BLU|WHT|GRY|PNK|YEL|GRN|BRN|TAN|GLD|SLV|MUL|NAV|BGE|CRM|ORG|PRP|CRN|IVY|ROY|ROS|TEL|BUR|CHR|COG|TRQ|PEA|OAT)$/i, '');
        return pBaseSku === baseSku && p.color !== productData.color;
    });
}

function initProductPage() {
    if (!productData) return;
    
    // Update page title
    document.title = `${productData.name} - RoseBud Global`;
    
    // Update breadcrumbs
    updateBreadcrumbs();
    
    // Update product info
    updateProductInfo();
    
    // Update gallery
    updateGallery();
    
    // Update color variants
    updateColorVariants();
    
    // Hide timer/offer section
    hideOfferSection();
    
    // Initialize quantity
    updateQuantityDisplay();
    
    // Show/hide Add to Cart based on category
    updateAddToCartVisibility();
}

// ========================================
// ADD TO CART / MAKE AN INQUIRY VISIBILITY
// ========================================

// Color constants
const PRIMARY_INQUIRY = '#377DFF';
const PRIMARY_CART = '#D63585';

// Category resolver - determines which single button to show
function getPrimaryActionForProduct(category, productName, productSku) {
    const cat = (category || '').toLowerCase();
    const name = (productName || '').toLowerCase();
    const sku = (productSku || '').toLowerCase();
    
    // These categories get "Add to Cart" button (pink)
    const cartCategories = ['sale', 'sale items', 'household', 'household items', 'handbag', 'handbags', 'bag', 'bags', 'purse', 'tote', 'clutch', 'wallet', 'leather'];
    
    // Check category
    if (cartCategories.some(c => cat.includes(c) || cat === c)) return 'CART';
    
    // Also check product name for bag-related keywords
    const bagKeywords = ['handbag', 'bag', 'purse', 'tote', 'clutch', 'wallet', 'leather', 'satchel', 'crossbody'];
    if (bagKeywords.some(k => name.includes(k))) return 'CART';
    
    // Check SKU patterns (RBG-W often indicates wallets/bags)
    if (sku.startsWith('rbg-w') || sku.includes('-bag') || sku.includes('-hb')) return 'CART';
    
    // These categories get "Make an Inquiry" button (blue)
    const inquiryCategories = ['custom gift', 'home decor', 'decor', 'specialty', 'wholesale', 'custom'];
    if (inquiryCategories.some(c => cat.includes(c))) return 'INQUIRY';
    
    return 'CART'; // Default for everything else
}

function updateAddToCartVisibility() {
    const category = (productData.category || '').toLowerCase();
    const productName = (productData.name || '').toLowerCase();
    const productSku = (productData.sku || '').toUpperCase();
    
    const addToCartBtn = document.getElementById('addToCartBtn');
    const makeInquiryBtn = document.getElementById('makeInquiryBtn');
    
    if (!addToCartBtn || !makeInquiryBtn) {
        console.error('Buttons not found');
        return;
    }
    
    // Determine which button to show based on category/product
    const primaryAction = getPrimaryActionForProduct(category, productName, productSku);
    const showInquiry = (primaryAction === 'INQUIRY');
    
    console.log('Button visibility:', { category, productName, primaryAction, showInquiry });
    
    if (showInquiry) {
        // Show Make an Inquiry, hide Add to Cart
        addToCartBtn.style.display = 'none';
        makeInquiryBtn.style.display = 'block';
    } else {
        // Show Add to Cart, hide Make an Inquiry
        addToCartBtn.style.display = 'block';
        makeInquiryBtn.style.display = 'none';
    }
}

// Add product to Inquiry Cart (with exclusive mode check)
function addToInquiryCart() {
    // Check exclusive mode - if cart has items, block inquiry
    if (typeof canAddToInquiry === 'function' && !canAddToInquiry()) {
        if (typeof showNotification === 'function') {
            showNotification('To make an inquiry, complete your Cart transactions first.', 'error');
        } else {
            alert('To make an inquiry, complete your Cart transactions first.');
        }
        return;
    }
    
    const qty = parseInt(document.getElementById('qtyValue')?.textContent || 1);
    
    // Get existing inquiry cart
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    // Check if product already in inquiry cart
    const existingIndex = inquiryCart.findIndex(item => item.sku === productData.sku);
    
    const inquiryItem = {
        id: productData.sku,
        name: productData.name,
        sku: productData.sku,
        price: parseFloat(productData.price) || 0,
        image: productData.image || productData.images?.[0] || 'images/avatar-placeholder.png',
        category: productData.category,
        description: productData.description || 'Premium quality product from RoseBud Global.',
        quantity: qty
    };
    
    if (existingIndex > -1) {
        // Update quantity if already exists
        inquiryCart[existingIndex].quantity += qty;
    } else {
        // Add new item
        inquiryCart.push(inquiryItem);
    }
    
    // Save to localStorage
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    
    // Update cart count only - DO NOT open sidebar
    if (typeof updateCartCount === 'function') updateCartCount();
    
    // Show notification
    showInquiryAddedNotification(productData.name, qty);
}

// Show notification when item added to inquiry
function showInquiryAddedNotification(name, qty) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #377DFF;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(55, 125, 255, 0.3);
        font-family: 'Poppins', sans-serif;
        max-width: 320px;
    `;
    notification.innerHTML = `
        <strong>Added to Inquiry</strong><br>
        <span style="font-size: 14px;">${qty}x ${name}</span><br>
        <a href="contact.html?inquiry=cart" style="color: white; text-decoration: underline; font-size: 13px;">View Inquiry Cart →</a>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Update inquiry badge count (legacy - now handled by updateCartCount)
function updateInquiryBadge() {
    if (typeof updateCartCount === 'function') updateCartCount();
}

// ========================================

function updateBreadcrumbs() {
    const breadcrumbCategory = document.querySelector('.breadcrumb-link:nth-child(5)');
    const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
    
    if (breadcrumbCategory && productData.category) {
        breadcrumbCategory.textContent = productData.category;
        breadcrumbCategory.href = `shop.html?category=${encodeURIComponent(productData.category)}`;
    }
    
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = productData.name;
    }
}

// ========================================
// PRODUCT INFO
// ========================================

function updateProductInfo() {
    // Name
    const nameEl = document.getElementById('productName') || document.querySelector('.product-name');
    if (nameEl) nameEl.textContent = productData.name;
    
    // Price
    const priceEl = document.getElementById('productPrice') || document.querySelector('.product-price .current-price');
    if (priceEl) {
        if (productData.price > 0) {
            priceEl.textContent = `$${productData.price.toFixed(2)}`;
            priceEl.classList.remove('contact-price');
        } else {
            priceEl.textContent = 'Contact for Price';
            priceEl.classList.add('contact-price');
        }
    }
    
    // Hide original price if no sale
    const originalPriceEl = document.querySelector('.original-price');
    if (originalPriceEl) {
        originalPriceEl.style.display = 'none';
    }
    
    // Description
    const descEl = document.getElementById('productDescription') || document.querySelector('.product-description');
    if (descEl) {
        descEl.textContent = productData.description || 'Premium quality product from Rose Bud Global. Contact us for more details.';
    }
    
    // SKU
    const skuEl = document.getElementById('productSku') || document.querySelector('.product-sku span:last-child');
    if (skuEl) skuEl.textContent = productData.sku || 'N/A';
    
    // Category
    const catEl = document.getElementById('productCategory') || document.querySelector('.product-category span:last-child');
    if (catEl) catEl.textContent = productData.category || 'General';
    
    // Brand
    const brandEl = document.querySelector('.product-brand span:last-child');
    if (brandEl) brandEl.textContent = productData.brand || 'Rose Bud Global';
    
    // Measurements
    const measureEl = document.querySelector('.product-measurements span:last-child');
    if (measureEl) {
        measureEl.textContent = productData.measurements || 'See description';
    }
    
    // Update rating
    updateRating(productData.rating || 5);
}

function updateRating(rating) {
    const starsContainer = document.querySelector('.rating-stars');
    if (!starsContainer) return;
    
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        const filled = i < rating;
        starsHTML += `<svg class="star-icon" width="16" height="16" viewBox="0 0 16 16" fill="${filled ? '#C9A164' : 'none'}">
            <path d="M8 1L10.06 5.52L15 6.23L11.5 9.63L12.36 14.57L8 12.27L3.64 14.57L4.5 9.63L1 6.23L5.94 5.52L8 1Z" 
                  stroke="#C9A164" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
    starsContainer.innerHTML = starsHTML;
}

// ========================================
// IMAGE GALLERY
// ========================================

function updateGallery() {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailContainer = document.querySelector('.thumbnail-grid');
    
    // Get images array
    const images = productData.images && productData.images.length > 0 
        ? productData.images 
        : [productData.image || 'images/avatar-placeholder.png'];
    
    // Set main image
    if (mainImage) {
        mainImage.src = images[0];
        mainImage.alt = productData.name;
        mainImage.onerror = function() {
            this.src = 'images/avatar-placeholder.png';
        };
    }
    
    // Generate thumbnails
    if (thumbnailContainer && images.length > 1) {
        thumbnailContainer.innerHTML = images.map((img, index) => `
            <button class="thumbnail ${index === 0 ? 'active' : ''}" onclick="setMainImage(${index})">
                <img src="${img}" alt="${productData.name} - Image ${index + 1}" 
                     onerror="this.src='images/avatar-placeholder.png'">
            </button>
        `).join('');
    } else if (thumbnailContainer) {
        thumbnailContainer.innerHTML = '';
    }
    
    // Update badges
    const badgesContainer = document.querySelector('.main-image-container .product-badges');
    if (badgesContainer) {
        let badgesHTML = '';
        if (productData.badges && productData.badges.includes('new')) {
            badgesHTML += '<span class="badge badge-new">NEW</span>';
        }
        if (productData.badges && productData.badges.includes('sale')) {
            badgesHTML += '<span class="badge badge-sale">SALE</span>';
        }
        badgesContainer.innerHTML = badgesHTML;
    }
    
    // Store images for navigation
    productData.galleryImages = images;
}

function setMainImage(index) {
    currentImageIndex = index;
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const images = productData.galleryImages || productData.images || [productData.image];
    
    if (mainImage && images[index]) {
        mainImage.src = images[index];
    }
    
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function nextImage() {
    const images = productData.galleryImages || productData.images || [productData.image];
    currentImageIndex = (currentImageIndex + 1) % images.length;
    setMainImage(currentImageIndex);
}

function prevImage() {
    const images = productData.galleryImages || productData.images || [productData.image];
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    setMainImage(currentImageIndex);
}

// ========================================
// COLOR VARIANTS
// ========================================

function updateColorVariants() {
    const colorSection = document.querySelector('.color-selector') || document.getElementById('colorSelector');
    
    if (!colorSection) return;
    
    if (colorVariants.length === 0) {
        // No color variants available
        colorSection.innerHTML = `
            <div class="color-label">
                <span class="label-text">Choose Color</span>
                <span class="selected-color">None</span>
            </div>
        `;
        return;
    }
    
    // Build color swatches including current product
    const allColors = [productData, ...colorVariants];
    
    colorSection.innerHTML = `
        <div class="color-label">
            <span class="label-text">Choose Color</span>
            <span class="selected-color">${productData.color || 'Default'}</span>
        </div>
        <div class="color-swatches">
            ${allColors.map((variant, index) => `
                <button class="color-swatch ${variant.id === productData.id ? 'active' : ''}" 
                        data-color="${variant.color || 'Default'}"
                        data-product-id="${variant.id}"
                        onclick="switchColorVariant(${variant.id})"
                        title="${variant.color || 'Default'}">
                    <img src="${variant.image || variant.images?.[0] || 'images/avatar-placeholder.png'}" 
                         alt="${variant.color || 'Default'}"
                         onerror="this.src='images/avatar-placeholder.png'">
                </button>
            `).join('')}
        </div>
    `;
}

function switchColorVariant(productId) {
    const variant = allProducts.find(p => p.id === productId);
    if (variant) {
        // Update sessionStorage and navigate
        sessionStorage.setItem('currentProduct', JSON.stringify(variant));
        window.location.href = `product.html?id=${variant.id}&sku=${encodeURIComponent(variant.sku || '')}`;
    }
}

// ========================================
// HIDE OFFER/TIMER SECTION
// ========================================

function hideOfferSection() {
    const offerSection = document.querySelector('.offer-section');
    const timerSection = document.querySelector('.countdown-timer');
    const offerLabel = document.querySelector('.offer-expires');
    
    if (offerSection) offerSection.style.display = 'none';
    if (timerSection) timerSection.style.display = 'none';
    if (offerLabel) offerLabel.style.display = 'none';
    
    // Remove reviews section
    const reviewsTab = document.querySelector('[data-tab="reviews"]');
    const reviewsContent = document.getElementById('reviewsContent');
    if (reviewsTab) reviewsTab.style.display = 'none';
    if (reviewsContent) reviewsContent.style.display = 'none';
}

// ========================================
// QUANTITY SELECTOR
// ========================================

function increaseQty() {
    const inventory = getProductInventory();
    
    // If inventory is 0, don't allow any changes
    if (inventory === 0) return;
    
    // Don't exceed available inventory
    if (inventory > 0 && quantity >= inventory) {
        showNotification(`Only ${inventory} in stock`, 'error');
        return;
    }
    
    quantity++;
    updateQuantityDisplay();
}

function decreaseQty() {
    const inventory = getProductInventory();
    
    // If inventory is 0, don't allow any changes
    if (inventory === 0) return;
    
    if (quantity > 1) {
        quantity--;
        updateQuantityDisplay();
    }
}

function getProductInventory() {
    if (!productData) return -1; // -1 means unlimited
    
    // Check for inventory/stock property
    if (typeof productData.inventory === 'number') return productData.inventory;
    if (typeof productData.stock === 'number') return productData.stock;
    
    return -1; // -1 means unlimited (no inventory tracking)
}

function updateQuantityDisplay() {
    const qtyElement = document.getElementById('qtyValue');
    if (qtyElement) {
        qtyElement.textContent = quantity;
    }
    updateQuantityButtonStates();
}

function updateQuantityButtonStates() {
    const inventory = getProductInventory();
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const makeInquiryBtn = document.getElementById('makeInquiryBtn');
    
    // If inventory is 0, disable everything
    if (inventory === 0) {
        if (minusBtn) {
            minusBtn.disabled = true;
            minusBtn.style.opacity = '0.3';
            minusBtn.style.cursor = 'not-allowed';
        }
        if (plusBtn) {
            plusBtn.disabled = true;
            plusBtn.style.opacity = '0.3';
            plusBtn.style.cursor = 'not-allowed';
        }
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.style.opacity = '0.5';
            addToCartBtn.style.cursor = 'not-allowed';
        }
        return;
    }
    
    // Enable minus if quantity > 1
    if (minusBtn) {
        if (quantity <= 1) {
            minusBtn.disabled = true;
            minusBtn.style.opacity = '0.3';
        } else {
            minusBtn.disabled = false;
            minusBtn.style.opacity = '1';
            minusBtn.style.cursor = 'pointer';
        }
    }
    
    // Enable/disable plus based on inventory
    if (plusBtn) {
        if (inventory > 0 && quantity >= inventory) {
            plusBtn.disabled = true;
            plusBtn.style.opacity = '0.3';
            plusBtn.style.cursor = 'not-allowed';
        } else {
            plusBtn.disabled = false;
            plusBtn.style.opacity = '1';
            plusBtn.style.cursor = 'pointer';
        }
    }
}

// ========================================
// ADD TO CART
// ========================================

function addProductToCartFromPage() {
    if (!productData) return;
    
    // Check exclusive mode - if inquiry has items, block cart
    if (typeof canAddToCart === 'function' && !canAddToCart()) {
        if (typeof showNotification === 'function') {
            showNotification('You have to Submit an Inquiry before adding a purchase item.', 'error');
        } else {
            alert('You have to Submit an Inquiry before adding a purchase item.');
        }
        return;
    }
    
    if (productData.price === 0) {
        // Redirect to inquiry page for $0 price items
        window.location.href = `contact.html?product=${encodeURIComponent(productData.name)}`;
        return;
    }
    
    // Use the cart.js addToCart function if available
    if (typeof addToCart === 'function') {
        addToCart({
            id: productData.id || productData.sku,
            sku: productData.sku,
            name: productData.name,
            price: productData.price,
            quantity: quantity,
            image: productData.image || productData.images?.[0] || 'images/avatar-placeholder.png',
            color: productData.color || 'Default',
            brand: productData.brand || 'Rose Bud Global'
        });
    } else {
        // Fallback: direct localStorage manipulation (also check exclusive mode)
        const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
        if (inquiryCart.length > 0) {
            alert('You have to Submit an Inquiry before adding a purchase item.');
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
        
        const existingIndex = cart.findIndex(item => 
            (item.sku === productData.sku) || (item.id === productData.id)
        );
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: productData.id || productData.sku,
                sku: productData.sku,
                name: productData.name,
                price: parseFloat(productData.price) || 0,
                quantity: quantity,
                image: productData.image || productData.images?.[0] || 'images/avatar-placeholder.png',
                color: productData.color || 'Default',
                brand: productData.brand || 'Rose Bud Global'
            });
        }
        
        localStorage.setItem('rosebudCart', JSON.stringify(cart));
        updateProductCartCount();
        showAddedToCartFeedback();
    }
}

function updateProductCartCount() {
    const cart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        // Hide badge when cart is empty (0 items)
        cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function showAddedToCartFeedback() {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Added ${quantity} item(s) to cart</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// WISHLIST
// ========================================

function toggleWishlist() {
    if (!productData) return;
    
    let wishlist = JSON.parse(localStorage.getItem('rosebudWishlist') || '[]');
    
    const index = wishlist.indexOf(productData.id);
    const wishlistBtn = document.querySelector('.wishlist-product-btn');
    
    if (index > -1) {
        wishlist.splice(index, 1);
        if (wishlistBtn) wishlistBtn.classList.remove('active');
    } else {
        wishlist.push(productData.id);
        if (wishlistBtn) wishlistBtn.classList.add('active');
    }
    
    localStorage.setItem('rosebudWishlist', JSON.stringify(wishlist));
}

// ========================================
// TABS (Info Only - Reviews Hidden)
// ========================================

function switchTab(tabId) {
    // Only show info/additional info tabs
    if (tabId === 'reviews') return;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Content`);
    });
}

// ========================================
// GLOBAL EXPORTS
// ========================================

window.setMainImage = setMainImage;
window.nextImage = nextImage;
window.prevImage = prevImage;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.switchTab = switchTab;
window.switchColorVariant = switchColorVariant;
window.addProductToCartFromPage = addProductToCartFromPage;
window.addToInquiryCart = addToInquiryCart;

// Wishlist with auth gate for product page
function toggleProductWishlist() {
    const isLoggedIn = localStorage.getItem('rosebudLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // Show notification popup instead of modal
        showWishlistAuthNotification();
        return;
    }
    
    if (!productData) return;
    
    // Store full product data in wishlist (not just ID)
    let wishlist = JSON.parse(localStorage.getItem('rosebudWishlist') || '[]');
    const existingIndex = wishlist.findIndex(item => item.id === productData.id || item.sku === productData.sku);
    const wishlistIcon = document.getElementById('wishlistIcon');
    const wishlistPath = wishlistIcon?.querySelector('path');
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        if (wishlistPath) {
            wishlistPath.setAttribute('fill', 'none');
            wishlistPath.setAttribute('stroke', '#D63585');
        }
        showWishlistToast('Removed from wishlist');
    } else {
        // Store full product data for account-wishlist.html
        wishlist.push({
            id: productData.id,
            sku: productData.sku,
            name: productData.name,
            price: productData.price,
            image: productData.image || productData.images?.[0] || 'images/avatar-placeholder.png',
            category: productData.category
        });
        if (wishlistPath) {
            wishlistPath.setAttribute('fill', '#D63585');
            wishlistPath.setAttribute('stroke', '#D63585');
        }
        showWishlistToast('Added to wishlist! View in My Account.');
    }
    
    localStorage.setItem('rosebudWishlist', JSON.stringify(wishlist));
}

// Simple notification popup for wishlist auth requirement
function showWishlistAuthNotification() {
    const existingNotification = document.getElementById('wishlistAuthNotification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.id = 'wishlistAuthNotification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #D63585;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(214, 53, 133, 0.3);
        font-family: 'Inter', sans-serif;
        max-width: 320px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0; margin-top: 2px;">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="white"/>
            </svg>
            <div>
                <div style="font-weight: 600; margin-bottom: 4px;">Sign In Required</div>
                <div style="font-size: 14px; opacity: 0.9;">Please <a href="signin.html" style="color: white; text-decoration: underline; font-weight: 600;">sign in</a> to add items to your wishlist.</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; margin-left: 8px;">×</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function showWishlistAuthModal() {
    const existingModal = document.getElementById('wishlistAuthModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'wishlistAuthModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            text-align: center;
            margin: 20px;
        ">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px;">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#D63585"/>
            </svg>
            <h3 style="font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 600; color: #141718; margin-bottom: 12px;">Sign Up Required</h3>
            <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: #6C7275; line-height: 1.6; margin-bottom: 24px;">
                You must be signed-up to add this item to your wishlist. 
                <a href="signup.html" style="color: #D63585; text-decoration: underline; font-weight: 500;">Sign-up Now</a>
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="document.getElementById('wishlistAuthModal').remove()" style="
                    padding: 12px 24px;
                    border: 1px solid #E8ECEF;
                    background: white;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    cursor: pointer;
                ">Cancel</button>
                <a href="signup.html" style="
                    padding: 12px 24px;
                    background: #D63585;
                    color: white;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    text-decoration: none;
                ">Sign Up</a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}

function showWishlistToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #D63585;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

window.toggleProductWishlist = toggleProductWishlist;
