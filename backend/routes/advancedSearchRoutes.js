// Advanced search routes for enhanced product filtering
const express = require('express');
const router = express.Router();

// Import advanced search controller functions
const {
    advancedSearch,
    getSearchSuggestions,
    getFilterOptions,
    getSearchAnalytics
} = require('../controllers/advancedSearchController');

// Import middleware for admin authentication
const { requireAdmin } = require('../middleware/adminMiddleware');

// Public routes (no authentication required)

// GET /api/search/advanced - Advanced search with multiple filters
router.get('/advanced', advancedSearch);

// GET /api/search/suggestions - Get search suggestions for autocomplete
router.get('/suggestions', getSearchSuggestions);

// GET /api/search/filters - Get available filter options
router.get('/filters', getFilterOptions);

// Protected routes (admin authentication required)

// GET /api/search/analytics - Get search analytics (Admin only)
router.get('/analytics', requireAdmin, getSearchAnalytics);

// Export the router
module.exports = router;
