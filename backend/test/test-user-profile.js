// Test file for User Profile Management
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/database');

// Load environment variables
dotenv.config();

// Base URL for API testing
const BASE_URL = 'http://localhost:5000/api';

// Test data
let userToken = null;
let testUserId = null;
let testAddressId = null;

console.log('Starting User Profile Management Tests...\n');

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

// Test 2: Create and Login Test User
const createTestUser = async () => {
    try {
        console.log('Test 2: Creating test user...');
        
        const userData = {
            email: 'testuser@example.com',
            password: 'testuser123'
        };
        
        // Create verified user directly in database for testing
        const User = require('../models/User');
        
        let user = await User.findOne({ email: userData.email });
        
        if (!user) {
            user = await User.create({
                email: userData.email,
                password: userData.password,
                isVerified: true
            });
            console.log('✅ Test user created in database');
        } else {
            console.log('✅ Test user already exists');
        }
        
        testUserId = user._id;
        
        // Login to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, userData);
        
        if (loginResponse.data.success) {
            userToken = loginResponse.data.data.token;
            console.log('✅ Test user login successful');
            console.log('   Token received: Yes\n');
        } else {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Test user creation failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 3: Get User Profile (Empty)
const testGetEmptyProfile = async () => {
    try {
        console.log('Test 3: Testing get user profile (empty)...');
        
        const response = await axios.get(
            `${BASE_URL}/users/profile`,
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
        console.log('✅ User profile fetched successfully');
        console.log('   Email:', user.email);
        console.log('   Profile complete:', !!(user.firstName && user.lastName), '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Get profile test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 4: Update User Profile
const testUpdateProfile = async () => {
    try {
        console.log('Test 4: Testing profile update...');
        
        const profileData = {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            gender: 'male',
            preferences: {
                newsletter: true,
                notifications: false,
                theme: 'dark'
            }
        };
        
        const response = await axios.put(
            `${BASE_URL}/users/profile`,
            profileData,
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
        console.log('✅ Profile updated successfully');
        console.log('   Name:', user.firstName, user.lastName);
        console.log('   Phone:', user.phone);
        console.log('   Gender:', user.gender);
        console.log('   Theme preference:', user.preferences.theme, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Profile update test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 5: Add User Address
const testAddAddress = async () => {
    try {
        console.log('Test 5: Testing add user address...');
        
        const addressData = {
            title: 'Home',
            street: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            isDefault: true
        };
        
        const response = await axios.post(
            `${BASE_URL}/users/addresses`,
            addressData,
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
        const address = user.addresses[0];
        testAddressId = address._id;
        
        console.log('✅ Address added successfully');
        console.log('   Address ID:', testAddressId);
        console.log('   Title:', address.title);
        console.log('   Location:', address.city + ', ' + address.state);
        console.log('   Is Default:', address.isDefault, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Add address test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 6: Get User Addresses
const testGetAddresses = async () => {
    try {
        console.log('Test 6: Testing get user addresses...');
        
        const response = await axios.get(
            `${BASE_URL}/users/addresses`,
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            }
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const addresses = response.data.data.addresses;
        const defaultAddress = response.data.data.defaultAddress;
        
        console.log('✅ Addresses fetched successfully');
        console.log('   Total addresses:', addresses.length);
        if (defaultAddress) {
            console.log('   Default address:', defaultAddress.title);
        }
        console.log('');
        
        return true;
    } catch (error) {
        console.error('❌ Get addresses test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 7: Update User Address
const testUpdateAddress = async () => {
    try {
        console.log('Test 7: Testing update user address...');
        
        if (!testAddressId) {
            throw new Error('Test address ID not available');
        }
        
        const updateData = {
            title: 'Home - Updated',
            street: '123 Main Street, Apartment 4B - Updated',
            phone: '+1234567891'
        };
        
        const response = await axios.put(
            `${BASE_URL}/users/addresses/${testAddressId}`,
            updateData,
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
        const updatedAddress = user.addresses.find(addr => addr._id.toString() === testAddressId);
        
        console.log('✅ Address updated successfully');
        console.log('   Updated title:', updatedAddress.title);
        console.log('   Updated street:', updatedAddress.street, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Update address test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 8: Add Second Address
const testAddSecondAddress = async () => {
    try {
        console.log('Test 8: Testing add second address...');
        
        const addressData = {
            title: 'Office',
            street: '456 Business Park',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India',
            isDefault: false
        };
        
        const response = await axios.post(
            `${BASE_URL}/users/addresses`,
            addressData,
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
        console.log('✅ Second address added successfully');
        console.log('   Total addresses:', user.addresses.length);
        console.log('   New address:', addressData.title, 'in', addressData.city, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Add second address test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 9: Delete Address
const testDeleteAddress = async () => {
    try {
        console.log('Test 9: Testing delete address...');
        
        if (!testAddressId) {
            throw new Error('Test address ID not available');
        }
        
        const response = await axios.delete(
            `${BASE_URL}/users/addresses/${testAddressId}`,
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
        console.log('✅ Address deleted successfully');
        console.log('   Remaining addresses:', user.addresses.length, '\n');
        
        return true;
    } catch (error) {
        console.error('❌ Delete address test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Test 10: Unauthorized Access Test
const testUnauthorizedAccess = async () => {
    try {
        console.log('Test 10: Testing unauthorized access protection...');
        
        try {
            await axios.get(`${BASE_URL}/users/profile`);
            throw new Error('Expected unauthorized error but request succeeded');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Unauthorized access properly blocked');
                console.log('   Access denied without token\n');
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Unauthorized access test failed:', error.response?.data?.message || error.message, '\n');
        return false;
    }
};

// Run all tests
const runAllTests = async () => {
    const tests = [
        testDatabaseConnection,
        createTestUser,
        testGetEmptyProfile,
        testUpdateProfile,
        testAddAddress,
        testGetAddresses,
        testUpdateAddress,
        testAddSecondAddress,
        testDeleteAddress,
        testUnauthorizedAccess
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
    console.log('USER PROFILE MANAGEMENT TEST RESULTS:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log('='.repeat(50));
    
    if (failed === 0) {
        console.log('🎉 All user profile tests passed! Profile management system is working correctly.');
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
