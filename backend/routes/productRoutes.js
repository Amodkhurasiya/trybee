// Product routes for API endpoints
const express = require('express');
const router = express.Router();

// Import product controller functions
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts
} = require('../controllers/productController');

// Import middleware for authentication and authorization
const { requireAdmin, requireAuth } = require('../middleware/adminMiddleware');
const { getProductReviews, upsertReview, deleteOwnReview } = require('../controllers/reviewController');

// Public routes (no authentication required)
// GET /api/products - Get all products with pagination and filtering
router.get('/', getAllProducts);

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
    try {
        const Product = require('../models/Product');
        // Get latest products as featured products since isFeatured field doesn't exist
        const featuredProducts = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .select('name description price images category slug');
        res.json(featuredProducts);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ error: 'Failed to fetch featured products' });
    }
});

// GET /api/products/categories - Get all available categories
router.get('/categories', async (req, res) => {
    try {
        const Product = require('../models/Product');
        const categories = await Product.distinct('category');
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.countDocuments({ category, isActive: true });
                return { name: category, count, slug: category };
            })
        );
        res.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/products/search - Search products
router.get('/search', searchProducts);

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', getProductsByCategory);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getProductById);

// Reviews
// GET /api/products/:productId/reviews - list reviews
router.get('/:productId/reviews', getProductReviews);
// POST /api/products/:productId/reviews - add/update current user's review
router.post('/:productId/reviews', requireAuth, upsertReview);
// DELETE /api/products/:productId/reviews/me - delete current user's review
router.delete('/:productId/reviews/me', requireAuth, deleteOwnReview);

// Protected routes (admin authentication required)
// POST /api/products - Create new product (Admin only)
router.post('/', requireAdmin, createProduct);

// PUT /api/products/:id - Update product by ID (Admin only)
router.put('/:id', requireAdmin, updateProduct);

// DELETE /api/products/:id - Delete product by ID (Admin only)
router.delete('/:id', requireAdmin, deleteProduct);

// Export the router
module.exports = router;
