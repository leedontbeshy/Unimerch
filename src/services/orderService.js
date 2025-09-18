const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ShoppingCart = require('../models/ShoppingCart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { pool } = require('../../config/database');
const OrderHelper = require('./order/orderHelper');

class OrderService {
    
    /**
     * Business Logic: Tạo order từ giỏ hàng
     */
    static async createOrderFromCart(userId, orderData) {
        const { shipping_address, payment_method } = orderData;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // 1. Validate cart items
            const cartItems = await ShoppingCart.validateCartItems(userId);
            if (cartItems.length === 0) {
                throw new Error('Giỏ hàng trống');
            }
            
            // 2. Check availability
            const invalidItems = cartItems.filter(item => item.validation_status !== 'valid');
            if (invalidItems.length > 0) {
                const invalidNames = invalidItems.map(item => item.product_name).join(', ');
                throw new Error(`Một số sản phẩm không khả dụng hoặc hết hàng: ${invalidNames}`);
            }
            
            // 3. Calculate total & create order
            const orderItems = await ShoppingCart.convertToOrderItems(userId);
            const totalAmount = await ShoppingCart.getCartTotal(userId);
            
            const order = await Order.create({
                user_id: userId,
                total_amount: totalAmount,
                shipping_address: shipping_address.trim(),
                payment_method: payment_method.trim()
            });
            
            // 4. Create order items
            const createdItems = await OrderItem.createMany(
                orderItems.map(item => ({
                    ...item,
                    order_id: order.id
                }))
            );
            
            // 5. Update product quantities
            await OrderHelper.updateProductQuantities(orderItems, 'decrease');
            
            // 6. Clear cart
            const productIds = orderItems.map(item => item.product_id);
            await ShoppingCart.removeOrderedItems(userId, productIds);
            
            await client.query('COMMIT');
            
            return {
                ...order,
                items: createdItems
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    /**
     * Business Logic: Tạo order trực tiếp từ items
     */
    static async createOrderDirect(userId, orderData) {
        const { items, shipping_address, payment_method } = orderData;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            let totalAmount = 0;
            const orderItems = [];
            
            // 1. Validate và tính tổng tiền
            for (const item of items) {
                const product = await Product.findById(item.product_id);
                if (!product) {
                    throw new Error(`Không tìm thấy sản phẩm ID: ${item.product_id}`);
                }
                
                if (product.status !== 'available') {
                    throw new Error(`Sản phẩm "${product.name}" không khả dụng`);
                }
                
                if (product.quantity < item.quantity) {
                    throw new Error(`Sản phẩm "${product.name}" không đủ số lượng (còn ${product.quantity})`);
                }
                
                const price = product.discount_price || product.price;
                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: price
                });
                
                totalAmount += price * item.quantity;
            }
            
            // 2. Create order
            const order = await Order.create({
                user_id: userId,
                total_amount: totalAmount,
                shipping_address: shipping_address.trim(),
                payment_method: payment_method.trim()
            });
            
            // 3. Create order items
            const createdItems = await OrderItem.createMany(
                orderItems.map(item => ({
                    ...item,
                    order_id: order.id
                }))
            );
            
            // 4. Update product quantities
            await OrderHelper.updateProductQuantities(orderItems, 'decrease');
            
            await client.query('COMMIT');
            
            return {
                ...order,
                items: createdItems
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    /**
     * Business Logic: Lấy danh sách orders với pagination
     */
    static async getUserOrders(userId, queryParams) {
        const { page = 1, limit = 10, status } = queryParams;
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

        return {
            orders,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(totalOrders / parseInt(limit)),
                total_orders: totalOrders,
                has_next: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
                has_prev: parseInt(page) > 1
            }
        };
    }
    
    /**
     * Business Logic: Lấy chi tiết order với permission check
     */
    static async getOrderDetails(orderId, userId, userRole) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Kiểm tra quyền truy cập
        await OrderHelper.checkOrderAccess(order, userId, userRole);

        // Lấy items và payments
        order.items = await OrderItem.findByOrderId(order.id);
        order.payments = await Payment.findByOrderId(order.id);

        return order;
    }
    
    /**
     * Business Logic: Cập nhật trạng thái order
     */
    static async updateOrderStatus(orderId, newStatus, userId, userRole) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Kiểm tra quyền cập nhật
        await OrderHelper.checkStatusUpdatePermission(order, newStatus, userId, userRole);

        // Cập nhật trạng thái
        const updatedOrder = await Order.updateStatus(orderId, newStatus);
        if (!updatedOrder) {
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
        }

        return updatedOrder;
    }
    
    /**
     * Business Logic: Hủy order
     */
    static async cancelOrder(orderId, userId, userRole) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Kiểm tra quyền hủy
        if (userRole !== 'admin' && order.user_id !== userId) {
            throw new Error('Không có quyền hủy đơn hàng này');
        }

        // Chỉ có thể hủy đơn hàng khi status = 'pending'
        if (order.status !== 'pending') {
            throw new Error('Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý');
        }

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Hoàn trả số lượng sản phẩm
            const items = await OrderItem.findByOrderId(order.id);
            await OrderHelper.updateProductQuantities(items, 'increase');
            
            // Cập nhật trạng thái thành cancelled
            const cancelledOrder = await Order.updateStatus(orderId, 'cancelled');
            
            await client.query('COMMIT');
            
            return cancelledOrder;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    /**
     * Business Logic: Lấy orders cho admin
     */
    static async getAllOrdersForAdmin(queryParams) {
        const { page = 1, limit = 20, status, user_id } = queryParams;
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

        return {
            orders,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(totalOrders / parseInt(limit)),
                total_orders: totalOrders,
                has_next: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
                has_prev: parseInt(page) > 1
            }
        };
    }
    
    /**
     * Business Logic: Lấy orders cho seller
     */
    static async getSellerOrders(sellerId, queryParams) {
        const { page = 1, limit = 20, status } = queryParams;
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

        return {
            orders,
            pagination: {
                current_page: parseInt(page),
                has_next: orders.length === parseInt(limit),
                has_prev: parseInt(page) > 1
            }
        };
    }
    
    /**
     * Business Logic: Lấy thống kê orders
     */
    static async getOrderStatistics(userId, userRole) {
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

        return stats;
    }
    
}

module.exports = OrderService;
