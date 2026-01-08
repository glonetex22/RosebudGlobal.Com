# RoseBud Global Website - Changelog

## Version 2.9.0 (January 7, 2026)

### UI & Functional Updates - Critical Release

#### 1. Make Inquiry Button
- Implemented for Custom Gift Items, Home Decor & Accessories, and Specialty Items - Auto Parts
- Button color: #D63585
- Navigates to contact.html with product thumbnail, description, and price displayed above form

#### 2. Contact Form Updates
- New fields: First Name*, Last Name*, Company, Industry, Email*, Mobile Number*, Comments
- Required field validation with error messages
- Success popup: "Thank you for your inquiry. One of our sales reps will reach out to you shortly via email or phone."

#### 3. Footer Updates
- Copyright text: "Copyright © 2026 Rosebud Global LLC. All rights reserved"
- Links to privacy.html and termsofservice.html

#### 4. Legal Pages Created
- privacy.html - Complete Privacy Policy
- termsofservice.html - Complete Terms of Service

#### 5. Global Search Implementation
- Search icon in header opens modal search overlay
- Autocomplete with product results from all categories
- Searches products by name, SKU, brand, and category

#### 6. Profile/Account Icon Logic
- Logged in: Navigates to account.html
- Not logged in: Navigates to signin.html

#### 7. Checkout Input Fields
- All input fields set to 56px height (already implemented)

#### 8. Order Complete Page
- "My Account" button (fill: #D63585)
- "Continue Shopping" button (stroke: #D63585, fill: #FFFFFF)
- 48px spacing between buttons
- Account check: Shows signup message if not logged in

#### 9-12. Account Pages
- Left panel navigation uses #D63585 for active/hover states
- Orders table left-justified with View button
- Address page loads checkout data for logged-in users
- Wishlist Add to Cart buttons use #D63585

#### 13. Auth Forms
- Sign In with Google (static - ready for OAuth integration)
- Sign In with PayPal (PayPal Identity SDK)
- Forgot Password flow with OTP
- Reset Password page created

---

## Previous Versions
- v2.8.0: Cart badge, payment icons, order complete buttons
- v2.7.x: Cart reset on build, PayPal Sandbox, image updates
- See previous changelogs for full history

---
© 2024-2026 Rosebud Global LLC. All rights reserved.
