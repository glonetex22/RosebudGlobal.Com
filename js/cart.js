/* ========================================
   CART SYSTEM - JavaScript
   Version 3.2.0 - Cart persistence for 7 days, UI fixes
   ======================================== */

// Build version - increment this to force cart reset on new deployments
const CART_BUILD_VERSION = '3.8.0';

// Cart expiry duration (7 days in milliseconds)
const CART_EXPIRY_DAYS = 7;
const CART_EXPIRY_MS = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Cart State - Initialize empty
let cart = [];
let appliedCoupon = null;
let shippingMethod = 'free';

// Check if this is a new build and reset cart if needed
function checkBuildVersion() {
    const savedVersion = localStorage.getItem('rosebudBuildVersion');
    if (savedVersion !== CART_BUILD_VERSION) {
        // New build detected - but DON'T clear cart, just update version
        localStorage.setItem('rosebudBuildVersion', CART_BUILD_VERSION);
        console.log('New build detected - keeping cart data');
        return false; // Keep cart data
    }
    return false; // Same build, keep cart
}

// Check if cart has expired (older than 7 days)
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

// Load cart from localStorage with validation
function initCart() {
    // First check if we need to reset for new build
    checkBuildVersion();
    
    // Check if cart has expired
    if (isCartExpired()) {
        cart = [];
        localStorage.removeItem('rosebudCart');
        localStorage.removeItem('rosebudCartTimestamp');
        localStorage.removeItem('rosebudCoupon');
        return;
    }
    
    try {
        const savedCart = localStorage.getItem('rosebudCart');
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            // Validate and normalize cart items
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
            // Re-save normalized cart
            saveCart();
        }
    } catch (e) {
        console.warn('Error loading cart, resetting:', e);
        cart = [];
        localStorage.removeItem('rosebudCart');
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

// Available coupons (demo purposes)
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

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    initCart();
    updateCartCount();
    renderSidebarCart(); // Always render sidebar cart for consistency
    
    // Check if on cart page (has cart-items-section)
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
        checkForCustomItems();
    }
    
    // Check if on checkout page
    if (document.getElementById('orderItems')) {
        loadCheckoutItems();
        checkInquiryMode();
    }
    
    // Update shipping option styling
    document.querySelectorAll('.shipping-option').forEach(option => {
        option.addEventListener('change', function() {
            document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
            this.closest('.shipping-option').classList.add('selected');
        });
    });
});

// Check if checkout is in inquiry mode (for custom/specialty items)
function checkInquiryMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const checkoutMode = localStorage.getItem('rosebudCheckoutMode');
    
    if (mode === 'inquiry' || checkoutMode === 'inquiry') {
        // Update page title
        const title = document.getElementById('checkoutTitle');
        if (title) title.textContent = 'Order Inquiry';
        
        // Show inquiry banner
        const banner = document.getElementById('inquiryBanner');
        if (banner) banner.style.display = 'flex';
        
        // Hide payment section
        const paymentSection = document.getElementById('paymentSection');
        if (paymentSection) paymentSection.style.display = 'none';
        
        // Update button text
        const orderBtn = document.getElementById('placeOrderBtn');
        if (orderBtn) orderBtn.textContent = 'Submit Inquiry';
    }
}

// Toggle cart sidebar (for pages with sidebar)
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar || !overlay) return;
    
    const isOpen = sidebar.classList.contains('open');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    
    // Re-render cart when opening
    if (!isOpen) {
        renderSidebarCart();
    }
}

// Update cart count in header (includes both cart and inquiry items)
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
    
    // Count regular cart items
    const cartTotal = cart.reduce((sum, item) => {
        const qty = parseInt(item.quantity) || 0;
        return sum + qty;
    }, 0);
    
    // Count inquiry cart items
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    const inquiryTotal = inquiryCart.reduce((sum, item) => {
        const qty = parseInt(item.quantity) || 0;
        return sum + qty;
    }, 0);
    
    // Total count (whichever is greater, or combined)
    const totalItems = cartTotal + inquiryTotal;
    
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        // Hide badge when empty (0 items)
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Clear cart (for testing or reset)
function clearCart() {
    cart = [];
    appliedCoupon = null;
    localStorage.removeItem('rosebudCart');
    localStorage.removeItem('rosebudCoupon');
    updateCartCount();
    
    // Re-render if on cart page
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
    }
    
    // Re-render sidebar
    renderSidebarCart();
}

// Render sidebar cart (slide-out panel on all pages)
function renderSidebarCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.querySelector('.cart-sidebar .checkout-btn');
    const cartHeader = document.querySelector('.cart-sidebar .cart-header h3');
    
    // Only render if sidebar exists and we're not on the cart page
    if (!cartItems || document.querySelector('.cart-items-section')) return;
    
    // Get inquiry cart items
    const inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    // Check if we have inquiry items or regular cart items
    const hasInquiryItems = inquiryCart.length > 0;
    const hasCartItems = cart.length > 0;
    
    // If we have inquiry items, show inquiry cart mode
    if (hasInquiryItems) {
        if (cartHeader) cartHeader.textContent = 'Inquiry Cart';
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Make an Inquiry';
            checkoutBtn.style.background = '#377DFF';
            checkoutBtn.onclick = function() { window.location.href = 'contact.html?inquiry=cart'; };
        }
        
        let html = '';
        inquiryCart.forEach((item, index) => {
            const imgSrc = item.image || 'images/avatar-placeholder.png';
            const itemName = item.name || 'Unknown Item';
            const itemSku = item.sku || 'N/A';
            
            html += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${imgSrc}" alt="${itemName}" onerror="this.src='images/avatar-placeholder.png'">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${itemName}</div>
                        <div class="cart-item-sku">${itemSku}</div>
                        <div class="cart-item-price" style="color: #377DFF;">Inquiry Item</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateInquirySidebarQty(${index}, -1)">−</button>
                            <span>${item.quantity || 1}</span>
                            <button class="qty-btn" onclick="updateInquirySidebarQty(${index}, 1)">+</button>
                            <span class="cart-item-remove" onclick="removeInquirySidebarItem(${index})">Remove</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = html;
        if (cartTotalEl) cartTotalEl.parentElement.style.display = 'none';
        return;
    }
    
    // Regular shopping cart mode
    if (cartHeader) cartHeader.textContent = 'Shopping Cart';
    if (checkoutBtn) {
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.style.background = '#D63585';
        checkoutBtn.onclick = handleCheckout;
    }
    if (cartTotalEl) cartTotalEl.parentElement.style.display = 'flex';
    
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
        const itemTotal = price * qty;
        total += itemTotal;
        const imgSrc = item.image || 'images/avatar-placeholder.png';
        const itemName = item.name || 'Unknown Item';
        const itemId = item.sku || item.id || 'N/A';
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imgSrc}" alt="${itemName}" onerror="this.src='images/avatar-placeholder.png'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${itemName}</div>
                    <div class="cart-item-sku">${itemId}</div>
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

// Update inquiry quantity in sidebar
function updateInquirySidebarQty(index, delta) {
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    if (inquiryCart[index]) {
        inquiryCart[index].quantity = (inquiryCart[index].quantity || 1) + delta;
        if (inquiryCart[index].quantity <= 0) {
            inquiryCart.splice(index, 1);
        }
    }
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    updateCartCount();
    renderSidebarCart();
}

// Remove inquiry item from sidebar
function removeInquirySidebarItem(index) {
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    inquiryCart.splice(index, 1);
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    updateCartCount();
    renderSidebarCart();
}

// Update quantity in sidebar cart
function updateSidebarQty(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    saveCart();
    updateCartCount();
    renderSidebarCart();
}

// Remove item from sidebar cart
function removeSidebarItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderSidebarCart();
}

// Handle checkout button click
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    window.location.href = 'cart.html';
}

// Add item to cart
function addToCart(product) {
    // Normalize values
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
    
    const existingItem = cart.find(item => 
        item.id === normalizedProduct.id && item.color === normalizedProduct.color
    );
    
    if (existingItem) {
        existingItem.quantity += normalizedProduct.quantity;
    } else {
        cart.push(normalizedProduct);
    }
    
    saveCart();
    updateCartCount();
    renderSidebarCart();
    
    // Open sidebar if exists
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('open')) {
        toggleCart();
    }
    
    // Show notification
    showNotification(`${normalizedProduct.name} added to cart!`);
}

// Remove item from cart (cart page)
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartPageItems();
    updateCartSummary();
    updateCartCount();
    checkForCustomItems();
}

// Update item quantity (cart page)
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

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('rosebudCart', JSON.stringify(cart));
    // Update timestamp whenever cart is saved
    localStorage.setItem('rosebudCartTimestamp', Date.now().toString());
}

// Render cart page items (full cart page)
function renderCartPageItems() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!container) return;
    
    if (cart.length === 0) {
        // Show empty cart state
        if (emptyCart) {
            container.innerHTML = '';
            container.appendChild(emptyCart);
            emptyCart.style.display = 'flex';
        }
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    let html = '';
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const subtotal = price * qty;
        const itemName = item.name || 'Unknown Item';
        const itemColor = item.color || 'Default';
        const itemImage = item.image || 'images/avatar-placeholder.png';
        
        html += `
            <div class="cart-item${item.isCustom ? ' custom-item' : ''}">
                <div class="item-product">
                    <div class="item-image">
                        <img src="${itemImage}" alt="${itemName}" onerror="this.src='images/avatar-placeholder.png'">
                    </div>
                    <div class="item-details">
                        <span class="item-name">${itemName}</span>
                        <span class="item-color">Color: ${itemColor}</span>
                        ${item.isCustom ? '<span class="custom-badge">Custom Item</span>' : ''}
                        <button class="item-remove" onclick="removeFromCart(${index})">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            Remove
                        </button>
                    </div>
                </div>
                <div class="item-quantity">
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                        <span class="qty-value">${qty}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="item-price">$${price.toFixed(2)}</div>
                <div class="item-subtotal">$${subtotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Re-add hidden empty cart element for future use
    if (emptyCart) {
        emptyCart.style.display = 'none';
        container.appendChild(emptyCart);
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        return sum + (price * qty);
    }, 0);
    let discount = 0;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * (appliedCoupon.discount / 100);
        } else {
            discount = appliedCoupon.discount;
        }
    }
    
    const shipping = shippingCosts[shippingMethod] || 0;
    const total = subtotal - discount + shipping;
    
    // Update UI elements
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    const couponRow = document.getElementById('couponDiscount');
    const discountEl = document.getElementById('discountAmount');
    const couponCodeEl = document.getElementById('appliedCouponCode');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    if (couponRow && appliedCoupon) {
        couponRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
        if (couponCodeEl) couponCodeEl.textContent = appliedCoupon.code;
    } else if (couponRow) {
        couponRow.style.display = 'none';
    }
}

// Update shipping method
function updateShipping() {
    const selectedOption = document.querySelector('input[name="shipping"]:checked');
    if (selectedOption) {
        shippingMethod = selectedOption.value;
        
        // Update visual selection
        document.querySelectorAll('.shipping-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        selectedOption.closest('.shipping-option').classList.add('selected');
        
        updateCartSummary();
    }
}

// Apply coupon
function applyCoupon() {
    const input = document.getElementById('couponCode');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    
    if (coupons[code]) {
        appliedCoupon = {
            code: code,
            ...coupons[code]
        };
        localStorage.setItem('rosebudCoupon', JSON.stringify(appliedCoupon));
        updateCartSummary();
        input.value = '';
        showNotification('Coupon applied successfully!');
    } else {
        showNotification('Invalid coupon code', 'error');
    }
}

// Remove coupon
function removeCoupon() {
    appliedCoupon = null;
    localStorage.removeItem('rosebudCoupon');
    updateCartSummary();
    showNotification('Coupon removed');
}

// Check for custom items and show banner
function checkForCustomItems() {
    const banner = document.getElementById('customItemsBanner');
    if (!banner) return;
    
    const hasCustomItems = cart.some(item => item.isCustom || 
        (item.category && item.category.toLowerCase().includes('custom')) ||
        (item.category && item.category.toLowerCase().includes('specialty'))
    );
    
    banner.style.display = hasCustomItems ? 'block' : 'none';
    
    // Store this state for checkout
    localStorage.setItem('rosebudHasCustomItems', hasCustomItems ? 'true' : 'false');
    
    return hasCustomItems;
}

// Check if cart contains only custom/specialty items
function hasOnlyCustomItems() {
    return cart.length > 0 && cart.every(item => 
        item.isCustom || 
        (item.category && item.category.toLowerCase().includes('custom')) ||
        (item.category && item.category.toLowerCase().includes('specialty'))
    );
}

// Check if cart has any custom items
function hasAnyCustomItems() {
    return cart.some(item => 
        item.isCustom || 
        (item.category && item.category.toLowerCase().includes('custom')) ||
        (item.category && item.category.toLowerCase().includes('specialty'))
    );
}

// Close custom items banner
function closeBanner() {
    const banner = document.getElementById('customItemsBanner');
    if (banner) banner.style.display = 'none';
}

// Proceed as guest
function proceedAsGuest(event) {
    if (event) event.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Check for custom/specialty items
    if (hasAnyCustomItems()) {
        localStorage.setItem('rosebudCheckoutMode', 'inquiry');
        window.location.href = 'checkout.html?mode=inquiry';
    } else {
        localStorage.setItem('rosebudCheckoutMode', 'guest');
        window.location.href = 'checkout.html?guest=true';
    }
}

// Proceed to checkout
function proceedToCheckout() {
    console.log('proceedToCheckout called');
    console.log('Cart length:', cart.length);
    
    if (cart.length === 0) {
        // Show notification but still allow navigation for testing
        showNotification('Your cart is empty - add items first', 'warning');
    }
    
    // Check for custom/specialty items - convert to order inquiry
    if (hasAnyCustomItems()) {
        console.log('Navigating to inquiry mode');
        localStorage.setItem('rosebudCheckoutMode', 'inquiry');
        window.location.href = 'checkout.html?mode=inquiry';
    } else {
        console.log('Navigating to standard checkout');
        localStorage.setItem('rosebudCheckoutMode', 'standard');
        window.location.href = 'checkout.html';
    }
}

// Load checkout items
function loadCheckoutItems() {
    const container = document.getElementById('orderItems');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-order">No items in cart</p>';
        return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const subtotal = price * qty;
        const itemName = item.name || 'Unknown Item';
        const itemColor = item.color || 'Default';
        const itemImage = item.image || 'images/avatar-placeholder.png';
        
        html += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${itemImage}" alt="${itemName}" onerror="this.src='images/avatar-placeholder.png'">
                </div>
                <div class="order-item-info">
                    <div class="order-item-details">
                        <span class="order-item-name">${itemName}</span>
                        <span class="order-item-color">Color: ${itemColor}</span>
                        <div class="order-item-qty">
                            <button onclick="updateCheckoutQty(${index}, -1)">−</button>
                            <span>${qty}</span>
                            <button onclick="updateCheckoutQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <div class="order-item-actions">
                        <span class="order-item-price">$${subtotal.toFixed(2)}</span>
                        <span class="order-item-remove" onclick="removeCheckoutItem(${index})">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    updateCheckoutSummary();
}

// Update quantity on checkout page
function updateCheckoutQty(index, delta) {
    if (cart[index]) {
        const newQty = cart[index].quantity + delta;
        if (newQty <= 0) {
            removeCheckoutItem(index);
        } else {
            cart[index].quantity = newQty;
            saveCart();
            loadCheckoutItems();
            updateCartCount();
        }
    }
}

// Remove item on checkout page
function removeCheckoutItem(index) {
    cart.splice(index, 1);
    saveCart();
    loadCheckoutItems();
    updateCartCount();
}

// Update checkout summary
function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        return sum + (price * qty);
    }, 0);
    let discount = 0;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * (appliedCoupon.discount / 100);
        } else {
            discount = appliedCoupon.discount;
        }
    }
    
    const shipping = shippingCosts[shippingMethod] || 0;
    const total = subtotal - discount + shipping;
    
    const subtotalEl = document.getElementById('orderSubtotal');
    const shippingEl = document.getElementById('orderShipping');
    const totalEl = document.getElementById('orderTotal');
    const couponRow = document.getElementById('checkoutCouponDiscount');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    if (couponRow && appliedCoupon) {
        couponRow.style.display = 'flex';
        const discountEl = document.getElementById('checkoutDiscountAmount');
        const codeEl = document.getElementById('checkoutAppliedCoupon');
        if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)} [Remove]`;
        if (codeEl) codeEl.textContent = appliedCoupon.code;
    } else if (couponRow) {
        couponRow.style.display = 'none';
    }
}

// Apply coupon on checkout page
function applyCouponCheckout() {
    const input = document.getElementById('orderCouponCode');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    
    if (coupons[code]) {
        appliedCoupon = {
            code: code,
            ...coupons[code]
        };
        localStorage.setItem('rosebudCoupon', JSON.stringify(appliedCoupon));
        input.value = '';
        updateCheckoutSummary();
        showNotification('Coupon applied successfully!');
    } else {
        showNotification('Invalid coupon code', 'error');
    }
}

// Toggle payment method visibility
function togglePaymentMethod() {
    const cardFields = document.getElementById('cardFields');
    const paypalSection = document.getElementById('paypalSection');
    const stripeSection = document.getElementById('stripeSection');
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    // Update visual selection
    document.querySelectorAll('.payment-options .payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    if (selectedMethod) {
        selectedMethod.closest('.payment-option').classList.add('selected');
    }
    
    // Show/hide sections
    if (cardFields) cardFields.style.display = selectedMethod?.value === 'card' ? 'block' : 'none';
    if (paypalSection) paypalSection.style.display = selectedMethod?.value === 'paypal' ? 'block' : 'none';
    if (stripeSection) stripeSection.style.display = selectedMethod?.value === 'stripe' ? 'block' : 'none';
}

// Place order
function placeOrder() {
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'streetAddress', 'city', 'zipCode'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = '#D63585';
            isValid = false;
        } else if (field) {
            field.style.borderColor = '#CBCBCB';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Generate order details
    const orderData = {
        code: '#' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card',
        items: [...cart]
    };
    
    // Save order to localStorage for complete page
    localStorage.setItem('rosebudLastOrder', JSON.stringify(orderData));
    
    // Clear cart
    cart = [];
    appliedCoupon = null;
    saveCart();
    localStorage.removeItem('rosebudCoupon');
    
    // Redirect to complete page
    window.location.href = 'order-complete.html';
}

// Show notification
function showNotification(message, type = 'success') {
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

// Select payment method (for cart page)
let selectedPaymentMethod = 'card';

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update button states
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Find and select the clicked button
    const btnClass = method === 'card' ? 'credit-card-btn' : method + '-btn';
    const selectedBtn = document.querySelector(`.payment-btn.${btnClass}`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Store selection
    localStorage.setItem('rosebudPaymentMethod', method);
}

// Global function to add products (used from other pages)
window.addProductToCart = function(productId) {
    // This would normally fetch product data
    // For demo, we'll create sample product
    const sampleProduct = {
        id: productId,
        name: 'Product ' + productId,
        price: 99.00,
        image: 'images/avatar-placeholder.png',
        color: 'Default',
        quantity: 1
    };
    
    addToCart(sampleProduct);
};

// Add demo items for testing the checkout workflow
function addDemoItems() {
    // Clear existing cart first
    cart = [];
    
    // Add sample items
    const demoItems = [
        {
            id: 'demo-1',
            name: 'Noritake Fine China Dinner Set',
            price: 450.00,
            image: 'images/hero/Noritake.webp',
            color: 'White/Gold',
            quantity: 1,
            category: 'Fine China & Crystal'
        },
        {
            id: 'demo-2',
            name: 'Tozai Home Candle Holders Set',
            price: 120.00,
            image: 'images/hero/Tozai_Home.png',
            color: 'Bronze',
            quantity: 2,
            category: 'Home Decor'
        }
    ];
    
    demoItems.forEach(item => {
        cart.push(item);
    });
    
    // Save to localStorage
    localStorage.setItem('rosebudCart', JSON.stringify(cart));
    
    // Refresh the page to show items
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
    }
    updateCartCount();
    renderSidebarCart();
    
    showNotification('Demo items added to cart!', 'success');
}

// Add demo custom/specialty items for testing inquiry mode
function addDemoCustomItems() {
    cart = [];
    
    const demoItems = [
        {
            id: 'demo-custom-1',
            name: 'Custom 100% Cotton Dyed Terry Hand Towels',
            price: 0,
            image: 'images/new-items/New Items - Custom Towels.png',
            color: 'Custom',
            quantity: 100,
            category: 'Custom Gift Items',
            isCustom: true
        }
    ];
    
    demoItems.forEach(item => {
        cart.push(item);
    });
    
    localStorage.setItem('rosebudCart', JSON.stringify(cart));
    
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
        checkForCustomItems();
    }
    updateCartCount();
    renderSidebarCart();
    
    showNotification('Custom demo items added!', 'success');
}

// Select checkout payment method
function selectCheckoutPayment(method) {
    localStorage.setItem('rosebudPaymentMethod', method);
    
    // Update UI if needed
    const paymentSection = document.getElementById('paymentSection');
    if (paymentSection) {
        // Show/hide card fields based on payment method
        const cardFields = document.getElementById('cardFields');
        const paypalSection = document.getElementById('paypalSection');
        const stripeSection = document.getElementById('stripeSection');
        
        if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
        if (paypalSection) paypalSection.style.display = method === 'paypal' ? 'block' : 'none';
        if (stripeSection) stripeSection.style.display = method === 'stripe' ? 'block' : 'none';
    }
}

// Continue as guest on checkout
function continueAsGuest(event) {
    if (event) event.preventDefault();
    
    // Hide sign-in options
    const signinOptions = document.getElementById('checkoutSigninOptions');
    if (signinOptions) {
        signinOptions.style.display = 'none';
    }
    
    // Mark as guest checkout
    localStorage.setItem('rosebudCheckoutMode', 'guest');
    
    showNotification('Continuing as guest', 'success');
}

// Reset cart completely (can be called from browser console: resetCart())
function resetCart() {
    cart = [];
    localStorage.removeItem('rosebudCart');
    localStorage.removeItem('rosebudCoupon');
    updateCartCount();
    renderSidebarCart();
    if (document.querySelector('.cart-items-section')) {
        renderCartPageItems();
        updateCartSummary();
    }
    console.log('Cart has been reset to empty');
}

// Export functions globally
window.proceedAsGuest = proceedAsGuest;
window.proceedToCheckout = proceedToCheckout;
window.checkInquiryMode = checkInquiryMode;
window.addDemoItems = addDemoItems;
window.addDemoCustomItems = addDemoCustomItems;
window.selectCheckoutPayment = selectCheckoutPayment;
window.continueAsGuest = continueAsGuest;
window.resetCart = resetCart;
