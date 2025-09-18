const { pool } = require('../../../config/database');

/**
 * Model xử lý các truy vấn tìm kiếm đánh giá
 */
class ReviewSearchModel {
    /**
     * Tìm kiếm đánh giá với điều kiện động
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @param {number} limit - Giới hạn số lượng
     * @param {number} offset - Vị trí bắt đầu
     * @returns {Promise<Array>} - Danh sách đánh giá
     */
    static async searchReviews(whereClause, queryParams, limit = 20, offset = 0) {
        const searchQuery = `
            SELECT 
                r.*,
                u.username,
                u.full_name,
                p.name as product_name,
                p.image_url as product_image
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const params = [...queryParams, limit, offset];
        const result = await pool.query(searchQuery, params);
        return result.rows;
    }

    /**
     * Đếm tổng số đánh giá thỏa mãn điều kiện
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @returns {Promise<number>} - Tổng số đánh giá
     */
    static async countReviews(whereClause, queryParams) {
        const countQuery = `
            SELECT COUNT(*) as total
            FROM reviews r
            ${whereClause}
        `;

        const result = await pool.query(countQuery, queryParams);
        return parseInt(result.rows[0]?.total || 0);
    }

    /**
     * Lấy thống kê đánh giá theo rating
     * @param {number} productId - ID sản phẩm (null nếu tất cả)
     * @returns {Promise<Array>} - Thống kê theo rating
     */
    static async getReviewStatsByRating(productId = null) {
        const whereClause = productId ? 'WHERE product_id = $1' : '';
        const params = productId ? [productId] : [];

        const query = `
            SELECT 
                rating,
                COUNT(*) as count
            FROM reviews
            ${whereClause}
            GROUP BY rating
            ORDER BY rating DESC
        `;

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Lấy đánh giá gần đây nhất
     * @param {number} limit - Số lượng đánh giá
     * @returns {Promise<Array>} - Danh sách đánh giá mới nhất
     */
    static async getRecentReviews(limit = 10) {
        const query = `
            SELECT 
                r.*,
                u.username,
                u.full_name,
                p.name as product_name,
                p.image_url as product_image
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);
        return result.rows;
    }

    /**
     * Lấy top sản phẩm có rating cao nhất
     * @param {number} limit - Số lượng sản phẩm
     * @returns {Promise<Array>} - Danh sách sản phẩm top rating
     */
    static async getTopRatedProducts(limit = 10) {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.image_url,
                p.price,
                AVG(r.rating) as average_rating,
                COUNT(r.id) as review_count
            FROM products p
            INNER JOIN reviews r ON p.id = r.product_id
            WHERE p.status = 'available'
            GROUP BY p.id, p.name, p.image_url, p.price
            HAVING COUNT(r.id) >= 3
            ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);
        return result.rows;
    }
}

module.exports = ReviewSearchModel;