const pool = require('../config/db');

class Inquiry {
  // Create new inquiry
  static async create(inquiryData) {
    const { user_id, name, email, phone, message, products } = inquiryData;
    
    const [result] = await pool.execute(
      `INSERT INTO inquiries (user_id, name, email, phone, message, products) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id || null, name, email, phone || null, message, JSON.stringify(products || [])]
    );

    return this.findById(result.insertId);
  }

  // Get inquiry by ID
  static async findById(id) {
    const [inquiries] = await pool.execute(
      'SELECT * FROM inquiries WHERE id = ?',
      [id]
    );

    if (inquiries.length === 0) return null;

    const inquiry = inquiries[0];
    return {
      ...inquiry,
      products: inquiry.products ? JSON.parse(inquiry.products) : []
    };
  }

  // Get inquiries by user ID
  static async findByUserId(userId) {
    const [inquiries] = await pool.execute(
      'SELECT * FROM inquiries WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return inquiries.map(inquiry => ({
      ...inquiry,
      products: inquiry.products ? JSON.parse(inquiry.products) : []
    }));
  }

  // Get all inquiries (admin)
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [inquiries] = await pool.execute(query, params);

    return inquiries.map(inquiry => ({
      ...inquiry,
      products: inquiry.products ? JSON.parse(inquiry.products) : []
    }));
  }

  // Update inquiry status
  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE inquiries SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }
}

module.exports = Inquiry;
