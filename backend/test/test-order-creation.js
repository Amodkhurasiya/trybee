// Test Order Creation - Debug order creation issues
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testShippingAddress = {
    title: 'John Doe',
    street: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra', 
    zipCode: '400001',
    country: 'India',
    phone: '9876543210'
};

const testOrderData = {
    shippingAddress: testShippingAddress,
    paymentMethod: 'cod',
    notes: 'Test order from debug script'
};

async function testOrderCreation() {
    try {
        console.log('🧪 Testing Order Creation Endpoint...\n');
        
        // First login to get auth token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Add an item to cart first
        console.log('\n2. Adding item to cart...');
        const addToCartResponse = await axios.post(`${BASE_URL}/cart/add`, {
            productId: '507f1f77bcf86cd799439011', // dummy product id
            quantity: 1
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Cart response:', addToCartResponse.data);
        
        // Try to create order
        console.log('\n3. Creating order...');
        const orderResponse = await axios.post(`${BASE_URL}/orders/create`, testOrderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Order created successfully!');
        console.log('Order data:', JSON.stringify(orderResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error testing order creation:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        
        // Log the full error for debugging
        console.error('\nFull error details:');
        console.error(error.response?.data || error.message);
    }
}

// Run the test
testOrderCreation();
