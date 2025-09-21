const NodeServer = require('./core/server');
const { register, login, logout, forgotPassword, resetPassword } = require('./controllers/authController');
const { testConnection } = require('../config/database');
const { authenticateToken } = require('./middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('./validation/authValidation');
const { requireAdmin } = require('./middleware/role');
const { getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUserById, deleteUserById, getUserStats } = require('./controllers/userController');
const { validateUpdateProfile, validateChangePassword, validateUserId, validateUsersQuery, validateUpdateUserByAdmin } = require('./validation/userValidation');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('./controllers/categoryController');
const { validateCreateCategory, validateUpdateCategory, validateCategoryId } = require('./validation/categoryValidation');
const { requireSellerOrAdmin } = require('./middleware/role');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsBySeller, getFeaturedProducts, getProductsByColorSize } = require('./controllers/productController');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus, cancelOrder, getAllOrders, getSellerOrders, getOrderItems, getOrderStats } = require('./controllers/orderController');
const { validateCreateOrder, validateUpdateOrderStatus, validateOrderId, validateOrdersQuery } = require('./validation/orderValidation');
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart, validateCart, getCartCount, getCartTotal } = require('./controllers/cartController');
const { createPayment, getPaymentsByOrderId, getPaymentById, updatePaymentStatus, getUserPayments, getAllPayments, getPaymentStats, getRevenue, refundPayment } = require('./controllers/paymentController');
const { getReviews, getReviewById, getReviewsByProduct, getReviewsByUser, getMyReviews, createReview, updateReview, deleteReview, getProductRatingStats, getTopRatedProducts, checkUserReviewed } = require('./controllers/reviewController');
const { searchProducts, searchCategories, searchUsers, searchOrders, searchReviews, globalSearch, getSuggestions, getPopularKeywords, getSearchFilters, getSearchStats } = require('./controllers/searchController');
const { validateProductSearch, validateCategorySearch, validateUserSearch, validateOrderSearch, validateReviewSearch, validateGlobalSearch } = require('./validation/searchValidation');
const { getDashboardStats, getRecentActivity, getRevenueStats, compareRevenue, getPaymentMethodStats, getProductStats, getSellerStats, getOrderStatusStats, getUserGrowthStats, getCompleteAdminStats, getStatsSummary } = require('./controllers/statsController');
const { validateRevenueStatsQuery, validateRevenueComparisonQuery, validateUserGrowthQuery, validateLimitQuery, validateRecentActivityQuery, validateCompleteStatsQuery } = require('./validation/statsValidation');

require('dotenv').config();

// Tạo server instance
const server = new NodeServer();

// Test database connection 
testConnection();

// Basic middleware for logging
server.use(async (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.pathname}`);
    await next();
});

// Basic route
server.get('/', (req, res) => {
    const ResponseHelper = require('./core/response');
    ResponseHelper.success(res, null, '🚀 UniMerch API is running');
});

// Auth routes với validation middlewares (VANILLA NODE.JS)
server.post('/api/auth/register', validateRegister, register);
server.post('/api/auth/login', validateLogin, login);
server.post('/api/auth/logout', authenticateToken, logout);
server.post('/api/auth/forgot-password', validateForgotPassword, forgotPassword);
server.post('/api/auth/reset-password', validateResetPassword, resetPassword);

// User Management routes
server.get('/api/users/profile', authenticateToken, getProfile);
server.put('/api/users/profile', authenticateToken, validateUpdateProfile, updateProfile);
server.put('/api/users/change-password', authenticateToken, validateChangePassword, changePassword);
server.get('/api/users/stats', authenticateToken, requireAdmin, getUserStats);
server.get('/api/users', authenticateToken, requireAdmin, validateUsersQuery, getAllUsers);
server.get('/api/users/:id', authenticateToken, requireAdmin, validateUserId, getUserById);
server.put('/api/users/:id', authenticateToken, requireAdmin, validateUpdateUserByAdmin, updateUserById);
server.delete('/api/users/:id', authenticateToken, requireAdmin, validateUserId, deleteUserById);

// Category routes
server.get('/api/categories', getCategories);
server.get('/api/categories/:id', validateCategoryId, getCategoryById);
server.post('/api/categories', authenticateToken, requireSellerOrAdmin, validateCreateCategory, createCategory);
server.put('/api/categories/:id', authenticateToken, requireSellerOrAdmin, validateUpdateCategory, updateCategory);
server.delete('/api/categories/:id', authenticateToken, requireAdmin, validateCategoryId, deleteCategory);

// Product routes
server.get('/api/products', getProducts);
server.get('/api/products/search', getProductsByColorSize); // Thêm route mới
server.get('/api/products/featured', getFeaturedProducts);
server.get('/api/products/:id', getProductById);
server.post('/api/products', authenticateToken, requireSellerOrAdmin, createProduct);
server.put('/api/products/:id', authenticateToken, requireSellerOrAdmin, updateProduct);
server.delete('/api/products/:id', authenticateToken, requireSellerOrAdmin, deleteProduct);

// Order routes
server.post('/api/orders', authenticateToken, validateCreateOrder, createOrder);
server.get('/api/orders', authenticateToken, validateOrdersQuery, getUserOrders);
server.get('/api/orders/stats', authenticateToken, getOrderStats);
server.get('/api/orders/:id', authenticateToken, validateOrderId, getOrderById);
server.put('/api/orders/:id/status', authenticateToken, validateUpdateOrderStatus, updateOrderStatus);
server.delete('/api/orders/:id', authenticateToken, validateOrderId, cancelOrder);
server.get('/api/orders/:id/items', authenticateToken, validateOrderId, getOrderItems);

// Admin order routes
server.get('/api/admin/orders', authenticateToken, requireAdmin, validateOrdersQuery, getAllOrders);

// Seller order routes
server.get('/api/seller/orders', authenticateToken, requireSellerOrAdmin, validateOrdersQuery, getSellerOrders);

// Shopping Cart routes
server.post('/api/cart/add', authenticateToken, addToCart);
server.get('/api/cart', authenticateToken, getCart);
server.get('/api/cart/validate', authenticateToken, validateCart);
server.get('/api/cart/count', authenticateToken, getCartCount);
server.get('/api/cart/total', authenticateToken, getCartTotal);
server.put('/api/cart/update/:id', authenticateToken, updateCartItem);
server.delete('/api/cart/remove/:id', authenticateToken, removeFromCart);
server.delete('/api/cart/clear', authenticateToken, clearCart);

// Payment routes 
server.post('/api/payments', authenticateToken, createPayment);
server.get('/api/payments/user', authenticateToken, getUserPayments);
server.get('/api/payments/stats', authenticateToken, requireAdmin, getPaymentStats);
server.get('/api/payments/revenue', authenticateToken, requireAdmin, getRevenue);
server.get('/api/payments/detail/:id', authenticateToken, getPaymentById);
server.put('/api/payments/:id/status', authenticateToken, updatePaymentStatus);
server.post('/api/payments/:id/refund', authenticateToken, requireAdmin, refundPayment);
server.get('/api/payments/:orderId', authenticateToken, getPaymentsByOrderId); // ĐẶT CUỐI CÙNG

// Admin payment routes
server.get('/api/admin/payments', authenticateToken, requireAdmin, getAllPayments);

// Review routes
server.get('/api/reviews', getReviews);
server.get('/api/reviews/my-reviews', authenticateToken, getMyReviews);
server.get('/api/reviews/top-products', getTopRatedProducts);
server.get('/api/reviews/:id', getReviewById);
server.post('/api/reviews', authenticateToken, createReview);
server.put('/api/reviews/:id', authenticateToken, updateReview);
server.delete('/api/reviews/:id', authenticateToken, deleteReview);

// Product review routes
server.get('/api/reviews/product/:product_id', getReviewsByProduct);
server.get('/api/reviews/product/:product_id/stats', getProductRatingStats);
server.get('/api/reviews/check/:product_id', authenticateToken, checkUserReviewed);

// Admin review routes
server.get('/api/reviews/user/:user_id', authenticateToken, requireAdmin, getReviewsByUser);

// Search routes
server.get('/api/search/products', validateProductSearch, searchProducts);
server.get('/api/search/categories', validateCategorySearch, searchCategories);
server.get('/api/search/users', authenticateToken, requireAdmin, validateUserSearch, searchUsers);
server.get('/api/search/orders', authenticateToken, validateOrderSearch, searchOrders);
server.get('/api/search/reviews', validateReviewSearch, searchReviews);
server.get('/api/search/global', validateGlobalSearch, globalSearch);
server.get('/api/search/suggestions', getSuggestions);
server.get('/api/search/popular', getPopularKeywords);
server.get('/api/search/filters', getSearchFilters);
server.get('/api/search/stats', authenticateToken, requireAdmin, getSearchStats);

// Admin Stats routes
server.get('/api/admin/stats/dashboard', authenticateToken, requireAdmin, getDashboardStats);
server.get('/api/admin/stats/recent-activity', authenticateToken, requireAdmin, validateRecentActivityQuery, getRecentActivity);
server.get('/api/admin/stats/revenue', authenticateToken, requireAdmin, validateRevenueStatsQuery, getRevenueStats);
server.get('/api/admin/stats/revenue/compare', authenticateToken, requireAdmin, validateRevenueComparisonQuery, compareRevenue);
server.get('/api/admin/stats/payment-methods', authenticateToken, requireAdmin, getPaymentMethodStats);
server.get('/api/admin/stats/products', authenticateToken, requireAdmin, validateLimitQuery, getProductStats);
server.get('/api/admin/stats/sellers', authenticateToken, requireAdmin, validateLimitQuery, getSellerStats);
server.get('/api/admin/stats/orders', authenticateToken, requireAdmin, getOrderStatusStats);
server.get('/api/admin/stats/users/growth', authenticateToken, requireAdmin, validateUserGrowthQuery, getUserGrowthStats);
server.get('/api/admin/stats/complete', authenticateToken, requireAdmin, validateCompleteStatsQuery, getCompleteAdminStats);
server.get('/api/admin/stats/summary', authenticateToken, requireAdmin, getStatsSummary);

// Error handling (global)
process.on('uncaughtException', (error) => {
    console.error('UncaughtException:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;