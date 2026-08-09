// Authentication middleware to protect routes
// Verifies JWT token and adds user info to request

const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/User');

// Middleware to check if user is authenticated
// Verifies JWT token from Authorization header
async function authenticateToken(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }
        
        // Extract token from "Bearer TOKEN" format
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. Invalid token format.' 
            });
        }
        
        // Verify the token
        const decoded = verifyToken(token);
        
        // Find user in database
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. User not found.' 
            });
        }
        
        // If user is disabled, block further access
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been disabled. Please contact support.'
            });
        }

        // Add user info to request object for use in other routes
        req.user = user;
        
        // Continue to next middleware or route
        next();
        
    } catch (error) {
        console.log('Authentication error:', error.message);
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. Invalid token.' 
        });
    }
}

// Middleware to check if user is verified
// Checks if user has verified their email
function requireVerification(req, res, next) {
    try {
        // Check if user is verified (requires authenticateToken to run first)
        if (!req.user.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'Please verify your email before accessing this resource.' 
            });
        }
        
        // User is verified, continue
        next();
        
    } catch (error) {
        console.log('Verification check error:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during verification check' 
        });
    }
}

// Export middleware functions
module.exports = {
    authenticateToken,
    requireVerification
};
