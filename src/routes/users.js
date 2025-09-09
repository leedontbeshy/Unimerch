const express = require('express');
const router = express.Router();

// Lấy danh sách users
router.get('/', (req, res) => {
    res.json({ message: 'Get all users - Coming soon!' });
});

// Lấy thông tin user theo ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Get user ${id} - Coming soon!` });
});

// Cập nhật thông tin user
router.put('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Update user ${id} - Coming soon!` });
});

// Xóa user
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Delete user ${id} - Coming soon!` });
});

module.exports = router;
