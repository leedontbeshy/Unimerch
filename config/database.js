const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    },
    // Improved connection pool settings
    max: 5, // Reduce max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increase to 10 seconds
    acquireTimeoutMillis: 10000,    // Time to wait for connection from pool
    createTimeoutMillis: 10000,     // Time to wait for new connection creation
};

const pool = new Pool(dbConfig);

// Error handling for pool
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

// Test connection + test query bảng users
const testConnection = async () => {
    let client;
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        client = await pool.connect();
        console.log('✅ PostgreSQL Database connected successfully');

        // Query test: lấy tất cả users (PostgreSQL format)
        //const result = await client.query('SELECT * FROM users LIMIT 1 ');
        //console.log('Query users thành công, row count:', result.rowCount);
        //console.log('Sample data:', result.rows);

    } catch (error) {
        console.error('Database connection failed:', error.message);
        
        // More specific error handling
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to database server');
        } else if (error.code === '28P01') {
            console.error('❌ Invalid username/password');
        } else if (error.code === '3D000') {
            console.error('❌ Database does not exist');
        } else if (error.code === 'ENOTFOUND') {
            console.error('❌ Database host not found');
        }
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing database pool...');
    await pool.end();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Closing database pool...');
    await pool.end();
    process.exit(0);
});

module.exports = { pool, testConnection };
