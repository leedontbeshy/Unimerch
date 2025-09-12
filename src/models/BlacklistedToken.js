const { pool } = require('../../config/database');

class BlacklistedToken {
    static async add(token, expiresAt) {
        try {
            const result = await pool.query(
                'INSERT INTO blacklisted_tokens (token, expires_at, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
                [token, expiresAt]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    static async isBlacklisted(token) {
        try {
            const result = await pool.query(
                'SELECT 1 FROM blacklisted_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
                [token]
            );
            return result.rows.length > 0;
        } catch (error) {
            throw error;
        }
    }
    
    // Cleanup expired tokens
    static async cleanup() {
        try {
            await pool.query(
                'DELETE FROM blacklisted_tokens WHERE expires_at <= CURRENT_TIMESTAMP'
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BlacklistedToken;
