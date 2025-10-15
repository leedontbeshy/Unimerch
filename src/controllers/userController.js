const UserService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. GET /api/users/profile - Lấy thông tin profile người dùng hiện tại
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Controller chỉ gọi service
        const userProfile = await UserService.getUserProfile(userId);

        return successResponse(res, userProfile, 'Lấy thông tin profile thành công');
    } catch (error) {
        console.error('Get profile error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không tìm thấy thông tin người dùng') {
            return errorResponse(res, error.message, 404);
        }
        
        return errorResponse(res, 'Lỗi khi lấy thông tin profile', 500);
    }
};

// 2. PUT /api/users/profile - Cập nhật thông tin profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Controller chỉ gọi service
        const userProfile = await UserService.updateUserProfile(userId, req.body);

        return successResponse(res, userProfile, 'Cập nhật profile thành công');
    } catch (error) {
        console.error('Update profile error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không thể cập nhật thông tin người dùng') {
            return errorResponse(res, error.message, 404);
        }
        
        return errorResponse(res, 'Lỗi khi cập nhật profile', 500);
    }
};

// 3. PUT /api/users/change-password - Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Controller chỉ gọi service
        const result = await UserService.changePassword(userId, req.body);

        return successResponse(res, null, result.message);
    } catch (error) {
        console.error('Change password error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Mật khẩu mới và xác nhận mật khẩu không khớp' ||
            error.message === 'Mật khẩu hiện tại không đúng') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy người dùng') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message === 'Không thể cập nhật mật khẩu') {
            return errorResponse(res, error.message, 500);
        }
        
        return errorResponse(res, 'Lỗi khi đổi mật khẩu', 500);
    }
};

// 4. GET /api/users (Admin only) - Lấy danh sách tất cả users
const getAllUsers = async (req, res) => {
    try {
        // Controller chỉ gọi service
        const result = await UserService.getAllUsers(req.query);

        return successResponse(res, result, 'Lấy danh sách users thành công');
    } catch (error) {
        console.error('Get all users error:', error);
        
        // Xử lý lỗi từ service
        if (error.message.includes('Số trang') || error.message.includes('Giới hạn')) {
            return errorResponse(res, error.message, 400);
        }
        
        return errorResponse(res, 'Lỗi khi lấy danh sách users', 500);
    }
};

// 5. GET /api/users/:id (Admin only) - Lấy thông tin user theo ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller chỉ gọi service
        const userId = UserService.validateUserId(id);
        const userProfile = await UserService.getUserById(userId);

        return successResponse(res, userProfile, 'Lấy thông tin user thành công');
    } catch (error) {
        console.error('Get user by ID error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'ID người dùng không hợp lệ') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy người dùng') {
            return errorResponse(res, error.message, 404);
        }
        
        return errorResponse(res, 'Lỗi khi lấy thông tin user', 500);
    }
};

// 6. PUT /api/users/:id (Admin only) - Cập nhật thông tin user
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller chỉ gọi service
        const userId = UserService.validateUserId(id);
        const userProfile = await UserService.updateUserById(userId, req.body);

        return successResponse(res, userProfile, 'Cập nhật thông tin user thành công');
    } catch (error) {
        console.error('Update user by ID error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'ID người dùng không hợp lệ' ||
            error.message === 'Role không hợp lệ. Chỉ được phép: user, seller, admin') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy người dùng') {
            return errorResponse(res, error.message, 404);
        }
        
        return errorResponse(res, 'Lỗi khi cập nhật thông tin user', 500);
    }
};

// 7. DELETE /api/users/:id (Admin only) - Xóa user
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;
        
        // Controller chỉ gọi service
        const userId = UserService.validateUserId(id);
        const result = await UserService.deleteUser(userId, currentUserId);

        return successResponse(res, result, 'Xóa user thành công');
    } catch (error) {
        console.error('Delete user by ID error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'ID người dùng không hợp lệ' ||
            error.message === 'Không thể xóa chính tài khoản của bạn' ||
            error.message.includes('Không thể xóa')) {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy người dùng') {
            return errorResponse(res, error.message, 404);
        }
        
        return errorResponse(res, 'Lỗi khi xóa user', 500);
    }
};

// 8. GET /api/users/stats (Admin only) - Lấy thống kê users
const getUserStats = async (req, res) => {
    try {
        // Controller chỉ gọi service
        const stats = await UserService.getUserStats();

        return successResponse(res, stats, 'Lấy thống kê users thành công');
    } catch (error) {
        console.error('Get user stats error:', error);
        return errorResponse(res, 'Lỗi khi lấy thống kê users', 500);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserStats
};