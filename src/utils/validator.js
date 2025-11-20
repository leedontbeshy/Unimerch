const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmail = (value = '') => emailRegex.test(String(value).trim());

const isEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

const isLength = (value = '', options = {}) => {
    const str = String(value);
    const min = options.min ?? 0;
    const max = options.max ?? Infinity;
    return str.length >= min && str.length <= max;
};

class Validator {
    static validateEmail(email) {
        return isEmail(email);
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

module.exports = {
    Validator,
    isEmail,
    isEmpty,
    isLength
};