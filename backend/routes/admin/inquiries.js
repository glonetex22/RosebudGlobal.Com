const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');

router.use(authMiddleware);

// GET all inquiries
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }
    
    if (search) {
      whereClause += ' AND (i.email LIKE ? OR i.first_name LIKE ? OR i.inquiry_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM inquiries i WHERE ${whereClause}`,
      params
    );
    
    const [inquiries] = await db.query(
      `SELECT i.*, 
        (SELECT COUNT(*) FROM inquiry_items WHERE inquiry_id = i.id) as item_count,
        au.first_name as assigned_first_name, au.last_name as assigned_last_name
       FROM inquiries i
       LEFT JOIN admin_users au ON i.assigned_to = au.id
       WHERE ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get inquiries' });
  }
});

// GET single inquiry
router.get('/:id', async (req, res) => {
  try {
    const [inquiries] = await db.query('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
    
    if (inquiries.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    
    const inquiry = inquiries[0];
    
    const [items] = await db.query(
      `SELECT ii.*, p.slug as product_slug
       FROM inquiry_items ii
       LEFT JOIN products p ON ii.product_id = p.id
       WHERE ii.inquiry_id = ?`,
      [inquiry.id]
    );
    
    inquiry.items = items;
    
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get inquiry' });
  }
});

// PUT update inquiry status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    
    await db.query(
      'UPDATE inquiries SET status = ?, assigned_to = ?, updated_at = NOW() WHERE id = ?',
      [status, assignedTo || null, req.params.id]
    );
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// POST respond to inquiry
router.post('/:id/respond', async (req, res) => {
  try {
    const { response } = req.body;
    
    await db.query(
      `UPDATE inquiries SET 
        response = ?, 
        responded_at = NOW(), 
        responded_by = ?,
        status = 'responded',
        updated_at = NOW()
       WHERE id = ?`,
      [response, req.admin.id, req.params.id]
    );
    
    // TODO: Send email to customer with response
    
    res.json({ success: true, message: 'Response saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save response' });
  }
});

// POST convert inquiry to order
router.post('/:id/convert', async (req, res) => {
  try {
    // Get inquiry
    const [inquiries] = await db.query('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
    
    if (inquiries.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    
    const inquiry = inquiries[0];
    
    // Get inquiry items
    const [items] = await db.query('SELECT * FROM inquiry_items WHERE inquiry_id = ?', [inquiry.id]);
    
    // Create order number
    const orderNumber = 'RBG-' + Date.now().toString(36).toUpperCase();
    
    // Calculate total
    let subtotal = 0;
    for (const item of items) {
      const [products] = await db.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      if (products.length > 0) {
        subtotal += products[0].price * item.quantity;
      }
    }
    
    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders (
        order_number, customer_email, customer_first_name, customer_last_name, customer_phone,
        subtotal, total, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [orderNumber, inquiry.email, inquiry.first_name, inquiry.last_name, inquiry.phone, subtotal, subtotal]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items
    for (const item of items) {
      const [products] = await db.query('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (products.length > 0) {
        const product = products[0];
        await db.query(
          `INSERT INTO order_items (order_id, product_id, product_sku, product_name, product_image, price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, product.id, product.sku, product.name, item.product_image, product.price, item.quantity, product.price * item.quantity]
        );
      }
    }
    
    // Update inquiry
    await db.query(
      `UPDATE inquiries SET status = 'converted', converted_to_order = ?, updated_at = NOW() WHERE id = ?`,
      [orderId, inquiry.id]
    );
    
    res.json({
      success: true,
      message: 'Inquiry converted to order',
      data: { orderId, orderNumber }
    });
  } catch (error) {
    console.error('[Inquiries] Convert error:', error);
    res.status(500).json({ success: false, message: 'Failed to convert inquiry' });
  }
});

module.exports = router;
