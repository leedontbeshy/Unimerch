const ReviewService = require('../services/reviewService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * ReviewController - Chỉ xử lý request/response, gọi service để thực hiện business logic
 * Theo nguyên tắc SRP: Controller chỉ xử lý request/response
 */

// 1. GET /api/reviews - Lấy danh sách tất cả reviews
const getReviews = async (req, res) => {
    try {
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
            product_id: req.query.product_id || null,
            user_id: req.query.user_id || null,
            rating: req.query.rating || null
        };

        const result = await ReviewService.getAllReviews(options);
        
        return successResponse(res, result, 'Lấy danh sách reviews thành công');
    } catch (error) {
        console.error('Get reviews error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews', 500);
    }
};

// 2. GET /api/reviews/:id - Lấy thông tin chi tiết review
const getReviewById = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await ReviewService.getReviewDetails(reviewId);
        
        return successResponse(res, review, 'Lấy thông tin review thành công');
    } catch (error) {
        console.error('Get review by id error:', error);
        if (error.message === 'Không tìm thấy review') {
            return errorResponse(res, error.message, 404);
        }
        return errorResponse(res, 'Lỗi khi lấy thông tin review', 500);
    }
};

// 3. GET /api/reviews/product/:product_id - Lấy reviews theo sản phẩm
const getReviewsByProduct = async (req, res) => {
    try {
        const productId = req.params.product_id;
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
            rating: req.query.rating || null
        };

        const result = await ReviewService.getReviewsByProduct(productId, options);
        
        return successResponse(res, result, 'Lấy danh sách reviews của sản phẩm thành công');
    } catch (error) {
        console.error('Get reviews by product error:', error);
        if (error.message === 'Sản phẩm không tồn tại') {
            return errorResponse(res, error.message, 404);
        }
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews của sản phẩm', 500);
    }
};

// 4. GET /api/reviews/user/:user_id - Lấy reviews theo user (Admin only)
const getReviewsByUser = async (req, res) => {
    try {
        const userId = req.params.user_id;
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 20
        };

        const result = await ReviewService.getReviewsByUser(userId, options);
        
        return successResponse(res, result, 'Lấy danh sách reviews của người dùng thành công');
    } catch (error) {
        console.error('Get reviews by user error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews của người dùng', 500);
    }
};

// 5. GET /api/reviews/my-reviews - Lấy reviews của user hiện tại
const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 20
        };

        const result = await ReviewService.getReviewsByUser(userId, options);
        
        return successResponse(res, result, 'Lấy danh sách reviews của bạn thành công');
    } catch (error) {
        console.error('Get my reviews error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách reviews của bạn', 500);
    }
};

// 6. POST /api/reviews - Tạo review mới
const createReview = async (req, res) => {
    try {
        const reviewData = {
            product_id: req.body.product_id,
            rating: req.body.rating,
            comment: req.body.comment
        };
        const userId = req.user.id;

        const newReview = await ReviewService.createNewReview(reviewData, userId);
        
        return successResponse(res, newReview, 'Tạo review thành công', 201);
    } catch (error) {
        console.error('Create review error:', error);
        if (error.message === 'Sản phẩm không tồn tại') {
            return errorResponse(res, error.message, 404);
        }
        if (error.message === 'Bạn đã đánh giá sản phẩm này rồi') {
            return errorResponse(res, error.message, 400);
        }
        if (error.message === 'Bạn chỉ có thể đánh giá sản phẩm đã mua') {
            return errorResponse(res, error.message, 400);
        }
        return errorResponse(res, 'Lỗi khi tạo review', 500);
    }
};

// 7. PUT /api/reviews/:id - Cập nhật review
const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const updateData = {
            rating: req.body.rating,
            comment: req.body.comment
        };
        const userId = req.user.id;
        const userRole = req.user.role;

        const updatedReview = await ReviewService.updateExistingReview(reviewId, updateData, userId, userRole);
        
        return successResponse(res, updatedReview, 'Cập nhật review thành công');
    } catch (error) {
        console.error('Update review error:', error);
        if (error.message === 'Không tìm thấy review') {
            return errorResponse(res, error.message, 404);
        }
        if (error.message === 'Bạn không có quyền cập nhật review này' || 
            error.message === 'Không thể cập nhật review. Kiểm tra quyền sở hữu.') {
            return errorResponse(res, error.message, 403);
        }
        return errorResponse(res, 'Lỗi khi cập nhật review', 500);
    }
};

// 8. DELETE /api/reviews/:id - Xóa review
const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        await ReviewService.deleteExistingReview(reviewId, userId, userRole);
        
        return successResponse(res, null, 'Xóa review thành công');
    } catch (error) {
        console.error('Delete review error:', error);
        if (error.message === 'Không tìm thấy review') {
            return errorResponse(res, error.message, 404);
        }
        if (error.message === 'Bạn không có quyền xóa review này' || 
            error.message === 'Không thể xóa review. Kiểm tra quyền sở hữu.') {
            return errorResponse(res, error.message, 403);
        }
        return errorResponse(res, 'Lỗi khi xóa review', 500);
    }
};

// 9. GET /api/reviews/product/:product_id/stats - Lấy thống kê rating của sản phẩm
const getProductRatingStats = async (req, res) => {
    try {
        const productId = req.params.product_id;
        const stats = await ReviewService.getProductRatingStatistics(productId);
        
        return successResponse(res, stats, 'Lấy thống kê rating sản phẩm thành công');
    } catch (error) {
        console.error('Get product rating stats error:', error);
        if (error.message === 'Sản phẩm không tồn tại') {
            return errorResponse(res, error.message, 404);
        }
        return errorResponse(res, 'Lỗi khi lấy thống kê rating sản phẩm', 500);
    }
};

// 10. GET /api/reviews/top-products - Lấy danh sách sản phẩm có rating cao nhất
const getTopRatedProducts = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const products = await ReviewService.getTopRatedProductsList(limit);
        
        return successResponse(res, products, 'Lấy danh sách sản phẩm có rating cao nhất thành công');
    } catch (error) {
        console.error('Get top rated products error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách sản phẩm có rating cao nhất', 500);
    }
};

// 11. GET /api/reviews/check/:product_id - Kiểm tra user đã review sản phẩm chưa
const checkUserReviewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.product_id;
        
        const result = await ReviewService.checkUserReviewedProduct(userId, productId);
        
        return successResponse(res, result, 'Kiểm tra trạng thái review thành công');
    } catch (error) {
        console.error('Check user reviewed error:', error);
        if (error.message === 'Sản phẩm không tồn tại') {
            return errorResponse(res, error.message, 404);
        }
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
