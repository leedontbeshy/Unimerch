const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Review Service - Chứa toàn bộ business logic cho review management
 * Theo nguyên tắc SRP: Service chỉ chứa business logic, không xử lý request/response
 */
class ReviewService {

    /**
     * Business Logic: Lấy danh sách tất cả reviews với filter và pagination
     * @param {Object} options - Tùy chọn lọc và phân trang
     * @returns {Object} - Danh sách reviews và thông tin phân trang
     */
    static async getAllReviews(options) {
        const {
            page = 1,
            limit = 20,
            product_id,
            user_id,
            rating
        } = options;

        const filterOptions = {
            page,
            limit,
            product_id,
            user_id,
            rating
        };

        return await Review.getAll(filterOptions);
    }

    /**
     * Business Logic: Lấy thông tin chi tiết review theo ID
     * @param {number} reviewId - ID review
     * @returns {Object} - Thông tin review
     */
    static async getReviewDetails(reviewId) {
        const review = await Review.findById(reviewId);
        
        if (!review) {
            throw new Error('Không tìm thấy review');
        }

        return review;
    }

    /**
     * Business Logic: Lấy reviews theo sản phẩm
     * @param {number} productId - ID sản phẩm
     * @param {Object} options - Tùy chọn phân trang và filter
     * @returns {Object} - Danh sách reviews của sản phẩm
     */
    static async getReviewsByProduct(productId, options) {
        const {
            page = 1,
            limit = 20,
            rating
        } = options;

        // 1. Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        const filterOptions = {
            page,
            limit,
            rating
        };

        // 2. Lấy reviews của sản phẩm
        return await Review.findByProductId(productId, filterOptions);
    }

    /**
     * Business Logic: Lấy reviews theo user
     * @param {number} userId - ID người dùng
     * @param {Object} options - Tùy chọn phân trang
     * @returns {Object} - Danh sách reviews của user
     */
    static async getReviewsByUser(userId, options) {
        const {
            page = 1,
            limit = 20
        } = options;

        const filterOptions = {
            page,
            limit
        };

        return await Review.findByUserId(userId, filterOptions);
    }

    /**
     * Business Logic: Tạo review mới
     * @param {Object} reviewData - Dữ liệu review
     * @param {number} userId - ID người dùng
     * @returns {Object} - Review mới được tạo
     */
    static async createNewReview(reviewData, userId) {
        const {
            product_id,
            rating,
            comment
        } = reviewData;

        // 1. Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(product_id);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // 2. Kiểm tra user đã review sản phẩm này chưa
        const hasReviewed = await Review.hasUserReviewedProduct(userId, product_id);
        if (hasReviewed) {
            throw new Error('Bạn đã đánh giá sản phẩm này rồi');
        }

        // 3. Kiểm tra user đã mua sản phẩm này chưa (tùy chọn - có thể bỏ qua)
        // const hasPurchased = await Order.hasUserPurchasedProduct(userId, product_id);
        // if (!hasPurchased) {
        //     throw new Error('Bạn chỉ có thể đánh giá sản phẩm đã mua');
        // }

        // 4. Chuẩn bị dữ liệu review
        const newReviewData = {
            product_id,
            user_id: userId,
            rating,
            comment: comment ? comment.trim() : null
        };

        // 5. Tạo review mới
        const newReview = await Review.create(newReviewData);
        return newReview;
    }

    /**
     * Business Logic: Cập nhật review
     * @param {number} reviewId - ID review
     * @param {Object} updateData - Dữ liệu cập nhật
     * @param {number} userId - ID người dùng hiện tại
     * @param {string} userRole - Role của người dùng
     * @returns {Object} - Review đã cập nhật
     */
    static async updateExistingReview(reviewId, updateData, userId, userRole) {
        const {
            rating,
            comment
        } = updateData;

        // 1. Kiểm tra review tồn tại
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            throw new Error('Không tìm thấy review');
        }

        // 2. Kiểm tra quyền sở hữu
        if (existingReview.user_id !== userId && userRole !== 'admin') {
            throw new Error('Bạn không có quyền cập nhật review này');
        }

        // 3. Chuẩn bị dữ liệu cập nhật
        const reviewUpdateData = {
            rating,
            comment: comment ? comment.trim() : null
        };

        // 4. Xác định userId để truyền vào model (admin có thể update bất kỳ)
        const modelUserId = userRole === 'admin' ? null : userId;

        // 5. Cập nhật review
        const updatedReview = await Review.update(reviewId, reviewUpdateData, modelUserId);
        
        if (!updatedReview) {
            throw new Error('Không thể cập nhật review. Kiểm tra quyền sở hữu.');
        }

        return updatedReview;
    }

    /**
     * Business Logic: Xóa review
     * @param {number} reviewId - ID review
     * @param {number} userId - ID người dùng hiện tại
     * @param {string} userRole - Role của người dùng
     * @returns {boolean} - Kết quả xóa
     */
    static async deleteExistingReview(reviewId, userId, userRole) {
        // 1. Kiểm tra review tồn tại
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            throw new Error('Không tìm thấy review');
        }

        // 2. Kiểm tra quyền sở hữu
        if (existingReview.user_id !== userId && userRole !== 'admin') {
            throw new Error('Bạn không có quyền xóa review này');
        }

        // 3. Xác định userId để truyền vào model (admin có thể delete bất kỳ)
        const modelUserId = userRole === 'admin' ? null : userId;

        // 4. Xóa review
        const deleted = await Review.delete(reviewId, modelUserId);
        
        if (!deleted) {
            throw new Error('Không thể xóa review. Kiểm tra quyền sở hữu.');
        }

        return true;
    }

    /**
     * Business Logic: Lấy thống kê rating của sản phẩm
     * @param {number} productId - ID sản phẩm
     * @returns {Object} - Thống kê rating
     */
    static async getProductRatingStatistics(productId) {
        // 1. Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // 2. Lấy thống kê rating
        const stats = await Review.getProductRatingStats(productId);
        
        return stats;
    }

    /**
     * Business Logic: Lấy danh sách sản phẩm có rating cao nhất
     * @param {number} limit - Số lượng sản phẩm
     * @returns {Array} - Danh sách sản phẩm có rating cao
     */
    static async getTopRatedProductsList(limit = 10) {
        const products = await Review.getTopRatedProducts(limit);
        return products;
    }

    /**
     * Business Logic: Kiểm tra user đã review sản phẩm chưa
     * @param {number} userId - ID người dùng
     * @param {number} productId - ID sản phẩm
     * @returns {Object} - Kết quả kiểm tra
     */
    static async checkUserReviewedProduct(userId, productId) {
        // 1. Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // 2. Kiểm tra trạng thái review
        const hasReviewed = await Review.hasUserReviewedProduct(userId, productId);
        
        return { has_reviewed: hasReviewed };
    }

    /**
     * Business Logic: Kiểm tra quyền sở hữu review
     * @param {number} reviewId - ID review
     * @param {number} userId - ID người dùng
     * @param {string} userRole - Role của người dùng
     * @returns {boolean} - Có quyền hay không
     */
    static async checkReviewOwnership(reviewId, userId, userRole) {
        // Admin có quyền truy cập tất cả
        if (userRole === 'admin') {
            return true;
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return false;
        }

        // User chỉ có quyền với review của mình
        return review.user_id === userId;
    }

    /**
     * Business Logic: Lấy thống kê reviews theo user
     * @param {number} userId - ID người dùng
     * @returns {Object} - Thống kê reviews
     */
    static async getReviewStatsByUser(userId) {
        // Lấy tất cả reviews của user (không phân trang)
        const allReviews = await Review.findByUserId(userId, { page: 1, limit: 999999 });
        
        const stats = {
            total: allReviews.data.length,
            rating_1: 0,
            rating_2: 0,
            rating_3: 0,
            rating_4: 0,
            rating_5: 0,
            average_rating: 0
        };

        let totalRating = 0;
        allReviews.data.forEach(review => {
            stats[`rating_${review.rating}`]++;
            totalRating += review.rating;
        });

        if (stats.total > 0) {
            stats.average_rating = parseFloat((totalRating / stats.total).toFixed(2));
        }

        return stats;
    }

    /**
     * Business Logic: Lấy reviews gần đây của user
     * @param {number} userId - ID người dùng
     * @param {number} limit - Số lượng reviews
     * @returns {Array} - Danh sách reviews gần đây
     */
    static async getRecentReviewsByUser(userId, limit = 5) {
        const options = {
            page: 1,
            limit: limit
        };

        const result = await Review.findByUserId(userId, options);
        return result.data || [];
    }

    /**
     * Business Logic: Tính toán impact của review đến product rating
     * @param {number} productId - ID sản phẩm
     * @param {number} newRating - Rating mới sẽ được thêm
     * @returns {Object} - Thông tin impact
     */
    static async calculateReviewImpact(productId, newRating) {
        const currentStats = await Review.getProductRatingStats(productId);
        
        const newTotalReviews = currentStats.total_reviews + 1;
        const newTotalRating = (currentStats.average_rating * currentStats.total_reviews) + newRating;
        const newAverageRating = newTotalRating / newTotalReviews;

        return {
            current_average: currentStats.average_rating,
            new_average: parseFloat(newAverageRating.toFixed(2)),
            rating_change: parseFloat((newAverageRating - currentStats.average_rating).toFixed(2)),
            current_total_reviews: currentStats.total_reviews,
            new_total_reviews: newTotalReviews
        };
    }

}

module.exports = ReviewService;
