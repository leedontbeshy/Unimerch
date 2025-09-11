const express = require('express');
const cors = require('cors');
const { testConnection } = require('../config/database');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection (commented out for now)
testConnection();

// Routes
app.use('/api', require('./routes'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'UniMerch API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;