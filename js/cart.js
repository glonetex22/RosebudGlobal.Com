/* ========================================
   ROSEBUD CART SYSTEM v4.2.0
   Single Cart with Mode Switching
   ======================================== */

(function() {
    'use strict';
    
    // ========================================
    // CONFIGURATION
    // ========================================
    
    const CONFIG = {
        VERSION: '4.2.0',
        EXPIRY_DAYS: 5,
        COLORS: {
            INQUIRY: '#377DFF',
            CART: '#D63585'
        },
        STORAGE_KEYS: {
            CART: 'rosebudCart',
            INQUIRY: 'rosebudInquiryCart',
            TIMESTAMP: 'rosebudCartTimestamp',
            COUPON: 'rosebudCoupon'
        }
    };
    
    // ========================================
    // STORAGE HELPERS
    // ========================================
    
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CART) || '[]');
        } catch (e) {
            return [];
        }
    }
    
    function setCart(items) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(items));
        localStorage.setItem(CONFIG.STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    }
    
    function getInquiryCart() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.INQUIRY) || '[]');
        } catch (e) {
            return [];
        }
    }
    
    function setInquiryCart(items) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.INQUIRY, JSON.stringify(items));
        localStorage.setItem(CONFIG.STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    }
    
    // ========================================
    // EXPIRY CHECK
    // ========================================
    
    function checkExpiry() {
        const timestamp = localStorage.getItem(CONFIG.STORAGE_KEYS.TIMESTAMP);
        if (!timestamp) return;
        
        const age = Date.now() - parseInt(timestamp);
        const maxAge = CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        if (age > maxAge) {
            console.log('Cart expired after ' + CONFIG.EXPIRY_DAYS + ' days');
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.INQUIRY);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.TIMESTAMP);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.COUPON);
        }
    }
    
    // ========================================
    // MODE HELPERS
    // ========================================
    
    function getCartMode() {
        const inquiry = getInquiryCart();
        const cart = getCart();
        if (inquiry.length > 0) return 'inquiry';
        if (cart.length > 0) return 'cart';
        return 'none';
    }
    
    function canAddToCart() {
        return getInquiryCart().length === 0;
    }
    
    function canAddToInquiry() {
        return getCart().length === 0;
    }
    
    // ========================================
    // UPDATE CART COUNT (BADGE)
    // ========================================
    
    function updateCartCount() {
        const cart = getCart();
        const inquiry = getInquiryCart();
        
        const cartTotal = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
        const inquiryTotal = inquiry.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
        const total = cartTotal + inquiryTotal;
        
        // Update all badge elements
        const badges = document.querySelectorAll('.cart-count, #cartCount');
        badges.forEach(badge => {
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        });
        
        console.log('Cart count updated:', total, '(cart:', cartTotal, ', inquiry:', inquiryTotal, ')');
    }
    
    // ========================================
    // TOGGLE CART SIDEBAR
    // ========================================
    
    function toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (!sidebar) {
            console.error('Cart sidebar not found');
            return;
        }
        
        const isOpen = sidebar.classList.contains('open');
        
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open');
        document.body.style.overflow = isOpen ? '' : 'hidden';
        
        if (!isOpen) {
            renderSidebarCart();
        }
    }
    
    // ========================================
    // RENDER SIDEBAR CART
    // ========================================
    
    function renderSidebarCart() {
        const cartItemsEl = document.getElementById('cartItems');
        const cartTotalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.querySelector('.cart-sidebar .checkout-btn');
        const cartHeader = document.querySelector('.cart-sidebar .cart-header h3');
        const totalLabel = document.querySelector('.cart-sidebar .cart-total span:first-child');
        
        if (!cartItemsEl) {
            console.error('Cart items element not found');
            return;
        }
        
        // Skip if on cart.html page (has different layout)
        if (document.querySelector('.cart-items-section')) return;
        
        const inquiry = getInquiryCart();
        const cart = getCart();
        
        console.log('Rendering sidebar - Inquiry items:', inquiry.length, ', Cart items:', cart.length);
        
        // ========== INQUIRY MODE ==========
        if (inquiry.length > 0) {
            // Update header
            if (cartHeader) cartHeader.textContent = 'Inquiry Cart';
            if (totalLabel) totalLabel.textContent = 'Inquiry Cart';
            
            // Update button
            if (checkoutBtn) {
                checkoutBtn.textContent = 'Make an Inquiry';
                checkoutBtn.style.background = CONFIG.COLORS.INQUIRY;
                checkoutBtn.style.boxShadow = '0 4px 12px rgba(55, 125, 255, 0.3)';
                checkoutBtn.onclick = function() { 
                    window.location.href = 'contact.html'; 
                };
            }
            
            // Render items
            let html = '';
            let total = 0;
            
            inquiry.forEach((item, index) => {
                const price = parseFloat(item.price) || 0;
                const qty = parseInt(item.quantity) || 1;
                total += price * qty;
                
                html += '<div class="cart-item">' +
                    '<div class="cart-item-image">' +
                        '<img src="' + (item.image || 'images/avatar-placeholder.png') + '" alt="' + (item.name || '') + '" onerror="this.src=\'images/avatar-placeholder.png\'">' +
                    '</div>' +
                    '<div class="cart-item-info">' +
                        '<div class="cart-item-name">' + (item.name || 'Unknown') + '</div>' +
                        '<div class="cart-item-sku" style="color: ' + CONFIG.COLORS.INQUIRY + ';">' + (item.sku || '') + '</div>' +
                        '<div class="cart-item-price">$' + price.toFixed(2) + '</div>' +
                        '<div class="cart-item-qty">' +
                            '<button class="qty-btn" onclick="window.RosebudCart.updateInquiryQty(' + index + ', -1)">−</button>' +
                            '<span>' + qty + '</span>' +
                            '<button class="qty-btn" onclick="window.RosebudCart.updateInquiryQty(' + index + ', 1)">+</button>' +
                            '<span class="cart-item-remove" onclick="window.RosebudCart.removeInquiryItem(' + index + ')">Remove</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            });
            
            cartItemsEl.innerHTML = html;
            if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
            return;
        }
        
        // ========== SHOPPING CART MODE ==========
        if (cartHeader) cartHeader.textContent = 'Shopping Cart';
        if (totalLabel) totalLabel.textContent = 'Total';
        
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Checkout';
            checkoutBtn.style.background = CONFIG.COLORS.CART;
            checkoutBtn.style.boxShadow = 'none';
            checkoutBtn.onclick = function() { 
                window.location.href = 'cart.html'; 
            };
        }
        
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartTotalEl) cartTotalEl.textContent = '$0.00';
            return;
        }
        
        let html = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity) || 1;
            total += price * qty;
            
            html += '<div class="cart-item">' +
                '<div class="cart-item-image">' +
                    '<img src="' + (item.image || 'images/avatar-placeholder.png') + '" alt="' + (item.name || '') + '" onerror="this.src=\'images/avatar-placeholder.png\'">' +
                '</div>' +
                '<div class="cart-item-info">' +
                    '<div class="cart-item-name">' + (item.name || 'Unknown') + '</div>' +
                    '<div class="cart-item-sku" style="color: ' + CONFIG.COLORS.CART + ';">' + (item.sku || '') + '</div>' +
                    '<div class="cart-item-price">$' + price.toFixed(2) + '</div>' +
                    '<div class="cart-item-qty">' +
                        '<button class="qty-btn" onclick="window.RosebudCart.updateCartQty(' + index + ', -1)">−</button>' +
                        '<span>' + qty + '</span>' +
                        '<button class="qty-btn" onclick="window.RosebudCart.updateCartQty(' + index + ', 1)">+</button>' +
                        '<span class="cart-item-remove" onclick="window.RosebudCart.removeCartItem(' + index + ')">Remove</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });
        
        cartItemsEl.innerHTML = html;
        if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
    }
    
    // ========================================
    // ADD TO CART
    // ========================================
    
    function addToCart(product) {
        if (!canAddToCart()) {
            showNotification('You have to Submit an Inquiry before adding a purchase item.', 'error');
            return false;
        }
        
        const cart = getCart();
        
        const item = {
            id: product.id || product.sku || Date.now().toString(),
            sku: product.sku || product.id || '',
            name: product.name || 'Unknown Item',
            price: parseFloat(product.price) || 0,
            image: product.image || 'images/avatar-placeholder.png',
            color: product.color || 'Default',
            quantity: parseInt(product.quantity) || 1,
            category: product.category || ''
        };
        
        const existingIndex = cart.findIndex(i => i.id === item.id);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += item.quantity;
        } else {
            cart.push(item);
        }
        
        setCart(cart);
        updateCartCount();
        renderSidebarCart();
        
        // Auto-open sidebar for Add to Cart
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && !sidebar.classList.contains('open')) {
            toggleCart();
        }
        
        showNotification(item.name + ' added to cart!', 'success');
        return true;
    }
    
    // ========================================
    // ADD TO INQUIRY CART
    // ========================================
    
    function addToInquiryCart(product) {
        if (!canAddToInquiry()) {
            showNotification('To make an inquiry, complete your Cart transactions first.', 'error');
            return false;
        }
        
        const inquiry = getInquiryCart();
        
        const item = {
            id: product.id || product.sku || Date.now().toString(),
            sku: product.sku || product.id || '',
            name: product.name || 'Unknown Item',
            price: parseFloat(product.price) || 0,
            image: product.image || 'images/avatar-placeholder.png',
            quantity: parseInt(product.quantity) || 1,
            category: product.category || ''
        };
        
        const existingIndex = inquiry.findIndex(i => i.id === item.id);
        
        if (existingIndex > -1) {
            inquiry[existingIndex].quantity += item.quantity;
        } else {
            inquiry.push(item);
        }
        
        setInquiryCart(inquiry);
        updateCartCount();
        renderSidebarCart();
        
        // Do NOT auto-open sidebar for inquiry
        showNotification(item.name + ' added to inquiry!', 'inquiry');
        return true;
    }
    
    // ========================================
    // QUANTITY & REMOVE FUNCTIONS
    // ========================================
    
    function updateCartQty(index, delta) {
        const cart = getCart();
        if (cart[index]) {
            cart[index].quantity = (cart[index].quantity || 1) + delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }
        setCart(cart);
        updateCartCount();
        renderSidebarCart();
    }
    
    function removeCartItem(index) {
        const cart = getCart();
        cart.splice(index, 1);
        setCart(cart);
        updateCartCount();
        renderSidebarCart();
    }
    
    function updateInquiryQty(index, delta) {
        const inquiry = getInquiryCart();
        if (inquiry[index]) {
            inquiry[index].quantity = (inquiry[index].quantity || 1) + delta;
            if (inquiry[index].quantity <= 0) {
                inquiry.splice(index, 1);
            }
        }
        setInquiryCart(inquiry);
        updateCartCount();
        renderSidebarCart();
    }
    
    function removeInquiryItem(index) {
        const inquiry = getInquiryCart();
        inquiry.splice(index, 1);
        setInquiryCart(inquiry);
        updateCartCount();
        renderSidebarCart();
    }
    
    // ========================================
    // NOTIFICATION
    // ========================================
    
    function showNotification(message, type) {
        type = type || 'success';
        
        // Remove existing
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();
        
        let bgColor = '#38CB89';
        if (type === 'error') bgColor = '#EF4444';
        if (type === 'inquiry') bgColor = CONFIG.COLORS.INQUIRY;
        
        const notification = document.createElement('div');
        notification.className = 'cart-notification ' + type;
        notification.innerHTML = '<span>' + message + '</span><button onclick="this.parentElement.remove()">×</button>';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + bgColor + ';color:white;padding:16px 24px;border-radius:8px;display:flex;align-items:center;gap:12px;z-index:10000;font-family:Inter,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
        notification.querySelector('button').style.cssText = 'background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0;';
        
        document.body.appendChild(notification);
        setTimeout(function() { notification.remove(); }, 3000);
    }
    
    // ========================================
    // CLEAR FUNCTIONS
    // ========================================
    
    function clearCart() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
        updateCartCount();
        renderSidebarCart();
    }
    
    function clearInquiryCart() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.INQUIRY);
        updateCartCount();
        renderSidebarCart();
    }
    
    function resetAll() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.INQUIRY);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TIMESTAMP);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.COUPON);
        updateCartCount();
        renderSidebarCart();
        console.log('All cart data cleared');
    }
    
    // ========================================
    // DEMO FUNCTIONS
    // ========================================
    
    function addDemoCartItem() {
        addToCart({
            id: 'DEMO-001',
            sku: 'RT1189',
            name: 'Tray Table',
            price: 300.00,
            image: 'images/products/tray-table.jpg',
            quantity: 1
        });
    }
    
    function addDemoInquiryItem() {
        addToInquiryCart({
            id: 'DEMO-002',
            sku: 'RT1189',
            name: 'Tray Table',
            price: 300.00,
            image: 'images/products/tray-table.jpg',
            quantity: 1
        });
    }
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    function init() {
        checkExpiry();
        updateCartCount();
        
        // Render sidebar if it exists
        if (document.getElementById('cartItems')) {
            renderSidebarCart();
        }
        
        console.log('RoseBud Cart v' + CONFIG.VERSION + ' initialized');
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========================================
    // GLOBAL EXPORTS
    // ========================================
    
    window.RosebudCart = {
        // Core functions
        toggleCart: toggleCart,
        updateCartCount: updateCartCount,
        renderSidebarCart: renderSidebarCart,
        
        // Add functions
        addToCart: addToCart,
        addToInquiryCart: addToInquiryCart,
        
        // Quantity functions
        updateCartQty: updateCartQty,
        removeCartItem: removeCartItem,
        updateInquiryQty: updateInquiryQty,
        removeInquiryItem: removeInquiryItem,
        
        // Helpers
        getCartMode: getCartMode,
        canAddToCart: canAddToCart,
        canAddToInquiry: canAddToInquiry,
        showNotification: showNotification,
        
        // Clear functions
        clearCart: clearCart,
        clearInquiryCart: clearInquiryCart,
        resetAll: resetAll,
        
        // Demo
        addDemoCartItem: addDemoCartItem,
        addDemoInquiryItem: addDemoInquiryItem,
        
        // Storage access
        getCart: getCart,
        getInquiryCart: getInquiryCart
    };
    
    // Also expose as individual globals for backward compatibility
    window.toggleCart = toggleCart;
    window.updateCartCount = updateCartCount;
    window.renderSidebarCart = renderSidebarCart;
    window.addToCart = addToCart;
    window.addToInquiryCart = addToInquiryCart;
    window.showNotification = showNotification;
    window.canAddToCart = canAddToCart;
    window.canAddToInquiry = canAddToInquiry;
    window.getCartMode = getCartMode;
    
    // Legacy function names
    window.updateSidebarQty = updateCartQty;
    window.removeSidebarItem = removeCartItem;
    window.updateInquirySidebarQty = updateInquiryQty;
    window.removeInquirySidebarItem = removeInquiryItem;
    
})();
