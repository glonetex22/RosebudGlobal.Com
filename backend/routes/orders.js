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

// ========================================
// STRIPE PAYMENT INTENT
// ========================================

router.post('/create-payment-intent', async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, currency } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true }
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
});

// ========================================
// PAYPAL ORDER CREATION
// ========================================

router.post('/create-paypal-order', async (req, res) => {
  try {
    const axios = require('axios');
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    // PayPal API endpoint (sandbox or production)
    const paypalBaseUrl = process.env.PAYPAL_ENVIRONMENT === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    // Get access token
    const authResponse = await axios.post(
      `${paypalBaseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET
        }
      }
    );
    
    const accessToken = authResponse.data.access_token;
    
    // Create order
    const orderResponse = await axios.post(
      `${paypalBaseUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          }
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    res.json({
      success: true,
      id: orderResponse.data.id
    });
  } catch (error) {
    console.error('Create PayPal order error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating PayPal order',
      error: error.response?.data?.message || error.message
    });
  }
});

// ========================================
// PAYPAL ORDER CAPTURE
// ========================================

router.post('/capture-paypal-order', async (req, res) => {
  try {
    const axios = require('axios');
    const { orderID } = req.body;
    
    if (!orderID) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // PayPal API endpoint (sandbox or production)
    const paypalBaseUrl = process.env.PAYPAL_ENVIRONMENT === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    // Get access token
    const authResponse = await axios.post(
      `${paypalBaseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET
        }
      }
    );
    
    const accessToken = authResponse.data.access_token;
    
    // Capture order
    const captureResponse = await axios.post(
      `${paypalBaseUrl}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    res.json({
      success: true,
      id: captureResponse.data.id,
      status: captureResponse.data.status
    });
  } catch (error) {
    console.error('Capture PayPal order error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error capturing PayPal order',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
