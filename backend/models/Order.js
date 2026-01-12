const pool = require('../config/db');

class Order {
  // Create new order
  static async create(orderData) {
    const { user_id, subtotal, shipping, total, shipping_address, payment_method, payment_id, items } = orderData;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, subtotal, shipping, total, shipping_address, payment_method, payment_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, subtotal, shipping, total, JSON.stringify(shipping_address), payment_method, payment_id || null]
      );

      const orderId = orderResult.insertId;

      // Create order items
      if (items && items.length > 0) {
        for (const item of items) {
          await connection.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price]
          );
        }
      }

      await connection.commit();
      return await this.findById(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get order by ID
  static async findById(id) {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) return null;

    const order = orders[0];
    
    // Get order items
    const [items] = await pool.execute(
      `SELECT oi.*, p.name, p.sku, p.images 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    return {
      ...order,
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
      items: items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : []
      }))
    };
  }

  // Get orders by user ID
  static async findByUserId(userId) {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT oi.*, p.name, p.sku, p.images 
           FROM order_items oi 
           LEFT JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = ?`,
          [order.id]
        );

        return {
          ...order,
          shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
          items: items.map(item => ({
            ...item,
            images: item.images ? JSON.parse(item.images) : []
          }))
        };
      })
    );

    return ordersWithItems;
  }

  // Update order status
  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  // Get all orders (admin)
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [orders] = await pool.execute(query, params);

    return orders.map(order => ({
      ...order,
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
    }));
  }
}

module.exports = Order;
