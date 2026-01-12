const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  // Find user by email
  static async findByEmail(email) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [users] = await pool.execute(
      'SELECT id, email, name, phone, oauth_provider, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  // Find user by OAuth ID
  static async findByOAuth(provider, oauthId) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
      [provider, oauthId]
    );
    return users[0] || null;
  }

  // Create new user
  static async create(userData) {
    const { email, password, name, phone, oauth_provider = 'local', oauth_id } = userData;
    
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, name, phone, oauth_provider, oauth_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password_hash, name || null, phone || null, oauth_provider, oauth_id || null]
    );

    return this.findById(result.insertId);
  }

  // Update user
  static async update(id, userData) {
    const { name, phone, email } = userData;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Verify password
  static async verifyPassword(user, password) {
    if (!user.password_hash) return false;
    return await bcrypt.compare(password, user.password_hash);
  }

  // Generate JWT token
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

module.exports = User;
