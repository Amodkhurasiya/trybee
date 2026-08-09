// User model for authentication and user management
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// User Schema Definition
const userSchema = new mongoose.Schema({
    // Basic user information
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true, // Convert to lowercase
        trim: true, // Remove whitespace
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    
    // User profile information
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    
    dateOfBirth: {
        type: Date
    },
    
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        lowercase: true
    },
    
    avatar: {
        type: String, // URL to profile picture
        trim: true
    },
    
    // Address information for shipping
    addresses: [{
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, 'Address title cannot exceed 50 characters']
        },
        street: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, 'City name cannot exceed 50 characters']
        },
        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, 'State name cannot exceed 50 characters']
        },
        zipCode: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{5,6}$/, 'Please enter a valid zip code']
        },
        country: {
            type: String,
            required: true,
            trim: true,
            default: 'India',
            maxlength: [50, 'Country name cannot exceed 50 characters']
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    
    // User preferences
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        notifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        }
    },
    
    // User verification and roles
    isVerified: {
        type: Boolean,
        default: false
    },
    
    isAdmin: {
        type: Boolean,
        default: false
    },
    
    // Email verification token
    verificationToken: {
        type: String,
        select: false // Don't include in queries by default
    },
    
    verificationTokenExpire: {
        type: Date,
        select: false
    },
    
    // Password reset functionality
    resetPasswordToken: {
        type: String,
        select: false
    },
    
    resetPasswordExpire: {
        type: Date,
        select: false
    },
    
    // Optional user profile information (for future expansion)
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    
    // User activity tracking
    lastLogin: {
        type: Date
    },
    
    // Wishlist of favorite products
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    // Account status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    // Add timestamps (createdAt, updatedAt)
    timestamps: true,
    
    // Transform output to remove sensitive fields
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            delete ret.verificationToken;
            delete ret.verificationTokenExpire;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpire;
            return ret;
        }
    }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash password if it has been modified
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        // Hash password with bcrypt
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to generate email verification token
userSchema.methods.generateVerificationToken = function() {
    // Generate random token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Set verification token and expiration (24 hours)
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash and set reset token and expiration (1 hour)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    
    return resetToken;
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || '';
};

// Instance method to add address
userSchema.methods.addAddress = function(addressData) {
    // If this is the first address or marked as default, make it default
    if (this.addresses.length === 0 || addressData.isDefault) {
        // Remove default from other addresses
        this.addresses.forEach(addr => {
            addr.isDefault = false;
        });
        addressData.isDefault = true;
    }
    
    this.addresses.push(addressData);
    return this.save();
};

// Instance method to update address
userSchema.methods.updateAddress = function(addressId, updateData) {
    const address = this.addresses.id(addressId);
    if (!address) {
        throw new Error('Address not found');
    }
    
    // If updating to default, remove default from others
    if (updateData.isDefault) {
        this.addresses.forEach(addr => {
            if (addr._id.toString() !== addressId) {
                addr.isDefault = false;
            }
        });
    }
    
    Object.assign(address, updateData);
    return this.save();
};

// Instance method to remove address
userSchema.methods.removeAddress = function(addressId) {
    const addressIndex = this.addresses.findIndex(addr => addr._id.toString() === addressId.toString());
    
    if (addressIndex === -1) {
        throw new Error('Address not found');
    }
    
    const wasDefault = this.addresses[addressIndex].isDefault;
    this.addresses.splice(addressIndex, 1);
    
    // If removed address was default, make first remaining address default
    if (wasDefault && this.addresses.length > 0) {
        this.addresses[0].isDefault = true;
    }
    
    return this.save();
};

// Instance method to get default address
userSchema.methods.getDefaultAddress = function() {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Static method to find user by verification token
userSchema.statics.findByVerificationToken = function(token) {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    
    return this.findOne({
        verificationToken: hashedToken,
        verificationTokenExpire: { $gt: Date.now() }
    });
};

// Static method to find user by reset token
userSchema.statics.findByResetToken = function(token) {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    
    return this.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
};

// Index for better performance (email index is already created by unique: true)
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Create and export User model
const User = mongoose.model('User', userSchema);

module.exports = User;
