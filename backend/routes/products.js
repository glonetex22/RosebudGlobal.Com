const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

// Get all products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, location, search, limit, offset } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    // Default: Only show USA products to non-admin users
    // Admin users can see all products
    if (!req.user || req.user.role !== 'admin') {
      filters.location = 'USA';
    }

    const products = await Product.findAll(filters);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Get product by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check location - non-admin users can't see Nigerian products
    if ((!req.user || req.user.role !== 'admin') && product.location === 'NG') {
      return res.status(403).json({
        success: false,
        message: 'Product not available'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// Get products by category
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const filters = {
      category: req.params.category
    };

    // Default: Only show USA products to non-admin users
    if (!req.user || req.user.role !== 'admin') {
      filters.location = 'USA';
    }

    const products = await Product.findAll(filters);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

module.exports = router;
