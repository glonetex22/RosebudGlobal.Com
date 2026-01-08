/**
 * RoseBud Global - Checkout Page JavaScript v2.7
 * Payment method selection, address autocomplete, order processing
 */

// ========================================
// STATE
// ========================================

let cart = [];
let selectedPaymentMethod = 'card';
let couponApplied = false;
let couponDiscount = 0;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    renderOrderItems();
    calculateTotals();
    initPaymentMethods();
    initAddressAutocomplete();
    initFormValidation();
    updateCartCount();
});

// ========================================
// CART LOADING
// ========================================

function loadCart() {
    cart = JSON.parse(localStorage.getItem('rosebudCart') || '[]');
    
    // If cart is empty, redirect to cart page
    if (cart.length === 0) {
        // Show empty cart message or redirect
        const orderItems = document.getElementById('orderItems');
        if (orderItems) {
            orderItems.innerHTML = '<p style="text-align:center;padding:24px;color:#6C7275;">Your cart is empty</p>';
        }
    }
}

function renderOrderItems() {
    const container = document.getElementById('orderItems');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:24px;color:#6C7275;">Your cart is empty</p>';
        return;
    }
    
    container.innerHTML = cart.map((item, index) => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image || 'images/avatar-placeholder.png'}" alt="${item.name}" 
                     onerror="this.src='images/avatar-placeholder.png'">
            </div>
            <div class="order-item-details">
                <p class="order-item-name">${item.name}</p>
                <p class="order-item-color">Color: ${item.color || 'Default'}</p>
                <div class="order-item-qty">
                    <button onclick="updateItemQty(${index}, -1)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <span>${item.quantity}</span>
                    <button onclick="updateItemQty(${index}, 1)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="order-item-price">
                <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
                <button class="order-item-remove" onclick="removeItem(${index})">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function updateItemQty(index, delta) {
    if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + delta);
        localStorage.setItem('rosebudCart', JSON.stringify(cart));
        renderOrderItems();
        calculateTotals();
        updateCartCount();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('rosebudCart', JSON.stringify(cart));
    renderOrderItems();
    calculateTotals();
    updateCartCount();
}

// ========================================
// TOTALS CALCULATION
// ========================================

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const discount = couponApplied ? couponDiscount : 0;
    const total = subtotal + shipping - discount;
    
    const subtotalEl = document.getElementById('subtotalAmount');
    const shippingEl = document.getElementById('shippingAmount');
    const totalEl = document.getElementById('grandTotalAmount');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// ========================================
// COUPON
// ========================================

function applyCoupon() {
    const couponInput = document.getElementById('orderCouponCode');
    const couponCode = couponInput ? couponInput.value.trim().toUpperCase() : '';
    
    // Demo coupon codes
    const validCoupons = {
        'WELCOME10': 10,
        'SAVE20': 20,
        'JENKATENMW': 25,
        'SUMMER25': 25
    };
    
    if (validCoupons[couponCode]) {
        couponApplied = true;
        couponDiscount = validCoupons[couponCode];
        
        const couponRow = document.getElementById('couponRow');
        const couponDisplay = document.getElementById('couponCodeDisplay');
        
        if (couponRow) couponRow.style.display = 'flex';
        if (couponDisplay) couponDisplay.textContent = couponCode;
        
        document.querySelector('.discount-amount').innerHTML = 
            `-$${couponDiscount.toFixed(2)} <button class="remove-coupon" onclick="removeCoupon()">[Remove]</button>`;
        
        calculateTotals();
        
        if (couponInput) couponInput.value = '';
    } else {
        alert('Invalid coupon code');
    }
}

function removeCoupon() {
    couponApplied = false;
    couponDiscount = 0;
    
    const couponRow = document.getElementById('couponRow');
    if (couponRow) couponRow.style.display = 'none';
    
    calculateTotals();
}

// ========================================
// PAYMENT METHODS
// ========================================

function initPaymentMethods() {
    // Set initial state
    selectPaymentMethod('card');
}

function selectPaymentMethod(method) {
    // Check if trying to select a second method
    const currentlySelected = document.querySelector('.payment-option.active input').value;
    
    // Remove all active states
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    // Set new active state
    const selectedOption = document.getElementById(`${method}Option`);
    if (selectedOption) {
        selectedOption.classList.add('active');
        selectedOption.querySelector('input').checked = true;
    }
    
    selectedPaymentMethod = method;
    
    // Show/hide card fields
    const cardFields = document.getElementById('cardFields');
    if (cardFields) {
        cardFields.style.display = method === 'card' ? 'block' : 'none';
    }
}

// ========================================
// ADDRESS AUTOCOMPLETE (USA Only)
// ========================================

// Sample US addresses database for autocomplete
const usAddresses = [
    { street: '123 Main Street', city: 'New York', state: 'NY', zip: '10001' },
    { street: '456 Broadway', city: 'New York', state: 'NY', zip: '10012' },
    { street: '789 Fifth Avenue', city: 'New York', state: 'NY', zip: '10022' },
    { street: '100 Wall Street', city: 'New York', state: 'NY', zip: '10005' },
    { street: '200 Park Avenue', city: 'New York', state: 'NY', zip: '10166' },
    { street: '1600 Pennsylvania Avenue', city: 'Washington', state: 'DC', zip: '20500' },
    { street: '350 Fifth Avenue', city: 'New York', state: 'NY', zip: '10118' },
    { street: '1 Infinite Loop', city: 'Cupertino', state: 'CA', zip: '95014' },
    { street: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'CA', zip: '94043' },
    { street: '500 Terry Francine Street', city: 'San Francisco', state: 'CA', zip: '94158' },
    { street: '1 Microsoft Way', city: 'Redmond', state: 'WA', zip: '98052' },
    { street: '410 Terry Avenue North', city: 'Seattle', state: 'WA', zip: '98109' },
    { street: '233 S Wacker Drive', city: 'Chicago', state: 'IL', zip: '60606' },
    { street: '875 N Michigan Avenue', city: 'Chicago', state: 'IL', zip: '60611' },
    { street: '1000 Chopper Circle', city: 'Denver', state: 'CO', zip: '80204' },
    { street: '1 AT&T Way', city: 'Dallas', state: 'TX', zip: '75202' },
    { street: '2101 E Coast Highway', city: 'Newport Beach', state: 'CA', zip: '92625' },
    { street: '9336 Civic Center Drive', city: 'Beverly Hills', state: 'CA', zip: '90210' },
    { street: '1 Rockets Park Drive', city: 'Houston', state: 'TX', zip: '77002' },
    { street: '1 Biscayne Tower', city: 'Miami', state: 'FL', zip: '33131' },
    { street: '1 Bayfront Plaza', city: 'Miami', state: 'FL', zip: '33132' },
    { street: '400 Broad Street', city: 'Seattle', state: 'WA', zip: '98109' },
    { street: '1 Harbor Drive', city: 'San Diego', state: 'CA', zip: '92101' },
    { street: '601 E Kennedy Blvd', city: 'Tampa', state: 'FL', zip: '33602' }
];

let addressSuggestionsTimeout = null;

function initAddressAutocomplete() {
    const streetInput = document.getElementById('streetAddress');
    const suggestionsDiv = document.getElementById('addressSuggestions');
    
    if (streetInput) {
        // Close suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!streetInput.contains(e.target) && suggestionsDiv && !suggestionsDiv.contains(e.target)) {
                hideAddressSuggestions();
            }
        });
    }
}

function handleAddressInput(value) {
    const countrySelect = document.getElementById('country');
    
    // Only show autocomplete for USA
    if (!countrySelect || countrySelect.value !== 'US') {
        hideAddressSuggestions();
        return;
    }
    
    // Clear previous timeout
    if (addressSuggestionsTimeout) {
        clearTimeout(addressSuggestionsTimeout);
    }
    
    // Debounce input
    addressSuggestionsTimeout = setTimeout(() => {
        if (value.length >= 2) {
            showAddressSuggestionResults(value);
        } else {
            hideAddressSuggestions();
        }
    }, 200);
}

function showAddressSuggestions() {
    const streetInput = document.getElementById('streetAddress');
    const countrySelect = document.getElementById('country');
    
    if (streetInput && streetInput.value.length >= 2 && countrySelect && countrySelect.value === 'US') {
        showAddressSuggestionResults(streetInput.value);
    }
}

function showAddressSuggestionResults(query) {
    const suggestionsDiv = document.getElementById('addressSuggestions');
    if (!suggestionsDiv) return;
    
    const lowerQuery = query.toLowerCase();
    
    // Filter addresses that match the query
    const matches = usAddresses.filter(addr => 
        addr.street.toLowerCase().includes(lowerQuery) ||
        addr.city.toLowerCase().includes(lowerQuery) ||
        addr.zip.includes(query)
    ).slice(0, 5);
    
    if (matches.length === 0) {
        hideAddressSuggestions();
        return;
    }
    
    suggestionsDiv.innerHTML = matches.map((addr, index) => `
        <div class="address-suggestion" onclick="selectAddress(${index})">
            <div class="suggestion-main">${addr.street}</div>
            <div class="suggestion-secondary">${addr.city}, ${addr.state} ${addr.zip}</div>
        </div>
    `).join('');
    
    // Store matches for selection
    window.currentAddressMatches = matches;
    
    suggestionsDiv.classList.add('active');
}

function hideAddressSuggestions() {
    const suggestionsDiv = document.getElementById('addressSuggestions');
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('active');
    }
}

function selectAddress(index) {
    const addr = window.currentAddressMatches[index];
    if (!addr) return;
    
    // Fill in all address fields
    const streetInput = document.getElementById('streetAddress');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipInput = document.getElementById('zipCode');
    
    if (streetInput) streetInput.value = addr.street;
    if (cityInput) cityInput.value = addr.city;
    if (stateInput) stateInput.value = addr.state;
    if (zipInput) zipInput.value = addr.zip;
    
    hideAddressSuggestions();
}

function handleCountryChange() {
    const countrySelect = document.getElementById('country');
    const streetInput = document.getElementById('streetAddress');
    const stateInput = document.getElementById('state');
    const zipInput = document.getElementById('zipCode');
    
    // Hide suggestions when country changes
    hideAddressSuggestions();
    
    if (countrySelect.value === 'US') {
        // Enable US autocomplete placeholder
        if (streetInput) streetInput.placeholder = 'Start typing your address...';
    } else {
        // Change placeholder for non-US
        if (streetInput) streetInput.placeholder = 'Street Address';
    }
}

// Simple address lookup for USA zip codes
function lookupAddress() {
    const countrySelect = document.getElementById('country');
    const zipInput = document.getElementById('zipCode');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    
    // Only for USA
    if (!countrySelect || countrySelect.value !== 'US') return;
    
    const zip = zipInput ? zipInput.value.trim() : '';
    if (zip.length < 5) return;
    
    // Use a simple ZIP code to city/state mapping (demo data)
    // In production, use a proper API like USPS, Google Places, or SmartyStreets
    const zipData = {
        '10001': { city: 'New York', state: 'NY' },
        '90210': { city: 'Beverly Hills', state: 'CA' },
        '60601': { city: 'Chicago', state: 'IL' },
        '33101': { city: 'Miami', state: 'FL' },
        '77001': { city: 'Houston', state: 'TX' },
        '85001': { city: 'Phoenix', state: 'AZ' },
        '19101': { city: 'Philadelphia', state: 'PA' },
        '78201': { city: 'San Antonio', state: 'TX' },
        '92101': { city: 'San Diego', state: 'CA' },
        '75201': { city: 'Dallas', state: 'TX' },
        '07101': { city: 'Newark', state: 'NJ' },
        '07102': { city: 'Newark', state: 'NJ' },
        '07103': { city: 'Newark', state: 'NJ' }
    };
    
    if (zipData[zip]) {
        if (cityInput && !cityInput.value) cityInput.value = zipData[zip].city;
        if (stateInput && !stateInput.value) stateInput.value = zipData[zip].state;
    }
}

// ========================================
// BILLING ADDRESS TOGGLE
// ========================================

function toggleBillingAddress() {
    const checkbox = document.getElementById('differentBilling');
    const billingFields = document.getElementById('billingAddressFields');
    
    if (billingFields) {
        billingFields.style.display = checkbox.checked ? 'block' : 'none';
    }
}

// ========================================
// FORM VALIDATION
// ========================================

function initFormValidation() {
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const formGroup = field.closest('.form-group');
    
    if (!field.value.trim()) {
        field.classList.add('error');
        if (formGroup) formGroup.classList.add('has-error');
        return false;
    } else {
        field.classList.remove('error');
        if (formGroup) formGroup.classList.remove('has-error');
        return true;
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    let firstError = null;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            if (!firstError) firstError = field;
        }
    });
    
    // Validate card fields if card payment selected
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber');
        const expDate = document.getElementById('expDate');
        const cvc = document.getElementById('cvc');
        
        if (!cardNumber.value.trim()) {
            cardNumber.classList.add('error');
            cardNumber.closest('.form-group').classList.add('has-error');
            isValid = false;
            if (!firstError) firstError = cardNumber;
        }
        if (!expDate.value.trim()) {
            expDate.classList.add('error');
            expDate.closest('.form-group').classList.add('has-error');
            isValid = false;
            if (!firstError) firstError = expDate;
        }
        if (!cvc.value.trim()) {
            cvc.classList.add('error');
            cvc.closest('.form-group').classList.add('has-error');
            isValid = false;
            if (!firstError) firstError = cvc;
        }
    }
    
    // Scroll to first error
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
    }
    
    // Show error message
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.style.display = isValid ? 'none' : 'flex';
    }
    
    return isValid;
}

// ========================================
// PLACE ORDER
// ========================================

function placeOrder() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Save checkout form data for account pages
    saveCheckoutData();
    
    // Show processing overlay
    showProcessingOverlay();
    
    // Simulate payment processing (5 seconds)
    setTimeout(() => {
        // Process successful - redirect to order complete
        processOrderComplete();
    }, 5000);
}

function saveCheckoutData() {
    // Get form values
    const checkoutData = {
        contact: {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            email: document.getElementById('email')?.value || ''
        },
        shipping: {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            email: document.getElementById('email')?.value || '',
            street: document.getElementById('street')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            zip: document.getElementById('zipCode')?.value || '',
            country: document.getElementById('country')?.value || ''
        }
    };
    
    // Check if billing is different
    const differentBilling = document.getElementById('differentBilling')?.checked;
    if (differentBilling) {
        checkoutData.billing = {
            firstName: document.getElementById('billingFirstName')?.value || '',
            lastName: document.getElementById('billingLastName')?.value || '',
            phone: document.getElementById('billingPhone')?.value || '',
            email: document.getElementById('billingEmail')?.value || '',
            street: document.getElementById('billingStreet')?.value || '',
            city: document.getElementById('billingCity')?.value || '',
            state: document.getElementById('billingState')?.value || '',
            zip: document.getElementById('billingZipCode')?.value || '',
            country: document.getElementById('billingCountry')?.value || ''
        };
    } else {
        // Use shipping as billing
        checkoutData.billing = { ...checkoutData.shipping };
    }
    
    // Save to localStorage for account pages
    localStorage.setItem('rosebudCheckoutData', JSON.stringify(checkoutData));
}

function showProcessingOverlay() {
    const overlay = document.getElementById('processingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function processOrderComplete() {
    // Generate order number
    const orderNumber = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Get total amount
    const totalText = document.getElementById('grandTotalAmount')?.textContent || '$0.00';
    const totalAmount = parseFloat(totalText.replace(/[$,]/g, '')) || 0;
    
    // Get order details
    const orderData = {
        orderNumber: orderNumber,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        total: totalText,
        paymentMethod: selectedPaymentMethod === 'card' ? 'Credit Card' : 
                      selectedPaymentMethod === 'paypal' ? 'PayPal' : 'Stripe',
        items: cart
    };
    
    // Store order data for order complete page
    sessionStorage.setItem('completedOrder', JSON.stringify(orderData));
    
    // Add to order history
    const existingOrders = JSON.parse(localStorage.getItem('rosebudOrders') || '[]');
    existingOrders.unshift({
        id: orderNumber,
        date: orderData.date,
        status: 'Processing',
        price: totalAmount,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
        }))
    });
    localStorage.setItem('rosebudOrders', JSON.stringify(existingOrders));
    
    // Clear cart
    localStorage.removeItem('rosebudCart');
    
    // Redirect to order complete page
    window.location.href = 'order-complete.html';
}

// ========================================
// CART COUNT
// ========================================

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
    }
}

// ========================================
// GLOBAL EXPORTS
// ========================================

window.selectPaymentMethod = selectPaymentMethod;
window.applyCoupon = applyCoupon;
window.removeCoupon = removeCoupon;
window.toggleBillingAddress = toggleBillingAddress;
window.updateItemQty = updateItemQty;
window.removeItem = removeItem;
window.placeOrder = placeOrder;
window.handleCountryChange = handleCountryChange;
window.lookupAddress = lookupAddress;
