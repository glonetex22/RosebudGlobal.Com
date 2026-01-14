require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./config/db');

// Optional middleware (install with: npm install helmet morgan)
let helmet, morgan;
try {
  helmet = require('helmet');
  morgan = require('morgan');
} catch (e) {
  console.warn('[Server] Optional packages not installed: helmet, morgan');
}

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const inquiryRoutes = require('./routes/inquiries');
const newsletterRoutes = require('./routes/newsletter');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
    'http://localhost:8000',
    'https://rosebudglobal.com',
    'https://www.rosebudglobal.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
if (helmet) app.use(helmet());
app.use(cors(corsOptions));
if (morgan) app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging (fallback if morgan not available)
if (!morgan) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    success: true,
    message: 'RoseBud Global API is running',
    timestamp: new Date().toISOString()
  });
});

// Admin API Routes
app.use('/api/admin/auth', require('./routes/admin/auth'));
app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/api/admin/products', require('./routes/admin/products'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/orders', require('./routes/admin/orders'));
app.use('/api/admin/inquiries', require('./routes/admin/inquiries'));
app.use('/api/admin/customers', require('./routes/admin/customers'));
app.use('/api/admin/settings', require('./routes/admin/settings'));
app.use('/api/admin/upload', require('./routes/admin/upload'));

// Public API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;
