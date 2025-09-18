const OrderSearchModel = require('../../models/search/OrderSearchModel');
const SearchQueryBuilder = require('../../utils/SearchQueryBuilder');

/**
 * Service xử lý tìm kiếm đơn hàng
 */
class OrderSearchService {
    /**
     * Tìm kiếm đơn hàng
     * @param {Object} searchParams - Tham số tìm kiếm
     * @param {number} currentUserId - ID người dùng hiện tại
     * @param {string} userRole - Role của người dùng
     * @returns {Object} - Kết quả tìm kiếm
     */
    static async searchOrders(searchParams, currentUserId, userRole) {
        const {
            page = 1,
            limit = 20,
            status,
            from_date,
            to_date,
            user_id,
            min_amount,
            max_amount
        } = searchParams;

        try {
            // Tính toán pagination
            const pagination = SearchQueryBuilder.calculatePagination(page, limit);

            // Xây dựng query conditions
            const queryBuilder = new SearchQueryBuilder();

            // Phân quyền: User chỉ thấy đơn hàng của mình
            if (userRole === 'user') {
                queryBuilder.addEquals('o.user_id', currentUserId);
            } else if (userRole === 'admin' && user_id) {
                queryBuilder.addEquals('o.user_id', user_id);
            }

            queryBuilder
                .addEquals('o.status', status)
                .addDateRange('o.created_at', from_date, to_date)
                .addRange('o.total_amount', min_amount, max_amount);

            const whereClause = queryBuilder.getWhereClauseWithPrefix();
            const queryParams = queryBuilder.getQueryParams();

            // Lấy dữ liệu
            const [orders, total] = await Promise.all([
                OrderSearchModel.searchOrders(
                    whereClause, 
                    queryParams, 
                    pagination.limit, 
                    pagination.offset
                ),
                OrderSearchModel.countOrders(whereClause, queryParams)
            ]);

            // Xây dựng response
            const paginationResponse = SearchQueryBuilder.buildPaginationResponse(
                pagination.page, 
                pagination.limit, 
                total
            );

            return {
                orders,
                pagination: paginationResponse
            };
        } catch (error) {
            console.error('Order search error:', error);
            throw new Error('Lỗi khi tìm kiếm đơn hàng');
        }
    }

    /**
     * Lấy thống kê đơn hàng theo status
     * @param {number} userId - ID người dùng (null nếu admin)
     * @returns {Array} - Thống kê
     */
    static async getOrderStatsByStatus(userId = null) {
        try {
            return await OrderSearchModel.getOrderStatsByStatus(userId);
        } catch (error) {
            console.error('Get order stats by status error:', error);
            throw new Error('Lỗi khi lấy thống kê đơn hàng');
        }
    }

    /**
     * Lấy filters cho order search
     * @param {number} userId - ID người dùng (null nếu admin)
     * @returns {Object} - Order filters
     */
    static async getOrderFilters(userId = null) {
        try {
            const amountRange = await OrderSearchModel.getOrderAmountRange(userId);

            return {
                statuses: [
                    { key: 'pending', label: 'Chờ xử lý' },
                    { key: 'processing', label: 'Đang xử lý' },
                    { key: 'shipped', label: 'Đã gửi' },
                    { key: 'delivered', label: 'Đã giao' },
                    { key: 'cancelled', label: 'Đã hủy' }
                ],
                amount_ranges: [
                    { min: 0, max: 100000, label: 'Dưới 100K' },
                    { min: 100000, max: 500000, label: '100K - 500K' },
                    { min: 500000, max: 1000000, label: '500K - 1M' },
                    { min: 1000000, max: 5000000, label: '1M - 5M' },
                    { min: 5000000, max: null, label: 'Trên 5M' }
                ],
                actual_range: amountRange
            };
        } catch (error) {
            console.error('Get order filters error:', error);
            return {
                statuses: [],
                amount_ranges: [],
                actual_range: { min: 0, max: 0 }
            };
        }
    }
}

module.exports = OrderSearchService;
