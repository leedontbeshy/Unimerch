const { Validator } = require('../utils/validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho việc tạo sản phẩm mới
 */
const validateCreateProduct = async (req, res, next) => {
    const {
        name,
        description,
        price,
        discount_price,
        quantity,
        image_url,
        category_id,
        color,
        size
    } = req.body;
    const errors = [];

    // Validate tên sản phẩm
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Tên sản phẩm là bắt buộc');
    } else if (name.trim().length < 2) {
        errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
    } else if (name.trim().length > 100) {
        errors.push('Tên sản phẩm không được vượt quá 100 ký tự');
    }

    // Validate mô tả sản phẩm
    if (description && (typeof description !== 'string' || description.trim().length > 1000)) {
        errors.push('Mô tả sản phẩm không được vượt quá 1000 ký tự');
    }

    // Validate giá sản phẩm
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        errors.push('Giá sản phẩm phải là số dương');
    } else if (parseFloat(price) > 999999999.99) {
        errors.push('Giá sản phẩm không được vượt quá 999,999,999.99');
    }

    // Validate giá khuyến mãi
    if (discount_price !== undefined && discount_price !== null && discount_price !== '') {
        if (isNaN(parseFloat(discount_price)) || parseFloat(discount_price) <= 0) {
            errors.push('Giá khuyến mãi phải là số dương');
        } else if (parseFloat(discount_price) >= parseFloat(price)) {
            errors.push('Giá khuyến mãi phải nhỏ hơn giá gốc');
        } else if (parseFloat(discount_price) > 999999999.99) {
            errors.push('Giá khuyến mãi không được vượt quá 999,999,999.99');
        }
    }

    // Validate số lượng
    if (quantity !== undefined && quantity !== null && quantity !== '') {
        if (isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
            errors.push('Số lượng phải là số không âm');
        } else if (parseInt(quantity) > 99999) {
            errors.push('Số lượng không được vượt quá 99,999');
        }
    }

    // Validate URL hình ảnh
    if (image_url && (typeof image_url !== 'string' || image_url.trim().length > 255)) {
        errors.push('URL hình ảnh không được vượt quá 255 ký tự');
    }

    // Validate danh mục
    if (!category_id || isNaN(parseInt(category_id)) || parseInt(category_id) <= 0) {
        errors.push('Danh mục sản phẩm là bắt buộc và phải hợp lệ');
    }

    // Validate màu sắc
    if (color && (typeof color !== 'string' || color.trim().length > 50)) {
        errors.push('Màu sắc không được vượt quá 50 ký tự');
    }

    // Validate kích thước
    if (size && (typeof size !== 'string' || size.trim().length > 20)) {
        errors.push('Kích thước không được vượt quá 20 ký tự');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.body.name = name.trim();
    req.body.description = description ? description.trim() : null;
    req.body.price = parseFloat(price);
    req.body.discount_price = discount_price ? parseFloat(discount_price) : null;
    req.body.quantity = quantity !== undefined ? parseInt(quantity) : 0;
    req.body.image_url = image_url ? image_url.trim() : null;
    req.body.category_id = parseInt(category_id);
    req.body.color = color ? color.trim() : null;
    req.body.size = size ? size.trim() : null;

    next();
};

/**
 * Validation middleware cho việc cập nhật sản phẩm
 */
const validateUpdateProduct = async (req, res, next) => {
    const {
        name,
        description,
        price,
        discount_price,
        quantity,
        image_url,
        category_id,
        status,
        color,
        size
    } = req.body;
    const errors = [];

    // Validate tên sản phẩm
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Tên sản phẩm là bắt buộc');
    } else if (name.trim().length < 2) {
        errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
    } else if (name.trim().length > 100) {
        errors.push('Tên sản phẩm không được vượt quá 100 ký tự');
    }

    // Validate mô tả sản phẩm
    if (description && (typeof description !== 'string' || description.trim().length > 1000)) {
        errors.push('Mô tả sản phẩm không được vượt quá 1000 ký tự');
    }

    // Validate giá sản phẩm
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        errors.push('Giá sản phẩm phải là số dương');
    } else if (parseFloat(price) > 999999999.99) {
        errors.push('Giá sản phẩm không được vượt quá 999,999,999.99');
    }

    // Validate giá khuyến mãi
    if (discount_price !== undefined && discount_price !== null && discount_price !== '') {
        if (isNaN(parseFloat(discount_price)) || parseFloat(discount_price) <= 0) {
            errors.push('Giá khuyến mãi phải là số dương');
        } else if (parseFloat(discount_price) >= parseFloat(price)) {
            errors.push('Giá khuyến mãi phải nhỏ hơn giá gốc');
        } else if (parseFloat(discount_price) > 999999999.99) {
            errors.push('Giá khuyến mãi không được vượt quá 999,999,999.99');
        }
    }

    // Validate số lượng
    if (quantity !== undefined && quantity !== null && quantity !== '') {
        if (isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
            errors.push('Số lượng phải là số không âm');
        } else if (parseInt(quantity) > 99999) {
            errors.push('Số lượng không được vượt quá 99,999');
        }
    }

    // Validate URL hình ảnh
    if (image_url && (typeof image_url !== 'string' || image_url.trim().length > 255)) {
        errors.push('URL hình ảnh không được vượt quá 255 ký tự');
    }

    // Validate danh mục
    if (!category_id || isNaN(parseInt(category_id)) || parseInt(category_id) <= 0) {
        errors.push('Danh mục sản phẩm là bắt buộc và phải hợp lệ');
    }

    // Validate trạng thái sản phẩm
    if (status && !['available', 'out_of_stock', 'discontinued'].includes(status)) {
        errors.push('Trạng thái sản phẩm không hợp lệ');
    }

    // Validate màu sắc
    if (color && (typeof color !== 'string' || color.trim().length > 50)) {
        errors.push('Màu sắc không được vượt quá 50 ký tự');
    }

    // Validate kích thước
    if (size && (typeof size !== 'string' || size.trim().length > 20)) {
        errors.push('Kích thước không được vượt quá 20 ký tự');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.body.name = name.trim();
    req.body.description = description ? description.trim() : null;
    req.body.price = parseFloat(price);
    req.body.discount_price = discount_price ? parseFloat(discount_price) : null;
    req.body.quantity = quantity !== undefined ? parseInt(quantity) : undefined;
    req.body.image_url = image_url ? image_url.trim() : null;
    req.body.category_id = parseInt(category_id);
    req.body.status = status ? status.trim() : undefined;
    req.body.color = color ? color.trim() : null;
    req.body.size = size ? size.trim() : null;

    next();
};

/**
 * Validation middleware cho việc lấy sản phẩm với query parameters
 */
const validateGetProducts = async (req, res, next) => {
    const {
        page,
        limit,
        category_id,
        status,
        search,
        min_price,
        max_price,
        seller_id,
        color,
        size
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

    // Validate category_id
    if (category_id && (isNaN(parseInt(category_id)) || parseInt(category_id) <= 0)) {
        errors.push('ID danh mục không hợp lệ');
    }

    // Validate status
    if (status && !['available', 'out_of_stock', 'discontinued'].includes(status)) {
        errors.push('Trạng thái sản phẩm không hợp lệ');
    }

    // Validate search
    if (search && (typeof search !== 'string' || search.trim().length > 100)) {
        errors.push('Từ khóa tìm kiếm không được vượt quá 100 ký tự');
    }

    // Validate price range
    if (min_price && (isNaN(parseFloat(min_price)) || parseFloat(min_price) < 0)) {
        errors.push('Giá tối thiểu phải là số không âm');
    }
    if (max_price && (isNaN(parseFloat(max_price)) || parseFloat(max_price) < 0)) {
        errors.push('Giá tối đa phải là số không âm');
    }
    if (min_price && max_price && parseFloat(min_price) > parseFloat(max_price)) {
        errors.push('Giá tối thiểu không được lớn hơn giá tối đa');
    }

    // Validate seller_id
    if (seller_id && (isNaN(parseInt(seller_id)) || parseInt(seller_id) <= 0)) {
        errors.push('ID người bán không hợp lệ');
    }

    // Validate color
    if (color && (typeof color !== 'string' || color.trim().length > 50)) {
        errors.push('Màu sắc không được vượt quá 50 ký tự');
    }

    // Validate size
    if (size && (typeof size !== 'string' || size.trim().length > 20)) {
        errors.push('Kích thước không được vượt quá 20 ký tự');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }

    // Chuẩn hóa dữ liệu
    req.query.page = page ? parseInt(page) : 1;
    req.query.limit = limit ? parseInt(limit) : 20;
    req.query.category_id = category_id ? parseInt(category_id) : null;
    req.query.min_price = min_price ? parseFloat(min_price) : null;
    req.query.max_price = max_price ? parseFloat(max_price) : null;
    req.query.seller_id = seller_id ? parseInt(seller_id) : null;
    req.query.search = search ? search.trim() : null;
    req.query.color = color ? color.trim() : null;
    req.query.size = size ? size.trim() : null;

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
 * Common validation rules cho product
 */
const ProductValidationRules = {
    // Kiểm tra giá có hợp lệ không
    isValidPrice: (price) => {
        return !isNaN(parseFloat(price)) && parseFloat(price) > 0 && parseFloat(price) <= 999999999.99;
    },

    // Kiểm tra số lượng có hợp lệ không
    isValidQuantity: (quantity) => {
        return !isNaN(parseInt(quantity)) && parseInt(quantity) >= 0 && parseInt(quantity) <= 99999;
    },

    // Kiểm tra ID có hợp lệ không
    isValidId: (id) => {
        return !isNaN(parseInt(id)) && parseInt(id) > 0;
    },

    // Kiểm tra trạng thái có hợp lệ không
    isValidStatus: (status) => {
        return ['available', 'out_of_stock', 'discontinued'].includes(status);
    },

    // Sanitize tên sản phẩm
    sanitizeName: (name) => {
        return name ? name.trim().substring(0, 100) : null;
    },

    // Sanitize mô tả
    sanitizeDescription: (description) => {
        return description ? description.trim().substring(0, 1000) : null;
    },

    // Sanitize URL
    sanitizeUrl: (url) => {
        return url ? url.trim().substring(0, 255) : null;
    },

    // Sanitize màu sắc
    sanitizeColor: (color) => {
        return color ? color.trim().substring(0, 50) : null;
    },

    // Sanitize kích thước
    sanitizeSize: (size) => {
        return size ? size.trim().substring(0, 20) : null;
    }
};

module.exports = {
    validateCreateProduct,
    validateUpdateProduct,
    validateGetProducts,
    validateIdParam,
    ProductValidationRules
};
