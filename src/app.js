const NodeServer = require('./core/server');
const { register, login, logout, forgotPassword, resetPassword } = require('./controllers/authController');
const { testConnection } = require('../config/database');
const { authenticateToken } = require('./middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('./utils/validator');
const { requireAdmin } = require('./middleware/role');
const { getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUserById, deleteUserById } = require('./controllers/userController');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('./controllers/categoryController');
const { requireSellerOrAdmin } = require('./middleware/role');
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
    ResponseHelper.success(res, null, '🚀 UniMerch API is running with Node.js thuần!');
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


// Error handling (global)
process.on('uncaughtException', (error) => {
    console.error('UncaughtException:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;