const Stats = require('../../models/Stats');

/**
 * BusinessStatsService - Xử lý business logic cho thống kê kinh doanh
 * Theo nguyên tắc SRP: Service chỉ xử lý logic nghiệp vụ cho business stats
 */
class BusinessStatsService {
    
    /**
     * Lấy thống kê sản phẩm và danh mục
     */
    static async getProductAnalytics(limit = 10) {
        try {
            const validLimit = this.validateLimit(limit, 50);
            
            const [topProducts, categoryStats] = await Promise.all([
                Stats.getTopSellingProducts(validLimit),
                Stats.getCategoryStats()
            ]);

            // Format dữ liệu sản phẩm
            const formattedProducts = topProducts.map(product => ({
                ...product,
                price: parseFloat(product.price),
                discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
                total_sold: parseInt(product.total_sold),
                total_revenue: parseFloat(product.total_revenue),
                order_count: parseInt(product.order_count),
                avg_revenue_per_order: product.order_count > 0 
                    ? (parseFloat(product.total_revenue) / parseInt(product.order_count)).toFixed(2)
                    : 0
            }));

            // Format dữ liệu danh mục
            const formattedCategories = categoryStats.map(category => ({
                ...category,
                product_count: parseInt(category.product_count),
                available_products: parseInt(category.available_products),
                total_sold: parseInt(category.total_sold),
                total_revenue: parseFloat(category.total_revenue),
                avg_rating: parseFloat(category.avg_rating),
                review_count: parseInt(category.review_count),
                avg_revenue_per_product: category.product_count > 0
                    ? (parseFloat(category.total_revenue) / parseInt(category.product_count)).toFixed(2)
                    : 0
            }));

            // Tính tổng doanh thu để tính phần trăm
            const totalRevenue = formattedCategories.reduce((sum, cat) => sum + cat.total_revenue, 0);
            
            const categoriesWithPercentage = formattedCategories.map(category => ({
                ...category,
                revenue_percentage: totalRevenue > 0 
                    ? ((category.total_revenue / totalRevenue) * 100).toFixed(2)
                    : 0
            }));

            return {
                top_products: formattedProducts,
                category_analysis: categoriesWithPercentage,
                summary: {
                    total_categories: categoriesWithPercentage.length,
                    total_revenue_all_categories: totalRevenue,
                    best_performing_category: categoriesWithPercentage[0]?.name || null,
                    avg_products_per_category: categoriesWithPercentage.length > 0
                        ? (categoriesWithPercentage.reduce((sum, cat) => sum + cat.product_count, 0) / categoriesWithPercentage.length).toFixed(1)
                        : 0
                },
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê sản phẩm: ${error.message}`);
        }
    }

    /**
     * Lấy thống kê người bán hàng
     */
    // getSellerAnalytics removed (endpoint unused)

    /**
     * Lấy thống kê đơn hàng theo trạng thái
     */
    static async getOrderStatusAnalytics() {
        try {
            const orderStats = await Stats.getOrderStatusStats();
            
            // Format dữ liệu và tính phần trăm
            const totalOrders = orderStats.reduce((sum, item) => sum + parseInt(item.count), 0);
            const totalAmount = orderStats.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
            
            const formattedStats = orderStats.map(stat => ({
                status: stat.status,
                count: parseInt(stat.count),
                total_amount: parseFloat(stat.total_amount),
                avg_amount: parseFloat(stat.avg_amount),
                percentage_of_orders: totalOrders > 0 
                    ? ((parseInt(stat.count) / totalOrders) * 100).toFixed(2)
                    : 0,
                percentage_of_revenue: totalAmount > 0
                    ? ((parseFloat(stat.total_amount) / totalAmount) * 100).toFixed(2)
                    : 0,
                status_label: this.getStatusLabel(stat.status)
            }));

            // Tính conversion funnel
            const conversionFunnel = this.calculateConversionFunnel(formattedStats);

            return {
                order_status_breakdown: formattedStats,
                conversion_funnel: conversionFunnel,
                summary: {
                    total_orders: totalOrders,
                    total_revenue: totalAmount,
                    avg_order_value: totalOrders > 0 ? (totalAmount / totalOrders).toFixed(2) : 0,
                    completion_rate: this.calculateCompletionRate(formattedStats)
                },
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê trạng thái đơn hàng: ${error.message}`);
        }
    }

    /**
     * Lấy thống kê tăng trưởng người dùng
     */
    // getUserGrowthAnalytics removed (endpoint unused)

    /**
     * Tính conversion funnel
     */
    static calculateConversionFunnel(orderStats) {
        const pending = orderStats.find(s => s.status === 'pending')?.count || 0;
        const processing = orderStats.find(s => s.status === 'processing')?.count || 0;
        const shipped = orderStats.find(s => s.status === 'shipped')?.count || 0;
        const delivered = orderStats.find(s => s.status === 'delivered')?.count || 0;
        const cancelled = orderStats.find(s => s.status === 'cancelled')?.count || 0;

        const total = pending + processing + shipped + delivered + cancelled;

        return {
            pending_to_processing: total > 0 ? ((processing / total) * 100).toFixed(2) : 0,
            processing_to_shipped: total > 0 ? ((shipped / total) * 100).toFixed(2) : 0,
            shipped_to_delivered: total > 0 ? ((delivered / total) * 100).toFixed(2) : 0,
            overall_completion: total > 0 ? ((delivered / total) * 100).toFixed(2) : 0,
            cancellation_rate: total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0
        };
    }

    /**
     * Tính tỷ lệ hoàn thành đơn hàng
     */
    static calculateCompletionRate(orderStats) {
        const completed = orderStats.find(s => s.status === 'delivered')?.count || 0;
        const total = orderStats.reduce((sum, item) => sum + item.count, 0);
        return total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
    }

    /**
     * Tìm kỳ có đỉnh cao nhất
     */
    static findPeakPeriod(data, field) {
        if (!data.length) return null;
        return data.reduce((max, current) => 
            parseInt(current[field]) > parseInt(max[field]) ? current : max
        );
    }

    /**
     * Lấy label cho trạng thái
     */
    static getStatusLabel(status) {
        const labels = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipped': 'Đã gửi hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
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

module.exports = BusinessStatsService;
