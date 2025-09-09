const { pool } = require('../../config/database');

class User {
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { username, email, password, fullName, studentId, phone, address } = userData;
            const [result] = await pool.execute(
                `INSERT INTO users (username, email, password, full_name, student_id, phone, address, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [username, email, password, fullName, studentId || null, phone || null, address || null]
            );
            
            return {
                id: result.insertId,
                username,
                email,
                fullName,
                studentId,
                phone,
                address
            };
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, username, email, full_name, student_id, phone, address, role, created_at FROM users WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
