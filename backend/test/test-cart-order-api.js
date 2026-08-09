// Cart and Order API Routes Test
// This test validates the API endpoints for cart and order management

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test data
const testUser = {
    name: 'API Test User',
    email: 'api-test@trybee.com',
    password: 'TestPassword123!'
};

const testProduct = {
    name: 'API Test Product',
    description: 'Product for API testing',
    price: 199.99,
    category: 'jewelry',
    stock: 5
};

let userToken = '';
let adminToken = '';
let productId = '';

// Main test function
async function testCartOrderAPI() {
    console.log('Testing Cart & Order API Endpoints');
    console.log('====================================');
    
    try {
        // Test server connection
        console.log('\n1. Testing server connection...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        if (healthResponse.status === 200) {
            console.log('✅ Server is running');
        }
        
        // Register test user
        console.log('\n2. Registering test user...');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✅ User registered successfully');
        
        // Login user
        console.log('\n3. Logging in user...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        userToken = loginResponse.data.token;
        console.log('✅ User logged in successfully');
        
        // Create test product (admin operation)
        console.log('\n4. Creating test product...');
        // First login as admin (using existing admin credentials)
        const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@trybee.com',
            password: 'Admin123!'
        });
        adminToken = adminLoginResponse.data.token;
        
        const productResponse = await axios.post(`${API_URL}/products`, testProduct, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        productId = productResponse.data.product._id;
        console.log('✅ Test product created');
        
        // Test cart operations
        console.log('\n5. Testing cart operations...');
        
        // Add item to cart
        const addToCartResponse = await axios.post(`${API_URL}/cart/add`, {
            productId: productId,
            quantity: 2
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Item added to cart');
        
        // Get cart
        const getCartResponse = await axios.get(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Cart retrieved:', getCartResponse.data.cart.totalItems, 'items');
        
        // Update cart item
        const updateCartResponse = await axios.put(`${API_URL}/cart/update`, {
            productId: productId,
            quantity: 3
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Cart item updated');
        
        // Test order operations
        console.log('\n6. Testing order operations...');
        
        // Create order
        const orderData = {
            shippingAddress: {
                title: 'Home',
                street: '123 API Test Street',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                country: 'India',
                phone: '9876543210'
            },
            paymentMethod: 'cod',
            notes: 'API test order'
        };
        
        const createOrderResponse = await axios.post(`${API_URL}/orders/create`, orderData, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const orderId = createOrderResponse.data.order._id;
        console.log('✅ Order created:', createOrderResponse.data.order.orderNumber);
        
        // Get user orders
        const getUserOrdersResponse = await axios.get(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ User orders retrieved:', getUserOrdersResponse.data.orders.length, 'orders');
        
        // Test admin order operations
        console.log('\n7. Testing admin order operations...');
        
        // Get all orders (admin)
        const getAllOrdersResponse = await axios.get(`${API_URL}/orders/admin/all`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin orders retrieved:', getAllOrdersResponse.data.orders.length, 'orders');
        
        // Update order status (admin)
        const updateOrderStatusResponse = await axios.put(`${API_URL}/orders/admin/${orderId}/status`, {
            status: 'confirmed',
            note: 'Order confirmed via API test'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Order status updated to:', updateOrderStatusResponse.data.order.orderStatus);
        
        // Get order statistics (admin)
        const getStatsResponse = await axios.get(`${API_URL}/orders/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Order statistics retrieved');
        
        // Clear cart
        const clearCartResponse = await axios.delete(`${API_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Cart cleared');
        
        console.log('\n====================================');
        console.log('🎉 All API endpoint tests passed!');
        console.log('✅ Cart operations working');
        console.log('✅ Order management working');
        console.log('✅ Admin panel endpoints working');
        console.log('====================================');
        
    } catch (error) {
        console.log('\n❌ API test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
        console.log('\n💡 Make sure the server is running with: npm run dev');
    }
}

// Run the test
if (require.main === module) {
    testCartOrderAPI();
}

module.exports = testCartOrderAPI;
