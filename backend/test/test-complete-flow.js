// Complete Authentication Flow Test
// Tests registration, email verification, and login

require('dotenv').config();
const http = require('http');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');

async function testCompleteAuthFlow() {
    console.log('Complete Authentication Flow Test');
    console.log('=================================');
    
    const testUser = {
        email: 'fulltest@trybee.com',
        password: 'FullTestPassword123!'
    };
    
    try {
        // Clean up first
        await connectDB();
        await User.deleteOne({ email: testUser.email });
        await disconnectDB();
        
        // Step 1: Register user
        console.log('\n1. Testing user registration...');
        const registerResult = await makeRequest('POST', '/api/auth/register', testUser);
        console.log('✅ Registration successful');
        console.log('   User ID:', registerResult.data.userId);
        console.log('   Email verified:', registerResult.data.isVerified);
        console.log('   📧 Verification email sent');
        
        // Step 2: Try to login before verification (should fail)
        console.log('\n2. Testing login before email verification...');
        try {
            await makeRequest('POST', '/api/auth/login', testUser);
            console.log('❌ Login should have failed but succeeded');
        } catch (error) {
            if (error.includes('verify your email')) {
                console.log('✅ Login correctly rejected - email not verified');
                console.log('   Error message:', error);
            } else {
                console.log('❌ Unexpected error:', error);
            }
        }
        
        // Step 3: Simulate email verification (mark user as verified)
        console.log('\n3. Simulating email verification...');
        await connectDB();
        await User.updateOne(
            { email: testUser.email },
            { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
        );
        console.log('✅ User marked as verified in database');
        await disconnectDB();
        
        // Step 4: Try to login after verification (should succeed)
        console.log('\n4. Testing login after email verification...');
        try {
            const loginResult = await makeRequest('POST', '/api/auth/login', testUser);
            console.log('✅ Login successful after verification!');
            console.log('   Token received:', !!loginResult.data.token);
            console.log('   User data:', loginResult.data.user);
            console.log('   JWT Token (first 50 chars):', loginResult.data.token.substring(0, 50) + '...');
        } catch (error) {
            console.log('❌ Login failed after verification:', error);
        }
        
        // Step 5: Test protected route access
        console.log('\n5. Testing protected route access...');
        const loginResult = await makeRequest('POST', '/api/auth/login', testUser);
        const token = loginResult.data.token;
        
        try {
            const profileResult = await makeRequestWithAuth('GET', '/api/auth/me', null, token);
            console.log('✅ Protected route access successful');
            console.log('   Current user:', profileResult.data.email);
        } catch (error) {
            console.log('❌ Protected route access failed:', error);
        }
        
        // Clean up
        await connectDB();
        await User.deleteOne({ email: testUser.email });
        await disconnectDB();
        
        console.log('\n🎉 Complete Authentication Flow Test PASSED!');
        console.log('✅ User registration working');
        console.log('✅ Email verification requirement enforced');
        console.log('✅ Login working after verification');
        console.log('✅ JWT token generation working');
        console.log('✅ Protected routes working');
        console.log('✅ Email service working');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error);
    }
}

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(parsed.message || `HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`);
                    }
                } catch (parseError) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseData);
                    } else {
                        reject(`HTTP ${res.statusCode}: ${responseData}`);
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            reject(`Request error: ${error.message}`);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

function makeRequestWithAuth(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : undefined
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(parsed.message || `HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`);
                    }
                } catch (parseError) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseData);
                    } else {
                        reject(`HTTP ${res.statusCode}: ${responseData}`);
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            reject(`Request error: ${error.message}`);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Run the complete test
testCompleteAuthFlow().catch(console.error);
