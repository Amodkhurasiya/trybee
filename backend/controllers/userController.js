// User profile controller for profile management
const User = require('../models/User');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        console.log('Fetching user profile for:', req.user.email);
        
        // Find user by ID (req.user is set by auth middleware)
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('User profile fetched successfully');
        
        // Return user profile (password and tokens are excluded by toJSON transform)
        res.status(200).json({
            success: true,
            message: 'User profile fetched successfully',
            data: {
                user
            }
        });
        
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Updating user profile for ID:', userId);
        
        // Extract allowed profile fields from request body
        const {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            avatar,
            preferences
        } = req.body;
        
        // Create update object with only allowed fields
        const updateData = {};
        
        if (firstName !== undefined) updateData.firstName = firstName.trim();
        if (lastName !== undefined) updateData.lastName = lastName.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updateData.gender = gender;
        if (avatar !== undefined) updateData.avatar = avatar.trim();
        if (preferences !== undefined) updateData.preferences = preferences;
        
        // Update user profile
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true, // Return updated document
                runValidators: true // Run model validators
            }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('User profile updated successfully for:', user.email);
        
        // Return updated profile
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                avatar: user.avatar,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
        
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Profile validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

// Add user address
const addUserAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Adding address for user ID:', userId);
        
        // Extract address data
        const { title, street, city, state, zipCode, country, isDefault } = req.body;
        
        // Validate required fields
        if (!title || !street || !city || !state || !zipCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required address fields: title, street, city, state, zipCode'
            });
        }
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Create address object
        const addressData = {
            title: title.trim(),
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: (country || 'India').trim(),
            isDefault: isDefault || false
        };
        
        // Add address using model method
        await user.addAddress(addressData);
        
        console.log('Address added successfully for user:', user.email);
        
        // Return updated user with new address
        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: {
                user: await User.findById(userId)
            }
        });
        
    } catch (error) {
        console.error('Error adding address:', error.message);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Address validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while adding address'
        });
    }
};

// Update user address
const updateUserAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const addressId = req.params.addressId;
        console.log('Updating address ID:', addressId, 'for user ID:', userId);
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Extract update data
        const updateData = { ...req.body };
        delete updateData._id; // Remove ID from update data
        
        // Update address using model method
        await user.updateAddress(addressId, updateData);
        
        console.log('Address updated successfully');
        
        // Return updated user
        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: {
                user: await User.findById(userId)
            }
        });
        
    } catch (error) {
        console.error('Error updating address:', error.message);
        
        if (error.message === 'Address not found') {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Address validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating address'
        });
    }
};

// Delete user address
const deleteUserAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const addressId = req.params.addressId;
        console.log('Deleting address ID:', addressId, 'for user ID:', userId);
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove address using model method
        await user.removeAddress(addressId);
        
        console.log('Address deleted successfully');
        
        // Return updated user
        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            data: {
                user: await User.findById(userId)
            }
        });
        
    } catch (error) {
        console.error('Error deleting address:', error.message);
        
        if (error.message === 'Address not found') {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while deleting address'
        });
    }
};

// Get user addresses
const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Fetching addresses for user ID:', userId);
        
        // Find user and return only addresses
        const user = await User.findById(userId).select('addresses');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('User addresses fetched successfully');
        
        res.status(200).json({
            success: true,
            message: 'User addresses fetched successfully',
            data: {
                addresses: user.addresses,
                defaultAddress: user.getDefaultAddress()
            }
        });
        
    } catch (error) {
        console.error('Error fetching user addresses:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error while fetching addresses'
        });
    }
};

// Export all controller functions
// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new password are required' });
        }
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        return res.status(500).json({ success: false, message: 'Server error while changing password' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getUserAddresses,
    changePassword,
};
