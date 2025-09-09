const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const { validateRegister, handleValidationErrors } = require('../utils/validator');

// Route đăng ký
router.post('/register', validateRegister, handleValidationErrors, register);

// Route đăng nhập (giữ nguyên placeholder)
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint - Coming soon!' });
});

// Route đăng xuất (giữ nguyên placeholder)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout endpoint - Coming soon!' });
});

module.exports = router;
