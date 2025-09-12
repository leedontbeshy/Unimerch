const { errorResponse } = require('../utils/response');

// Middleware kiểm tra quyền admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return errorResponse(res, 'Không có thông tin người dùng', 401);
        }

        if (req.user.role !== 'admin') {
            return errorResponse(res, 'Không có quyền truy cập. Chỉ admin mới có thể thực hiện thao tác này', 403);
        }

        next();
    } catch (error) {
        console.error('Role middleware error:', error);
        return errorResponse(res, 'Lỗi phân quyền', 500);
    }
};

// Middleware kiểm tra quyền seller hoặc admin
const requireSellerOrAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return errorResponse(res, 'Không có thông tin người dùng', 401);
        }

        if (!['seller', 'admin'].includes(req.user.role)) {
            return errorResponse(res, 'Không có quyền truy cập. Chỉ seller hoặc admin mới có thể thực hiện thao tác này', 403);
        }

        next();
    } catch (error) {
        console.error('Role middleware error:', error);
        return errorResponse(res, 'Lỗi phân quyền', 500);
    }
};

module.exports = {
    requireAdmin,
    requireSellerOrAdmin
};