# RoseBud Global Website v3.3.0
## January 8, 2026 - Final Pre-Launch Fixes

---

## FIXES IN THIS VERSION

### 1. PayPal Button Logo - FIXED
- Replaced skewed logo with clean PayPal-logo-new.png
- Proper sizing on signin button (height: 20px)

### 2. Payment Logo Heights in Checkout - FIXED
- PayPal logo: 28px height
- Stripe logo: 28px height
- Matches 56px input field heights

### 3. Google & PayPal Auth - FIXED
- Demo mode authentication working
- Google: prompts for email, logs in
- PayPal: prompts for email, logs in
- Both redirect to account.html after success

### 4. Auth Guard - FIXED
- Uses `window.location.replace()` instead of `href`
- Hides page content during redirect
- All 4 account pages protected

### 5. Account Nav Labels #FFFFFF - FIXED
- Added `!important` to ensure white color
- Added `:link` and `:visited` pseudo-classes
- 12 total `!important` declarations

### 6. Sale Category Loading - FIXED
- Improved category matching logic
- Exact match for "Sale" category
- Products load automatically when filtered

### 7. Product Page Blank Screen - VERIFIED
- Product loading from JSON works correctly
- sessionStorage fallback in place
- URL parameters (id, sku) work

---

## TO RESTART LOCAL SERVER

Your server stopped. Run this command:

```bash
cd ~/Downloads/rosebud-website
python3 -m http.server 8000
```

Then access: http://localhost:8000

---

## FILES CHANGED
- js/auth.js - Demo auth for Google/PayPal
- js/shop.js - Category filter fix
- js/cart.js - Version 3.3.0
- js/main.js - Version 3.3.0
- css/account.css - !important on nav colors
- css/checkout.css - Payment logo heights
- signin.html - New PayPal logo
- account*.html - Auth guard fix
- images/PayPal-logo-new.png - Clean logo

---

© 2026 Rosebud Global LLC
