// Search utility functions for advanced search operations
const Product = require('../models/Product');

// Build dynamic search filter based on parameters
const buildSearchFilter = (params) => {
    const {
        query,
        category,
        minPrice,
        maxPrice,
        inStock,
        tags
    } = params;
    
    const filter = { isActive: true };
    
    // Add text search
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
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
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
    
    return filter;
};

// Build sort options for search results
const buildSortOptions = (sortBy, sortOrder) => {
    const validSortFields = ['name', 'price', 'createdAt', 'stock'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const sortOptions = {};
    sortOptions[sortField] = sortDirection;
    
    return sortOptions;
};

// Calculate pagination parameters
const calculatePagination = (page, limit) => {
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit) || 12)); // Max 50 items per page
    const skip = (pageNumber - 1) * limitNumber;
    
    return { pageNumber, limitNumber, skip };
};

// Get price statistics for search results
const getPriceStatistics = async (filter) => {
    try {
        const priceStats = await Product.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        return priceStats.length > 0 ? priceStats[0] : null;
    } catch (error) {
        console.error('Error getting price statistics:', error.message);
        return null;
    }
};

// Get category distribution for search results
const getCategoryDistribution = async (filter) => {
    try {
        const categoryStats = await Product.aggregate([
            { $match: filter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        return categoryStats;
    } catch (error) {
        console.error('Error getting category distribution:', error.message);
        return [];
    }
};

// Get popular tags for search results
const getPopularTags = async (filter, limit = 20) => {
    try {
        const popularTags = await Product.aggregate([
            { $match: filter },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);
        
        return popularTags.map(tag => ({
            name: tag._id,
            count: tag.count
        }));
    } catch (error) {
        console.error('Error getting popular tags:', error.message);
        return [];
    }
};

// Validate search parameters
const validateSearchParams = (params) => {
    const errors = [];
    
    // Validate price range
    if (params.minPrice && isNaN(parseFloat(params.minPrice))) {
        errors.push('Invalid minimum price');
    }
    
    if (params.maxPrice && isNaN(parseFloat(params.maxPrice))) {
        errors.push('Invalid maximum price');
    }
    
    if (params.minPrice && params.maxPrice && parseFloat(params.minPrice) > parseFloat(params.maxPrice)) {
        errors.push('Minimum price cannot be greater than maximum price');
    }
    
    // Validate sort parameters
    const validSortFields = ['name', 'price', 'createdAt', 'stock'];
    if (params.sortBy && !validSortFields.includes(params.sortBy)) {
        errors.push('Invalid sort field');
    }
    
    const validSortOrders = ['asc', 'desc'];
    if (params.sortOrder && !validSortOrders.includes(params.sortOrder)) {
        errors.push('Invalid sort order');
    }
    
    // Validate pagination
    if (params.page && (isNaN(parseInt(params.page)) || parseInt(params.page) < 1)) {
        errors.push('Invalid page number');
    }
    
    if (params.limit && (isNaN(parseInt(params.limit)) || parseInt(params.limit) < 1 || parseInt(params.limit) > 100)) {
        errors.push('Invalid limit (must be between 1 and 100)');
    }
    
    return errors;
};

// Create search response with metadata
const createSearchResponse = (products, totalProducts, pagination, filters, searchParams) => {
    return {
        success: true,
        message: 'Search completed successfully',
        data: {
            products,
            searchParams,
            pagination: {
                ...pagination,
                totalPages: Math.ceil(totalProducts / pagination.limitNumber),
                hasNextPage: pagination.pageNumber < Math.ceil(totalProducts / pagination.limitNumber),
                hasPrevPage: pagination.pageNumber > 1,
                totalProducts
            },
            filters
        }
    };
};

// Export all utility functions
module.exports = {
    buildSearchFilter,
    buildSortOptions,
    calculatePagination,
    getPriceStatistics,
    getCategoryDistribution,
    getPopularTags,
    validateSearchParams,
    createSearchResponse
};
