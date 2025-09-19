const CartService = require('../services/cartService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;

        const cartItem = await CartService.addProductToCart(userId, product_id, quantity);

        return successResponse(res, cartItem, 'Thêm sản phẩm vào giỏ hàng thành công', 201);
    } catch (error) {
        console.error('Add to cart error:', error);
        return errorResponse(res, error.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng', 500);
    }
};

// 2. GET /api/cart - Lấy danh sách sản phẩm trong giỏ hàng
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartData = await CartService.getUserCart(userId);

        return successResponse(res, cartData, 'Lấy giỏ hàng thành công');
    } catch (error) {
        console.error('Get cart error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy giỏ hàng', 500);
    }
};

// 3. PUT /api/cart/update/:id - Cập nhật số lượng sản phẩm trong giỏ
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { quantity } = req.body;

        const updatedItem = await CartService.updateCartItemQuantity(id, userId, quantity);

        return successResponse(res, updatedItem, 'Cập nhật số lượng thành công');
    } catch (error) {
        console.error('Update cart item error:', error);
        return errorResponse(res, error.message || 'Lỗi khi cập nhật số lượng', 500);
    }
};

// 4. DELETE /api/cart/remove/:id - Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await CartService.removeProductFromCart(id, userId);

        return successResponse(res, result, 'Xóa sản phẩm khỏi giỏ hàng thành công');
    } catch (error) {
        console.error('Remove from cart error:', error);
        return errorResponse(res, error.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', 500);
    }
};

// 5. DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await CartService.clearUserCart(userId);

        return successResponse(res, result, result.message);
    } catch (error) {
        console.error('Clear cart error:', error);
        return errorResponse(res, error.message || 'Lỗi khi xóa toàn bộ giỏ hàng', 500);
    }
};

// 6. GET /api/cart/validate - Kiểm tra tính khả dụng của giỏ hàng
const validateCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await CartService.validateUserCart(userId);

        return successResponse(res, result, 'Kiểm tra giỏ hàng thành công');
    } catch (error) {
        console.error('Validate cart error:', error);
        return errorResponse(res, error.message || 'Lỗi khi kiểm tra giỏ hàng', 500);
    }
};

// 7. GET /api/cart/count - Lấy số lượng items trong giỏ hàng
const getCartCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await CartService.getCartItemsCount(userId);

        return successResponse(res, result, 'Lấy số lượng items thành công');
    } catch (error) {
        console.error('Get cart count error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy số lượng items', 500);
    }
};

// 8. GET /api/cart/total - Lấy tổng tiền giỏ hàng
const getCartTotal = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await CartService.getCartTotalAmount(userId);

        return successResponse(res, result, 'Lấy tổng tiền giỏ hàng thành công');
    } catch (error) {
        console.error('Get cart total error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy tổng tiền giỏ hàng', 500);
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    validateCart,
    getCartCount,
    getCartTotal
};
