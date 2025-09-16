const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/response');

// 1. POST /api/payments - Tạo payment cho đơn hàng
const createPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { order_id, payment_method, transaction_id } = req.body;

        // Validation
        if (!order_id || isNaN(parseInt(order_id))) {
            return errorResponse(res, 'ID đơn hàng không hợp lệ', 400);
        }

        if (!payment_method || payment_method.trim().length === 0) {
            return errorResponse(res, 'Phương thức thanh toán không được để trống', 400);
        }

        // Kiểm tra đơn hàng có tồn tại không
        const order = await Order.findById(parseInt(order_id));
        if (!order) {
            return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
        }

        // Kiểm tra quyền truy cập đơn hàng
        if (order.user_id !== userId && req.user.role !== 'admin') {
            return errorResponse(res, 'Không có quyền tạo payment cho đơn hàng này', 403);
        }

        // Kiểm tra xem đã có payment thành công chưa
        const hasSuccessfulPayment = await Payment.hasSuccessfulPayment(parseInt(order_id));
        if (hasSuccessfulPayment) {
            return errorResponse(res, 'Đơn hàng đã được thanh toán thành công', 400);
        }

        // Tạo payment
        const payment = await Payment.create({
            order_id: parseInt(order_id),
            payment_method: payment_method.trim(),
            transaction_id: transaction_id?.trim(),
            amount: order.total_amount,
            payment_status: 'pending'
        });

        return successResponse(res, payment, 'Tạo payment thành công', 201);
    } catch (error) {
        console.error('Create payment error:', error);
        return errorResponse(res, 'Lỗi khi tạo payment', 500);
    }
};

// 2. GET /api/payments/:orderId - Lấy thông tin payment của đơn hàng
const getPaymentsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!orderId || isNaN(parseInt(orderId))) {
            return errorResponse(res, 'ID đơn hàng không hợp lệ', 400);
        }

        // Kiểm tra đơn hàng có tồn tại không
        const order = await Order.findById(parseInt(orderId));
        if (!order) {
            return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
        }

        // Kiểm tra quyền truy cập
        if (userRole !== 'admin' && order.user_id !== userId) {
            return errorResponse(res, 'Không có quyền truy cập payments của đơn hàng này', 403);
        }

        const payments = await Payment.findByOrderId(parseInt(orderId));

        return successResponse(res, payments, 'Lấy thông tin payments thành công');
    } catch (error) {
        console.error('Get payments by order ID error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin payments', 500);
    }
};

// 3. GET /api/payments/:id - Lấy thông tin payment theo ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID payment không hợp lệ', 400);
        }

        const payment = await Payment.findById(parseInt(id));
        if (!payment) {
            return errorResponse(res, 'Không tìm thấy payment', 404);
        }

        // Kiểm tra quyền truy cập
        if (userRole !== 'admin') {
            const order = await Order.findById(payment.order_id);
            if (!order || order.user_id !== userId) {
                return errorResponse(res, 'Không có quyền truy cập payment này', 403);
            }
        }

        return successResponse(res, payment, 'Lấy thông tin payment thành công');
    } catch (error) {
        console.error('Get payment by ID error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin payment', 500);
    }
};

// 4. PUT /api/payments/:id/status - Cập nhật trạng thái payment
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transaction_id } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID payment không hợp lệ', 400);
        }

        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!status || !validStatuses.includes(status)) {
            return errorResponse(res, 'Trạng thái payment không hợp lệ', 400);
        }

        const payment = await Payment.findById(parseInt(id));
        if (!payment) {
            return errorResponse(res, 'Không tìm thấy payment', 404);
        }

        // Kiểm tra quyền cập nhật
        if (userRole !== 'admin') {
            const order = await Order.findById(payment.order_id);
            if (!order || order.user_id !== userId) {
                return errorResponse(res, 'Không có quyền cập nhật payment này', 403);
            }
        }

        // Cập nhật trạng thái
        const updatedPayment = await Payment.updateStatus(parseInt(id), status, transaction_id);

        if (!updatedPayment) {
            return errorResponse(res, 'Không thể cập nhật trạng thái payment', 400);
        }

        // Nếu payment thành công, cập nhật trạng thái order
        if (status === 'completed') {
            await Order.updateStatus(payment.order_id, 'processing');
        }

        return successResponse(res, updatedPayment, 'Cập nhật trạng thái payment thành công');
    } catch (error) {
        console.error('Update payment status error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật trạng thái payment', 500);
    }
};

// 5. GET /api/payments/user - Lấy tất cả payments của user
const getUserPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let payments = await Payment.findByUserId(userId, parseInt(limit), offset);

        if (status) {
            payments = payments.filter(payment => payment.payment_status === status);
        }

        const totalPayments = await Payment.count(status);

        const result = {
            payments,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(totalPayments / parseInt(limit)),
                total_payments: totalPayments,
                has_next: parseInt(page) < Math.ceil(totalPayments / parseInt(limit)),
                has_prev: parseInt(page) > 1
            }
        };

        return successResponse(res, result, 'Lấy danh sách payments thành công');
    } catch (error) {
        console.error('Get user payments error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách payments', 500);
    }
};

// 6. GET /api/admin/payments - Lấy tất cả payments (Admin)
const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, start_date, end_date } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const payments = await Payment.findAll(parseInt(limit), offset, status);

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

        const result = {
            payments: filteredPayments,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(totalPayments / parseInt(limit)),
                total_payments: totalPayments,
                has_next: parseInt(page) < Math.ceil(totalPayments / parseInt(limit)),
                has_prev: parseInt(page) > 1
            }
        };

        return successResponse(res, result, 'Lấy danh sách tất cả payments thành công');
    } catch (error) {
        console.error('Get all payments error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách payments', 500);
    }
};

// 7. GET /api/payments/stats - Lấy thống kê payments
const getPaymentStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const stats = await Payment.getStats(start_date, end_date);

        return successResponse(res, stats, 'Lấy thống kê payments thành công');
    } catch (error) {
        console.error('Get payment stats error:', error);
        return errorResponse(res, 'Lỗi khi lấy thống kê payments', 500);
    }
};

// 8. GET /api/payments/revenue - Lấy doanh thu theo thời gian
const getRevenue = async (req, res) => {
    try {
        const { period = 'day', limit = 30 } = req.query;

        const validPeriods = ['hour', 'day', 'week', 'month', 'year'];
        if (!validPeriods.includes(period)) {
            return errorResponse(res, 'Chu kỳ thời gian không hợp lệ', 400);
        }

        const revenue = await Payment.getRevenueByPeriod(period, parseInt(limit));

        const result = {
            period: period,
            data: revenue,
            summary: {
                total_periods: revenue.length,
                total_revenue: revenue.reduce((sum, item) => sum + parseFloat(item.successful_revenue || 0), 0),
                total_transactions: revenue.reduce((sum, item) => sum + parseInt(item.successful_count || 0), 0)
            }
        };

        return successResponse(res, result, 'Lấy doanh thu thành công');
    } catch (error) {
        console.error('Get revenue error:', error);
        return errorResponse(res, 'Lỗi khi lấy doanh thu', 500);
    }
};

// 9. POST /api/payments/:id/refund - Hoàn tiền payment
const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userRole = req.user.role;

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID payment không hợp lệ', 400);
        }

        // Chỉ admin mới có thể hoàn tiền
        if (userRole !== 'admin') {
            return errorResponse(res, 'Không có quyền hoàn tiền', 403);
        }

        const payment = await Payment.findById(parseInt(id));
        if (!payment) {
            return errorResponse(res, 'Không tìm thấy payment', 404);
        }

        // Chỉ có thể hoàn tiền payment đã completed
        if (payment.payment_status !== 'completed') {
            return errorResponse(res, 'Chỉ có thể hoàn tiền payment đã hoàn thành', 400);
        }

        // Cập nhật trạng thái thành refunded
        const refundedPayment = await Payment.updateStatus(parseInt(id), 'refunded');

        if (!refundedPayment) {
            return errorResponse(res, 'Không thể hoàn tiền payment', 400);
        }

        // Cập nhật trạng thái order thành cancelled
        await Order.updateStatus(payment.order_id, 'cancelled');

        const result = {
            ...refundedPayment,
            refund_reason: reason || 'Không có lý do'
        };

        return successResponse(res, result, 'Hoàn tiền thành công');
    } catch (error) {
        console.error('Refund payment error:', error);
        return errorResponse(res, 'Lỗi khi hoàn tiền', 500);
    }
};

module.exports = {
    createPayment,
    getPaymentsByOrderId,
    getPaymentById,
    updatePaymentStatus,
    getUserPayments,
    getAllPayments,
    getPaymentStats,
    getRevenue,
    refundPayment
};
