// Simple database helper functions
const mongoose = require('mongoose');

// Check if an ID is valid MongoDB ID
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Convert string to MongoDB ObjectId
const toObjectId = (id) => {
    if (!isValidObjectId(id)) {
        throw new Error('Invalid ID format');
    }
    return new mongoose.Types.ObjectId(id);
};

// Handle database errors in simple way
const handleDBError = (error) => {
    console.log('Database error:', error.message);
    
    // If email already exists
    if (error.code === 11000) {
        return {
            success: false,
            message: 'Email already exists'
        };
    }
    
    // If validation fails
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return {
            success: false,
            message: messages.join(', ')
        };
    }
    
    // If ID format is wrong
    if (error.name === 'CastError') {
        return {
            success: false,
            message: 'Invalid ID format'
        };
    }
    
    // For any other error
    return {
        success: false,
        message: 'Database operation failed'
    };
};

// Check if database is connected
const checkDatabaseConnection = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    return {
        state: states[state],
        isConnected: state === 1,
        host: mongoose.connection.host,
        database: mongoose.connection.name
    };
};

// Export the functions
module.exports = {
    isValidObjectId,
    toObjectId,
    handleDBError,
    checkDatabaseConnection
};
