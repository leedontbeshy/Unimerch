const DashboardStatsService = require('./stats/DashboardStatsService');
const RevenueStatsService = require('./stats/RevenueStatsService');
const BusinessStatsService = require('./stats/BusinessStatsService');

/**
 * StatsService - Main service aggregator cho tất cả stats services
 * Theo nguyên tắc SRP: Service chỉ làm nhiệm vụ điều phối và tổng hợp
 */
class StatsService {
    
    /**
     * Dashboard Stats
     */
    static async getDashboardOverview() {
        return await DashboardStatsService.getDashboardOverview();
    }

    static async getRecentActivity(limit = 20) {
        return await DashboardStatsService.getRecentActivity(limit);
    }

    /**
     * Revenue Stats
     */
    static async getRevenueAnalytics(options = {}) {
        return await RevenueStatsService.getRevenueAnalytics(options);
    }

    static async getPaymentMethodAnalytics() {
        return await RevenueStatsService.getPaymentMethodAnalytics();
    }

    static async compareRevenue(currentPeriod, comparisonPeriod, limit) {
        return await RevenueStatsService.compareRevenue(currentPeriod, comparisonPeriod, limit);
    }

    /**
     * Business Stats
     */
    static async getProductAnalytics(limit = 10) {
        return await BusinessStatsService.getProductAnalytics(limit);
    }

    static async getSellerAnalytics(limit = 10) {
        return await BusinessStatsService.getSellerAnalytics(limit);
    }

    static async getOrderStatusAnalytics() {
        return await BusinessStatsService.getOrderStatusAnalytics();
    }

    static async getUserGrowthAnalytics(period = 'day', limit = 30) {
        return await BusinessStatsService.getUserGrowthAnalytics(period, limit);
    }

    /**
     * Combined Analytics cho Admin Dashboard
     */
    static async getCompleteAdminStats(options = {}) {
        try {
            const {
                includeOverview = true,
                includeRevenue = true,
                includeBusiness = true,
                revenueOptions = {},
                businessOptions = {}
            } = options;

            const results = {};

            // Parallel execution cho performance tốt hơn
            const promises = [];

            if (includeOverview) {
                promises.push(
                    this.getDashboardOverview().then(data => ({ overview: data }))
                );
            }

            if (includeRevenue) {
                promises.push(
                    Promise.all([
                        this.getRevenueAnalytics(revenueOptions),
                        this.getPaymentMethodAnalytics()
                    ]).then(([revenue, payment]) => ({ revenue, payment_methods: payment }))
                );
            }

            if (includeBusiness) {
                promises.push(
                    Promise.all([
                        this.getProductAnalytics(businessOptions.productLimit || 10),
                        this.getSellerAnalytics(businessOptions.sellerLimit || 10),
                        this.getOrderStatusAnalytics(),
                        this.getUserGrowthAnalytics(businessOptions.growthPeriod || 'day', businessOptions.growthLimit || 30)
                    ]).then(([products, sellers, orders, userGrowth]) => ({
                        products,
                        sellers,
                        orders,
                        user_growth: userGrowth
                    }))
                );
            }

            const resolvedResults = await Promise.all(promises);
            
            // Merge results
            resolvedResults.forEach(result => {
                Object.assign(results, result);
            });

            return {
                ...results,
                generated_at: new Date().toISOString(),
                cache_duration: '5 minutes' // Suggest caching duration
            };

        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê tổng hợp: ${error.message}`);
        }
    }
}

module.exports = StatsService;
