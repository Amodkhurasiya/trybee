// Test utility to clean up test data from database
require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');

async function cleanupTestData() {
    console.log('Cleaning up test data...');
    
    try {
        await connectDB();
        
        // Remove test users
        const testEmails = [
            'apitest@trybee.com',
            'testauth@trybee.com',
            'test-simple@trybee.me',
            'httptest@trybee.com',
            'fulltest@trybee.com',
            'debugtest@trybee.com'
        ];
        
        for (const email of testEmails) {
            const result = await User.deleteOne({ email });
            console.log(`Deleted user ${email}:`, result.deletedCount > 0 ? '✅' : '❌ Not found');
        }
        
        console.log('✅ Test data cleanup completed');
        
    } catch (error) {
        console.log('❌ Cleanup failed:', error.message);
    } finally {
        await disconnectDB();
    }
}

if (require.main === module) {
    cleanupTestData();
}

module.exports = { cleanupTestData };
