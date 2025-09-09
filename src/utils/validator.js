const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username phải có độ dài từ 3-50 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username chỉ được chứa chữ cái, số và dấu gạch dưới'),
    
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),
    
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Họ tên phải có độ dài từ 2-100 ký tự'),
    
    body('studentId')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Mã sinh viên không được vượt quá 20 ký tự'),
    
    body('phone')
        .optional()
        .isMobilePhone('vi-VN')
        .withMessage('Số điện thoại không hợp lệ'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Địa chỉ không được vượt quá 500 ký tự')
];

const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
];

const validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
];

const validateResetPassword = [
    body('resetToken')
        .notEmpty()
        .withMessage('Reset token không được để trống'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    handleValidationErrors
};
