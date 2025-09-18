const UserSearchModel = require('../../models/search/UserSearchModel');
const SearchQueryBuilder = require('../../utils/SearchQueryBuilder');

/**
 * Service xử lý tìm kiếm người dùng (Admin only)
 */
class UserSearchService {
    /**
     * Tìm kiếm người dùng
     * @param {Object} searchParams - Tham số tìm kiếm
     * @returns {Object} - Kết quả tìm kiếm
     */
    static async searchUsers(searchParams) {
        const {
            q = '',
            page = 1,
            limit = 20,
            role
        } = searchParams;

        try {
            // Tính toán pagination
            const pagination = SearchQueryBuilder.calculatePagination(page, limit);

            // Xây dựng query conditions
            const queryBuilder = new SearchQueryBuilder();
            
            queryBuilder
                .addTextSearch(q, ['username', 'email', 'full_name'])
                .addEquals('role', role);

            const whereClause = queryBuilder.getWhereClauseWithPrefix();
            const queryParams = queryBuilder.getQueryParams();

            // Lấy dữ liệu
            const [users, total] = await Promise.all([
                UserSearchModel.searchUsers(
                    whereClause, 
                    queryParams, 
                    pagination.limit, 
                    pagination.offset
                ),
                UserSearchModel.countUsers(whereClause, queryParams)
            ]);

            // Xây dựng response
            const paginationResponse = SearchQueryBuilder.buildPaginationResponse(
                pagination.page, 
                pagination.limit, 
                total
            );

            return {
                users,
                pagination: paginationResponse
            };
        } catch (error) {
            console.error('User search error:', error);
            throw new Error('Lỗi khi tìm kiếm người dùng');
        }
    }

    /**
     * Lấy thống kê user theo role
     * @returns {Array} - Thống kê
     */
    static async getUserStatsByRole() {
        try {
            return await UserSearchModel.getUserStatsByRole();
        } catch (error) {
            console.error('Get user stats by role error:', error);
            throw new Error('Lỗi khi lấy thống kê người dùng');
        }
    }

    /**
     * Lấy filters cho user search
     * @returns {Object} - User filters
     */
    static getUserFilters() {
        return {
            roles: [
                { key: 'user', label: 'Người dùng' },
                { key: 'seller', label: 'Người bán' },
                { key: 'admin', label: 'Quản trị viên' }
            ]
        };
    }
}

module.exports = UserSearchService;
