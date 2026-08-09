// Add 2 random products with images from uploads
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Available images in uploads/products folder
const availableImages = [
    'amod image .jpg',
    'anshika.jpg', 
    'anuj.jpg',
    'IMG20250322171030.jpg',
    'IMG20250322171036.jpg',
    'IMG20250322171134.jpg',
    'IMG20250322171140.jpg',
    'IMG20250322171214.jpg',
    'IMG20250322171237.jpg'
];

// Random product data
const randomProducts = [
    {
        name: "Artisan Crafted Wooden Bowl",
        description: "Beautiful handcrafted wooden bowl made from premium teak wood. Perfect for serving fruits, salads, or as a decorative piece. Each bowl is unique with natural wood grain patterns.",
        price: 1250,
        category: "crafts",
        stock: 15,
        tags: ["wooden", "bowl", "handcrafted", "teak", "kitchen", "decorative"],
        weight: 0.8,
        dimensions: { length: 25, width: 25, height: 8 },
        images: [
            availableImages[0], // amod image .jpg
            availableImages[3], // IMG20250322171030.jpg
            availableImages[4]  // IMG20250322171036.jpg
        ]
    },
    {
        name: "Traditional Embroidered Textile Art",
        description: "Exquisite hand-embroidered textile artwork featuring traditional patterns and vibrant colors. This piece showcases centuries-old embroidery techniques passed down through generations.",
        price: 2800,
        category: "textiles", 
        stock: 8,
        tags: ["embroidered", "textile", "traditional", "handmade", "wall art", "colorful"],
        weight: 0.5,
        dimensions: { length: 60, width: 40, height: 2 },
        images: [
            availableImages[1], // anshika.jpg
            availableImages[2], // anuj.jpg
            availableImages[5], // IMG20250322171134.jpg
            availableImages[6]  // IMG20250322171140.jpg
        ]
    }
];

async function addRandomProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Show current product count
        const beforeCount = await Product.countDocuments();
        console.log(`\nProducts before adding: ${beforeCount}`);

        // Add products one by one
        const addedProducts = [];
        for (const productData of randomProducts) {
            try {
                const product = new Product(productData);
                const savedProduct = await product.save();
                addedProducts.push(savedProduct);
                console.log(`✅ Added: ${savedProduct.name}`);
                console.log(`   Category: ${savedProduct.category}`);
                console.log(`   Price: ₹${savedProduct.price}`);
                console.log(`   Images: ${savedProduct.images.length} images`);
                console.log(`   Images: [${savedProduct.images.join(', ')}]`);
                console.log('');
            } catch (error) {
                console.log(`❌ Error adding ${productData.name}:`, error.message);
            }
        }

        // Show final count
        const afterCount = await Product.countDocuments();
        console.log(`\n📊 SUMMARY:`);
        console.log(`Products before: ${beforeCount}`);
        console.log(`Products added: ${addedProducts.length}`);
        console.log(`Products after: ${afterCount}`);

        // Show all categories
        const categories = await Product.distinct('category');
        console.log(`\n📂 Available categories: ${categories.join(', ')}`);

        // Show all products
        console.log(`\n📝 ALL PRODUCTS IN DATABASE:`);
        const allProducts = await Product.find({}, 'name category price images').sort({ createdAt: -1 });
        allProducts.forEach(product => {
            console.log(`- ${product.name} (${product.category}) - ₹${product.price} - ${product.images.length} images`);
        });

    } catch (error) {
        console.error('Error adding products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    addRandomProducts();
}

module.exports = addRandomProducts;
