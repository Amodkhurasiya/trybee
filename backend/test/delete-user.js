const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function deleteUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database');
        
        // Try to find the user first
        const user = await User.findOne({ email: 'amod1991khurasiya@gmail.com' });
        
        if (user) {
            console.log('Found user to delete:');
            console.log('Email:', user.email);
            console.log('Name:', user.firstName, user.lastName);
            console.log('Verified:', user.isVerified);
            console.log('Admin:', user.isAdmin);
            
            // Delete the user
            const result = await User.deleteOne({ email: 'amod1991khurasiya@gmail.com' });
            console.log('✅ User deleted successfully. Deleted count:', result.deletedCount);
        } else {
            console.log('❌ User not found');
        }
        
        // Show remaining users
        const remainingUsers = await User.find({});
        console.log('\n📋 Remaining users in database:');
        remainingUsers.forEach(user => {
            console.log(`- ${user.email} | Verified: ${user.isVerified} | Admin: ${user.isAdmin}`);
        });
        
        await mongoose.disconnect();
        console.log('\nDatabase disconnected');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

deleteUser();
