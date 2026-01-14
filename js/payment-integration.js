/**
 * RoseBud Global - Payment Integration
 * Stripe and PayPal payment processing
 */

// ========================================
// STRIPE INTEGRATION
// ========================================

let stripe = null;
let elements = null;
let cardNumberElement = null;
let cardExpiryElement = null;
let cardCvcElement = null;

function initStripeElements() {
    // Check if Stripe is loaded
    if (typeof Stripe === 'undefined') {
        console.error('[RoseBud] Stripe.js not loaded');
        return;
    }
    
    // Initialize Stripe with publishable key (replace with actual key)
    // For now, using placeholder - should be loaded from environment or config
    const publishableKey = window.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
    stripe = Stripe(publishableKey);
    elements = stripe.elements();
    
    const style = {
        base: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#141718',
            '::placeholder': {
                color: '#9CA3AF'
            }
        },
        invalid: {
            color: '#DC2626'
        }
    };
    
    // Create Stripe Elements
    cardNumberElement = elements.create('cardNumber', { style });
    cardExpiryElement = elements.create('cardExpiry', { style });
    cardCvcElement = elements.create('cardCvc', { style });
    
    // Mount Elements
    const cardNumberEl = document.getElementById('card-number-element');
    const cardExpiryEl = document.getElementById('card-expiry-element');
    const cardCvcEl = document.getElementById('card-cvc-element');
    
    if (cardNumberEl && cardNumberElement) cardNumberElement.mount(cardNumberEl);
    if (cardExpiryEl && cardExpiryElement) cardExpiryElement.mount(cardExpiryEl);
    if (cardCvcEl && cardCvcElement) cardCvcElement.mount(cardCvcEl);
    
    // Handle errors
    if (cardNumberElement) cardNumberElement.on('change', displayStripeError);
    if (cardExpiryElement) cardExpiryElement.on('change', displayStripeError);
    if (cardCvcElement) cardCvcElement.on('change', displayStripeError);
    
    window.stripeElementsInitialized = true;
    console.log('[RoseBud] Stripe Elements initialized');
}

function displayStripeError(event) {
    const errorEl = document.getElementById('card-errors');
    if (event.error) {
        if (errorEl) {
            errorEl.textContent = event.error.message;
            errorEl.style.display = 'block';
            errorEl.classList.add('show');
        }
    } else {
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
            errorEl.classList.remove('show');
        }
    }
}

async function processStripePayment() {
    if (!stripe || !cardNumberElement) {
        alert('Payment form not ready. Please try again.');
        return;
    }
    
    if (typeof showProcessingLoader === 'function') {
        showProcessingLoader('Processing payment...');
    }
    
    try {
        // Get cart total (assuming this function exists in checkout.js)
        const totalAmount = typeof getCartTotal === 'function' ? getCartTotal() : 0;
        
        // Create payment intent on backend
        const response = await fetch('/api/orders/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Math.round(totalAmount * 100), // Stripe expects cents
                currency: 'usd'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }
        
        const { clientSecret } = await response.json();
        
        // Get billing details
        const billingDetails = typeof getBillingDetails === 'function' ? getBillingDetails() : {};
        
        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
                billing_details: billingDetails
            }
        });
        
        if (error) {
            if (typeof hideProcessingLoader === 'function') hideProcessingLoader();
            alert(error.message);
            return;
        }
        
        if (paymentIntent.status === 'succeeded') {
            // Payment successful - save order and redirect
            if (typeof saveOrder === 'function') {
                await saveOrder(paymentIntent.id, 'stripe');
            }
            if (typeof updateProcessingMessage === 'function') {
                updateProcessingMessage('Order confirmed!');
            }
            if (typeof delay === 'function') {
                await delay(1000);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (typeof processOrderComplete === 'function') {
                processOrderComplete();
            }
        }
        
    } catch (error) {
        if (typeof hideProcessingLoader === 'function') hideProcessingLoader();
        console.error('[RoseBud] Payment error:', error);
        alert('Payment failed. Please try again.');
    }
}

// ========================================
// PAYPAL INTEGRATION
// ========================================

function initPayPalButton() {
    // Check if PayPal is loaded
    if (typeof paypal === 'undefined') {
        console.error('[RoseBud] PayPal SDK not loaded');
        return;
    }
    
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    paypal.Buttons({
        createOrder: async function(data, actions) {
            try {
                const totalAmount = typeof getCartTotal === 'function' ? getCartTotal() : 0;
                
                const response = await fetch('/api/orders/create-paypal-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: totalAmount
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to create PayPal order');
                }
                
                const order = await response.json();
                return order.id;
            } catch (error) {
                console.error('[RoseBud] PayPal create order error:', error);
                alert('Failed to create PayPal order. Please try again.');
            }
        },
        
        onApprove: async function(data, actions) {
            if (typeof showProcessingLoader === 'function') {
                showProcessingLoader('Completing PayPal payment...');
            }
            
            try {
                const response = await fetch('/api/orders/capture-paypal-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderID: data.orderID
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to capture PayPal order');
                }
                
                const captureData = await response.json();
                
                if (captureData.status === 'COMPLETED') {
                    // Payment successful - save order and redirect
                    if (typeof saveOrder === 'function') {
                        await saveOrder(captureData.id, 'paypal');
                    }
                    if (typeof updateProcessingMessage === 'function') {
                        updateProcessingMessage('Order confirmed!');
                    }
                    if (typeof delay === 'function') {
                        await delay(1000);
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    if (typeof processOrderComplete === 'function') {
                        processOrderComplete();
                    }
                } else {
                    if (typeof hideProcessingLoader === 'function') hideProcessingLoader();
                    alert('Payment was not completed. Please try again.');
                }
            } catch (error) {
                if (typeof hideProcessingLoader === 'function') hideProcessingLoader();
                console.error('[RoseBud] PayPal capture error:', error);
                alert('PayPal payment failed. Please try again.');
            }
        },
        
        onError: function(err) {
            if (typeof hideProcessingLoader === 'function') hideProcessingLoader();
            console.error('[RoseBud] PayPal error:', err);
            alert('PayPal payment failed. Please try again.');
        }
    }).render('#paypal-button-container');
    
    window.paypalButtonInitialized = true;
    console.log('[RoseBud] PayPal button initialized');
}

// Export functions
window.initStripeElements = initStripeElements;
window.initPayPalButton = initPayPalButton;
window.processStripePayment = processStripePayment;
window.displayStripeError = displayStripeError;
