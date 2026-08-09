// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Get port from environment variables or use 5000 as default
const PORT = process.env.PORT || 5000;

// Middleware setup
// Enable CORS for all routes (allows frontend to communicate with backend)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
    credentials: true // Allow cookies to be sent
}));

// Parse JSON requests (allows us to read JSON data from requests)
app.use(express.json());

// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const fileRoutes = require('./routes/fileRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const advancedSearchRoutes = require('./routes/advancedSearchRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

// API Routes
// Authentication routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// Placeholder image route for development
app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    // Return a simple SVG placeholder
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
            ${width} × ${height}
        </text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
});

// User profile routes
app.use('/api/users', userRoutes);

// File upload routes
app.use('/api/upload', uploadRoutes);

// File serving routes
app.use('/api/files', fileRoutes);

// Shopping cart routes
app.use('/api/cart', cartRoutes);

// Order management routes
app.use('/api/orders', orderRoutes);

// Advanced search routes
app.use('/api/search', advancedSearchRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);
// Support routes (contact form)
app.use('/api/support', supportRoutes);

// Basic Routes
// Health check endpoint - to test if server is running
app.get('/api/health', (req, res) => {
    const { checkDatabaseConnection } = require('./utils/dbUtils');
    const dbStatus = checkDatabaseConnection();
    
    res.status(200).json({
        success: true,
        message: 'Trybee Server is running successfully!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: dbStatus.state,
            connected: dbStatus.isConnected,
            host: dbStatus.host,
            database: dbStatus.database
        }
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Trybee - Tribal Products E-Commerce API',
        version: '1.0.0',
        documentation: 'Visit /api/health for server status',
        endpoints: {
            health: '/api/health',
            database: '/api/test-db',
            auth: '/api/auth',
            products: '/api/products',
            users: '/api/users'
        }
    });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const User = require('./models/User');
        const { checkDatabaseConnection } = require('./utils/dbUtils');
        
        const dbStatus = checkDatabaseConnection();
        
        if (!dbStatus.isConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database not connected',
                status: dbStatus.state
            });
        }
        
        // Test database operation - count users
        const userCount = await User.countDocuments();
        
        res.status(200).json({
            success: true,
            message: 'Database connection successful!',
            database: {
                host: dbStatus.host,
                database: dbStatus.database,
                status: dbStatus.state
            },
            stats: {
                totalUsers: userCount
            }
        });
        
    } catch (error) {
        console.error('Database test failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
        });
    }
});

// Catch all undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start the server with database
const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();
        
        // Then start the server
        app.listen(PORT, () => {
            console.log('Server started successfully!');
            console.log('Server running on: http://localhost:' + PORT);
            console.log('Health check: http://localhost:' + PORT + '/api/health');
            console.log('Database test: http://localhost:' + PORT + '/api/test-db');
        });
        
    } catch (error) {
        console.log('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle server shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    const { disconnectDB } = require('./config/database');
    await disconnectDB();
    process.exit(0);
});

// Start the server
startServer();

// Export app for testing purposes
module.exports = app;
