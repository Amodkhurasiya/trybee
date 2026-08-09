// Admin Controller - Comprehensive admin dashboard and management
// Aggregates data from all backend modules for admin dashboard

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Get comprehensive admin dashboard statistics
const getAdminStats = async (req, res) => {
    try {
        console.log('Getting comprehensive admin dashboard statistics...');

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const adminUsers = await User.countDocuments({ isAdmin: true });

        // Get user growth (users created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersLast30Days = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get product statistics
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ 
            stock: { $gt: 0, $lte: 10 } 
        });

        // Get product categories distribution
        const categoryStats = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Calculate total revenue
        const revenueStats = await Order.aggregate([
            { $match: { orderStatus: { $in: ['delivered', 'shipped'] } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // Get revenue for last 30 days
        const revenueLastMonth = await Order.aggregate([
            { 
                $match: { 
                    orderStatus: { $in: ['delivered', 'shipped'] },
                    createdAt: { $gte: thirtyDaysAgo }
                } 
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            }
        ]);

        // Get monthly sales trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlySales = await Order.aggregate([
            { 
                $match: { 
                    orderStatus: { $in: ['delivered', 'shipped'] },
                    createdAt: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.name' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.totalPrice' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        // Get recent activity
        const recentOrders = await Order.find()
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber orderStatus totalAmount createdAt userId');

        const recentUsers = await User.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email createdAt isVerified');

        // Calculate growth percentages (comparing with previous 30 days)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const usersPrevious30Days = await User.countDocuments({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        const ordersPrevious30Days = await Order.countDocuments({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        const revenuePrevious30Days = await Order.aggregate([
            { 
                $match: { 
                    orderStatus: { $in: ['delivered', 'shipped'] },
                    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
                } 
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Calculate growth percentages
        const userGrowth = usersPrevious30Days > 0 ? 
            ((newUsersLast30Days - usersPrevious30Days) / usersPrevious30Days * 100) : 0;

        const currentMonthOrders = await Order.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        const orderGrowth = ordersPrevious30Days > 0 ? 
            ((currentMonthOrders - ordersPrevious30Days) / ordersPrevious30Days * 100) : 0;

        const currentRevenue = revenueLastMonth.length > 0 ? revenueLastMonth[0].revenue : 0;
        const previousRevenue = revenuePrevious30Days.length > 0 ? revenuePrevious30Days[0].revenue : 0;
        const revenueGrowth = previousRevenue > 0 ? 
            ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;

        // Compile comprehensive stats
        const adminStats = {
            // Overview metrics
            overview: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
                averageOrderValue: revenueStats.length > 0 ? revenueStats[0].averageOrderValue : 0
            },

            // Growth metrics
            growth: {
                userGrowth: Math.round(userGrowth * 100) / 100,
                orderGrowth: Math.round(orderGrowth * 100) / 100,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                newUsersLast30Days,
                ordersLast30Days: currentMonthOrders,
                revenueLast30Days: currentRevenue
            },

            // Detailed breakdowns
            users: {
                total: totalUsers,
                active: activeUsers,
                verified: verifiedUsers,
                admins: adminUsers,
                newLast30Days: newUsersLast30Days
            },

            products: {
                total: totalProducts,
                active: activeProducts,
                outOfStock: outOfStockProducts,
                lowStock: lowStockProducts,
                categories: categoryStats
            },

            orders: {
                total: totalOrders,
                byStatus: orderStats,
                last30Days: currentMonthOrders
            },

            revenue: {
                total: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
                last30Days: currentRevenue,
                averageOrder: revenueStats.length > 0 ? revenueStats[0].averageOrderValue : 0,
                monthlySales
            },

            // Analytics
            analytics: {
                topProducts,
                categoryStats,
                monthlySales
            },

            // Recent activity
            recentActivity: {
                orders: recentOrders,
                users: recentUsers
            }
        };

        console.log('Admin statistics compiled successfully');

        res.status(200).json({
            success: true,
            message: 'Admin dashboard statistics retrieved successfully',
            data: adminStats
        });

    } catch (error) {
        console.error('Error getting admin stats:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin statistics',
            error: error.message
        });
    }
};

// Get all users for admin management
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const isActive = req.query.isActive;
        const isVerified = req.query.isVerified;
        const isAdmin = req.query.isAdmin;

        // Build filter query
        let filter = {};
        
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }

        if (isAdmin !== undefined) {
            filter.isAdmin = isAdmin === 'true';
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get users with pagination
        const users = await User.find(filter)
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting all users:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, isVerified, isAdmin } = req.body;

        const updateFields = {};
        if (isActive !== undefined) updateFields.isActive = isActive;
        if (isVerified !== undefined) updateFields.isVerified = isVerified;
        if (isAdmin !== undefined) updateFields.isAdmin = isAdmin;

        const user = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        ).select('-password -emailVerificationToken -passwordResetToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Error updating user status:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    updateUserStatus
};
