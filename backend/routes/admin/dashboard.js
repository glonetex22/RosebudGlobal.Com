const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');

router.use(authMiddleware);

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Total products
    const [products] = await db.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM products"
    );
    
    // Total orders
    const [orders] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week
       FROM orders`
    );
    
    // Total revenue
    const [revenue] = await db.query(
      `SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total ELSE 0 END), 0) as monthly_revenue,
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN total ELSE 0 END), 0) as weekly_revenue
       FROM orders WHERE payment_status = 'paid'`
    );
    
    // Total customers
    const [customers] = await db.query(
      "SELECT COUNT(*) as total FROM customers"
    );
    
    // Total inquiries
    const [inquiries] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_inquiries
       FROM inquiries`
    );
    
    // Low stock products
    const [lowStock] = await db.query(
      "SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold AND status = 'active'"
    );
    
    res.json({
      success: true,
      data: {
        products: products[0],
        orders: orders[0],
        revenue: revenue[0],
        customers: customers[0],
        inquiries: inquiries[0],
        lowStock: lowStock[0].count
      }
    });
    
  } catch (error) {
    console.error('[Dashboard] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
});

/**
 * GET /api/admin/dashboard/recent-orders
 */
router.get('/recent-orders', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, order_number, customer_email, customer_first_name, customer_last_name,
              total, status, payment_status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 10`
    );
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get recent orders' });
  }
});

/**
 * GET /api/admin/dashboard/recent-activity
 */
router.get('/recent-activity', async (req, res) => {
  try {
    const [activities] = await db.query(
      `SELECT al.*, au.first_name, au.last_name, au.email
       FROM activity_logs al
       LEFT JOIN admin_users au ON al.admin_id = au.id
       ORDER BY al.created_at DESC
       LIMIT 20`
    );
    
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get activity' });
  }
});

/**
 * GET /api/admin/dashboard/sales-chart
 */
router.get('/sales-chart', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const [data] = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND payment_status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [parseInt(period)]
    );
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get chart data' });
  }
});

/**
 * GET /api/admin/dashboard/top-products
 */
router.get('/top-products', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT 
        p.id, p.sku, p.name, p.price,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 10`
    );
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get top products' });
  }
});

module.exports = router;
