const Stats = require('../../models/Stats');

/**
 * RevenueStatsService - Xử lý business logic cho thống kê doanh thu
 * Theo nguyên tắc SRP: Service chỉ xử lý logic nghiệp vụ cho revenue stats
 */
class RevenueStatsService {
    
    /**
     * Lấy thống kê doanh thu theo thời gian
     */
    static async getRevenueAnalytics(options = {}) {
        try {
            const { period = 'day', limit = 30 } = options;
            
            // Validate inputs
            this.validatePeriod(period);
            const validLimit = this.validateLimit(limit, 365);
            
            const revenueData = await Stats.getRevenueStats(period, validLimit);
            
            // Tính toán các chỉ số tổng hợp
            const summary = this.calculateRevenueSummary(revenueData);
            
            return {
                period,
                data: revenueData,
                summary,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê doanh thu: ${error.message}`);
        }
    }

    /**
     * Lấy thống kê phương thức thanh toán
     */
    // payment method analytics and revenue comparison removed (endpoints unused)

    /**
     * Tính toán summary cho dữ liệu doanh thu
     */
    static calculateRevenueSummary(revenueData) {
        const totalRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
        const totalOrders = revenueData.reduce((sum, item) => sum + parseInt(item.total_orders), 0);
        const completedOrders = revenueData.reduce((sum, item) => sum + parseInt(item.completed_orders), 0);
        
        return {
            total_revenue: totalRevenue,
            total_orders: totalOrders,
            completed_orders: completedOrders,
            avg_order_value: completedOrders > 0 ? (totalRevenue / completedOrders) : 0,
            conversion_rate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100) : 0,
            periods_count: revenueData.length
        };
    }

    /**
     * Tính tỷ lệ tăng trưởng
     */
    static calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
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
    static validateLimit(limit, max = 365) {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > max) {
            throw new Error(`Limit phải là số từ 1 đến ${max}`);
        }
        return numLimit;
    }
}

module.exports = RevenueStatsService;
