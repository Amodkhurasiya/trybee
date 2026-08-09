// JWT Token utilities for authentication
// This file handles JWT token generation and verification

const jwt = require('jsonwebtoken');

// Generate JWT token for user authentication
// Takes userId and returns a signed JWT token
function generateToken(userId) {
    try {
        // Create token with user ID and set expiration to 7 days
        const token = jwt.sign(
            { userId: userId }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        return token;
    } catch (error) {
        console.log('Error generating token:', error.message);
        throw new Error('Token generation failed');
    }
}

// Verify JWT token and extract user ID
// Takes token string and returns decoded user data
function verifyToken(token) {
    try {
        // Verify token with secret and return decoded data
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.log('Error verifying token:', error.message);
        throw new Error('Invalid token');
    }
}

// Export functions for use in other files
module.exports = {
    generateToken,
    verifyToken
};
