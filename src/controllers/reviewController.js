const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/response');

// 1. GET /api/reviews - Lấy danh sách tất cả reviews
const getReviews = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            product_id,
            user_id,
            rating
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            product_id: product_id ? parseInt(product_id) : null,
            user_id: user_id ? parseInt(user_id) : null,
            rating: rating ? parseInt(rating) : null
        };

        const result = await Review.getAll(options);
        
        return successResponse(res, result, 'Lấy danh sách reviews thành công');
    } catch (error) {
        console.error('Get reviews error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews', 500);
    }
};

// 2. GET /api/reviews/:id - Lấy thông tin chi tiết review
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return errorResponse(res, 'ID review không hợp lệ', 400);
        }

        const review = await Review.findById(parseInt(id));
        
        if (!review) {
            return errorResponse(res, 'Không tìm thấy review', 404);
        }

        return successResponse(res, review, 'Lấy thông tin review thành công');
    } catch (error) {
        console.error('Get review by id error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin review', 500);
    }
};

// 3. GET /api/reviews/product/:product_id - Lấy reviews theo sản phẩm
const getReviewsByProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const {
            page = 1,
            limit = 20,
            rating
        } = req.query;

        if (!product_id || isNaN(product_id)) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(parseInt(product_id));
        if (!product) {
            return errorResponse(res, 'Sản phẩm không tồn tại', 404);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            rating: rating ? parseInt(rating) : null
        };

        const result = await Review.findByProductId(parseInt(product_id), options);
        
        return successResponse(res, result, 'Lấy danh sách reviews của sản phẩm thành công');
    } catch (error) {
        console.error('Get reviews by product error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews của sản phẩm', 500);
    }
};

// 4. GET /api/reviews/user/:user_id - Lấy reviews theo user (Admin only)
const getReviewsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const {
            page = 1,
            limit = 20
        } = req.query;

        if (!user_id || isNaN(user_id)) {
            return errorResponse(res, 'ID người dùng không hợp lệ', 400);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await Review.findByUserId(parseInt(user_id), options);
        
        return successResponse(res, result, 'Lấy danh sách reviews của người dùng thành công');
    } catch (error) {
        console.error('Get reviews by user error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews của người dùng', 500);
    }
};

// 5. GET /api/reviews/my-reviews - Lấy reviews của user hiện tại
const getMyReviews = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await Review.findByUserId(req.user.id, options);
        
        return successResponse(res, result, 'Lấy danh sách reviews của bạn thành công');
    } catch (error) {
        console.error('Get my reviews error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews của bạn', 500);
    }
};

// 6. POST /api/reviews - Tạo review mới
const createReview = async (req, res) => {
    try {
        const {
            product_id,
            rating,
            comment
        } = req.body;

        // Validation
        if (!product_id || !rating) {
            return errorResponse(res, 'ID sản phẩm và rating là bắt buộc', 400);
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return errorResponse(res, 'Rating phải là số nguyên từ 1 đến 5', 400);
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(parseInt(product_id));
        if (!product) {
            return errorResponse(res, 'Sản phẩm không tồn tại', 404);
        }

        // Kiểm tra user đã review sản phẩm này chưa
        const hasReviewed = await Review.hasUserReviewedProduct(req.user.id, parseInt(product_id));
        if (hasReviewed) {
            return errorResponse(res, 'Bạn đã đánh giá sản phẩm này rồi', 400);
        }

        // Kiểm tra user đã mua sản phẩm này chưa (optional - có thể bỏ qua nếu muốn cho phép review không cần mua)
        // const hasPurchased = await Order.hasUserPurchasedProduct(req.user.id, parseInt(product_id));
        // if (!hasPurchased) {
        //     return errorResponse(res, 'Bạn chỉ có thể đánh giá sản phẩm đã mua', 400);
        // }

        const reviewData = {
            product_id: parseInt(product_id),
            user_id: req.user.id,
            rating: parseInt(rating),
            comment: comment ? comment.trim() : null
        };

        const newReview = await Review.create(reviewData);
        
        return successResponse(res, newReview, 'Tạo review thành công', 201);
    } catch (error) {
        console.error('Create review error:', error);
        return errorResponse(res, 'Lỗi khi tạo review', 500);
    }
};

// 7. PUT /api/reviews/:id - Cập nhật review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            rating,
            comment
        } = req.body;

        if (!id || isNaN(id)) {
            return errorResponse(res, 'ID review không hợp lệ', 400);
        }

        // Validation
        if (!rating) {
            return errorResponse(res, 'Rating là bắt buộc', 400);
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return errorResponse(res, 'Rating phải là số nguyên từ 1 đến 5', 400);
        }

        // Kiểm tra review tồn tại
        const existingReview = await Review.findById(parseInt(id));
        if (!existingReview) {
            return errorResponse(res, 'Không tìm thấy review', 404);
        }

        // Kiểm tra quyền sở hữu (chỉ user tạo review mới được cập nhật)
        if (existingReview.user_id !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(res, 'Bạn không có quyền cập nhật review này', 403);
        }

        const reviewData = {
            rating: parseInt(rating),
            comment: comment ? comment.trim() : null
        };

        // Nếu không phải admin, truyền user_id để giới hạn quyền
        const userId = req.user.role === 'admin' ? null : req.user.id;
        
        const updatedReview = await Review.update(parseInt(id), reviewData, userId);
        
        if (!updatedReview) {
            return errorResponse(res, 'Không thể cập nhật review. Kiểm tra quyền sở hữu.', 403);
        }

        return successResponse(res, updatedReview, 'Cập nhật review thành công');
    } catch (error) {
        console.error('Update review error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật review', 500);
    }
};

// 8. DELETE /api/reviews/:id - Xóa review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return errorResponse(res, 'ID review không hợp lệ', 400);
        }

        // Kiểm tra review tồn tại
        const existingReview = await Review.findById(parseInt(id));
        if (!existingReview) {
            return errorResponse(res, 'Không tìm thấy review', 404);
        }

        // Kiểm tra quyền sở hữu (chỉ user tạo review hoặc admin mới được xóa)
        if (existingReview.user_id !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(res, 'Bạn không có quyền xóa review này', 403);
        }

        // Nếu không phải admin, truyền user_id để giới hạn quyền
        const userId = req.user.role === 'admin' ? null : req.user.id;
        
        const deleted = await Review.delete(parseInt(id), userId);
        
        if (!deleted) {
            return errorResponse(res, 'Không thể xóa review. Kiểm tra quyền sở hữu.', 403);
        }

        return successResponse(res, null, 'Xóa review thành công');
    } catch (error) {
        console.error('Delete review error:', error);
        return errorResponse(res, 'Lỗi khi xóa review', 500);
    }
};

// 9. GET /api/reviews/product/:product_id/stats - Lấy thống kê rating của sản phẩm
const getProductRatingStats = async (req, res) => {
    try {
        const { product_id } = req.params;

        if (!product_id || isNaN(product_id)) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(parseInt(product_id));
        if (!product) {
            return errorResponse(res, 'Sản phẩm không tồn tại', 404);
        }

        const stats = await Review.getProductRatingStats(parseInt(product_id));
        
        return successResponse(res, stats, 'Lấy thống kê rating sản phẩm thành công');
    } catch (error) {
        console.error('Get product rating stats error:', error);
        return errorResponse(res, 'Lỗi khi lấy thống kê rating sản phẩm', 500);
    }
};

// 10. GET /api/reviews/top-products - Lấy danh sách sản phẩm có rating cao nhất
const getTopRatedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const products = await Review.getTopRatedProducts(parseInt(limit));
        
        return successResponse(res, products, 'Lấy danh sách sản phẩm có rating cao nhất thành công');
    } catch (error) {
        console.error('Get top rated products error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách sản phẩm có rating cao nhất', 500);
    }
};

// 11. GET /api/reviews/check/:product_id - Kiểm tra user đã review sản phẩm chưa
const checkUserReviewed = async (req, res) => {
    try {
        const { product_id } = req.params;

        if (!product_id || isNaN(product_id)) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(parseInt(product_id));
        if (!product) {
            return errorResponse(res, 'Sản phẩm không tồn tại', 404);
        }

        const hasReviewed = await Review.hasUserReviewedProduct(req.user.id, parseInt(product_id));
        
        return successResponse(res, { has_reviewed: hasReviewed }, 'Kiểm tra trạng thái review thành công');
    } catch (error) {
        console.error('Check user reviewed error:', error);
        return errorResponse(res, 'Lỗi khi kiểm tra trạng thái review', 500);
    }
};

module.exports = {
    getReviews,
    getReviewById,
    getReviewsByProduct,
    getReviewsByUser,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview,
    getProductRatingStats,
    getTopRatedProducts,
    checkUserReviewed
};
