// src/routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private/Admin
 */
router.get('/dashboard', auth, roleCheck(['admin']), statsController.getDashboardStats);

/**
 * @route   GET /api/stats/seller/:sellerId
 * @desc    Get seller statistics
 * @access  Private/Seller/Admin
 */
router.get('/seller/:sellerId', auth, roleCheck(['seller', 'admin']), statsController.getSellerStats);

/**
 * @route   GET /api/stats/products
 * @desc    Get product statistics
 * @access  Private/Admin
 */
router.get('/products', auth, roleCheck(['admin']), statsController.getProductStats);

/**
 * @route   GET /api/stats/orders
 * @desc    Get order statistics
 * @access  Private/Admin
 */
router.get('/orders', auth, roleCheck(['admin']), statsController.getOrderStats);

/**
 * @route   GET /api/stats/users
 * @desc    Get user statistics
 * @access  Private/Admin
 */
router.get('/users', auth, roleCheck(['admin']), statsController.getUserStats);

/**
 * @route   GET /api/stats/revenue
 * @desc    Get revenue statistics
 * @access  Private/Admin
 */
router.get('/revenue', auth, roleCheck(['admin']), statsController.getRevenueStats);

/**
 * @route   GET /api/stats/categories
 * @desc    Get category statistics
 * @access  Private/Admin
 */
router.get('/categories', auth, roleCheck(['admin']), statsController.getCategoryStats);

/**
 * @route   GET /api/stats/reviews
 * @desc    Get review statistics
 * @access  Private/Admin
 */
router.get('/reviews', auth, roleCheck(['admin']), statsController.getReviewStats);

/**
 * @route   GET /api/stats/sales/:period
 * @desc    Get sales statistics by period
 * @access  Private/Admin
 */
router.get('/sales/:period', auth, roleCheck(['admin']), statsController.getSalesStats);

/**
 * @route   GET /api/stats/top-products
 * @desc    Get top selling products
 * @access  Private/Admin
 */
router.get('/top-products', auth, roleCheck(['admin']), statsController.getTopProducts);

module.exports = router;