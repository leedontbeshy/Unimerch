const User = require('../models/User');
const { hashPassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

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
            email: newUser.email
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
                address: newUser.address
            },
            token
        }, 'Đăng ký thành công', 201);

    } catch (error) {
        console.error('Register error:', error);
        
        // Xử lý lỗi database
        if (error.code === 'ER_DUP_ENTRY') {
            return errorResponse(res, 'Email hoặc username đã tồn tại', 409);
        }
        
        return errorResponse(res, 'Lỗi server', 500);
    }
};

module.exports = {
    register
};
