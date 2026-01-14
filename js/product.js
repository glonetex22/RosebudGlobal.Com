/**
 * RoseBud Global - Product Page JavaScript v2.7
 * Dynamic product loading from shop data
 */

console.log('=== PRODUCT.JS LOADED ===');

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
    
    // Delayed fallback to ensure product is loaded
    setTimeout(function() {
        console.log('[RoseBud] Delayed updateAddToCartVisibility check');
        if (typeof productData !== 'undefined' && productData) {
            updateAddToCartVisibility();
        }
    }, 1000);
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
    
    // Load product reviews
    if (typeof loadProductReviews === 'function') {
        loadProductReviews();
    }
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
    const cartCategories = ['sale', 'sale items', 'household', 'household items'];
    
    // Check category
    if (cartCategories.some(c => cat.includes(c) || cat === c)) return 'CART';
    
    // These categories get "Make an Inquiry" button (blue)
    const inquiryCategories = ['custom gift', 'home decor', 'decor', 'accessories', 'specialty', 'wholesale', 'custom'];
    if (inquiryCategories.some(c => cat.includes(c))) return 'INQUIRY';
    
    return 'CART'; // Default for everything else
}

// ========================================
// BUTTON VISIBILITY - Add to Cart vs Make an Inquiry
// ========================================

function updateAddToCartVisibility() {
  console.log('[RoseBud] updateAddToCartVisibility() called');
  
  const actionContainer = document.getElementById('productActionButtons');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const makeInquiryBtn = document.getElementById('makeInquiryBtn');
  
  // Debug: Log what we found
  console.log('[RoseBud] actionContainer:', actionContainer);
  console.log('[RoseBud] addToCartBtn:', addToCartBtn);
  console.log('[RoseBud] makeInquiryBtn:', makeInquiryBtn);
  
  if (!actionContainer) {
    console.error('[RoseBud] ERROR: #productActionButtons container not found!');
    return;
  }
  
  if (!addToCartBtn) {
    console.error('[RoseBud] ERROR: #addToCartBtn not found!');
    return;
  }
  
  if (!makeInquiryBtn) {
    console.error('[RoseBud] ERROR: #makeInquiryBtn not found!');
    return;
  }
  
  // Get category from productData
  let category = '';
  if (typeof productData !== 'undefined' && productData && productData.category) {
    category = productData.category.toLowerCase().trim();
  }
  
  console.log('[RoseBud] Product category:', category);
  
  // Define category mappings
  const INQUIRY_CATEGORIES = [
    'custom gift',
    'custom gifts', 
    'custom gift items',
    'home decor',
    'home decor & accessories',
    'decor',
    'accessories',
    'specialty',
    'specialty items',
    'wholesale',
    'wholesale items'
  ];
  
  const CART_CATEGORIES = [
    'sale',
    'sale items',
    'household',
    'household items'
  ];
  
  // Check which type this product is
  let showInquiry = false;
  
  for (let i = 0; i < INQUIRY_CATEGORIES.length; i++) {
    if (category.includes(INQUIRY_CATEGORIES[i]) || category === INQUIRY_CATEGORIES[i]) {
      showInquiry = true;
      break;
    }
  }
  
  // If it's explicitly a cart category, override
  for (let i = 0; i < CART_CATEGORIES.length; i++) {
    if (category.includes(CART_CATEGORIES[i]) || category === CART_CATEGORIES[i]) {
      showInquiry = false;
      break;
    }
  }
  
  console.log('[RoseBud] Show inquiry button:', showInquiry);
  
  // Apply the correct mode
  if (showInquiry) {
    actionContainer.classList.add('inquiry-mode');
    addToCartBtn.style.display = 'none';
    makeInquiryBtn.style.display = 'block';
    console.log('[RoseBud] Showing: Make an Inquiry (blue)');
  } else {
    actionContainer.classList.remove('inquiry-mode');
    addToCartBtn.style.display = 'block';
    makeInquiryBtn.style.display = 'none';
    console.log('[RoseBud] Showing: Add to Cart (pink)');
  }
}

// Add product to Inquiry Cart (with exclusive mode check)
// Item can ONLY be added ONCE - if already in cart, show notification
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
    
    if (!productData) return;
    
    // Get existing inquiry cart
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    // Check if product already in inquiry cart - ONLY ALLOW ONE
    const alreadyExists = inquiryCart.some(item => item.sku === productData.sku || item.id === productData.id);
    
    if (alreadyExists) {
        // Show notification that item is already in cart
        showAlreadyInCartNotification();
        return;
    }
    
    // Get quantity
    const qty = parseInt(document.getElementById('qtyValue')?.textContent) || 1;
    
    // Add new item (only once)
    const inquiryItem = {
        id: productData.sku || productData.id,
        name: productData.name,
        sku: productData.sku,
        price: parseFloat(productData.price) || 0,
        image: productData.image || productData.images?.[0] || 'images/avatar-placeholder.png',
        category: productData.category,
        description: productData.description || 'Premium quality product from RoseBud Global.',
        quantity: qty
    };
    
    inquiryCart.push(inquiryItem);
    
    // Save to localStorage
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    
    // Update cart count - this updates the header cart badge
    if (typeof updateCartCount === 'function') updateCartCount();
    
    // Also update cart UI for home page
    if (typeof updateCartUI === 'function') updateCartUI();
    
    // Render sidebar cart
    if (typeof renderSidebarCart === 'function') renderSidebarCart();
    
    // Open cart sidebar popup
    if (typeof toggleCart === 'function') {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && !sidebar.classList.contains('open')) {
            toggleCart();
        }
    }
    
    // Show notification
    showInquiryAddedNotification(productData.name, qty);
}

// ========================================
// MAKE AN INQUIRY - Handler
// ========================================

function handleMakeInquiry() {
  console.log('[RoseBud] handleMakeInquiry() called');
  
  // Check if productData exists
  if (typeof productData === 'undefined' || !productData) {
    console.error('[RoseBud] ERROR: productData is not defined');
    alert('Unable to add item. Please refresh the page and try again.');
    return;
  }
  
  // Get quantity
  const qtyElement = document.getElementById('qtyValue');
  let quantity = 1;
  if (qtyElement) {
    quantity = parseInt(qtyElement.textContent || qtyElement.innerText) || 1;
  }
  
  // Build inquiry item object
  const inquiryItem = {
    id: productData.id || productData.sku || 'item-' + Date.now(),
    sku: productData.sku || '',
    name: productData.name || 'Product',
    price: parseFloat(productData.price) || 0,
    image: productData.image || (productData.images && productData.images[0]) || 'images/avatar-placeholder.png',
    description: productData.description || productData.shortDescription || '',
    category: productData.category || '',
    brand: productData.brand || '',
    color: productData.color || '',
    quantity: quantity,
    dateAdded: new Date().toISOString()
  };
  
  console.log('[RoseBud] Inquiry item created:', inquiryItem);
  
  // Get current inquiry cart from localStorage
  let inquiryCart = [];
  try {
    const stored = localStorage.getItem('rosebudInquiryCart');
    if (stored) {
      inquiryCart = JSON.parse(stored);
      if (!Array.isArray(inquiryCart)) {
        inquiryCart = [];
      }
    }
  } catch (e) {
    console.warn('[RoseBud] Error parsing inquiry cart:', e);
    inquiryCart = [];
  }
  
  // Check if item already in cart
  const existingIndex = inquiryCart.findIndex(function(item) {
    return item.sku === inquiryItem.sku || item.id === inquiryItem.id;
  });
  
  if (existingIndex !== -1) {
    // Update existing
    inquiryCart[existingIndex] = inquiryItem;
    console.log('[RoseBud] Updated existing inquiry item');
  } else {
    // Add new
    inquiryCart.push(inquiryItem);
    console.log('[RoseBud] Added new inquiry item');
  }
  
  // Save back to localStorage
  localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
  console.log('[RoseBud] Inquiry cart saved. Total items:', inquiryCart.length);
  
  // Update header cart count if function exists
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }
  
  // Show notification if function exists
  if (typeof showNotification === 'function') {
    showNotification(inquiryItem.name + ' added to inquiry!', 'success');
  }
  
  // Navigate to contact page with inquiry form section
  console.log('[RoseBud] Navigating to contact.html#inquiry-form');
  window.location.href = 'contact.html#inquiry-form';
}

// Show notification when item already in cart
function showAlreadyInCartNotification() {
    const existingNotification = document.querySelector('.already-in-cart-notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = 'already-in-cart-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #F59E0B;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
        font-family: 'Inter', sans-serif;
        max-width: 320px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span style="font-weight: 500;">Item already added to the cart</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
    
    // CRITICAL: Get images array - check multiple possible fields
    const productImage = productData.image || 
                         productData.images?.[0] || 
                         productData.thumbnail ||
                         productData.img ||
                         'images/avatar-placeholder.png';
    
    const images = productData.images && productData.images.length > 0 
        ? productData.images 
        : [productImage];
    
    console.log('[RoseBud] updateGallery - Product:', productData.name);
    console.log('[RoseBud] updateGallery - Image:', productImage);
    console.log('[RoseBud] updateGallery - Images array:', images);
    
    // Set main image
    if (mainImage) {
        mainImage.src = images[0];
        mainImage.alt = productData.name || 'Product';
        mainImage.onerror = function() {
            console.warn('[RoseBud] Main image failed to load:', images[0]);
            this.src = 'images/avatar-placeholder.png';
        };
        console.log('[RoseBud] Main image set to:', images[0]);
    } else {
        console.warn('[RoseBud] Main image element not found');
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
    
    // Reviews tab is now always visible - no longer hidden
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
    console.log('[RoseBud] addProductToCartFromPage() called');
    
    if (!productData) {
        console.error('[RoseBud] No product data available');
        return;
    }
    
    // Check exclusive mode - if inquiry has items, block cart
    if (typeof canAddToCart === 'function' && !canAddToCart()) {
        if (typeof showNotification === 'function') {
            showNotification('You have to Submit an Inquiry before adding a purchase item.', 'error');
        } else {
            alert('You have to Submit an Inquiry before adding a purchase item.');
        }
        return;
    }
    
    // Get quantity from selector
    const qtyEl = document.getElementById('qtyValue');
    const qty = parseInt(qtyEl ? (qtyEl.textContent || qtyEl.innerText) : 1) || 1;
    
    // IMPORTANT: Get the product image
    const productImage = productData.image || 
                         (productData.images && productData.images[0]) || 
                         document.getElementById('mainProductImage')?.src ||
                         'images/avatar-placeholder.png';
    
    console.log('[RoseBud] Product image:', productImage);
    
    // Build cart item with image
    const cartItem = {
        id: productData.id || productData.sku || 'item-' + Date.now(),
        sku: productData.sku || '',
        name: productData.name || 'Product',
        price: parseFloat(productData.price) || 0,
        image: productImage,  // <-- IMAGE MUST BE INCLUDED
        quantity: qty,
        color: productData.color || 'Default',
        category: productData.category || '',
        brand: productData.brand || 'Rose Bud Global',
        location: productData.location || 'USA'
    };
    
    console.log('[RoseBud] Adding to cart:', cartItem);
    console.log('[RoseBud] Cart item image URL:', cartItem.image);
    
    // Use the cart.js addToCart function if available
    if (typeof addToCart === 'function') {
        addToCart(cartItem);
    } else {
        // Fallback: direct localStorage manipulation
        const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
        if (inquiryCart.length > 0) {
            alert('You have to Submit an Inquiry before adding a purchase item.');
            return;
        }
        
        // Check location - prevent Nigerian items from being added to cart
        const location = (productData.location || 'USA').toUpperCase();
        if (location === 'NG' || location === 'NIGERIA') {
            if (typeof showNotification === 'function') {
                showNotification('This item is not available for purchase in the USA. Please contact us for availability.', 'error');
            } else {
                alert('This item is not available for purchase in the USA. Please contact us for availability.');
            }
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
        
        const existingIndex = cart.findIndex(item => 
            (item.sku === productData.sku) || (item.id === productData.id)
        );
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += qty;
        } else {
            cart.push({
                id: productData.id || productData.sku,
                sku: productData.sku,
                name: productData.name,
                price: parseFloat(productData.price) || 0,
                quantity: qty,
                image: productData.image || productData.images?.[0] || 'images/avatar-placeholder.png',
                color: productData.color || 'Default',
                brand: productData.brand || 'Rose Bud Global',
                category: productData.category || '',
                location: productData.location || 'USA'
            });
        }
        
        localStorage.setItem('rosebudCart', JSON.stringify(cart));
        localStorage.setItem('rosebudCartTimestamp', Date.now().toString());
        
        // Update cart count
        updateProductCartCount();
        
        // Update cart UI
        if (typeof updateCartUI === 'function') updateCartUI();
        
        // Open sidebar
        if (typeof toggleCart === 'function') {
            const sidebar = document.getElementById('cartSidebar');
            if (sidebar && !sidebar.classList.contains('open')) {
                toggleCart();
            }
        }
        
        // Show feedback
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
// TABS - All tabs visible (Additional Info, Questions, Reviews)
// ========================================

function switchTab(tabId) {
    console.log('[RoseBud] Switching to tab:', tabId);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show the selected tab content
    let contentId;
    if (tabId === 'additional') {
        contentId = 'additionalContent';
    } else if (tabId === 'questions') {
        contentId = 'questionsContent';
    } else if (tabId === 'reviews') {
        contentId = 'tab-reviews';
    }
    
    if (contentId) {
        const activeContent = document.getElementById(contentId);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }
    
    // If switching to reviews tab, load reviews
    if (tabId === 'reviews' && typeof loadProductReviews === 'function') {
        loadProductReviews();
    }
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
window.handleMakeInquiry = handleMakeInquiry;
window.updateAddToCartVisibility = updateAddToCartVisibility;

// Wishlist with auth gate for product page
function toggleProductWishlist() {
    const isLoggedIn = localStorage.getItem('rosebudLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // Show popup modal for sign-in requirement
        showWishlistAuthPopup();
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
        if (typeof showWishlistToast === 'function') {
            showWishlistToast('Removed from wishlist');
        }
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
        if (typeof showWishlistToast === 'function') {
            showWishlistToast('Added to wishlist! View in My Account.');
        }
    }
    
    localStorage.setItem('rosebudWishlist', JSON.stringify(wishlist));
}

// Popup modal for wishlist sign-in requirement
function showWishlistAuthPopup() {
    const existingPopup = document.getElementById('wishlistAuthPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'wishlistAuthPopup';
    popup.className = 'wishlist-auth-popup';
    popup.innerHTML = `
        <div class="wishlist-auth-popup-overlay"></div>
        <div class="wishlist-auth-popup-content">
            <button class="wishlist-auth-popup-close" onclick="closeWishlistAuthPopup()">×</button>
            <div class="wishlist-auth-popup-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#D63585"/>
                </svg>
            </div>
            <h3 class="wishlist-auth-popup-title">Sign-in to add to Wishlist</h3>
            <p class="wishlist-auth-popup-message">Please sign in to add items to your wishlist.</p>
            <div class="wishlist-auth-popup-actions">
                <button class="wishlist-auth-popup-cancel" onclick="closeWishlistAuthPopup()">Cancel</button>
                <a href="signin.html" class="wishlist-auth-popup-signin">Sign In</a>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    
    // Close on overlay click
    popup.querySelector('.wishlist-auth-popup-overlay').addEventListener('click', closeWishlistAuthPopup);
    
    // Close on Escape key
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            closeWishlistAuthPopup();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeWishlistAuthPopup() {
    const popup = document.getElementById('wishlistAuthPopup');
    if (popup) {
        popup.classList.add('closing');
        setTimeout(() => popup.remove(), 300);
    }
}

// Simple notification popup for wishlist auth requirement (legacy - kept for compatibility)
function showWishlistAuthNotification() {
    showWishlistAuthPopup();
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

// ========================================
// FAQ TOGGLE
// ========================================
function toggleFaq(element) {
    const faqItem = element.closest('.faq-item');
    if (faqItem) {
        faqItem.classList.toggle('open');
    }
}

window.toggleFaq = toggleFaq;
window.showWishlistAuthNotification = showWishlistAuthNotification;
// ========================================
// EXPORTS - Make functions globally accessible
// ========================================
window.updateAddToCartVisibility = updateAddToCartVisibility;
window.handleMakeInquiry = handleMakeInquiry;
window.addProductToCartFromPage = addProductToCartFromPage;
window.toggleProductWishlist = toggleProductWishlist;
window.showWishlistAuthPopup = showWishlistAuthPopup;
window.closeWishlistAuthPopup = closeWishlistAuthPopup;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;

console.log('[RoseBud] product.js functions exported to window');

// ========================================
// REVIEWS SYSTEM
// ========================================

/**
 * Load and display reviews for the current product
 * Anyone can VIEW reviews, but only verified purchasers can SUBMIT
 */
function loadProductReviews() {
  console.log('[RoseBud] loadProductReviews() called');
  
  const reviewsList = document.getElementById('reviewsList');
  const avgRatingEl = document.getElementById('avgRating');
  const totalReviewsEl = document.getElementById('totalReviews');
  const avgStarsEl = document.getElementById('avgStars');
  
  if (!reviewsList) {
    console.error('[RoseBud] Reviews list container not found');
    return;
  }
  
  if (!productData) {
    console.warn('[RoseBud] No product data available for reviews');
    reviewsList.innerHTML = '<p class="no-reviews-message">No Reviews for this Product</p>';
    return;
  }
  
  // Get all reviews from localStorage
  let allReviews = [];
  try {
    const stored = localStorage.getItem('rosebudProductReviews');
    if (stored) {
      allReviews = JSON.parse(stored);
      if (!Array.isArray(allReviews)) {
        allReviews = [];
      }
    }
  } catch (e) {
    console.warn('[RoseBud] Error parsing reviews:', e);
    allReviews = [];
  }
  
  // Filter reviews for THIS product only
  const productReviews = allReviews.filter(function(review) {
    return review.productSku === productData.sku || 
           review.productId === productData.id ||
           review.productSku === productData.id;
  });
  
  console.log('[RoseBud] Found', productReviews.length, 'reviews for product:', productData.sku);
  
  // Calculate average rating
  let avgRating = 0;
  if (productReviews.length > 0) {
    const totalRating = productReviews.reduce(function(sum, review) {
      return sum + (parseFloat(review.rating) || 0);
    }, 0);
    avgRating = (totalRating / productReviews.length).toFixed(1);
  }
  
  // Update rating display
  if (avgRatingEl) {
    avgRatingEl.textContent = avgRating;
  }
  
  // Update total reviews count
  if (totalReviewsEl) {
    totalReviewsEl.textContent = productReviews.length + (productReviews.length === 1 ? ' Review' : ' Reviews');
  }
  
  // Update stars display
  if (avgStarsEl) {
    const fullStars = Math.round(parseFloat(avgRating));
    const starElements = avgStarsEl.querySelectorAll('.star');
    starElements.forEach(function(star, index) {
      if (index < fullStars) {
        star.textContent = '★';
        star.classList.add('filled');
      } else {
        star.textContent = '☆';
        star.classList.remove('filled');
      }
    });
  }
  
  // Display reviews or "No Reviews" message
  if (productReviews.length === 0) {
    // NO REVIEWS - Show message
    reviewsList.innerHTML = '<p class="no-reviews-message">No Reviews for this Product</p>';
    console.log('[RoseBud] No reviews - showing empty message');
  } else {
    // HAS REVIEWS - Display them
    let reviewsHTML = '';
    
    // Sort by date (newest first)
    productReviews.sort(function(a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    
    productReviews.forEach(function(review, index) {
      const rating = parseInt(review.rating) || 0;
      const filledStars = '★'.repeat(rating);
      const emptyStars = '☆'.repeat(5 - rating);
      const starsDisplay = filledStars + emptyStars;
      
      const reviewDate = formatReviewDate(review.date);
      const avatarSrc = review.userAvatar || review.avatar || 'images/avatar-placeholder.png';
      const userName = review.userName || review.name || 'Verified Buyer';
      const reviewText = review.text || review.comment || review.review || '';
      
      reviewsHTML += `
        <div class="review-item" data-review-index="${index}">
          <div class="review-header">
            <img 
              src="${avatarSrc}" 
              alt="${userName}" 
              class="reviewer-avatar"
              onerror="this.src='images/avatar-placeholder.png'"
            >
            <div class="reviewer-info">
              <span class="reviewer-name">${escapeHTML(userName)}</span>
              <div class="review-rating">
                <span class="review-stars">${starsDisplay}</span>
              </div>
              <span class="review-date">${reviewDate}</span>
            </div>
          </div>
          <p class="review-text">${escapeHTML(reviewText)}</p>
        </div>
      `;
    });
    
    reviewsList.innerHTML = reviewsHTML;
    console.log('[RoseBud] Displayed', productReviews.length, 'reviews');
  }
}

/**
 * Format date for display
 */
function formatReviewDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Handle Write Review button click
 * Only verified purchasers can submit reviews
 */
function handleWriteReview() {
  console.log('[RoseBud] handleWriteReview() called');
  
  // Check 1: User must be logged in
  const isLoggedIn = localStorage.getItem('rosebudLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    showReviewAuthPopup('Please sign in to write a review.', 'signin');
    return;
  }
  
  // Check 2: User must have purchased this product
  if (!hasUserPurchasedProduct()) {
    showReviewAuthPopup('You can only review products you have purchased.', 'purchase');
    return;
  }
  
  // User is logged in AND has purchased - show review form
  showReviewForm();
}

/**
 * Check if current user has purchased the current product
 */
function hasUserPurchasedProduct() {
  if (!productData) return false;
  
  // Get user's orders from localStorage
  let orders = [];
  try {
    const stored = localStorage.getItem('rosebudOrders');
    if (stored) {
      orders = JSON.parse(stored);
      if (!Array.isArray(orders)) orders = [];
    }
  } catch (e) {
    orders = [];
  }
  
  // Check if any order contains this product AND is paid/completed
  const hasPurchased = orders.some(function(order) {
    // Check order status is paid/completed
    const isPaid = order.status === 'paid' || 
                   order.status === 'completed' || 
                   order.status === 'delivered' ||
                   order.status === 'shipped' ||
                   order.paymentStatus === 'paid' ||
                   order.paymentStatus === 'completed';
    
    if (!isPaid) return false;
    
    // Check if order contains this product
    if (!order.items || !Array.isArray(order.items)) return false;
    
    return order.items.some(function(item) {
      return item.sku === productData.sku || 
             item.id === productData.id ||
             item.productId === productData.id;
    });
  });
  
  console.log('[RoseBud] User has purchased this product:', hasPurchased);
  return hasPurchased;
}

/**
 * Show authentication/purchase required popup
 */
function showReviewAuthPopup(message, type) {
  // Remove existing popup if any
  const existing = document.querySelector('.review-auth-popup-overlay');
  if (existing) existing.remove();
  
  const popup = document.createElement('div');
  popup.className = 'review-auth-popup-overlay';
  
  let actionButton = '';
  if (type === 'signin') {
    actionButton = `<a href="signin.html?redirect=${encodeURIComponent(window.location.href)}" class="popup-btn-primary">Sign In</a>`;
  } else {
    actionButton = `<button class="popup-btn-primary" onclick="this.closest('.review-auth-popup-overlay').remove()">OK</button>`;
  }
  
  popup.innerHTML = `
    <div class="review-auth-popup">
      <button class="popup-close" onclick="this.closest('.review-auth-popup-overlay').remove()">×</button>
      <div class="popup-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#D63585">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3>${type === 'signin' ? 'Sign In Required' : 'Purchase Required'}</h3>
      <p>${message}</p>
      ${actionButton}
    </div>
  `;
  
  document.body.appendChild(popup);
}

/**
 * Show the review submission form
 */
function showReviewForm() {
  // Remove existing form if any
  const existing = document.querySelector('.review-form-overlay');
  if (existing) existing.remove();
  
  // Get user info for pre-filling
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('rosebudUser') || '{}');
  } catch (e) {
    user = {};
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'review-form-overlay';
  overlay.innerHTML = `
    <div class="review-form-modal">
      <button class="modal-close" onclick="this.closest('.review-form-overlay').remove()">×</button>
      
      <h3>Write a Review</h3>
      <p class="product-name">Product: ${escapeHTML(productData.name)}</p>
      
      <div class="form-group">
        <label>Your Rating <span class="required">*</span></label>
        <div class="rating-input" id="ratingInput">
          <span class="rating-star" data-rating="1" onclick="selectRating(1)">☆</span>
          <span class="rating-star" data-rating="2" onclick="selectRating(2)">☆</span>
          <span class="rating-star" data-rating="3" onclick="selectRating(3)">☆</span>
          <span class="rating-star" data-rating="4" onclick="selectRating(4)">☆</span>
          <span class="rating-star" data-rating="5" onclick="selectRating(5)">☆</span>
        </div>
        <input type="hidden" id="selectedRating" value="0">
      </div>
      
      <div class="form-group">
        <label for="reviewTitle">Review Title</label>
        <input type="text" id="reviewTitle" placeholder="Summarize your experience" maxlength="100">
      </div>
      
      <div class="form-group">
        <label for="reviewText">Your Review <span class="required">*</span></label>
        <textarea id="reviewText" rows="5" placeholder="Tell others about your experience with this product..."></textarea>
      </div>
      
      <button type="button" class="submit-review-btn" onclick="submitProductReview()">
        Submit Review
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

/**
 * Handle star rating selection
 */
function selectRating(rating) {
  console.log('[RoseBud] Rating selected:', rating);
  
  document.getElementById('selectedRating').value = rating;
  
  const stars = document.querySelectorAll('.rating-input .rating-star');
  stars.forEach(function(star, index) {
    if (index < rating) {
      star.textContent = '★';
      star.classList.add('selected');
    } else {
      star.textContent = '☆';
      star.classList.remove('selected');
    }
  });
}

/**
 * Submit the review
 */
function submitProductReview() {
  console.log('[RoseBud] submitProductReview() called');
  
  const rating = parseInt(document.getElementById('selectedRating').value) || 0;
  const title = document.getElementById('reviewTitle').value.trim();
  const text = document.getElementById('reviewText').value.trim();
  
  // Validation
  if (rating === 0) {
    alert('Please select a rating (1-5 stars)');
    return;
  }
  
  if (!text) {
    alert('Please write your review');
    return;
  }
  
  // Get user info
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('rosebudUser') || '{}');
  } catch (e) {
    user = {};
  }
  
  // Create review object
  const review = {
    id: 'review-' + Date.now(),
    productSku: productData.sku,
    productId: productData.id,
    productName: productData.name,
    rating: rating,
    title: title,
    text: text,
    userName: user.name || user.displayName || user.email || 'Verified Buyer',
    userAvatar: user.picture || user.avatar || user.photoURL || 'images/avatar-placeholder.png',
    userId: user.id || user.email || 'anonymous',
    date: new Date().toISOString(),
    verified: true
  };
  
  console.log('[RoseBud] Submitting review:', review);
  
  // Get existing reviews
  let reviews = [];
  try {
    const stored = localStorage.getItem('rosebudProductReviews');
    if (stored) {
      reviews = JSON.parse(stored);
      if (!Array.isArray(reviews)) reviews = [];
    }
  } catch (e) {
    reviews = [];
  }
  
  // Add new review
  reviews.push(review);
  
  // Save to localStorage
  localStorage.setItem('rosebudProductReviews', JSON.stringify(reviews));
  console.log('[RoseBud] Review saved. Total reviews:', reviews.length);
  
  // Close the form
  const overlay = document.querySelector('.review-form-overlay');
  if (overlay) overlay.remove();
  
  // Reload reviews display
  loadProductReviews();
  
  // Show success message
  alert('Thank you for your review!');
}

// ========================================
// EXPORTS
// ========================================
window.loadProductReviews = loadProductReviews;
window.handleWriteReview = handleWriteReview;
window.showReviewForm = showReviewForm;
window.selectRating = selectRating;
window.submitProductReview = submitProductReview;
window.formatReviewDate = formatReviewDate;
