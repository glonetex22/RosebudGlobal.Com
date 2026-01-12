const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      oauth_provider: 'local'
    });

    // Generate token
    const token = User.generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has password (OAuth users might not)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in with your OAuth provider'
      });
    }

    // Verify password
    const isValid = await User.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = User.generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body; // Google ID token

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: oauth_id, email, name, picture } = payload;

    // Find or create user
    let user = await User.findByOAuth('google', oauth_id);

    if (!user) {
      // Check if email exists with different provider
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered with different method'
        });
      }

      // Create new user
      user = await User.create({
        email,
        name,
        oauth_provider: 'google',
        oauth_id
      });
    }

    // Generate token
    const token = User.generateToken(user.id);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// PayPal OAuth login (simplified - would need PayPal Identity API in production)
router.post('/paypal', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Note: This is a simplified implementation
    // For production, you would verify PayPal OAuth token server-side
    // and get user info from PayPal Identity API

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // For demo purposes, create/update user
    // In production, verify PayPal OAuth token first
    let user = await User.findByEmail(email);

    if (!user) {
      user = await User.create({
        email,
        name,
        oauth_provider: 'paypal',
        oauth_id: email // In production, use actual PayPal user ID
      });
    } else if (user.oauth_provider !== 'paypal') {
      // Link PayPal account if user exists
      await User.update(user.id, {
        oauth_provider: 'paypal',
        oauth_id: email
      });
      user = await User.findById(user.id);
    }

    // Generate token
    const token = User.generateToken(user.id);

    res.json({
      success: true,
      message: 'PayPal login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('PayPal OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'PayPal authentication failed'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
