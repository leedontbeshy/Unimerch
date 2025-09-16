const ShoppingCart = require('../models/ShoppingCart');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/response');

// 1. POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body;

        // Validation
        if (!product_id || isNaN(parseInt(product_id))) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        if (!quantity || quantity <= 0 || isNaN(parseInt(quantity))) {
            return errorResponse(res, 'Số lượng phải là số dương', 400);
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(parseInt(product_id));
        if (!product) {
            return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
        }

        // Kiểm tra trạng thái sản phẩm
        if (product.status !== 'available') {
            return errorResponse(res, 'Sản phẩm không khả dụng', 400);
        }

        // Kiểm tra số lượng tồn kho
        if (product.quantity < parseInt(quantity)) {
            return errorResponse(res, 'Số lượng sản phẩm không đủ', 400);
        }

        // Thêm vào giỏ hàng
        const cartItem = await ShoppingCart.addToCart(userId, parseInt(product_id), parseInt(quantity));

        // Lấy thông tin chi tiết cart item
        const detailedCartItem = await ShoppingCart.findById(cartItem.id, userId);

        return successResponse(res, detailedCartItem, 'Thêm sản phẩm vào giỏ hàng thành công', 201);
    } catch (error) {
        console.error('Add to cart error:', error);
        return errorResponse(res, 'Lỗi khi thêm sản phẩm vào giỏ hàng', 500);
    }
};

// 2. GET /api/cart - Lấy danh sách sản phẩm trong giỏ hàng
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartItems = await ShoppingCart.getCartByUserId(userId);
        
        // Tính tổng tiền và số lượng
        const totalItems = await ShoppingCart.getCartItemCount(userId);
        const totalAmount = await ShoppingCart.getCartTotal(userId);

        const result = {
            items: cartItems,
            summary: {
                total_items: totalItems,
                total_amount: totalAmount,
                item_count: cartItems.length
            }
        };

        return successResponse(res, result, 'Lấy giỏ hàng thành công');
    } catch (error) {
        console.error('Get cart error:', error);
        return errorResponse(res, 'Lỗi khi lấy giỏ hàng', 500);
    }
};

// 3. PUT /api/cart/update/:id - Cập nhật số lượng sản phẩm trong giỏ
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { quantity } = req.body;

        // Validation
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID cart item không hợp lệ', 400);
        }

        if (!quantity || quantity <= 0 || isNaN(parseInt(quantity))) {
            return errorResponse(res, 'Số lượng phải là số dương', 400);
        }

        // Kiểm tra cart item có tồn tại không
        const cartItem = await ShoppingCart.findById(parseInt(id), userId);
        if (!cartItem) {
            return errorResponse(res, 'Không tìm thấy sản phẩm trong giỏ hàng', 404);
        }

        // Kiểm tra số lượng tồn kho
        const product = await Product.findById(cartItem.product_id);
        if (!product) {
            return errorResponse(res, 'Sản phẩm không tồn tại', 404);
        }

        if (product.status !== 'available') {
            return errorResponse(res, 'Sản phẩm không khả dụng', 400);
        }

        if (product.quantity < parseInt(quantity)) {
            return errorResponse(res, `Chỉ còn ${product.quantity} sản phẩm trong kho`, 400);
        }

        // Cập nhật số lượng
        const updatedItem = await ShoppingCart.updateQuantity(parseInt(id), userId, parseInt(quantity));
        
        if (!updatedItem) {
            return errorResponse(res, 'Không thể cập nhật số lượng', 400);
        }

        // Lấy thông tin chi tiết
        const detailedItem = await ShoppingCart.findById(updatedItem.id, userId);

        return successResponse(res, detailedItem, 'Cập nhật số lượng thành công');
    } catch (error) {
        console.error('Update cart item error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật số lượng', 500);
    }
};

// 4. DELETE /api/cart/remove/:id - Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validation
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID cart item không hợp lệ', 400);
        }

        // Kiểm tra cart item có tồn tại không
        const cartItem = await ShoppingCart.findById(parseInt(id), userId);
        if (!cartItem) {
            return errorResponse(res, 'Không tìm thấy sản phẩm trong giỏ hàng', 404);
        }

        // Xóa khỏi giỏ hàng
        const removed = await ShoppingCart.removeFromCart(parseInt(id), userId);
        
        if (!removed) {
            return errorResponse(res, 'Không thể xóa sản phẩm khỏi giỏ hàng', 400);
        }

        return successResponse(res, { removed_item_id: parseInt(id) }, 'Xóa sản phẩm khỏi giỏ hàng thành công');
    } catch (error) {
        console.error('Remove from cart error:', error);
        return errorResponse(res, 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', 500);
    }
};

// 5. DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const removedCount = await ShoppingCart.clearCart(userId);

        return successResponse(res, { 
            removed_items: removedCount 
        }, `Đã xóa ${removedCount} sản phẩm khỏi giỏ hàng`);
    } catch (error) {
        console.error('Clear cart error:', error);
        return errorResponse(res, 'Lỗi khi xóa toàn bộ giỏ hàng', 500);
    }
};

// 6. GET /api/cart/validate - Kiểm tra tính khả dụng của giỏ hàng
const validateCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const validationResults = await ShoppingCart.validateCartItems(userId);
        
        const validItems = validationResults.filter(item => item.validation_status === 'valid');
        const invalidItems = validationResults.filter(item => item.validation_status !== 'valid');

        const result = {
            valid_items: validItems,
            invalid_items: invalidItems,
            is_valid: invalidItems.length === 0,
            summary: {
                total_items: validationResults.length,
                valid_count: validItems.length,
                invalid_count: invalidItems.length
            }
        };

        return successResponse(res, result, 'Kiểm tra giỏ hàng thành công');
    } catch (error) {
        console.error('Validate cart error:', error);
        return errorResponse(res, 'Lỗi khi kiểm tra giỏ hàng', 500);
    }
};

// 7. GET /api/cart/count - Lấy số lượng items trong giỏ hàng
const getCartCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalItems = await ShoppingCart.getCartItemCount(userId);
        const itemCount = (await ShoppingCart.getCartByUserId(userId)).length;

        const result = {
            total_items: totalItems,
            unique_products: itemCount
        };

        return successResponse(res, result, 'Lấy số lượng items thành công');
    } catch (error) {
        console.error('Get cart count error:', error);
        return errorResponse(res, 'Lỗi khi lấy số lượng items', 500);
    }
};

// 8. GET /api/cart/total - Lấy tổng tiền giỏ hàng
const getCartTotal = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalAmount = await ShoppingCart.getCartTotal(userId);

        const result = {
            total_amount: totalAmount,
            currency: 'VND'
        };

        return successResponse(res, result, 'Lấy tổng tiền giỏ hàng thành công');
    } catch (error) {
        console.error('Get cart total error:', error);
        return errorResponse(res, 'Lỗi khi lấy tổng tiền giỏ hàng', 500);
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
