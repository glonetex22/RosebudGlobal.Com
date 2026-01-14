const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authMiddleware, requireRole } = require('../../middleware/auth');

router.use(authMiddleware);

/**
 * GET /api/admin/orders
 * Get all orders with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      paymentStatus = '',
      startDate = '',
      endDate = '',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_first_name LIKE ? OR o.customer_last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }
    
    if (paymentStatus) {
      whereClause += ' AND o.payment_status = ?';
      params.push(paymentStatus);
    }
    
    if (startDate) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Get orders
    const allowedSorts = ['created_at', 'order_number', 'total', 'status'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const [orders] = await db.query(
      `SELECT 
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE ${whereClause}
       ORDER BY o.${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[Orders] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get single order with all details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, p.slug as product_slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    
    order.items = items;
    
    // Get customer if exists
    if (order.customer_id) {
      const [customers] = await db.query(
        'SELECT id, email, first_name, last_name, phone FROM customers WHERE id = ?',
        [order.customer_id]
      );
      order.customer = customers[0] || null;
    }
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('[Orders] Get single error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order'
    });
  }
});

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notifyCustomer } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Get current order
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const oldStatus = orders[0].status;
    
    // Update timestamps based on status
    let additionalUpdates = '';
    const updateParams = [status];
    
    if (status === 'shipped') {
      additionalUpdates = ', shipped_at = NOW()';
    } else if (status === 'delivered') {
      additionalUpdates = ', delivered_at = NOW()';
    }
    
    await db.query(
      `UPDATE orders SET status = ?${additionalUpdates}, updated_at = NOW() WHERE id = ?`,
      [...updateParams, id]
    );
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, old_values, new_values) VALUES (?, ?, ?, ?, ?, ?)',
        [req.admin.id, 'update_status', 'orders', id, JSON.stringify({ status: oldStatus }), JSON.stringify({ status })]
      );
    } catch (logError) {
      console.warn('[Orders] Activity log error:', logError.message);
    }
    
    // TODO: Send email notification if notifyCustomer is true
    if (notifyCustomer) {
      console.log('[Orders] Would send status update email to customer');
    }
    
    res.json({
      success: true,
      message: 'Order status updated'
    });
    
  } catch (error) {
    console.error('[Orders] Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

/**
 * PUT /api/admin/orders/:id/tracking
 * Update tracking information
 */
router.put('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, trackingUrl, shippingMethod, notifyCustomer } = req.body;
    
    await db.query(
      `UPDATE orders SET 
        tracking_number = ?, 
        tracking_url = ?, 
        shipping_method = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [trackingNumber, trackingUrl, shippingMethod, id]
    );
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, new_values) VALUES (?, ?, ?, ?, ?)',
        [req.admin.id, 'update_tracking', 'orders', id, JSON.stringify({ trackingNumber })]
      );
    } catch (logError) {
      console.warn('[Orders] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Tracking information updated'
    });
    
  } catch (error) {
    console.error('[Orders] Tracking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking'
    });
  }
});

/**
 * PUT /api/admin/orders/:id/notes
 * Update admin notes
 */
router.put('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    await db.query(
      'UPDATE orders SET admin_notes = ?, updated_at = NOW() WHERE id = ?',
      [adminNotes, id]
    );
    
    res.json({
      success: true,
      message: 'Notes updated'
    });
    
  } catch (error) {
    console.error('[Orders] Notes update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notes'
    });
  }
});

/**
 * POST /api/admin/orders/:id/refund
 * Process refund
 */
router.post('/:id/refund', requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason, refundType } = req.body;
    
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    // TODO: Process actual refund through payment gateway (Stripe/PayPal)
    console.log('[Orders] Would process refund:', { orderId: id, amount, reason });
    
    // Update order status
    const newPaymentStatus = amount >= order.total ? 'refunded' : 'partially_refunded';
    
    await db.query(
      `UPDATE orders SET 
        payment_status = ?,
        status = 'refunded',
        admin_notes = CONCAT(IFNULL(admin_notes, ''), '\n[REFUND] ', ?, ' - Amount: $', ?),
        updated_at = NOW()
       WHERE id = ?`,
      [newPaymentStatus, reason || 'No reason provided', amount, id]
    );
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, new_values) VALUES (?, ?, ?, ?, ?)',
        [req.admin.id, 'refund', 'orders', id, JSON.stringify({ amount, reason })]
      );
    } catch (logError) {
      console.warn('[Orders] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Refund processed'
    });
    
  } catch (error) {
    console.error('[Orders] Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

/**
 * GET /api/admin/orders/stats/summary
 * Get order statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // Total orders and revenue
    const [totals] = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        AVG(total) as avg_order_value
       FROM orders 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [parseInt(period)]
    );
    
    // Orders by status
    const [byStatus] = await db.query(
      `SELECT status, COUNT(*) as count
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY status`,
      [parseInt(period)]
    );
    
    // Orders by payment status
    const [byPayment] = await db.query(
      `SELECT payment_status, COUNT(*) as count
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY payment_status`,
      [parseInt(period)]
    );
    
    // Daily orders
    const [daily] = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [parseInt(period)]
    );
    
    res.json({
      success: true,
      data: {
        totals: totals[0],
        byStatus,
        byPayment,
        daily
      }
    });
    
  } catch (error) {
    console.error('[Orders] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
});

module.exports = router;
