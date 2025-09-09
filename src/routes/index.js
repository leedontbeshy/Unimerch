const express = require('express');
const router = express.Router();

// Import các route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');

// Sử dụng các routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

// Route mặc định
router.get('/', (req, res) => {
    res.json({ 
        message: 'UniMerch API Routes',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products'
        }
    });
});

module.exports = router;
