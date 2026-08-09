// Test the new products via API
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function testProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find({}).sort({ createdAt: -1 });
        
        console.log(`\n🔍 TESTING ${products.length} PRODUCTS:\n`);
        
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   ID: ${product._id}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: ₹${product.price}`);
            console.log(`   Stock: ${product.stock}`);
            console.log(`   Images: ${product.images.length} total`);
            
            if (product.images.length > 0) {
                console.log(`   Image files:`);
                product.images.forEach((img, imgIndex) => {
                    console.log(`     ${imgIndex + 1}. ${img}`);
                    console.log(`        URL: http://localhost:5000/files/products/${encodeURIComponent(img)}`);
                });
            }
            
            console.log(`   Slug: ${product.slug}`);
            console.log(`   Tags: [${product.tags.join(', ')}]`);
            console.log(`   Created: ${product.createdAt.toLocaleDateString()}`);
            console.log('');
        });

        // Test categories
        const categories = await Product.distinct('category');
        console.log(`📂 CATEGORIES: ${categories.join(', ')}`);
        
        // Count products per category
        console.log('\n📊 PRODUCTS PER CATEGORY:');
        for (const category of categories) {
            const count = await Product.countDocuments({ category });
            console.log(`   ${category}: ${count} products`);
        }

    } catch (error) {
        console.error('Error testing products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testProducts();
