// test-supabase-connection.js (temporary file)
require('dotenv').config();
const { Client } = require('pg');

const testConnection = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Supabase connection successful!');
        
        const result = await client.query('SELECT version()');
        console.log('PostgreSQL version:', result.rows[0].version);
        
        await client.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
};

testConnection();