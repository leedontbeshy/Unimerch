const express = require('express');
const router = express.Router();

// Route đăng ký
router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint - Coming soon!' });
});

// Route đăng nhập
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint - Coming soon!' });
});

// Route đăng xuất
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout endpoint - Coming soon!' });
});

module.exports = router;
