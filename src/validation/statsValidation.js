const { errorResponse } = require('../utils/response');

/**
 * Validation middleware cho Stats endpoints
 * Theo nguyên tắc SRP: Validation chỉ kiểm tra và validate dữ liệu input
 */

/**
 * Validate query parameters cho revenue stats
 */
const validateRevenueStatsQuery = async (req, res, next) => {
    const errors = [];
    const { period, limit } = req.query;

    // Validate period
    if (period) {
        const validPeriods = ['hour', 'day', 'week', 'month', 'year'];
        if (!validPeriods.includes(period)) {
            errors.push(`Period không hợp lệ. Chỉ chấp nhận: ${validPeriods.join(', ')}`);
        }
    }

    // Validate limit
    if (limit) {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > 365) {
            errors.push('Limit phải là số từ 1 đến 365');
        }
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số query không hợp lệ', 400, errors);
    }

    next();
};

/**
 * Validate query parameters cho revenue comparison
 */
// validateRevenueComparisonQuery removed (endpoint unused)

/**
 * Validate query parameters cho user growth stats
 */
// validateUserGrowthQuery removed (endpoint unused)

/**
 * Validate limit parameter cho product/seller stats
 */
const validateLimitQuery = async (req, res, next) => {
    const errors = [];
    const { limit } = req.query;

    if (limit) {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > 50) {
            errors.push('Limit phải là số từ 1 đến 50');
        }
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số query không hợp lệ', 400, errors);
    }

    next();
};

/**
 * Validate query parameters cho recent activity
 */
const validateRecentActivityQuery = async (req, res, next) => {
    const errors = [];
    const { limit } = req.query;

    if (limit) {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > 100) {
            errors.push('Limit phải là số từ 1 đến 100');
        }
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số query không hợp lệ', 400, errors);
    }

    next();
};

/**
 * Validate query parameters cho complete admin stats
 */
// validateCompleteStatsQuery removed (endpoint unused)

/**
 * Common validation rules cho stats
 */
const StatsValidationRules = {
    // Kiểm tra period có hợp lệ không
    isValidPeriod: (period) => {
        return ['hour', 'day', 'week', 'month', 'year'].includes(period);
    },

    // Kiểm tra limit có hợp lệ không
    isValidLimit: (limit, max = 100) => {
        const num = parseInt(limit);
        return !isNaN(num) && num >= 1 && num <= max;
    },

    // Kiểm tra boolean string
    isValidBoolean: (value) => {
        return ['true', 'false'].includes(value);
    },

    // Sanitize period
    sanitizePeriod: (period) => {
        const validPeriods = ['hour', 'day', 'week', 'month', 'year'];
        return validPeriods.includes(period) ? period : 'day';
    },

    // Sanitize limit
    sanitizeLimit: (limit, defaultValue = 10, max = 100) => {
        const num = parseInt(limit);
        if (isNaN(num) || num < 1) return defaultValue;
        if (num > max) return max;
        return num;
    },

    // Sanitize boolean
    sanitizeBoolean: (value, defaultValue = true) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return defaultValue;
    }
};

module.exports = {
    validateRevenueStatsQuery,
    validateLimitQuery,
    validateRecentActivityQuery,
    StatsValidationRules
};
