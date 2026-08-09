const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Create admin user
const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@trybee.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists. Updating to ensure admin privileges...');
      
      // Update existing user to be admin
      existingAdmin.isAdmin = true;
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      existingAdmin.firstName = 'Admin';
      existingAdmin.lastName = 'User';
      
      await existingAdmin.save();
      
      console.log('✅ Admin user updated successfully!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Admin: ${existingAdmin.isAdmin}`);
      console.log(`   Verified: ${existingAdmin.isVerified}`);
      console.log('📧 Email: admin@trybee.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Create admin user
    const adminData = {
      email: 'admin@trybee.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,  // Use isAdmin instead of role
      isVerified: true,  // Use isVerified instead of isEmailVerified
      isActive: true
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@trybee.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📤 Database connection closed');
  }
};

// Run the script
createAdmin();
