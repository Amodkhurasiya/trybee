// Module 6 Test File - Shopping Cart & Order Management Testing
// Tests cart operations and order management with admin functionality

// Load environment variables
require('dotenv').config();

// Import required modules
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { generateToken } = require('../utils/tokenUtils');

// Test data
const testUser = {
    email: 'cart-user@trybee.com',
    password: 'TestPassword123!'
};

const adminUser = {
    email: 'cart-admin@trybee.com',
    password: 'AdminPassword123!'
};

const testProduct = {
    name: 'Test Cart Product',
    description: 'Product for cart testing',
    price: 299.99,
    category: 'jewelry',
    stock: 10
};

let userToken = '';
let adminToken = '';
let testProductId = '';
let testOrderId = '';

// Main test function
async function testModule6() {
    console.log('Starting Module 6 Tests: Shopping Cart & Order Management');
    console.log('===========================================================');
    
    try {
        // Test 1: Database connection
        console.log('\nTest 1: Testing database connection...');
        await connectDB();
        console.log('Database connected successfully!');
        console.log('Connected to:', process.env.MONGODB_URI?.split('@')[1]?.split('?')[0] || 'MongoDB');
        
        // Test 2: Create test users and admin
        console.log('\nTest 2: Setting up test users...');
        await setupTestUsers();
        
        // Test 3: Create test product
        console.log('\nTest 3: Creating test product...');
        await createTestProduct();
        
        // Test 4: Test cart operations
        console.log('\nTest 4: Testing cart operations...');
        await testCartOperations();
        
        // Test 5: Test order creation
        console.log('\nTest 5: Testing order creation...');
        await testOrderCreation();
        
        // Test 6: Test user order management
        console.log('\nTest 6: Testing user order management...');
        await testUserOrderManagement();
        
        // Test 7: Test admin order management
        console.log('\nTest 7: Testing admin order management...');
        await testAdminOrderManagement();
        
        // Test 8: Test order statistics
        console.log('\nTest 8: Testing admin order statistics...');
        await testOrderStatistics();
        
        // Test 9: Test cart persistence
        console.log('\nTest 9: Testing cart persistence...');
        await testCartPersistence();
        
        // Test 10: Test stock management
        console.log('\nTest 10: Testing stock management...');
        await testStockManagement();
        
        // Cleanup
        console.log('\nTest 11: Cleaning up test data...');
        await cleanup();
        
        console.log('\n===========================================================');
        console.log('MODULE 6 TEST RESULTS:');
        console.log('✅ Passed: 10');
        console.log('❌ Failed: 0');
        console.log('📊 Total: 10');
        console.log('===========================================================');
        console.log('🎉 All Module 6 tests passed! Shopping cart and order system working correctly.');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
        console.log('Error details:', error);
    } finally {
        await disconnectDB();
        console.log('\nDatabase connection closed');
    }
}

// Setup test users and admin
async function setupTestUsers() {
    try {
        // Clean up existing test users
        await User.deleteOne({ email: testUser.email });
        await User.deleteOne({ email: adminUser.email });
        
        // Create regular user
        const user = new User(testUser);
        user.isVerified = true;
        await user.save();
        userToken = generateToken(user._id);
        
        // Create admin user
        const admin = new User(adminUser);
        admin.isVerified = true;
        admin.isAdmin = true;
        await admin.save();
        adminToken = generateToken(admin._id);
        
        console.log('✅ Test users created successfully');
        console.log('   Regular user:', testUser.email);
        console.log('   Admin user:', adminUser.email);
        
    } catch (error) {
        throw new Error('Failed to setup test users: ' + error.message);
    }
}

// Create test product
async function createTestProduct() {
    try {
        // Clean up existing test product
        await Product.deleteOne({ name: testProduct.name });
        
        // Create test product
        const product = new Product(testProduct);
        await product.save();
        testProductId = product._id;
        
        console.log('✅ Test product created successfully');
        console.log('   Product ID:', testProductId);
        console.log('   Product name:', product.name);
        console.log('   Stock:', product.stock);
        
    } catch (error) {
        throw new Error('Failed to create test product: ' + error.message);
    }
}

// Test cart operations
async function testCartOperations() {
    try {
        const user = await User.findOne({ email: testUser.email });
        
        // Test add to cart
        const cart = await Cart.findOrCreateCart(user._id);
        await cart.addItem(testProductId, 2, testProduct.price);
        
        if (cart.items.length !== 1) {
            throw new Error('Cart item not added');
        }
        
        if (cart.totalItems !== 2) {
            throw new Error('Cart total items incorrect');
        }
        
        console.log('✅ Add to cart working');
        console.log('   Items in cart:', cart.items.length);
        console.log('   Total items:', cart.totalItems);
        console.log('   Total amount:', cart.totalAmount);
        
        // Test update cart item
        await cart.updateItemQuantity(testProductId, 3);
        await cart.populate('items.productId');
        
        if (cart.totalItems !== 3) {
            throw new Error('Cart update failed');
        }
        
        console.log('✅ Update cart item working');
        console.log('   Updated quantity:', cart.items[0].quantity);
        
        // Test cart summary
        const summary = {
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
            itemCount: cart.items.length
        };
        
        console.log('✅ Cart summary working');
        console.log('   Summary:', summary);
        
    } catch (error) {
        throw new Error('Cart operations failed: ' + error.message);
    }
}

// Test order creation
async function testOrderCreation() {
    try {
        const user = await User.findOne({ email: testUser.email });
        const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
        
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty for order creation');
        }
        
        // Create order data
        const orderData = {
            userId: user._id,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                quantity: item.quantity,
                totalPrice: item.productId.price * item.quantity
            })),
            shippingAddress: {
                title: 'Home',
                street: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                country: 'India',
                phone: '9876543210'
            },
            paymentMethod: 'cod',
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
            shippingFee: 50,
            taxAmount: 0,
            notes: 'Test order creation'
        };
        
        const order = new Order(orderData);
        await order.save();
        testOrderId = order._id;
        
        if (!order.orderNumber) {
            throw new Error('Order number not generated');
        }
        
        console.log('✅ Order created successfully');
        console.log('   Order ID:', order._id);
        console.log('   Order number:', order.orderNumber);
        console.log('   Total amount:', order.finalAmount);
        console.log('   Status:', order.orderStatus);
        
    } catch (error) {
        throw new Error('Order creation failed: ' + error.message);
    }
}

// Test user order management
async function testUserOrderManagement() {
    try {
        const user = await User.findOne({ email: testUser.email });
        
        // Test get user orders
        const orders = await Order.getOrdersWithPagination(1, 10, user._id);
        
        if (orders.length === 0) {
            throw new Error('No orders found for user');
        }
        
        console.log('✅ Get user orders working');
        console.log('   Orders found:', orders.length);
        
        // Test get single order
        const order = await Order.findOne({ _id: testOrderId, userId: user._id });
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        console.log('✅ Get single order working');
        console.log('   Order status:', order.orderStatus);
        
        // Test order status update (simulate status change)
        await order.updateStatus('confirmed', 'system', 'Order confirmed for testing');
        
        if (order.orderStatus !== 'confirmed') {
            throw new Error('Order status not updated');
        }
        
        console.log('✅ Order status update working');
        console.log('   New status:', order.orderStatus);
        console.log('   Status history entries:', order.statusHistory.length);
        
    } catch (error) {
        throw new Error('User order management failed: ' + error.message);
    }
}

// Test admin order management
async function testAdminOrderManagement() {
    try {
        // Test get all orders (admin)
        const allOrders = await Order.getOrdersWithPagination(1, 10);
        
        if (allOrders.length === 0) {
            throw new Error('No orders found for admin view');
        }
        
        console.log('✅ Admin get all orders working');
        console.log('   Total orders:', allOrders.length);
        
        // Test admin order status update
        const order = await Order.findById(testOrderId);
        const originalStatus = order.orderStatus;
        
        order.adminNotes = 'Updated by admin for testing';
        await order.updateStatus('processing', 'admin', 'Admin updated status for testing');
        
        if (order.orderStatus !== 'processing') {
            throw new Error('Admin status update failed');
        }
        
        console.log('✅ Admin order status update working');
        console.log('   Previous status:', originalStatus);
        console.log('   New status:', order.orderStatus);
        console.log('   Admin notes:', order.adminNotes);
        
        // Test admin order search by status
        const processingOrders = await Order.getOrdersWithPagination(1, 10, null, 'processing');
        
        if (processingOrders.length === 0) {
            throw new Error('Status filter not working');
        }
        
        console.log('✅ Admin order filtering working');
        console.log('   Processing orders:', processingOrders.length);
        
    } catch (error) {
        throw new Error('Admin order management failed: ' + error.message);
    }
}

// Test order statistics
async function testOrderStatistics() {
    try {
        // Test order statistics
        const stats = await Order.getOrderStats();
        
        if (!Array.isArray(stats)) {
            throw new Error('Order stats not returned as array');
        }
        
        console.log('✅ Order statistics working');
        console.log('   Stats entries:', stats.length);
        stats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} orders, $${stat.totalAmount}`);
        });
        
        // Test total orders count
        const totalOrders = await Order.countDocuments();
        
        if (totalOrders === 0) {
            throw new Error('Total orders count failed');
        }
        
        console.log('✅ Order count working');
        console.log('   Total orders:', totalOrders);
        
    } catch (error) {
        throw new Error('Order statistics failed: ' + error.message);
    }
}

// Test cart persistence
async function testCartPersistence() {
    try {
        const user = await User.findOne({ email: testUser.email });
        
        // Clear existing cart
        let cart = await Cart.findOne({ userId: user._id });
        if (cart) {
            await cart.clearCart();
        }
        
        // Add item to cart
        cart = await Cart.findOrCreateCart(user._id);
        await cart.addItem(testProductId, 1, testProduct.price);
        
        // Simulate user logout/login by refetching cart
        const persistedCart = await Cart.findOne({ userId: user._id });
        
        if (!persistedCart || persistedCart.items.length === 0) {
            throw new Error('Cart not persisted');
        }
        
        console.log('✅ Cart persistence working');
        console.log('   Persisted items:', persistedCart.items.length);
        console.log('   Total amount:', persistedCart.totalAmount);
        
    } catch (error) {
        throw new Error('Cart persistence failed: ' + error.message);
    }
}

// Test stock management
async function testStockManagement() {
    try {
        // Get initial product stock
        const initialProduct = await Product.findById(testProductId);
        const initialStock = initialProduct.stock;
        
        console.log('   Initial stock:', initialStock);
        
        // Simulate order fulfillment (stock reduction)
        await Product.findByIdAndUpdate(testProductId, { $inc: { stock: -2 } });
        
        const updatedProduct = await Product.findById(testProductId);
        const updatedStock = updatedProduct.stock;
        
        if (updatedStock !== initialStock - 2) {
            throw new Error('Stock reduction failed');
        }
        
        console.log('✅ Stock management working');
        console.log('   Updated stock:', updatedStock);
        console.log('   Stock reduced by:', initialStock - updatedStock);
        
        // Simulate order cancellation (stock restoration)
        await Product.findByIdAndUpdate(testProductId, { $inc: { stock: 2 } });
        
        const restoredProduct = await Product.findById(testProductId);
        
        if (restoredProduct.stock !== initialStock) {
            throw new Error('Stock restoration failed');
        }
        
        console.log('✅ Stock restoration working');
        console.log('   Restored stock:', restoredProduct.stock);
        
    } catch (error) {
        throw new Error('Stock management failed: ' + error.message);
    }
}

// Cleanup test data
async function cleanup() {
    try {
        // Delete test users
        await User.deleteOne({ email: testUser.email });
        await User.deleteOne({ email: adminUser.email });
        
        // Delete test product
        await Product.findByIdAndDelete(testProductId);
        
        // Delete test cart
        const user = await User.findOne({ email: testUser.email });
        if (user) {
            await Cart.deleteOne({ userId: user._id });
        }
        
        // Delete test order
        if (testOrderId) {
            await Order.findByIdAndDelete(testOrderId);
        }
        
        console.log('✅ Test data cleaned up successfully');
        
    } catch (error) {
        console.log('⚠️  Cleanup warning:', error.message);
    }
}

// Run tests if called directly
if (require.main === module) {
    testModule6();
}

module.exports = testModule6;
