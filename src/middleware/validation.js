// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('full_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

// User login validation
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// User update validation
const userUpdateValidation = [
    body('full_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('address')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Address must not exceed 500 characters'),
    handleValidationErrors
];

// Product validation
const productValidation = [
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('discount_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount price must be a positive number'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    body('category_id')
        .isInt({ min: 1 })
        .withMessage('Category ID must be a valid number'),
    handleValidationErrors
];

// Category validation
const categoryValidation = [
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    handleValidationErrors
];

// Order validation
const orderValidation = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    body('items.*.product_id')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a valid number'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('shipping_address')
        .isLength({ min: 10, max: 500 })
        .withMessage('Shipping address must be between 10 and 500 characters'),
    body('payment_method')
        .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'])
        .withMessage('Invalid payment method'),
    handleValidationErrors
];

// Review validation
const reviewValidation = [
    body('product_id')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a valid number'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comment must not exceed 1000 characters'),
    handleValidationErrors
];

module.exports = {
    registerValidation,
    loginValidation,
    userUpdateValidation,
    productValidation,
    categoryValidation,
    orderValidation,
    reviewValidation,
    handleValidationErrors
};