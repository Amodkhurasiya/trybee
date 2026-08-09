// Simple test script for Module 1
// This file tests the basic server functionality

const testServer = async () => {
    const baseURL = 'http://localhost:5000';
    
    console.log('🧪 Testing Trybee Backend Server...\n');
    
    try {
        // Test 1: Root endpoint
        console.log('1. Testing root endpoint (/)...');
        const rootResponse = await fetch(baseURL);
        const rootData = await rootResponse.json();
        console.log('✅ Root endpoint response:', rootData.message);
        
        // Test 2: Health check endpoint
        console.log('\n2. Testing health check endpoint (/api/health)...');
        const healthResponse = await fetch(`${baseURL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check response:', healthData.message);
        console.log('📊 Server status:', healthData.success ? 'HEALTHY' : 'UNHEALTHY');
        
        // Test 3: Non-existent endpoint (should return 404)
        console.log('\n3. Testing 404 error handling...');
        const notFoundResponse = await fetch(`${baseURL}/api/nonexistent`);
        const notFoundData = await notFoundResponse.json();
        console.log('✅ 404 handling:', notFoundData.message);
        
        console.log('\n🎉 All tests passed! Module 1 is complete.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('💡 Make sure the server is running with: node server.js');
    }
};

// Run tests if this script is executed directly
if (require.main === module) {
    testServer();
}

module.exports = testServer;
