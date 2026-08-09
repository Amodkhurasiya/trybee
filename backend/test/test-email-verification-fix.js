const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api';

async function testEmailVerificationFix() {
    console.log('🧪 Testing Email Verification Fixes...\n');
    
    try {
        const testEmail = `testverify${Date.now()}@example.com`;
        
        // Step 1: Register new user
        console.log('1️⃣ Registering new user...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: testEmail,
            password: 'testpassword123',
            firstName: 'Test',
            lastName: 'Verify'
        });
        
        if (registerResponse.data.success) {
            console.log('✅ User registered successfully');
            console.log('Message:', registerResponse.data.message);
            
            // Simulate getting the token from email
            // In real scenario, user would click the link in email
            console.log('\n2️⃣ Simulating email verification...');
            
            // Get the user from database to check the token
            const mongoose = require('mongoose');
            const path = require('path');
            require('dotenv').config();
            const User = require('../models/User');
            
            await mongoose.connect(process.env.MONGODB_URI);
            
            // Find the user we just created
            const user = await User.findOne({ email: testEmail }).select('+verificationToken +verificationTokenExpire');
            
            if (user && user.verificationToken) {
                console.log('✅ User found with verification token');
                console.log('Token exists:', !!user.verificationToken);
                console.log('Token expires:', user.verificationTokenExpire);
                
                // We need to get the original unhashed token
                // Since we can't reverse the hash, let's test with a newly generated token
                const originalToken = user.generateVerificationToken();
                await user.save();
                
                console.log('\n3️⃣ Testing verification with correct token...');
                
                // Test verification with the correct token
                try {
                    const verifyResponse = await axios.post(`${BASE_URL}/auth/verify-email`, {
                        token: originalToken
                    });
                    
                    if (verifyResponse.data.success) {
                        console.log('✅ Email verification successful!');
                        console.log('Message:', verifyResponse.data.message);
                        
                        // Check if user is now verified
                        const verifiedUser = await User.findOne({ email: testEmail });
                        console.log('User verified status:', verifiedUser.isVerified);
                    }
                } catch (verifyError) {
                    console.log('❌ Verification failed:', verifyError.response?.data?.message);
                }
            } else {
                console.log('❌ User not found or no verification token');
            }
            
            // Step 4: Test registration with same email (should work now)
            console.log('\n4️⃣ Testing re-registration with same email...');
            try {
                const reRegisterResponse = await axios.post(`${BASE_URL}/auth/register`, {
                    email: testEmail,
                    password: 'newpassword123',
                    firstName: 'Test',
                    lastName: 'ReRegister'
                });
                
                if (reRegisterResponse.data.success) {
                    console.log('✅ Re-registration successful (old unverified user was replaced)');
                } else {
                    console.log('❌ Re-registration failed:', reRegisterResponse.data.message);
                }
            } catch (reRegError) {
                console.log('❌ Re-registration error:', reRegError.response?.data?.message);
            }
            
            await mongoose.disconnect();
            
        } else {
            console.log('❌ Registration failed:', registerResponse.data.message);
        }
        
        console.log('\n🎯 Email verification testing complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testEmailVerificationFix();
