// src/routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');
const { productValidation } = require('../middleware/validation');

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filters
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/products/seller/:sellerId
 * @desc    Get products by seller
 * @access  Public
 */
router.get('/seller/:sellerId', productController.getProductsBySeller);

/**
 * @route   GET /api/products/category/:categoryId
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:categoryId', productController.getProductsByCategory);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Seller/Admin
 */
router.post('/', auth, roleCheck(['seller', 'admin']), productValidation, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Seller/Admin
 */
router.put('/:id', auth, roleCheck(['seller', 'admin']), productValidation, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private/Seller/Admin
 */
router.delete('/:id', auth, roleCheck(['seller', 'admin']), productController.deleteProduct);

/**
 * @route   PUT /api/products/:id/status
 * @desc    Update product status
 * @access  Private/Seller/Admin
 */
router.put('/:id/status', auth, roleCheck(['seller', 'admin']), productController.updateProductStatus);

/**
 * @route   PUT /api/products/:id/quantity
 * @desc    Update product quantity
 * @access  Private/Seller/Admin
 */
router.put('/:id/quantity', auth, roleCheck(['seller', 'admin']), productController.updateProductQuantity);

/**
 * @route   GET /api/products/:id/reviews
 * @desc    Get product reviews
 * @access  Public
 */
router.get('/:id/reviews', productController.getProductReviews);

module.exports = router;