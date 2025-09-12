const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { hashPassword, comparePassword } = require('../utils/bcrypt');

// 1. GET /api/users/profile - Lấy thông tin profile người dùng hiện tại
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return errorResponse(res, 'Không tìm thấy thông tin người dùng', 404);
        }

        // Trả về thông tin user (không bao gồm password)
        const userProfile = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            studentId: user.student_id,
            phone: user.phone,
            address: user.address,
            role: user.role,
            createdAt: user.created_at
        };

        return successResponse(res, userProfile, 'Lấy thông tin profile thành công');
    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin profile', 500);
    }
};

// 2. PUT /api/users/profile - Cập nhật thông tin profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, studentId, phone, address } = req.body;

        const { Validator } = require('../utils/validator');
        const errors = [];

        // Validation cơ bản
        if (!fullName || fullName.trim().length === 0) {
            return errorResponse(res, 'Tên đầy đủ không được để trống', 400);
        }

        errors.push(...Validator.validateFullName(fullName));
        errors.push(...Validator.validateStudentId(studentId));
        errors.push(...Validator.validatePhone(phone));
        errors.push(...Validator.validateAddress(address));
        
        if (errors.length > 0) {
            return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
        }

        const updateData = {
            fullName: fullName.trim(),
            studentId: studentId ? studentId.trim() : null,
            phone: phone ? phone.trim() : null,
            address: address ? address.trim() : null
        };

        const updatedUser = await User.update(userId, updateData);

        if (!updatedUser) {
            return errorResponse(res, 'Không thể cập nhật thông tin người dùng', 404);
        }

        // Trả về thông tin user đã cập nhật
        const userProfile = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            fullName: updatedUser.full_name,
            studentId: updatedUser.student_id,
            phone: updatedUser.phone,
            address: updatedUser.address,
            role: updatedUser.role,
            updatedAt: updatedUser.updated_at
        };

        return successResponse(res, userProfile, 'Cập nhật profile thành công');
    } catch (error) {
        console.error('Update profile error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật profile', 500);
    }
};

// 3. PUT /api/users/change-password - Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation cơ bản
        if (!currentPassword || !newPassword || !confirmPassword) {
            return errorResponse(res, 'Vui lòng cung cấp đầy đủ thông tin', 400);
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (newPassword !== confirmPassword) {
            return errorResponse(res, 'Mật khẩu mới và xác nhận mật khẩu không khớp', 400);
        }

        // Validation mật khẩu mới
        const { Validator } = require('../utils/validator');
        const passwordErrors = Validator.validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            return errorResponse(res, 'Mật khẩu mới không hợp lệ', 400, passwordErrors);
        }

        // Lấy thông tin user hiện tại (bao gồm password để verify)
        const { pool } = require('../../config/database');
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (!userResult.rows[0]) {
            return errorResponse(res, 'Không tìm thấy người dùng', 404);
        }

        const user = userResult.rows[0];

        // Verify mật khẩu hiện tại
        const { comparePassword, hashPassword } = require('../utils/bcrypt');
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
            return errorResponse(res, 'Mật khẩu hiện tại không đúng', 400);
        }

        // Hash mật khẩu mới
        const hashedNewPassword = await hashPassword(newPassword);

        // Cập nhật mật khẩu
        const success = await User.updatePassword(user.email, hashedNewPassword);
        
        if (!success) {
            return errorResponse(res, 'Không thể cập nhật mật khẩu', 500);
        }

        return successResponse(res, null, 'Đổi mật khẩu thành công');
    } catch (error) {
        console.error('Change password error:', error);
        return errorResponse(res, 'Lỗi khi đổi mật khẩu', 500);
    }
};

// 4. GET /api/users (Admin only) - Lấy danh sách tất cả users
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;

        let users;
        let totalUsers;

        if (search) {
            // Tìm kiếm user theo username, email, hoặc fullName
            const { pool } = require('../../config/database');
            const searchPattern = `%${search}%`;
            
            const usersResult = await pool.query(
                `SELECT id, username, email, full_name, student_id, phone, address, role, created_at 
                 FROM users 
                 WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1
                 ORDER BY created_at DESC 
                 LIMIT $2 OFFSET $3`,
                [searchPattern, parseInt(limit), parseInt(offset)]
            );
            
            const countResult = await pool.query(
                `SELECT COUNT(*) as total 
                 FROM users 
                 WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1`,
                [searchPattern]
            );
            
            users = usersResult.rows;
            totalUsers = parseInt(countResult.rows[0].total);
        } else {
            // Lấy tất cả users
            users = await User.getAll(parseInt(limit), parseInt(offset));
            
            const { pool } = require('../../config/database');
            const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
            totalUsers = parseInt(countResult.rows[0].total);
        }

        // Format response data
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            studentId: user.student_id,
            phone: user.phone,
            address: user.address,
            role: user.role,
            createdAt: user.created_at
        }));

        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            usersPerPage: parseInt(limit)
        };

        return successResponse(res, {
            users: formattedUsers,
            pagination
        }, 'Lấy danh sách users thành công');

    } catch (error) {
        console.error('Get all users error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách users', 500);
    }
};

// ... existing code ...

// 5. GET /api/users/:id (Admin only) - Lấy thông tin user theo ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID người dùng không hợp lệ', 400);
        }

        const user = await User.findById(parseInt(id));

        if (!user) {
            return errorResponse(res, 'Không tìm thấy người dùng', 404);
        }

        // Format response data (không bao gồm password)
        const userProfile = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            studentId: user.student_id,
            phone: user.phone,
            address: user.address,
            role: user.role,
            createdAt: user.created_at
        };

        return successResponse(res, userProfile, 'Lấy thông tin user thành công');
    } catch (error) {
        console.error('Get user by ID error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin user', 500);
    }
};

// ... existing code ...

// 6. PUT /api/users/:id (Admin only) - Cập nhật thông tin user
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, studentId, phone, address, role } = req.body;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID người dùng không hợp lệ', 400);
        }

        // Kiểm tra user có tồn tại không
        const existingUser = await User.findById(parseInt(id));
        if (!existingUser) {
            return errorResponse(res, 'Không tìm thấy người dùng', 404);
        }

        // Validation dữ liệu
        const { Validator } = require('../utils/validator');
        const errors = [];

        if (!fullName || fullName.trim().length === 0) {
            errors.push('Tên đầy đủ không được để trống');
        }

        // Validate role nếu có
        if (role && !['user', 'seller', 'admin'].includes(role)) {
            errors.push('Role không hợp lệ. Chỉ được phép: user, seller, admin');
        }

        // Validate từng field
        errors.push(...Validator.validateFullName(fullName));
        errors.push(...Validator.validatePhone(phone));
        errors.push(...Validator.validateStudentId(studentId));
        errors.push(...Validator.validateAddress(address));

        if (errors.length > 0) {
            return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
        }

        // Cập nhật user (bao gồm role nếu có)
        const { pool } = require('../../config/database');
        const updateResult = await pool.query(
            `UPDATE users 
             SET full_name = $1, student_id = $2, phone = $3, address = $4, role = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 
             RETURNING id, username, email, full_name, student_id, phone, address, role, updated_at`,
            [
                fullName.trim(),
                studentId ? studentId.trim() : null,
                phone ? phone.trim() : null,
                address ? address.trim() : null,
                role || existingUser.role, // Giữ role cũ nếu không cung cấp
                parseInt(id)
            ]
        );

        const updatedUser = updateResult.rows[0];
        
        // Format response
        const userProfile = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            fullName: updatedUser.full_name,
            studentId: updatedUser.student_id,
            phone: updatedUser.phone,
            address: updatedUser.address,
            role: updatedUser.role,
            updatedAt: updatedUser.updated_at
        };

        return successResponse(res, userProfile, 'Cập nhật thông tin user thành công');
    } catch (error) {
        console.error('Update user by ID error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật thông tin user', 500);
    }
};

// ... existing code ...

// 7. DELETE /api/users/:id (Admin only) - Xóa user
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID người dùng không hợp lệ', 400);
        }

        // Không cho phép admin tự xóa chính mình
        if (parseInt(id) === currentUserId) {
            return errorResponse(res, 'Không thể xóa chính tài khoản của bạn', 400);
        }

        // Kiểm tra user có tồn tại không
        const existingUser = await User.findById(parseInt(id));
        if (!existingUser) {
            return errorResponse(res, 'Không tìm thấy người dùng', 404);
        }

        // Xóa user
        const success = await User.delete(parseInt(id));
        
        if (!success) {
            return errorResponse(res, 'Không thể xóa người dùng', 500);
        }

        return successResponse(res, {
            deletedUserId: parseInt(id),
            deletedUserInfo: {
                username: existingUser.username,
                email: existingUser.email,
                fullName: existingUser.full_name
            }
        }, 'Xóa user thành công');
    } catch (error) {
        console.error('Delete user by ID error:', error);
        return errorResponse(res, 'Lỗi khi xóa user', 500);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
};