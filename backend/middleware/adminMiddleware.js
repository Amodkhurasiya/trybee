// Admin middleware for authorization
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated and is an admin
const requireAdmin = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        // Check if token exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        // Extract token from "Bearer TOKEN"
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID
        const user = await User.findById(decoded.userId).select('+isAdmin');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }
        
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please verify your email first.'
            });
        }
        
        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        // Add user to request object for use in other middleware/routes
        req.user = user;
        
        console.log('Admin authorization successful for user:', user.email);
        
        // Continue to next middleware
        next();
        
    } catch (error) {
        console.error('Admin authorization error:', error.message);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token has expired.'
            });
        }
        
        // General error response
        return res.status(500).json({
            success: false,
            message: 'Server error during authorization.'
        });
    }
};

// Middleware to check if user is authenticated (not necessarily admin)
const requireAuth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        // Check if token exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        // Extract token from "Bearer TOKEN"
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }
        
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please verify your email first.'
            });
        }
        
        // Add user to request object
        req.user = user;
        
        console.log('User authorization successful for:', user.email);
        
        // Continue to next middleware
        next();
        
    } catch (error) {
        console.error('User authorization error:', error.message);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token has expired.'
            });
        }
        
        // General error response
        return res.status(500).json({
            success: false,
            message: 'Server error during authorization.'
        });
    }
};

// Export middleware functions
module.exports = {
    requireAdmin,
    requireAuth
};
