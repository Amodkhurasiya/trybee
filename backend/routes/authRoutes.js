// Authentication routes
// Defines all authentication-related API endpoints

const express = require('express');
const router = express.Router();

// Import authentication controller functions
const {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    resendVerificationEmail
} = require('../controllers/authController');

// Import authentication middleware
const { authenticateToken, requireVerification } = require('../middleware/authMiddleware');

// POST /api/auth/register - User registration
// Creates new user account and sends verification email
router.post('/register', registerUser);

// POST /api/auth/login - User login
// Authenticates user and returns JWT token
router.post('/login', loginUser);

// POST /api/auth/verify-email - Email verification
// Verifies user email using verification token
router.post('/verify-email', verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
// Sends new verification email to authenticated user
router.post('/resend-verification', authenticateToken, resendVerificationEmail);

// POST /api/auth/forgot-password - Request password reset
// Sends password reset email to user
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Reset password
// Resets user password using reset token
router.post('/reset-password', resetPassword);

// GET /api/auth/profile - Get current user profile (protected)
// Returns current user information (requires authentication)
router.get('/profile', authenticateToken, getCurrentUser);

// GET /api/auth/me - Get current user profile (protected) - Alternative endpoint
// Returns current user information (requires authentication)
router.get('/me', authenticateToken, getCurrentUser);

// Export router for use in main server file
module.exports = router;
