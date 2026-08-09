// Order Controller - Order Management
// Handles order creation, tracking, and admin management

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// Create new order from cart
async function createOrder(req, res) {
    try {
        const userId = req.user._id;
        const { shippingAddress, paymentMethod, notes = '' } = req.body;
        
        // Validate input
        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }
        
        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }
        
        // Find user cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Check product availability and stock
        const orderItems = [];
        let totalAmount = 0;
        
        for (const cartItem of cart.items) {
            const product = cartItem.productId;
            
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product?.name || 'unknown'} is not available`
                });
            }
            
            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }
            
            const itemTotal = product.price * cartItem.quantity;
            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                totalPrice: itemTotal
            });
            
            totalAmount += itemTotal;
        }
        
        // Calculate shipping and tax (basic calculation)
        const shippingFee = totalAmount > 500 ? 0 : 50; // Free shipping over 500
        const taxAmount = Math.round(totalAmount * 0.1); // 10% tax
        
        // Create order
        const newOrder = new Order({
            userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalItems: cart.totalItems,
            totalAmount,
            shippingFee,
            taxAmount,
            notes
        });
        
        // Save order
        await newOrder.save();
        
        // Update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }
        
        // Clear cart after successful order
        await cart.clearCart();
        
        // Populate order for response
        await newOrder.populate('userId', 'email firstName lastName');
        await newOrder.populate('items.productId', 'name category images');
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });
        
    } catch (error) {
        console.error('Create order error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
}

// Get user orders with pagination
async function getUserOrders(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        
        // Get orders with pagination
        const orders = await Order.getOrdersWithPagination(page, limit, userId, status);
        
        // Get total count for pagination
        let countQuery = { userId };
        if (status) {
            countQuery.orderStatus = status;
        }
        const totalOrders = await Order.countDocuments(countQuery);
        const totalPages = Math.ceil(totalOrders / limit);
        
        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalOrders,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
        
    } catch (error) {
        console.log('Get user orders error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
}

// Get single order by ID
async function getOrderById(req, res) {
    try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin === true;
        
    // Build query: admins can view any order; users can only view their own
    const query = isAdmin ? { _id: orderId } : { _id: orderId, userId };

    // Find order
    const order = await Order.findOne(query)
            .populate('userId', 'email firstName lastName')
            .populate('items.productId', 'name category images');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        });
        
    } catch (error) {
        console.log('Get order by ID error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order',
            error: error.message
        });
    }
}

// Cancel order (user can cancel pending orders)
async function cancelOrder(req, res) {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;
        
        // Find order
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }
        
        // Update order status
        await order.updateStatus('cancelled', 'user', 'Order cancelled by user');
        
        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } }
            );
        }
        
        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
        
    } catch (error) {
        console.log('Cancel order error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
}

// ADMIN FUNCTIONS

// Get all orders (Admin only)
async function getAllOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const userId = req.query.userId;
        
        // Get orders with pagination
        const orders = await Order.getOrdersWithPagination(page, limit, userId, status);
        
        // Get total count for pagination
        let countQuery = {};
        if (status) countQuery.orderStatus = status;
        if (userId) countQuery.userId = userId;
        
        const totalOrders = await Order.countDocuments(countQuery);
        const totalPages = Math.ceil(totalOrders / limit);
        
        res.status(200).json({
            success: true,
            message: 'All orders retrieved successfully',
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalOrders,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
        
    } catch (error) {
        console.log('Get all orders error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
}

// Update order status (Admin only)
async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status, adminNotes = '' } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }
        
        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Update order status and admin notes
        order.adminNotes = adminNotes;
        await order.updateStatus(status, 'admin', adminNotes);

        // Ensure response has the same populated shape as list/detail endpoints
        await order.populate('userId', 'email firstName lastName');
        await order.populate('items.productId', 'name category images');

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
        
    } catch (error) {
        console.log('Update order status error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
}

// Delete order (Admin only)
async function deleteOrder(req, res) {
    try {
        const { orderId } = req.params;
        
        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Restore product stock if order was confirmed
        if (['confirmed', 'processing'].includes(order.orderStatus)) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } }
                );
            }
        }
        
        // Delete order
        await Order.findByIdAndDelete(orderId);
        
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
        
    } catch (error) {
        console.log('Delete order error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
}

// Get order statistics (Admin only)
async function getOrderStats(req, res) {
    try {
        // Get order statistics
        const stats = await Order.getOrderStats();
        
        // Get total orders count
        const totalOrders = await Order.countDocuments();
        
        // Get recent orders (last 10)
        const recentOrders = await Order.find()
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.status(200).json({
            success: true,
            message: 'Order statistics retrieved successfully',
            data: {
                totalOrders,
                statusStats: stats,
                recentOrders
            }
        });
        
    } catch (error) {
        console.log('Get order stats error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order statistics',
            error: error.message
        });
    }
}

module.exports = {
    // User functions
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    
    // Admin functions
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
};
