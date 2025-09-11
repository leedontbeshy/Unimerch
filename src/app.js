const NodeServer = require('./core/server');
const { register, login, logout, forgotPassword, resetPassword } = require('./controllers/authController');
const { testConnection } = require('../config/database');
const { authenticateToken } = require('./middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('./utils/validator');
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

// Error handling (global)
process.on('uncaughtException', (error) => {
    console.error('UncaughtException:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;
