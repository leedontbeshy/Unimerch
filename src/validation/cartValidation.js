const { Validator } = require('../utils/validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho việc thêm sản phẩm vào giỏ hàng
 */
const validateAddToCart = async (req, res, next) => {
    const { product_id, quantity = 1 } = req.body;
    const errors = [];

    // Validate product_id
    if (!product_id) {
        errors.push('ID sản phẩm là bắt buộc');
    } else if (isNaN(parseInt(product_id)) || parseInt(product_id) <= 0) {
        errors.push('ID sản phẩm không hợp lệ');
    }

    // Validate quantity
    if (!quantity) {
        errors.push('Số lượng là bắt buộc');
    } else if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
        errors.push('Số lượng phải là số dương');
    } else if (parseInt(quantity) > 999) {
        errors.push('Số lượng không được vượt quá 999');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.body.product_id = parseInt(product_id);
    req.body.quantity = parseInt(quantity);

    next();
};

/**
 * Validation middleware cho việc cập nhật số lượng trong giỏ hàng
 */
const validateUpdateCartItem = async (req, res, next) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const errors = [];

    // Validate cart item id
    if (!id) {
        errors.push('ID cart item là bắt buộc');
    } else if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID cart item không hợp lệ');
    }

    // Validate quantity
    if (!quantity) {
        errors.push('Số lượng là bắt buộc');
    } else if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
        errors.push('Số lượng phải là số dương');
    } else if (parseInt(quantity) > 999) {
        errors.push('Số lượng không được vượt quá 999');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.params.id = parseInt(id);
    req.body.quantity = parseInt(quantity);

    next();
};

/**
 * Validation middleware cho việc xóa sản phẩm khỏi giỏ hàng
 */
const validateRemoveFromCart = async (req, res, next) => {
    const { id } = req.params;
    const errors = [];

    // Validate cart item id
    if (!id) {
        errors.push('ID cart item là bắt buộc');
    } else if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID cart item không hợp lệ');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.params.id = parseInt(id);

    next();
};

/**
 * Validation middleware cho việc kiểm tra user ID từ token
 */
const validateUserAuth = async (req, res, next) => {
    const userId = req.user?.id;
    const errors = [];

    if (!userId) {
        errors.push('Thông tin user không hợp lệ');
    } else if (isNaN(parseInt(userId)) || parseInt(userId) <= 0) {
        errors.push('ID user không hợp lệ');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Xác thực không hợp lệ', 401, errors);
    }

    // Đảm bảo userId là integer
    req.user.id = parseInt(userId);

    next();
};

/**
 * Validation cho các trường hợp có parameter ID
 */
const validateIdParam = (paramName = 'id') => {
    return async (req, res, next) => {
        const id = req.params[paramName];
        const errors = [];

        if (!id) {
            errors.push(`${paramName} là bắt buộc`);
        } else if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
            errors.push(`${paramName} không hợp lệ`);
        }

        if (errors.length > 0) {
            return errorResponse(res, 'Tham số không hợp lệ', 400, errors);
        }

        // Chuẩn hóa dữ liệu
        req.params[paramName] = parseInt(id);

        next();
    };
};

/**
 * Common validation rules cho cart
 */
const CartValidationRules = {
    // Kiểm tra số lượng có hợp lệ không
    isValidQuantity: (quantity) => {
        return !isNaN(parseInt(quantity)) && parseInt(quantity) > 0 && parseInt(quantity) <= 999;
    },

    // Kiểm tra ID có hợp lệ không
    isValidId: (id) => {
        return !isNaN(parseInt(id)) && parseInt(id) > 0;
    },

    // Sanitize quantity
    sanitizeQuantity: (quantity) => {
        const parsedQuantity = parseInt(quantity);
        return isNaN(parsedQuantity) ? 0 : Math.max(1, Math.min(999, parsedQuantity));
    },

    // Sanitize ID
    sanitizeId: (id) => {
        const parsedId = parseInt(id);
        return isNaN(parsedId) ? 0 : Math.max(1, parsedId);
    }
};

module.exports = {
    validateAddToCart,
    validateUpdateCartItem,
    validateRemoveFromCart,
    validateUserAuth,
    validateIdParam,
    CartValidationRules
};
