const Stats = require('../../models/Stats');

/**
 * DashboardStatsService - Xử lý business logic cho dashboard tổng quan
 * Theo nguyên tắc SRP: Service chỉ xử lý logic nghiệp vụ cho dashboard stats
 */
class DashboardStatsService {
    
    /**
     * Lấy thống kê tổng quan cho Admin Dashboard
     */
    static async getDashboardOverview() {
        try {
            const overview = await Stats.getSystemOverview();
            
            // Tính toán các chỉ số phụ
            const conversionRate = overview.total_orders > 0 
                ? ((overview.completed_orders / overview.total_orders) * 100).toFixed(2)
                : 0;
                
            const averageOrderValue = overview.completed_orders > 0
                ? (overview.total_revenue / overview.completed_orders).toFixed(2)
                : 0;
                
            const paymentSuccessRate = overview.total_orders > 0
                ? ((overview.successful_payments / overview.total_orders) * 100).toFixed(2)
                : 0;

            return {
                overview: {
                    ...overview,
                    conversion_rate: parseFloat(conversionRate),
                    average_order_value: parseFloat(averageOrderValue),
                    payment_success_rate: parseFloat(paymentSuccessRate)
                },
                calculated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê tổng quan: ${error.message}`);
        }
    }

    /**
     * Lấy thống kê hoạt động gần đây
     */
    static async getRecentActivity(limit = 20) {
        try {
            if (limit < 1 || limit > 100) {
                throw new Error('Limit phải trong khoảng 1-100');
            }

            const activities = await Stats.getRecentActivity(limit);
            
            // Format dữ liệu cho frontend
            const formattedActivities = activities.map(activity => ({
                ...activity,
                timestamp: new Date(activity.timestamp).toISOString(),
                time_ago: this.calculateTimeAgo(activity.timestamp)
            }));

            return {
                activities: formattedActivities,
                total: formattedActivities.length,
                fetched_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy hoạt động gần đây: ${error.message}`);
        }
    }

    /**
     * Tính toán thời gian "time ago"
     */
    static calculateTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
        return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
    }

    /**
     * Validate period parameter
     */
    static validatePeriod(period) {
        const validPeriods = ['hour', 'day', 'week', 'month', 'year'];
        if (!validPeriods.includes(period)) {
            throw new Error(`Period không hợp lệ. Chỉ chấp nhận: ${validPeriods.join(', ')}`);
        }
    }

    /**
     * Validate limit parameter
     */
    static validateLimit(limit, max = 100) {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > max) {
            throw new Error(`Limit phải là số từ 1 đến ${max}`);
        }
        return numLimit;
    }
}

module.exports = DashboardStatsService;
