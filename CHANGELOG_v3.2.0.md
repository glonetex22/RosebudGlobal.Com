# RoseBud Global Website v3.2.0
## January 8, 2026 - Pre-Launch Critical Fixes

---

## ✅ CRITICAL FIXES IMPLEMENTED

### 1. Make an Inquiry Button - Expanded Categories
**Status:** FIXED
- Now applies to: Custom Gift Items, Home Decor & Accessories, Specialty Items, **Wholesale**
- Button color: #2563EB (Blue)
- Also applies to ALL products with price = $0

### 2. New Products Added & Categorized
- **Custom 100% Cotton Dyed Terry Hand Towels** → Household Items / Bedding
- **Special Shaped Plate Series Ceramic Plate (RBG-P31005)** → Wholesale
- **Custom Exotic Material Loveseat (RBG-F29055)** → Home Decor & Accessories / Furniture

### 3. "Contact for Pricing" Popup REMOVED
**Status:** FIXED
- No more popup when clicking buttons
- Direct "Make an Inquiry" flow to inquiry cart

### 4. Account Page Auth Guard
**Status:** FIXED
- Users MUST be logged in to access:
  - account.html
  - account-address.html
  - account-orders.html
  - account-wishlist.html
- Automatic redirect to signin.html if not logged in

### 5. Cart Persistence - 7 Days
**Status:** FIXED
- Cart items now persist for 7 days
- Items are NOT removed when navigating away
- Cart only clears when:
  - User manually removes item (clicks X)
  - 7 days have passed
  - User completes checkout

### 6. Contact Page Icons Updated
**Status:** FIXED
- New icons: store, mail, call
- Color: #D63585 (via CSS filter)
- Click animation with pulse effect
- Email/Phone cards now clickable (opens mailto:/tel:)

### 7. Account Nav Labels - White (#FFFFFF)
**Status:** VERIFIED
- All nav labels in default state: #FFFFFF
- Background: #D63585 (pink sidebar)

### 8. Wholesale Category Added
- New top-level category in shop filters
- Products with Wholesale category show "Make an Inquiry"

---

## FILES CHANGED

### JavaScript
- `js/cart.js` - 7-day persistence, version 3.2.0
- `js/main.js` - Version 3.2.0
- `js/shop.js` - Wholesale category, inquiry logic
- `js/product.js` - Wholesale in inquiry categories

### HTML
- `account.html` - Auth guard added
- `account-address.html` - Auth guard added
- `account-orders.html` - Auth guard added
- `account-wishlist.html` - Auth guard added
- `contact.html` - New icons, animation

### Data
- `data/shop_products.json` - 3 new products added

### Images
- `images/icon-store.png` - Address icon
- `images/icon-mail.png` - Email icon  
- `images/icon-call.png` - Phone icon

---

## TESTING CHECKLIST

Before launch, verify:

- [ ] Cart persists after navigating away
- [ ] Cart persists after browser refresh
- [ ] My Account redirects to Sign In when not logged in
- [ ] "Make an Inquiry" appears for all inquiry categories
- [ ] Contact page icons display in pink (#D63585)
- [ ] Contact cards animate on click
- [ ] Email/Phone cards open mailto:/tel: links
- [ ] Wholesale products show "Make an Inquiry"

---

## TERMINAL COMMAND

```bash
cd ~/Desktop
rm -rf rosebud-website
mkdir rosebud-website && cd rosebud-website
unzip ~/Downloads/rosebud-website-v3.2.0.zip
python3 -m http.server 8000
```

Access: http://localhost:8000

---

© 2026 Rosebud Global LLC. All rights reserved.
