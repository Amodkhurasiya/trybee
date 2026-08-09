const mongoose = require('mongoose');
const User = require('../models/User');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/trybee-ecommerce');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check admin users
const checkAdmins = async () => {
  try {
    await connectDB();

    // Find all admin users
    const admins = await User.find({ isAdmin: true });

    console.log(`\n📊 Found ${admins.length} admin user(s):\n`);

    if (admins.length === 0) {
      console.log('❌ No admin users found');
      console.log('💡 Run "node scripts/create-admin.js" to create an admin user');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Admin: ${admin.isAdmin ? 'Yes' : 'No'}`);
        console.log(`   ✅ Email Verified: ${admin.isVerified ? 'Yes' : 'No'}`);
        console.log(`   🟢 Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Also show total user count
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    console.log('📈 User Statistics:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Active Users: ${activeUsers}`);
    console.log(`   Verified Users: ${verifiedUsers}`);
    console.log(`   Admin Users: ${admins.length}`);

  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📤 Database connection closed');
  }
};

// Run the script
checkAdmins();
