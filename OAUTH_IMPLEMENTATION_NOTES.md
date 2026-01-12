# OAuth Implementation Notes

## Current State

The OAuth integration is currently using **demo/simulated implementations** for testing purposes. This document outlines what's needed for production OAuth integration.

---

## Google OAuth

### Current Implementation
- Uses Google Identity Services (One Tap) when available
- Falls back to demo login (prompt) for testing
- Stores user info in localStorage

### For Production Google OAuth:

#### 1. Google Cloud Console Setup
- Create a project in [Google Cloud Console](https://console.cloud.google.com/)
- Enable Google+ API
- Create OAuth 2.0 Client ID credentials
  - Application type: Web application
  - Authorized JavaScript origins:
    - `http://localhost:8000` (for development)
    - `https://yourdomain.com` (for production)
  - Authorized redirect URIs:
    - `http://localhost:8000/signin.html`
    - `https://yourdomain.com/signin.html`

#### 2. OAuth Consent Screen
- Configure OAuth consent screen
- Add scopes: `openid`, `email`, `profile`
- Add test users (for development)
- Submit for verification (for production)

#### 3. Update Client ID
- Replace `GOOGLE_CLIENT_ID` in `js/auth.js` with your actual Client ID
- Current demo ID: `987747973266-qv46fe166areqnf3p2b6uhl8imt9d6ok.apps.googleusercontent.com`

#### 4. Server-Side Requirements
- Backend endpoint to handle OAuth callback
- Exchange authorization code for access token
- Verify ID token
- Store user session securely

---

## PayPal OAuth (Authentication)

### Current Implementation
- Demo implementation using prompt
- Stores user info in localStorage
- **NOTE:** PayPal OAuth for authentication is different from PayPal payments

### For Production PayPal OAuth:

#### 1. PayPal Developer Account
- Create account at [PayPal Developer](https://developer.paypal.com/)
- Create a new app in the Dashboard
- Get Client ID and Secret

#### 2. PayPal Identity API
- Requires PayPal Identity API integration
- Server-side OAuth flow needed
- Authorization code exchange

#### 3. OAuth Flow
1. Redirect user to PayPal authorization URL
2. User authorizes application
3. PayPal redirects with authorization code
4. Exchange code for access token (server-side)
5. Get user info from PayPal API
6. Store user session

#### 4. Update Client ID
- Replace `PAYPAL_CLIENT_ID` in `js/auth.js` with your actual Client ID
- Current demo ID: `AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr`

---

## PayPal Payment (Checkout)

### Current Implementation
- PayPal SDK loaded in `checkout.html`
- Payment method selection available
- Order processing includes PayPal as payment method
- Uses same Client ID as OAuth (should be separate)

### For Production PayPal Payments:

#### 1. PayPal Developer Account
- Same account as OAuth
- Create separate app for payments (recommended)
- Get Client ID for payments

#### 2. PayPal SDK
- Already integrated in `checkout.html`
- Current Client ID: `AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr`
- **NOTE:** This is a sandbox/test Client ID

#### 3. Sandbox vs Live
- **Sandbox:** For testing (current setup)
- **Live:** For production payments
- Update Client ID in `checkout.html` for production

#### 4. Server-Side Order Processing
- Create PayPal order on server
- Capture payment after approval
- Handle webhooks for payment status
- Update order status in database

#### 5. Order Complete Flow
- Currently redirects to `order-complete.html` after demo payment
- In production, wait for PayPal confirmation
- Update order status from webhook

---

## Files to Modify for Production

### 1. `js/auth.js`
- Update `GOOGLE_CLIENT_ID` with production Client ID
- Update `PAYPAL_CLIENT_ID` (for OAuth) with production Client ID
- Implement server-side OAuth flow
- Add error handling for OAuth failures
- Remove demo login fallbacks (or make them development-only)

### 2. `checkout.html`
- Update PayPal SDK Client ID with production credentials
- Change from sandbox to live mode
- Add proper error handling

### 3. `js/checkout.js`
- Implement PayPal order creation (server-side)
- Add PayPal payment capture handling
- Update order completion flow

### 4. Backend Required
- OAuth callback endpoints
- PayPal order creation endpoint
- PayPal webhook handler
- User session management
- Order status updates

---

## Security Considerations

1. **Never expose secrets in client-side code**
   - OAuth Client Secrets must be server-side only
   - Use environment variables for sensitive data

2. **Validate tokens server-side**
   - Always verify OAuth tokens on the server
   - Don't trust client-side token validation

3. **Use HTTPS in production**
   - OAuth requires HTTPS for redirect URIs
   - PayPal requires HTTPS for live payments

4. **Implement CSRF protection**
   - Use CSRF tokens for OAuth flows
   - Verify state parameter in OAuth callbacks

5. **Store sessions securely**
   - Use secure, httpOnly cookies
   - Implement session expiration
   - Don't store sensitive data in localStorage

---

## Testing

### Google OAuth Testing
1. Use test users in OAuth consent screen
2. Test in incognito mode
3. Verify redirect URIs match exactly
4. Check token validation

### PayPal Testing
1. Use PayPal sandbox accounts
2. Test payment flows
3. Verify webhook handling
4. Test error scenarios

---

## Current Demo Behavior

### Google Sign In
- Shows prompt for email (demo mode)
- Sets `rosebudLoggedIn = 'true'` in localStorage
- Stores user info in `rosebudUser` localStorage key
- Redirects to `account.html` or previous page

### PayPal Sign In
- Shows prompt for email (demo mode)
- Sets `rosebudLoggedIn = 'true'` in localStorage
- Stores user info in `rosebudUser` localStorage key
- Redirects to `account.html` or previous page
- Checks for redirect URL from checkout (if redirected for auth)

### PayPal Payment
- PayPal SDK is loaded
- Payment method selection works
- Order processing includes PayPal as method
- Currently uses demo order completion
- In production, would need server-side order creation and capture

---

## Next Steps for Production

1. Set up Google Cloud Console project
2. Configure Google OAuth credentials
3. Set up PayPal Developer account
4. Create PayPal apps (OAuth and Payments)
5. Implement server-side OAuth handlers
6. Implement PayPal order creation/capture
7. Set up webhook handlers
8. Update client IDs in code
9. Test thoroughly in sandbox/test mode
10. Deploy to production with live credentials
