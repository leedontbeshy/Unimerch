const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ShoppingCart = require('../models/ShoppingCart');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/response');

// 1. POST /api/orders - Tạo đơn hàng mới
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            items, // Array of {product_id, quantity} hoặc null nếu order từ cart
            shipping_address, 
            payment_method,
            from_cart = true // Mặc định tạo order từ cart
        } = req.body;

        // Validation
        if (!shipping_address || shipping_address.trim().length === 0) {
            return errorResponse(res, 'Địa chỉ giao hàng không được để trống', 400);
        }

        if (!payment_method || payment_method.trim().length === 0) {
            return errorResponse(res, 'Phương thức thanh toán không được để trống', 400);
        }

        let orderItems = [];
        let totalAmount = 0;

        if (from_cart) {
            // Tạo order từ giỏ hàng
            const cartItems = await ShoppingCart.validateCartItems(userId);
            
            if (cartItems.length === 0) {
                return errorResponse(res, 'Giỏ hàng trống', 400);
            }

            // Kiểm tra tính khả dụng
            const invalidItems = cartItems.filter(item => item.validation_status !== 'valid');
            if (invalidItems.length > 0) {
                return errorResponse(res, 'Một số sản phẩm trong giỏ hàng không khả dụng hoặc hết hàng', 400);
            }

            // Chuyển đổi cart items thành order items
            orderItems = await ShoppingCart.convertToOrderItems(userId);
            totalAmount = await ShoppingCart.getCartTotal(userId);
        } else {
            // Tạo order trực tiếp từ items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return errorResponse(res, 'Danh sách sản phẩm không được để trống', 400);
            }

            // Validate và tính tổng tiền
            for (const item of items) {
                if (!item.product_id || !item.quantity || item.quantity <= 0) {
                    return errorResponse(res, 'Thông tin sản phẩm không hợp lệ', 400);
                }

                const product = await Product.findById(item.product_id);
                if (!product) {
                    return errorResponse(res, `Không tìm thấy sản phẩm ID: ${item.product_id}`, 404);
                }

                if (product.status !== 'available') {
                    return errorResponse(res, `Sản phẩm ${product.name} không khả dụng`, 400);
                }

                if (product.quantity < item.quantity) {
                    return errorResponse(res, `Sản phẩm ${product.name} không đủ số lượng`, 400);
                }

                const price = product.discount_price || product.price;
                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: price
                });

                totalAmount += price * item.quantity;
            }
        }

        // Tạo order
        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            shipping_address: shipping_address.trim(),
            payment_method: payment_method.trim()
        });

        // Thêm order items
        const createdItems = await OrderItem.createMany(
            orderItems.map(item => ({
                ...item,
                order_id: order.id
            }))
        );

        // Cập nhật số lượng sản phẩm
        for (const item of orderItems) {
            await Product.updateQuantity(item.product_id, -item.quantity);
        }

        // Xóa items khỏi cart nếu order từ cart
        if (from_cart) {
            const productIds = orderItems.map(item => item.product_id);
            await ShoppingCart.removeOrderedItems(userId, productIds);
        }

 
        const orderWithItems = {
            ...order,
            items: createdItems
        };

        return successResponse(res, orderWithItems, 'Tạo đơn hàng thành công', 201);
    } catch (error) {
        console.error('Create order error:', error);
        return errorResponse(res, 'Lỗi khi tạo đơn hàng', 500);
    }
};

// 2. GET /api/orders - Lấy danh sách đơn hàng của user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let orders;
        if (status) {
            orders = await Order.findByUserId(userId, parseInt(limit), offset);
            orders = orders.filter(order => order.status === status);
        } else {
            orders = await Order.findByUserId(userId, parseInt(limit), offset);
        }

        // Lấy items cho mỗi order
        for (let order of orders) {
            order.items = await OrderItem.findByOrderId(order.id);
        }

        const totalOrders = await Order.count(userId, status);

        const result = {
            orders,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(totalOrders / parseInt(limit)),
                total_orders: totalOrders,
                has_next: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
                has_prev: parseInt(page) > 1
            }
        };

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

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID đơn hàng không hợp lệ', 400);
        }

        const order = await Order.findById(parseInt(id));

        if (!order) {
            return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
        }

        // Kiểm tra quyền truy cập
        if (userRole !== 'admin' && order.user_id !== userId) {
            // Nếu là seller, kiểm tra xem có sản phẩm nào của seller trong order không
            if (userRole === 'seller') {
                const items = await OrderItem.findByOrderId(order.id);
                const sellerProducts = await Promise.all(
                    items.map(async (item) => {
                        const product = await Product.findById(item.product_id);
                        return product && product.seller_id === userId;
                    })
                );
                
                if (!sellerProducts.some(Boolean)) {
                    return errorResponse(res, 'Không có quyền truy cập đơn hàng này', 403);
                }
            } else {
                return errorResponse(res, 'Không có quyền truy cập đơn hàng này', 403);
            }
        }

        // Lấy items và payment
        order.items = await OrderItem.findByOrderId(order.id);
        order.payments = await Payment.findByOrderId(order.id);

        return successResponse(res, order, 'Lấy chi tiết đơn hàng thành công');
    } catch (error) {
        console.error('Get order by ID error:', error);
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

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID đơn hàng không hợp lệ', 400);
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return errorResponse(res, 'Trạng thái đơn hàng không hợp lệ', 400);
        }

        const order = await Order.findById(parseInt(id));
        if (!order) {
            return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
        }

        // Kiểm tra quyền cập nhật
        if (userRole === 'user') {
            // User chỉ có thể hủy đơn hàng khi status = 'pending'
            if (status !== 'cancelled' || order.status !== 'pending') {
                return errorResponse(res, 'Không có quyền cập nhật trạng thái này', 403);
            }
        } else if (userRole === 'seller') {
            // Seller chỉ có thể cập nhật đơn hàng có chứa sản phẩm của mình
            const items = await OrderItem.findByOrderId(order.id);
            const sellerProducts = await Promise.all(
                items.map(async (item) => {
                    const product = await Product.findById(item.product_id);
                    return product && product.seller_id === userId;
                })
            );
            
            if (!sellerProducts.some(Boolean)) {
                return errorResponse(res, 'Không có quyền cập nhật đơn hàng này', 403);
            }
        }

        // Cập nhật trạng thái
        const updatedOrder = await Order.updateStatus(parseInt(id), status);

        if (!updatedOrder) {
            return errorResponse(res, 'Không thể cập nhật trạng thái đơn hàng', 400);
        }

        return successResponse(res, updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
        console.error('Update order status error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật trạng thái đơn hàng', 500);
    }
};

// 5. DELETE /api/orders/:id - Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID đơn hàng không hợp lệ', 400);
        }

        const order = await Order.findById(parseInt(id));
        if (!order) {
            return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
        }

        // Kiểm tra quyền hủy
        if (userRole !== 'admin' && order.user_id !== userId) {
            return errorResponse(res, 'Không có quyền hủy đơn hàng này', 403);
        }

        // Chỉ có thể hủy đơn hàng khi status = 'pending'
        if (order.status !== 'pending') {
            return errorResponse(res, 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý', 400);
        }

        // Hoàn trả số lượng sản phẩm
        const items = await OrderItem.findByOrderId(order.id);
        for (const item of items) {
            await Product.updateQuantity(item.product_id, item.quantity);
        }

        // Cập nhật trạng thái thành cancelled
        const cancelledOrder = await Order.updateStatus(parseInt(id), 'cancelled');

        return successResponse(res, cancelledOrder, 'Hủy đơn hàng thành công');
    } catch (error) {
        console.error('Cancel order error:', error);
        return errorResponse(res, 'Lỗi khi hủy đơn hàng', 500);
    }
};

// 6. GET /api/admin/orders - Lấy tất cả đơn hàng (Admin)
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, user_id } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let orders;
        if (user_id) {
            orders = await Order.findByUserId(parseInt(user_id), parseInt(limit), offset);
        } else {
            orders = await Order.findAll(parseInt(limit), offset, status);
        }

        // Lấy items cho mỗi order
        for (let order of orders) {
            order.items = await OrderItem.findByOrderId(order.id);
        }

        const totalOrders = await Order.count(user_id ? parseInt(user_id) : null, status);

        const result = {
            orders,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(totalOrders / parseInt(limit)),
                total_orders: totalOrders,
                has_next: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
                has_prev: parseInt(page) > 1
            }
        };

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
        const { page = 1, limit = 20, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let orders = await Order.findBySellerId(sellerId, parseInt(limit), offset);

        if (status) {
            orders = orders.filter(order => order.status === status);
        }

        // Lấy items cho mỗi order (chỉ items của seller)
        for (let order of orders) {
            const allItems = await OrderItem.findByOrderId(order.id);
            order.items = [];
            
            for (const item of allItems) {
                const product = await Product.findById(item.product_id);
                if (product && product.seller_id === sellerId) {
                    order.items.push(item);
                }
            }
        }

        const result = {
            orders,
            pagination: {
                current_page: parseInt(page),
                has_next: orders.length === parseInt(limit),
                has_prev: parseInt(page) > 1
            }
        };

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

        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID đơn hàng không hợp lệ', 400);
        }

        const order = await Order.findById(parseInt(id));
        if (!order) {
            return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
        }

        // Kiểm tra quyền truy cập
        if (userRole !== 'admin' && order.user_id !== userId) {
            if (userRole === 'seller') {
                const items = await OrderItem.findByOrderId(order.id);
                const sellerProducts = await Promise.all(
                    items.map(async (item) => {
                        const product = await Product.findById(item.product_id);
                        return product && product.seller_id === userId;
                    })
                );
                
                if (!sellerProducts.some(Boolean)) {
                    return errorResponse(res, 'Không có quyền truy cập đơn hàng này', 403);
                }
            } else {
                return errorResponse(res, 'Không có quyền truy cập đơn hàng này', 403);
            }
        }

        const items = await OrderItem.findByOrderId(parseInt(id));

        return successResponse(res, items, 'Lấy danh sách items thành công');
    } catch (error) {
        console.error('Get order items error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách items', 500);
    }
};

// 9. GET /api/orders/stats - Lấy thống kê đơn hàng
const getOrderStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let stats;
        if (userRole === 'admin') {
            // Admin xem stats toàn hệ thống
            stats = await Order.getStats();
        } else if (userRole === 'seller') {
            // Seller xem stats đơn hàng chứa sản phẩm của mình
            stats = await Order.getStats(userId, null);
        } else {
            // User thường chỉ xem stats đơn hàng của mình
            stats = await Order.getStats(null, userId);
        }

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
