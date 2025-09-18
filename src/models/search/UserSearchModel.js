const { pool } = require('../../../config/database');

/**
 * Model xử lý các truy vấn tìm kiếm người dùng
 */
class UserSearchModel {
    /**
     * Tìm kiếm người dùng (Admin only)
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @param {number} limit - Giới hạn số lượng
     * @param {number} offset - Vị trí bắt đầu
     * @returns {Promise<Array>} - Danh sách người dùng
     */
    static async searchUsers(whereClause, queryParams, limit = 20, offset = 0) {
        const searchQuery = `
            SELECT 
                id, username, email, full_name, student_id, 
                phone, role, created_at, updated_at
            FROM users
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const params = [...queryParams, limit, offset];
        const result = await pool.query(searchQuery, params);
        return result.rows;
    }

    /**
     * Đếm tổng số người dùng thỏa mãn điều kiện
     * @param {string} whereClause - Điều kiện WHERE
     * @param {Array} queryParams - Tham số query
     * @returns {Promise<number>} - Tổng số người dùng
     */
    static async countUsers(whereClause, queryParams) {
        const countQuery = `
            SELECT COUNT(*) as total
            FROM users
            ${whereClause}
        `;

        const result = await pool.query(countQuery, queryParams);
        return parseInt(result.rows[0]?.total || 0);
    }

    /**
     * Lấy thống kê user theo role
     * @returns {Promise<Array>} - Thống kê theo role
     */
    static async getUserStatsByRole() {
        const query = `
            SELECT 
                role,
                COUNT(*) as count
            FROM users
            GROUP BY role
            ORDER BY count DESC
        `;

        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = UserSearchModel;