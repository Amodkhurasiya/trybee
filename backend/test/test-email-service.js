// Email Service Test - Test actual email sending with Gmail
// This will test if your Gmail credentials work correctly

require('dotenv').config();

const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Test email address (you can change this to your email)
const testEmail = 'amodkhurasiya@gmail.com'; // Using your Gmail for testing
const testToken = 'test_verification_token_12345';
const testResetToken = 'test_reset_token_67890';

async function testEmailService() {
    console.log('Testing Email Service with Gmail Configuration');
    console.log('=============================================');
    
    try {
        // Test 1: Check environment variables
        console.log('\n1. Checking email configuration...');
        console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
        console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
        console.log('   CLIENT_URL:', process.env.CLIENT_URL ? '✅ Set' : '❌ Missing');
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email configuration missing in .env file');
        }
        
        // Test 2: Send verification email
        console.log('\n2. Testing verification email...');
        console.log('   Sending to:', testEmail);
        console.log('   Using token:', testToken);
        
        await sendVerificationEmail(testEmail, testToken);
        console.log('✅ Verification email sent successfully!');
        console.log('   Check your inbox for the verification email');
        
        // Test 3: Send password reset email
        console.log('\n3. Testing password reset email...');
        console.log('   Sending to:', testEmail);
        console.log('   Using token:', testResetToken);
        
        await sendPasswordResetEmail(testEmail, testResetToken);
        console.log('✅ Password reset email sent successfully!');
        console.log('   Check your inbox for the password reset email');
        
        // Success summary
        console.log('\n🎉 All email tests passed!');
        console.log('Gmail Configuration Working:');
        console.log('✓ SMTP connection successful');
        console.log('✓ Verification emails sending');
        console.log('✓ Password reset emails sending');
        console.log('✓ Email service fully functional');
        
        console.log('\nNext steps:');
        console.log('• Check your Gmail inbox for test emails');
        console.log('• Email service is ready for authentication system');
        console.log('• You can now test full user registration with email verification');
        
    } catch (error) {
        console.log('\n❌ Email service test failed');
        console.log('Error details:', error.message);
        
        // Common troubleshooting
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check your Gmail App Password is correct (16 characters)');
        console.log('2. Make sure 2-Step Verification is enabled on Gmail');
        console.log('3. Verify EMAIL_USER is your full Gmail address');
        console.log('4. Check if there are spaces in EMAIL_PASS (remove them)');
        console.log('5. Try generating a new App Password from Gmail settings');
    }
}

// Run the test
if (require.main === module) {
    testEmailService().catch(console.error);
}

module.exports = { testEmailService };
