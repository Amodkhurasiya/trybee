// Authentication controller
// Handles user registration, login, email verification, and password reset

const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');
const { getAvatarUrl } = require('../middleware/uploadMiddleware');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { isValidObjectId } = require('../utils/dbUtils');

// User registration endpoint
// Creates new user account and sends verification email
async function registerUser(req, res) {
    try {
        const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body;
        
        // Validate input data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            // If user exists and is verified, return error
            if (existingUser.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists and is verified'
                });
            }
            
            // If user exists but is not verified, delete the old user and create new one
            // This allows users to register again if they lost their verification email
            await User.deleteOne({ _id: existingUser._id });
            console.log('Deleted existing unverified user:', email);
        }
        
        // Create new user with profile information
        const userData = {
            email: email.toLowerCase(),
            password: password
        };
        
        // Add optional profile fields if provided
    if (firstName) userData.firstName = firstName.trim();
    if (lastName) userData.lastName = lastName.trim();
    if (phone) userData.phone = phone.trim();
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
    if (gender) userData.gender = String(gender).toLowerCase();
        
        const newUser = new User(userData);
        
        // Generate verification token
        const verificationToken = newUser.generateVerificationToken();
        
        // Save user to database
        await newUser.save();
        
        console.log('New user registered:', email);
        console.log('Profile fields:', { firstName, lastName, phone });
        
        // Send verification email
        await sendVerificationEmail(email, verificationToken);
        
        // Return success response
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            data: {
                userId: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                dateOfBirth: newUser.dateOfBirth,
                gender: newUser.gender,
                isVerified: newUser.isVerified,
                createdAt: newUser.createdAt,
                lastLogin: newUser.lastLogin
            }
        });
        
    } catch (error) {
        console.log('Registration error:', error.message);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Registration validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
}

// User login endpoint
// Authenticates user and returns JWT token
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        
        // Validate input data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Find user by email and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
    // Check password
        console.log('Login attempt for user:', email);
        console.log('User found:', !!user);
        console.log('User password exists:', !!user.password);
        console.log('Password to check:', password);
        
        const isPasswordValid = await user.comparePassword(password);
        console.log('Password validation result:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Password comparison failed for user:', email);
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Block disabled accounts
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been disabled by an administrator. Please contact support.'
            });
        }

        // Check if email is verified (recommended for production)
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email address before logging in. Check your inbox for the verification email.',
                requiresVerification: true
            });
        }
        
        // Update last login timestamp
        try {
            user.lastLogin = new Date();
            await user.save();
        } catch (e) {
            console.log('Warning: failed to update lastLogin:', e.message);
        }

        // Generate JWT token
        const token = generateToken(user._id);
        
        console.log('User logged in:', email);
        
        // Return success response with token and user data
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token: token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    avatar: user.avatar,
                    avatarUrl: getAvatarUrl(user.avatar),
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    isVerified: user.isVerified,
                    isAdmin: user.isAdmin,
                    role: user.isAdmin ? 'admin' : 'user',  // Add role field for frontend compatibility
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            }
        });
        
    } catch (error) {
        console.log('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
}

// Email verification endpoint
// Verifies user email using verification token
async function verifyEmail(req, res) {
    try {
        const { token } = req.body;
        
        // Validate token
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }
        
        // Use the static method to find user by verification token
        // This method handles the hashing and expiration check
        const user = await User.findByVerificationToken(token);
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }
        
        // Mark user as verified and remove verification token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        
        // Save changes
        await user.save();
        
        console.log('Email verified for user:', user.email);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Email verification successful',
            data: {
                userId: user._id,
                email: user.email,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.log('Email verification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
}

// Forgot password endpoint
// Sends password reset email to user
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        
        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User with this email does not exist'
            });
        }
        
        // Generate password reset token
        const resetToken = user.generatePasswordResetToken();
        
        // Save user with reset token
        await user.save();
        
        console.log('Password reset requested for user:', email);
        
        // Send password reset email
        await sendPasswordResetEmail(email, resetToken);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        });
        
    } catch (error) {
        console.log('Forgot password error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request'
        });
    }
}

// Reset password endpoint
// Resets user password using reset token
async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        
        // Validate input
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }
        
    // Find user by reset token and check expiration (hash-aware)
    // Use model helper which hashes the token and verifies expiry
    const user = await User.findByResetToken(token);
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        // Update password and remove reset token
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        // Save changes (password will be hashed by pre-save middleware)
        await user.save();
        
        console.log('Password reset successful for user:', user.email);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
        
    } catch (error) {
        console.log('Reset password error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
}

// Get current user profile (protected route)
// Returns current user information
async function getCurrentUser(req, res) {
    try {
        // User info is available from authentication middleware
        const user = req.user;
        
        // Return user profile with complete information
    res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
        avatar: user.avatar,
        avatarUrl: getAvatarUrl(user.avatar),
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
        
    } catch (error) {
        console.log('Get current user error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving user profile'
        });
    }
}

// Resend verification email endpoint
// Sends new verification email to user
async function resendVerificationEmail(req, res) {
    try {
        // User info is available from authentication middleware
        const user = req.user;
        
        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }
        
        // Generate new verification token
        const verificationToken = user.generateVerificationToken();
        
        // Save user with new token
        await user.save();
        
        console.log('Resending verification email for user:', user.email);
        
        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.'
        });
        
    } catch (error) {
        console.log('Resend verification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error sending verification email'
        });
    }
}

// Export all controller functions
module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    resendVerificationEmail
};
