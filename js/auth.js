/* ========================================
   AUTHENTICATION - JavaScript
   ======================================== */

// State variables
let resetMethod = 'email';
let resetContact = '';
let generatedOTP = '';
let countdownTimer = null;

// Initialize auth pages
document.addEventListener('DOMContentLoaded', function() {
    // Focus first input on page load
    const firstInput = document.querySelector('.auth-form input');
    if (firstInput) {
        firstInput.focus();
    }
});

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

// Handle Sign In
function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    
    // Demo validation (in real app, this would be server-side)
    if (email && password) {
        // Store login state
        localStorage.setItem('rosebudLoggedIn', 'true');
        
        // Store user data
        const userData = {
            email: email,
            displayName: email.split('@')[0],
            firstName: '',
            lastName: '',
            avatar: 'images/avatar-placeholder.png'
        };
        localStorage.setItem('rosebudUser', JSON.stringify(userData));
        
        // Remember email if checked
        if (rememberMe) {
            localStorage.setItem('rosebudRememberEmail', email);
        } else {
            localStorage.removeItem('rosebudRememberEmail');
        }
        
        alert('Sign in successful!');
        window.location.href = 'account.html';
    } else {
        alert('Please enter email and password');
    }
}

// Handle Sign Up
function handleSignUp(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const agreeTerms = document.getElementById('agreeTerms')?.checked;
    
    // Validate password strength
    if (!validatePassword(password)) {
        alert('Please meet all password requirements');
        return;
    }
    
    if (!agreeTerms) {
        alert('Please agree to the Privacy Policy and Terms of Use');
        return;
    }
    
    // Demo registration (in real app, this would be server-side)
    if (fullName && email && password) {
        // Store user data
        const nameParts = fullName.split(' ');
        const userData = {
            email: email,
            displayName: fullName,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            avatar: 'images/avatar-placeholder.png'
        };
        localStorage.setItem('rosebudUser', JSON.stringify(userData));
        localStorage.setItem('rosebudLoggedIn', 'true');
        
        alert('Account created successfully!');
        window.location.href = 'account.html';
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    
    const requirements = {
        length: password.length >= 8,
        number: /\d/.test(password),
        letter: /[a-zA-Z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    updateRequirement('reqLength', requirements.length);
    updateRequirement('reqNumber', requirements.number);
    updateRequirement('reqLetter', requirements.letter);
    updateRequirement('reqSpecial', requirements.special);
}

// Check reset password strength
function checkResetPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    
    const requirements = {
        length: password.length >= 8,
        mix: /\d/.test(password) && /[a-zA-Z]/.test(password),
        previous: true // Would check against previous passwords in real app
    };
    
    updateRequirement('resetReqLength', requirements.length);
    updateRequirement('resetReqMix', requirements.mix);
    updateRequirement('resetReqPrevious', requirements.previous);
}

// Update requirement visual
function updateRequirement(id, met) {
    const element = document.getElementById(id);
    if (element) {
        if (met) {
            element.classList.add('met');
            element.querySelector('.requirement-icon').textContent = '✓';
        } else {
            element.classList.remove('met');
            element.querySelector('.requirement-icon').textContent = '○';
        }
    }
}

// Validate password
function validatePassword(password) {
    return password.length >= 8 &&
           /\d/.test(password) &&
           /[a-zA-Z]/.test(password);
}

// ========================================
// GOOGLE OAUTH CONFIGURATION
// ========================================
const GOOGLE_CLIENT_ID = '987747973266-qv46fe166areqnf3p2b6uhl8imt9d6ok.apps.googleusercontent.com';

// Initialize Google Sign In
function initGoogleSignIn() {
    // Load Google Identity Services script
    if (!document.getElementById('google-gsi-script')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = setupGoogleSignIn;
        document.head.appendChild(script);
    } else {
        setupGoogleSignIn();
    }
}

// Setup Google Sign In button
function setupGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });
    }
}

// Handle Google Sign In Response
function handleGoogleResponse(response) {
    if (response.credential) {
        // Decode JWT token to get user info
        const payload = parseJwt(response.credential);
        
        // Store login state
        localStorage.setItem('rosebudLoggedIn', 'true');
        localStorage.setItem('rosebudUser', JSON.stringify({
            email: payload.email,
            displayName: payload.name,
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            avatar: payload.picture || 'images/avatar-placeholder.png',
            provider: 'google'
        }));
        
        // Redirect to account page
        window.location.href = 'account.html';
    }
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return {};
    }
}

// Google Sign In button click handler
function signInWithGoogle() {
    // NOTE: For production Google OAuth, you need:
    // 1. Google Cloud Console project
    // 2. OAuth 2.0 Client ID (Web application)
    // 3. Authorized JavaScript origins and redirect URIs
    // 4. OAuth consent screen configured
    
    // Try Google Identity Services first
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
            // Use Google One Tap or Credential Picker
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to demo login if prompt not available
                    demoGoogleLogin();
                }
            });
        } catch (e) {
            console.error('Google Sign In error:', e);
            demoGoogleLogin();
        }
    } else {
        // Google Identity Services not loaded, use demo login
        demoGoogleLogin();
    }
}

// Demo Google Login (for testing without full OAuth setup)
function demoGoogleLogin() {
    const email = prompt('Enter your Google email for demo login:', 'demo@gmail.com');
    if (email && email.includes('@')) {
        localStorage.setItem('rosebudLoggedIn', 'true');
        localStorage.setItem('rosebudUser', JSON.stringify({
            email: email,
            displayName: email.split('@')[0],
            firstName: email.split('@')[0],
            lastName: '',
            avatar: 'images/avatar-placeholder.png',
            provider: 'google'
        }));
        
        // Check if there's a redirect URL (e.g., from checkout)
        const redirectUrl = sessionStorage.getItem('authRedirect') || localStorage.getItem('rosebudRedirectUrl') || 'account.html';
        sessionStorage.removeItem('authRedirect');
        localStorage.removeItem('rosebudRedirectUrl');
        
        // Redirect to previous page or account page
        window.location.href = redirectUrl;
    }
}

// Google Sign In via Popup (OAuth 2.0 Implicit Flow)
function googleSignInPopup() {
    const redirectUri = window.location.origin + '/signin.html';
    const scope = 'openid email profile';
    const responseType = 'token id_token';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${encodeURIComponent(responseType)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `nonce=${generateNonce()}`;
    
    // Open popup
    const popup = window.open(authUrl, 'Google Sign In', 'width=500,height=600,scrollbars=yes');
    
    // Check for popup blockers
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup blocked, redirect instead
        window.location.href = authUrl;
    }
}

// Generate random nonce for security
function generateNonce() {
    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    return array.join('');
}

// Check for Google OAuth callback (URL fragment)
function checkGoogleCallback() {
    const hash = window.location.hash;
    if (hash && hash.includes('id_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('id_token');
        
        if (idToken) {
            handleGoogleResponse({ credential: idToken });
            // Clear the URL fragment
            history.replaceState(null, '', window.location.pathname);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initGoogleSignIn();
    checkGoogleCallback();
});

// ========================================
// PAYPAL OAUTH CONFIGURATION
// ========================================
const PAYPAL_CLIENT_ID = 'AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr';

function signInWithPayPal() {
    // NOTE: PayPal OAuth for authentication requires server-side implementation
    // This is a demo implementation using localStorage
    
    // For production, you would need:
    // 1. PayPal Developer account
    // 2. OAuth App credentials (Client ID and Secret)
    // 3. Server-side OAuth flow (authorization code exchange)
    // 4. PayPal Identity API integration
    
    // Demo PayPal login
    const email = prompt('Enter your PayPal email for demo login:', 'paypal@example.com');
    if (email && email.includes('@')) {
        localStorage.setItem('rosebudLoggedIn', 'true');
        localStorage.setItem('rosebudUser', JSON.stringify({
            email: email,
            displayName: email.split('@')[0],
            firstName: email.split('@')[0],
            lastName: '',
            avatar: 'images/avatar-placeholder.png',
            provider: 'paypal'
        }));
        
        // Check if there's a redirect URL (e.g., from checkout)
        const redirectUrl = sessionStorage.getItem('authRedirect') || localStorage.getItem('rosebudRedirectUrl') || 'account.html';
        sessionStorage.removeItem('authRedirect');
        localStorage.removeItem('rosebudRedirectUrl');
        
        // Redirect to previous page or account page
        window.location.href = redirectUrl;
    }
}

// PayPal callback handler (would be on paypal-callback.html)
function handlePayPalCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode) {
        // In production, exchange auth code for access token on server
        console.log('PayPal Auth Code received:', authCode);
        
        // For demo, just log in
        localStorage.setItem('rosebudLoggedIn', 'true');
        localStorage.setItem('rosebudUser', JSON.stringify({
            email: 'paypal-user@example.com',
            displayName: 'PayPal User',
            firstName: 'PayPal',
            lastName: 'Customer',
            avatar: 'images/avatar-placeholder.png',
            authProvider: 'paypal'
        }));
        
        window.location.href = 'account.html';
    }
}

function signInWithFacebook() {
    alert('Facebook Sign In\n\nThis feature requires Facebook OAuth integration.\nFor demo purposes, this will simulate a successful sign in.');
    
    localStorage.setItem('rosebudLoggedIn', 'true');
    localStorage.setItem('rosebudUser', JSON.stringify({
        email: 'demo@facebook.com',
        displayName: 'Facebook User',
        firstName: 'Facebook',
        lastName: 'User',
        avatar: 'images/avatar-placeholder.png'
    }));
    
    window.location.href = 'account.html';
}

// Switch reset method (email/phone)
function switchResetMethod(method) {
    resetMethod = method;
    
    // Update tabs
    document.querySelectorAll('.reset-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide content
    document.getElementById('emailReset').classList.toggle('active', method === 'email');
    document.getElementById('phoneReset').classList.toggle('active', method === 'phone');
}

// Send OTP via email
function sendEmailOTP(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    resetContact = email;
    
    // Generate demo OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Demo: Show the OTP (in real app, this would be sent via email)
    alert(`Demo Mode: Your OTP code is ${generatedOTP}\n\nIn a real application, this would be sent to ${email}`);
    
    // Show step 2
    showStep(2);
    document.getElementById('otpMessage').textContent = `We've sent a 6-digit code to ${maskEmail(email)}`;
    startCountdown();
}

// ========================================
// PHONE VALIDATION AND FORMATTING
// ========================================

/**
 * Format phone number as user types: (XXX) XXX-XXXX
 * Only allows digits, auto-formats to (XXX) XXX-XXXX
 */
function formatPhoneInput(input) {
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    // Format based on length
    let formatted = '';
    if (value.length === 0) {
        formatted = '';
    } else if (value.length <= 3) {
        formatted = '(' + value;
    } else if (value.length <= 6) {
        formatted = '(' + value.slice(0, 3) + ') ' + value.slice(3);
    } else {
        formatted = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6);
    }
    
    input.value = formatted;
}

/**
 * Validate phone number
 * Requirements:
 * - Format: (XXX) XXX-XXXX
 * - 10 digits total
 * - First digit cannot be 0 or 1
 * 
 * @param {string} phone - Phone number to validate
 * @returns {object} {valid: boolean, error: string, cleaned: string}
 */
function validatePhone(phone) {
    // Remove all non-digit characters to get clean number
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if 10 digits
    if (cleaned.length !== 10) {
        return {
            valid: false,
            error: 'Phone number must be 10 digits',
            cleaned: cleaned
        };
    }
    
    // Check if first digit is 0 or 1
    const firstDigit = cleaned.charAt(0);
    if (firstDigit === '0' || firstDigit === '1') {
        return {
            valid: false,
            error: 'Phone number cannot start with 0 or 1',
            cleaned: cleaned
        };
    }
    
    // Format should match (XXX) XXX-XXXX
    const formatted = '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6);
    
    return {
        valid: true,
        error: null,
        cleaned: cleaned,
        formatted: formatted
    };
}

/**
 * Store validated phone number for OTP authentication
 */
function storePhoneForOTP(phone, cleaned) {
    // Store in localStorage for OTP authentication
    localStorage.setItem('rosebudOTPPhone', cleaned);
    localStorage.setItem('rosebudOTPPhoneFormatted', phone);
    
    console.log('[RoseBud] Phone stored for OTP:', cleaned);
}

// Send OTP via phone
function sendPhoneOTP(event) {
    event.preventDefault();
    
    const phoneInput = document.getElementById('resetPhone');
    if (!phoneInput) {
        alert('Phone input field not found');
        return;
    }
    
    const phone = phoneInput.value.trim();
    if (!phone) {
        alert('Please enter your phone number');
        phoneInput.focus();
        return;
    }
    
    // Validate phone number
    const validation = validatePhone(phone);
    if (!validation.valid) {
        alert(validation.error + '\n\nFormat: (XXX) XXX-XXXX\nPhone cannot start with 0 or 1');
        phoneInput.focus();
        phoneInput.select();
        return;
    }
    
    // Store validated phone for OTP authentication
    storePhoneForOTP(validation.formatted, validation.cleaned);
    resetContact = validation.formatted;
    
    // Generate demo OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Demo: Show the OTP (in real app, this would be sent via SMS)
    alert(`Demo Mode: Your OTP code is ${generatedOTP}\n\nIn a real application, this would be sent via SMS to ${validation.formatted}`);
    
    // Show step 2
    showStep(2);
    document.getElementById('otpMessage').textContent = `We've sent a 6-digit code to ${maskPhone(validation.formatted)}`;
    startCountdown();
}

// Handle OTP input
function handleOTPInput(index) {
    const input = document.getElementById(`otp${index}`);
    const value = input.value;
    
    // Only allow numbers
    input.value = value.replace(/[^0-9]/g, '');
    
    // Auto-focus next input
    if (input.value.length === 1 && index < 6) {
        document.getElementById(`otp${index + 1}`).focus();
    }
    
    // Mark as filled
    if (input.value) {
        input.classList.add('filled');
    } else {
        input.classList.remove('filled');
    }
}

// Handle OTP keydown (for backspace)
function handleOTPKeydown(event, index) {
    if (event.key === 'Backspace' && !event.target.value && index > 1) {
        document.getElementById(`otp${index - 1}`).focus();
    }
}

// Verify OTP
function verifyOTP() {
    let enteredOTP = '';
    for (let i = 1; i <= 6; i++) {
        enteredOTP += document.getElementById(`otp${i}`).value;
    }
    
    if (enteredOTP.length !== 6) {
        alert('Please enter the complete 6-digit code');
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        showStep(3);
    } else {
        alert('Invalid OTP code. Please try again.');
        // Clear OTP inputs
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`otp${i}`);
            input.value = '';
            input.classList.remove('filled');
        }
        document.getElementById('otp1').focus();
    }
}

// Resend OTP
function resendOTP() {
    // Generate new OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    alert(`Demo Mode: Your new OTP code is ${generatedOTP}`);
    
    // Clear existing inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otp${i}`);
        input.value = '';
        input.classList.remove('filled');
    }
    document.getElementById('otp1').focus();
    
    // Restart countdown
    startCountdown();
}

// Start countdown timer
function startCountdown() {
    let seconds = 60;
    const btn = document.getElementById('resendBtn');
    const countdownEl = document.getElementById('countdown');
    
    btn.disabled = true;
    
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    
    countdownTimer = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(countdownTimer);
            btn.disabled = false;
            btn.innerHTML = 'Resend Code';
        }
    }, 1000);
}

// Reset password
function resetPassword(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!validatePassword(newPassword)) {
        alert('Please meet all password requirements');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Demo: Save new password (in real app, this would be server-side)
    alert('Password reset successful!');
    showStep(4);
}

// Show step
function showStep(stepNumber) {
    document.querySelectorAll('.auth-step').forEach(step => {
        step.style.display = 'none';
    });
    document.getElementById(`step${stepNumber}`).style.display = 'block';
    
    // Focus first input in step
    const firstInput = document.querySelector(`#step${stepNumber} input`);
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

// Mask email
function maskEmail(email) {
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '***' + name.charAt(name.length - 1);
    return maskedName + '@' + domain;
}

// Mask phone
function maskPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return '***-***-' + cleaned.slice(-4);
}

// Export functions
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.togglePasswordVisibility = togglePasswordVisibility;
window.formatPhoneInput = formatPhoneInput;
window.validatePhone = validatePhone;
window.checkPasswordStrength = checkPasswordStrength;
window.checkResetPasswordStrength = checkResetPasswordStrength;
window.signInWithGoogle = signInWithGoogle;
window.signInWithPayPal = signInWithPayPal;
window.signInWithFacebook = signInWithFacebook;
window.handlePayPalCallback = handlePayPalCallback;
window.switchResetMethod = switchResetMethod;
window.sendEmailOTP = sendEmailOTP;
window.sendPhoneOTP = sendPhoneOTP;
window.handleOTPInput = handleOTPInput;
window.handleOTPKeydown = handleOTPKeydown;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;
window.resetPassword = resetPassword;
