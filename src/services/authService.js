const User = require('../models/User');
const ResetToken = require('../models/ResetToken');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { addToBlacklist } = require('../middleware/auth');
const { sendResetPasswordEmail } = require('../utils/email');
const crypto = require('crypto');

class AuthService {
    
    static async registerUser(userData) {
        const { username, email, password, fullName, studentId, phone, address } = userData;
        
        // 1. Kiểm tra email đã tồn tại
        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            throw new Error('Email đã được sử dụng');
        }

        // 2. Kiểm tra username đã tồn tại  
        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            throw new Error('Username đã được sử dụng');
        }

        // 3. Mã hóa mật khẩu
        const hashedPassword = await hashPassword(password);

        // 4. Tạo user mới
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            fullName,
            studentId,
            phone,
            address
        });

        // 5. Tạo JWT token
        const token = generateToken({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: 'user'
        });

        // 6. Trả về user data và token
        return {
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
        };
    }

    static async loginUser(email, password) {
        // 1. Tìm user theo email
        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        // 2. So sánh mật khẩu
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        // 3. Tạo JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        // 4. Trả về user data và token
        return {
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
        };
    }

    static async logoutUser(token) {
        // Thêm token vào blacklist database
        await addToBlacklist(token);
        return true;
    }

    static async forgotPassword(email) {
        // 1. Tìm user theo email
        const user = await User.findByEmail(email);
        if (!user) {
            // Không tiết lộ thông tin user có tồn tại hay không
            return { success: true, message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu' };
        }

        // 2. Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        // 3. Lưu reset token vào database
        await ResetToken.create(user.email, resetToken, expiresAt);

        // 4. Gửi email reset password
        try {
            await sendResetPasswordEmail(user.email, resetToken);
            console.log(`Reset password email sent to: ${user.email}`);
            
            return { 
                success: true, 
                message: 'Email hướng dẫn reset mật khẩu đã được gửi' 
            };
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // Xóa token nếu gửi email thất bại
            await ResetToken.deleteByToken(resetToken);
            throw new Error('Không thể gửi email reset password');
        }
    }

    static async resetPassword(resetToken, newPassword) {
        // 1. Kiểm tra reset token trong database
        const tokenData = await ResetToken.findByToken(resetToken);
        if (!tokenData) {
            throw new Error('Reset token không hợp lệ hoặc đã hết hạn');
        }

        // 2. Mã hóa mật khẩu mới
        const hashedPassword = await hashPassword(newPassword);

        // 3. Cập nhật mật khẩu
        const updated = await User.updatePassword(tokenData.email, hashedPassword);
        if (!updated) {
            throw new Error('Không thể cập nhật mật khẩu');
        }

        // 4. Xóa reset token
        await ResetToken.deleteByToken(resetToken);

        return { 
            success: true, 
            message: 'Mật khẩu đã được reset thành công. Bạn có thể đăng nhập với mật khẩu mới.' 
        };
    }
}

module.exports = AuthService;
