const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../../middleware/auth');

router.use(authMiddleware);

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

// Ensure upload directories exist
const uploadDirs = ['products', 'categories', 'general'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../../uploads', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

/**
 * POST /api/admin/upload/image
 * Upload single image
 */
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }
    
    const { folder = 'general', resize = 'true' } = req.body;
    const allowedFolders = ['products', 'categories', 'general'];
    const targetFolder = allowedFolders.includes(folder) ? folder : 'general';
    
    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(__dirname, '../../uploads', targetFolder, filename);
    
    // Process image with sharp
    let imageProcessor = sharp(req.file.buffer);
    
    if (resize === 'true') {
      imageProcessor = imageProcessor.resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    await imageProcessor
      .webp({ quality: 85 })
      .toFile(filepath);
    
    // Return URL
    const imageUrl = `/uploads/${targetFolder}/${filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded',
      data: {
        url: imageUrl,
        filename
      }
    });
    
  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

/**
 * POST /api/admin/upload/images
 * Upload multiple images
 */
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }
    
    const { folder = 'products' } = req.body;
    const uploadedImages = [];
    
    for (const file of req.files) {
      const filename = `${uuidv4()}.webp`;
      const filepath = path.join(__dirname, '../../uploads', folder, filename);
      
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath);
      
      uploadedImages.push({
        url: `/uploads/${folder}/${filename}`,
        filename,
        originalName: file.originalname
      });
    }
    
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded`,
      data: uploadedImages
    });
    
  } catch (error) {
    console.error('[Upload] Multiple images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
});

/**
 * DELETE /api/admin/upload/image
 * Delete an image
 */
router.delete('/image', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL'
      });
    }
    
    const filepath = path.join(__dirname, '../..', url);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    res.json({
      success: true,
      message: 'Image deleted'
    });
    
  } catch (error) {
    console.error('[Upload] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

module.exports = router;
