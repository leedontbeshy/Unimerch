class Validator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static validatePassword(password) {
        const errors = [];
        
        if (!password || password.length < 6) {
            errors.push('Mật khẩu phải có ít nhất 6 ký tự');
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
        }
        
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất 1 số');
        }
        
        return errors;
    }
    
    static validateUsername(username) {
        const errors = [];
        
        if (!username || username.length < 3 || username.length > 50) {
            errors.push('Username phải có độ dài từ 3-50 ký tự');
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
        }
        
        return errors;
    }
    
    static validateFullName(fullName) {
        const errors = [];
        
        if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 100) {
            errors.push('Họ tên phải có độ dài từ 2-100 ký tự');
        }
        
        return errors;
    }
    
    static validatePhone(phone) {
        const errors = [];
        
        if (phone && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone)) {
            errors.push('Số điện thoại không hợp lệ');
        }
        
        return errors;
    }
    
    static validateStudentId(studentId) {
        const errors = [];
        
        if (studentId && studentId.length > 20) {
            errors.push('Mã sinh viên không được vượt quá 20 ký tự');
        }
        
        return errors;
    }
    
    static validateAddress(address) {
        const errors = [];
        
        if (address && address.length > 500) {
            errors.push('Địa chỉ không được vượt quá 500 ký tự');
        }
        
        return errors;
    }
}

// Validation middlewares
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
        const { errorResponse } = require('./response');
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

const validateLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    
    if (!email) errors.push('Email là bắt buộc');
    if (!password) errors.push('Mật khẩu là bắt buộc');
    
    if (email && !Validator.validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }
    
    if (errors.length > 0) {
        const { errorResponse } = require('./response');
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

const validateForgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const errors = [];
    
    if (!email) errors.push('Email là bắt buộc');
    if (email && !Validator.validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }
    
    if (errors.length > 0) {
        const { errorResponse } = require('./response');
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

const validateResetPassword = async (req, res, next) => {
    const { resetToken, newPassword } = req.body;
    const errors = [];
    
    if (!resetToken) errors.push('Reset token là bắt buộc');
    if (!newPassword) errors.push('Mật khẩu mới là bắt buộc');
    
    errors.push(...Validator.validatePassword(newPassword));
    
    if (errors.length > 0) {
        const { errorResponse } = require('./response');
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

module.exports = {
    Validator,
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
};