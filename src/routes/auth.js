const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../utils/validator');

// Route đăng ký
router.post('/register', validateRegister, handleValidationErrors, register);

// Route đăng nhập
router.post('/login', validateLogin, handleValidationErrors, login);

// Route đăng xuất (placeholder)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout endpoint - Coming soon!' });
});

module.exports = router;
