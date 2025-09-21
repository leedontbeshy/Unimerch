const StatsService = require('../services/statsService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * StatsController - Xử lý các endpoints Admin Dashboard Stats
 * Theo nguyên tắc SRP: Controller chỉ xử lý request/response, gọi service
 */

/**
 * 1. GET /api/admin/stats/dashboard - Thống kê tổng quan Dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const dashboardData = await StatsService.getDashboardOverview();
        return successResponse(res, dashboardData, 'Lấy thống kê dashboard thành công');
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê dashboard', 500);
    }
};

/**
 * 2. GET /api/admin/stats/recent-activity - Hoạt động gần đây
 */
const getRecentActivity = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const activityData = await StatsService.getRecentActivity(parseInt(limit));
        return successResponse(res, activityData, 'Lấy hoạt động gần đây thành công');
    } catch (error) {
        console.error('Get recent activity error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy hoạt động gần đây', 500);
    }
};

/**
 * 3. GET /api/admin/stats/revenue - Thống kê doanh thu
 */
const getRevenueStats = async (req, res) => {
    try {
        const { period = 'day', limit = 30 } = req.query;
        const revenueOptions = { period, limit: parseInt(limit) };
        
        const revenueData = await StatsService.getRevenueAnalytics(revenueOptions);
        return successResponse(res, revenueData, 'Lấy thống kê doanh thu thành công');
    } catch (error) {
        console.error('Get revenue stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê doanh thu', 500);
    }
};

/**
 * 4. GET /api/admin/stats/revenue/compare - So sánh doanh thu
 */
const compareRevenue = async (req, res) => {
    try {
        const { 
            current_period = 'day', 
            comparison_period = 'day', 
            limit = 30 
        } = req.query;
        
        const comparisonData = await StatsService.compareRevenue(
            current_period, 
            comparison_period, 
            parseInt(limit)
        );
        
        return successResponse(res, comparisonData, 'So sánh doanh thu thành công');
    } catch (error) {
        console.error('Compare revenue error:', error);
        return errorResponse(res, error.message || 'Lỗi khi so sánh doanh thu', 500);
    }
};

/**
 * 5. GET /api/admin/stats/payment-methods - Thống kê phương thức thanh toán
 */
const getPaymentMethodStats = async (req, res) => {
    try {
        const paymentData = await StatsService.getPaymentMethodAnalytics();
        return successResponse(res, paymentData, 'Lấy thống kê phương thức thanh toán thành công');
    } catch (error) {
        console.error('Get payment method stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê phương thức thanh toán', 500);
    }
};

/**
 * 6. GET /api/admin/stats/products - Thống kê sản phẩm và danh mục
 */
const getProductStats = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const productData = await StatsService.getProductAnalytics(parseInt(limit));
        return successResponse(res, productData, 'Lấy thống kê sản phẩm thành công');
    } catch (error) {
        console.error('Get product stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê sản phẩm', 500);
    }
};

/**
 * 7. GET /api/admin/stats/sellers - Thống kê người bán hàng
 */
const getSellerStats = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const sellerData = await StatsService.getSellerAnalytics(parseInt(limit));
        return successResponse(res, sellerData, 'Lấy thống kê người bán thành công');
    } catch (error) {
        console.error('Get seller stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê người bán', 500);
    }
};

/**
 * 8. GET /api/admin/stats/orders - Thống kê đơn hàng theo trạng thái
 */
const getOrderStatusStats = async (req, res) => {
    try {
        const orderData = await StatsService.getOrderStatusAnalytics();
        return successResponse(res, orderData, 'Lấy thống kê đơn hàng thành công');
    } catch (error) {
        console.error('Get order stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê đơn hàng', 500);
    }
};

/**
 * 9. GET /api/admin/stats/users/growth - Thống kê tăng trưởng người dùng
 */
const getUserGrowthStats = async (req, res) => {
    try {
        const { period = 'day', limit = 30 } = req.query;
        const growthData = await StatsService.getUserGrowthAnalytics(period, parseInt(limit));
        return successResponse(res, growthData, 'Lấy thống kê tăng trưởng người dùng thành công');
    } catch (error) {
        console.error('Get user growth stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê tăng trưởng người dùng', 500);
    }
};

/**
 * 10. GET /api/admin/stats/complete - Thống kê tổng hợp toàn bộ (cho dashboard chính)
 */
const getCompleteAdminStats = async (req, res) => {
    try {
        const {
            include_overview = 'true',
            include_revenue = 'true',
            include_business = 'true',
            revenue_period = 'day',
            revenue_limit = '30',
            product_limit = '10',
            seller_limit = '10',
            growth_period = 'day',
            growth_limit = '30'
        } = req.query;

        const options = {
            includeOverview: include_overview === 'true',
            includeRevenue: include_revenue === 'true',
            includeBusiness: include_business === 'true',
            revenueOptions: {
                period: revenue_period,
                limit: parseInt(revenue_limit)
            },
            businessOptions: {
                productLimit: parseInt(product_limit),
                sellerLimit: parseInt(seller_limit),
                growthPeriod: growth_period,
                growthLimit: parseInt(growth_limit)
            }
        };

        const completeStats = await StatsService.getCompleteAdminStats(options);
        return successResponse(res, completeStats, 'Lấy thống kê tổng hợp thành công');
    } catch (error) {
        console.error('Get complete admin stats error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy thống kê tổng hợp', 500);
    }
};

/**
 * 11. GET /api/admin/stats/summary - Tóm tắt các chỉ số quan trọng (cho widgets)
 */
const getStatsSummary = async (req, res) => {
    try {
        // Lấy các thống kê cần thiết song song
        const [dashboardData, revenueData, orderData] = await Promise.all([
            StatsService.getDashboardOverview(),
            StatsService.getRevenueAnalytics({ period: 'day', limit: 7 }),
            StatsService.getOrderStatusAnalytics()
        ]);

        // Tính toán các chỉ số tăng trưởng (so với 7 ngày trước)
        const last7Days = revenueData.data.slice(-7);
        const previous7Days = revenueData.data.slice(-14, -7);
        
        const currentWeekRevenue = last7Days.reduce((sum, day) => sum + parseFloat(day.revenue), 0);
        const previousWeekRevenue = previous7Days.reduce((sum, day) => sum + parseFloat(day.revenue), 0);
        
        const revenueGrowth = previousWeekRevenue > 0 
            ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue * 100).toFixed(2)
            : 0;

        const summary = {
            key_metrics: {
                total_revenue: dashboardData.overview.total_revenue,
                total_orders: dashboardData.overview.total_orders,
                total_users: dashboardData.overview.total_users,
                total_products: dashboardData.overview.total_products,
                conversion_rate: dashboardData.overview.conversion_rate,
                average_order_value: dashboardData.overview.average_order_value
            },
            growth_indicators: {
                revenue_growth_7d: parseFloat(revenueGrowth),
                weekly_revenue: currentWeekRevenue,
                orders_this_week: last7Days.reduce((sum, day) => sum + parseInt(day.total_orders), 0)
            },
            order_status_summary: orderData.order_status_breakdown.map(status => ({
                status: status.status,
                count: status.count,
                percentage: status.percentage_of_orders
            })),
            generated_at: new Date().toISOString()
        };

        return successResponse(res, summary, 'Lấy tóm tắt thống kê thành công');
    } catch (error) {
        console.error('Get stats summary error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy tóm tắt thống kê', 500);
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivity,
    getRevenueStats,
    compareRevenue,
    getPaymentMethodStats,
    getProductStats,
    getSellerStats,
    getOrderStatusStats,
    getUserGrowthStats,
    getCompleteAdminStats,
    getStatsSummary
};
