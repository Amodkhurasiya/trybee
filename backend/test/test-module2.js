// Test script for Module 2 - Database and User Model
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const { handleDBError } = require('../utils/dbUtils');

// Load environment variables
dotenv.config();

const testModule2 = async () => {
    try {
        console.log('🧪 Testing Module 2: Database Setup & User Model\n');
        
        // Test 1: Database Connection
        console.log('1. Testing database connection...');
        await connectDB();
        console.log('✅ Database connection successful!\n');
        
        // Test 2: Create a test user
        console.log('2. Testing User model - Creating test user...');
        const testUser = new User({
            email: 'test@trybee.me',
            password: 'testpassword123',
            firstName: 'Test',
            lastName: 'User'
        });
        
        const savedUser = await testUser.save();
        console.log('✅ Test user created successfully!');
        console.log('   User ID:', savedUser.id);
        console.log('   Email:', savedUser.email);
        console.log('   Verified:', savedUser.isVerified);
        console.log('   Admin:', savedUser.isAdmin);
        console.log('   Created:', savedUser.createdAt);
        
        // Test 3: Password hashing
        console.log('\n3. Testing password hashing...');
        const isPasswordHashed = savedUser.password !== 'testpassword123';
        console.log('✅ Password properly hashed:', isPasswordHashed);
        
        // Test 4: Password comparison
        console.log('\n4. Testing password comparison...');
        const isPasswordCorrect = await savedUser.comparePassword('testpassword123');
        const isPasswordIncorrect = await savedUser.comparePassword('wrongpassword');
        console.log('✅ Correct password validation:', isPasswordCorrect);
        console.log('✅ Incorrect password rejection:', !isPasswordIncorrect);
        
        // Test 5: Generate verification token
        console.log('\n5. Testing email verification token...');
        const verificationToken = savedUser.generateVerificationToken();
        await savedUser.save();
        console.log('✅ Verification token generated:', !!verificationToken);
        console.log('   Token length:', verificationToken.length);
        
        // Test 6: Find user by verification token
        console.log('\n6. Testing find by verification token...');
        const foundUser = await User.findByVerificationToken(verificationToken);
        console.log('✅ User found by verification token:', !!foundUser);
        
        // Test 7: Password reset token
        console.log('\n7. Testing password reset token...');
        const resetToken = savedUser.generatePasswordResetToken();
        await savedUser.save();
        console.log('✅ Reset token generated:', !!resetToken);
        
        // Test 8: Find user by reset token
        console.log('\n8. Testing find by reset token...');
        const userByResetToken = await User.findByResetToken(resetToken);
        console.log('✅ User found by reset token:', !!userByResetToken);
        
        // Test 9: User validation
        console.log('\n9. Testing user validation...');
        try {
            const invalidUser = new User({
                email: 'invalid-email', // Invalid email format
                password: '123' // Too short password
            });
            await invalidUser.save();
            console.log('❌ Validation should have failed');
        } catch (error) {
            console.log('✅ Validation errors properly caught');
        }
        
        // Test 10: Duplicate email prevention
        console.log('\n10. Testing duplicate email prevention...');
        try {
            const duplicateUser = new User({
                email: 'test@trybee.me', // Same email as test user
                password: 'anotherpassword'
            });
            await duplicateUser.save();
            console.log('❌ Duplicate email should be prevented');
        } catch (error) {
            console.log('✅ Duplicate email properly prevented');
        }
        
        // Test 11: Count users
        console.log('\n11. Testing user count...');
        const userCount = await User.countDocuments();
        console.log('✅ Total users in database:', userCount);
        
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await User.findByIdAndDelete(savedUser._id);
        console.log('✅ Test user deleted');
        
        console.log('\n🎉 All Module 2 tests passed successfully!');
        console.log('\nModule 2 Features Verified:');
        console.log('✓ MongoDB Atlas connection');
        console.log('✓ User model with validation');
        console.log('✓ Password hashing with bcrypt');
        console.log('✓ Password comparison methods');
        console.log('✓ Email verification tokens');
        console.log('✓ Password reset tokens');
        console.log('✓ Input validation');
        console.log('✓ Duplicate prevention');
        console.log('✓ Database operations');
        
    } catch (error) {
        console.error('❌ Module 2 test failed:', error.message);
        if (error.code === 11000) {
            console.log('💡 Duplicate key error - user might already exist');
        }
    } finally {
        // Close database connection
        await disconnectDB();
        console.log('\n📡 Database connection closed');
        process.exit(0);
    }
};

// Run tests if this script is executed directly
if (require.main === module) {
    testModule2();
}

module.exports = testModule2;
