const { pool } = require('../../config/database');

class User {
    static async findByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { username, email, password, fullName, studentId, phone, address } = userData;
            const result = await pool.query(
                `INSERT INTO users (username, email, password, full_name, student_id, phone, address, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id, username, email, full_name, student_id, phone, address, role, created_at`,
                [username, email, password, fullName, studentId || null, phone || null, address || null]
            );
            
            const newUser = result.rows[0];
            return {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.full_name,
                studentId: newUser.student_id,
                phone: newUser.phone,
                address: newUser.address,
                role: newUser.role
            };
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const result = await pool.query(
                'SELECT id, username, email, full_name, student_id, phone, address, role, created_at FROM users WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async updatePassword(email, hashedPassword) {
        try {
            const result = await pool.query(
                'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id',
                [hashedPassword, email]
            );
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, userData) {
        try {
            const { fullName, studentId, phone, address } = userData;
            const result = await pool.query(
                `UPDATE users 
                 SET full_name = $1, student_id = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $5 
                 RETURNING id, username, email, full_name, student_id, phone, address, role, updated_at`,
                [fullName, studentId || null, phone || null, address || null, id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM users WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAll(limit = 50, offset = 0) {
        try {
            const result = await pool.query(
                'SELECT id, username, email, full_name, student_id, phone, address, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
                [limit, offset]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
