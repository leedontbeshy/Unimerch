const { Validator } = require('../utils/validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho đăng ký
 */
const validateRegister = async (req, res, next) => {
    const { username, email, password, fullName, studentId, phone, address } = req.body;
    const errors = [];
    
    // Required fields
    if (!username) errors.push('Username là bắt buộc');
    if (!email) errors.push('Email là bắt buộc');
    if (!password) errors.push('Mật khẩu là bắt buộc');
    if (!fullName) errors.push('Họ tên là bắt buộc');
    
    // Email validation
    if (email && !Validator.validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }
    
    // Field validations
    errors.push(...Validator.validateUsername(username));
    errors.push(...Validator.validatePassword(password));
    errors.push(...Validator.validateFullName(fullName));
    errors.push(...Validator.validatePhone(phone));
    errors.push(...Validator.validateStudentId(studentId));
    errors.push(...Validator.validateAddress(address));
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho đăng nhập
 */
const validateLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    
    if (!email) errors.push('Email là bắt buộc');
    if (!password) errors.push('Mật khẩu là bắt buộc');
    
    if (email && !Validator.validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho quên mật khẩu
 */
const validateForgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const errors = [];
    
    if (!email) errors.push('Email là bắt buộc');
    if (email && !Validator.validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho reset mật khẩu
 */
const validateResetPassword = async (req, res, next) => {
    const { resetToken, newPassword } = req.body;
    const errors = [];
    
    if (!resetToken) errors.push('Reset token là bắt buộc');
    if (!newPassword) errors.push('Mật khẩu mới là bắt buộc');
    
    // Validate password strength
    errors.push(...Validator.validatePassword(newPassword));
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
};
