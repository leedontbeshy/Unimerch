const CategorySearchModel = require('../../models/search/CategorySearchModel');
const SearchQueryBuilder = require('../../utils/SearchQueryBuilder');

/**
 * Service xử lý tìm kiếm danh mục
 */
class CategorySearchService {
    /**
     * Tìm kiếm danh mục
     * @param {Object} searchParams - Tham số tìm kiếm
     * @returns {Object} - Kết quả tìm kiếm
     */
    static async searchCategories(searchParams) {
        const {
            q = '',
            page = 1,
            limit = 20
        } = searchParams;

        try {
            // Tính toán pagination
            const pagination = SearchQueryBuilder.calculatePagination(page, limit);

            // Xây dựng query conditions
            let whereCondition = 'TRUE';
            let queryParams = [];

            if (q && q.trim() !== '') {
                whereCondition = '(c.name ILIKE $1 OR c.description ILIKE $1)';
                queryParams.push(`%${q.trim()}%`);
            }

            // Lấy dữ liệu
            const [categories, total] = await Promise.all([
                CategorySearchModel.searchCategories(
                    whereCondition, 
                    queryParams, 
                    pagination.limit, 
                    pagination.offset
                ),
                CategorySearchModel.countCategories(whereCondition, queryParams)
            ]);

            // Xây dựng response
            const paginationResponse = SearchQueryBuilder.buildPaginationResponse(
                pagination.page, 
                pagination.limit, 
                total
            );

            return {
                categories,
                pagination: paginationResponse
            };
        } catch (error) {
            console.error('Category search error:', error);
            throw new Error('Lỗi khi tìm kiếm danh mục');
        }
    }

    /**
     * Lấy gợi ý tên danh mục
     * @param {string} query - Từ khóa
     * @param {number} limit - Số lượng gợi ý
     * @returns {Array} - Danh sách gợi ý
     */
    static async getCategorySuggestions(query, limit = 5) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const searchTerm = `%${query.trim()}%`;
            return await CategorySearchModel.getCategorySuggestions(searchTerm, limit);
        } catch (error) {
            console.error('Get category suggestions error:', error);
            return [];
        }
    }

    /**
     * Lấy danh sách danh mục cho dropdown filter
     * @param {number} limit - Giới hạn số lượng
     * @returns {Array} - Danh sách danh mục
     */
    static async getCategoriesForFilter(limit = 100) {
        try {
            return await CategorySearchModel.getCategoriesForFilter(limit);
        } catch (error) {
            console.error('Get categories for filter error:', error);
            return [];
        }
    }
}

module.exports = CategorySearchService;
