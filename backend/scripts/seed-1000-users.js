require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trybee-ecommerce';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

function randomBool(pTrue = 0.8) { return Math.random() < pTrue; }

async function seedUsers(count = 1000) {
  await connectDB();
  try {
    const salt = await bcrypt.genSalt(10);
    const docs = [];
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase();
      const passwordHash = await bcrypt.hash('Password@123', salt);
      docs.push({
        firstName,
        lastName,
        email,
        password: passwordHash,
        isAdmin: false,
        isVerified: randomBool(0.7),
        isActive: randomBool(0.95)
      });
    }
    const res = await User.insertMany(docs, { ordered: false });
    console.log(`✅ Inserted ${res.length} users`);
  } catch (err) {
    console.error('❌ Seeding users failed:', err.message);
    if (err.writeErrors) console.error(`Details: ${err.writeErrors.length} write errors`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

const n = parseInt(process.env.SEED_USERS_COUNT || process.argv[2], 10) || 1000;
seedUsers(n);
