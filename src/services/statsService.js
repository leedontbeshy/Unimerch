const DashboardStatsService = require('./stats/DashboardStatsService');
const RevenueStatsService = require('./stats/RevenueStatsService');
const BusinessStatsService = require('./stats/BusinessStatsService');

/**
 * StatsService - Main service aggregator cho tất cả stats services
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

    /**
     * Business Stats
     */
    static async getProductAnalytics(limit = 10) {
        return await BusinessStatsService.getProductAnalytics(limit);
    }

    static async getOrderStatusAnalytics() {
        return await BusinessStatsService.getOrderStatusAnalytics();
    }
    // Combined admin stats removed (endpoints not used)
}

module.exports = StatsService;
