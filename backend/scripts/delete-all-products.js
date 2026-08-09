require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trybee-ecommerce';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

async function run() {
  await connectDB();
  try {
    const before = await Product.countDocuments();
    const res = await Product.deleteMany({});
    const after = await Product.countDocuments();
    console.log(`🧹 Deleted ${res.deletedCount || before - after} products`);
    console.log(`📊 Remaining products: ${after}`);
  } catch (err) {
    console.error('❌ Failed to delete products:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

run();
