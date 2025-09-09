const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

// Blacklist để lưu các token đã logout
const tokenBlacklist = new Set();

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return errorResponse(res, 'Token không được cung cấp', 401);
        }

        // Kiểm tra token có trong blacklist không
        if (tokenBlacklist.has(token)) {
            return errorResponse(res, 'Token đã bị vô hiệu hóa', 401);
        }

        // Xác thực token
        const decoded = verifyToken(token);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return errorResponse(res, 'Token không hợp lệ', 401);
    }
};

const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};

module.exports = {
    authenticateToken,
    addToBlacklist
};
