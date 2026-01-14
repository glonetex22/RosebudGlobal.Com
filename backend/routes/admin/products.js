const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const db = require('../../config/db');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Apply auth to all routes
router.use(authMiddleware);

/**
 * GET /api/admin/products
 * Get all products with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      status = '',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let whereClause = '1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      whereClause += ' AND p.category_id = ?';
      params.push(category);
    }
    
    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Get products
    const allowedSorts = ['created_at', 'name', 'price', 'stock_quantity', 'status'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const [products] = await db.query(
      `SELECT 
        p.*,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}
       ORDER BY p.${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[Products] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    });
  }
});

/**
 * GET /api/admin/products/:id
 * Get single product with all details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const product = products[0];
    
    // Get images
    const [images] = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order, is_primary DESC',
      [id]
    );
    
    product.images = images;
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('[Products] Get single error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product'
    });
  }
});

/**
 * POST /api/admin/products
 * Create new product
 */
router.post('/', [
  body('sku').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('price').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const {
      sku,
      name,
      description,
      shortDescription,
      price,
      salePrice,
      costPrice,
      categoryId,
      brand,
      material,
      dimensions,
      weight,
      color,
      stockQuantity,
      lowStockThreshold,
      status,
      isFeatured,
      isNew,
      isSale,
      actionType,
      metaTitle,
      metaDescription,
      tags,
      images
    } = req.body;
    
    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if SKU exists
    const [existing] = await db.query(
      'SELECT id FROM products WHERE sku = ?',
      [sku]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    
    // Insert product
    const [result] = await db.query(
      `INSERT INTO products (
        sku, name, slug, description, short_description, price, sale_price, cost_price,
        category_id, brand, material, dimensions, weight, color,
        stock_quantity, low_stock_threshold, status, is_featured, is_new, is_sale,
        action_type, meta_title, meta_description, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sku, name, slug, description, shortDescription, price, salePrice || null, costPrice || null,
        categoryId || null, brand, material, dimensions, weight, color,
        stockQuantity || 0, lowStockThreshold || 5, status || 'draft',
        isFeatured || false, isNew || false, isSale || false,
        actionType || 'add_to_cart', metaTitle, metaDescription, tags
      ]
    );
    
    const productId = result.insertId;
    
    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, images[i].url, images[i].alt || name, i, i === 0]
        );
      }
    }
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, new_values) VALUES (?, ?, ?, ?, ?)',
        [req.admin.id, 'create', 'products', productId, JSON.stringify({ sku, name })]
      );
    } catch (logError) {
      console.warn('[Products] Activity log error:', logError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: productId, sku, name }
    });
    
  } catch (error) {
    console.error('[Products] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

/**
 * PUT /api/admin/products/:id
 * Update product
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const [existing] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const oldProduct = existing[0];
    
    const {
      sku,
      name,
      description,
      shortDescription,
      price,
      salePrice,
      costPrice,
      categoryId,
      brand,
      material,
      dimensions,
      weight,
      color,
      stockQuantity,
      lowStockThreshold,
      status,
      isFeatured,
      isNew,
      isSale,
      actionType,
      metaTitle,
      metaDescription,
      tags,
      images
    } = req.body;
    
    // Generate new slug if name changed
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check SKU uniqueness (if changed)
    if (sku !== oldProduct.sku) {
      const [skuCheck] = await db.query(
        'SELECT id FROM products WHERE sku = ? AND id != ?',
        [sku, id]
      );
      
      if (skuCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }
    
    // Update product
    await db.query(
      `UPDATE products SET
        sku = ?, name = ?, slug = ?, description = ?, short_description = ?,
        price = ?, sale_price = ?, cost_price = ?, category_id = ?,
        brand = ?, material = ?, dimensions = ?, weight = ?, color = ?,
        stock_quantity = ?, low_stock_threshold = ?, status = ?,
        is_featured = ?, is_new = ?, is_sale = ?, action_type = ?,
        meta_title = ?, meta_description = ?, tags = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        sku, name, slug, description, shortDescription,
        price, salePrice || null, costPrice || null, categoryId || null,
        brand, material, dimensions, weight, color,
        stockQuantity || 0, lowStockThreshold || 5, status || 'draft',
        isFeatured || false, isNew || false, isSale || false, actionType || 'add_to_cart',
        metaTitle, metaDescription, tags, id
      ]
    );
    
    // Update images if provided
    if (images !== undefined) {
      // Delete old images
      await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      
      // Insert new images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await db.query(
            `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
             VALUES (?, ?, ?, ?, ?)`,
            [id, images[i].url, images[i].alt || name, i, i === 0]
          );
        }
      }
    }
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, old_values, new_values) VALUES (?, ?, ?, ?, ?, ?)',
        [req.admin.id, 'update', 'products', id, JSON.stringify({ sku: oldProduct.sku }), JSON.stringify({ sku, name })]
      );
    } catch (logError) {
      console.warn('[Products] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('[Products] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete product
 */
router.delete('/:id', requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const [existing] = await db.query(
      'SELECT sku, name FROM products WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete product (images will cascade)
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, old_values) VALUES (?, ?, ?, ?, ?)',
        [req.admin.id, 'delete', 'products', id, JSON.stringify(existing[0])]
      );
    } catch (logError) {
      console.warn('[Products] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('[Products] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

/**
 * PUT /api/admin/products/:id/status
 * Quick status update
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['active', 'draft', 'out_of_stock', 'discontinued'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    await db.query(
      'UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Status updated'
    });
    
  } catch (error) {
    console.error('[Products] Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

/**
 * PUT /api/admin/products/:id/stock
 * Quick stock update
 */
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    
    await db.query(
      'UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(stockQuantity) || 0, id]
    );
    
    res.json({
      success: true,
      message: 'Stock updated'
    });
    
  } catch (error) {
    console.error('[Products] Stock update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
});

/**
 * POST /api/admin/products/bulk-action
 * Bulk actions on products
 */
router.post('/bulk-action', requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { action, productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products selected'
      });
    }
    
    const placeholders = productIds.map(() => '?').join(',');
    
    switch (action) {
      case 'activate':
        await db.query(
          `UPDATE products SET status = 'active' WHERE id IN (${placeholders})`,
          productIds
        );
        break;
        
      case 'deactivate':
        await db.query(
          `UPDATE products SET status = 'draft' WHERE id IN (${placeholders})`,
          productIds
        );
        break;
        
      case 'delete':
        await db.query(
          `DELETE FROM products WHERE id IN (${placeholders})`,
          productIds
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_logs (admin_id, action, entity_type, new_values) VALUES (?, ?, ?, ?)',
        [req.admin.id, `bulk_${action}`, 'products', JSON.stringify({ ids: productIds })]
      );
    } catch (logError) {
      console.warn('[Products] Activity log error:', logError.message);
    }
    
    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      affected: productIds.length
    });
    
  } catch (error) {
    console.error('[Products] Bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk action failed'
    });
  }
});

module.exports = router;
