require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function getCategories() {
    await mongoose.connect(process.env.MONGODB_URI);
    const categories = await Product.distinct('category');
    console.log('Available categories:', categories);
    await mongoose.disconnect();
}

getCategories();
