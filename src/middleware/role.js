// src/middleware/role.js
const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

const isOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const resourceUserId = parseInt(req.params.id || req.params.userId);
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin' || currentUserId === resourceUserId) {
        return next();
    }

    return res.status(403).json({ message: 'Access denied: you can only access your own resources' });
};

const isSellerOrAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const userId = req.user.id;

    // Admin has access to everything
    if (userRole === 'admin') {
        return next();
    }

    // Seller can only access their own products
    if (userRole === 'seller') {
        try {
            const { pool } = require('../../config/database');
            const productId = req.params.id;

            if (productId) {
                const [rows] = await pool.execute(
                    'SELECT seller_id FROM products WHERE id = ?',
                    [productId]
                );

                if (rows.length === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                if (rows[0].seller_id !== userId) {
                    return res.status(403).json({ message: 'Access denied: you can only access your own products' });
                }
            }

            return next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
};

module.exports = {
    roleCheck,
    isOwnerOrAdmin,
    isSellerOrAdmin
};