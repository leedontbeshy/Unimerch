const ProductSearchService = require('./ProductSearchService');
const CategorySearchService = require('./CategorySearchService');
const { pool } = require('../../../config/database');

/**
 * Service xử lý các utilities cho tìm kiếm
 */
class SearchHelperService {
    /**
     * Lấy gợi ý tìm kiếm (suggestions/autocomplete)
     * @param {string} query - Từ khóa tìm kiếm
     * @param {string} type - Loại gợi ý (products, categories)
     * @param {number} limit - Số lượng gợi ý
     * @returns {Array} - Danh sách gợi ý
     */
    static async getSuggestions(query, type = 'products', limit = 5) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            switch (type) {
                case 'products':
                    return await ProductSearchService.getProductSuggestions(query, limit);
                
                case 'categories':
                    return await CategorySearchService.getCategorySuggestions(query, limit);
                
                default:
                    return [];
            }
        } catch (error) {
            console.error('Get suggestions error:', error);
            return [];
        }
    }

    /**
     * Lấy từ khóa phổ biến - CHỈ TRẢ VỀ EMPTY VÌ KHÔNG CÓ DATA
     * @param {string} type - Loại từ khóa
     * @param {number} limit - Số lượng từ khóa
     * @returns {Array} - Danh sách rỗng
     */
    static getPopularKeywords(type = 'products', limit = 10) {
        // Không có search analytics data trong database
        return [];
    }

    /**
     * Lấy danh sách filters tổng hợp
     * @returns {Object} - Danh sách tất cả filters
     */
    static async getAllFilters() {
        try {
            const productFilters = await ProductSearchService.getProductFilters();
            const categoriesForFilter = await CategorySearchService.getCategoriesForFilter();

            return {
                product_filters: {
                    ...productFilters,
                    categories: categoriesForFilter.map(c => ({ 
                        id: c.id, 
                        name: c.name,
                        product_count: c.product_count 
                    }))
                },
                order_filters: {
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
                    ]
                },
                review_filters: {
                    ratings: [
                        { value: 5, label: '5 sao' },
                        { value: 4, label: '4 sao' },
                        { value: 3, label: '3 sao' },
                        { value: 2, label: '2 sao' },
                        { value: 1, label: '1 sao' }
                    ]
                },
                user_filters: {
                    roles: [
                        { key: 'user', label: 'Người dùng' },
                        { key: 'seller', label: 'Người bán' },
                        { key: 'admin', label: 'Quản trị viên' }
                    ]
                }
            };
        } catch (error) {
            console.error('Get all filters error:', error);
            throw new Error('Lỗi khi lấy danh sách filter');
        }
    }

    /**
     * Lấy thống kê thực từ database (Admin only)
     * @returns {Object} - Thống kê từ database thật
     */
    static async getSearchStats() {
        try {
            const [
                userStats,
                productStats,
                categoryStats,
                orderStats,
                reviewStats,
                revenueStats
            ] = await Promise.all([
                // Thống kê users theo role
                pool.query(`
                    SELECT role, COUNT(*) as count
                    FROM users
                    GROUP BY role
                    ORDER BY count DESC
                `),
                
                // Thống kê products theo status
                pool.query(`
                    SELECT status, COUNT(*) as count
                    FROM products
                    GROUP BY status
                    ORDER BY count DESC
                `),
                
                // Thống kê products theo category
                pool.query(`
                    SELECT c.name as category, COUNT(p.id) as count
                    FROM categories c
                    LEFT JOIN products p ON c.id = p.category_id
                    GROUP BY c.id, c.name
                    ORDER BY count DESC
                    LIMIT 10
                `),
                
                // Thống kê orders theo status
                pool.query(`
                    SELECT status, COUNT(*) as count, SUM(total_amount) as total_amount
                    FROM orders
                    GROUP BY status
                    ORDER BY count DESC
                `),
                
                // Thống kê reviews theo rating
                pool.query(`
                    SELECT rating, COUNT(*) as count
                    FROM reviews
                    GROUP BY rating
                    ORDER BY rating DESC
                `),
                
                // Tổng doanh thu
                pool.query(`
                    SELECT 
                        COUNT(*) as total_orders,
                        SUM(total_amount) as total_revenue,
                        AVG(total_amount) as avg_order_value
                    FROM orders
                    WHERE status IN ('delivered', 'shipped')
                `)
            ]);

            return {
                // Database Stats - REAL DATA
                database_overview: {
                    total_users: userStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
                    total_products: productStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
                    total_orders: orderStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
                    total_reviews: reviewStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
                },
                
                users_by_role: userStats.rows.map(row => ({
                    role: row.role,
                    count: parseInt(row.count)
                })),
                
                products_by_status: productStats.rows.map(row => ({
                    status: row.status,
                    count: parseInt(row.count)
                })),
                
                products_by_category: categoryStats.rows.map(row => ({
                    category: row.category,
                    count: parseInt(row.count)
                })),
                
                orders_by_status: orderStats.rows.map(row => ({
                    status: row.status,
                    count: parseInt(row.count),
                    total_amount: parseFloat(row.total_amount || 0)
                })),
                
                reviews_by_rating: reviewStats.rows.map(row => ({
                    rating: parseInt(row.rating),
                    count: parseInt(row.count)
                })),
                
                revenue_overview: {
                    total_orders: parseInt(revenueStats.rows[0]?.total_orders || 0),
                    total_revenue: parseFloat(revenueStats.rows[0]?.total_revenue || 0),
                    average_order_value: parseFloat(revenueStats.rows[0]?.avg_order_value || 0)
                },
                
                // Note: Không có search analytics data
                search_analytics: {
                    note: "Search analytics chưa được implement",
                    has_search_data: false
                }
            };
        } catch (error) {
            console.error('Get search stats error:', error);
            throw new Error('Lỗi khi lấy thống kê từ database');
        }
    }

    /**
     * Validate và clean search query
     * @param {string} query - Query cần validate
     * @returns {Object} - Kết quả validation
     */
    static validateSearchQuery(query) {
        if (!query || typeof query !== 'string') {
            return {
                isValid: false,
                cleanQuery: '',
                errors: ['Query phải là chuỗi không rỗng']
            };
        }

        const cleanQuery = query.trim();
        const errors = [];

        // Kiểm tra độ dài tối thiểu
        if (cleanQuery.length < 2) {
            errors.push('Query phải có ít nhất 2 ký tự');
        }

        // Kiểm tra độ dài tối đa
        if (cleanQuery.length > 100) {
            errors.push('Query không được vượt quá 100 ký tự');
        }

        // Kiểm tra ký tự đặc biệt nguy hiểm
        const dangerousChars = /[<>\"'%;()&+]/;
        if (dangerousChars.test(cleanQuery)) {
            errors.push('Query chứa ký tự không được phép');
        }

        return {
            isValid: errors.length === 0,
            cleanQuery,
            errors
        };
    }

    /**
     * Tạo search suggestion context
     * @param {string} query - Query hiện tại
     * @param {string} category - Category context (optional)
     * @returns {Object} - Context cho suggestions
     */
    static buildSearchContext(query, category = null) {
        const validation = this.validateSearchQuery(query);
        
        return {
            original_query: query,
            clean_query: validation.cleanQuery,
            is_valid: validation.isValid,
            errors: validation.errors,
            category_context: category,
            suggestion_types: validation.isValid ? ['products', 'categories'] : [],
            recommended_limit: validation.cleanQuery.length < 3 ? 3 : 5
        };
    }
}

module.exports = SearchHelperService;