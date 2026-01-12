const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate, adminOnly } = require('../middleware/auth');

// Create new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { subtotal, shipping, total, shipping_address, payment_method, payment_id, items } = req.body;

    // Validate input
    if (!subtotal || !total || !shipping_address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields'
      });
    }

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      subtotal,
      shipping,
      total,
      shipping_address,
      payment_method: payment_method || 'card',
      payment_id,
      items
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// Get user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticate, adminOnly, async (req, res) => {
  try {
    const { status, user_id, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (user_id) filters.user_id = parseInt(user_id);
    if (limit) filters.limit = parseInt(limit);

    const orders = await Order.findAll(filters);

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.updateStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

module.exports = router;
