const ReviewSearchModel = require('../../models/search/ReviewSearchModel');
const SearchQueryBuilder = require('../../utils/SearchQueryBuilder');

/**
 * Service xử lý tìm kiếm đánh giá
 */
class ReviewSearchService {
    /**
     * Tìm kiếm đánh giá
     * @param {Object} searchParams - Tham số tìm kiếm
     * @returns {Object} - Kết quả tìm kiếm
     */
    static async searchReviews(searchParams) {
        const {
            q = '',
            page = 1,
            limit = 20,
            rating,
            product_id,
            user_id,
            from_date,
            to_date
        } = searchParams;

        try {
            // Tính toán pagination
            const pagination = SearchQueryBuilder.calculatePagination(page, limit);

            // Xây dựng query conditions
            const queryBuilder = new SearchQueryBuilder();
            
            queryBuilder
                .addTextSearch(q, ['r.comment'])
                .addEquals('r.rating', rating)
                .addEquals('r.product_id', product_id)
                .addEquals('r.user_id', user_id)
                .addDateRange('r.created_at', from_date, to_date);

            const whereClause = queryBuilder.getWhereClauseWithPrefix();
            const queryParams = queryBuilder.getQueryParams();

            // Lấy dữ liệu
            const [reviews, total] = await Promise.all([
                ReviewSearchModel.searchReviews(
                    whereClause, 
                    queryParams, 
                    pagination.limit, 
                    pagination.offset
                ),
                ReviewSearchModel.countReviews(whereClause, queryParams)
            ]);

            // Xây dựng response
            const paginationResponse = SearchQueryBuilder.buildPaginationResponse(
                pagination.page, 
                pagination.limit, 
                total
            );

            return {
                reviews,
                pagination: paginationResponse
            };
        } catch (error) {
            console.error('Review search error:', error);
            throw new Error('Lỗi khi tìm kiếm đánh giá');
        }
    }

    /**
     * Lấy thống kê đánh giá theo rating
     * @param {number} productId - ID sản phẩm (null nếu tất cả)
     * @returns {Array} - Thống kê
     */
    static async getReviewStatsByRating(productId = null) {
        try {
            return await ReviewSearchModel.getReviewStatsByRating(productId);
        } catch (error) {
            console.error('Get review stats by rating error:', error);
            throw new Error('Lỗi khi lấy thống kê đánh giá');
        }
    }

    /**
     * Lấy đánh giá gần đây nhất
     * @param {number} limit - Số lượng đánh giá
     * @returns {Array} - Danh sách đánh giá
     */
    static async getRecentReviews(limit = 10) {
        try {
            return await ReviewSearchModel.getRecentReviews(limit);
        } catch (error) {
            console.error('Get recent reviews error:', error);
            return [];
        }
    }

    /**
     * Lấy top sản phẩm có rating cao nhất
     * @param {number} limit - Số lượng sản phẩm
     * @returns {Array} - Danh sách sản phẩm
     */
    static async getTopRatedProducts(limit = 10) {
        try {
            return await ReviewSearchModel.getTopRatedProducts(limit);
        } catch (error) {
            console.error('Get top rated products error:', error);
            return [];
        }
    }

    /**
     * Lấy filters cho review search
     * @returns {Object} - Review filters
     */
    static getReviewFilters() {
        return {
            ratings: [
                { value: 5, label: '5 sao' },
                { value: 4, label: '4 sao' },
                { value: 3, label: '3 sao' },
                { value: 2, label: '2 sao' },
                { value: 1, label: '1 sao' }
            ]
        };
    }
}

module.exports = ReviewSearchService;
