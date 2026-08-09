// Test file for Module 4 - Product Model & CRUD Operations
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/database');

// Load environment variables
dotenv.config();

// Base URL for API testing
const BASE_URL = 'http://localhost:5000/api';

// Test data
let testProductId = null;
let adminToken = null;
let testUserId = null;

console.log('Starting Module 4 Tests: Product Model & CRUD Operations...\n');

// Test 1: Database Connection
const testDatabaseConnection = async () => {
    try {
        console.log('Test 1: Testing database connection...');
        await connectDB();
        console.log('✅ Database connected successfully\n');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message, '\n');
        return false;
    }
};

// Test 2: Product Model Schema
const testProductModel = async () => {
    try {
        console.log('Test 2: Testing Product model...');
        const Product = require('../models/Product');
        
        // Test model exists
        if (!Product) {
            throw new Error('Product model not found');
        }
        
        // Test schema fields
        const schema = Product.schema.paths;
        const requiredFields = ['name', 'description', 'price', 'category'];
        
        for (const field of requiredFields) {
            if (!schema[field]) {
                throw new Error(`Required field '${field}' not found in schema`);
            }
        }
        
        console.log('✅ Product model schema validation passed\n');
        return true;
    } catch (error) {
        console.error('❌ Product model test failed:', error.message, '\n');
        return false;
    }
};

// Test 3: Admin Middleware
const testAdminMiddleware = async () => {
    try {
        console.log('Test 3: Testing admin middleware...');
        const { requireAdmin } = require('../middleware/adminMiddleware');
        
        if (!requireAdmin || typeof requireAdmin !== 'function') {
            throw new Error('requireAdmin middleware not found or not a function');
        }
        
        console.log('✅ Admin middleware loaded successfully\n');
        return true;
    } catch (error) {
        console.error('❌ Admin middleware test failed:', error.message, '\n');
        return false;
    }
};

// Test 4: Create Admin User for Testing
const createAdminUser = async () => {
    try {
        console.log('Test 4: Creating admin user for testing...');
        
        const adminData = {
            email: 'admin@trybee.com',
            password: 'admin123'
        };
        
        // First, ensure we have a verified admin user in the database
        const User = require('../models/User');
        
        // Check if admin user already exists
        let adminUser = await User.findOne({ email: adminData.email });
        
        if (!adminUser) {
            // Create new admin user directly in database
            adminUser = await User.create({
                email: adminData.email,
                password: adminData.password,
                isVerified: true,
                isAdmin: true
            });
            console.log('✅ Admin user created in database');
        } else {
            // Update existing user to be admin and verified
            await User.findByIdAndUpdate(adminUser._id, {
                isVerified: true,
                isAdmin: true
            });
            console.log('✅ Existing user updated to admin');
        }
        
        testUserId = adminUser._id;
        
        // Now login to get the token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, adminData);
        
        if (loginResponse.data.success) {
            adminToken = loginResponse.data.data.token;
            console.log('✅ Admin user login successful');
            console.log('   User ID:', testUserId);
            console.log('   Token received: Yes\n');
        } else {
            throw new Error('Admin login failed: ' + loginResponse.data.message);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Admin user creation failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 5: Create Product (Admin Only)
const testCreateProduct = async () => {
    try {
        console.log('Test 5: Testing product creation...');
        
        const productData = {
            name: 'Traditional Tribal Jewelry',
            description: 'Beautiful handcrafted jewelry made by tribal artisans',
            price: 299.99,
            category: 'jewelry',
            stock: 10,
            tags: ['handmade', 'traditional', 'jewelry'],
            weight: 0.5,
            dimensions: {
                length: 20,
                width: 15,
                height: 2
            }
        };
        
        const response = await axios.post(
            `${BASE_URL}/products`,
            productData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        testProductId = response.data.data.product.id;
        console.log('✅ Product created successfully');
        console.log('   Product ID:', testProductId);
        console.log('   Product Name:', response.data.data.product.name, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Product creation failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 6: Get All Products
const testGetAllProducts = async () => {
    try {
        console.log('Test 6: Testing get all products...');
        
        const response = await axios.get(`${BASE_URL}/products`);
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const products = response.data.data.products;
        console.log('✅ Products fetched successfully');
        console.log('   Total products:', products.length);
        
        if (products.length > 0) {
            console.log('   First product:', products[0].name);
        }
        console.log('');
        
        return true;
    } catch (error) {
        console.error('❌ Get all products failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 7: Get Product by ID
const testGetProductById = async () => {
    try {
        console.log('Test 7: Testing get product by ID...');
        
        if (!testProductId) {
            throw new Error('Test product ID not available');
        }
        
        const response = await axios.get(`${BASE_URL}/products/${testProductId}`);
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const product = response.data.data.product;
        console.log('✅ Product fetched by ID successfully');
        console.log('   Product ID:', product.id);
        console.log('   Product Name:', product.name, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Get product by ID failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 8: Update Product (Admin Only)
const testUpdateProduct = async () => {
    try {
        console.log('Test 8: Testing product update...');
        
        if (!testProductId) {
            throw new Error('Test product ID not available');
        }
        
        const updateData = {
            name: 'Updated Traditional Tribal Jewelry',
            price: 349.99,
            stock: 15
        };
        
        const response = await axios.put(
            `${BASE_URL}/products/${testProductId}`,
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const product = response.data.data.product;
        console.log('✅ Product updated successfully');
        console.log('   Updated Name:', product.name);
        console.log('   Updated Price:', product.price, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Product update failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 9: Search Products
const testSearchProducts = async () => {
    try {
        console.log('Test 9: Testing product search...');
        
        const response = await axios.get(`${BASE_URL}/products/search?query=jewelry`);
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const products = response.data.data.products;
        console.log('✅ Product search completed successfully');
        console.log('   Search results:', products.length, 'products found');
        
        if (products.length > 0) {
            console.log('   First result:', products[0].name);
        }
        console.log('');
        
        return true;
    } catch (error) {
        console.error('❌ Product search failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 10: Get Products by Category
const testGetProductsByCategory = async () => {
    try {
        console.log('Test 10: Testing get products by category...');
        
        const response = await axios.get(`${BASE_URL}/products/category/jewelry`);
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const products = response.data.data.products;
        console.log('✅ Products by category fetched successfully');
        console.log('   Category: jewelry');
        console.log('   Products found:', products.length, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Get products by category failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 11: Authorization Test (Non-Admin)
const testAuthorizationProtection = async () => {
    try {
        console.log('Test 11: Testing admin authorization protection...');
        
        // Try to create product without admin token
        const productData = {
            name: 'Unauthorized Product',
            description: 'This should fail',
            price: 100,
            category: 'crafts'
        };
        
        try {
            await axios.post(`${BASE_URL}/products`, productData);
            throw new Error('Expected authorization failure but request succeeded');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Admin authorization protection working correctly');
                console.log('   Unauthorized access properly blocked\n');
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Authorization test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 12: Delete Product (Admin Only)
const testDeleteProduct = async () => {
    try {
        console.log('Test 12: Testing product deletion...');
        
        if (!testProductId) {
            throw new Error('Test product ID not available');
        }
        
        const response = await axios.delete(
            `${BASE_URL}/products/${testProductId}`,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        console.log('✅ Product deleted successfully');
        console.log('   Deleted product:', response.data.data.deletedProduct.name, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Product deletion failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Run all tests
const runAllTests = async () => {
    const tests = [
        testDatabaseConnection,
        testProductModel,
        testAdminMiddleware,
        createAdminUser,
        testCreateProduct,
        testGetAllProducts,
        testGetProductById,
        testUpdateProduct,
        testSearchProducts,
        testGetProductsByCategory,
        testAuthorizationProtection,
        testDeleteProduct
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await test();
        if (result) {
            passed++;
        } else {
            failed++;
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('='.repeat(50));
    console.log('MODULE 4 TEST RESULTS:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log('='.repeat(50));
    
    if (failed === 0) {
        console.log('🎉 All Module 4 tests passed! Product CRUD system is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the implementation.');
    }
    
    // Close database connection
    await mongoose.connection.close();
    process.exit(0);
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}
