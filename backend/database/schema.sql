-- ============================================================
-- ROSEBUD GLOBAL - COMPLETE DATABASE SCHEMA
-- ============================================================

-- Drop existing tables if needed (careful in production!)
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS order_items, orders, inquiry_items, inquiries, product_images, products, categories, admin_users, settings, activity_logs;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ADMIN USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin', 'admin', 'manager', 'staff') DEFAULT 'staff',
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id INT NULL,
  image VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_parent (parent_id),
  INDEX idx_active (is_active)
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(10, 2) NULL,
  cost_price DECIMAL(10, 2) NULL,
  category_id INT,
  brand VARCHAR(255),
  material VARCHAR(255),
  dimensions VARCHAR(255),
  weight VARCHAR(100),
  color VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  status ENUM('active', 'draft', 'out_of_stock', 'discontinued') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_sale BOOLEAN DEFAULT FALSE,
  action_type ENUM('add_to_cart', 'make_inquiry') DEFAULT 'add_to_cart',
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags VARCHAR(500),
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_sku (sku),
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  INDEX idx_price (price)
);

-- ============================================================
-- PRODUCT IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_primary (is_primary)
);

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar VARCHAR(500),
  google_id VARCHAR(255),
  paypal_id VARCHAR(255),
  is_guest BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_google (google_id)
);

-- ============================================================
-- CUSTOMER ADDRESSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  address_type ENUM('shipping', 'billing') DEFAULT 'shipping',
  is_default BOOLEAN DEFAULT FALSE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  street_address VARCHAR(255) NOT NULL,
  apartment VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'United States',
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer (customer_id)
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT,
  
  -- Customer Info (for guest checkout)
  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(100),
  customer_last_name VARCHAR(100),
  customer_phone VARCHAR(50),
  
  -- Shipping Address
  shipping_first_name VARCHAR(100),
  shipping_last_name VARCHAR(100),
  shipping_company VARCHAR(255),
  shipping_street VARCHAR(255),
  shipping_apartment VARCHAR(100),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_zip VARCHAR(20),
  shipping_country VARCHAR(100) DEFAULT 'United States',
  shipping_phone VARCHAR(50),
  
  -- Billing Address
  billing_same_as_shipping BOOLEAN DEFAULT TRUE,
  billing_first_name VARCHAR(100),
  billing_last_name VARCHAR(100),
  billing_company VARCHAR(255),
  billing_street VARCHAR(255),
  billing_apartment VARCHAR(100),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_zip VARCHAR(20),
  billing_country VARCHAR(100) DEFAULT 'United States',
  
  -- Order Totals
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_code VARCHAR(50),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  
  -- Payment
  payment_method ENUM('stripe', 'paypal', 'cod') DEFAULT 'stripe',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_details JSON,
  
  -- Order Status
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  
  -- Shipping
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_order_number (order_number),
  INDEX idx_customer (customer_id),
  INDEX idx_email (customer_email),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created (created_at)
);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  options JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- ============================================================
-- INQUIRIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT,
  
  -- Contact Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  
  -- Inquiry Details
  subject VARCHAR(255),
  message TEXT,
  
  -- Status
  status ENUM('new', 'in_progress', 'responded', 'converted', 'closed') DEFAULT 'new',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  
  -- Assignment
  assigned_to INT,
  
  -- Response
  response TEXT,
  responded_at TIMESTAMP NULL,
  responded_by INT,
  
  -- Conversion
  converted_to_order INT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
  FOREIGN KEY (responded_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  FOREIGN KEY (converted_to_order) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_inquiry_number (inquiry_number),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_assigned (assigned_to)
);

-- ============================================================
-- INQUIRY ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiry_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT NOT NULL,
  product_id INT,
  product_sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  quantity INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_inquiry (inquiry_id)
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  customer_id INT,
  order_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  customer_name VARCHAR(100),
  customer_avatar VARCHAR(500),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_rating (rating),
  INDEX idx_approved (is_approved)
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('active', 'unsubscribed') DEFAULT 'active',
  source VARCHAR(50) DEFAULT 'website',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,
  unsubscribe_token VARCHAR(64),
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- ============================================================
-- SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  category VARCHAR(100) DEFAULT 'general',
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key),
  INDEX idx_category (category)
);

-- ============================================================
-- ACTIVITY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_admin (admin_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);

-- ============================================================
-- INSERT DEFAULT DATA
-- ============================================================

-- Default Super Admin (password: Admin@123456)
-- NOTE: Replace $2b$10$PLACEHOLDER_HASH_CHANGE_ME with actual bcrypt hash
-- Default Admin Users
-- Demo User: demo@rosebudglobal.com / Demo@123456
-- Super Admin: admin@rosebudglobal.com / Admin@123456
INSERT INTO admin_users (email, password, first_name, last_name, role, is_active) VALUES
('demo@rosebudglobal.com', '$2a$10$WSnEWxbZQ7vyU/zKbEoN9u2AtugJUCAFKrFpltfmcZeOiL3VLbGiq', 'Demo', 'User', 'admin', 1),
('admin@rosebudglobal.com', '$2a$10$w2tzuz0ABvoH/w54oj7CR.YRtGJQXL3mD9wAr5bRW4qRvH597OP9m', 'Super', 'Admin', 'super_admin', 1)
ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  role = VALUES(role),
  is_active = VALUES(is_active);

-- Default Categories
INSERT INTO categories (name, slug, description, is_active, display_order) VALUES
('Sale Items', 'sale-items', 'Products on sale', TRUE, 1),
('Household Items', 'household-items', 'Household products', TRUE, 2),
('Custom Gift Items', 'custom-gift-items', 'Custom gift products', TRUE, 3),
('Home Decor & Accessories', 'home-decor-accessories', 'Home decor and accessories', TRUE, 4),
('Specialty Items', 'specialty-items', 'Specialty products', TRUE, 5),
('Wholesale', 'wholesale', 'Wholesale products', TRUE, 6)
ON DUPLICATE KEY UPDATE name=name;

-- Default Settings
INSERT INTO settings (setting_key, setting_value, setting_type, category, description) VALUES
('site_name', 'RoseBud Global', 'string', 'general', 'Website name'),
('site_tagline', 'Gift & Decoration Store', 'string', 'general', 'Website tagline'),
('contact_email', 'info@rosebudglobal.com', 'string', 'contact', 'Contact email'),
('contact_phone', '+1 (555) 123-4567', 'string', 'contact', 'Contact phone'),
('shipping_free_threshold', '100', 'number', 'shipping', 'Free shipping threshold'),
('shipping_standard_rate', '9.99', 'number', 'shipping', 'Standard shipping rate'),
('tax_rate', '0', 'number', 'tax', 'Tax rate percentage'),
('currency', 'USD', 'string', 'general', 'Currency code'),
('currency_symbol', '$', 'string', 'general', 'Currency symbol')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
