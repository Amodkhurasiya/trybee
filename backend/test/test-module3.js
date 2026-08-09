// Module 3 Test File - Authentication System Testing
// Tests all authentication functionality including registration, login, and email verification

// Load environment variables
require('dotenv').config();

// Import required modules
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/tokenUtils');
const authController = require('../controllers/authController');

// Test data
const testUser = {
    email: 'test-auth@trybee.me',
    password: 'TestPassword123!'
};

// Mock request and response objects for testing controllers
function createMockReq(body = {}, headers = {}) {
    return {
        body: body,
        headers: headers,
        user: null
    };
}

function createMockRes() {
    const res = {
        statusCode: null,
        data: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.data = data;
            return this;
        }
    };
    return res;
}

// Main test function
async function testModule3() {
    console.log('Testing Module 3: Authentication System');
    console.log('=====================================');
    
    try {
        // Connect to database
        console.log('1. Connecting to database...');
        await connectDB();
        console.log('Database connected successfully!');
        
        // Test 1: JWT Token utilities
        console.log('\n2. Testing JWT token utilities...');
        await testJWTUtilities();
        
        // Test 2: User registration
        console.log('\n3. Testing user registration...');
        await testUserRegistration();
        
        // Test 3: User login
        console.log('\n4. Testing user login...');
        await testUserLogin();
        
        // Test 4: Email verification
        console.log('\n5. Testing email verification...');
        await testEmailVerification();
        
        // Test 5: Password reset functionality
        console.log('\n6. Testing password reset...');
        await testPasswordReset();
        
        // Test 6: Authentication middleware
        console.log('\n7. Testing authentication middleware...');
        await testAuthenticationMiddleware();
        
        // Clean up test data
        console.log('\n8. Cleaning up test data...');
        await User.deleteOne({ email: testUser.email });
        await User.deleteOne({ email: 'test-verify@trybee.me' });
        console.log('Test users deleted');
        
        console.log('\nAll Module 3 tests passed successfully!');
        console.log('Module 3 Features Verified:');
        console.log('✓ JWT token generation and verification');
        console.log('✓ User registration with password hashing');
        console.log('✓ User login with token response');
        console.log('✓ Email verification token system');
        console.log('✓ Password reset functionality');
        console.log('✓ Authentication middleware protection');
        
    } catch (error) {
        console.log('Test failed:', error.message);
        console.log('Error details:', error);
    } finally {
        // Disconnect from database
        await disconnectDB();
        console.log('Database connection closed');
    }
}

// Test JWT utilities
async function testJWTUtilities() {
    try {
        // Test token generation
        const testUserId = '64a1b2c3d4e5f6789012345';
        const token = generateToken(testUserId);
        
        if (!token || typeof token !== 'string') {
            throw new Error('Token generation failed');
        }
        console.log('✅ JWT token generated successfully');
        console.log('   Token length:', token.length);
        
        // Test token verification
        const decoded = verifyToken(token);
        
        if (!decoded || decoded.userId !== testUserId) {
            throw new Error('Token verification failed');
        }
        console.log('✅ JWT token verified successfully');
        console.log('   Decoded user ID:', decoded.userId);
        
        // Test invalid token
        try {
            verifyToken('invalid_token');
            throw new Error('Invalid token should have been rejected');
        } catch (error) {
            if (error.message.includes('Invalid token')) {
                console.log('✅ Invalid token properly rejected');
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.log('❌ JWT utilities test failed:', error.message);
        throw error;
    }
}

// Test user registration
async function testUserRegistration() {
    try {
        // Remove any existing test user
        await User.deleteOne({ email: testUser.email });
        
        // Test registration
        const req = createMockReq(testUser);
        const res = createMockRes();
        
        await authController.registerUser(req, res);
        
        if (res.statusCode !== 201 || !res.data.success) {
            throw new Error('Registration failed: ' + res.data.message);
        }
        
        console.log('✅ User registration successful');
        console.log('   User ID:', res.data.data.userId);
        console.log('   Email:', res.data.data.email);
        console.log('   Verified status:', res.data.data.isVerified);
        
        // Verify user was saved to database
        const savedUser = await User.findOne({ email: testUser.email });
        if (!savedUser) {
            throw new Error('User not found in database after registration');
        }
        
        console.log('✅ User saved to database');
        
        // Test duplicate registration
        const req2 = createMockReq(testUser);
        const res2 = createMockRes();
        
        await authController.registerUser(req2, res2);
        
        if (res2.statusCode !== 400) {
            throw new Error('Duplicate registration should have been prevented');
        }
        
        console.log('✅ Duplicate registration properly prevented');
        
    } catch (error) {
        console.log('❌ User registration test failed:', error.message);
        throw error;
    }
}

// Test user login
async function testUserLogin() {
    try {
        // Test login before email verification (should fail)
        console.log('   Testing login before email verification...');
        const req1 = createMockReq(testUser);
        const res1 = createMockRes();
        
        await authController.loginUser(req1, res1);
        
        if (res1.statusCode === 400 && res1.data.message === 'Please verify your email before logging in') {
            console.log('✅ Login correctly blocked before email verification');
            console.log('   Expected error message:', res1.data.message);
        } else {
            throw new Error('Login should be blocked before email verification');
        }
        
        // Simulate email verification
        console.log('   Simulating email verification...');
        await User.findOneAndUpdate(
            { email: testUser.email },
            { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
        );
        console.log('✅ User marked as verified in database');
        
        // Test login after email verification (should succeed)
        console.log('   Testing login after email verification...');
        const req2 = createMockReq(testUser);
        const res2 = createMockRes();
        
        await authController.loginUser(req2, res2);
        
        if (res2.statusCode !== 200 || !res2.data.success) {
            throw new Error('Login failed after verification: ' + res2.data.message);
        }
        
        console.log('✅ User login successful after verification');
        console.log('   Token received:', res2.data.data.token ? 'Yes' : 'No');
        console.log('   User ID:', res2.data.data.user.id);
        console.log('   Email:', res2.data.data.user.email);
        
        // Verify token is valid
        const decoded = verifyToken(res2.data.data.token);
        if (!decoded.userId) {
            throw new Error('Login token is invalid');
        }
        
        console.log('✅ Login token is valid');
        
        // Test login with wrong password
        const req3 = createMockReq({
            email: testUser.email,
            password: 'wrongpassword'
        });
        const res3 = createMockRes();
        
        await authController.loginUser(req3, res3);
        
        if (res3.statusCode !== 400) {
            throw new Error('Wrong password should have been rejected');
        }
        
        console.log('✅ Wrong password properly rejected');
        
    } catch (error) {
        console.log('❌ User login test failed:', error.message);
        throw error;
    }
}

// Test email verification
async function testEmailVerification() {
    try {
        // Create a new test user for email verification testing
        const verificationTestUser = {
            email: 'test-verify@trybee.me',
            password: 'TestPassword123!'
        };
        
        // Clean up any existing verification test user
        await User.deleteOne({ email: verificationTestUser.email });
        
        // Register new user for verification test
        const reqReg = createMockReq(verificationTestUser);
        const resReg = createMockRes();
        
        await authController.registerUser(reqReg, resReg);
        
        if (resReg.statusCode !== 201 || !resReg.data.success) {
            throw new Error('User registration failed for verification test: ' + resReg.data.message);
        }
        
        // Get user and verification token
        const user = await User.findOne({ email: verificationTestUser.email }).select('+verificationToken');
        
        if (!user || !user.verificationToken) {
            throw new Error('User or verification token not found for verification test');
        }
        
        console.log('✅ Test user created for email verification');
        console.log('   Verification token exists:', !!user.verificationToken);
        
        // Test email verification
        const req = createMockReq({ token: user.verificationToken });
        const res = createMockRes();
        
        await authController.verifyEmail(req, res);
        
        if (res.statusCode !== 200 || !res.data.success) {
            throw new Error('Email verification failed: ' + res.data.message);
        }
        
        console.log('✅ Email verification successful');
        console.log('   User ID:', res.data.data.userId);
        console.log('   Verified status:', res.data.data.isVerified);
        
        // Verify user is marked as verified in database
        const verifiedUser = await User.findById(user._id);
        if (!verifiedUser.isVerified) {
            throw new Error('User not marked as verified in database');
        }
        
        console.log('✅ User marked as verified in database');
        
        // Test invalid verification token
        const req2 = createMockReq({ token: 'invalid_token' });
        const res2 = createMockRes();
        
        await authController.verifyEmail(req2, res2);
        
        if (res2.statusCode !== 400) {
            throw new Error('Invalid verification token should have been rejected');
        }
        
        console.log('✅ Invalid verification token properly rejected');
        
    } catch (error) {
        console.log('❌ Email verification test failed:', error.message);
        throw error;
    }
}

// Test password reset functionality
async function testPasswordReset() {
    try {
        // Test forgot password request
        const req = createMockReq({ email: testUser.email });
        const res = createMockRes();
        
        await authController.forgotPassword(req, res);
        
        if (res.statusCode !== 200 || !res.data.success) {
            throw new Error('Forgot password request failed: ' + res.data.message);
        }
        
        console.log('✅ Forgot password request successful');
        
        // Get user with reset token
        const user = await User.findOne({ email: testUser.email }).select('+resetPasswordToken +resetPasswordExpire');
        if (!user.resetPasswordToken || !user.resetPasswordExpire) {
            throw new Error('Reset token not generated');
        }
        
        console.log('✅ Reset token generated');
        console.log('   Token length:', user.resetPasswordToken.length);
        
        // Test password reset
        const newPassword = 'NewTestPassword123!';
        const req2 = createMockReq({
            token: user.resetPasswordToken,
            newPassword: newPassword
        });
        const res2 = createMockRes();
        
        await authController.resetPassword(req2, res2);
        
        if (res2.statusCode !== 200 || !res2.data.success) {
            throw new Error('Password reset failed: ' + res2.data.message);
        }
        
        console.log('✅ Password reset successful');
        
        // Verify password was changed
        const updatedUser = await User.findById(user._id).select('+password +resetPasswordToken +resetPasswordExpire');
        const passwordChanged = await updatedUser.comparePassword(newPassword);
        
        if (!passwordChanged) {
            throw new Error('Password was not updated');
        }
        
        console.log('✅ Password updated in database');
        
        // Verify reset token was removed
        if (updatedUser.resetPasswordToken || updatedUser.resetPasswordExpire) {
            throw new Error('Reset token was not removed after use');
        }
        
        console.log('✅ Reset token removed after use');
        
    } catch (error) {
        console.log('❌ Password reset test failed:', error.message);
        throw error;
    }
}

// Test authentication middleware
async function testAuthenticationMiddleware() {
    try {
        const { authenticateToken } = require('../middleware/authMiddleware');
        
        // Get test user
        const user = await User.findOne({ email: testUser.email });
        const token = generateToken(user._id);
        
        // Mock middleware objects
        const req = {
            headers: {
                authorization: `Bearer ${token}`
            },
            user: null
        };
        
        let nextCalled = false;
        const next = () => { nextCalled = true; };
        const res = createMockRes();
        
        // Test valid token
        await authenticateToken(req, res, next);
        
        if (!nextCalled) {
            throw new Error('Middleware should have called next() for valid token');
        }
        
        if (!req.user || req.user._id.toString() !== user._id.toString()) {
            throw new Error('User not added to request object');
        }
        
        console.log('✅ Authentication middleware working with valid token');
        console.log('   User added to request:', req.user.email);
        
        // Test invalid token
        const req2 = {
            headers: {
                authorization: 'Bearer invalid_token'
            },
            user: null
        };
        
        let next2Called = false;
        const next2 = () => { next2Called = true; };
        const res2 = createMockRes();
        
        await authenticateToken(req2, res2, next2);
        
        if (next2Called) {
            throw new Error('Middleware should not have called next() for invalid token');
        }
        
        if (res2.statusCode !== 401) {
            throw new Error('Invalid token should return 401 status');
        }
        
        console.log('✅ Authentication middleware properly rejects invalid token');
        
    } catch (error) {
        console.log('❌ Authentication middleware test failed:', error.message);
        throw error;
    }
}

// Run the test
if (require.main === module) {
    testModule3().catch(console.error);
}

module.exports = { testModule3 };
