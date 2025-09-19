const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho tạo danh mục
 */
const validateCreateCategory = async (req, res, next) => {
    const { name, description, imageUrl } = req.body;
    const errors = [];
    
    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Tên danh mục không được để trống');
    } else if (name.trim().length > 100) {
        errors.push('Tên danh mục không được vượt quá 100 ký tự');
    } else if (name.trim().length < 2) {
        errors.push('Tên danh mục phải có ít nhất 2 ký tự');
    }
    
    // Validate description (optional)
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Mô tả phải là chuỗi ký tự');
        } else if (description.length > 500) {
            errors.push('Mô tả không được vượt quá 500 ký tự');
        }
    }
    
    // Validate imageUrl (optional)
    if (imageUrl !== undefined && imageUrl !== null) {
        if (typeof imageUrl !== 'string') {
            errors.push('URL hình ảnh phải là chuỗi ký tự');
        } else if (imageUrl.length > 255) {
            errors.push('URL hình ảnh không được vượt quá 255 ký tự');
        } else if (imageUrl.trim().length > 0) {
            // Basic URL validation
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(imageUrl.trim())) {
                errors.push('URL hình ảnh không hợp lệ');
            }
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho cập nhật danh mục
 */
const validateUpdateCategory = async (req, res, next) => {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;
    const errors = [];
    
    // Validate ID
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID danh mục không hợp lệ');
    }
    
    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Tên danh mục không được để trống');
    } else if (name.trim().length > 100) {
        errors.push('Tên danh mục không được vượt quá 100 ký tự');
    } else if (name.trim().length < 2) {
        errors.push('Tên danh mục phải có ít nhất 2 ký tự');
    }
    
    // Validate description (optional)
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Mô tả phải là chuỗi ký tự');
        } else if (description.length > 500) {
            errors.push('Mô tả không được vượt quá 500 ký tự');
        }
    }
    
    // Validate imageUrl (optional)
    if (imageUrl !== undefined && imageUrl !== null) {
        if (typeof imageUrl !== 'string') {
            errors.push('URL hình ảnh phải là chuỗi ký tự');
        } else if (imageUrl.length > 255) {
            errors.push('URL hình ảnh không được vượt quá 255 ký tự');
        } else if (imageUrl.trim().length > 0) {
            // Basic URL validation
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(imageUrl.trim())) {
                errors.push('URL hình ảnh không hợp lệ');
            }
        }
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho category ID trong params
 */
const validateCategoryId = async (req, res, next) => {
    const { id } = req.params;
    const errors = [];
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID danh mục không hợp lệ');
    }
    
    if (errors.length > 0) {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation middleware cho query parameters của categories list
 */
const validateCategoriesQuery = async (req, res, next) => {
    const { page, limit, search } = req.query;
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
    
    if (errors.length > 0) {
        return errorResponse(res, 'Tham số truy vấn không hợp lệ', 400, errors);
    }
    
    next();
};

/**
 * Validation cho bulk operations
 */
const validateBulkCategoryIds = async (req, res, next) => {
    const { ids } = req.body;
    const errors = [];
    
    if (!ids || !Array.isArray(ids)) {
        errors.push('Danh sách ID phải là một mảng');
    } else {
        if (ids.length === 0) {
            errors.push('Danh sách ID không được để trống');
        } else if (ids.length > 50) {
            errors.push('Không thể xử lý quá 50 danh mục cùng lúc');
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

module.exports = {
    validateCreateCategory,
    validateUpdateCategory,
    validateCategoryId,
    validateCategoriesQuery,
    validateBulkCategoryIds
};
