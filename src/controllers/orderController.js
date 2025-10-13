const OrderService = require('../services/orderService');
const OrderItem = require('../models/OrderItem');
const { successResponse, errorResponse } = require('../utils/response');

// 1. POST /api/orders - Tạo đơn hàng mới
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { from_cart = true } = req.body;

        // Controller chỉ gọi service
        let result;
        if (from_cart) {
            result = await OrderService.createOrderFromCart(userId, req.body);
        } else {
            result = await OrderService.createOrderDirect(userId, req.body);
        }

        return successResponse(res, result, 'Tạo đơn hàng thành công', 201);
    } catch (error) {
        console.error('Create order error:', error);
        
        // Xử lý các lỗi business logic từ service
        if (error.message.includes('Giỏ hàng trống') || 
            error.message.includes('không khả dụng') || 
            error.message.includes('không đủ số lượng') ||
            error.message.includes('Không tìm thấy sản phẩm')) {
            return errorResponse(res, error.message, 400);
        }
        
        return errorResponse(res, 'Lỗi khi tạo đơn hàng', 500);
    }
};

// 2. GET /api/orders - Lấy danh sách đơn hàng của user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Controller chỉ gọi service
        const result = await OrderService.getUserOrders(userId, req.query);

        return successResponse(res, result, 'Lấy danh sách đơn hàng thành công');
    } catch (error) {
        console.error('Get user orders error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', 500);
    }
};

// 3. GET /api/orders/:id - Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Controller chỉ gọi service
        const order = await OrderService.getOrderDetails(parseInt(id), userId, userRole);

        return successResponse(res, order, 'Lấy chi tiết đơn hàng thành công');
    } catch (error) {
        console.error('Get order by ID error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không tìm thấy đơn hàng') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message === 'Không có quyền truy cập đơn hàng này') {
            return errorResponse(res, error.message, 403);
        }
        
        return errorResponse(res, 'Lỗi khi lấy chi tiết đơn hàng', 500);
    }
};

// 4. PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Controller chỉ gọi service
        const updatedOrder = await OrderService.updateOrderStatus(
            parseInt(id), 
            status, 
            userId, 
            userRole
        );

        return successResponse(res, updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
        console.error('Update order status error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không tìm thấy đơn hàng') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message.includes('Không có quyền') || 
            error.message.includes('không hợp lệ')) {
            return errorResponse(res, error.message, 403);
        }
        
        if (error.message === 'Không thể cập nhật trạng thái đơn hàng') {
            return errorResponse(res, error.message, 400);
        }
        
        return errorResponse(res, 'Lỗi khi cập nhật trạng thái đơn hàng', 500);
    }
};

// 5. DELETE /api/orders/:id - Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Controller chỉ gọi service
        const cancelledOrder = await OrderService.cancelOrder(
            parseInt(id), 
            userId, 
            userRole
        );

        return successResponse(res, cancelledOrder, 'Hủy đơn hàng thành công');
    } catch (error) {
        console.error('Cancel order error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không tìm thấy đơn hàng') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message.includes('Không có quyền') || 
            error.message.includes('Chỉ có thể hủy')) {
            return errorResponse(res, error.message, 403);
        }
        
        return errorResponse(res, 'Lỗi khi hủy đơn hàng', 500);
    }
};

// 6. GET /api/admin/orders - Lấy tất cả đơn hàng (Admin)
const getAllOrders = async (req, res) => {
    try {
        // Controller chỉ gọi service
        const result = await OrderService.getAllOrdersForAdmin(req.query);

        return successResponse(res, result, 'Lấy danh sách tất cả đơn hàng thành công');
    } catch (error) {
        console.error('Get all orders error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', 500);
    }
};

// 7. GET /api/seller/orders - Lấy đơn hàng của seller
const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        
        // Controller chỉ gọi service
        const result = await OrderService.getSellerOrders(sellerId, req.query);

        return successResponse(res, result, 'Lấy danh sách đơn hàng của seller thành công');
    } catch (error) {
        console.error('Get seller orders error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', 500);
    }
};

// 8. GET /api/orders/:id/items - Lấy danh sách items trong đơn hàng
const getOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Kiểm tra quyền truy cập thông qua service
        await OrderService.getOrderDetails(parseInt(id), userId, userRole);
        
        // Lấy items
        const items = await OrderItem.findByOrderId(parseInt(id));

        return successResponse(res, items, 'Lấy danh sách items thành công');
    } catch (error) {
        console.error('Get order items error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Không tìm thấy đơn hàng') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message === 'Không có quyền truy cập đơn hàng này') {
            return errorResponse(res, error.message, 403);
        }
        
        return errorResponse(res, 'Lỗi khi lấy danh sách items', 500);
    }
};

// 9. GET /api/orders/stats - Lấy thống kê đơn hàng
const getOrderStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Controller chỉ gọi service
        const stats = await OrderService.getOrderStatistics(userId, userRole);

        return successResponse(res, stats, 'Lấy thống kê đơn hàng thành công');
    } catch (error) {
        console.error('Get order stats error:', error);
        return errorResponse(res, 'Lỗi khi lấy thống kê đơn hàng', 500);
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    getSellerOrders,
    getOrderItems,
    getOrderStats
};
