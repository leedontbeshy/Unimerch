const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

module.exports = {
    generateToken,
    verifyToken
};
