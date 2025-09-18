const ResponseHelper = require('../core/response');

// Utility validation functions
const isValidInteger = (value, min = null, max = null) => {
    const num = parseInt(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
};

const isValidNumber = (value, min = null, max = null) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
};

const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

/**
 * Validation cho tìm kiếm sản phẩm
 */
const validateProductSearch = (req, res, next) => {
    const errors = [];
    const { query } = req;

    // Validate search query (optional)
    if (query.q && typeof query.q !== 'string') {
        errors.push('Từ khóa tìm kiếm phải là chuỗi');
    }

    // Validate page
    if (query.page && !isValidInteger(query.page, 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (query.limit && !isValidInteger(query.limit, 1, 100)) {
        errors.push('Số lượng mỗi trang phải từ 1-100');
    }

    // Validate category_id
    if (query.category_id && !isValidInteger(query.category_id, 1)) {
        errors.push('ID danh mục phải là số nguyên dương');
    }

    // Validate price range
    if (query.min_price && !isValidNumber(query.min_price, 0)) {
        errors.push('Giá tối thiểu phải >= 0');
    }
    if (query.max_price && !isValidNumber(query.max_price, 0)) {
        errors.push('Giá tối đa phải >= 0');
    }
    if (query.min_price && query.max_price && 
        parseFloat(query.min_price) > parseFloat(query.max_price)) {
        errors.push('Giá tối thiểu không được lớn hơn giá tối đa');
    }

    // Validate sort
    const validSortFields = ['created_at', 'price', 'name', 'rating'];
    const validSortOrder = ['asc', 'desc'];
    
    if (query.sort_by && !validSortFields.includes(query.sort_by)) {
        errors.push(`Trường sắp xếp phải là một trong: ${validSortFields.join(', ')}`);
    }
    if (query.sort_order && !validSortOrder.includes(query.sort_order)) {
        errors.push('Thứ tự sắp xếp phải là: asc hoặc desc');
    }

    // Validate color
    if (query.color && typeof query.color !== 'string') {
        errors.push('Màu sắc phải là chuỗi');
    }

    // Validate size
    if (query.size && typeof query.size !== 'string') {
        errors.push('Kích thước phải là chuỗi');
    }

    // Validate seller_id
    if (query.seller_id && !isValidInteger(query.seller_id, 1)) {
        errors.push('ID người bán phải là số nguyên dương');
    }

    // Validate status
    const validStatuses = ['available', 'out_of_stock', 'discontinued'];
    if (query.status && !validStatuses.includes(query.status)) {
        errors.push(`Trạng thái phải là một trong: ${validStatuses.join(', ')}`);
    }

    if (errors.length > 0) {
        return ResponseHelper.error(res, errors, 400);
    }

    next();
};

/**
 * Validation cho tìm kiếm danh mục
 */
const validateCategorySearch = (req, res, next) => {
    const errors = [];
    const { query } = req;

    // Validate search query (optional)
    if (query.q && typeof query.q !== 'string') {
        errors.push('Từ khóa tìm kiếm phải là chuỗi');
    }

    // Validate page
    if (query.page && !isValidInteger(query.page, 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (query.limit && !isValidInteger(query.limit, 1, 50)) {
        errors.push('Số lượng mỗi trang phải từ 1-50');
    }

    if (errors.length > 0) {
        return ResponseHelper.error(res, errors, 400);
    }

    next();
};

/**
 * Validation cho tìm kiếm người dùng (Admin only)
 */
const validateUserSearch = (req, res, next) => {
    const errors = [];
    const { query } = req;

    // Validate search query (optional)
    if (query.q && typeof query.q !== 'string') {
        errors.push('Từ khóa tìm kiếm phải là chuỗi');
    }

    // Validate page
    if (query.page && !isValidInteger(query.page, 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (query.limit && !isValidInteger(query.limit, 1, 50)) {
        errors.push('Số lượng mỗi trang phải từ 1-50');
    }

    // Validate role
    const validRoles = ['user', 'seller', 'admin'];
    if (query.role && !validRoles.includes(query.role)) {
        errors.push(`Vai trò phải là một trong: ${validRoles.join(', ')}`);
    }

    if (errors.length > 0) {
        return ResponseHelper.error(res, errors, 400);
    }

    next();
};

/**
 * Validation cho tìm kiếm đơn hàng
 */
const validateOrderSearch = (req, res, next) => {
    const errors = [];
    const { query } = req;

    // Validate page
    if (query.page && !isValidInteger(query.page, 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (query.limit && !isValidInteger(query.limit, 1, 50)) {
        errors.push('Số lượng mỗi trang phải từ 1-50');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (query.status && !validStatuses.includes(query.status)) {
        errors.push(`Trạng thái phải là một trong: ${validStatuses.join(', ')}`);
    }

    // Validate date range
    if (query.from_date && !isValidDate(query.from_date)) {
        errors.push('Ngày bắt đầu không hợp lệ (YYYY-MM-DD)');
    }
    if (query.to_date && !isValidDate(query.to_date)) {
        errors.push('Ngày kết thúc không hợp lệ (YYYY-MM-DD)');
    }
    if (query.from_date && query.to_date && 
        new Date(query.from_date) > new Date(query.to_date)) {
        errors.push('Ngày bắt đầu không được sau ngày kết thúc');
    }

    // Validate user_id (for admin search)
    if (query.user_id && !isValidInteger(query.user_id, 1)) {
        errors.push('ID người dùng phải là số nguyên dương');
    }

    // Validate amount range
    if (query.min_amount && !isValidNumber(query.min_amount, 0)) {
        errors.push('Số tiền tối thiểu phải >= 0');
    }
    if (query.max_amount && !isValidNumber(query.max_amount, 0)) {
        errors.push('Số tiền tối đa phải >= 0');
    }
    if (query.min_amount && query.max_amount && 
        parseFloat(query.min_amount) > parseFloat(query.max_amount)) {
        errors.push('Số tiền tối thiểu không được lớn hơn số tiền tối đa');
    }

    if (errors.length > 0) {
        return ResponseHelper.error(res, errors, 400);
    }

    next();
};

/**
 * Validation cho tìm kiếm đánh giá
 */
const validateReviewSearch = (req, res, next) => {
    const errors = [];
    const { query } = req;

    // Validate search query (optional)
    if (query.q && typeof query.q !== 'string') {
        errors.push('Từ khóa tìm kiếm phải là chuỗi');
    }

    // Validate page
    if (query.page && !isValidInteger(query.page, 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (query.limit && !isValidInteger(query.limit, 1, 50)) {
        errors.push('Số lượng mỗi trang phải từ 1-50');
    }

    // Validate rating
    if (query.rating && !isValidInteger(query.rating, 1, 5)) {
        errors.push('Đánh giá phải từ 1-5 sao');
    }

    // Validate product_id
    if (query.product_id && !isValidInteger(query.product_id, 1)) {
        errors.push('ID sản phẩm phải là số nguyên dương');
    }

    // Validate user_id
    if (query.user_id && !isValidInteger(query.user_id, 1)) {
        errors.push('ID người dùng phải là số nguyên dương');
    }

    // Validate date range
    if (query.from_date && !isValidDate(query.from_date)) {
        errors.push('Ngày bắt đầu không hợp lệ (YYYY-MM-DD)');
    }
    if (query.to_date && !isValidDate(query.to_date)) {
        errors.push('Ngày kết thúc không hợp lệ (YYYY-MM-DD)');
    }

    if (errors.length > 0) {
        return ResponseHelper.error(res, errors, 400);
    }

    next();
};

/**
 * Validation cho tìm kiếm toàn cục
 */
const validateGlobalSearch = (req, res, next) => {
    const errors = [];
    const { query } = req;

    // Validate search query (required)
    if (!query.q || typeof query.q !== 'string' || query.q.trim().length === 0) {
        errors.push('Từ khóa tìm kiếm là bắt buộc');
    }

    // Validate search types
    const validTypes = ['products', 'categories', 'users', 'orders', 'reviews'];
    if (query.types) {
        const types = Array.isArray(query.types) ? query.types : query.types.split(',');
        const invalidTypes = types.filter(type => !validTypes.includes(type.trim()));
        if (invalidTypes.length > 0) {
            errors.push(`Loại tìm kiếm không hợp lệ: ${invalidTypes.join(', ')}`);
        }
    }

    // Validate limit per type
    if (query.limit && !isValidInteger(query.limit, 1, 20)) {
        errors.push('Số lượng kết quả mỗi loại phải từ 1-20');
    }

    if (errors.length > 0) {
        return ResponseHelper.error(res, errors, 400);
    }

    next();
};

module.exports = {
    validateProductSearch,
    validateCategorySearch,
    validateUserSearch,
    validateOrderSearch,
    validateReviewSearch,
    validateGlobalSearch
};
