// Advanced search controller for enhanced product filtering and search
const Product = require('../models/Product');

// Advanced search with multiple filters and sorting options
const advancedSearch = async (req, res) => {
    try {
        console.log('Performing advanced search...');
        
        // Extract all query parameters
        const {
            query = '',           // Text search query
            category,             // Product category filter
            minPrice,             // Minimum price filter
            maxPrice,             // Maximum price filter
            inStock = true,       // Stock availability filter
            tags,                 // Tags filter (comma-separated)
            sortBy = 'createdAt', // Sort field
            sortOrder = 'desc',   // Sort direction
            page = 1,             // Page number for pagination
            limit = 12            // Items per page
        } = req.query;
        
        console.log('Search parameters:', { query, category, minPrice, maxPrice, inStock, tags, sortBy, sortOrder });
        
        // Build the search filter object
        const filter = { isActive: true };
        
        // Add text search filter
        if (query && query.trim()) {
            filter.$or = [
                { name: { $regex: query.trim(), $options: 'i' } },
                { description: { $regex: query.trim(), $options: 'i' } },
                { tags: { $in: [new RegExp(query.trim(), 'i')] } }
            ];
        }
        
        // Add category filter
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        // Add price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = parseFloat(maxPrice);
            }
        }
        
        // Add stock filter
        if (inStock === 'true' || inStock === true) {
            filter.stock = { $gt: 0 };
        }
        
        // Add tags filter
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
            if (tagArray.length > 0) {
                filter.tags = { $in: tagArray };
            }
        }
        
        // Build sort object
        const sortOptions = {};
        const validSortFields = ['name', 'price', 'createdAt', 'stock'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        sortOptions[sortField] = sortDirection;
        
        // Calculate pagination
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Limit max 50 items per page
        const skip = (pageNumber - 1) * limitNumber;
        
        console.log('Filter object:', filter);
        console.log('Sort options:', sortOptions);
        
        // Execute search query with pagination
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber)
            .select('-__v');
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limitNumber);
        
        // Get price range for current results
        const priceStats = await Product.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);
        
        // Get available categories for current search
        const availableCategories = await Product.distinct('category', filter);
        
        // Get available tags for current search
        const availableTags = await Product.aggregate([
            { $match: filter },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        
        console.log(`Advanced search completed. Found ${products.length} products out of ${totalProducts} total`);
        
        // Return comprehensive search results
        res.status(200).json({
            success: true,
            message: 'Advanced search completed successfully',
            data: {
                products,
                searchParams: {
                    query: query.trim(),
                    category,
                    minPrice,
                    maxPrice,
                    inStock,
                    tags,
                    sortBy: sortField,
                    sortOrder
                },
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalProducts,
                    limit: limitNumber,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                },
                filters: {
                    priceRange: priceStats.length > 0 ? priceStats[0] : null,
                    availableCategories,
                    availableTags: availableTags.map(tag => ({
                        name: tag._id,
                        count: tag.count
                    }))
                }
            }
        });
        
    } catch (error) {
        console.error('Error in advanced search:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while performing advanced search'
        });
    }
};

// Get search suggestions based on partial query
const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Query must be at least 2 characters long'
            });
        }
        
        console.log('Getting search suggestions for:', query);
        
        // Get product name suggestions
        const productSuggestions = await Product.find({
            name: { $regex: query.trim(), $options: 'i' },
            isActive: true
        })
        .select('name')
        .limit(5);
        
        // Get tag suggestions
        const tagSuggestions = await Product.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$tags' },
            { $match: { tags: { $regex: query.trim(), $options: 'i' } } },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        // Get category suggestions
        const categorySuggestions = await Product.distinct('category', {
            category: { $regex: query.trim(), $options: 'i' },
            isActive: true
        });
        
        console.log('Found suggestions:', {
            products: productSuggestions.length,
            tags: tagSuggestions.length,
            categories: categorySuggestions.length
        });
        
        res.status(200).json({
            success: true,
            message: 'Search suggestions retrieved successfully',
            data: {
                products: productSuggestions.map(p => p.name),
                tags: tagSuggestions.map(t => t._id),
                categories: categorySuggestions
            }
        });
        
    } catch (error) {
        console.error('Error getting search suggestions:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while getting search suggestions'
        });
    }
};

// Get filter options for the frontend
const getFilterOptions = async (req, res) => {
    try {
        console.log('Getting filter options...');
        
        // Get all available categories
        const categories = await Product.distinct('category', { isActive: true });
        
        // Get price range
        const priceRange = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);
        
        // Get all available tags with counts
        const tags = await Product.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);
        
        console.log('Filter options retrieved successfully');
        
        res.status(200).json({
            success: true,
            message: 'Filter options retrieved successfully',
            data: {
                categories: categories.map(cat => ({
                    value: cat,
                    label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')
                })),
                priceRange: priceRange.length > 0 ? {
                    min: Math.floor(priceRange[0].minPrice),
                    max: Math.ceil(priceRange[0].maxPrice)
                } : { min: 0, max: 1000 },
                tags: tags.map(tag => ({
                    name: tag._id,
                    count: tag.count
                })),
                sortOptions: [
                    { value: 'createdAt-desc', label: 'Newest First' },
                    { value: 'createdAt-asc', label: 'Oldest First' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'name-asc', label: 'Name: A to Z' },
                    { value: 'name-desc', label: 'Name: Z to A' }
                ]
            }
        });
        
    } catch (error) {
        console.error('Error getting filter options:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while getting filter options'
        });
    }
};

// Get search analytics (for admin)
const getSearchAnalytics = async (req, res) => {
    try {
        console.log('Getting search analytics...');
        
        // Get product count by category
        const categoryStats = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get price distribution
        const priceDistribution = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                        avgPrice: { $avg: '$price' }
                    }
                }
            }
        ]);
        
        // Get stock status
        const stockStats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    inStock: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
                    outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
                    totalStock: { $sum: '$stock' }
                }
            }
        ]);
        
        console.log('Search analytics retrieved successfully');
        
        res.status(200).json({
            success: true,
            message: 'Search analytics retrieved successfully',
            data: {
                categoryStats,
                priceDistribution,
                stockStats: stockStats.length > 0 ? stockStats[0] : {},
                timestamp: new Date()
            }
        });
        
    } catch (error) {
        console.error('Error getting search analytics:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while getting search analytics'
        });
    }
};

// Export all controller functions
module.exports = {
    advancedSearch,
    getSearchSuggestions,
    getFilterOptions,
    getSearchAnalytics
};
