const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Hostinger SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'do-not-reply@rosebudglobal.com',
    pass: process.env.HOSTINGER_EMAIL_PASSWORD
  }
});

// Verify transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('[Email] SMTP connection error:', error);
  } else {
    console.log('[Email] SMTP server is ready to send emails');
  }
});

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter and send confirmation email
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if already subscribed
    const [existing] = await db.query(
      'SELECT id FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter'
      });
    }
    
    // Generate unsubscribe token
    const unsubscribeToken = generateToken();
    
    // Save to database
    await db.query(
      `INSERT INTO newsletter_subscribers (email, subscribed_at, unsubscribe_token, status) 
       VALUES (?, NOW(), ?, 'active')`,
      [email.toLowerCase(), unsubscribeToken]
    );
    
    // Send confirmation email
    const emailSent = await sendConfirmationEmail(email, unsubscribeToken);
    
    if (!emailSent) {
      console.warn('[Newsletter] Email sending failed but subscription saved');
    }
    
    console.log('[Newsletter] New subscriber:', email);
    
    res.json({
      success: true,
      message: 'Successfully subscribed! Please check your email for confirmation.'
    });
    
  } catch (error) {
    console.error('[Newsletter] Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
});

/**
 * GET /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.get('/unsubscribe', async (req, res) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      return res.status(400).send('Invalid unsubscribe link');
    }
    
    // Find and update subscriber
    const [result] = await db.query(
      `UPDATE newsletter_subscribers 
       SET status = 'unsubscribed', unsubscribed_at = NOW() 
       WHERE email = ? AND unsubscribe_token = ?`,
      [email.toLowerCase(), token]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).send('Subscription not found');
    }
    
    // Show unsubscribe confirmation page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - RoseBud Global</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #D63585; }
          p { color: #6C7275; }
          a { color: #377DFF; }
        </style>
      </head>
      <body>
        <h1>You've Been Unsubscribed</h1>
        <p>You will no longer receive newsletter emails from RoseBud Global.</p>
        <p><a href="https://rosebudglobal.com">Return to Website</a></p>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('[Newsletter] Unsubscribe error:', error);
    res.status(500).send('An error occurred');
  }
});

/**
 * Send confirmation email to new subscriber
 */
async function sendConfirmationEmail(email, unsubscribeToken) {
  const unsubscribeUrl = `https://rosebudglobal.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;
  
  const mailOptions = {
    from: {
      name: 'RoseBud Global',
      address: 'do-not-reply@rosebudglobal.com'
    },
    to: email,
    subject: 'Welcome to RoseBud Global Newsletter! 🌹',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RoseBud Global</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F5F5F5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D63585 0%, #377DFF 100%); padding: 40px 30px; text-align: center;">
              <img src="https://rosebudglobal.com/images/logo-white.png" alt="RoseBud Global" style="height: 50px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Welcome to Our Newsletter!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #141718; line-height: 1.6; margin: 0 0 20px;">
                Hello,
              </p>
              <p style="font-size: 16px; color: #141718; line-height: 1.6; margin: 0 0 20px;">
                Thank you for subscribing to the RoseBud Global newsletter! 🎉
              </p>
              <p style="font-size: 16px; color: #141718; line-height: 1.6; margin: 0 0 20px;">
                You'll be the first to know about:
              </p>
              <ul style="font-size: 16px; color: #141718; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
                <li>New product arrivals</li>
                <li>Exclusive deals and promotions</li>
                <li>Special seasonal offers</li>
                <li>Tips and inspiration for your home</li>
              </ul>
              <p style="font-size: 16px; color: #141718; line-height: 1.6; margin: 0 0 30px;">
                Stay tuned for amazing updates!
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #D63585; border-radius: 8px;">
                    <a href="https://rosebudglobal.com/shop.html" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Shop Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E8ECEF;">
              <p style="font-size: 14px; color: #6C7275; margin: 0 0 10px;">
                Follow us on social media
              </p>
              <p style="margin: 0 0 20px;">
                <a href="https://instagram.com/rosebudglobal" style="margin: 0 8px; color: #D63585;">Instagram</a>
                <a href="https://facebook.com/rosebudglobal" style="margin: 0 8px; color: #D63585;">Facebook</a>
                <a href="https://twitter.com/rosebudglobal" style="margin: 0 8px; color: #D63585;">Twitter</a>
              </p>
              <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 10px;">
                © 2026 RoseBud Global. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #9CA3AF;">Unsubscribe</a> from this newsletter
              </p>
              <p style="font-size: 11px; color: #9CA3AF; margin: 10px 0 0;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
          
        </table>
      </body>
      </html>
    `,
    text: `
Welcome to RoseBud Global Newsletter!

Thank you for subscribing! You'll be the first to know about:
- New product arrivals
- Exclusive deals and promotions
- Special seasonal offers
- Tips and inspiration for your home

Visit our shop: https://rosebudglobal.com/shop.html

To unsubscribe: ${unsubscribeUrl}

© 2026 RoseBud Global. All rights reserved.
This is an automated email. Please do not reply.
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('[Email] Confirmation sent to:', email);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send confirmation:', error);
    return false;
  }
}

/**
 * Generate random token for unsubscribe
 */
function generateToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = router;
