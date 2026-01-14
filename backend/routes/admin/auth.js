const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');

/**
 * POST /api/admin/auth/login
 * Admin login
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    // Find admin user
    const [users] = await db.query(
      'SELECT * FROM admin_users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Check if active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    await db.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [user.id, 'login', req.ip || req.connection.remoteAddress, req.get('User-Agent')]
      );
    } catch (logError) {
      // Continue even if logging fails
      console.warn('[Auth] Activity log error:', logError.message);
    }
    
    console.log('[Auth] Admin logged in:', user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar
      }
    });
    
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

/**
 * GET /api/admin/auth/me
 * Get current admin user
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, first_name, last_name, role, avatar, last_login, created_at FROM admin_users WHERE id = ?',
      [req.admin.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('[Auth] Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

/**
 * POST /api/admin/auth/logout
 * Admin logout (just log the activity)
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, ip_address) VALUES (?, ?, ?)',
        [req.admin.id, 'logout', req.ip || req.connection.remoteAddress]
      );
    } catch (logError) {
      // Continue even if logging fails
      console.warn('[Auth] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    res.json({ success: true, message: 'Logged out' });
  }
});

/**
 * PUT /api/admin/auth/password
 * Change password
 */
router.put('/password', authMiddleware, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Get current user
    const [users] = await db.query(
      'SELECT password FROM admin_users WHERE id = ?',
      [req.admin.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      'UPDATE admin_users SET password = ? WHERE id = ?',
      [hashedPassword, req.admin.id]
    );
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action) VALUES (?, ?)',
        [req.admin.id, 'password_change']
      );
    } catch (logError) {
      // Continue even if logging fails
      console.warn('[Auth] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    console.error('[Auth] Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

/**
 * POST /api/admin/auth/create
 * Create new admin user (super_admin only)
 */
router.post('/create', authMiddleware, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').isIn(['admin', 'manager', 'staff'])
], async (req, res) => {
  try {
    // Only super_admin can create users
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create users'
      });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }
    
    const { email, password, firstName, lastName, role } = req.body;
    
    // Check if email exists
    const [existing] = await db.query(
      'SELECT id FROM admin_users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await db.query(
      `INSERT INTO admin_users (email, password, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [email.toLowerCase(), hashedPassword, firstName, lastName, role]
    );
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
        [req.admin.id, 'create_admin', 'admin_users', result.insertId]
      );
    } catch (logError) {
      // Continue even if logging fails
      console.warn('[Auth] Activity log error:', logError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Admin user created',
      userId: result.insertId
    });
    
  } catch (error) {
    console.error('[Auth] Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

module.exports = router;
