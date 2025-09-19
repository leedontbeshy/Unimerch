const { pool } = require('../../../config/database');

/**
 * Model xử lý các truy vấn tìm kiếm danh mục
 */
class CategorySearchModel {
    /**
     * Tìm kiếm danh mục với điều kiện động
     * @param {string} whereCondition - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @param {number} limit - Giới hạn số lượng
     * @param {number} offset - Vị trí bắt đầu
     * @returns {Promise<Array>} - Danh sách danh mục
     */
    static async searchCategories(whereCondition, queryParams, limit = 20, offset = 0) {
        const searchQuery = `
            SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 'available'
            WHERE ${whereCondition}
            GROUP BY c.id
            ORDER BY c.name ASC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const params = [...queryParams, limit, offset];
        const result = await pool.query(searchQuery, params);
        return result.rows;
    }

    /**
     * Đếm tổng số danh mục thỏa mãn điều kiện
     * @param {string} whereCondition - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @returns {Promise<number>} - Tổng số danh mục
     */
    static async countCategories(whereCondition, queryParams) {
        const countQuery = `
            SELECT COUNT(*) as total
            FROM categories c
            WHERE ${whereCondition}
        `;

        const result = await pool.query(countQuery, queryParams);
        return parseInt(result.rows[0]?.total || 0);
    }

    /**
     * Lấy gợi ý tên danh mục
     * @param {string} searchTerm - Từ khóa tìm kiếm
     * @param {number} limit - Số lượng gợi ý
     * @returns {Promise<Array>} - Danh sách gợi ý
     */
    static async getCategorySuggestions(searchTerm, limit = 5) {
        const query = `
            SELECT DISTINCT name 
            FROM categories 
            WHERE name ILIKE $1
            ORDER BY name ASC
            LIMIT $2
        `;

        const result = await pool.query(query, [searchTerm, limit]);
        return result.rows.map(c => c.name);
    }

    /**
     * Lấy danh sách danh mục cho dropdown filter
     * @param {number} limit - Giới hạn số lượng
     * @returns {Promise<Array>} - Danh sách danh mục
     */
    static async getCategoriesForFilter(limit = 100) {
        const query = `
            SELECT 
                c.id, 
                c.name,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 'available'
            GROUP BY c.id, c.name
            HAVING COUNT(p.id) > 0
            ORDER BY c.name ASC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);
        return result.rows;
    }
}

module.exports = CategorySearchModel;