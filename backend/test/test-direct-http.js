// Direct HTTP test to debug the login issue
const http = require('http');

async function testRegistrationAndLogin() {
    console.log('Direct HTTP Test - Registration and Login');
    console.log('========================================');
    
    const testUser = {
        email: 'httptest@trybee.com',
        password: 'HttpTestPassword123!'
    };
    
    try {
        // Step 1: Register user
        console.log('1. Testing registration...');
        const registerResult = await makeRequest('POST', '/api/auth/register', testUser);
        console.log('✅ Registration response:', registerResult);
        
        // Wait a moment for the server to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: Try to login (should fail - not verified)
        console.log('\n2. Testing login (should fail - not verified)...');
        try {
            const loginResult = await makeRequest('POST', '/api/auth/login', {
                email: testUser.email,
                password: testUser.password
            });
            console.log('⚠️  Login succeeded unexpectedly:', loginResult);
        } catch (loginError) {
            console.log('Login failed as expected:', loginError);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error);
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
                'Content-Type': 'application/json',
                'Content-Length': postData ? Buffer.byteLength(postData) : 0
            }
        };
        
        console.log(`Making ${method} request to ${path}`);
        if (data) console.log('Request body:', data);
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            console.log(`Response status: ${res.statusCode}`);
            
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
            console.log('Request error:', error.message);
            reject(`Request error: ${error.message}`);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Run test after a small delay to ensure server is stable
setTimeout(() => {
    testRegistrationAndLogin().catch(console.error);
}, 2000);
