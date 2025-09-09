// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');
const ApiResponse = require('../utils/response');

class AuthController {
    // POST /api/auth/register
    async register(req, res) {
        try {
            const { username, email, password, full_name, student_id, phone, address, role } = req.body;

            // Check if user already exists
            const [existingUsers] = await pool.execute(
                'SELECT id FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUsers.length > 0) {
                return ApiResponse.badRequest(res, 'User with this email or username already exists');
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert new user
            const query = `
                INSERT INTO users (username, email, password, full_name, student_id, phone, address, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                username,
                email,
                hashedPassword,
                full_name,
                student_id || null,
                phone || null,
                address || null,
                role || 'user'
            ]);

            // Generate JWT tokens
            const tokens = this.generateTokens(result.insertId);

            // Get created user (without password)
            const [newUser] = await pool.execute(
                'SELECT id, username, email, full_name, student_id, phone, address, role, created_at FROM users WHERE id = ?',
                [result.insertId]
            );

            return ApiResponse.success(res, {
                user: newUser[0],
                tokens
            }, 'User registered successfully', 201);

        } catch (error) {
            console.error('Registration error:', error);
            return ApiResponse.error(res, 'Failed to register user');
        }
    }

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const [users] = await pool.execute(
                'SELECT id, username, email, password, full_name, role FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return ApiResponse.unauthorized(res, 'Invalid email or password');
            }

            const user = users[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return ApiResponse.unauthorized(res, 'Invalid email or password');
            }

            // Generate JWT tokens
            const tokens = this.generateTokens(user.id);

            // Remove password from response
            delete user.password;

            // Update last login
            await pool.execute(
                'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [user.id]
            );

            return ApiResponse.success(res, {
                user,
                tokens
            }, 'Login successful');

        } catch (error) {
            console.error('Login error:', error);
            return ApiResponse.error(res, 'Failed to login');
        }
    }

    // POST /api/auth/logout
    async logout(req, res) {
        try {
            // In a production app, you might want to blacklist the token
            // For now, we'll just return success
            return ApiResponse.success(res, null, 'Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            return ApiResponse.error(res, 'Failed to logout');
        }
    }

    // POST /api/auth/refresh
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return ApiResponse.badRequest(res, 'Refresh token is required');
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

            // Check if user still exists
            const [users] = await pool.execute(
                'SELECT id, username, email, role FROM users WHERE id = ?',
                [decoded.userId]
            );

            if (users.length === 0) {
                return ApiResponse.unauthorized(res, 'Invalid refresh token');
            }

            // Generate new tokens
            const tokens = this.generateTokens(decoded.userId);

            return ApiResponse.success(res, { tokens }, 'Tokens refreshed successfully');

        } catch (error) {
            console.error('Refresh token error:', error);
            return ApiResponse.unauthorized(res, 'Invalid refresh token');
        }
    }

    // POST /api/auth/forgot-password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Check if user exists
            const [users] = await pool.execute(
                'SELECT id, username, email FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                // Don't reveal if email exists or not
                return ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
            }

            const user = users[0];

            // Generate reset token (expires in 1 hour)
            const resetToken = jwt.sign(
                { userId: user.id, type: 'password_reset' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // In production, send email with reset link
            // For demo purposes, we'll just return the token
            console.log(`Password reset token for ${email}: ${resetToken}`);

            return ApiResponse.success(res, 
                process.env.NODE_ENV === 'development' ? { resetToken } : null, 
                'If the email exists, a reset link has been sent'
            );

        } catch (error) {
            console.error('Forgot password error:', error);
            return ApiResponse.error(res, 'Failed to process password reset request');
        }
    }

    // POST /api/auth/reset-password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return ApiResponse.badRequest(res, 'Token and new password are required');
            }

            // Verify reset token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.type !== 'password_reset') {
                return ApiResponse.unauthorized(res, 'Invalid reset token');
            }

            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await pool.execute(
                'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, decoded.userId]
            );

            return ApiResponse.success(res, null, 'Password reset successfully');

        } catch (error) {
            console.error('Reset password error:', error);
            if (error.name === 'JsonWebTokenError') {
                return ApiResponse.unauthorized(res, 'Invalid reset token');
            }
            return ApiResponse.error(res, 'Failed to reset password');
        }
    }

    // Helper method to generate JWT tokens
    generateTokens(userId) {
        const accessToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        const refreshToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRE || '7d'
        };
    }
}

module.exports = new AuthController();