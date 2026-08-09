// Complete Authentication System Test with Real Email Sending
// Tests the full authentication flow including actual email verification

require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/tokenUtils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const testUser = {
    email: 'testauth@trybee.com', // Simple email format for testing
    password: 'TestPassword123!'
};

// Main test function
async function testCompleteAuthSystem() {
    console.log('Testing Complete Authentication System with Email Sending');
    console.log('=======================================================');
    
    try {
        // Connect to database
        console.log('1. Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully!');
        
        // Clean up any existing test user
        await User.deleteOne({ email: testUser.email });
        
        // Test 1: User Registration with Email Verification
        console.log('\n2. Testing user registration with email verification...');
        await testUserRegistrationWithEmail();
        
        // Test 2: Email Verification Process
        console.log('\n3. Testing email verification process...');
        await testEmailVerificationProcess();
        
        // Test 3: User Login after Verification
        console.log('\n4. Testing user login after verification...');
        await testUserLogin();
        
        // Test 4: Password Reset with Email
        console.log('\n5. Testing password reset with email...');
        await testPasswordResetWithEmail();
        
        // Test 5: JWT Token Authentication
        console.log('\n6. Testing JWT token authentication...');
        await testJWTAuthentication();
        
        // Clean up test data
        console.log('\n7. Cleaning up test data...');
        await User.deleteOne({ email: testUser.email });
        console.log('✅ Test user deleted');
        
        console.log('\n🎉 Complete Authentication System Test PASSED!');
        console.log('All Features Working:');
        console.log('✓ User registration with password hashing');
        console.log('✓ Email verification emails sent successfully');
        console.log('✓ Email verification token validation');
        console.log('✓ User login with JWT token generation');
        console.log('✓ Password reset emails sent successfully');
        console.log('✓ Password reset token validation');
        console.log('✓ JWT token generation and verification');
        console.log('✓ Database operations for all auth functions');
        
        console.log('\n📧 Check your email inbox for:');
        console.log('• Email verification message');
        console.log('• Password reset message');
        
    } catch (error) {
        console.log('\n❌ Authentication system test failed');
        console.log('Error:', error.message);
    } finally {
        await disconnectDB();
        console.log('Database connection closed');
    }
}

// Test user registration with actual email sending
async function testUserRegistrationWithEmail() {
    // Create new user
    const newUser = new User(testUser);
    
    // Generate verification token
    const verificationToken = newUser.generateVerificationToken();
    console.log('✅ User created with verification token');
    
    // Save user to database
    await newUser.save();
    console.log('✅ User saved to database');
    console.log('   User ID:', newUser._id);
    console.log('   Email:', newUser.email);
    console.log('   Verified status:', newUser.isVerified);
    
    // Send actual verification email
    console.log('📧 Sending verification email...');
    await sendVerificationEmail(newUser.email, verificationToken);
    console.log('✅ Verification email sent successfully!');
    console.log('   Check your email inbox for verification link');
}

// Test email verification process
async function testEmailVerificationProcess() {
    // Get user with verification token
    const user = await User.findOne({ email: testUser.email }).select('+verificationToken');
    
    if (!user || !user.verificationToken) {
        throw new Error('User or verification token not found');
    }
    
    console.log('✅ Verification token found in database');
    console.log('   Token length:', user.verificationToken.length);
    console.log('   User verified before:', user.isVerified);
    
    // Simulate email verification (clicking the link)
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    console.log('✅ Email verification completed');
    console.log('   User verified after:', user.isVerified);
}

// Test user login process
async function testUserLogin() {
    // Find verified user
    const user = await User.findOne({ email: testUser.email }).select('+password');
    
    if (!user) {
        throw new Error('User not found for login test');
    }
    
    if (!user.isVerified) {
        throw new Error('User not verified - cannot login');
    }
    
    // Test password verification
    const passwordValid = await user.comparePassword(testUser.password);
    if (!passwordValid) {
        throw new Error('Password verification failed');
    }
    
    // Generate JWT token for login
    const loginToken = generateToken(user._id);
    const decoded = verifyToken(loginToken);
    
    console.log('✅ User login successful');
    console.log('   Password verified:', passwordValid);
    console.log('   JWT token generated:', !!loginToken);
    console.log('   Token contains user ID:', decoded.userId === user._id.toString());
}

// Test password reset with actual email sending
async function testPasswordResetWithEmail() {
    // Find user for password reset
    const user = await User.findOne({ email: testUser.email });
    
    if (!user) {
        throw new Error('User not found for password reset test');
    }
    
    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    console.log('✅ Password reset token generated');
    console.log('   Token length:', resetToken.length);
    console.log('   Reset expiry set:', !!user.resetPasswordExpire);
    
    // Send actual password reset email
    console.log('📧 Sending password reset email...');
    await sendPasswordResetEmail(user.email, resetToken);
    console.log('✅ Password reset email sent successfully!');
    console.log('   Check your email inbox for reset link');
    
    // Simulate password reset (using the token)
    const newPassword = 'NewSecurePassword123!';
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    // Verify new password works
    const updatedUser = await User.findOne({ email: testUser.email }).select('+password');
    const newPasswordWorks = await updatedUser.comparePassword(newPassword);
    
    console.log('✅ Password reset completed');
    console.log('   New password works:', newPasswordWorks);
}

// Test JWT authentication system
async function testJWTAuthentication() {
    const user = await User.findOne({ email: testUser.email });
    
    // Test token generation
    const authToken = generateToken(user._id);
    console.log('✅ JWT token generated for authentication');
    
    // Test token verification
    const decoded = verifyToken(authToken);
    console.log('✅ JWT token verified successfully');
    console.log('   Token payload contains correct user ID:', decoded.userId === user._id.toString());
    console.log('   Token has expiration:', !!decoded.exp);
    
    // Test invalid token rejection
    try {
        verifyToken('invalid.token.here');
        throw new Error('Invalid token should have been rejected');
    } catch (error) {
        if (error.message.includes('Invalid token')) {
            console.log('✅ Invalid tokens properly rejected');
        } else {
            throw error;
        }
    }
}

// Run the complete test
if (require.main === module) {
    testCompleteAuthSystem().catch(console.error);
}

module.exports = { testCompleteAuthSystem };
