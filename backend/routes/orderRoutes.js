// Order Routes - Order Management API Endpoints
// Handles user order operations and admin order management

const express = require('express');
const router = express.Router();

// Import middlewares
const { authenticateToken, requireVerification } = require('../middleware/authMiddleware');

// Import order controller
const orderController = require('../controllers/orderController');

// Destructure functions
const {
    // User functions
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    
    // Admin functions
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} = orderController;

// Simple admin check middleware
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// USER ORDER ROUTES (Authentication required)

// POST /api/orders/create - Create new order from cart
// Body: { shippingAddress, paymentMethod, notes }
router.post('/create', authenticateToken, createOrder);

// GET /api/orders/user - Get user orders with pagination
// Query: ?page=1&limit=10&status=pending
router.get('/user', authenticateToken, getUserOrders);

// GET /api/orders/:orderId - Get single order by ID
// Returns detailed order information
router.get('/:orderId', authenticateToken, getOrderById);

// PUT /api/orders/:orderId/cancel - Cancel order
// User can cancel pending or confirmed orders
router.put('/:orderId/cancel', authenticateToken, cancelOrder);

// ADMIN ORDER ROUTES (Admin authentication required)

// GET /api/orders/admin/all - Get all orders (Admin only)
// Query: ?page=1&limit=10&status=pending&userId=123
router.get('/admin/all', authenticateToken, requireAdmin, getAllOrders);

// GET /api/orders/admin/stats - Get order statistics (Admin only)
// Returns order counts by status and recent orders
router.get('/admin/stats', authenticateToken, requireAdmin, getOrderStats);

// PUT /api/orders/admin/:orderId/status - Update order status (Admin only)
// Body: { status, adminNotes }
router.put('/admin/:orderId/status', authenticateToken, requireAdmin, updateOrderStatus);

// DELETE /api/orders/admin/:orderId - Delete order (Admin only)
// Permanently deletes order and restores stock
router.delete('/admin/:orderId', authenticateToken, requireAdmin, deleteOrder);

module.exports = router;
