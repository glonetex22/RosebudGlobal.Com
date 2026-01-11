/* ========================================
   CART SYSTEM - JavaScript
   Version 4.1.2 - Single Cart with Mode Switching
   ======================================== */

// Build version
const CART_BUILD_VERSION = '4.1.2';

// Cart expiry duration (7 days in milliseconds)
const CART_EXPIRY_DAYS = 7;
const CART_EXPIRY_MS = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Color constants
const PRIMARY_INQUIRY = '#377DFF';
const PRIMARY_CART = '#D63585';

// Cart State - Initialize empty
let cart = [];
let appliedCoupon = null;
let shippingMethod = 'free';

// ========================================
// CART MODE MANAGEMENT (Exclusive modes)
// ========================================

function getCartMode() {
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    const regularCart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
    
    if (inquiryCart.length > 0) return 'inquiry';
    if (regularCart.length > 0) return 'cart';
    return 'none';
}

function canAddToInquiry() {
    const regularCart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
    return regularCart.length === 0;
}

function canAddToCart() {
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    return inquiryCart.length === 0;
}

// ========================================
// BUILD VERSION & EXPIRY CHECKS
// ========================================

function checkBuildVersion() {
    const savedVersion = localStorage.getItem('rosebudBuildVersion');
    if (savedVersion !== CART_BUILD_VERSION) {
        localStorage.setItem('rosebudBuildVersion', CART_BUILD_VERSION);
        console.log('New build detected - keeping cart data');
    }
}

function isCartExpired() {
    const cartTimestamp = localStorage.getItem('rosebudCartTimestamp');
    if (!cartTimestamp) return false;
    
    const timestamp = parseInt(cartTimestamp);
    const now = Date.now();
    
    if (now - timestamp > CART_EXPIRY_MS) {
        console.log('Cart expired after 7 days');
        return true;
    }
    return false;
}

// ========================================
// CART INITIALIZATION
// ========================================

function initCart() {
    checkBuildVersion();
    
    if (isCartExpired()) {
        cart = [];
        localStorage.removeItem('rosebudCart');
        localStorage.removeItem('rosebudCartTimestamp');
        localStorage.removeItem('rosebudCoupon');
        localStorage.removeItem('rosebudInquiryCart');
        return;
    }
    
    try {
        const savedCart = localStorage.getItem('rosebudCart');
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            cart = parsed.filter(item => item && item.name).map(item => ({
                id: item.id || item.sku || 'unknown',
                sku: item.sku || item.id || 'unknown',
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                image: item.image || 'images/avatar-placeholder.png',
                color: item.color || 'Default',
                isCustom: item.isCustom || false,
                category: item.category || '',
                brand: item.brand || ''
            }));
        }
    } catch (e) {
        console.warn('Error loading cart:', e);
        cart = [];
    }
    
    try {
        const savedCoupon = localStorage.getItem('rosebudCoupon');
        if (savedCoupon) {
            appliedCoupon = JSON.parse(savedCoupon);
        }
    } catch (e) {
        appliedCoupon = null;
    }
}

// Available coupons
const coupons = {
    'SAVE10': { discount: 10, type: 'percent' },
    'SAVE20': { discount: 20, type: 'percent' },
    'FLAT25': { discount: 25, type: 'fixed' },
    'WELCOME15': { discount: 15, type: 'percent' }
};

// Shipping costs
const shippingCosts = {
    'free': 0,
    'express': 15,
    'pickup': 21
};

// ========================================
// DOM READY INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initCart();
    updateCartCount();
    renderSidebarCart();
    
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
        checkForCustomItems();
    }
    
    if (document.getElementById('orderItems') || window.location.pathname.includes('checkout.html')) {
        loadCheckoutItems();
        checkInquiryMode();
        setupCheckoutExitWarning();
    }
    
    document.querySelectorAll('.shipping-option').forEach(option => {
        option.addEventListener('change', function() {
            document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
            this.closest('.shipping-option').classList.add('selected');
        });
    });
});

// ========================================
// CHECKOUT EXIT WARNING POPUP
// ========================================

function setupCheckoutExitWarning() {
    const popupHTML = `
        <div id="checkoutExitPopup" class="checkout-exit-popup" style="display: none;">
            <div class="checkout-exit-overlay"></div>
            <div class="checkout-exit-modal">
                <h3>Are you sure you want to exit the screen?</h3>
                <p>Your item may be removed from the cart.</p>
                <div class="checkout-exit-buttons">
                    <button class="exit-btn exit-cancel" onclick="closeCheckoutExitPopup()">Cancel</button>
                    <button class="exit-btn exit-home" onclick="exitToHome()">Home</button>
                    <button class="exit-btn exit-login" onclick="exitToLogin()">Login</button>
                </div>
            </div>
        </div>
    `;
    
    const popupStyles = `
        <style>
            .checkout-exit-popup { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; }
            .checkout-exit-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); }
            .checkout-exit-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 32px; border-radius: 16px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); }
            .checkout-exit-modal h3 { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 600; color: #141718; margin: 0 0 12px 0; }
            .checkout-exit-modal p { font-family: 'Inter', sans-serif; font-size: 14px; color: #6C7275; margin: 0 0 24px 0; }
            .checkout-exit-buttons { display: flex; gap: 12px; justify-content: center; }
            .exit-btn { padding: 12px 24px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: none; }
            .exit-cancel { background: #F3F5F7; color: #141718; }
            .exit-cancel:hover { background: #E8ECEF; }
            .exit-home { background: #D63585; color: white; }
            .exit-home:hover { background: #B82D71; }
            .exit-login { background: #377DFF; color: white; }
            .exit-login:hover { background: #2563EB; }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupStyles + popupHTML);
    
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('checkout') && !href.includes('order-complete') && !href.startsWith('#') && !href.startsWith('javascript')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.pendingNavigation = href;
                showCheckoutExitPopup();
            });
        }
    });
    
    window.addEventListener('beforeunload', function(e) {
        const cartItems = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
        const inquiryItems = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
        if (cartItems.length > 0 || inquiryItems.length > 0) {
            e.preventDefault();
            e.returnValue = 'Your cart items may be lost. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}

function showCheckoutExitPopup() {
    const popup = document.getElementById('checkoutExitPopup');
    if (popup) popup.style.display = 'block';
}

function closeCheckoutExitPopup() {
    const popup = document.getElementById('checkoutExitPopup');
    if (popup) popup.style.display = 'none';
    window.pendingNavigation = null;
}

function exitToHome() {
    closeCheckoutExitPopup();
    window.location.href = 'index.html';
}

function exitToLogin() {
    closeCheckoutExitPopup();
    window.location.href = 'login.html';
}

window.showCheckoutExitPopup = showCheckoutExitPopup;
window.closeCheckoutExitPopup = closeCheckoutExitPopup;
window.exitToHome = exitToHome;
window.exitToLogin = exitToLogin;

// ========================================
// INQUIRY MODE CHECK
// ========================================

function checkInquiryMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const checkoutMode = localStorage.getItem('rosebudCheckoutMode');
    
    if (mode === 'inquiry' || checkoutMode === 'inquiry') {
        const title = document.getElementById('checkoutTitle');
        if (title) title.textContent = 'Order Inquiry';
        
        const banner = document.getElementById('inquiryBanner');
        if (banner) banner.style.display = 'flex';
        
        const paymentSection = document.getElementById('paymentSection');
        if (paymentSection) paymentSection.style.display = 'none';
        
        const orderBtn = document.getElementById('placeOrderBtn');
        if (orderBtn) orderBtn.textContent = 'Submit Inquiry';
    }
}

// ========================================
// CART SIDEBAR TOGGLE
// ========================================

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar || !overlay) return;
    
    const isOpen = sidebar.classList.contains('open');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    
    if (!isOpen) renderSidebarCart();
}

// ========================================
// CART COUNT UPDATE
// ========================================

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
    
    // Combined count from BOTH carts (only one will have items due to blocking)
    const cartTotal = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    const inquiryTotal = inquiryCart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const totalItems = cartTotal + inquiryTotal;
    
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// ========================================
// CLEAR CART
// ========================================

function clearCart() {
    cart = [];
    appliedCoupon = null;
    localStorage.removeItem('rosebudCart');
    localStorage.removeItem('rosebudCoupon');
    updateCartCount();
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
    }
    renderSidebarCart();
}

// ========================================
// SIDEBAR CART RENDERING (Mode Switching)
// ========================================

function renderSidebarCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.querySelector('.cart-sidebar .checkout-btn');
    const cartHeader = document.querySelector('.cart-sidebar .cart-header h3');
    const cartFooter = document.querySelector('.cart-sidebar .cart-footer');
    
    if (!cartItems || document.querySelector('.cart-items-section')) return;
    
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    // ========== INQUIRY MODE ==========
    if (inquiryCart.length > 0) {
        if (cartHeader) cartHeader.textContent = 'Inquiry Cart';
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Make an Inquiry';
            checkoutBtn.style.background = PRIMARY_INQUIRY;
            checkoutBtn.style.boxShadow = '0 4px 12px rgba(55, 125, 255, 0.3)';
            checkoutBtn.onclick = function() { window.location.href = 'contact.html#inquiry-form'; };
        }
        
        // Update footer layout for inquiry mode
        if (cartFooter) {
            const totalLabel = cartFooter.querySelector('.cart-total span:first-child');
            if (totalLabel) totalLabel.textContent = 'Inquiry Cart';
        }
        
        let html = '';
        let total = 0;
        
        inquiryCart.forEach((item, index) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity) || 1;
            total += price * qty;
            
            html += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name || 'Unknown'}</div>
                        <div class="cart-item-sku" style="color: ${PRIMARY_INQUIRY};">${item.sku || ''}</div>
                        <div class="cart-item-price">$${price.toFixed(2)}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateInquirySidebarQty(${index}, -1)">−</button>
                            <span>${qty}</span>
                            <button class="qty-btn" onclick="updateInquirySidebarQty(${index}, 1)">+</button>
                            <span class="cart-item-remove" onclick="removeInquirySidebarItem(${index})">Remove</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = html;
        if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
        return;
    }
    
    // ========== PURCHASE MODE ==========
    if (cartHeader) cartHeader.textContent = 'Shopping Cart';
    if (checkoutBtn) {
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.style.background = PRIMARY_CART;
        checkoutBtn.style.boxShadow = 'none';
        checkoutBtn.onclick = handleCheckout;
    }
    
    // Update footer layout for purchase mode
    if (cartFooter) {
        const totalLabel = cartFooter.querySelector('.cart-total span:first-child');
        if (totalLabel) totalLabel.textContent = 'Total:';
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotalEl) cartTotalEl.textContent = '$0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        total += price * qty;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name || 'Unknown'}</div>
                    <div class="cart-item-sku" style="color: ${PRIMARY_CART};">${item.sku || ''}</div>
                    <div class="cart-item-price">$${price.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateSidebarQty(${index}, -1)">−</button>
                        <span>${qty}</span>
                        <button class="qty-btn" onclick="updateSidebarQty(${index}, 1)">+</button>
                        <span class="cart-item-remove" onclick="removeSidebarItem(${index})">Remove</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
}

// ========================================
// SIDEBAR QUANTITY FUNCTIONS
// ========================================

function updateInquirySidebarQty(index, delta) {
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    if (inquiryCart[index]) {
        inquiryCart[index].quantity = (inquiryCart[index].quantity || 1) + delta;
        if (inquiryCart[index].quantity <= 0) inquiryCart.splice(index, 1);
    }
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    updateCartCount();
    renderSidebarCart();
}

function removeInquirySidebarItem(index) {
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    inquiryCart.splice(index, 1);
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    updateCartCount();
    renderSidebarCart();
}

function updateSidebarQty(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    }
    saveCart();
    updateCartCount();
    renderSidebarCart();
}

function removeSidebarItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderSidebarCart();
}

// ========================================
// CHECKOUT HANDLER
// ========================================

function handleCheckout() {
    // Check localStorage directly, not the global cart variable
    const storedCart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    if (storedCart.length === 0 && inquiryCart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    window.location.href = 'cart.html';
}

// ========================================
// ADD TO CART (with exclusive mode check)
// ========================================

function addToCart(product) {
    if (!canAddToCart()) {
        showNotification('You have to Submit an Inquiry before adding a purchase item.', 'error');
        return false;
    }
    
    const normalizedProduct = {
        id: product.id || product.sku || 'unknown',
        sku: product.sku || product.id || 'unknown',
        name: product.name || 'Unknown Item',
        price: parseFloat(product.price) || 0,
        image: product.image || 'images/avatar-placeholder.png',
        color: product.color || 'Default',
        quantity: parseInt(product.quantity) || 1,
        isCustom: product.isCustom || false,
        category: product.category || '',
        brand: product.brand || ''
    };
    
    const existingItem = cart.find(item => item.id === normalizedProduct.id && item.color === normalizedProduct.color);
    
    if (existingItem) {
        existingItem.quantity += normalizedProduct.quantity;
    } else {
        cart.push(normalizedProduct);
    }
    
    saveCart();
    updateCartCount();
    renderSidebarCart();
    
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('open')) toggleCart();
    
    showNotification(`${normalizedProduct.name} added to cart!`);
    return true;
}

// ========================================
// ADD TO INQUIRY CART (with exclusive mode check)
// ========================================

function addToInquiryCart(product) {
    if (!canAddToInquiry()) {
        showNotification('To make an inquiry, complete your Cart transactions first.', 'error');
        return false;
    }
    
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    const normalizedProduct = {
        id: product.id || product.sku || 'unknown',
        sku: product.sku || product.id || 'unknown',
        name: product.name || 'Unknown Item',
        price: parseFloat(product.price) || 0,
        image: product.image || 'images/avatar-placeholder.png',
        quantity: parseInt(product.quantity) || 1,
        category: product.category || ''
    };
    
    const existingItem = inquiryCart.find(item => item.id === normalizedProduct.id);
    
    if (existingItem) {
        existingItem.quantity += normalizedProduct.quantity;
    } else {
        inquiryCart.push(normalizedProduct);
    }
    
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    updateCartCount();
    renderSidebarCart();
    
    // Do NOT auto-open sidebar - just update badge
    showNotification(`${normalizedProduct.name} added to inquiry!`, 'inquiry');
    return true;
}

// ========================================
// CART PAGE FUNCTIONS
// ========================================

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartPageItems();
    updateCartSummary();
    updateCartCount();
    checkForCustomItems();
}

function updateQuantity(index, delta) {
    const newQty = cart[index].quantity + delta;
    if (newQty <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQty;
        saveCart();
        renderCartPageItems();
        updateCartSummary();
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('rosebudCart', JSON.stringify(cart));
    localStorage.setItem('rosebudCartTimestamp', Date.now().toString());
}

// ========================================
// RENDER CART PAGE ITEMS
// ========================================

function renderCartPageItems() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!container) return;
    
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    // Inquiry items on cart page
    if (inquiryCart.length > 0) {
        if (emptyCart) emptyCart.style.display = 'none';
        
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Make an Inquiry';
            checkoutBtn.style.background = PRIMARY_INQUIRY;
            checkoutBtn.onclick = function(e) { e.preventDefault(); window.location.href = 'contact.html#inquiry-form'; };
            checkoutBtn.removeAttribute('href');
            checkoutBtn.disabled = false;
        }
        
        let html = '';
        inquiryCart.forEach((item, index) => {
            html += `
                <div class="cart-item inquiry-item">
                    <div class="item-product">
                        <div class="item-image">
                            <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                        </div>
                        <div class="item-details">
                            <span class="item-name">${item.name || 'Unknown'}</span>
                            <span class="item-color" style="color: ${PRIMARY_INQUIRY};">Inquiry Item</span>
                            <span class="item-sku">${item.sku || ''}</span>
                            <button class="item-remove" onclick="removeInquiryCartItem(${index})">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                                Remove
                            </button>
                        </div>
                    </div>
                    <div class="item-quantity">
                        <button class="qty-btn" onclick="updateInquiryCartQty(${index}, -1)">−</button>
                        <span class="qty-value">${item.quantity || 1}</span>
                        <button class="qty-btn" onclick="updateInquiryCartQty(${index}, 1)">+</button>
                    </div>
                    <div class="item-price" style="color: ${PRIMARY_INQUIRY};">Inquiry</div>
                    <div class="item-subtotal" style="color: ${PRIMARY_INQUIRY};">—</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        return;
    }
    
    // Regular cart items
    if (cart.length === 0) {
        if (emptyCart) {
            container.innerHTML = '';
            container.appendChild(emptyCart);
            emptyCart.style.display = 'flex';
        }
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutBtn) {
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.style.background = PRIMARY_CART;
        checkoutBtn.onclick = function(e) { e.preventDefault(); proceedToCheckout(); };
        checkoutBtn.removeAttribute('href');
        checkoutBtn.disabled = false;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const subtotal = price * qty;
        
        html += `
            <div class="cart-item${item.isCustom ? ' custom-item' : ''}">
                <div class="item-product">
                    <div class="item-image">
                        <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                    </div>
                    <div class="item-details">
                        <span class="item-name">${item.name || 'Unknown'}</span>
                        <span class="item-color">Color: ${item.color || 'Default'}</span>
                        ${item.isCustom ? '<span class="custom-badge">Custom Item</span>' : ''}
                        <button class="item-remove" onclick="removeFromCart(${index})">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                            Remove
                        </button>
                    </div>
                </div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                    <span class="qty-value">${qty}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="item-price">$${price.toFixed(2)}</div>
                <div class="item-subtotal">$${subtotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function removeInquiryCartItem(index) {
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    inquiryCart.splice(index, 1);
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    renderCartPageItems();
    updateCartSummary();
    updateCartCount();
}

function updateInquiryCartQty(index, delta) {
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    if (inquiryCart[index]) {
        inquiryCart[index].quantity = (inquiryCart[index].quantity || 1) + delta;
        if (inquiryCart[index].quantity <= 0) inquiryCart.splice(index, 1);
    }
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    renderCartPageItems();
    updateCartSummary();
    updateCartCount();
}

// ========================================
// UPDATE CART SUMMARY
// ========================================

function updateCartSummary() {
    const subtotalEl = document.getElementById('subtotalAmount');
    const discountEl = document.getElementById('discountAmount');
    const shippingEl = document.getElementById('shippingAmount');
    const totalEl = document.getElementById('totalAmount');
    
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    if (inquiryCart.length > 0) {
        if (subtotalEl) subtotalEl.textContent = '—';
        if (discountEl) discountEl.textContent = '—';
        if (shippingEl) shippingEl.textContent = '—';
        if (totalEl) totalEl.textContent = 'Inquiry';
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0);
    
    let discount = 0;
    if (appliedCoupon) {
        discount = appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.discount / 100) : appliedCoupon.discount;
    }
    
    const shipping = shippingCosts[shippingMethod] || 0;
    const total = subtotal - discount + shipping;
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (discountEl) discountEl.textContent = discount > 0 ? '-$' + discount.toFixed(2) : '$0.00';
    if (shippingEl) shippingEl.textContent = shipping > 0 ? '$' + shipping.toFixed(2) : 'Free';
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function checkForCustomItems() {
    const hasCustom = cart.some(item => item.isCustom || item.price === 0);
    const inquiryNote = document.getElementById('inquiryNote');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (hasCustom) {
        if (inquiryNote) inquiryNote.style.display = 'block';
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Make an Inquiry';
            checkoutBtn.style.background = PRIMARY_INQUIRY;
        }
        localStorage.setItem('rosebudCheckoutMode', 'inquiry');
    } else {
        if (inquiryNote) inquiryNote.style.display = 'none';
        localStorage.removeItem('rosebudCheckoutMode');
    }
}

// ========================================
// COUPON FUNCTIONS
// ========================================

function applyCoupon() {
    const input = document.getElementById('couponInput');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    if (!code) {
        showNotification('Please enter a coupon code', 'error');
        return;
    }
    
    if (coupons[code]) {
        appliedCoupon = { code, ...coupons[code] };
        localStorage.setItem('rosebudCoupon', JSON.stringify(appliedCoupon));
        updateCartSummary();
        showNotification(`Coupon "${code}" applied!`);
        
        const couponDisplay = document.getElementById('appliedCoupon');
        if (couponDisplay) {
            couponDisplay.innerHTML = `<span class="coupon-code">${code}</span><button class="remove-coupon" onclick="removeCoupon()">×</button>`;
            couponDisplay.style.display = 'flex';
        }
    } else {
        showNotification('Invalid coupon code', 'error');
    }
}

function removeCoupon() {
    appliedCoupon = null;
    localStorage.removeItem('rosebudCoupon');
    updateCartSummary();
    
    const couponDisplay = document.getElementById('appliedCoupon');
    if (couponDisplay) couponDisplay.style.display = 'none';
    
    const input = document.getElementById('couponInput');
    if (input) input.value = '';
    
    showNotification('Coupon removed');
}

function selectShipping(method) {
    shippingMethod = method;
    updateCartSummary();
    
    document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
    const selectedOption = document.querySelector(`input[value="${method}"]`);
    if (selectedOption) {
        selectedOption.closest('.shipping-option').classList.add('selected');
        selectedOption.checked = true;
    }
}

// ========================================
// CHECKOUT FUNCTIONS
// ========================================

function proceedAsGuest() {
    proceedToCheckout('guest');
}

function proceedToCheckout(mode) {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    localStorage.setItem('rosebudCheckoutMode', mode || 'cart');
    
    const hasCustom = cart.some(item => item.isCustom || item.price === 0);
    window.location.href = hasCustom ? 'checkout.html?mode=inquiry' : 'checkout.html';
}

function loadCheckoutItems() {
    const container = document.getElementById('orderItems');
    if (!container) return;
    
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    if (inquiryCart.length > 0) {
        let html = '';
        inquiryCart.forEach(item => {
            html += `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                    </div>
                    <div class="order-item-details">
                        <span class="order-item-name">${item.name}</span>
                        <span class="order-item-qty">Qty: ${item.quantity}</span>
                    </div>
                    <div class="order-item-price" style="color: ${PRIMARY_INQUIRY};">Inquiry</div>
                </div>
            `;
        });
        container.innerHTML = html;
        
        const subtotalEl = document.getElementById('checkoutSubtotal');
        const totalEl = document.getElementById('checkoutTotal');
        if (subtotalEl) subtotalEl.textContent = '—';
        if (totalEl) totalEl.textContent = 'Inquiry';
        return;
    }
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-order">No items in your order</p>';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;
        
        html += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                </div>
                <div class="order-item-details">
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-qty">Qty: ${qty}</span>
                </div>
                <div class="order-item-price">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    
    const shipping = shippingCosts[shippingMethod] || 0;
    let discount = 0;
    if (appliedCoupon) {
        discount = appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.discount / 100) : appliedCoupon.discount;
    }
    
    const total = subtotal - discount + shipping;
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function placeOrder() {
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    if (inquiryCart.length > 0) {
        window.location.href = 'contact.html#inquiry-form';
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const orderData = {
        code: '#' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card',
        items: [...cart]
    };
    
    localStorage.setItem('rosebudLastOrder', JSON.stringify(orderData));
    
    cart = [];
    appliedCoupon = null;
    saveCart();
    localStorage.removeItem('rosebudCoupon');
    
    window.location.href = 'order-complete.html';
}

// ========================================
// NOTIFICATION
// ========================================

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    let bgColor = '#38CB89';
    if (type === 'error') bgColor = '#D63585';
    if (type === 'inquiry') bgColor = PRIMARY_INQUIRY;
    
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white; padding: 16px 24px; border-radius: 8px; display: flex; align-items: center; gap: 12px; z-index: 10000; font-family: 'Inter', sans-serif; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px;`;
    notification.querySelector('button').style.cssText = `background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; line-height: 1;`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========================================
// PAYMENT & DEMO FUNCTIONS
// ========================================

let selectedPaymentMethod = 'card';

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('selected'));
    const btnClass = method === 'card' ? 'credit-card-btn' : method + '-btn';
    const selectedBtn = document.querySelector(`.payment-btn.${btnClass}`);
    if (selectedBtn) selectedBtn.classList.add('selected');
    localStorage.setItem('rosebudPaymentMethod', method);
}

window.addProductToCart = function(productId) {
    addToCart({ id: productId, name: 'Product ' + productId, price: 99.00, image: 'images/avatar-placeholder.png', color: 'Default', quantity: 1 });
};

function addDemoItems() {
    if (!canAddToCart()) {
        showNotification('You have to Submit an Inquiry before adding a purchase item.', 'error');
        return;
    }
    
    cart = [
        { id: 'demo-1', sku: 'RT1189', name: 'Olivia Riegel Priscilla Picture Frame', price: 300.00, image: 'images/new-items/New Item - Frame.webp', color: 'Gold', quantity: 1, category: 'Household Items' },
        { id: 'demo-2', sku: 'NOR-001', name: 'Noritake Fine China Dinner Set', price: 450.00, image: 'images/hero/Noritake.webp', color: 'White/Gold', quantity: 1, category: 'Household Items' }
    ];
    
    saveCart();
    if (document.querySelector('.cart-items-section')) { renderCartPageItems(); updateCartSummary(); }
    updateCartCount();
    renderSidebarCart();
    showNotification('Demo items added to cart!', 'success');
}

function addDemoInquiryItems() {
    if (!canAddToInquiry()) {
        showNotification('To make an inquiry, complete your Cart transactons first.', 'error');
        return;
    }
    
    cart = [];
    saveCart();
    
    localStorage.setItem('rosebudInquiryCart', JSON.stringify([
        { id: 'RBG-C2600', sku: 'RBG-C2600', name: 'Custom 100% Cotton Dyed Terry Hand Towels', image: 'images/new-items/New Items - Custom Towels.png', quantity: 100, category: 'Wholesale' }
    ]));
    
    if (document.querySelector('.cart-items-section')) { renderCartPageItems(); updateCartSummary(); }
    updateCartCount();
    renderSidebarCart();
    showNotification('Demo inquiry items added!', 'inquiry');
}

function selectCheckoutPayment(method) {
    localStorage.setItem('rosebudPaymentMethod', method);
    const cardFields = document.getElementById('cardFields');
    const paypalSection = document.getElementById('paypalSection');
    const stripeSection = document.getElementById('stripeSection');
    if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
    if (paypalSection) paypalSection.style.display = method === 'paypal' ? 'block' : 'none';
    if (stripeSection) stripeSection.style.display = method === 'stripe' ? 'block' : 'none';
}

function continueAsGuest(event) {
    if (event) event.preventDefault();
    const signinOptions = document.getElementById('checkoutSigninOptions');
    if (signinOptions) signinOptions.style.display = 'none';
    localStorage.setItem('rosebudCheckoutMode', 'guest');
    showNotification('Continuing as guest', 'success');
}

function resetCart() {
    cart = [];
    localStorage.removeItem('rosebudCart');
    localStorage.removeItem('rosebudCoupon');
    localStorage.removeItem('rosebudInquiryCart');
    localStorage.removeItem('rosebudCartTimestamp');
    updateCartCount();
    renderSidebarCart();
    if (document.querySelector('.cart-items-section')) { renderCartPageItems(); updateCartSummary(); }
    console.log('Cart reset');
    showNotification('Cart cleared', 'success');
}

// ========================================
// GLOBAL EXPORTS
// ========================================

// updateShipping wrapper for cart.html radio buttons
function updateShipping() {
    const selectedRadio = document.querySelector('input[name="shipping"]:checked');
    if (selectedRadio) {
        selectShipping(selectedRadio.value);
    }
}

window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.addToInquiryCart = addToInquiryCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.updateCartCount = updateCartCount;
window.applyCoupon = applyCoupon;
window.removeCoupon = removeCoupon;
window.selectShipping = selectShipping;
window.updateShipping = updateShipping;
window.proceedAsGuest = proceedAsGuest;
window.proceedToCheckout = proceedToCheckout;
window.checkInquiryMode = checkInquiryMode;
window.addDemoItems = addDemoItems;
window.addDemoInquiryItems = addDemoInquiryItems;
window.selectCheckoutPayment = selectCheckoutPayment;
window.continueAsGuest = continueAsGuest;
window.resetCart = resetCart;
window.placeOrder = placeOrder;
window.updateSidebarQty = updateSidebarQty;
window.removeSidebarItem = removeSidebarItem;
window.updateInquirySidebarQty = updateInquirySidebarQty;
window.removeInquirySidebarItem = removeInquirySidebarItem;
window.removeInquiryCartItem = removeInquiryCartItem;
window.updateInquiryCartQty = updateInquiryCartQty;
window.renderSidebarCart = renderSidebarCart;
window.canAddToCart = canAddToCart;
window.canAddToInquiry = canAddToInquiry;
window.getCartMode = getCartMode;
window.showNotification = showNotification;

console.log('RoseBud Cart System v4.1.2 - Single Cart Mode Switching - Loaded');
