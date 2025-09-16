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
        if (!token) {
            throw new Error('Token is required');
        }
        
        // Decode token để lấy exp time
        const decoded = verifyToken(token);
        if (!decoded || !decoded.exp) {
            throw new Error('Invalid token: missing expiration');
        }
        
        const expiresAt = new Date(decoded.exp * 1000);
        
        // Check if token is already expired
        if (expiresAt <= new Date()) {
            console.warn('Token is already expired, but adding to blacklist for completeness');
        }
        
        console.log(`Adding token to blacklist, expires at: ${expiresAt.toISOString()}`);
        const result = await BlacklistedToken.add(token, expiresAt);
        console.log('Token successfully added to blacklist:', result?.id || 'success');
        
        return result;
    } catch (error) {
        console.error('Error adding token to blacklist:', error);
        throw error;
    }
};

module.exports = {
    authenticateToken,
    addToBlacklist
};
