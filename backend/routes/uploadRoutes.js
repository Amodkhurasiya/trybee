// Upload routes for handling file uploads and avatar management
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { handleProductImageUpload } = require('../middleware/uploadMiddleware');
const {
    uploadProductImages,
    updateProductImages,
    getAvatars,
    updateUserAvatar,
    deleteProductImageFile,
    getUserAvatar
} = require('../controllers/uploadController');

// Avatar Management Routes

// GET /api/upload/avatars - Get all available avatars (no auth required for browsing)
router.get('/avatars', getAvatars);

// GET /api/upload/user/avatar - Get user's current avatar (authentication required)
router.get('/user/avatar', authenticateToken, getUserAvatar);

// PUT /api/upload/user/avatar - Update user's avatar selection (authentication required)
router.put('/user/avatar', authenticateToken, updateUserAvatar);

// Product Image Upload Routes (Admin Only)

// POST /api/upload/products/images - Upload product images (admin only)
router.post('/products/images', authenticateToken, requireAdmin, handleProductImageUpload, uploadProductImages);

// PUT /api/upload/products/:productId/images - Update specific product images (admin only)
router.put('/products/:productId/images', authenticateToken, requireAdmin, handleProductImageUpload, updateProductImages);

// DELETE /api/upload/products/images/:filename - Delete specific product image (admin only)
router.delete('/products/images/:filename', authenticateToken, requireAdmin, deleteProductImageFile);

module.exports = router;
