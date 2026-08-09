// Simple database connection for MongoDB
const mongoose = require('mongoose');

// Simple function to connect to MongoDB
const connectDB = async () => {
    try {
        // Get the database URL from environment variables
        const mongoURL = process.env.MONGODB_URI;
        
        // Check if we have the database URL
        if (!mongoURL) {
            console.log('Error: No database URL found in .env file');
            process.exit(1);
        }

        // Connect to MongoDB - simple way
        await mongoose.connect(mongoURL);
        
        console.log('Database connected successfully!');
        console.log('Connected to:', mongoose.connection.name);
        
    } catch (error) {
        console.log('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Simple function to disconnect from MongoDB
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('Database disconnected');
    } catch (error) {
        console.log('Error disconnecting database:', error.message);
    }
};

module.exports = {
    connectDB,
    disconnectDB
};

// module.exports = {
//     connectDB,
//     disconnectDB
// };
