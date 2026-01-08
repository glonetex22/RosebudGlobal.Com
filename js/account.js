/* ========================================
   ACCOUNT PAGES - JavaScript
   ======================================== */

// User data (would normally come from backend/auth)
let userData = JSON.parse(localStorage.getItem('rosebudUser')) || {
    firstName: '',
    lastName: '',
    displayName: 'Guest User',
    email: '',
    avatar: 'images/avatar-placeholder.png',
    billingAddress: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    },
    shippingAddress: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    }
};

// Orders data
let ordersData = JSON.parse(localStorage.getItem('rosebudOrders')) || [];

// Wishlist data
let wishlistData = JSON.parse(localStorage.getItem('rosebudWishlist')) || [];

// Initialize account page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    loadCheckoutDataToAddresses();
    
    // Load page-specific content
    if (document.getElementById('ordersContainer')) {
        loadOrders();
    }
    if (document.getElementById('wishlistContainer')) {
        loadWishlist();
    }
    if (document.getElementById('billingAddress')) {
        loadAddresses();
    }
});

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('rosebudLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Redirect to sign in if not logged in
        // window.location.href = 'signin.html';
    }
}

// Load checkout form data into user addresses
function loadCheckoutDataToAddresses() {
    const checkoutData = JSON.parse(localStorage.getItem('rosebudCheckoutData'));
    if (checkoutData) {
        // Load shipping address from checkout
        if (checkoutData.shipping) {
            userData.shippingAddress = {
                firstName: checkoutData.shipping.firstName || '',
                lastName: checkoutData.shipping.lastName || '',
                phone: checkoutData.shipping.phone || '',
                email: checkoutData.shipping.email || '',
                street: checkoutData.shipping.street || '',
                city: checkoutData.shipping.city || '',
                state: checkoutData.shipping.state || '',
                zip: checkoutData.shipping.zip || '',
                country: checkoutData.shipping.country || ''
            };
        }
        
        // Load billing address from checkout (or use shipping if same)
        if (checkoutData.billing) {
            userData.billingAddress = {
                firstName: checkoutData.billing.firstName || '',
                lastName: checkoutData.billing.lastName || '',
                phone: checkoutData.billing.phone || '',
                email: checkoutData.billing.email || '',
                street: checkoutData.billing.street || '',
                city: checkoutData.billing.city || '',
                state: checkoutData.billing.state || '',
                zip: checkoutData.billing.zip || '',
                country: checkoutData.billing.country || ''
            };
        } else if (checkoutData.shipping) {
            // Use shipping address as billing if not different
            userData.billingAddress = { ...userData.shippingAddress };
        }
        
        // Update contact info
        if (checkoutData.contact) {
            userData.firstName = checkoutData.contact.firstName || userData.firstName;
            userData.lastName = checkoutData.contact.lastName || userData.lastName;
            userData.email = checkoutData.contact.email || userData.email;
            if (!userData.displayName || userData.displayName === 'Guest User') {
                userData.displayName = `${checkoutData.contact.firstName} ${checkoutData.contact.lastName}`.trim() || 'Guest User';
            }
        }
        
        // Save updated user data
        localStorage.setItem('rosebudUser', JSON.stringify(userData));
    }
}

// Load user data into page
function loadUserData() {
    // Update account name
    const accountNameEl = document.getElementById('accountName');
    if (accountNameEl) {
        accountNameEl.textContent = userData.displayName || 'Guest User';
    }
    
    // Update avatar
    const avatarEl = document.getElementById('avatarImage');
    if (avatarEl && userData.avatar) {
        avatarEl.src = userData.avatar;
    }
    
    // Fill form fields if on account details page
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput) {
        firstNameInput.value = userData.firstName || '';
    }
    
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) {
        lastNameInput.value = userData.lastName || '';
    }
    
    const displayNameInput = document.getElementById('displayName');
    if (displayNameInput) {
        displayNameInput.value = userData.displayName || '';
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = userData.email || '';
    }
}

// Save account changes
function saveAccountChanges() {
    // Get form values
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const displayName = document.getElementById('displayName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    
    // Update user data
    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.displayName = displayName;
    userData.email = email;
    
    // Handle password change (no old password required)
    const newPassword = document.getElementById('newPassword')?.value;
    const repeatPassword = document.getElementById('repeatPassword')?.value;
    
    if (newPassword && newPassword !== repeatPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    if (newPassword) {
        // In production, this would send to backend
        console.log('Password change requested');
    }
    
    // Save to localStorage
    localStorage.setItem('rosebudUser', JSON.stringify(userData));
    
    // Update UI
    loadUserData();
    
    alert('Account details saved successfully!');
}

// Change avatar
function changeAvatar() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                userData.avatar = e.target.result;
                localStorage.setItem('rosebudUser', JSON.stringify(userData));
                
                const avatarEl = document.getElementById('avatarImage');
                if (avatarEl) {
                    avatarEl.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Format address for display
function formatAddress(addr) {
    if (!addr) return ['-'];
    
    const parts = [];
    
    // Name
    const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ');
    if (name) parts.push(name);
    
    // Phone
    if (addr.phone) parts.push(addr.phone);
    
    // Email
    if (addr.email) parts.push(addr.email);
    
    // Street address
    if (addr.street) parts.push(addr.street);
    
    // City, State, ZIP
    const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
    if (cityStateZip) parts.push(cityStateZip);
    
    // Country
    if (addr.country) parts.push(addr.country);
    
    return parts.length > 0 ? parts : ['-'];
}

// Load addresses
function loadAddresses() {
    // Billing address
    const billingNameEl = document.getElementById('billingName');
    const billingPhoneEl = document.getElementById('billingPhone');
    const billingStreetEl = document.getElementById('billingStreet');
    
    const billingParts = formatAddress(userData.billingAddress);
    
    if (billingNameEl) {
        billingNameEl.textContent = billingParts[0] || '-';
    }
    if (billingPhoneEl) {
        billingPhoneEl.textContent = billingParts[1] || '-';
    }
    if (billingStreetEl) {
        // Combine remaining address parts
        const remainingParts = billingParts.slice(2);
        billingStreetEl.innerHTML = remainingParts.length > 0 
            ? remainingParts.map(p => `<p>${p}</p>`).join('') 
            : '<p>-</p>';
    }
    
    // Shipping address
    const shippingNameEl = document.getElementById('shippingName');
    const shippingPhoneEl = document.getElementById('shippingPhone');
    const shippingStreetEl = document.getElementById('shippingStreet');
    
    const shippingParts = formatAddress(userData.shippingAddress);
    
    if (shippingNameEl) {
        shippingNameEl.textContent = shippingParts[0] || '-';
    }
    if (shippingPhoneEl) {
        shippingPhoneEl.textContent = shippingParts[1] || '-';
    }
    if (shippingStreetEl) {
        const remainingParts = shippingParts.slice(2);
        shippingStreetEl.innerHTML = remainingParts.length > 0 
            ? remainingParts.map(p => `<p>${p}</p>`).join('') 
            : '<p>-</p>';
    }
}

// Edit billing address
function editBillingAddress() {
    const firstName = prompt('First Name:', userData.billingAddress?.firstName || '');
    if (firstName === null) return;
    
    const lastName = prompt('Last Name:', userData.billingAddress?.lastName || '');
    if (lastName === null) return;
    
    const phone = prompt('Phone:', userData.billingAddress?.phone || '');
    if (phone === null) return;
    
    const email = prompt('Email:', userData.billingAddress?.email || '');
    if (email === null) return;
    
    const street = prompt('Street Address:', userData.billingAddress?.street || '');
    if (street === null) return;
    
    const city = prompt('City:', userData.billingAddress?.city || '');
    if (city === null) return;
    
    const state = prompt('State:', userData.billingAddress?.state || '');
    if (state === null) return;
    
    const zip = prompt('ZIP Code:', userData.billingAddress?.zip || '');
    if (zip === null) return;
    
    const country = prompt('Country:', userData.billingAddress?.country || '');
    if (country === null) return;
    
    userData.billingAddress = { firstName, lastName, phone, email, street, city, state, zip, country };
    localStorage.setItem('rosebudUser', JSON.stringify(userData));
    loadAddresses();
}

// Edit shipping address
function editShippingAddress() {
    const firstName = prompt('First Name:', userData.shippingAddress?.firstName || '');
    if (firstName === null) return;
    
    const lastName = prompt('Last Name:', userData.shippingAddress?.lastName || '');
    if (lastName === null) return;
    
    const phone = prompt('Phone:', userData.shippingAddress?.phone || '');
    if (phone === null) return;
    
    const email = prompt('Email:', userData.shippingAddress?.email || '');
    if (email === null) return;
    
    const street = prompt('Street Address:', userData.shippingAddress?.street || '');
    if (street === null) return;
    
    const city = prompt('City:', userData.shippingAddress?.city || '');
    if (city === null) return;
    
    const state = prompt('State:', userData.shippingAddress?.state || '');
    if (state === null) return;
    
    const zip = prompt('ZIP Code:', userData.shippingAddress?.zip || '');
    if (zip === null) return;
    
    const country = prompt('Country:', userData.shippingAddress?.country || '');
    if (country === null) return;
    
    userData.shippingAddress = { firstName, lastName, phone, email, street, city, state, zip, country };
    localStorage.setItem('rosebudUser', JSON.stringify(userData));
    loadAddresses();
}

// Load orders with View button
function loadOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;
    
    // Load orders from localStorage (created during checkout)
    const savedOrders = JSON.parse(localStorage.getItem('rosebudOrders')) || [];
    
    // Add demo orders if none exist
    if (savedOrders.length === 0) {
        ordersData = [
            { 
                id: '#3456_768', 
                date: 'October 17, 2023', 
                status: 'Delivered', 
                price: 1234.00,
                items: [
                    { name: 'Noritake Fine China Set', quantity: 1, price: 899.00, image: 'images/new-items/plate-cleaned.png' },
                    { name: 'Crystal Wine Glasses (Set of 4)', quantity: 1, price: 335.00, image: 'images/new-items/New Item - Frame.webp' }
                ]
            },
            { 
                id: '#3456_980', 
                date: 'October 11, 2023', 
                status: 'Delivered', 
                price: 345.00,
                items: [
                    { name: 'Leather Handbag - Brown', quantity: 1, price: 345.00, image: 'images/products/usa/handbags/RBG1175_1.png' }
                ]
            },
            { 
                id: '#3456_120', 
                date: 'August 24, 2023', 
                status: 'Delivered', 
                price: 2345.00,
                items: [
                    { name: 'Tozai Golden Mirror', quantity: 1, price: 1200.00, image: 'images/products/usa/home_decor/Tozai Gold Mossaic Round Wall Mirror.png' },
                    { name: 'Tozai Vase Set', quantity: 1, price: 1145.00, image: 'images/products/usa/home_decor/Tozai Set of 6 Gold Vases.png' }
                ]
            },
            { 
                id: '#3456_030', 
                date: 'August 12, 2023', 
                status: 'Delivered', 
                price: 845.00,
                items: [
                    { name: 'Custom Corporate Gift Set', quantity: 5, price: 169.00, image: 'images/custom-gifts/Custom Charge bank.png' }
                ]
            }
        ];
        localStorage.setItem('rosebudOrders', JSON.stringify(ordersData));
    } else {
        ordersData = savedOrders;
    }
    
    let html = '';
    ordersData.forEach((order, index) => {
        const statusClass = order.status.toLowerCase() === 'delivered' ? '' : 
                           order.status.toLowerCase() === 'pending' ? 'pending' : 
                           order.status.toLowerCase() === 'processing' ? 'processing' : 'cancelled';
        html += `
            <div class="order-row">
                <span class="order-id">${order.id}</span>
                <span class="order-date">${order.date}</span>
                <span class="order-status ${statusClass}">${order.status}</span>
                <span class="order-price">$${order.price.toFixed(2)}</span>
                <button class="order-view-btn" onclick="viewOrderDetails(${index})">View</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// View order details modal
function viewOrderDetails(orderIndex) {
    const order = ordersData[orderIndex];
    if (!order) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.id = 'orderModal';
    
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-detail-item">
                    <div class="order-detail-image">
                        <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" onerror="this.src='images/avatar-placeholder.png'">
                    </div>
                    <div class="order-detail-info">
                        <h4>${item.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                        <p class="order-detail-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
        });
    } else {
        itemsHtml = '<p class="no-items">Order details not available</p>';
    }
    
    modal.innerHTML = `
        <div class="order-modal-content">
            <div class="order-modal-header">
                <h3>Order ${order.id}</h3>
                <button class="order-modal-close" onclick="closeOrderModal()">&times;</button>
            </div>
            <div class="order-modal-meta">
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Status:</strong> <span class="order-status ${order.status.toLowerCase()}">${order.status}</span></p>
            </div>
            <div class="order-modal-items">
                <h4>Order Items</h4>
                ${itemsHtml}
            </div>
            <div class="order-modal-total">
                <span>Total:</span>
                <span>$${order.price.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeOrderModal();
        }
    });
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Load wishlist
function loadWishlist() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;
    
    // Add some demo items if none exist
    if (wishlistData.length === 0) {
        wishlistData = [
            { id: 1, name: 'Tray Table', color: 'Black', price: 19.19, image: 'images/new-items/New Item - Exotic Loveseat.png' },
            { id: 2, name: 'Sofa', color: 'Beige', price: 345.00, image: 'images/new-items/plate-cleaned.png' },
            { id: 3, name: 'Bamboo basket', color: 'Beige', price: 8.80, image: 'images/new-items/New Item - Frame.webp' },
            { id: 4, name: 'Pillow', color: 'Beige', price: 8.80, image: 'images/new-items/New Items - Custom Towels.png' }
        ];
        localStorage.setItem('rosebudWishlist', JSON.stringify(wishlistData));
    }
    
    let html = '';
    wishlistData.forEach((item, index) => {
        html += `
            <div class="wishlist-item">
                <div class="wishlist-item-product">
                    <button class="wishlist-remove-btn" onclick="removeFromWishlist(${index})">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="wishlist-product-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="wishlist-product-info">
                        <h4>${item.name}</h4>
                        <p>Color: ${item.color}</p>
                    </div>
                </div>
                <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
                <div class="wishlist-item-action">
                    <button class="wishlist-add-btn" onclick="addWishlistToCart(${index})">Add to cart</button>
                </div>
            </div>
        `;
    });
    
    if (wishlistData.length === 0) {
        html = '<p style="text-align: center; color: #6C7275; padding: 40px;">Your wishlist is empty</p>';
    }
    
    container.innerHTML = html;
}

// Remove from wishlist
function removeFromWishlist(index) {
    wishlistData.splice(index, 1);
    localStorage.setItem('rosebudWishlist', JSON.stringify(wishlistData));
    loadWishlist();
}

// Add wishlist item to cart
function addWishlistToCart(index) {
    const item = wishlistData[index];
    if (item && typeof addToCart === 'function') {
        addToCart({
            id: `WISH-${item.id}`,
            name: item.name,
            price: item.price,
            image: item.image,
            color: item.color,
            quantity: 1
        });
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('rosebudLoggedIn');
        localStorage.removeItem('rosebudUser');
        window.location.href = 'signin.html';
    }
}

// Export functions for global use
window.saveAccountChanges = saveAccountChanges;
window.changeAvatar = changeAvatar;
window.editBillingAddress = editBillingAddress;
window.editShippingAddress = editShippingAddress;
window.removeFromWishlist = removeFromWishlist;
window.addWishlistToCart = addWishlistToCart;
window.handleLogout = handleLogout;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
