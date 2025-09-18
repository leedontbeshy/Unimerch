const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');


const register = async (req, res) => {
    try {
        // Controller chỉ nhận request và gọi service
        const result = await AuthService.registerUser(req.body);
        
        return successResponse(res, result, 'Đăng ký thành công', 201);
        
    } catch (error) {
        console.error('Register error:', error);
        
        // Xử lý các lỗi business logic từ service
        if (error.message === 'Email đã được sử dụng' || error.message === 'Username đã được sử dụng') {
            return errorResponse(res, error.message, 409);
        }
        
        // PostgreSQL duplicate key error
        if (error.code === '23505') {
            return errorResponse(res, 'Email hoặc username đã tồn tại', 409);
        }
        
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Controller chỉ gọi service
        const result = await AuthService.loginUser(email, password);
        
        return successResponse(res, result, 'Đăng nhập thành công');
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Email hoặc mật khẩu không đúng') {
            return errorResponse(res, error.message, 401);
        }
        
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const logout = async (req, res) => {
    try {
        const token = req.token;
        
        // Controller chỉ gọi service
        await AuthService.logoutUser(token);
        
        return successResponse(res, null, 'Đăng xuất thành công');
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Controller chỉ gọi service
        const result = await AuthService.forgotPassword(email);
        
        return successResponse(res, null, result.message);
        
    } catch (error) {
        console.error('Forgot password error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không thể gửi email reset password') {
            return errorResponse(res, error.message, 500);
        }
        
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        // Controller chỉ gọi service
        const result = await AuthService.resetPassword(resetToken, newPassword);
        
        return successResponse(res, null, result.message);
        
    } catch (error) {
        console.error('Reset password error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Reset token không hợp lệ hoặc đã hết hạn') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không thể cập nhật mật khẩu') {
            return errorResponse(res, error.message, 500);
        }
        
        return errorResponse(res, 'Lỗi server', 500);
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
};
