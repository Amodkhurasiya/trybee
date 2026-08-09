// Cart Routes - Shopping Cart API Endpoints
// Handles all cart-related routes with authentication

const express = require('express');
const router = express.Router();

// Import middlewares
const { authenticateToken } = require('../middleware/authMiddleware');

// Import cart controller functions
const {
    getUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get user cart with all items
// Returns user cart with populated product details
router.get('/', getUserCart);

// GET /api/cart/summary - Get cart summary (item count and total)
// Returns basic cart information for header/nav display
router.get('/summary', getCartSummary);

// POST /api/cart/add - Add item to cart
// Body: { productId, quantity }
router.post('/add', addToCart);

// PUT /api/cart/update - Update cart item quantity
// Body: { productId, quantity }
router.put('/update', updateCartItem);

// DELETE /api/cart/remove/:productId - Remove item from cart
// Removes specific product from cart
router.delete('/remove/:productId', removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
// Removes all items from cart
router.delete('/clear', clearCart);

module.exports = router;
