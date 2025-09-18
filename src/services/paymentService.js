const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { 
    validateCreatePayment,
    validateUpdatePaymentStatus,
    validateStatusTransition,
    validateCompletedPayment,
    validatePagination,
    validateRevenuePeriod,
    validateDateRange,
    validateId,
    validateRefundReason,
    PAYMENT_CONSTANTS
} = require('../validation/paymentValidation');

class PaymentService {
    // 1. Tạo payment cho đơn hàng
    static async createPayment(userId, userRole, paymentData) {
        // Validation input
        const validation = validateCreatePayment(paymentData);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const { order_id, payment_method, transaction_id } = paymentData;
        const orderId = parseInt(order_id);

        // Kiểm tra đơn hàng có tồn tại không
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Kiểm tra quyền truy cập đơn hàng
        if (order.user_id !== userId && userRole !== 'admin') {
            throw new Error('Không có quyền tạo payment cho đơn hàng này');
        }

        // Kiểm tra trạng thái đơn hàng
        if (!PAYMENT_CONSTANTS.ALLOWED_ORDER_STATUSES.includes(order.status)) {
            throw new Error(`Không thể tạo payment cho đơn hàng có trạng thái '${order.status}'. Chỉ cho phép: ${PAYMENT_CONSTANTS.ALLOWED_ORDER_STATUSES.join(', ')}`);
        }

        // Kiểm tra xem đã có payment thành công chưa
        const hasSuccessfulPayment = await Payment.hasSuccessfulPayment(orderId);
        if (hasSuccessfulPayment) {
            throw new Error('Đơn hàng đã được thanh toán thành công');
        }

        // Tạo payment
        const normalizedMethod = payment_method.trim().toLowerCase();
        const payment = await Payment.create({
            order_id: orderId,
            payment_method: normalizedMethod,
            transaction_id: transaction_id?.trim() || null,
            amount: order.total_amount,
            payment_status: 'pending'
        });

        // Sync order payment method with actual payment method
        await Order.updatePaymentMethod(orderId, normalizedMethod);

        return payment;
    }

    // 2. Lấy thông tin payment của đơn hàng
    static async getPaymentsByOrderId(userId, userRole, orderId) {
        // Validation
        const idValidation = validateId(orderId, 'ID đơn hàng');
        if (!idValidation.isValid) {
            throw new Error(idValidation.error);
        }

        const orderIdInt = parseInt(orderId);

        // Kiểm tra đơn hàng có tồn tại không
        const order = await Order.findById(orderIdInt);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Kiểm tra quyền truy cập
        if (userRole !== 'admin' && order.user_id !== userId) {
            throw new Error('Không có quyền truy cập payments của đơn hàng này');
        }

        const payments = await Payment.findByOrderId(orderIdInt);
        return payments;
    }

    // 3. Lấy thông tin payment theo ID
    static async getPaymentById(userId, userRole, paymentId) {
        // Validation
        const idValidation = validateId(paymentId, 'ID payment');
        if (!idValidation.isValid) {
            throw new Error(idValidation.error);
        }

        const paymentIdInt = parseInt(paymentId);

        const payment = await Payment.findById(paymentIdInt);
        if (!payment) {
            throw new Error('Không tìm thấy payment');
        }

        // Kiểm tra quyền truy cập
        if (userRole !== 'admin') {
            const order = await Order.findById(payment.order_id);
            if (!order || order.user_id !== userId) {
                throw new Error('Không có quyền truy cập payment này');
            }
        }

        return payment;
    }

    // 4. Cập nhật trạng thái payment
    static async updatePaymentStatus(userId, userRole, paymentId, statusData) {
        // Validation
        const idValidation = validateId(paymentId, 'ID payment');
        if (!idValidation.isValid) {
            throw new Error(idValidation.error);
        }

        const validation = validateUpdatePaymentStatus(statusData);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const { status, transaction_id } = statusData;
        const paymentIdInt = parseInt(paymentId);

        const payment = await Payment.findById(paymentIdInt);
        if (!payment) {
            throw new Error('Không tìm thấy payment');
        }

        // Kiểm tra quyền cập nhật
        if (userRole !== 'admin') {
            const order = await Order.findById(payment.order_id);
            if (!order || order.user_id !== userId) {
                throw new Error('Không có quyền cập nhật payment này');
            }
        }

        // Validate status transitions
        const transitionValidation = validateStatusTransition(payment.payment_status, status);
        if (!transitionValidation.isValid) {
            throw new Error(transitionValidation.error);
        }

        // Validate transaction_id for completed status
        if (status === 'completed') {
            const completedValidation = validateCompletedPayment(payment.payment_method, transaction_id);
            if (!completedValidation.isValid) {
                throw new Error(completedValidation.error);
            }
        }

        // Special validation for refund
        if (status === 'refunded' && userRole !== 'admin') {
            throw new Error('Chỉ admin mới có thể hoàn tiền');
        }

        // Cập nhật trạng thái
        const updatedPayment = await Payment.updateStatus(paymentIdInt, status, transaction_id);
        if (!updatedPayment) {
            throw new Error('Không thể cập nhật trạng thái payment');
        }

        // Auto-update order status based on payment status
        if (status === 'completed') {
            await Order.updateStatus(payment.order_id, 'processing');
        } else if (status === 'refunded') {
            await Order.updateStatus(payment.order_id, 'cancelled');
        }

        return updatedPayment;
    }

    // 5. Lấy tất cả payments của user
    static async getUserPayments(userId, queryParams) {
        const { page = 1, limit = 10, status } = queryParams;

        // Validation pagination
        const paginationValidation = validatePagination(page, limit);
        if (!paginationValidation.isValid) {
            throw new Error(paginationValidation.errors.join(', '));
        }

        const { page: validPage, limit: validLimit, offset } = paginationValidation;

        let payments = await Payment.findByUserId(userId, validLimit, offset);

        // Filter by status if provided
        if (status) {
            payments = payments.filter(payment => payment.payment_status === status);
        }

        const totalPayments = await Payment.count(status);

        return {
            payments,
            pagination: {
                current_page: validPage,
                total_pages: Math.ceil(totalPayments / validLimit),
                total_payments: totalPayments,
                has_next: validPage < Math.ceil(totalPayments / validLimit),
                has_prev: validPage > 1
            }
        };
    }

    // 6. Lấy tất cả payments (Admin)
    static async getAllPayments(queryParams) {
        const { page = 1, limit = 20, status, start_date, end_date } = queryParams;

        // Validation pagination
        const paginationValidation = validatePagination(page, limit);
        if (!paginationValidation.isValid) {
            throw new Error(paginationValidation.errors.join(', '));
        }

        // Validation date range
        const dateValidation = validateDateRange(start_date, end_date);
        if (!dateValidation.isValid) {
            throw new Error(dateValidation.errors.join(', '));
        }

        const { page: validPage, limit: validLimit, offset } = paginationValidation;

        const payments = await Payment.findAll(validLimit, offset, status);

        let filteredPayments = payments;

        // Filter by date range if provided
        if (start_date || end_date) {
            filteredPayments = payments.filter(payment => {
                const paymentDate = new Date(payment.created_at);
                
                if (start_date && paymentDate < new Date(start_date)) {
                    return false;
                }
                
                if (end_date && paymentDate > new Date(end_date)) {
                    return false;
                }
                
                return true;
            });
        }

        const totalPayments = await Payment.count(status, start_date, end_date);

        return {
            payments: filteredPayments,
            pagination: {
                current_page: validPage,
                total_pages: Math.ceil(totalPayments / validLimit),
                total_payments: totalPayments,
                has_next: validPage < Math.ceil(totalPayments / validLimit),
                has_prev: validPage > 1
            }
        };
    }

    // 7. Lấy thống kê payments
    static async getPaymentStats(queryParams) {
        const { start_date, end_date } = queryParams;

        // Validation date range
        const dateValidation = validateDateRange(start_date, end_date);
        if (!dateValidation.isValid) {
            throw new Error(dateValidation.errors.join(', '));
        }

        const stats = await Payment.getStats(start_date, end_date);
        return stats;
    }

    // 8. Lấy doanh thu theo thời gian
    static async getRevenue(queryParams) {
        const { period = 'day', limit = 30 } = queryParams;

        // Validation
        const validation = validateRevenuePeriod(period, limit);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const revenue = await Payment.getRevenueByPeriod(period, parseInt(limit));

        return {
            period: period,
            data: revenue,
            summary: {
                total_periods: revenue.length,
                total_revenue: revenue.reduce((sum, item) => sum + parseFloat(item.successful_revenue || 0), 0),
                total_transactions: revenue.reduce((sum, item) => sum + parseInt(item.successful_count || 0), 0)
            }
        };
    }

    // 9. Hoàn tiền payment
    static async refundPayment(userRole, paymentId, refundData) {
        // Validation
        const idValidation = validateId(paymentId, 'ID payment');
        if (!idValidation.isValid) {
            throw new Error(idValidation.error);
        }

        const { reason } = refundData;

        // Validation reason
        const reasonValidation = validateRefundReason(reason);
        if (!reasonValidation.isValid) {
            throw new Error(reasonValidation.error);
        }

        // Chỉ admin mới có thể hoàn tiền
        if (userRole !== 'admin') {
            throw new Error('Không có quyền hoàn tiền');
        }

        const paymentIdInt = parseInt(paymentId);

        const payment = await Payment.findById(paymentIdInt);
        if (!payment) {
            throw new Error('Không tìm thấy payment');
        }

        // Chỉ có thể hoàn tiền payment đã completed
        if (payment.payment_status !== 'completed') {
            throw new Error('Chỉ có thể hoàn tiền payment đã hoàn thành');
        }

        // Cập nhật trạng thái thành refunded
        const refundedPayment = await Payment.updateStatus(paymentIdInt, 'refunded');
        if (!refundedPayment) {
            throw new Error('Không thể hoàn tiền payment');
        }

        // Cập nhật trạng thái order thành cancelled
        await Order.updateStatus(payment.order_id, 'cancelled');

        return {
            ...refundedPayment,
            refund_reason: reason || 'Không có lý do'
        };
    }
}

module.exports = PaymentService;
