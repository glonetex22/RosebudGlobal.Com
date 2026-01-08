# RoseBud Global Website v3.1.0
## January 8, 2026 - Critical Updates

---

## ✅ Changes Implemented

### 1. Account Navigation - White Text (#FFFFFF)
- All nav items in default state: #FFFFFF
- Hover state: #FFFFFF with light background
- Active state: #FFFFFF with slightly darker background
- Logout: #FFFFFF

### 2. "Make an Inquiry" Button System
- Changed from "Contact for Pricing" to "Make an Inquiry"
- Button color: #2563EB (Blue) to distinguish from Add to Cart (#D63585)
- Adds items to Inquiry Cart (separate from shopping cart)
- Shows notification with link to contact page
- Applies to categories:
  - Custom Gift Items
  - Home Decor & Accessories
  - Specialty Items

### 3. Inquiry Cart System
- Items added via "Make an Inquiry" go to inquiry cart
- Contact page displays all inquiry items above form
- Shows: Thumbnail, Description, Quantity for each item
- Users can remove individual items or clear all
- Pre-fills message textarea with inquiry details

### 4. ALL HANDBAGS Moved to Sale Category
- 53 handbag products moved to "Sale" category
- Sale badge appears on product cards
- Original category preserved for reference

### 5. All Products Have Add to Cart OR Make an Inquiry
- Products with price > 0: "Add to Cart" (Pink #D63585)
- Inquiry categories: "Make an Inquiry" (Blue #2563EB)
- Products with price = 0: "Make an Inquiry" (Blue #2563EB)

---

## Google & PayPal Authentication Instructions

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth Client ID
5. Configure OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:8000`
   - `https://yourdomain.com`
7. Copy Client ID and update in `js/auth.js`:

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
```

### PayPal Identity Setup

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create an app in the REST API section
3. Get Client ID from Sandbox/Live credentials
4. Current Client ID in `js/auth.js`:
```javascript
const PAYPAL_CLIENT_ID = 'AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr';
```

5. For production, replace with Live Client ID

---

## File Changes

### Modified Files
- `js/product.js` - Make an Inquiry button, inquiry cart system
- `js/shop.js` - Make an Inquiry button, inquiry notification
- `css/shop.css` - Inquiry button styling, Sale badge
- `css/account.css` - White nav text
- `contact.html` - Inquiry cart display section
- `data/shop_products.json` - Handbags moved to Sale

---

## Terminal Commands

```bash
# Extract and deploy
unzip rosebud-website-v3.1.0.zip -d /var/www/

# Start local server
cd /var/www/rosebud-website
python3 -m http.server 8000

# Access website
http://localhost:8000

# Access CMS
http://localhost:8000/admin/
```

---

© 2026 Rosebud Global LLC. All rights reserved.
