const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection + test query bảng users
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');

        // Query test: lấy 1 dòng từ bảng users (nếu đã import database)
        const [rows, fields] = await connection.query('SELECT * FROM users ');
        console.log('Query users thành công, data:', rows);

        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

module.exports = { pool, testConnection };
