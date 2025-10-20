const StatsService = require('../services/statsService');
const { successResponse, errorResponse } = require('../utils/response');



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

// payment-methods endpoint removed

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

/** (seller stats removed) */

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

// users/growth endpoint removed

// complete stats endpoint removed

// summary endpoint removed

module.exports = {
    getDashboardStats,
    getRecentActivity,
    getRevenueStats,
    getProductStats,
    getOrderStatusStats
};
