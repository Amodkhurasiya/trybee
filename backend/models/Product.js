// Product model for e-commerce platform
const mongoose = require('mongoose');

// Product Schema Definition
const productSchema = new mongoose.Schema({
    // Basic product information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    
    // Pricing information
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        max: [999999, 'Price cannot exceed 999999']
    },
    
    // Product categorization
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['jewelry', 'crafts', 'clothing', 'textiles'],
            message: 'Please select a valid category (jewelry, crafts, clothing, textiles)'
        }
    },
    
    // Image handling
    images: [{
        type: String,
        trim: true
    }],
    
    // Stock management
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    
    // Product status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Additional product details
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    
    dimensions: {
        length: {
            type: Number,
            min: [0, 'Length cannot be negative']
        },
        width: {
            type: Number,
            min: [0, 'Width cannot be negative']
        },
        height: {
            type: Number,
            min: [0, 'Height cannot be negative']
        }
    },
    
    // Tags for better search
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // SEO optimization
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },

    // Reviews
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 }
}, {
    // Automatic timestamps
    timestamps: true,
    
    // Transform function for JSON output
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Pre-save middleware to generate slug from name
productSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug || this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        // Add timestamp to ensure uniqueness
        this.slug += '-' + Date.now();
    }
    
    next();
});

// Instance method to check if product is in stock
productSchema.methods.isInStock = function() {
    return this.stock > 0;
};

// Instance method to reduce stock
productSchema.methods.reduceStock = function(quantity) {
    if (this.stock >= quantity) {
        this.stock -= quantity;
        return true;
    }
    return false;
};

// Instance method to increase stock
productSchema.methods.increaseStock = function(quantity) {
    this.stock += quantity;
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ 
        category: category, 
        isActive: true 
    });
};

// Static method to find products in price range
productSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
    return this.find({ 
        price: { $gte: minPrice, $lte: maxPrice }, 
        isActive: true 
    });
};

// Static method to search products by name or description
productSchema.statics.searchProducts = function(searchTerm) {
    return this.find({ 
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ],
        isActive: true 
    });
};

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });

// Create and export the model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
