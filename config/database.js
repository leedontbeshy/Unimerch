const { Pool } = require('pg');
require('dotenv').config();

// Khởi tạo pool từ connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase yêu cầu SSL
  max: 5,                 // số kết nối tối đa trong pool
  idleTimeoutMillis: 30000, // thời gian giữ kết nối rảnh
  connectionTimeoutMillis: 10000, // timeout khi kết nối
});

// Bắt lỗi pool nếu có
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Hàm test connection (có thể gọi ở server.js khi start app)
const testConnection = async () => {
  let client;
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully');
    
    // Nếu muốn test query thì mở comment
    // const result = await client.query('SELECT NOW()');
    // console.log('DB Time:', result.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error.message);
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
    if (client) client.release();
  }
};

// Graceful shutdown (chỉ thực thi khi app thực sự tắt)
process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing database pool...');
  await pool.end();
  console.log('Database pool closed. Exiting process.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing database pool...');
  await pool.end();
  console.log('Database pool closed.');
  // Không gọi process.exit ở đây, Render sẽ kill container
});

module.exports = { pool, testConnection };
