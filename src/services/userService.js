const User = require('../models/User');
const { pool } = require('../../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');

class UserService {
    
    /**
     * Business Logic: Lấy profile user hiện tại
     */
    static async getUserProfile(userId) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('Không tìm thấy thông tin người dùng');
        }

        return this.formatUserProfile(user);
    }
    
    /**
     * Business Logic: Cập nhật profile user
     */
    static async updateUserProfile(userId, profileData) {
        const { fullName, studentId, phone, address } = profileData;
        
        // 1. Chuẩn bị dữ liệu clean
        const updateData = {
            fullName: fullName.trim(),
            studentId: studentId ? studentId.trim() : null,
            phone: phone ? phone.trim() : null,
            address: address ? address.trim() : null
        };

        // 2. Cập nhật user
        const updatedUser = await User.update(userId, updateData);

        if (!updatedUser) {
            throw new Error('Không thể cập nhật thông tin người dùng');
        }

        return this.formatUserProfile(updatedUser);
    }
    
    /**
     * Business Logic: Đổi mật khẩu
     */
    static async changePassword(userId, passwordData) {
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        
        // 1. Validate password confirmation
        if (newPassword !== confirmPassword) {
            throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }
        
        // 2. Lấy thông tin user với password để verify
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (!userResult.rows[0]) {
            throw new Error('Không tìm thấy người dùng');
        }

        const user = userResult.rows[0];

        // 3. Verify mật khẩu hiện tại
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        // 4. Hash mật khẩu mới
        const hashedNewPassword = await hashPassword(newPassword);

        // 5. Cập nhật mật khẩu
        const success = await User.updatePassword(user.email, hashedNewPassword);
        
        if (!success) {
            throw new Error('Không thể cập nhật mật khẩu');
        }

        return { success: true, message: 'Đổi mật khẩu thành công' };
    }
    
    /**
     * Business Logic: Lấy danh sách users với search và pagination (Admin)
     */
    static async getAllUsers(queryParams) {
        const { page = 1, limit = 20, search } = queryParams;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let users;
        let totalUsers;

        if (search && search.trim()) {
            // Search users
            const result = await this.searchUsers(search.trim(), parseInt(limit), parseInt(offset));
            users = result.users;
            totalUsers = result.total;
        } else {
            // Get all users
            users = await User.getAll(parseInt(limit), parseInt(offset));
            totalUsers = await this.getTotalUsersCount();
        }

        // Format users
        const formattedUsers = users.map(user => this.formatUserProfile(user));

        // Create pagination info
        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            totalUsers,
            usersPerPage: parseInt(limit),
            hasNext: parseInt(page) < Math.ceil(totalUsers / parseInt(limit)),
            hasPrev: parseInt(page) > 1
        };

        return {
            users: formattedUsers,
            pagination
        };
    }
    
    /**
     * Business Logic: Lấy user theo ID (Admin)
     */
    static async getUserById(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }

        return this.formatUserProfile(user);
    }
    
    /**
     * Business Logic: Cập nhật user theo ID (Admin)
     */
    static async updateUserById(userId, userData) {
        const { fullName, studentId, phone, address, role } = userData;
        
        // 1. Kiểm tra user có tồn tại không
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error('Không tìm thấy người dùng');
        }

        // 2. Validate role nếu có
        if (role && !this.isValidRole(role)) {
            throw new Error('Role không hợp lệ. Chỉ được phép: user, seller, admin');
        }

        // 3. Cập nhật user (bao gồm role)
        const updatedUser = await this.updateUserWithRole(userId, {
            fullName: fullName.trim(),
            studentId: studentId ? studentId.trim() : null,
            phone: phone ? phone.trim() : null,
            address: address ? address.trim() : null,
            role: role || existingUser.role
        });

        return this.formatUserProfile(updatedUser);
    }
    
    /**
     * Business Logic: Xóa user (Admin)
     */
    static async deleteUser(userId, currentUserId) {
        // 1. Không cho phép admin tự xóa chính mình
        if (userId === currentUserId) {
            throw new Error('Không thể xóa chính tài khoản của bạn');
        }

        // 2. Kiểm tra user có tồn tại không
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error('Không tìm thấy người dùng');
        }

        // 3. Kiểm tra business rules trước khi xóa
        await this.checkUserDeletionRules(userId);

        // 4. Xóa user
        const success = await User.delete(userId);
        
        if (!success) {
            throw new Error('Không thể xóa người dùng');
        }

        return {
            deletedUserId: userId,
            deletedUserInfo: {
                username: existingUser.username,
                email: existingUser.email,
                fullName: existingUser.full_name
            }
        };
    }
    
    /**
     * Business Logic: Lấy thống kê users (Admin)
     */
    static async getUserStats() {
        try {
            const statsResult = await pool.query(`
                SELECT 
                    role,
                    COUNT(*) as count,
                    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
                FROM users 
                GROUP BY role
                ORDER BY count DESC
            `);

            const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
            const total = parseInt(totalResult.rows[0].total);

            const recentResult = await pool.query(`
                SELECT COUNT(*) as recent_count 
                FROM users 
                WHERE created_at >= NOW() - INTERVAL '30 days'
            `);
            const recentUsers = parseInt(recentResult.rows[0].recent_count);

            return {
                totalUsers: total,
                recentUsers,
                roleDistribution: statsResult.rows,
                growthRate: total > 0 ? ((recentUsers / total) * 100).toFixed(2) : 0
            };
        } catch (error) {
            throw error;
        }
    }
    
    // =================== HELPER METHODS ===================
    
    /**
     * Helper: Format user profile cho response
     */
    static formatUserProfile(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            studentId: user.student_id,
            phone: user.phone,
            address: user.address,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
    }
    
    /**
     * Helper: Search users
     */
    static async searchUsers(searchTerm, limit, offset) {
        try {
            const searchPattern = `%${searchTerm}%`;
            
            const usersResult = await pool.query(
                `SELECT id, username, email, full_name, student_id, phone, address, role, created_at 
                 FROM users 
                 WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1
                 ORDER BY created_at DESC 
                 LIMIT $2 OFFSET $3`,
                [searchPattern, limit, offset]
            );
            
            const countResult = await pool.query(
                `SELECT COUNT(*) as total 
                 FROM users 
                 WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1`,
                [searchPattern]
            );
            
            return {
                users: usersResult.rows,
                total: parseInt(countResult.rows[0].total)
            };
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Helper: Lấy tổng số users
     */
    static async getTotalUsersCount() {
        try {
            const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
            return parseInt(countResult.rows[0].total);
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Helper: Validate role
     */
    static isValidRole(role) {
        const validRoles = ['user', 'seller', 'admin'];
        return validRoles.includes(role);
    }
    
    /**
     * Helper: Cập nhật user với role (Admin only)
     */
    static async updateUserWithRole(userId, userData) {
        try {
            const { fullName, studentId, phone, address, role } = userData;
            
            const result = await pool.query(
                `UPDATE users 
                 SET full_name = $1, student_id = $2, phone = $3, address = $4, role = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6 
                 RETURNING id, username, email, full_name, student_id, phone, address, role, updated_at`,
                [fullName, studentId, phone, address, role, userId]
            );

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Helper: Kiểm tra business rules khi xóa user
     */
    static async checkUserDeletionRules(userId) {
        try {
            // Kiểm tra user có orders không
            const orderCheck = await pool.query(
                'SELECT COUNT(*) as count FROM orders WHERE user_id = $1',
                [userId]
            );
            
            if (parseInt(orderCheck.rows[0].count) > 0) {
                throw new Error('Không thể xóa người dùng đã có đơn hàng');
            }

            // Kiểm tra user có products không (nếu là seller)
            const productCheck = await pool.query(
                'SELECT COUNT(*) as count FROM products WHERE seller_id = $1',
                [userId]
            );
            
            if (parseInt(productCheck.rows[0].count) > 0) {
                throw new Error('Không thể xóa seller đã có sản phẩm');
            }

            // Kiểm tra user có reviews không
            const reviewCheck = await pool.query(
                'SELECT COUNT(*) as count FROM reviews WHERE user_id = $1',
                [userId]
            );
            
            if (parseInt(reviewCheck.rows[0].count) > 0) {
                throw new Error('Không thể xóa người dùng đã có đánh giá');
            }

            return true;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Helper: Validate user ID
     */
    static validateUserId(id) {
        const userId = parseInt(id);
        
        if (!id || isNaN(userId) || userId <= 0) {
            throw new Error('ID người dùng không hợp lệ');
        }
        
        return userId;
    }
    
    /**
     * Helper: Validate pagination parameters
     */
    static validatePaginationParams(page, limit) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        
        if (pageNum < 1) {
            throw new Error('Số trang phải lớn hơn 0');
        }
        
        if (limitNum < 1 || limitNum > 100) {
            throw new Error('Giới hạn phải từ 1 đến 100');
        }
        
        return { page: pageNum, limit: limitNum };
    }
}

module.exports = UserService;
