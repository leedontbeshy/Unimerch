// src/routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');
const { categoryValidation } = require('../middleware/validation');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
router.post('/', auth, roleCheck(['admin']), categoryValidation, categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
router.put('/:id', auth, roleCheck(['admin']), categoryValidation, categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 */
router.delete('/:id', auth, roleCheck(['admin']), categoryController.deleteCategory);

/**
 * @route   GET /api/categories/:id/products
 * @desc    Get products in category
 * @access  Public
 */
router.get('/:id/products', categoryController.getCategoryProducts);

/**
 * @route   GET /api/categories/:id/stats
 * @desc    Get category statistics
 * @access  Private/Admin
 */
router.get('/:id/stats', auth, roleCheck(['admin']), categoryController.getCategoryStats);

module.exports = router;