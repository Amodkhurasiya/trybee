require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected successfully!');
        console.log(`📍 Connected to: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

// Clean up cart items with invalid product references
const cleanupCartItems = async () => {
    try {
        console.log('🧹 Starting cart cleanup...');
        
        // Find all carts
        const carts = await Cart.find({});
        console.log(`📦 Found ${carts.length} carts to check`);
        
        let totalCleaned = 0;
        
        for (const cart of carts) {
            console.log(`\n🔍 Checking cart for user: ${cart.userId}`);
            console.log(`   Items before cleanup: ${cart.items.length}`);
            
            // Populate product references
            await cart.populate('items.productId');
            
            const originalLength = cart.items.length;
            
            // Filter out items with null or invalid product references
            cart.items = cart.items.filter(item => {
                if (!item.productId) {
                    console.log(`   ❌ Removing item with null productId`);
                    return false;
                }
                
                if (typeof item.productId === 'string') {
                    console.log(`   ❌ Removing item with string productId: ${item.productId}`);
                    return false;
                }
                
                if (!item.productId._id) {
                    console.log(`   ❌ Removing item with no product _id`);
                    return false;
                }
                
                if (!item.productId.name) {
                    console.log(`   ❌ Removing item with no product name`);
                    return false;
                }
                
                if (!item.productId.isActive) {
                    console.log(`   ❌ Removing item with inactive product: ${item.productId.name}`);
                    return false;
                }
                
                console.log(`   ✅ Keeping valid item: ${item.productId.name}`);
                return true;
            });
            
            const cleanedCount = originalLength - cart.items.length;
            totalCleaned += cleanedCount;
            
            if (cleanedCount > 0) {
                console.log(`   🧹 Cleaned up ${cleanedCount} items`);
                await cart.save();
            }
            
            console.log(`   Items after cleanup: ${cart.items.length}`);
        }
        
        console.log(`\n✅ Cart cleanup completed!`);
        console.log(`🧹 Total items cleaned: ${totalCleaned}`);
        
        // Show remaining valid cart items
        const updatedCarts = await Cart.find({}).populate('items.productId', 'name price category');
        
        for (const cart of updatedCarts) {
            if (cart.items.length > 0) {
                console.log(`\n📦 Cart for user ${cart.userId}:`);
                cart.items.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.productId?.name || 'Unknown'} (₹${item.price}) x${item.quantity}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error during cart cleanup:', error);
    }
};

// Main execution
const main = async () => {
    console.log('🚀 Starting cart cleanup script...');
    
    await connectDB();
    await cleanupCartItems();
    
    console.log('\n✨ Cleanup completed!');
    process.exit(0);
};

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
