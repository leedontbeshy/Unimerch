const { Validator } = require('../utils/validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho cập nhật profile
 */
const validateUpdateProfile = async (req, res, next) => {
    const { fullName, studentId, phone, address } = req.body;
    const errors = [];
    
    // Validate fullName (required)
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        errors.push('Tên đầy đủ không được để trống');
    } else {
        errors.push(...Validator.validateFullName(fullName));
    }
    
    // Validate optional fields
    if (studentId !== undefined && studentId !== null) {
        errors.push(...Validator.validateStudentId(studentId));
    }
    
    if (phone !== undefined && phone !== null) {
        errors.push(...Validator.validatePhone(phone));
    }
    
    if (address !== undefined && address !== null) {
        errors.push(...Validator.validateAddress(address));
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho đổi mật khẩu
 */
const validateChangePassword = async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const errors = [];
    
    // Validate required fields
    if (!currentPassword || typeof currentPassword !== 'string') {
        errors.push('Mật khẩu hiện tại là bắt buộc');
    }
    
    if (!newPassword || typeof newPassword !== 'string') {
        errors.push('Mật khẩu mới là bắt buộc');
    }
    
    if (!confirmPassword || typeof confirmPassword !== 'string') {
        errors.push('Xác nhận mật khẩu là bắt buộc');
    }
    
    // Validate password confirmation
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors.push('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }
    
    // Validate new password strength
    if (newPassword) {
        errors.push(...Validator.validatePassword(newPassword));
    }
    
    // Check if new password is different from current
    if (currentPassword && newPassword && currentPassword === newPassword) {
        errors.push('Mật khẩu mới phải khác mật khẩu hiện tại');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho user ID trong params
 */
const validateUserId = async (req, res, next) => {
    const { id } = req.params;
    const errors = [];
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID người dùng không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho query parameters của users list
 */
const validateUsersQuery = async (req, res, next) => {
    const { page, limit, search, role, sortBy, sortOrder } = req.query;
    const errors = [];
    
    // Validate page
    if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
        errors.push('Trang phải là số nguyên dương');
    }
    
    // Validate limit
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push('Giới hạn phải là số từ 1 đến 100');
    }
    
    // Validate search
    if (search && typeof search !== 'string') {
        errors.push('Từ khóa tìm kiếm phải là chuỗi ký tự');
    } else if (search && search.length > 100) {
        errors.push('Từ khóa tìm kiếm không được vượt quá 100 ký tự');
    }
    
    // Validate role filter
    if (role && !['user', 'seller', 'admin'].includes(role)) {
        errors.push('Role filter không hợp lệ. Chỉ được phép: user, seller, admin');
    }
    
    // Validate sortBy
    if (sortBy && !['username', 'email', 'full_name', 'role', 'created_at'].includes(sortBy)) {
        errors.push('Trường sắp xếp không hợp lệ');
    }
    
    // Validate sortOrder
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        errors.push('Thứ tự sắp xếp phải là asc hoặc desc');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho cập nhật user bởi admin
 */
const validateUpdateUserByAdmin = async (req, res, next) => {
    const { id } = req.params;
    const { fullName, studentId, phone, address, role } = req.body;
    const errors = [];
    
    // Validate user ID
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID người dùng không hợp lệ');
    }
    
    // Validate fullName (required)
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        errors.push('Tên đầy đủ không được để trống');
    } else {
        errors.push(...Validator.validateFullName(fullName));
    }
    
    // Validate role
    if (role && !['user', 'seller', 'admin'].includes(role)) {
        errors.push('Role không hợp lệ. Chỉ được phép: user, seller, admin');
    }
    
    // Validate optional fields
    if (studentId !== undefined && studentId !== null) {
        errors.push(...Validator.validateStudentId(studentId));
    }
    
    if (phone !== undefined && phone !== null) {
        errors.push(...Validator.validatePhone(phone));
    }
    
    if (address !== undefined && address !== null) {
        errors.push(...Validator.validateAddress(address));
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho bulk operations
 */
const validateBulkUserIds = async (req, res, next) => {
    const { ids } = req.body;
    const errors = [];
    
    if (!ids || !Array.isArray(ids)) {
        errors.push('Danh sách ID phải là một mảng');
    } else {
        if (ids.length === 0) {
            errors.push('Danh sách ID không được để trống');
        } else if (ids.length > 50) {
            errors.push('Không thể xử lý quá 50 người dùng cùng lúc');
        }
        
        // Validate each ID
        ids.forEach((id, index) => {
            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                errors.push(`ID thứ ${index + 1} không hợp lệ`);
            }
        });
        
        // Check for duplicates
        const uniqueIds = [...new Set(ids)];
        if (ids.length !== uniqueIds.length) {
            errors.push('Danh sách ID không được có trùng lặp');
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho user permissions
 */
const validateUserPermissions = async (req, res, next) => {
    const { permissions } = req.body;
    const errors = [];
    
    if (!permissions || !Array.isArray(permissions)) {
        errors.push('Quyền hạn phải là một mảng');
    } else {
        const validPermissions = [
            'read_users', 'write_users', 'delete_users',
            'read_products', 'write_products', 'delete_products',
            'read_orders', 'write_orders', 'delete_orders',
            'read_categories', 'write_categories', 'delete_categories',
            'read_reviews', 'write_reviews', 'delete_reviews'
        ];
        
        permissions.forEach((permission, index) => {
            if (!validPermissions.includes(permission)) {
                errors.push(`Quyền hạn thứ ${index + 1} không hợp lệ: ${permission}`);
            }
        });
        
        // Check for duplicates
        const uniquePermissions = [...new Set(permissions)];
        if (permissions.length !== uniquePermissions.length) {
            errors.push('Danh sách quyền hạn không được có trùng lặp');
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho user avatar upload
 */
const validateAvatarUpload = async (req, res, next) => {
    const errors = [];
    
    // Check if file exists
    if (!req.file) {
        errors.push('Vui lòng chọn file ảnh để tải lên');
    } else {
        const file = req.file;
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            errors.push('Chỉ được phép tải lên file ảnh (JPEG, PNG, GIF)');
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            errors.push('Kích thước file không được vượt quá 5MB');
        }
        
        // Validate filename
        if (file.originalname && file.originalname.length > 255) {
            errors.push('Tên file không được vượt quá 255 ký tự');
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'File tải lên không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho user preferences
 */
const validateUserPreferences = async (req, res, next) => {
    const { preferences } = req.body;
    const errors = [];
    
    if (!preferences || typeof preferences !== 'object') {
        errors.push('Preferences phải là một object');
    } else {
        const validKeys = [
            'language', 'theme', 'notifications', 
            'privacy', 'marketing', 'newsletter'
        ];
        
        Object.keys(preferences).forEach(key => {
            if (!validKeys.includes(key)) {
                errors.push(`Preference key không hợp lệ: ${key}`);
            }
        });
        
        // Validate specific preference values
        if (preferences.language && !['vi', 'en'].includes(preferences.language)) {
            errors.push('Ngôn ngữ chỉ được phép: vi, en');
        }
        
        if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
            errors.push('Theme chỉ được phép: light, dark, auto');
        }
        
        if (preferences.notifications && typeof preferences.notifications !== 'boolean') {
            errors.push('Notifications phải là boolean');
        }
        
        if (preferences.privacy && !['public', 'friends', 'private'].includes(preferences.privacy)) {
            errors.push('Privacy chỉ được phép: public, friends, private');
        }
        
        if (preferences.marketing && typeof preferences.marketing !== 'boolean') {
            errors.push('Marketing phải là boolean');
        }
        
        if (preferences.newsletter && typeof preferences.newsletter !== 'boolean') {
            errors.push('Newsletter phải là boolean');
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Preferences không hợp lệ', 400, errors);
    }
    
    next();
};

module.exports = {
    validateUpdateProfile,
    validateChangePassword,
    validateUserId,
    validateUsersQuery,
    validateUpdateUserByAdmin,
    validateBulkUserIds,
    validateUserPermissions,
    validateAvatarUpload,
    validateUserPreferences
};
