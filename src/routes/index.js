// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const reviewRoutes = require('./reviews');
const uploadRoutes = require('./upload');
const searchRoutes = require('./search');
const statsRoutes = require('./stats');

// Route middlewares
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API is running',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;