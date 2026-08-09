const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuthenticationFixes() {
    console.log('🧪 Testing Authentication Fixes...\n');
    
    try {
        // Test 1: Try to resend verification (should work now)
        console.log('1️⃣ Testing resend verification endpoint...');
        
        // First login to get a token (will need a verified user for this test)
        try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'amod1991khurasiya@gmail.com',
                password: 'securepassword123'
            });
            
            if (loginResponse.data.success) {
                console.log('✅ Login successful (user is verified)');
                
                // Test resend verification with token
                const token = loginResponse.data.data.token;
                const resendResponse = await axios.post(
                    `${BASE_URL}/auth/resend-verification`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                console.log('❌ Resend verification response:', resendResponse.data.message);
            }
        } catch (error) {
            if (error.response?.data?.requiresVerification) {
                console.log('✅ Login properly blocked for unverified user');
                console.log('Message:', error.response.data.message);
            } else {
                console.log('❌ Login error:', error.response?.data?.message || error.message);
            }
        }
        
        // Test 2: Create new user and test login verification requirement
        console.log('\n2️⃣ Testing login verification requirement...');
        
        const testEmail = `test${Date.now()}@example.com`;
        
        try {
            // Register new user
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
                email: testEmail,
                password: 'testpassword123',
                firstName: 'Test',
                lastName: 'User'
            });
            
            if (registerResponse.data.success) {
                console.log('✅ User registered successfully');
                
                // Try to login immediately (should be blocked)
                try {
                    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                        email: testEmail,
                        password: 'testpassword123'
                    });
                    
                    console.log('❌ Login should have been blocked for unverified user');
                } catch (loginError) {
                    if (loginError.response?.data?.requiresVerification) {
                        console.log('✅ Login properly blocked for unverified user');
                        console.log('Message:', loginError.response.data.message);
                    } else {
                        console.log('❌ Unexpected login error:', loginError.response?.data?.message);
                    }
                }
            }
        } catch (registerError) {
            console.log('❌ Registration error:', registerError.response?.data?.message || registerError.message);
        }
        
        // Test 3: Test profile update endpoint
        console.log('\n3️⃣ Testing profile update endpoint...');
        
        // Use existing verified user
        try {
            // Login first to get token
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'amod1991khurasiya@gmail.com',
                password: 'securepassword123'
            });
            
            if (loginResponse.data.success) {
                const token = loginResponse.data.data.token;
                
                // Test profile update
                const updateResponse = await axios.put(
                    `${BASE_URL}/users/profile`,
                    {
                        firstName: 'Amod Updated',
                        lastName: 'Khurasiya Updated',
                        phone: '+1234567890'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (updateResponse.data.success) {
                    console.log('✅ Profile update successful');
                    console.log('Updated data:', updateResponse.data.message);
                } else {
                    console.log('❌ Profile update failed:', updateResponse.data.message);
                }
            }
        } catch (error) {
            if (error.response?.data?.requiresVerification) {
                console.log('🔒 Cannot test profile update - user needs verification');
            } else {
                console.log('❌ Profile update error:', error.response?.data?.message || error.message);
            }
        }
        
        console.log('\n🎯 Authentication fixes testing complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAuthenticationFixes();
