const ProductSearchService = require('../services/search/ProductSearchService');
const CategorySearchService = require('../services/search/CategorySearchService');
const UserSearchService = require('../services/search/UserSearchService');
const OrderSearchService = require('../services/search/OrderSearchService');
const ReviewSearchService = require('../services/search/ReviewSearchService');
const GlobalSearchService = require('../services/search/GlobalSearchService');
const SearchHelperService = require('../services/search/SearchHelperService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * 1. GET /api/search/products - Tìm kiếm sản phẩm nâng cao
 */
const searchProducts = async (req, res) => {
    try {
        const result = await ProductSearchService.searchProducts(req.query);
        return successResponse(res, result, 'Tìm kiếm sản phẩm thành công');
    } catch (error) {
        console.error('Search products error:', error);
        return errorResponse(res, error.message || 'Lỗi khi tìm kiếm sản phẩm', 500);
    }
};

/**
 * 2. GET /api/search/categories - Tìm kiếm danh mục
 */
const searchCategories = async (req, res) => {
    try {
        const result = await CategorySearchService.searchCategories(req.query);
        return successResponse(res, result, 'Tìm kiếm danh mục thành công');
    } catch (error) {
        console.error('Search categories error:', error);
        return errorResponse(res, error.message || 'Lỗi khi tìm kiếm danh mục', 500);
    }
};

/**
 * 3. GET /api/search/users - Tìm kiếm người dùng (Admin only)
 */
const searchUsers = async (req, res) => {
    try {
        const result = await UserSearchService.searchUsers(req.query);
        return successResponse(res, result, 'Tìm kiếm người dùng thành công');
    } catch (error) {
        console.error('Search users error:', error);
        return errorResponse(res, error.message || 'Lỗi khi tìm kiếm người dùng', 500);
    }
};

/**
 * 4. GET /api/search/orders - Tìm kiếm đơn hàng
 */
const searchOrders = async (req, res) => {
    try {
        const result = await OrderSearchService.searchOrders(
            req.query,
            req.user.id,
            req.user.role
        );
        return successResponse(res, result, 'Tìm kiếm đơn hàng thành công');
    } catch (error) {
        console.error('Search orders error:', error);
        return errorResponse(res, error.message || 'Lỗi khi tìm kiếm đơn hàng', 500);
    }
};

/**
 * 5. GET /api/search/reviews - Tìm kiếm đánh giá
 */
const searchReviews = async (req, res) => {
    try {
        const result = await ReviewSearchService.searchReviews(req.query);
        return successResponse(res, result, 'Tìm kiếm đánh giá thành công');
    } catch (error) {
        console.error('Search reviews error:', error);
        return errorResponse(res, error.message || 'Lỗi khi tìm kiếm đánh giá', 500);
    }
};

/**
 * 6. GET /api/search/global - Tìm kiếm toàn cục
 */
const globalSearch = async (req, res) => {
    try {
        const result = await GlobalSearchService.globalSearch(req.query);
        return successResponse(res, result, 'Tìm kiếm toàn cục thành công');
    } catch (error) {
        console.error('Global search error:', error);
        return errorResponse(res, error.message || 'Lỗi khi tìm kiếm toàn cục', 500);
    }
};

/**
 * 7. GET /api/search/suggestions - Lấy gợi ý tìm kiếm
 */
const getSuggestions = async (req, res) => {
    try {
        const { q, type = 'products', limit = 5 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return successResponse(res, [], 'Gợi ý tìm kiếm (cần ít nhất 2 ký tự)');
        }

        const suggestions = await SearchHelperService.getSuggestions(q, type, parseInt(limit));
        return successResponse(res, suggestions, 'Lấy gợi ý tìm kiếm thành công');
    } catch (error) {
        console.error('Get suggestions error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy gợi ý tìm kiếm', 500);
    }
};

/**
 * 8. GET /api/search/popular - Lấy từ khóa phổ biến
 */
const getPopularKeywords = async (req, res) => {
    try {
        const { type = 'products', limit = 10 } = req.query;
        const keywords = SearchHelperService.getPopularKeywords(type, parseInt(limit));
        return successResponse(res, { keywords }, 'Lấy từ khóa phổ biến thành công');
    } catch (error) {
        console.error('Get popular keywords error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy từ khóa phổ biến', 500);
    }
};

/**
 * 9. GET /api/search/filters - Lấy danh sách các filter có thể sử dụng
 */
const getSearchFilters = async (req, res) => {
    try {

        const filters = await SearchHelperService.getAllFilters();
        return successResponse(res, filters, 'Lấy danh sách filter thành công');
    } catch (error) {
        console.error('Get search filters error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy danh sách filter', 500);
    }
};

/**
 * 10. GET /api/search/stats - Thống kê tìm kiếm (Admin only)
 */
const getSearchStats = async (req, res) => {
    try {
        const stats = await SearchHelperService.getSearchStats();

        return successResponse(res, stats, 'Lấy thống kê tìm kiếm thành công');
    } catch (error) {
        console.error('Get search stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê tìm kiếm', 500);
    }
};

module.exports = {
    searchProducts,
    searchCategories,
    searchUsers,
    searchOrders,
    searchReviews,
    globalSearch,
    getSuggestions,
    getPopularKeywords,
    getSearchFilters,
    getSearchStats
};
