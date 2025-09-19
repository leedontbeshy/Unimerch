const Product = require('../../models/Product');
const OrderItem = require('../../models/OrderItem');

class OrderHelper {
    /**
     * Helper: Cập nhật số lượng sản phẩm
     */
    static async updateProductQuantities(items, action) {
        for (const item of items) {
            const quantity = action === 'increase' ? item.quantity : -item.quantity;
            await Product.updateQuantity(item.product_id, quantity);
        }
    }
    
    /**
     * Helper: Kiểm tra quyền truy cập order
     */
    static async checkOrderAccess(order, userId, userRole) {
        if (userRole === 'admin') {
            return true;
        }
        
        if (order.user_id === userId) {
            return true;
        }
        
        if (userRole === 'seller') {
            const items = await OrderItem.findByOrderId(order.id);
            const sellerProducts = await Promise.all(
                items.map(async (item) => {
                    const product = await Product.findById(item.product_id);
                    return product && product.seller_id === userId;
                })
            );
            
            if (sellerProducts.some(Boolean)) {
                return true;
            }
        }
        
        throw new Error('Không có quyền truy cập đơn hàng này');
    }
    
    /**
     * Helper: Kiểm tra quyền cập nhật trạng thái
     */
    static async checkStatusUpdatePermission(order, newStatus, userId, userRole) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Trạng thái đơn hàng không hợp lệ');
        }

        if (userRole === 'user') {
            // User chỉ có thể hủy đơn hàng khi status = 'pending'
            if (newStatus !== 'cancelled' || order.status !== 'pending') {
                throw new Error('Không có quyền cập nhật trạng thái này');
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
                throw new Error('Không có quyền cập nhật đơn hàng này');
            }
        }
        // Admin có thể cập nhật mọi trạng thái
    }
}

module.exports = OrderHelper;
