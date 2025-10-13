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
    static async getPaymentMethodAnalytics() {
        try {
            const paymentStats = await Stats.getPaymentMethodStats();
            
            // Tính tổng và phần trăm
            const totalAmount = paymentStats.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
            const totalTransactions = paymentStats.reduce((sum, item) => sum + parseInt(item.transaction_count), 0);
            
            const formattedStats = paymentStats.map(stat => ({
                ...stat,
                total_amount: parseFloat(stat.total_amount),
                avg_amount: parseFloat(stat.avg_amount),
                success_rate: parseFloat(stat.success_rate),
                percentage_of_revenue: totalAmount > 0 
                    ? ((parseFloat(stat.total_amount) / totalAmount) * 100).toFixed(2)
                    : 0,
                percentage_of_transactions: totalTransactions > 0
                    ? ((parseInt(stat.transaction_count) / totalTransactions) * 100).toFixed(2)
                    : 0
            }));

            return {
                payment_methods: formattedStats,
                summary: {
                    total_amount: totalAmount,
                    total_transactions: totalTransactions,
                    overall_success_rate: totalTransactions > 0
                        ? ((paymentStats.reduce((sum, item) => sum + parseInt(item.successful_count), 0) / totalTransactions) * 100).toFixed(2)
                        : 0
                },
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê phương thức thanh toán: ${error.message}`);
        }
    }

    /**
     * So sánh doanh thu giữa các kỳ
     */
    static async compareRevenue(currentPeriod = 'day', comparisonPeriod = 'day', limit = 30) {
        try {
            this.validatePeriod(currentPeriod);
            this.validatePeriod(comparisonPeriod);
            
            const [currentData, previousData] = await Promise.all([
                Stats.getRevenueStats(currentPeriod, limit),
                Stats.getRevenueStats(comparisonPeriod, limit * 2) // Lấy nhiều hơn để so sánh
            ]);

            const currentSummary = this.calculateRevenueSummary(currentData);
            const previousSummary = this.calculateRevenueSummary(previousData.slice(limit)); // Lấy kỳ trước

            // Tính tỷ lệ tăng trưởng
            const growthMetrics = {
                revenue_growth: this.calculateGrowthRate(currentSummary.total_revenue, previousSummary.total_revenue),
                orders_growth: this.calculateGrowthRate(currentSummary.total_orders, previousSummary.total_orders),
                avg_order_value_growth: this.calculateGrowthRate(currentSummary.avg_order_value, previousSummary.avg_order_value),
                conversion_rate_growth: this.calculateGrowthRate(currentSummary.conversion_rate, previousSummary.conversion_rate)
            };

            return {
                current_period: {
                    period: currentPeriod,
                    data: currentData,
                    summary: currentSummary
                },
                previous_period: {
                    period: comparisonPeriod,
                    summary: previousSummary
                },
                growth_metrics: growthMetrics,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi so sánh doanh thu: ${error.message}`);
        }
    }

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
