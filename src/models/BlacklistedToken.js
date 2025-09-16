const { pool } = require('../../config/database');

class BlacklistedToken {
    static async add(token, expiresAt) {
        try {
            if (!token) {
                throw new Error('Token is required');
            }
            if (!expiresAt) {
                throw new Error('Expiration date is required');
            }
            
            console.log('Executing database insert for blacklisted token...');
            const result = await pool.query(
                'INSERT INTO blacklisted_tokens (token, expires_at, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
                [token, expiresAt]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Failed to insert token into blacklist table');
            }
            
            console.log('Successfully inserted blacklisted token with ID:', result.rows[0].id);
            return result.rows[0];
        } catch (error) {
            // Provide more context for different types of database errors
            if (error.code === 'ECONNREFUSED') {
                console.error('Database connection refused when adding token to blacklist');
                throw new Error('Database connection failed');
            } else if (error.code === '23505') { // PostgreSQL unique violation
                console.log('Token already exists in blacklist - this is acceptable');
                return { id: 'existing', message: 'Token already blacklisted' };
            } else if (error.code === '42P01') { // PostgreSQL table does not exist
                console.error('Blacklisted tokens table does not exist');
                throw new Error('Blacklist table not found');
            } else {
                console.error('BlacklistedToken.add error:', error.message);
                throw error;
            }
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
