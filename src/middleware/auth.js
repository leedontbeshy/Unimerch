const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const BlacklistedToken = require('../models/BlacklistedToken');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(res, 'Token không được cung cấp', 401);
        }

        // Kiểm tra token có trong blacklist không
        const isBlacklisted = await BlacklistedToken.isBlacklisted(token);
        if (isBlacklisted) {
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

const addToBlacklist = async (token) => {
    try {
        // Decode token để lấy exp time
        const decoded = verifyToken(token);
        const expiresAt = new Date(decoded.exp * 1000);
        
        await BlacklistedToken.add(token, expiresAt);
    } catch (error) {
        console.error('Error adding token to blacklist:', error);
        throw error;
    }
};

module.exports = {
    authenticateToken,
    addToBlacklist
};
