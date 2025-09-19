const { isEmail, isEmpty, isLength } = require('../utils/validator');

// Validation schema và constants
const PAYMENT_CONSTANTS = {
    VALID_PAYMENT_METHODS: [
        'cod',           // Cash on Delivery
        'credit_card',   // Credit Card
        'debit_card',    // Debit Card
        'momo',          // MoMo Wallet
        'zalopay',       // ZaloPay
        'vnpay',         // VNPay
        'bank_transfer', // Bank Transfer
        'paypal',        // PayPal
        'stripe'         // Stripe
    ],
    VALID_PAYMENT_STATUSES: ['pending', 'completed', 'failed', 'refunded'],
    ALLOWED_ORDER_STATUSES: ['pending', 'processing'],
    VALID_REVENUE_PERIODS: ['hour', 'day', 'week', 'month', 'year']
};

// Validation cho tạo payment
const validateCreatePayment = (data) => {
    const errors = [];

    // Validate order_id
    if (!data.order_id) {
        errors.push('Order ID không được để trống');
    } else if (isNaN(parseInt(data.order_id))) {
        errors.push('ID đơn hàng không hợp lệ');
    }

    // Validate payment_method
    if (!data.payment_method || isEmpty(data.payment_method.trim())) {
        errors.push('Phương thức thanh toán không được để trống');
    } else if (!PAYMENT_CONSTANTS.VALID_PAYMENT_METHODS.includes(data.payment_method.trim().toLowerCase())) {
        errors.push(`Phương thức thanh toán không hỗ trợ. Các phương thức hợp lệ: ${PAYMENT_CONSTANTS.VALID_PAYMENT_METHODS.join(', ')}`);
    }

    // Validate transaction_id cho non-COD payments
    const normalizedMethod = data.payment_method?.trim().toLowerCase();
    if (normalizedMethod && normalizedMethod !== 'cod' && isEmpty(data.transaction_id?.trim())) {
        errors.push(`Transaction ID là bắt buộc cho phương thức thanh toán '${data.payment_method}'`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validation cho update payment status
const validateUpdatePaymentStatus = (data) => {
    const errors = [];

    // Validate status
    if (!data.status) {
        errors.push('Trạng thái payment không được để trống');
    } else if (!PAYMENT_CONSTANTS.VALID_PAYMENT_STATUSES.includes(data.status)) {
        errors.push(`Trạng thái payment không hợp lệ. Các trạng thái hợp lệ: ${PAYMENT_CONSTANTS.VALID_PAYMENT_STATUSES.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validation cho status transition
const validateStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        'pending': ['completed', 'failed'],
        'completed': ['refunded'],
        'failed': ['pending'],  // Allow retry
        'refunded': []  // Final state
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    
    return {
        isValid: allowedStatuses.includes(newStatus),
        error: `Không thể chuyển từ trạng thái '${currentStatus}' sang '${newStatus}'`
    };
};

// Validation cho completed payment
const validateCompletedPayment = (paymentMethod, transactionId) => {
    if (paymentMethod !== 'cod' && isEmpty(transactionId?.trim())) {
        return {
            isValid: false,
            error: 'Transaction ID là bắt buộc khi hoàn thành thanh toán online'
        };
    }

    return {
        isValid: true,
        error: null
    };
};

// Validation cho get payments với pagination
const validatePagination = (page = 1, limit = 10) => {
    const errors = [];

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage < 1) {
        errors.push('Page phải là số nguyên dương');
    }

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        errors.push('Limit phải là số nguyên từ 1 đến 100');
    }

    return {
        isValid: errors.length === 0,
        errors,
        page: parsedPage,
        limit: parsedLimit,
        offset: (parsedPage - 1) * parsedLimit
    };
};

// Validation cho revenue period
const validateRevenuePeriod = (period = 'day', limit = 30) => {
    const errors = [];

    if (!PAYMENT_CONSTANTS.VALID_REVENUE_PERIODS.includes(period)) {
        errors.push(`Chu kỳ thời gian không hợp lệ. Các chu kỳ hợp lệ: ${PAYMENT_CONSTANTS.VALID_REVENUE_PERIODS.join(', ')}`);
    }

    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        errors.push('Limit phải là số nguyên dương');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validation cho date range
const validateDateRange = (startDate, endDate) => {
    const errors = [];

    if (startDate && isNaN(Date.parse(startDate))) {
        errors.push('Start date không hợp lệ');
    }

    if (endDate && isNaN(Date.parse(endDate))) {
        errors.push('End date không hợp lệ');
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.push('Start date phải nhỏ hơn End date');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validation cho ID parameter
const validateId = (id, paramName = 'ID') => {
    if (!id) {
        return {
            isValid: false,
            error: `${paramName} không được để trống`
        };
    }

    if (isNaN(parseInt(id))) {
        return {
            isValid: false,
            error: `${paramName} không hợp lệ`
        };
    }

    return {
        isValid: true,
        error: null
    };
};

// Validation cho refund reason
const validateRefundReason = (reason) => {
    if (reason && reason.trim().length > 500) {
        return {
            isValid: false,
            error: 'Lý do hoàn tiền không được vượt quá 500 ký tự'
        };
    }

    return {
        isValid: true,
        error: null
    };
};

module.exports = {
    PAYMENT_CONSTANTS,
    validateCreatePayment,
    validateUpdatePaymentStatus,
    validateStatusTransition,
    validateCompletedPayment,
    validatePagination,
    validateRevenuePeriod,
    validateDateRange,
    validateId,
    validateRefundReason
};
