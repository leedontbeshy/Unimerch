// src/routes/upload.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/role');
const { uploadMiddleware } = require('../middleware/upload');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image
 * @access  Private
 */
router.post('/image', auth, uploadMiddleware.single('image'), uploadController.uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images
 * @access  Private
 */
router.post('/images', auth, uploadMiddleware.array('images', 5), uploadController.uploadImages);

/**
 * @route   POST /api/upload/product-images
 * @desc    Upload product images
 * @access  Private/Seller/Admin
 */
router.post('/product-images', 
    auth, 
    roleCheck(['seller', 'admin']), 
    uploadMiddleware.array('productImages', 10), 
    uploadController.uploadProductImages
);

/**
 * @route   POST /api/upload/category-image
 * @desc    Upload category image
 * @access  Private/Admin
 */
router.post('/category-image', 
    auth, 
    roleCheck(['admin']), 
    uploadMiddleware.single('categoryImage'), 
    uploadController.uploadCategoryImage
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', auth, uploadMiddleware.single('avatar'), uploadController.uploadAvatar);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', auth, uploadController.deleteFile);

/**
 * @route   GET /api/upload/images/:filename
 * @desc    Get uploaded image
 * @access  Public
 */
router.get('/images/:filename', uploadController.getImage);

module.exports = router;