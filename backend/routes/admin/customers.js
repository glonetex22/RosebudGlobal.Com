const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');

router.use(authMiddleware);

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (c.email LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM customers c WHERE ${whereClause}`,
      params
    );
    
    const [customers] = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as order_count,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_id = c.id AND payment_status = 'paid') as total_spent
       FROM customers c
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get customers' });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    
    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const customer = customers[0];
    
    // Get addresses
    const [addresses] = await db.query(
      'SELECT * FROM customer_addresses WHERE customer_id = ?',
      [customer.id]
    );
    customer.addresses = addresses;
    
    // Get orders
    const [orders] = await db.query(
      'SELECT id, order_number, total, status, payment_status, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10',
      [customer.id]
    );
    customer.recentOrders = orders;
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get customer' });
  }
});

module.exports = router;
