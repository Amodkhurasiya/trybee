// Product controller for CRUD operations
const Product = require('../models/Product');
const { deleteProductImage } = require('../middleware/uploadMiddleware');

// Create a new product (Admin only)
const createProduct = async (req, res) => {
    try {
        console.log('Creating new product...');
        
        // Extract product data from request body
        const {
            name,
            description,
            price,
            category,
            images,
            stock,
            weight,
            dimensions,
            tags
        } = req.body;
        
        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, price, category'
            });
        }
        
        // Create new product object
        const productData = {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category,
            stock: stock || 0,
            images: images || [],
            weight: weight || null,
            dimensions: dimensions || {},
            tags: tags || []
        };
        
        // Create product in database
        const product = await Product.create(productData);
        
        console.log('Product created successfully:', product.name);
        
        // Return success response with product data
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product
            }
        });
        
    } catch (error) {
        console.error('Error creating product:', error.message);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        // Handle duplicate key error (slug)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A product with similar name already exists'
            });
        }
        
        // General server error
        res.status(500).json({
            success: false,
            message: 'Server error while creating product'
        });
    }
};

// Get all products with pagination and filtering
const getAllProducts = async (req, res) => {
    try {
        console.log('Fetching all products...');
        
        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            category,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            isActive = true
        } = req.query;
        
        // Build filter object
        const filter = {};
        // Handle isActive filter: accept true/false or 'all' to include both
        if (typeof isActive !== 'undefined' && isActive !== 'all') {
            // Note: query params are strings, map 'true'/'false' to booleans; allow boolean too
            const activeVal = (isActive === true || isActive === 'true');
            filter.isActive = activeVal;
        }
        
        // Add category filter
        if (category) {
            filter.category = category;
        }
        
        // Add price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        // Add search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Calculate pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        // Execute query with pagination
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNumber);
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limitNumber);
        
        console.log(`Found ${products.length} products out of ${totalProducts} total`);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: {
                products,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalProducts,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching products:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log('Fetching product by ID:', productId);
        
        // Find product by ID
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        console.log('Product found:', product.name);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: {
                product
            }
        });
        
    } catch (error) {
        console.error('Error fetching product by ID:', error.message);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while fetching product'
        });
    }
};

// Update product by ID (Admin only)
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log('Updating product ID:', productId);
        
        // Extract update data from request body
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        
        // Find and update product
        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { 
                new: true, // Return updated document
                runValidators: true // Run model validators
            }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        console.log('Product updated successfully:', product.name);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: {
                product
            }
        });
        
    } catch (error) {
        console.error('Error updating product:', error.message);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating product'
        });
    }
};

// Delete product by ID (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log('Deleting product ID:', productId);
        
        // Find and delete product
        const product = await Product.findByIdAndDelete(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        console.log('Product deleted successfully:', product.name);

        // Best-effort cleanup: delete associated image files from uploads
        try {
            const images = Array.isArray(product.images) ? product.images : [];
            if (images.length > 0) {
                const results = await Promise.allSettled(images.map(async (filename) => {
                    // Only delete the file if no other products reference it
                    const refs = await Product.countDocuments({ images: filename });
                    if (refs === 0) {
                        return deleteProductImage(filename);
                    } else {
                        console.log(`Skip deleting '${filename}' - still referenced by ${refs} product(s)`);
                        return true;
                    }
                }));
                const deleted = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.length - deleted;
                console.log(`Product image cleanup: ${deleted} deleted, ${failed} failed`);
            }
        } catch (cleanupErr) {
            console.error('Error during product image cleanup:', cleanupErr.message);
            // Do not fail the API response due to cleanup errors
        }
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: {
                deletedProduct: {
                    id: product._id,
                    name: product.name
                }
            }
        });
        
    } catch (error) {
        console.error('Error deleting product:', error.message);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product'
        });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        console.log('Fetching products by category:', category);
        
        // Calculate pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        
        // Find products by category
        const products = await Product.findByCategory(category)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);
        
        // Get total count
        const totalProducts = await Product.countDocuments({ 
            category, 
            isActive: true 
        });
        
        const totalPages = Math.ceil(totalProducts / limitNumber);
        
        console.log(`Found ${products.length} products in category: ${category}`);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: `Products in category '${category}' fetched successfully`,
            data: {
                products,
                category,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalProducts,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching products by category:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products by category'
        });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        console.log('Searching products with query:', query);
        
        // Calculate pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        
        // Search products
        const products = await Product.searchProducts(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ],
            isActive: true
        });
        
        const totalPages = Math.ceil(totalProducts / limitNumber);
        
        console.log(`Found ${products.length} products matching query: ${query}`);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Product search completed successfully',
            data: {
                products,
                searchQuery: query,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalProducts,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Error searching products:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while searching products'
        });
    }
};

// Export all controller functions
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts
};
