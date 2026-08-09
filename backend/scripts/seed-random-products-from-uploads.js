require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const UPLOADS_PRODUCTS_DIR = path.join(__dirname, '..', 'uploads', 'products');
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const CATEGORIES = ['jewelry', 'crafts', 'clothing', 'textiles'];

const SAMPLE_NAMES = {
  jewelry: ['Beaded Necklace', 'Silver Anklet', 'Handmade Bracelet', 'Terracotta Earrings', 'Tribal Pendant'],
  crafts: ['Wooden Mask', 'Carved Bowl', 'Clay Pot', 'Bamboo Basket', 'Stone Figurine'],
  clothing: ['Handloom Kurta', 'Printed Tee', 'Embroidered Shawl', 'Cotton Saree', 'Patchwork Jacket'],
  textiles: ['Woven Throw', 'Table Runner', 'Cushion Cover', 'Wall Hanging', 'Rug']
};

const TAGS = ['handmade', 'artisan', 'eco-friendly', 'ethnic', 'traditional', 'sustainable', 'limited'];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick(arr) { return arr[randomInt(0, arr.length - 1)]; }
function pickMany(arr, count) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < Math.min(count, copy.length); i++) {
    const idx = randomInt(0, copy.length - 1);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trybee-ecommerce';
  const conn = await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
  console.log(`📍 DB Name: ${conn.connection.name}`);
}

function getAvailableImages() {
  if (!fs.existsSync(UPLOADS_PRODUCTS_DIR)) {
    throw new Error(`Uploads folder not found: ${UPLOADS_PRODUCTS_DIR}`);
  }
  const files = fs.readdirSync(UPLOADS_PRODUCTS_DIR)
    .filter(f => ALLOWED_EXTS.has(path.extname(f).toLowerCase()));
  if (files.length === 0) {
    throw new Error('No product images found in uploads/products');
  }
  return files;
}

function buildDescription(category) {
  const base = 'Authentic, handcrafted piece sourced directly from artisan communities.';
  const extra = {
    jewelry: ' Crafted with care using traditional techniques and natural materials.',
    crafts: ' Each item carries unique patterns and textures that tell a story.',
    clothing: ' Comfortable and breathable, designed for everyday wear.',
    textiles: ' Soft yet durable, ideal for home decor and gifting.'
  };
  return `${base}${extra[category]}`;
}

async function seed(count = 60) {
  await connectDB();
  try {
    const images = getAvailableImages();
    console.log(`🖼️ Found ${images.length} product image(s) in uploads/products`);

    const created = [];
    for (let i = 0; i < count; i++) {
      const category = pick(CATEGORIES);
      const name = `${pick(SAMPLE_NAMES[category])} #${Date.now().toString().slice(-6)}-${i+1}`;
      const price = randomInt(99, 4999);
      const stock = Math.random() < 0.2 ? 0 : randomInt(1, 50); // ~20% out of stock
      const imgCount = randomInt(1, Math.min(4, images.length));
      const productImages = pickMany(images, imgCount);
      const dims = { length: randomFloat(10, 60), width: randomFloat(10, 60), height: randomFloat(1, 30) };

      const product = new Product({
        name,
        description: buildDescription(category),
        price,
        category,
        images: productImages,
        stock,
        weight: randomFloat(0.1, 5),
        dimensions: dims,
        tags: pickMany(TAGS, randomInt(2, 5))
      });

      try {
        const saved = await product.save(); // ensure pre-save slug generation runs
        created.push(saved);
        console.log(`➕ ${saved.name} (${category}) ₹${price} [${productImages.length} img] stock:${stock}`);
      } catch (err) {
        console.error('❌ Failed to save product:', err.message);
      }
    }

    const total = await Product.countDocuments();
    console.log('\n✅ Seeding complete');
    console.log(`Created: ${created.length} product(s)`);
    console.log(`Total in DB now: ${total}`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// CLI: node script.js [count]
const argCount = parseInt(process.argv[2], 10);
const count = Number.isFinite(argCount) ? argCount : (parseInt(process.env.SEED_COUNT, 10) || 60);
seed(count);
