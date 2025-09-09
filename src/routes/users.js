// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');
const { userUpdateValidation } = require('../middleware/validation');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', auth, userUpdateValidation, userController.updateProfile);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete current user account
 * @access  Private
 */
router.delete('/profile', auth, userController.deleteAccount);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', auth, roleCheck(['admin']), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', auth, roleCheck(['admin']), userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', auth, roleCheck(['admin']), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', auth, roleCheck(['admin']), userController.deleteUser);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/role', auth, roleCheck(['admin']), userController.updateUserRole);

/**
 * @route   GET /api/users/:id/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/:id/orders', auth, userController.getUserOrders);

module.exports = router;