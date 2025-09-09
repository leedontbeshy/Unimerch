const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { addToBlacklist } = require('../middleware/auth');

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

module.exports = {
    register,
    login,
    logout
};
