const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authMiddleware, requireRole } = require('../../middleware/auth');

router.use(authMiddleware);

// GET all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c
       ORDER BY c.display_order, c.name`
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get categories' });
  }
});

// GET single category
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: categories[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get category' });
  }
});

// POST create category
router.post('/', async (req, res) => {
  try {
    const { name, description, parentId, image, displayOrder, isActive, metaTitle, metaDescription } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const [result] = await db.query(
      `INSERT INTO categories (name, slug, description, parent_id, image, display_order, is_active, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, parentId || null, image, displayOrder || 0, isActive !== false, metaTitle, metaDescription]
    );
    
    res.status(201).json({ success: true, message: 'Category created', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, parentId, image, displayOrder, isActive, metaTitle, metaDescription } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    await db.query(
      `UPDATE categories SET name = ?, slug = ?, description = ?, parent_id = ?, image = ?, 
       display_order = ?, is_active = ?, meta_title = ?, meta_description = ? WHERE id = ?`,
      [name, slug, description, parentId || null, image, displayOrder || 0, isActive !== false, metaTitle, metaDescription, req.params.id]
    );
    
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

module.exports = router;
