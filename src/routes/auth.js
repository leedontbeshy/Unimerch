const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../utils/validator');
const { authenticateToken } = require('../middleware/auth');

// Route đăng ký
router.post('/register', validateRegister, handleValidationErrors, register);

// Route đăng nhập
router.post('/login', validateLogin, handleValidationErrors, login);

// Route đăng xuất
router.post('/logout', authenticateToken, logout);

module.exports = router;
