const PaymentService = require('../services/paymentService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. POST /api/payments - Tạo payment cho đơn hàng
const createPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const paymentData = req.body;

        const payment = await PaymentService.createPayment(userId, userRole, paymentData);
        
        return successResponse(res, payment, 'Tạo payment thành công', 201);
    } catch (error) {
        console.error('Create payment error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 2. GET /api/payments/:orderId - Lấy thông tin payment của đơn hàng
const getPaymentsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const payments = await PaymentService.getPaymentsByOrderId(userId, userRole, orderId);

        return successResponse(res, payments, 'Lấy thông tin payments thành công');
    } catch (error) {
        console.error('Get payments by order ID error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 3. GET /api/payments/:id - Lấy thông tin payment theo ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const payment = await PaymentService.getPaymentById(userId, userRole, id);

        return successResponse(res, payment, 'Lấy thông tin payment thành công');
    } catch (error) {
        console.error('Get payment by ID error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 4. PUT /api/payments/:id/status - Cập nhật trạng thái payment
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const statusData = req.body;

        const updatedPayment = await PaymentService.updatePaymentStatus(userId, userRole, id, statusData);

        return successResponse(res, updatedPayment, 'Cập nhật trạng thái payment thành công');
    } catch (error) {
        console.error('Update payment status error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 5. GET /api/payments/user - Lấy tất cả payments của user
const getUserPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const queryParams = req.query;

        const result = await PaymentService.getUserPayments(userId, queryParams);

        return successResponse(res, result, 'Lấy danh sách payments thành công');
    } catch (error) {
        console.error('Get user payments error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 6. GET /api/admin/payments - Lấy tất cả payments (Admin)
const getAllPayments = async (req, res) => {
    try {
        const queryParams = req.query;

        const result = await PaymentService.getAllPayments(queryParams);

        return successResponse(res, result, 'Lấy danh sách tất cả payments thành công');
    } catch (error) {
        console.error('Get all payments error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 7. GET /api/payments/stats - Lấy thống kê payments
const getPaymentStats = async (req, res) => {
    try {
        const queryParams = req.query;

        const stats = await PaymentService.getPaymentStats(queryParams);

        return successResponse(res, stats, 'Lấy thống kê payments thành công');
    } catch (error) {
        console.error('Get payment stats error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

// 8. GET /api/payments/revenue - Lấy doanh thu theo thời gian
const getRevenue = async (req, res) => {
    try {
        const queryParams = req.query;

        const result = await PaymentService.getRevenue(queryParams);

        return successResponse(res, result, 'Lấy doanh thu thành công');
    } catch (error) {
        console.error('Get revenue error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};
// 9. POST /api/payments/:id/refund - Hoàn tiền payment
const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const refundData = req.body;

        const result = await PaymentService.refundPayment(userRole, id, refundData);

        return successResponse(res, result, 'Hoàn tiền thành công');
    } catch (error) {
        console.error('Refund payment error:', error);
        return errorResponse(res, error.message, error.statusCode || 500);
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
