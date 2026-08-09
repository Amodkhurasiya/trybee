require('dotenv').config();
const mongoose = require('mongoose');
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

// Create test products with existing images
const createTestProducts = async () => {
    try {
        // Product 1: Traditional Jewelry
        const product1 = new Product({
            name: "Handcrafted Silver Jewelry Set",
            description: "Beautiful handcrafted silver jewelry set featuring intricate traditional designs. Perfect for special occasions and cultural celebrations. Made by skilled artisans using premium silver.",
            price: 2500,
            category: "jewelry",
            stock: 15,
            images: [
                "amod image .jpg",
                "anshika.jpg",
                "anuj.jpg"
            ],
            weight: 0.25,
            dimensions: {
                length: 10,
                width: 5,
                height: 2
            },
            tags: ["handcrafted", "silver", "traditional", "jewelry", "artisan"],
            isActive: true
        });

        // Product 2: Traditional Clothing
        const product2 = new Product({
            name: "Elegant Traditional Kurta Collection",
            description: "Premium quality traditional kurta collection featuring beautiful embroidery and comfortable fabric. Perfect for festivals, weddings, and special occasions. Available in various sizes.",
            price: 1800,
            category: "clothing",
            stock: 25,
            images: [
                "IMG20250322171030.jpg",
                "IMG20250322171036.jpg",
                "IMG20250322171134.jpg",
                "IMG20250322171140.jpg"
            ],
            weight: 0.4,
            dimensions: {
                length: 75,
                width: 50,
                height: 2
            },
            tags: ["traditional", "kurta", "clothing", "embroidery", "festival"],
            isActive: true
        });

        // Save products
        const savedProduct1 = await product1.save();
        const savedProduct2 = await product2.save();

        console.log('✅ Test products created successfully!');
        console.log('📦 Product 1:', {
            id: savedProduct1._id,
            name: savedProduct1.name,
            images: savedProduct1.images,
            price: savedProduct1.price
        });
        console.log('📦 Product 2:', {
            id: savedProduct2._id,
            name: savedProduct2.name,
            images: savedProduct2.images,
            price: savedProduct2.price
        });

        console.log('\n🎯 Test Summary:');
        console.log('- Created 2 products with multiple images each');
        console.log('- Product 1 has 3 images');
        console.log('- Product 2 has 4 images');
        console.log('- All images are from existing upload folder');
        console.log('- Ready to test image display on frontend');

    } catch (error) {
        console.error('❌ Error creating test products:', error);
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                console.error(`   ${key}: ${error.errors[key].message}`);
            });
        }
    }
};

// Main execution
const main = async () => {
    console.log('🚀 Starting file upload system test...');
    console.log('📂 Using existing images from uploads/products folder');
    
    await connectDB();
    await createTestProducts();
    
    console.log('\n✨ File upload test completed!');
    console.log('🌐 Visit http://localhost:5173 to see the products');
    
    process.exit(0);
};

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
