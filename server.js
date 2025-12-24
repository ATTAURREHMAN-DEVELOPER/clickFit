const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// Middleware
// ===========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'upload_images')));

// ===========================
// Multer Configuration
// ===========================
// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'upload_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// ===========================
// Routes
// ===========================

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Image upload endpoint
app.post('/upload', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const fileInfo = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            path: `/uploads/${file.filename}`
        }));

        res.json({
            success: true,
            message: `Successfully uploaded ${req.files.length} file(s)`,
            files: fileInfo
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
});

// Get uploaded images
app.get('/api/images', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const images = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => ({
                filename: file,
                url: `/uploads/${file}`
            }));

        res.json({
            success: true,
            count: images.length,
            images: images
        });
    } catch (error) {
        console.error('Error reading images:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving images',
            error: error.message
        });
    }
});

// ===========================
// Error Handling
// ===========================
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ===========================
// Start Server
// ===========================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║      🏋️  CLICK FIT SERVER 🏋️          ║
║                                       ║
║  Server running on port ${PORT}        ║
║  http://localhost:${PORT}              ║
║                                       ║
║  Upload directory: upload_images/     ║
║                                       ║
╚═══════════════════════════════════════╝
    `);
});

module.exports = app;
