// Cart Model - Shopping Cart for Users
// Handles user shopping cart with product items, quantities, and persistence

const mongoose = require('mongoose');

// Cart item schema for individual products in cart
const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Main cart schema for user shopping cart
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true // Each user can have only one cart
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total items and amount before saving
cartSchema.pre('save', function(next) {
    // Calculate total items
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    
    // Calculate total amount
    this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update last updated timestamp
    this.lastUpdated = new Date();
    
    next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, price) {
    // Check if item already exists in cart
    const existingItemIndex = this.items.findIndex(item => 
        item.productId.toString() === productId.toString()
    );
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        this.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        this.items.push({
            productId,
            quantity,
            price
        });
    }
    
    return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const itemIndex = this.items.findIndex(item => 
        item.productId.toString() === productId.toString()
    );
    
    if (itemIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            this.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            this.items[itemIndex].quantity = quantity;
        }
    }
    
    return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => 
        item.productId.toString() !== productId.toString()
    );
    
    return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

// Instance method to clean up items with null/deleted products
cartSchema.methods.cleanupItems = function() {
    // Remove items where productId is null (deleted products)
    const originalLength = this.items.length;
    this.items = this.items.filter(item => item.productId != null);
    
    if (this.items.length !== originalLength) {
        console.log(`Cleaned up ${originalLength - this.items.length} items with null products`);
        return this.save();
    }
    
    return Promise.resolve(this);
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateCart = async function(userId) {
    let cart = await this.findOne({ userId });
    
    if (!cart) {
        cart = new this({ userId, items: [] });
        await cart.save();
    }
    
    return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
