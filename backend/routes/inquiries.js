const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { authenticate, optionalAuth, adminOnly } = require('../middleware/auth');

// Create new inquiry
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, message, products } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      user_id: req.user ? req.user.id : null,
      name,
      email,
      phone,
      message,
      products: products || []
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting inquiry'
    });
  }
});

// Get user's inquiries
router.get('/', authenticate, async (req, res) => {
  try {
    const inquiries = await Inquiry.findByUserId(req.user.id);

    res.json({
      success: true,
      count: inquiries.length,
      inquiries
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries'
    });
  }
});

// Get all inquiries (admin only)
router.get('/admin/all', authenticate, adminOnly, async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const inquiries = await Inquiry.findAll(filters);

    res.json({
      success: true,
      count: inquiries.length,
      inquiries
    });
  } catch (error) {
    console.error('Get all inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries'
    });
  }
});

// Get inquiry by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if user owns the inquiry or is admin
    if (inquiry.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry'
    });
  }
});

// Update inquiry status (admin only)
router.patch('/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['new', 'contacted', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const inquiry = await Inquiry.updateStatus(req.params.id, status);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry status updated',
      inquiry
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inquiry status'
    });
  }
});

module.exports = router;
