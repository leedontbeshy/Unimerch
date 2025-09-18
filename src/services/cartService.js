const ShoppingCart = require('../models/ShoppingCart');
const Product = require('../models/Product');

/**
 * Cart Service - Chứa toàn bộ business logic cho shopping cart
 * Theo nguyên tắc SRP: Service chỉ chứa business logic, không xử lý request/response
 */
class CartService {

    /**
     * Business Logic: Thêm sản phẩm vào giỏ hàng
     * @param {number} userId - ID của user
     * @param {number} productId - ID của sản phẩm
     * @param {number} quantity - Số lượng cần thêm
     * @returns {Object} - Thông tin cart item đã được thêm
     */
    static async addProductToCart(userId, productId, quantity) {
        // 1. Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // 2. Kiểm tra trạng thái sản phẩm
        if (product.status !== 'available') {
            throw new Error('Sản phẩm không khả dụng');
        }

        // 3. Kiểm tra số lượng tồn kho
        if (product.quantity < quantity) {
            throw new Error(`Số lượng sản phẩm không đủ. Chỉ còn ${product.quantity} sản phẩm trong kho`);
        }

        // 4. Kiểm tra xem sản phẩm đã có trong giỏ chưa
        const existingCartItems = await ShoppingCart.getCartByUserId(userId);
        const existingItem = existingCartItems.find(item => item.product_id === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            // Kiểm tra tổng số lượng sau khi cộng
            if (newQuantity > product.quantity) {
                throw new Error(`Tổng số lượng sẽ vượt quá tồn kho. Bạn đã có ${existingItem.quantity} sản phẩm trong giỏ, chỉ có thể thêm tối đa ${product.quantity - existingItem.quantity} sản phẩm nữa`);
            }
        }

        // 5. Thêm vào giỏ hàng
        const cartItem = await ShoppingCart.addToCart(userId, productId, quantity);

        // 6. Lấy thông tin chi tiết cart item để trả về
        const detailedCartItem = await ShoppingCart.findById(cartItem.id, userId);
        
        return detailedCartItem;
    }

    /**
     * Business Logic: Lấy giỏ hàng của user với tính toán tổng kết
     * @param {number} userId - ID của user
     * @returns {Object} - Thông tin giỏ hàng và tổng kết
     */
    static async getUserCart(userId) {
        // 1. Lấy danh sách items trong giỏ
        const cartItems = await ShoppingCart.getCartByUserId(userId);
        
        // 2. Tính tổng tiền và số lượng
        const totalItems = await ShoppingCart.getCartItemCount(userId);
        const totalAmount = await ShoppingCart.getCartTotal(userId);

        // 3. Chuẩn bị dữ liệu trả về
        const result = {
            items: cartItems.map(item => ({
                ...item,
                subtotal: item.quantity * (item.product_discount_price || item.product_price)
            })),
            summary: {
                total_items: totalItems,
                total_amount: totalAmount,
                item_count: cartItems.length
            }
        };

        return result;
    }

    /**
     * Business Logic: Cập nhật số lượng sản phẩm trong giỏ hàng
     * @param {number} cartItemId - ID của cart item
     * @param {number} userId - ID của user
     * @param {number} quantity - Số lượng mới
     * @returns {Object} - Thông tin cart item đã được cập nhật
     */
    static async updateCartItemQuantity(cartItemId, userId, quantity) {
        // 1. Kiểm tra cart item có tồn tại không
        const cartItem = await ShoppingCart.findById(cartItemId, userId);
        if (!cartItem) {
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
        }

        // 2. Kiểm tra sản phẩm còn tồn tại không
        const product = await Product.findById(cartItem.product_id);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // 3. Kiểm tra trạng thái sản phẩm
        if (product.status !== 'available') {
            throw new Error('Sản phẩm không khả dụng');
        }

        // 4. Kiểm tra số lượng tồn kho
        if (product.quantity < quantity) {
            throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
        }

        // 5. Cập nhật số lượng
        const updatedItem = await ShoppingCart.updateQuantity(cartItemId, userId, quantity);
        
        if (!updatedItem) {
            throw new Error('Không thể cập nhật số lượng');
        }

        // 6. Lấy thông tin chi tiết để trả về
        const detailedItem = await ShoppingCart.findById(updatedItem.id, userId);

        return detailedItem;
    }

    /**
     * Business Logic: Xóa sản phẩm khỏi giỏ hàng
     * @param {number} cartItemId - ID của cart item
     * @param {number} userId - ID của user
     * @returns {boolean} - True nếu xóa thành công
     */
    static async removeProductFromCart(cartItemId, userId) {
        // 1. Kiểm tra cart item có tồn tại không
        const cartItem = await ShoppingCart.findById(cartItemId, userId);
        if (!cartItem) {
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
        }

        // 2. Xóa khỏi giỏ hàng
        const removed = await ShoppingCart.removeFromCart(cartItemId, userId);
        
        if (!removed) {
            throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng');
        }

        return { removed_item_id: cartItemId };
    }

    /**
     * Business Logic: Xóa toàn bộ giỏ hàng
     * @param {number} userId - ID của user
     * @returns {Object} - Thông tin số lượng items đã xóa
     */
    static async clearUserCart(userId) {
        const removedCount = await ShoppingCart.clearCart(userId);
        
        return {
            removed_items: removedCount,
            message: `Đã xóa ${removedCount} sản phẩm khỏi giỏ hàng`
        };
    }

    /**
     * Business Logic: Kiểm tra tính khả dụng của giỏ hàng
     * @param {number} userId - ID của user
     * @returns {Object} - Kết quả kiểm tra với danh sách valid/invalid items
     */
    static async validateUserCart(userId) {
        const validationResults = await ShoppingCart.validateCartItems(userId);
        
        const validItems = validationResults.filter(item => item.validation_status === 'valid');
        const invalidItems = validationResults.filter(item => item.validation_status !== 'valid');

        // Thêm thông tin lỗi chi tiết cho invalid items
        const detailedInvalidItems = invalidItems.map(item => ({
            ...item,
            error_message: this.getValidationErrorMessage(item.validation_status, item)
        }));

        const result = {
            valid_items: validItems,
            invalid_items: detailedInvalidItems,
            is_valid: invalidItems.length === 0,
            summary: {
                total_items: validationResults.length,
                valid_count: validItems.length,
                invalid_count: invalidItems.length
            }
        };

        return result;
    }

    /**
     * Business Logic: Lấy số lượng items trong giỏ hàng
     * @param {number} userId - ID của user
     * @returns {Object} - Thống kê số lượng items
     */
    static async getCartItemsCount(userId) {
        const totalItems = await ShoppingCart.getCartItemCount(userId);
        const cartItems = await ShoppingCart.getCartByUserId(userId);

        return {
            total_items: totalItems,      // Tổng số lượng (có tính quantity của từng sản phẩm)
            unique_products: cartItems.length  // Số sản phẩm khác nhau
        };
    }

    /**
     * Business Logic: Lấy tổng tiền giỏ hàng
     * @param {number} userId - ID của user
     * @returns {Object} - Tổng tiền và currency
     */
    static async getCartTotalAmount(userId) {
        const totalAmount = await ShoppingCart.getCartTotal(userId);

        return {
            total_amount: totalAmount,
            currency: 'VND'
        };
    }

    /**
     * Helper method: Lấy thông báo lỗi chi tiết cho validation
     * @param {string} validationStatus - Trạng thái validation
     * @param {Object} item - Cart item
     * @returns {string} - Thông báo lỗi
     */
    static getValidationErrorMessage(validationStatus, item) {
        switch (validationStatus) {
            case 'unavailable':
                return 'Sản phẩm không còn khả dụng';
            case 'insufficient_stock':
                return `Số lượng trong kho không đủ. Bạn muốn mua ${item.quantity} nhưng chỉ còn ${item.available_quantity} sản phẩm`;
            default:
                return 'Sản phẩm có vấn đề không xác định';
        }
    }

    /**
     * Business Logic: Chuẩn bị giỏ hàng cho việc checkout
     * @param {number} userId - ID của user
     * @returns {Object} - Thông tin giỏ hàng đã validate để checkout
     */
    static async prepareCartForCheckout(userId) {
        // 1. Validate giỏ hàng
        const validation = await this.validateUserCart(userId);
        
        if (!validation.is_valid) {
            throw new Error('Giỏ hàng có sản phẩm không hợp lệ. Vui lòng kiểm tra lại');
        }

        // 2. Lấy thông tin items hợp lệ để tạo order
        const orderItems = await ShoppingCart.convertToOrderItems(userId);
        
        if (orderItems.length === 0) {
            throw new Error('Giỏ hàng trống hoặc không có sản phẩm hợp lệ');
        }

        // 3. Tính tổng tiền
        const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        return {
            items: orderItems,
            total_amount: totalAmount,
            item_count: orderItems.length,
            total_quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    /**
     * Business Logic: Xóa các sản phẩm đã được order khỏi giỏ hàng
     * @param {number} userId - ID của user
     * @param {Array} productIds - Mảng IDs của products đã được order
     * @returns {number} - Số lượng items đã được xóa
     */
    static async removeOrderedItemsFromCart(userId, productIds) {
        if (!productIds || productIds.length === 0) {
            return 0;
        }

        const removedCount = await ShoppingCart.removeOrderedItems(userId, productIds);
        return removedCount;
    }
}

module.exports = CartService;
