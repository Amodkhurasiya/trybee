// Order Model - Order Management for E-commerce
// Handles order creation, tracking, and admin management

const mongoose = require('mongoose');

// Order item schema for products in order
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required']
    }
});

// Shipping address schema
const shippingAddressSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Address title is required'],
        trim: true
    },
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        validate: {
            validator: function(v) {
                // Remove any spaces or hyphens and check if it's 6 digits for India
                const cleaned = v.replace(/[\s-]/g, '');
                return /^\d{6}$/.test(cleaned);
            },
            message: 'Please enter a valid 6-digit postal code'
        }
    },
    country: {
        type: String,
        default: 'India',
        trim: true
    },
    phone: {
        type: String,
        trim: true
    }
});

// Main order schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'cod'],
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalItems: {
        type: Number,
        required: [true, 'Total items is required']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: [0, 'Shipping fee cannot be negative']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    finalAmount: {
        type: Number
    },
    paymentId: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: String,
            enum: ['system', 'admin', 'user'],
            default: 'system'
        },
        note: {
            type: String,
            trim: true
        }
    }]
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        // Generate order number: ORD-YYYYMMDD-XXXXXX
        const now = new Date();
        const date = now.getFullYear().toString() + 
                    (now.getMonth() + 1).toString().padStart(2, '0') + 
                    now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        this.orderNumber = `ORD-${date}-${random}`;
    }
    
    // Clean zipCode by removing spaces and hyphens
    if (this.shippingAddress && this.shippingAddress.zipCode) {
        this.shippingAddress.zipCode = this.shippingAddress.zipCode.replace(/[\s-]/g, '');
    }
    
    // Calculate final amount
    this.finalAmount = this.totalAmount + this.shippingFee + this.taxAmount;
    
    next();
});

// Instance method to update order status
orderSchema.methods.updateStatus = function(newStatus, updatedBy = 'system', note = '') {
    this.orderStatus = newStatus;
    
    // Add to status history
    this.statusHistory.push({
        status: newStatus,
        updatedBy,
        note
    });
    
    return this.save();
};

// Instance method to update payment status
orderSchema.methods.updatePaymentStatus = function(paymentStatus, paymentId = null) {
    this.paymentStatus = paymentStatus;
    if (paymentId) {
        this.paymentId = paymentId;
    }
    
    return this.save();
};

// Static method to get orders with pagination
orderSchema.statics.getOrdersWithPagination = function(page = 1, limit = 10, userId = null, status = null) {
    const skip = (page - 1) * limit;
    let query = {};
    
    if (userId) {
        query.userId = userId;
    }
    
    if (status) {
        query.orderStatus = status;
    }
    
    return this.find(query)
        .populate('userId', 'email firstName lastName')
        .populate('items.productId', 'name category images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
                totalAmount: { $sum: '$finalAmount' }
            }
        }
    ]);
    
    return stats;
};

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
