const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { authMiddleware, requireRole } = require('../../middleware/auth');

router.use(authMiddleware);

// GET all settings
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings ORDER BY category, setting_key');
    
    // Group by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) acc[setting.category] = [];
      acc[setting.category].push(setting);
      return acc;
    }, {});
    
    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get settings' });
  }
});

// GET single setting
router.get('/:key', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings WHERE setting_key = ?', [req.params.key]);
    if (settings.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, data: settings[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get setting' });
  }
});

// PUT update setting
router.put('/:key', requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { value } = req.body;
    
    await db.query(
      'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
      [value, req.params.key]
    );
    
    res.json({ success: true, message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update setting' });
  }
});

// POST create setting
router.post('/', requireRole('super_admin'), async (req, res) => {
  try {
    const { key, value, type, category, description } = req.body;
    
    await db.query(
      'INSERT INTO settings (setting_key, setting_value, setting_type, category, description) VALUES (?, ?, ?, ?, ?)',
      [key, value, type || 'string', category || 'general', description]
    );
    
    res.status(201).json({ success: true, message: 'Setting created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create setting' });
  }
});

module.exports = router;
