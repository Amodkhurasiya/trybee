// Module 3 Simple Test - Authentication System (without email)
// Tests core authentication functionality without requiring email configuration

require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/tokenUtils');

const testUser = {
    email: 'test-simple@trybee.me',
    password: 'TestPassword123!'
};

// Main test function
async function testModule3Simple() {
    console.log('Testing Module 3: Authentication System (Core Features)');
    console.log('====================================================');
    
    try {
        // Connect to database
        console.log('1. Connecting to database...');
        await connectDB();
        console.log('Database connected successfully!');
        
        // Clean up any existing test user
        await User.deleteOne({ email: testUser.email });
        
        // Test 1: JWT Token utilities
        console.log('\n2. Testing JWT token utilities...');
        await testJWTUtilities();
        
        // Test 2: User creation and password hashing
        console.log('\n3. Testing user creation and password hashing...');
        await testUserCreation();
        
        // Test 3: Password verification
        console.log('\n4. Testing password verification...');
        await testPasswordVerification();
        
        // Test 4: Token generation for authentication
        console.log('\n5. Testing authentication token generation...');
        await testAuthTokenGeneration();
        
        // Test 5: Email verification tokens (without sending email)
        console.log('\n6. Testing email verification tokens...');
        await testVerificationTokens();
        
        // Test 6: Password reset tokens (without sending email)
        console.log('\n7. Testing password reset tokens...');
        await testPasswordResetTokens();
        
        // Clean up test data
        console.log('\n8. Cleaning up test data...');
        await User.deleteOne({ email: testUser.email });
        console.log('Test user deleted');
        
        console.log('\nAll Module 3 core tests passed successfully!');
        console.log('Module 3 Core Features Verified:');
        console.log('✓ JWT token generation and verification');
        console.log('✓ User registration with secure password hashing');
        console.log('✓ Password verification system');
        console.log('✓ Email verification token generation');
        console.log('✓ Password reset token generation');
        console.log('✓ Database operations for authentication');
        
    } catch (error) {
        console.log('Test failed:', error.message);
    } finally {
        await disconnectDB();
        console.log('Database connection closed');
    }
}

// Test JWT utilities
async function testJWTUtilities() {
    const testUserId = '64a1b2c3d4e5f6789012345';
    
    // Test token generation
    const token = generateToken(testUserId);
    if (!token) throw new Error('Token generation failed');
    console.log('✅ JWT token generated');
    console.log('   Token length:', token.length);
    
    // Test token verification
    const decoded = verifyToken(token);
    if (decoded.userId !== testUserId) throw new Error('Token verification failed');
    console.log('✅ JWT token verified');
    console.log('   User ID:', decoded.userId);
    
    // Test invalid token rejection
    try {
        verifyToken('invalid_token');
        throw new Error('Invalid token should be rejected');
    } catch (error) {
        if (error.message.includes('Invalid token')) {
            console.log('✅ Invalid token properly rejected');
        } else {
            throw error;
        }
    }
}

// Test user creation
async function testUserCreation() {
    const newUser = new User(testUser);
    
    // Generate verification token
    const verificationToken = newUser.generateVerificationToken();
    console.log('✅ Verification token generated');
    console.log('   Token length:', verificationToken.length);
    
    // Save user (password will be hashed)
    await newUser.save();
    console.log('✅ User created and saved to database');
    console.log('   User ID:', newUser._id);
    console.log('   Email:', newUser.email);
    console.log('   Password hashed:', newUser.password !== testUser.password);
    console.log('   Verified status:', newUser.isVerified);
}

// Test password verification
async function testPasswordVerification() {
    try {
        // Get user with password field (password has select: false by default)
        const user = await User.findOne({ email: testUser.email }).select('+password');
        
        console.log('   Original password:', testUser.password);
        console.log('   Hashed password length:', user.password ? user.password.length : 'null');
        console.log('   Password exists:', !!user.password);
        
        // Test correct password
        const correctPassword = await user.comparePassword(testUser.password);
        if (!correctPassword) throw new Error('Correct password verification failed');
        console.log('✅ Correct password verified');
        
        // Test incorrect password
        const incorrectPassword = await user.comparePassword('wrongpassword');
        if (incorrectPassword) throw new Error('Incorrect password should be rejected');
        console.log('✅ Incorrect password properly rejected');
        
    } catch (error) {
        console.log('Password verification error details:', error.message);
        throw error;
    }
}

// Test authentication token generation
async function testAuthTokenGeneration() {
    const user = await User.findOne({ email: testUser.email });
    
    // Generate authentication token
    const authToken = generateToken(user._id);
    if (!authToken) throw new Error('Auth token generation failed');
    console.log('✅ Authentication token generated');
    
    // Verify token contains correct user ID
    const decoded = verifyToken(authToken);
    if (decoded.userId !== user._id.toString()) {
        throw new Error('Token does not contain correct user ID');
    }
    console.log('✅ Token contains correct user ID');
}

// Test verification tokens
async function testVerificationTokens() {
    // Get user with verification token (verificationToken has select: false)
    const user = await User.findOne({ email: testUser.email }).select('+verificationToken');
    
    // Test email verification
    if (!user.verificationToken) throw new Error('Verification token not found');
    
    console.log('✅ Verification token found in database');
    console.log('   Token length:', user.verificationToken.length);
    
    // Simulate email verification
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    console.log('✅ Email verification simulation successful');
    console.log('   User verified status:', user.isVerified);
    console.log('   Verification token removed:', !user.verificationToken);
}

// Test password reset tokens
async function testPasswordResetTokens() {
    const user = await User.findOne({ email: testUser.email }).select('+password');
    
    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    console.log('✅ Password reset token generated');
    console.log('   Token length:', resetToken.length);
    console.log('   Expiry set:', !!user.resetPasswordExpire);
    
    // Simulate password reset
    const newPassword = 'NewPassword123!';
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    // Verify new password works
    const passwordChanged = await user.comparePassword(newPassword);
    if (!passwordChanged) throw new Error('Password reset failed');
    
    console.log('✅ Password reset simulation successful');
    console.log('   New password verified:', passwordChanged);
    console.log('   Reset token removed:', !user.resetPasswordToken);
}

// Run the test
if (require.main === module) {
    testModule3Simple().catch(console.error);
}

module.exports = { testModule3Simple };
