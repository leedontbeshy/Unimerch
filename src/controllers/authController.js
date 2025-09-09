const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { addToBlacklist } = require('../middleware/auth');
const { sendResetPasswordEmail } = require('../utils/email');
const crypto = require('crypto');

// Lưu reset tokens tạm thời (trong thực tế nên lưu vào database)
const resetTokens = new Map();

const register = async (req, res) => {
    try {
        const { username, email, password, fullName, studentId, phone, address } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            return errorResponse(res, 'Email đã được sử dụng', 409);
        }

        // Kiểm tra username đã tồn tại
        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            return errorResponse(res, 'Username đã được sử dụng', 409);
        }

        // Mã hóa mật khẩu
        const hashedPassword = await hashPassword(password);

        // Tạo user mới
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            fullName,
            studentId,
            phone,
            address
        });

        // Tạo JWT token
        const token = generateToken({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: 'user'
        });

        // Trả về response thành công
        return successResponse(res, {
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                studentId: newUser.studentId,
                phone: newUser.phone,
                address: newUser.address,
                role: 'user'
            },
            token
        }, 'Đăng ký thành công', 201);

    } catch (error) {
        console.error('Register error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return errorResponse(res, 'Email hoặc username đã tồn tại', 409);
        }
        
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.findByEmail(email);
        if (!user) {
            return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
        }

        // So sánh mật khẩu
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
        }

        // Tạo JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        // Trả về response thành công
        return successResponse(res, {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                studentId: user.student_id,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        }, 'Đăng nhập thành công');

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const logout = async (req, res) => {
    try {
        const token = req.token;
        
        // Thêm token vào blacklist
        addToBlacklist(token);
        
        return successResponse(res, null, 'Đăng xuất thành công');
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra user có tồn tại không
        const user = await User.findByEmail(email);
        if (!user) {
            // Vẫn trả về success để không tiết lộ email có tồn tại hay không
            return successResponse(res, null, 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu');
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 phút

        // Lưu reset token
        resetTokens.set(resetToken, {
            email: user.email,
            expiry: resetTokenExpiry
        });

        // Gửi email reset password
        try {
            await sendResetPasswordEmail(user.email, resetToken);
            console.log(`Reset password email sent to: ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // Xóa token nếu gửi email thất bại
            resetTokens.delete(resetToken);
            return errorResponse(res, 'Không thể gửi email reset password', 500);
        }

        return successResponse(res, null, 'Email hướng dẫn reset mật khẩu đã được gửi');

    } catch (error) {
        console.error('Forgot password error:', error);
        return errorResponse(res, 'Lỗi server', 500);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Kiểm tra reset token
        const tokenData = resetTokens.get(resetToken);
        if (!tokenData) {
            return errorResponse(res, 'Reset token không hợp lệ hoặc đã hết hạn', 400);
        }

        // Kiểm tra token có hết hạn không
        if (Date.now() > tokenData.expiry) {
            resetTokens.delete(resetToken);
            return errorResponse(res, 'Reset token đã hết hạn', 400);
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await hashPassword(newPassword);

        // Cập nhật mật khẩu
        const updated = await User.updatePassword(tokenData.email, hashedPassword);
        if (!updated) {
            return errorResponse(res, 'Không thể cập nhật mật khẩu', 500);
        }

        // Xóa reset token
        resetTokens.delete(resetToken);

        return successResponse(res, null, 'Mật khẩu đã được reset thành công. Bạn có thể đăng nhập với mật khẩu mới.');

    } catch (error) {
        console.error('Reset password error:', error);
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
