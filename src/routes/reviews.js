// src/routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');
const { reviewValidation } = require('../middleware/validation');

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (admin) or user's reviews
 * @access  Private
 */
router.get('/', auth, reviewController.getReviews);

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a product
 * @access  Public
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get single review
 * @access  Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route   POST /api/reviews
 * @desc    Create new review
 * @access  Private
 */
router.post('/', auth, reviewValidation, reviewController.createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private
 */
router.put('/:id', auth, reviewValidation, reviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
router.delete('/:id', auth, reviewController.deleteReview);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get user's reviews
 * @access  Private/Admin
 */
router.get('/user/:userId', auth, roleCheck(['admin']), reviewController.getUserReviews);

/**
 * @route   GET /api/reviews/product/:productId/stats
 * @desc    Get review statistics for a product
 * @access  Public
 */
router.get('/product/:productId/stats', reviewController.getProductReviewStats);

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.put('/:id/helpful', auth, reviewController.markReviewHelpful);

module.exports = router;