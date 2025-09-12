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



module.exports = {
    getProfile,
    updateProfile
};