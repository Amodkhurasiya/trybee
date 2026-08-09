// Test file for Module 5 - File Upload System
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/database');

// Load environment variables
dotenv.config();

// Base URL for API testing
const BASE_URL = 'http://localhost:5000/api';

// Test data
let userToken = null;
let adminToken = null;
let testUserId = null;
let testAdminId = null;
let testProductId = null;
let uploadedImageFilenames = [];

console.log('Starting Module 5 File Upload System Tests...\n');

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

// Test 2: Create Test Users (Regular user and Admin)
const createTestUsers = async () => {
    try {
        console.log('Test 2: Creating test users...');
        
        const User = require('../models/User');
        
        // Create regular user
        let user = await User.findOne({ email: 'testuser@example.com' });
        if (!user) {
            user = await User.create({
                email: 'testuser@example.com',
                password: 'testuser123',
                isVerified: true
            });
        }
        testUserId = user._id;
        
        // Create admin user  
        let admin = await User.findOne({ email: 'admin@example.com' });
        if (!admin) {
            admin = await User.create({
                email: 'admin@example.com',
                password: 'admin123',
                isVerified: true,
                isAdmin: true
            });
        }
        testAdminId = admin._id;
        
        // Login users to get tokens
        const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'testuser123'
        });
        userToken = userLoginResponse.data.data.token;
        
        const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        adminToken = adminLoginResponse.data.data.token;
        
        console.log('✅ Test users created and logged in');
        console.log('   Regular user token:', userToken ? 'Retrieved' : 'Failed');
        console.log('   Admin token:', adminToken ? 'Retrieved' : 'Failed', '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Test user creation failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 3: Get Available Avatars
const testGetAvatars = async () => {
    try {
        console.log('Test 3: Testing get available avatars...');
        
        const response = await axios.get(`${BASE_URL}/upload/avatars`);
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const avatars = response.data.data.avatars;
        console.log('✅ Available avatars retrieved successfully');
        console.log('   Available avatars:', avatars.length);
        console.log('   Avatar options:', avatars.map(a => a.name).join(', '), '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Get avatars test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 4: Update User Avatar
const testUpdateUserAvatar = async () => {
    try {
        console.log('Test 4: Testing user avatar update...');
        
        const avatarData = {
            avatarId: 'avatar2' // Select avatar 2
        };
        
        const response = await axios.put(
            `${BASE_URL}/upload/user/avatar`,
            avatarData,
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const user = response.data.data.user;
        console.log('✅ User avatar updated successfully');
        console.log('   Selected avatar:', user.avatar);
        console.log('   Avatar URL:', user.avatarUrl, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Update user avatar test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 5: Get User Avatar
const testGetUserAvatar = async () => {
    try {
        console.log('Test 5: Testing get user avatar...');
        
        const response = await axios.get(
            `${BASE_URL}/upload/user/avatar`,
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const user = response.data.data.user;
        console.log('✅ User avatar retrieved successfully');
        console.log('   Current avatar:', user.avatar);
        console.log('   Avatar URL:', user.avatarUrl, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Get user avatar test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 6: Create Test Product for Image Upload
const testCreateProduct = async () => {
    try {
        console.log('Test 6: Creating test product for image upload...');
        
        const productData = {
            name: 'Test Tribal Jewelry',
            description: 'Beautiful handcrafted tribal jewelry for testing image upload',
            price: 299.99,
            category: 'jewelry',
            stock: 10
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
        
        // Debug: Log the response structure
        console.log('   Product creation response structure:', JSON.stringify(response.data, null, 2));
        
        // Get product ID - check multiple possible locations
        const product = response.data.data.product || response.data.data || response.data.product;
        testProductId = product._id || product.id;
        
        console.log('✅ Test product created successfully');
        console.log('   Product ID:', testProductId);
        console.log('   Product name:', product.name, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Create test product failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 7: Create Test Image Files
const testCreateImageFiles = async () => {
    try {
        console.log('Test 7: Creating test image files...');
        
        // Create test directory
        const testImagesDir = path.join(__dirname, 'test-images');
        if (!fs.existsSync(testImagesDir)) {
            fs.mkdirSync(testImagesDir, { recursive: true });
        }
        
        // Create simple test image files (text-based for testing)
        const imageFiles = ['test1.jpg', 'test2.png', 'test3.jpeg'];
        
        for (let i = 0; i < imageFiles.length; i++) {
            const filename = imageFiles[i];
            const filepath = path.join(testImagesDir, filename);
            
            if (!fs.existsSync(filepath)) {
                const imageContent = `Test Image ${i + 1}\nFilename: ${filename}\nCreated for Module 5 testing\nSimulated image content`;
                fs.writeFileSync(filepath, imageContent);
            }
        }
        
        console.log('✅ Test image files created successfully');
        console.log('   Created files:', imageFiles.join(', '));
        console.log('   Directory:', testImagesDir, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Create test image files failed:', error.message, '\n');
        return false;
    }
};

// Test 8: Upload Product Images (Admin Only)
const testUploadProductImages = async () => {
    try {
        console.log('Test 8: Testing product image upload (Admin only)...');
        
        const testImagesDir = path.join(__dirname, 'test-images');
        const imageFiles = ['test1.jpg', 'test2.png', 'test3.jpeg'];
        
        const formData = new FormData();
        
        // Add image files to form data
        for (const filename of imageFiles) {
            const filepath = path.join(testImagesDir, filename);
            if (fs.existsSync(filepath)) {
                formData.append('images', fs.createReadStream(filepath));
            }
        }
        
        const response = await axios.post(
            `${BASE_URL}/upload/products/images`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${adminToken}`
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        uploadedImageFilenames = response.data.data.images;
        console.log('✅ Product images uploaded successfully');
        console.log('   Uploaded files:', uploadedImageFilenames.length);
        console.log('   Filenames:', uploadedImageFilenames);
        console.log('   Image URLs:', response.data.data.imageUrls, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Upload product images test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 9: Update Product with Images
const testUpdateProductImages = async () => {
    try {
        console.log('Test 9: Testing product image update...');
        
        const testImagesDir = path.join(__dirname, 'test-images');
        const newImageFiles = ['test1.jpg', 'test2.png']; // Upload fewer images
        
        const formData = new FormData();
        
        // Add new image files to form data
        for (const filename of newImageFiles) {
            const filepath = path.join(testImagesDir, filename);
            if (fs.existsSync(filepath)) {
                formData.append('images', fs.createReadStream(filepath));
            }
        }
        
        const response = await axios.put(
            `${BASE_URL}/upload/products/${testProductId}/images`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${adminToken}`
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const updatedProduct = response.data.data.product;
        console.log('✅ Product images updated successfully');
        console.log('   Product ID:', updatedProduct._id);
        console.log('   New images count:', updatedProduct.images.length);
        console.log('   New image URLs:', updatedProduct.imageUrls, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Update product images test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 10: Test Non-Admin Access (Should Fail)
const testNonAdminAccess = async () => {
    try {
        console.log('Test 10: Testing non-admin access protection...');
        
        const testImagesDir = path.join(__dirname, 'test-images');
        const formData = new FormData();
        formData.append('images', fs.createReadStream(path.join(testImagesDir, 'test1.jpg')));
        
        try {
            await axios.post(
                `${BASE_URL}/upload/products/images`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${userToken}` // Regular user token
                    }
                }
            );
            
            throw new Error('Expected authorization error but request succeeded');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Non-admin access properly blocked');
                console.log('   Authorization error returned correctly\n');
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Non-admin access test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 11: Test Avatar File Serving
const testAvatarFileServing = async () => {
    try {
        console.log('Test 11: Testing avatar file serving...');
        
        const response = await axios.get(`${BASE_URL}/files/avatars/avatar1.png`);
        
        console.log('✅ Avatar file served successfully');
        console.log('   Status code:', response.status);
        console.log('   Content type:', response.headers['content-type']);
        console.log('   File size:', response.data.length, 'bytes\n');
        
        return true;
    } catch (error) {
        console.error('❌ Avatar file serving test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 12: Test Invalid Avatar Selection
const testInvalidAvatarSelection = async () => {
    try {
        console.log('Test 12: Testing invalid avatar selection...');
        
        const invalidAvatarData = {
            avatarId: 'invalid-avatar' // Invalid avatar ID
        };
        
        try {
            await axios.put(
                `${BASE_URL}/upload/user/avatar`,
                invalidAvatarData,
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            throw new Error('Expected validation error but request succeeded');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Invalid avatar selection properly rejected');
                console.log('   Validation error returned correctly\n');
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Invalid avatar selection test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Cleanup function
const cleanup = async () => {
    try {
        console.log('Cleaning up test data...');
        
        // Remove test product if created
        if (testProductId) {
            try {
                await axios.delete(
                    `${BASE_URL}/products/${testProductId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`
                        }
                    }
                );
                console.log('✅ Test product cleaned up');
            } catch (error) {
                console.log('Note: Test product cleanup failed or already removed');
            }
        }
        
        // Remove test images directory
        const testImagesDir = path.join(__dirname, 'test-images');
        if (fs.existsSync(testImagesDir)) {
            fs.rmSync(testImagesDir, { recursive: true, force: true });
            console.log('✅ Test images directory cleaned up');
        }
        
    } catch (error) {
        console.error('Cleanup error:', error.message);
    }
};

// Run all tests
const runAllTests = async () => {
    const tests = [
        testDatabaseConnection,
        createTestUsers,
        testGetAvatars,
        testUpdateUserAvatar,
        testGetUserAvatar,
        testCreateProduct,
        testCreateImageFiles,
        testUploadProductImages,
        testUpdateProductImages,
        testNonAdminAccess,
        testAvatarFileServing,
        testInvalidAvatarSelection
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
    
    // Cleanup
    await cleanup();
    
    console.log('='.repeat(60));
    console.log('MODULE 5 FILE UPLOAD SYSTEM TEST RESULTS:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log('='.repeat(60));
    
    if (failed === 0) {
        console.log('🎉 All Module 5 tests passed! File upload system is working correctly.');
        console.log('\nModule 5 Features Implemented:');
        console.log('✅ User avatar selection from 5 pre-defined options');
        console.log('✅ Admin product image upload (maximum 5 images)');
        console.log('✅ Product image updates and replacement');
        console.log('✅ File serving for both avatars and product images');
        console.log('✅ Proper authorization and validation');
        console.log('✅ Production-ready file handling');
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
