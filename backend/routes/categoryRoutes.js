// Category routes for API endpoints
const express = require('express');
const router = express.Router();

// GET /api/categories - Get allowed categories with product counts
router.get('/', async (req, res) => {
    try {
        const Product = require('../models/Product');
        const allowed = [
            { name: 'jewelry', displayName: 'Jewelry' },
            { name: 'crafts', displayName: 'Crafts' },
            { name: 'clothing', displayName: 'Clothing' },
            { name: 'textiles', displayName: 'Textiles' }
        ];

        const categoriesWithCounts = await Promise.all(
            allowed.map(async (cat) => {
                const count = await Product.countDocuments({ category: cat.name, isActive: true });
                return { name: cat.name, displayName: cat.displayName, slug: cat.name, count };
            })
        );

        res.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            error: 'Failed to fetch categories',
            message: error.message 
        });
    }
});

module.exports = router;
