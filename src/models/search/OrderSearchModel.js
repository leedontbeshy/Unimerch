const { pool } = require('../../../config/database');

/**
 * Model xử lý các truy vấn tìm kiếm đơn hàng
 */
class OrderSearchModel {
    /**
     * Tìm kiếm đơn hàng với điều kiện động
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @param {number} limit - Giới hạn số lượng
     * @param {number} offset - Vị trí bắt đầu
     * @returns {Promise<Array>} - Danh sách đơn hàng
     */
    static async searchOrders(whereClause, queryParams, limit = 20, offset = 0) {
        const searchQuery = `
            SELECT 
                o.*,
                u.username,
                u.full_name,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereClause}
            GROUP BY o.id, u.username, u.full_name
            ORDER BY o.created_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const params = [...queryParams, limit, offset];
        const result = await pool.query(searchQuery, params);
        return result.rows;
    }

    /**
     * Đếm tổng số đơn hàng thỏa mãn điều kiện
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @returns {Promise<number>} - Tổng số đơn hàng
     */
    static async countOrders(whereClause, queryParams) {
        const countQuery = `
            SELECT COUNT(DISTINCT o.id) as total
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ${whereClause}
        `;

        const result = await pool.query(countQuery, queryParams);
        return parseInt(result.rows[0]?.total || 0);
    }

    /**
     * Lấy thống kê đơn hàng theo status
     * @param {number} userId - ID người dùng (null nếu admin)
     * @returns {Promise<Array>} - Thống kê theo status
     */
    static async getOrderStatsByStatus(userId = null) {
        const whereClause = userId ? 'WHERE user_id = $1' : '';
        const params = userId ? [userId] : [];

        const query = `
            SELECT 
                status,
                COUNT(*) as count,
                SUM(total_amount) as total_amount
            FROM orders
            ${whereClause}
            GROUP BY status
            ORDER BY count DESC
        `;

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Lấy khoảng giá đơn hàng min/max
     * @param {number} userId - ID người dùng (null nếu admin)
     * @returns {Promise<Object>} - Min/max amount
     */
    static async getOrderAmountRange(userId = null) {
        const whereClause = userId ? 'WHERE user_id = $1' : '';
        const params = userId ? [userId] : [];

        const query = `
            SELECT 
                MIN(total_amount) as min_amount,
                MAX(total_amount) as max_amount
            FROM orders 
            ${whereClause}
        `;

        const result = await pool.query(query, params);
        return {
            min: parseFloat(result.rows[0]?.min_amount || 0),
            max: parseFloat(result.rows[0]?.max_amount || 0)
        };
    }
}

module.exports = OrderSearchModel;