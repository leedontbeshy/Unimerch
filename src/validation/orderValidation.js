const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho tạo order
 */
const validateCreateOrder = async (req, res, next) => {
    const { items, shipping_address, payment_method, from_cart = true } = req.body;
    const errors = [];
    
    // Validate shipping address
    if (!shipping_address || typeof shipping_address !== 'string' || shipping_address.trim().length === 0) {
        errors.push('Địa chỉ giao hàng không được để trống');
    } else if (shipping_address.trim().length > 500) {
        errors.push('Địa chỉ giao hàng không được vượt quá 500 ký tự');
    }
    
    // Validate payment method
    if (!payment_method || typeof payment_method !== 'string' || payment_method.trim().length === 0) {
        errors.push('Phương thức thanh toán không được để trống');
    } else {
        const validPaymentMethods = ['COD', 'Banking', 'Credit Card', 'E-Wallet'];
        if (!validPaymentMethods.includes(payment_method.trim())) {
            errors.push(`Phương thức thanh toán phải là một trong: ${validPaymentMethods.join(', ')}`);
        }
    }
    
    // Validate items nếu không order từ cart
    if (!from_cart) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            errors.push('Danh sách sản phẩm không được để trống khi không order từ giỏ hàng');
        } else {
            // Validate từng item
            items.forEach((item, index) => {
                if (!item.product_id || !Number.isInteger(item.product_id) || item.product_id <= 0) {
                    errors.push(`Sản phẩm thứ ${index + 1}: ID sản phẩm không hợp lệ`);
                }
                
                if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                    errors.push(`Sản phẩm thứ ${index + 1}: Số lượng phải là số nguyên dương`);
                } else if (item.quantity > 100) {
                    errors.push(`Sản phẩm thứ ${index + 1}: Số lượng không được vượt quá 100`);
                }
            });
            
            // Kiểm tra duplicate products
            const productIds = items.map(item => item.product_id);
            const uniqueProductIds = [...new Set(productIds)];
            if (productIds.length !== uniqueProductIds.length) {
                errors.push('Không được có sản phẩm trùng lặp trong danh sách');
            }
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho cập nhật trạng thái order
 */
const validateUpdateOrderStatus = async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;
    const errors = [];
    
    // Validate order ID
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID đơn hàng không hợp lệ');
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
        errors.push(`Trạng thái đơn hàng phải là một trong: ${validStatuses.join(', ')}`);
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho order ID trong params
 */
const validateOrderId = async (req, res, next) => {
    const { id } = req.params;
    const errors = [];
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID đơn hàng không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho query parameters của orders list
 */
const validateOrdersQuery = async (req, res, next) => {
    const { page, limit, status, user_id } = req.query;
    const errors = [];
    
    // Validate page
    if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
        errors.push('Trang phải là số nguyên dương');
    }
    
    // Validate limit
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push('Giới hạn phải là số từ 1 đến 100');
    }
    
    // Validate status
    if (status) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            errors.push(`Trạng thái phải là một trong: ${validStatuses.join(', ')}`);
        }
    }
    
    // Validate user_id
    if (user_id && (isNaN(parseInt(user_id)) || parseInt(user_id) <= 0)) {
        errors.push('ID người dùng không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation cho cart operations
 */
const validateCartOperation = async (req, res, next) => {
    const { product_id, quantity } = req.body;
    const errors = [];
    
    // Validate product_id
    if (!product_id || !Number.isInteger(product_id) || product_id <= 0) {
        errors.push('ID sản phẩm không hợp lệ');
    }
    
    // Validate quantity
    if (quantity !== undefined) {
        if (!Number.isInteger(quantity) || quantity < 0) {
            errors.push('Số lượng phải là số nguyên không âm');
        } else if (quantity > 100) {
            errors.push('Số lượng không được vượt quá 100');
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation cho cart item ID
 */
const validateCartItemId = async (req, res, next) => {
    const { id } = req.params;
    const errors = [];
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID item giỏ hàng không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

module.exports = {
    validateCreateOrder,
    validateUpdateOrderStatus,
    validateOrderId,
    validateOrdersQuery,
    validateCartOperation,
    validateCartItemId
};
