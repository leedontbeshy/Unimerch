const { pool } = require('../../../config/database');

/**
 * Model xử lý các truy vấn tìm kiếm sản phẩm
 */
class ProductSearchModel {
    /**
     * Tìm kiếm sản phẩm với điều kiện động
     * @param {Object} conditions - Điều kiện tìm kiếm
     * @param {Object} options - Tùy chọn (sort, pagination)
     * @returns {Promise<Array>} - Danh sách sản phẩm
     */
    static async searchProducts(conditions, options = {}) {
        const {
            whereClause,
            queryParams,
            orderBy = 'p.created_at DESC',
            limit = 20,
            offset = 0
        } = options;

        const searchQuery = `
            SELECT 
                p.*,
                c.name as category_name,
                u.username as seller_name,
                u.full_name as seller_full_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.seller_id = u.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE ${whereClause}
            GROUP BY p.id, c.name, u.username, u.full_name
            ORDER BY ${orderBy}
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const params = [...queryParams, limit, offset];
        const result = await pool.query(searchQuery, params);
        return result.rows;
    }

    /**
     * Đếm tổng số sản phẩm thỏa mãn điều kiện
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @returns {Promise<number>} - Tổng số sản phẩm
     */
    static async countProducts(whereClause, queryParams) {
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE ${whereClause}
        `;

        const result = await pool.query(countQuery, queryParams);
        return parseInt(result.rows[0]?.total || 0);
    }

    /**
     * Lấy gợi ý tên sản phẩm
     * @param {string} searchTerm - Từ khóa tìm kiếm
     * @param {number} limit - Số lượng gợi ý
     * @returns {Promise<Array>} - Danh sách gợi ý
     */
    static async getProductSuggestions(searchTerm, limit = 5) {
        const query = `
            SELECT DISTINCT name 
            FROM products 
            WHERE name ILIKE $1 AND status = 'available'
            ORDER BY name ASC
            LIMIT $2
        `;

        const result = await pool.query(query, [searchTerm, limit]);
        return result.rows.map(p => p.name);
    }

    /**
     * Lấy tất cả màu sắc có sẵn
     * @returns {Promise<Array>} - Danh sách màu sắc
     */
    static async getAvailableColors() {
        const query = `
            SELECT DISTINCT color
            FROM products 
            WHERE color IS NOT NULL AND color != ''
            AND status = 'available'
            ORDER BY color ASC
        `;

        const result = await pool.query(query);
        return result.rows.map(r => r.color).filter(Boolean);
    }

    /**
     * Lấy tất cả kích thước có sẵn
     * @returns {Promise<Array>} - Danh sách size
     */
    static async getAvailableSizes() {
        const query = `
            SELECT DISTINCT size
            FROM products 
            WHERE size IS NOT NULL AND size != ''
            AND status = 'available'
            ORDER BY size ASC
        `;

        const result = await pool.query(query);
        return result.rows.map(r => r.size).filter(Boolean);
    }

    /**
     * Lấy khoảng giá min/max của sản phẩm
     * @returns {Promise<Object>} - Min/max price
     */
    static async getPriceRange() {
        const query = `
            SELECT 
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM products 
            WHERE status = 'available'
        `;

        const result = await pool.query(query);
        return {
            min: parseFloat(result.rows[0]?.min_price || 0),
            max: parseFloat(result.rows[0]?.max_price || 0)
        };
    }
}

module.exports = ProductSearchModel;