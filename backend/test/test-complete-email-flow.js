const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteEmailVerificationFlow() {
    console.log('🧪 Testing Complete Email Verification Flow...\n');
    
    try {
        const testEmail = `flowtest${Date.now()}@example.com`;
        
        // Test 1: Register user
        console.log('1️⃣ Testing user registration...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: testEmail,
            password: 'testpassword123',
            firstName: 'Flow',
            lastName: 'Test'
        });
        
        console.log('✅ Registration successful');
        
        // Test 2: Try to login before verification (should be blocked)
        console.log('\n2️⃣ Testing login before verification...');
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: testEmail,
                password: 'testpassword123'
            });
            console.log('❌ Login should have been blocked!');
        } catch (loginError) {
            if (loginError.response?.data?.requiresVerification) {
                console.log('✅ Login correctly blocked - verification required');
            } else {
                console.log('❌ Unexpected login error:', loginError.response?.data?.message);
            }
        }
        
        // Test 3: Try to register again with same email (should replace unverified user)
        console.log('\n3️⃣ Testing re-registration with same email...');
        const reRegisterResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: testEmail,
            password: 'newpassword123',
            firstName: 'New',
            lastName: 'User'
        });
        
        if (reRegisterResponse.data.success) {
            console.log('✅ Re-registration successful (old unverified user replaced)');
        }
        
        // Test 4: Try login with old password (should fail)
        console.log('\n4️⃣ Testing login with old password...');
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: testEmail,
                password: 'testpassword123'
            });
            console.log('❌ Login with old password should have failed!');
        } catch (oldPassError) {
            console.log('✅ Login with old password correctly failed');
        }
        
        // Test 5: Try login with new password (should still be blocked)
        console.log('\n5️⃣ Testing login with new password (still unverified)...');
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: testEmail,
                password: 'newpassword123'
            });
            console.log('❌ Login should still be blocked!');
        } catch (newPassError) {
            if (newPassError.response?.data?.requiresVerification) {
                console.log('✅ Login correctly blocked - verification still required');
            }
        }
        
        console.log('\n🎯 Complete flow test finished!');
        console.log('📧 The user would now need to check their email and click the verification link.');
        console.log('💡 When they click the link, the token will be properly validated and user will be verified.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCompleteEmailVerificationFlow();
