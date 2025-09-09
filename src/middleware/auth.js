// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const [rows] = await pool.execute(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [rows] = await pool.execute(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        req.user = rows.length > 0 ? rows[0] : null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = { auth, optionalAuth };