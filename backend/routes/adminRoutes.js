// Admin Routes - Admin dashboard and management endpoints
// Provides comprehensive admin functionality for managing the platform

const express = require('express');
const router = express.Router();

// Import middlewares
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Import admin controller
const adminController = require('../controllers/adminController');

// Destructure functions
const {
    getAdminStats,
    getAllUsers,
    updateUserStatus
} = adminController;

// ADMIN DASHBOARD ROUTES

// GET /api/admin/stats - Get comprehensive admin dashboard statistics
// Returns overview metrics, growth data, analytics, and recent activity
router.get('/stats', requireAdmin, getAdminStats);

// ADMIN USER MANAGEMENT ROUTES

// GET /api/admin/users - Get all users with filtering and pagination
// Query: ?page=1&limit=20&search=john&isActive=true&isVerified=true&isAdmin=false
router.get('/users', requireAdmin, getAllUsers);

// PUT /api/admin/users/:userId/status - Update user status
// Body: { isActive, isVerified, isAdmin }
router.put('/users/:userId/status', requireAdmin, updateUserStatus);

module.exports = router;
