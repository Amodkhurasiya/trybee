// Cart Controller - Shopping Cart Management
// Handles user cart operations like add, update, remove items

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user cart with all items
async function getUserCart(req, res) {
    try {
        const userId = req.user._id;
        
        // Find or create cart for user
        const cart = await Cart.findOrCreateCart(userId);
        
        // Populate cart items with product details
        await cart.populate('items.productId', 'name price category images stock isActive');
        
        // Clean up items with null/deleted products and filter out inactive ones
        const originalItemCount = cart.items.length;
        cart.items = cart.items.filter(item => 
            item.productId && item.productId.isActive
        );
        
        // Save cart if items were filtered
        if (cart.items.length !== originalItemCount) {
            console.log(`Cleaned up ${originalItemCount - cart.items.length} invalid cart items`);
            await cart.save();
        }
        
        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: cart
        });
        
    } catch (error) {
        console.log('Get cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
}

// Add item to cart
async function addToCart(req, res) {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1 } = req.body;
        
        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }
        
        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }
        
        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }
        
        // Find or create cart
        const cart = await Cart.findOrCreateCart(userId);
        
        // Add item to cart
        await cart.addItem(productId, quantity, product.price);
        
        // Populate cart items for response and clean up any null products
        await cart.populate('items.productId', 'name price category images');
        
        // Filter out any null product references that might exist
        const originalItemCount = cart.items.length;
        cart.items = cart.items.filter(item => item.productId);
        
        if (cart.items.length !== originalItemCount) {
            console.log(`Cleaned up ${originalItemCount - cart.items.length} null product references`);
            await cart.save();
        }
        
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
        
    } catch (error) {
        console.log('Add to cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
}

// Update cart item quantity
async function updateCartItem(req, res) {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;
        
        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity cannot be negative'
            });
        }
        
        // Find user cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        // If quantity > 0, check product stock
        if (quantity > 0) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }
        }
        
        // Update item quantity
        await cart.updateItemQuantity(productId, quantity);
        
        // Populate cart items for response
        await cart.populate('items.productId', 'name price category images');
        
        res.status(200).json({
            success: true,
            message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated successfully',
            data: cart
        });
        
    } catch (error) {
        console.log('Update cart item error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
}

// Remove item from cart
async function removeFromCart(req, res) {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        
        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        // Find user cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        // Remove item from cart
        await cart.removeItem(productId);
        
        // Populate cart items for response
        await cart.populate('items.productId', 'name price category images');
        
        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
        
    } catch (error) {
        console.log('Remove from cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
}

// Clear entire cart
async function clearCart(req, res) {
    try {
        const userId = req.user._id;
        
        // Find user cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        // Clear cart
        await cart.clearCart();
        
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
        
    } catch (error) {
        console.log('Clear cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
}

// Get cart summary (item count and total)
async function getCartSummary(req, res) {
    try {
        const userId = req.user._id;
        
        // Find cart
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart summary retrieved',
                data: {
                    totalItems: 0,
                    totalAmount: 0,
                    itemCount: 0
                }
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Cart summary retrieved successfully',
            data: {
                totalItems: cart.totalItems,
                totalAmount: cart.totalAmount,
                itemCount: cart.items.length
            }
        });
        
    } catch (error) {
        console.log('Get cart summary error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart summary',
            error: error.message
        });
    }
}

module.exports = {
    getUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary
};
