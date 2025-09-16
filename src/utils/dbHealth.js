// Database health check utility
const { pool } = require('../../config/database');

class DatabaseHealth {
    static async checkConnection() {
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            console.error('Database health check failed:', error.message);
            return false;
        }
    }
    
    static async checkBlacklistTable() {
        try {
            const client = await pool.connect();
            await client.query('SELECT 1 FROM blacklisted_tokens LIMIT 1');
            client.release();
            return true;
        } catch (error) {
            console.error('Blacklist table check failed:', error.message);
            return false;
        }
    }
}

module.exports = DatabaseHealth;