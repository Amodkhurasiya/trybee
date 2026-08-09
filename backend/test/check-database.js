// Quick Database Check - See what's in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Check collections
        const User = require('../models/User');
        const Product = require('../models/Product');
        const Cart = require('../models/Cart');
        const Order = require('../models/Order');
        
        console.log('\n📊 Database Status:');
        
        const userCount = await User.countDocuments();
        console.log(`Users: ${userCount}`);
        
        const productCount = await Product.countDocuments();
        console.log(`Products: ${productCount}`);
        
        const cartCount = await Cart.countDocuments();
        console.log(`Carts: ${cartCount}`);
        
        const orderCount = await Order.countDocuments();
        console.log(`Orders: ${orderCount}`);
        
        // List first few users
        const users = await User.find({}).limit(3).select('email isAdmin');
        console.log('\n👥 Sample Users:');
        users.forEach(user => {
            console.log(`- ${user.email} (${user.isAdmin ? 'Admin' : 'User'})`);
        });
        
        // List first few products
        const products = await Product.find({}).limit(3).select('name price stock category');
        console.log('\n📦 Sample Products:');
        products.forEach(product => {
            console.log(`- ${product.name} (₹${product.price}, Stock: ${product.stock})`);
        });
        
        mongoose.disconnect();
        console.log('\n✅ Database check complete');
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    }
}

checkDatabase();
