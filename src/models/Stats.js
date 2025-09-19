const { pool } = require('../../config/database');

/**
 * Stats Model - Xử lý các truy vấn thống kê cho Admin Dashboard
 * Theo nguyên tắc SRP: Model chỉ chứa các query database
 */
class Stats {
    
    /**
     * Thống kê tổng quan hệ thống
     */
    static async getSystemOverview() {
        try {
            const query = `
                SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
                    (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
                    (SELECT COUNT(*) FROM products) as total_products,
                    (SELECT COUNT(*) FROM products WHERE status = 'available') as available_products,
                    (SELECT COUNT(*) FROM categories) as total_categories,
                    (SELECT COUNT(*) FROM orders) as total_orders,
                    (SELECT COUNT(*) FROM orders WHERE status = 'completed') as completed_orders,
                    (SELECT COUNT(*) FROM reviews) as total_reviews,
                    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('completed', 'delivered')) as total_revenue,
                    (SELECT COUNT(*) FROM payments WHERE payment_status = 'completed') as successful_payments
            `;
            
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê người dùng theo thời gian
     */
    static async getUserGrowthStats(period = 'day', limit = 30) {
        try {
            let dateFormat, dateInterval;
            
            switch (period) {
                case 'hour':
                    dateFormat = 'YYYY-MM-DD HH24:00:00';
                    dateInterval = '1 hour';
                    break;
                case 'week':
                    dateFormat = 'IYYY-IW';
                    dateInterval = '1 week';
                    break;
                case 'month':
                    dateFormat = 'YYYY-MM';
                    dateInterval = '1 month';
                    break;
                case 'year':
                    dateFormat = 'YYYY';
                    dateInterval = '1 year';
                    break;
                default:
                    dateFormat = 'YYYY-MM-DD';
                    dateInterval = '1 day';
            }

            const query = `
                WITH date_series AS (
                    SELECT generate_series(
                        CURRENT_DATE - INTERVAL '${limit - 1} ${period}',
                        CURRENT_DATE,
                        INTERVAL '${dateInterval}'
                    )::date AS period_date
                ),
                user_stats AS (
                    SELECT 
                        TO_CHAR(created_at, '${dateFormat}') as period,
                        COUNT(*) as new_users,
                        COUNT(CASE WHEN role = 'seller' THEN 1 END) as new_sellers
                    FROM users 
                    WHERE created_at >= CURRENT_DATE - INTERVAL '${limit} ${period}'
                    GROUP BY TO_CHAR(created_at, '${dateFormat}')
                )
                SELECT 
                    TO_CHAR(ds.period_date, '${dateFormat}') as period,
                    COALESCE(us.new_users, 0) as new_users,
                    COALESCE(us.new_sellers, 0) as new_sellers
                FROM date_series ds
                LEFT JOIN user_stats us ON TO_CHAR(ds.period_date, '${dateFormat}') = us.period
                ORDER BY ds.period_date
            `;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê doanh thu theo thời gian
     */
    static async getRevenueStats(period = 'day', limit = 30) {
        try {
            let dateFormat, dateInterval;
            
            switch (period) {
                case 'hour':
                    dateFormat = 'YYYY-MM-DD HH24:00:00';
                    dateInterval = '1 hour';
                    break;
                case 'week':
                    dateFormat = 'IYYY-IW';
                    dateInterval = '1 week';
                    break;
                case 'month':
                    dateFormat = 'YYYY-MM';
                    dateInterval = '1 month';
                    break;
                case 'year':
                    dateFormat = 'YYYY';
                    dateInterval = '1 year';
                    break;
                default:
                    dateFormat = 'YYYY-MM-DD';
                    dateInterval = '1 day';
            }

            const query = `
                WITH date_series AS (
                    SELECT generate_series(
                        CURRENT_DATE - INTERVAL '${limit - 1} ${period}',
                        CURRENT_DATE,
                        INTERVAL '${dateInterval}'
                    )::date AS period_date
                ),
                revenue_stats AS (
                    SELECT 
                        TO_CHAR(o.created_at, '${dateFormat}') as period,
                        COUNT(o.id) as total_orders,
                        COUNT(CASE WHEN o.status IN ('completed', 'delivered') THEN 1 END) as completed_orders,
                        COALESCE(SUM(CASE WHEN o.status IN ('completed', 'delivered') THEN o.total_amount ELSE 0 END), 0) as revenue,
                        COALESCE(AVG(CASE WHEN o.status IN ('completed', 'delivered') THEN o.total_amount END), 0) as avg_order_value
                    FROM orders o
                    WHERE o.created_at >= CURRENT_DATE - INTERVAL '${limit} ${period}'
                    GROUP BY TO_CHAR(o.created_at, '${dateFormat}')
                )
                SELECT 
                    TO_CHAR(ds.period_date, '${dateFormat}') as period,
                    COALESCE(rs.total_orders, 0) as total_orders,
                    COALESCE(rs.completed_orders, 0) as completed_orders,
                    COALESCE(rs.revenue, 0) as revenue,
                    COALESCE(rs.avg_order_value, 0) as avg_order_value
                FROM date_series ds
                LEFT JOIN revenue_stats rs ON TO_CHAR(ds.period_date, '${dateFormat}') = rs.period
                ORDER BY ds.period_date
            `;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Top sản phẩm bán chạy
     */
    static async getTopSellingProducts(limit = 10) {
        try {
            const query = `
                SELECT 
                    p.id,
                    p.name,
                    p.price,
                    p.discount_price,
                    p.image_url,
                    c.name as category_name,
                    u.username as seller_name,
                    COALESCE(SUM(oi.quantity), 0) as total_sold,
                    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
                    COUNT(DISTINCT o.id) as order_count
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('completed', 'delivered')
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                GROUP BY p.id, p.name, p.price, p.discount_price, p.image_url, c.name, u.username
                ORDER BY total_sold DESC, total_revenue DESC
                LIMIT $1
            `;

            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê theo danh mục sản phẩm
     */
    static async getCategoryStats() {
        try {
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    c.description,
                    COUNT(p.id) as product_count,
                    COUNT(CASE WHEN p.status = 'available' THEN 1 END) as available_products,
                    COALESCE(SUM(oi.quantity), 0) as total_sold,
                    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
                    COALESCE(AVG(r.rating), 0) as avg_rating,
                    COUNT(DISTINCT r.id) as review_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('completed', 'delivered')
                LEFT JOIN reviews r ON p.id = r.product_id
                GROUP BY c.id, c.name, c.description
                ORDER BY total_revenue DESC, product_count DESC
            `;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê người bán hàng
     */
    static async getSellerStats(limit = 10) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.username,
                    u.full_name,
                    u.email,
                    u.created_at,
                    COUNT(DISTINCT p.id) as product_count,
                    COUNT(CASE WHEN p.status = 'available' THEN 1 END) as active_products,
                    COALESCE(SUM(oi.quantity), 0) as total_sold,
                    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
                    COUNT(DISTINCT o.id) as order_count,
                    COALESCE(AVG(r.rating), 0) as avg_rating,
                    COUNT(DISTINCT r.id) as review_count
                FROM users u
                LEFT JOIN products p ON u.id = p.seller_id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('completed', 'delivered')
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE u.role = 'seller'
                GROUP BY u.id, u.username, u.full_name, u.email, u.created_at
                ORDER BY total_revenue DESC, product_count DESC
                LIMIT $1
            `;

            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê trạng thái đơn hàng
     */
    static async getOrderStatusStats() {
        try {
            const query = `
                SELECT 
                    status,
                    COUNT(*) as count,
                    COALESCE(SUM(total_amount), 0) as total_amount,
                    COALESCE(AVG(total_amount), 0) as avg_amount
                FROM orders
                GROUP BY status
                ORDER BY 
                    CASE status
                        WHEN 'pending' THEN 1
                        WHEN 'processing' THEN 2
                        WHEN 'shipped' THEN 3
                        WHEN 'delivered' THEN 4
                        WHEN 'cancelled' THEN 5
                        ELSE 6
                    END
            `;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê phương thức thanh toán
     */
    static async getPaymentMethodStats() {
        try {
            const query = `
                SELECT 
                    p.payment_method,
                    COUNT(*) as transaction_count,
                    COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as successful_count,
                    COUNT(CASE WHEN p.payment_status = 'failed' THEN 1 END) as failed_count,
                    COALESCE(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount ELSE 0 END), 0) as total_amount,
                    COALESCE(AVG(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as avg_amount,
                    ROUND(
                        (COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END)::decimal / COUNT(*)) * 100, 
                        2
                    ) as success_rate
                FROM payments p
                GROUP BY p.payment_method
                ORDER BY total_amount DESC
            `;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thống kê hoạt động hệ thống gần đây
     */
    static async getRecentActivity(limit = 20) {
        try {
            const query = `
                (
                    SELECT 
                        'user_registered' as activity_type,
                        u.full_name as title,
                        CONCAT('Người dùng mới: ', u.username, ' (', u.email, ')') as description,
                        u.created_at as timestamp,
                        u.id as entity_id
                    FROM users u
                    ORDER BY u.created_at DESC
                    LIMIT 5
                )
                UNION ALL
                (
                    SELECT 
                        'product_created' as activity_type,
                        p.name as title,
                        CONCAT('Sản phẩm mới từ seller: ', u.username) as description,
                        p.created_at as timestamp,
                        p.id as entity_id
                    FROM products p
                    LEFT JOIN users u ON p.seller_id = u.id
                    ORDER BY p.created_at DESC
                    LIMIT 5
                )
                UNION ALL
                (
                    SELECT 
                        'order_created' as activity_type,
                        CONCAT('Đơn hàng #', o.id) as title,
                        CONCAT('Đơn hàng mới: ', CAST(o.total_amount AS TEXT), ' VND') as description,
                        o.created_at as timestamp,
                        o.id as entity_id
                    FROM orders o
                    ORDER BY o.created_at DESC
                    LIMIT 5
                )
                UNION ALL
                (
                    SELECT 
                        'payment_completed' as activity_type,
                        CONCAT('Thanh toán #', p.id) as title,
                        CONCAT('Thanh toán thành công: ', p.payment_method, ' - ', CAST(p.amount AS TEXT), ' VND') as description,
                        p.updated_at as timestamp,
                        p.id as entity_id
                    FROM payments p
                    WHERE p.payment_status = 'completed'
                    ORDER BY p.updated_at DESC
                    LIMIT 5
                )
                ORDER BY timestamp DESC
                LIMIT $1
            `;

            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Stats;
