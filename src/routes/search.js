// src/routes/search.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @route   GET /api/search/products
 * @desc    Search products
 * @access  Public
 */
router.get('/products', searchController.searchProducts);

/**
 * @route   GET /api/search/categories
 * @desc    Search categories
 * @access  Public
 */
router.get('/categories', searchController.searchCategories);

/**
 * @route   GET /api/search/users
 * @desc    Search users (sellers)
 * @access  Public
 */
router.get('/users', searchController.searchUsers);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions
 * @access  Public
 */
router.get('/suggestions', searchController.getSearchSuggestions);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular search terms
 * @access  Public
 */
router.get('/popular', searchController.getPopularSearches);

/**
 * @route   GET /api/search/advanced
 * @desc    Advanced search with filters
 * @access  Public
 */
router.get('/advanced', searchController.advancedSearch);

/**
 * @route   POST /api/search/log
 * @desc    Log search term
 * @access  Public
 */
router.post('/log', searchController.logSearchTerm);

module.exports = router;