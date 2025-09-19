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
const validateRevenueComparisonQuery = async (req, res, next) => {
    const errors = [];
    const { current_period, comparison_period, limit } = req.query;

    const validPeriods = ['hour', 'day', 'week', 'month', 'year'];

    // Validate current_period
    if (current_period && !validPeriods.includes(current_period)) {
        errors.push(`current_period không hợp lệ. Chỉ chấp nhận: ${validPeriods.join(', ')}`);
    }

    // Validate comparison_period
    if (comparison_period && !validPeriods.includes(comparison_period)) {
        errors.push(`comparison_period không hợp lệ. Chỉ chấp nhận: ${validPeriods.join(', ')}`);
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
 * Validate query parameters cho user growth stats
 */
const validateUserGrowthQuery = async (req, res, next) => {
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
const validateCompleteStatsQuery = async (req, res, next) => {
    const errors = [];
    const {
        include_overview,
        include_revenue,
        include_business,
        revenue_period,
        revenue_limit,
        product_limit,
        seller_limit,
        growth_period,
        growth_limit
    } = req.query;

    // Validate boolean parameters
    const booleanParams = ['include_overview', 'include_revenue', 'include_business'];
    booleanParams.forEach(param => {
        const value = req.query[param];
        if (value && !['true', 'false'].includes(value)) {
            errors.push(`${param} phải là 'true' hoặc 'false'`);
        }
    });

    // Validate period parameters
    const validPeriods = ['hour', 'day', 'week', 'month', 'year'];
    if (revenue_period && !validPeriods.includes(revenue_period)) {
        errors.push(`revenue_period không hợp lệ. Chỉ chấp nhận: ${validPeriods.join(', ')}`);
    }
    if (growth_period && !validPeriods.includes(growth_period)) {
        errors.push(`growth_period không hợp lệ. Chỉ chấp nhận: ${validPeriods.join(', ')}`);
    }

    // Validate limit parameters
    const limitParams = [
        { name: 'revenue_limit', max: 365 },
        { name: 'product_limit', max: 50 },
        { name: 'seller_limit', max: 50 },
        { name: 'growth_limit', max: 365 }
    ];

    limitParams.forEach(({ name, max }) => {
        const value = req.query[name];
        if (value) {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 1 || numValue > max) {
                errors.push(`${name} phải là số từ 1 đến ${max}`);
            }
        }
    });

    if (errors.length > 0) {
        return errorResponse(res, 'Tham số query không hợp lệ', 400, errors);
    }

    next();
};

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
    validateRevenueComparisonQuery,
    validateUserGrowthQuery,
    validateLimitQuery,
    validateRecentActivityQuery,
    validateCompleteStatsQuery,
    StatsValidationRules
};
