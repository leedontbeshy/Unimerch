// src/routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');
const { orderValidation } = require('../middleware/validation');

/**
 * @route   GET /api/orders
 * @desc    Get user's orders or all orders (admin)
 * @access  Private
 */
router.get('/', auth, orderController.getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', auth, orderController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', auth, orderValidation, orderController.createOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Seller/Admin
 */
router.put('/:id/status', auth, roleCheck(['seller', 'admin']), orderController.updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel order
 * @access  Private
 */
router.delete('/:id', auth, orderController.cancelOrder);

/**
 * @route   GET /api/orders/:id/items
 * @desc    Get order items
 * @access  Private
 */
router.get('/:id/items', auth, orderController.getOrderItems);

/**
 * @route   POST /api/orders/:id/payment
 * @desc    Process payment for order
 * @access  Private
 */
router.post('/:id/payment', auth, orderController.processPayment);

/**
 * @route   GET /api/orders/seller/:sellerId
 * @desc    Get orders for seller's products
 * @access  Private/Seller
 */
router.get('/seller/:sellerId', auth, roleCheck(['seller', 'admin']), orderController.getSellerOrders);

/**
 * @route   GET /api/orders/status/:status
 * @desc    Get orders by status
 * @access  Private/Admin
 */
router.get('/status/:status', auth, roleCheck(['admin']), orderController.getOrdersByStatus);

module.exports = router;