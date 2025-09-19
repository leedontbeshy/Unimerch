const { Validator } = require('../utils/validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho việc tạo review mới
 */
const validateCreateReview = async (req, res, next) => {
    const {
        product_id,
        rating,
        comment
    } = req.body;
    const errors = [];

    // Validate product_id
    if (!product_id || isNaN(parseInt(product_id)) || parseInt(product_id) <= 0) {
        errors.push('ID sản phẩm là bắt buộc và phải hợp lệ');
    }

    // Validate rating
    if (!rating) {
        errors.push('Rating là bắt buộc');
    } else if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.push('Rating phải là số nguyên từ 1 đến 5');
    }

    // Validate comment (optional)
    if (comment && (typeof comment !== 'string' || comment.trim().length > 500)) {
        errors.push('Comment không được vượt quá 500 ký tự');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.body.product_id = parseInt(product_id);
    req.body.rating = parseInt(rating);
    req.body.comment = comment ? comment.trim() : null;

    next();
};

/**
 * Validation middleware cho việc cập nhật review
 */
const validateUpdateReview = async (req, res, next) => {
    const {
        rating,
        comment
    } = req.body;
    const errors = [];

    // Validate rating
    if (!rating) {
        errors.push('Rating là bắt buộc');
    } else if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.push('Rating phải là số nguyên từ 1 đến 5');
    }

    // Validate comment (optional)
    if (comment && (typeof comment !== 'string' || comment.trim().length > 500)) {
        errors.push('Comment không được vượt quá 500 ký tự');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.body.rating = parseInt(rating);
    req.body.comment = comment ? comment.trim() : null;

    next();
};

/**
 * Validation middleware cho query parameters khi lấy danh sách reviews
 */
const validateGetReviews = async (req, res, next) => {
    const {
        page,
        limit,
        product_id,
        user_id,
        rating
    } = req.query;
    const errors = [];

    // Validate page
    if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push('Giới hạn phải là số nguyên từ 1 đến 100');
    }

    // Validate product_id
    if (product_id && (isNaN(parseInt(product_id)) || parseInt(product_id) <= 0)) {
        errors.push('ID sản phẩm không hợp lệ');
    }

    // Validate user_id
    if (user_id && (isNaN(parseInt(user_id)) || parseInt(user_id) <= 0)) {
        errors.push('ID người dùng không hợp lệ');
    }

    // Validate rating
    if (rating && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
        errors.push('Rating phải là số nguyên từ 1 đến 5');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.query.page = page ? parseInt(page) : 1;
    req.query.limit = limit ? parseInt(limit) : 20;
    req.query.product_id = product_id ? parseInt(product_id) : null;
    req.query.user_id = user_id ? parseInt(user_id) : null;
    req.query.rating = rating ? parseInt(rating) : null;

    next();
};

/**
 * Validation middleware cho query parameters khi lấy reviews theo product
 */
const validateGetReviewsByProduct = async (req, res, next) => {
    const {
        page,
        limit,
        rating
    } = req.query;
    const errors = [];

    // Validate page
    if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push('Giới hạn phải là số nguyên từ 1 đến 100');
    }

    // Validate rating
    if (rating && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
        errors.push('Rating phải là số nguyên từ 1 đến 5');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.query.page = page ? parseInt(page) : 1;
    req.query.limit = limit ? parseInt(limit) : 20;
    req.query.rating = rating ? parseInt(rating) : null;

    next();
};

/**
 * Validation middleware cho query parameters khi lấy reviews theo user
 */
const validateGetReviewsByUser = async (req, res, next) => {
    const {
        page,
        limit
    } = req.query;
    const errors = [];

    // Validate page
    if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
        errors.push('Trang phải là số nguyên dương');
    }

    // Validate limit
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push('Giới hạn phải là số nguyên từ 1 đến 100');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.query.page = page ? parseInt(page) : 1;
    req.query.limit = limit ? parseInt(limit) : 20;

    next();
};

/**
 * Validation middleware cho limit khi lấy top rated products
 */
const validateGetTopRatedProducts = async (req, res, next) => {
    const { limit } = req.query;
    const errors = [];

    // Validate limit
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 50)) {
        errors.push('Giới hạn phải là số nguyên từ 1 đến 50');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.query.limit = limit ? parseInt(limit) : 10;

    next();
};

/**
 * Validation middleware cho ID params
 */
const validateIdParam = (paramName = 'id') => {
    return async (req, res, next) => {
        const id = req.params[paramName];
        
        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            return errorResponse(res, `${paramName} không hợp lệ`, 400);
        }
        
        // Chuẩn hóa
        req.params[paramName] = parseInt(id);
        next();
    };
};

/**
 * Common validation rules cho review
 */
const ReviewValidationRules = {
    // Kiểm tra rating có hợp lệ không
    isValidRating: (rating) => {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    },

    // Kiểm tra ID có hợp lệ không
    isValidId: (id) => {
        return !isNaN(parseInt(id)) && parseInt(id) > 0;
    },

    // Sanitize comment
    sanitizeComment: (comment) => {
        return comment ? comment.trim().substring(0, 500) : null;
    },

    // Validate comment length
    isValidComment: (comment) => {
        return !comment || (typeof comment === 'string' && comment.trim().length <= 500);
    },

    // Validate page number
    isValidPage: (page) => {
        return !isNaN(parseInt(page)) && parseInt(page) >= 1;
    },

    // Validate limit
    isValidLimit: (limit, maxLimit = 100) => {
        return !isNaN(parseInt(limit)) && parseInt(limit) >= 1 && parseInt(limit) <= maxLimit;
    }
};

module.exports = {
    validateCreateReview,
    validateUpdateReview,
    validateGetReviews,
    validateGetReviewsByProduct,
    validateGetReviewsByUser,
    validateGetTopRatedProducts,
    validateIdParam,
    ReviewValidationRules
};
