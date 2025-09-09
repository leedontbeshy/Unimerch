const express = require('express');
const router = express.Router();
const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { 
    validateRegister, 
    validateLogin, 
    validateForgotPassword,
    validateResetPassword,
    handleValidationErrors 
} = require('../utils/validator');
const { authenticateToken } = require('../middleware/auth');

// Route đăng ký
router.post('/register', validateRegister, handleValidationErrors, register);

// Route đăng nhập
router.post('/login', validateLogin, handleValidationErrors, login);

// Route đăng xuất
router.post('/logout', authenticateToken, logout);

// Route quên mật khẩu
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);

// Route reset mật khẩu
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

module.exports = router;
