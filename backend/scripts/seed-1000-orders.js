require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trybee-ecommerce';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

function buildAddress() {
  return {
    title: 'Home',
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('######'),
    country: 'India',
    phone: faker.phone.number('9#########')
  };
}

async function seedOrders(count = 1000) {
  await connectDB();
  try {
    const users = await User.find({ isActive: true }).select('_id');
    const products = await Product.find({ isActive: { $ne: false }, stock: { $gt: 0 } }).select('_id name price');
    if (users.length === 0) throw new Error('No users available to create orders');
    if (products.length === 0) throw new Error('No products available to create orders');

    const bulk = [];

    for (let i = 0; i < count; i++) {
      const buyer = pick(users)._id;
      const itemsCount = randomInt(1, 4);
      const picked = new Set();
      const items = [];
      let totalAmount = 0;
      for (let j = 0; j < itemsCount; j++) {
        const p = pick(products);
        if (picked.has(p._id.toString())) continue; // avoid exact dupes
        picked.add(p._id.toString());
        const qty = randomInt(1, 3);
        items.push({ productId: p._id, name: p.name, price: p.price, quantity: qty, totalPrice: p.price * qty });
        totalAmount += p.price * qty;
      }
      const shippingFee = totalAmount > 500 ? 0 : 50;
      const taxAmount = Math.round(totalAmount * 0.1);
      const orderStatus = pick(['pending','confirmed','processing','shipped','delivered','cancelled']);
      const paymentStatus = pick(['pending','completed','failed','refunded']);

      bulk.push({
        insertOne: {
          document: {
            userId: buyer,
            items,
            shippingAddress: buildAddress(),
            paymentMethod: pick(['card','upi','cod']),
            paymentStatus,
            orderStatus,
            totalItems: items.reduce((n, it) => n + it.quantity, 0),
            totalAmount,
            shippingFee,
            taxAmount,
            finalAmount: totalAmount + shippingFee + taxAmount,
            statusHistory: [{ status: orderStatus, updatedBy: 'system', note: 'Seeded order' }],
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: new Date()
          }
        }
      });
    }

    if (bulk.length) {
      const res = await Order.bulkWrite(bulk, { ordered: false });
      console.log(`✅ Inserted ${res.insertedCount || count} orders`);
    }
  } catch (err) {
    console.error('❌ Seeding orders failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

const n = parseInt(process.env.SEED_ORDERS_COUNT || process.argv[2], 10) || 1000;
seedOrders(n);
