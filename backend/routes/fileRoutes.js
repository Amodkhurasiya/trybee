// File serving routes for static file delivery
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Middleware to handle CORS for file serving
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve product images
router.get('/products/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads/products', filename);
        
        console.log('Serving product image:', filename);
        console.log('File path:', filePath);
        
        // Check if file exists; if not, serve default product image as graceful fallback
        if (!fs.existsSync(filePath)) {
            console.log('Product image not found:', filePath, '— serving default-product.jpg');

            const defaultPath = path.join(__dirname, '../assets/default-product.jpg');

            if (fs.existsSync(defaultPath)) {
                res.set({
                    'Content-Type': 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000',
                    'ETag': 'default-product'
                });
                return res.sendFile(defaultPath, (err) => {
                    if (err) {
                        console.error('Error serving default product image as fallback:', err);
                        if (!res.headersSent) {
                            res.status(500).json({ success: false, message: 'Error serving fallback image' });
                        }
                    }
                });
            }

            // As a final fallback if default asset is missing, respond with a lightweight SVG placeholder
            res.set('Content-Type', 'image/svg+xml');
            const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Product Image</text>
            </svg>`;
            return res.send(svg);
        }
        
        // Set appropriate content type based on file extension
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'image/jpeg'; // default
        
        switch (ext) {
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            default:
                contentType = 'image/jpeg';
        }
        
        // Set headers for proper image display
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            'ETag': filename
        });
        
        // Send the file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving product image:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error serving image'
                    });
                }
            } else {
                console.log('Product image served successfully:', filename);
            }
        });
        
    } catch (error) {
        console.error('Error in product image route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while serving image'
        });
    }
});

// Serve avatar images
router.get('/avatars/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads/avatars', filename);
        
        console.log('Serving avatar image:', filename);
        console.log('File path:', filePath);
        
        // Resolve path: prefer uploaded avatar, else assets default
        let resolvedPath = filePath;
        if (!fs.existsSync(resolvedPath)) {
            console.log('Avatar image not found in uploads, checking assets...');
            const assetsPath = path.join(__dirname, '../assets/avatars', filename);
            if (fs.existsSync(assetsPath)) {
                resolvedPath = assetsPath;
            } else {
                console.log('Avatar not found:', filename);
                return res.status(404).json({ success: false, message: 'Avatar not found' });
            }
        }

        // Determine content type from extension
        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = ext === '.png' ? 'image/png'
            : (ext === '.webp' ? 'image/webp'
            : 'image/jpeg');

        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            'ETag': filename
        });

        res.sendFile(resolvedPath, (err) => {
            if (err) {
                console.error('Error serving avatar:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: 'Error serving avatar' });
                }
            } else {
                console.log('Avatar served successfully:', filename);
            }
        });
        
    } catch (error) {
        console.error('Error in avatar route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while serving avatar'
        });
    }
});

// Serve default product image
router.get('/default-product.jpg', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../assets/default-product.jpg');
        
        console.log('Serving default product image');
        console.log('File path:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log('Default product image not found, creating placeholder response');
            // Return a simple SVG placeholder
            res.set('Content-Type', 'image/svg+xml');
            const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Product Image</text>
            </svg>`;
            return res.send(svg);
        }
        
        // Set headers for proper image display
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
            'ETag': 'default-product'
        });
        
        // Send the file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving default product image:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error serving default image'
                    });
                }
            } else {
                console.log('Default product image served successfully');
            }
        });
        
    } catch (error) {
        console.error('Error in default product image route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while serving default image'
        });
    }
});

// Health check for file serving
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'File serving is working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
