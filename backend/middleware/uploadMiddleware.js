// File upload middleware using Multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const productsDir = path.join(uploadsDir, 'products');
const avatarsDir = path.join(uploadsDir, 'avatars');
const assetsAvatarsDir = path.join(__dirname, '../assets/avatars');

// Ensure directories exist
[uploadsDir, productsDir, avatarsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Configure storage for product images
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, productsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + extension);
    }
});

// File filter to allow only images
const imageFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        // Additional check for specific image types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Product image upload configuration
const uploadProductImages = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 5 // Maximum 5 files
    },
    fileFilter: imageFilter
});

// Middleware to handle multiple product images
const uploadMultipleProductImages = uploadProductImages.array('images', 5);

// Middleware wrapper with error handling
const handleProductImageUpload = (req, res, next) => {
    uploadMultipleProductImages(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 5 images allowed per product'
                });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum 5MB per image'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'File upload error: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        // Validate that at least one file was uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }
        
        next();
    });
};

// Function to delete a file
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                reject(err);
            } else {
                console.log('File deleted successfully:', filePath);
                resolve(true);
            }
        });
    });
};

// Function to delete product image
const deleteProductImage = async (filename) => {
    try {
        const filePath = path.join(productsDir, filename);
        if (fs.existsSync(filePath)) {
            await deleteFile(filePath);
            return true;
        } else {
            console.log('File does not exist:', filePath);
            return false;
        }
    } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
    }
};

// Function to read available avatars from assets/avatars directory dynamically
const getAvailableAvatars = () => {
    try {
        if (!fs.existsSync(assetsAvatarsDir)) {
            return [];
        }

        const allowedExts = new Set(['.png', '.jpg', '.jpeg', '.webp']);
        const files = fs.readdirSync(assetsAvatarsDir)
            .filter(f => allowedExts.has(path.extname(f).toLowerCase()));

        return files.map(filename => ({
            id: path.basename(filename, path.extname(filename)),
            name: filename,
            url: `/api/files/avatars/${filename}`
        }));
    } catch (e) {
        console.error('Error reading avatars from assets:', e.message);
        return [];
    }
};

// Function to validate avatar selection by ID
const validateAvatarSelection = (avatarId) => {
    if (!avatarId) return false;
    const list = getAvailableAvatars();
    return list.some(a => a.id === String(avatarId));
};

// Function to get avatar URL by ID
const getAvatarUrl = (avatarId) => {
    if (!avatarId) return null;
    const list = getAvailableAvatars();
    const found = list.find(a => a.id === String(avatarId));
    return found ? found.url : null;
};

// Function to get product image URLs
const getProductImageUrls = (imageFilenames) => {
    if (!imageFilenames || !Array.isArray(imageFilenames)) return [];
    
    return imageFilenames.map(filename => `/api/files/products/${filename}`);
};

module.exports = {
    handleProductImageUpload,
    deleteProductImage,
    getAvailableAvatars,
    validateAvatarSelection,
    getAvatarUrl,
    getProductImageUrls,
    // exported for potential external checks
};
