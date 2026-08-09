// User routes for profile management
const express = require('express');
const router = express.Router();

// Import user controller functions
const {
    getUserProfile,
    updateUserProfile,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getUserAddresses,
    changePassword
} = require('../controllers/userController');

// Import middleware for authentication
const { authenticateToken } = require('../middleware/authMiddleware');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

// All user routes require authentication
router.use(authenticateToken);

// Profile management routes
// GET /api/users/profile - Get user profile
router.get('/profile', getUserProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', updateUserProfile);

// Address management routes
// GET /api/users/addresses - Get all user addresses
router.get('/addresses', getUserAddresses);

// POST /api/users/addresses - Add new address
router.post('/addresses', addUserAddress);

// PUT /api/users/addresses/:addressId - Update specific address
router.put('/addresses/:addressId', updateUserAddress);

// DELETE /api/users/addresses/:addressId - Delete specific address
router.delete('/addresses/:addressId', deleteUserAddress);

// PUT /api/users/change-password - Change password
router.put('/change-password', changePassword);

// Wishlist routes
// GET /api/users/wishlist - Get wishlist
router.get('/wishlist', getWishlist);
// POST /api/users/wishlist/add - Add product to wishlist { productId }
router.post('/wishlist/add', addToWishlist);
// DELETE /api/users/wishlist/remove/:productId - Remove product from wishlist
router.delete('/wishlist/remove/:productId', removeFromWishlist);

// Export the router
module.exports = router;
