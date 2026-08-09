// File upload controller for handling image uploads and avatar management
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const User = require('../models/User');
const { 
    deleteProductImage, 
    getAvailableAvatars, 
    validateAvatarSelection, 
    getAvatarUrl,
    getProductImageUrls 
} = require('../middleware/uploadMiddleware');

// Upload product images (Admin only)
const uploadProductImages = async (req, res) => {
    try {
        console.log('Uploading product images...');
        console.log('Files received:', req.files?.length || 0);
        console.log('User ID:', req.user._id);
        console.log('Is Admin:', req.user.isAdmin);

        // Validate that files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images provided for upload'
            });
        }

        // Process uploaded files
        const imageFilenames = req.files.map(file => file.filename);
        const imageUrls = getProductImageUrls(imageFilenames);
        
        console.log('Uploaded files:', imageFilenames);
        console.log('Generated URLs:', imageUrls);

        // Return success response with image information
        res.status(200).json({
            success: true,
            message: `${req.files.length} images uploaded successfully`,
            data: {
                images: imageFilenames,
                imageUrls: imageUrls,
                count: req.files.length
            }
        });

    } catch (error) {
        console.error('Error uploading product images:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading images'
        });
    }
};

// Update product with images
const updateProductImages = async (req, res) => {
    try {
        console.log('Updating product images...');
        const productId = req.params.productId;
        console.log('Product ID:', productId);
        console.log('Files received:', req.files?.length || 0);

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            // Delete uploaded files if product not found
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        await deleteProductImage(file.filename);
                    } catch (deleteError) {
                        console.error('Error deleting uploaded file:', deleteError);
                    }
                }
            }
            
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Store old images for potential cleanup
        const oldImages = [...(product.images || [])];
        
        // Update product with new images
        const newImageFilenames = req.files.map(file => file.filename);
        product.images = newImageFilenames;
        
        await product.save();
        
        // Delete old images after successful update (only if no other product references them)
        if (oldImages.length > 0) {
            for (const oldImage of oldImages) {
                try {
                    const refs = await Product.countDocuments({ images: oldImage });
                    if (refs === 0) {
                        await deleteProductImage(oldImage);
                    } else {
                        console.log(`Skip deleting old image '${oldImage}' - still referenced by ${refs} product(s)`);
                    }
                } catch (deleteError) {
                    console.error('Error deleting old image:', deleteError);
                    // Continue with other deletions
                }
            }
        }

        console.log('Product images updated successfully');
        console.log('New images:', newImageFilenames);

        // Return updated product
        res.status(200).json({
            success: true,
            message: 'Product images updated successfully',
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    images: product.images,
                    imageUrls: getProductImageUrls(product.images)
                }
            }
        });

    } catch (error) {
        console.error('Error updating product images:', error);
        
        // Clean up uploaded files in case of error
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    await deleteProductImage(file.filename);
                } catch (deleteError) {
                    console.error('Error cleaning up uploaded file:', deleteError);
                }
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating product images'
        });
    }
};

// Get available avatars for user selection
const getAvatars = async (req, res) => {
    try {
        console.log('Getting available avatars...');
        
        const avatars = getAvailableAvatars();
        
        res.status(200).json({
            success: true,
            message: 'Available avatars retrieved successfully',
            data: {
                avatars: avatars,
                count: avatars.length
            }
        });

    } catch (error) {
        console.error('Error getting avatars:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving avatars'
        });
    }
};

// Update user avatar selection
const updateUserAvatar = async (req, res) => {
    try {
        console.log('Updating user avatar...');
        const userId = req.user._id;
        const { avatarId } = req.body;
        
        console.log('User ID:', userId);
        console.log('Selected Avatar ID:', avatarId);

        // Validate avatar selection
        if (!avatarId) {
            return res.status(400).json({
                success: false,
                message: 'Avatar ID is required'
            });
        }

        if (!validateAvatarSelection(avatarId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid avatar selection'
            });
        }

        // Update user avatar
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.avatar = avatarId;
        await user.save();

        console.log('User avatar updated successfully');

        // Return updated user info
        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    avatarUrl: getAvatarUrl(user.avatar)
                }
            }
        });

    } catch (error) {
        console.error('Error updating user avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating avatar'
        });
    }
};

// Delete product image by filename (Admin only)
const deleteProductImageFile = async (req, res) => {
    try {
        console.log('Deleting product image...');
        const { filename } = req.params;
        console.log('Filename to delete:', filename);

        // Validate filename
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'Filename is required'
            });
        }

        // Prevent deleting images still in use by products
        const refs = await Product.countDocuments({ images: filename });
        if (refs > 0) {
            return res.status(400).json({
                success: false,
                message: `Image is still referenced by ${refs} product(s). Remove references before deleting the file.`
            });
        }

        // Delete the file
        const deleted = await deleteProductImage(filename);
        
        if (deleted) {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image file not found'
            });
        }

    } catch (error) {
        console.error('Error deleting product image:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting image'
        });
    }
};

// Get user's current avatar
const getUserAvatar = async (req, res) => {
    try {
        console.log('Getting user avatar...');
        const userId = req.user._id;

        const user = await User.findById(userId).select('avatar firstName lastName email');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User avatar retrieved successfully',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    avatarUrl: getAvatarUrl(user.avatar)
                }
            }
        });

    } catch (error) {
        console.error('Error getting user avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving user avatar'
        });
    }
};

module.exports = {
    uploadProductImages,
    updateProductImages,
    getAvatars,
    updateUserAvatar,
    deleteProductImageFile,
    getUserAvatar
};
