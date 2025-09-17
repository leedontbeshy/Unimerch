const NodeServer = require('./core/server');
const { register, login, logout, forgotPassword, resetPassword } = require('./controllers/authController');
const { testConnection } = require('../config/database');
const { authenticateToken } = require('./middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('./utils/validator');
const { requireAdmin } = require('./middleware/role');
const { getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUserById, deleteUserById } = require('./controllers/userController');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('./controllers/categoryController');
const { requireSellerOrAdmin } = require('./middleware/role');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsBySeller, getFeaturedProducts, getProductsByColorSize } = require('./controllers/productController');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus, cancelOrder, getAllOrders, getSellerOrders, getOrderItems, getOrderStats } = require('./controllers/orderController');
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart, validateCart, getCartCount, getCartTotal } = require('./controllers/cartController');
const { createPayment, getPaymentsByOrderId, getPaymentById, updatePaymentStatus, getUserPayments, getAllPayments, getPaymentStats, getRevenue, refundPayment } = require('./controllers/paymentController');

require('dotenv').config();

// Tạo server instance
const server = new NodeServer();

// Test database connection (GIỮ NGUYÊN - từ database config)
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
server.put('/api/users/profile', authenticateToken, updateProfile);
server.put('/api/users/change-password', authenticateToken, changePassword);
server.get('/api/users', authenticateToken, requireAdmin, getAllUsers);
server.get('/api/users/:id', authenticateToken, requireAdmin, getUserById);
server.put('/api/users/:id', authenticateToken, requireAdmin, updateUserById);
server.delete('/api/users/:id', authenticateToken, requireAdmin, deleteUserById);

// Category routes
server.get('/api/categories', getCategories);
server.get('/api/categories/:id', getCategoryById);
server.post('/api/categories', authenticateToken, requireSellerOrAdmin, createCategory);
server.put('/api/categories/:id', authenticateToken, requireSellerOrAdmin, updateCategory);
server.delete('/api/categories/:id', authenticateToken, requireAdmin, deleteCategory);

// Product routes
server.get('/api/products', getProducts);
server.get('/api/products/search', getProductsByColorSize); // Thêm route mới
server.get('/api/products/featured', getFeaturedProducts);
server.get('/api/products/:id', getProductById);
server.post('/api/products', authenticateToken, requireSellerOrAdmin, createProduct);
server.put('/api/products/:id', authenticateToken, requireSellerOrAdmin, updateProduct);
server.delete('/api/products/:id', authenticateToken, requireSellerOrAdmin, deleteProduct);

// Order routes
server.post('/api/orders', authenticateToken, createOrder);
server.get('/api/orders', authenticateToken, getUserOrders);
server.get('/api/orders/stats', authenticateToken, getOrderStats);
server.get('/api/orders/:id', authenticateToken, getOrderById);
server.put('/api/orders/:id/status', authenticateToken, updateOrderStatus);
server.delete('/api/orders/:id', authenticateToken, cancelOrder);
server.get('/api/orders/:id/items', authenticateToken, getOrderItems);

// Admin order routes
server.get('/api/admin/orders', authenticateToken, requireAdmin, getAllOrders);

// Seller order routes
server.get('/api/seller/orders', authenticateToken, requireSellerOrAdmin, getSellerOrders);

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

// Error handling (global)
process.on('uncaughtException', (error) => {
    console.error('UncaughtException:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;