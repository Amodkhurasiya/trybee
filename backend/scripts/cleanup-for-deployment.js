require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const ADMIN_EMAIL = process.env.DEPLOY_ADMIN_EMAIL || 'amod1991khurasiya@gmail.com';

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trybee-ecommerce';
  try {
    const conn = await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    console.log(`📍 DB Name: ${conn.connection.name}`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

async function ensureAdmin() {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    // Ensure flags are correct
    admin.isAdmin = true;
    admin.isVerified = true;
    admin.isActive = true;
    await admin.save();
    console.log(`👤 Admin preserved: ${ADMIN_EMAIL}`);
    return admin;
  }

  // Create admin if missing
  const tempPassword = Math.random().toString(36).slice(-10) + '!A9';
  admin = new User({
    email: ADMIN_EMAIL,
    password: tempPassword, // Will be hashed by pre-save hook
    firstName: 'Amod',
    lastName: 'Khurasiya',
    isAdmin: true,
    isVerified: true,
    isActive: true,
  });
  await admin.save();
  console.log(`🆕 Admin created: ${ADMIN_EMAIL}`);
  console.log(`🔑 Temporary password: ${tempPassword}`);
  return admin;
}

async function cleanupData(admin) {
  console.log('\n🧹 Starting cleanup for deployment...');

  // Counts before
  const [usersBefore, productsBefore, ordersBefore, cartsBefore] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Cart.countDocuments(),
  ]);
  console.log(`Before => Users: ${usersBefore}, Products: ${productsBefore}, Orders: ${ordersBefore}, Carts: ${cartsBefore}`);

  // Delete all users except admin
  const usersRes = await User.deleteMany({ _id: { $ne: admin._id } });
  console.log(`👥 Users removed (excluding admin): ${usersRes.deletedCount}`);

  // Delete orders, carts, products
  const [ordersRes, cartsRes, productsRes] = await Promise.all([
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Product.deleteMany({}),
  ]);
  console.log(`📦 Products removed: ${productsRes.deletedCount}`);
  console.log(`🧾 Orders removed: ${ordersRes.deletedCount}`);
  console.log(`🛒 Carts removed: ${cartsRes.deletedCount}`);

  // Counts after
  const [usersAfter, productsAfter, ordersAfter, cartsAfter] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Cart.countDocuments(),
  ]);
  console.log(`After  => Users: ${usersAfter}, Products: ${productsAfter}, Orders: ${ordersAfter}, Carts: ${cartsAfter}`);
}

async function main() {
  console.log('🚀 Cleanup-for-deployment script started');
  await connectDB();

  try {
    const admin = await ensureAdmin();
    await cleanupData(admin);
    console.log('\n✨ Cleanup completed successfully.');
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

main();
