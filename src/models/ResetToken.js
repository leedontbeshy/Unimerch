const { pool } = require('../../config/database');

class ResetToken {
    static async create(email, token, expiresAt) {
        try {
            // Xóa token cũ của email này trước
            await this.deleteByEmail(email);
            
            const result = await pool.query(
                'INSERT INTO reset_tokens (email, token, expires_at, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
                [email, token, expiresAt]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    static async findByToken(token) {
        try {
            const result = await pool.query(
                'SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
                [token]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
    
    static async deleteByToken(token) {
        try {
            const result = await pool.query(
                'DELETE FROM reset_tokens WHERE token = $1',
                [token]
            );
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }
    
    static async deleteByEmail(email) {
        try {
            await pool.query(
                'DELETE FROM reset_tokens WHERE email = $1',
                [email]
            );
        } catch (error) {
            throw error;
        }
    }
    
    // Cleanup expired tokens
    static async cleanup() {
        try {
            await pool.query(
                'DELETE FROM reset_tokens WHERE expires_at <= CURRENT_TIMESTAMP'
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ResetToken;
