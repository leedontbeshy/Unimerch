const express = require('express');
const router = express.Router();

// Lấy danh sách sản phẩm
router.get('/', (req, res) => {
    res.json({ message: 'Get all products - Coming soon!' });
});

// Lấy thông tin sản phẩm theo ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Get product ${id} - Coming soon!` });
});

// Tạo sản phẩm mới
router.post('/', (req, res) => {
    res.json({ message: 'Create new product - Coming soon!' });
});

// Cập nhật sản phẩm
router.put('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Update product ${id} - Coming soon!` });
});

// Xóa sản phẩm
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Delete product ${id} - Coming soon!` });
});

module.exports = router;
