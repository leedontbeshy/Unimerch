// Test logout API endpoint functionality
require('dotenv').config();

// Set test environment
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';

const { generateToken } = require('../src/utils/jwt');
const { logout } = require('../src/controllers/authController');

// Mock response object
class MockResponse {
    constructor() {
        this.statusCode = null;
        this.headers = {};
        this.body = '';
        this.ended = false;
    }
    
    writeHead(statusCode, headers = {}) {
        this.statusCode = statusCode;
        this.headers = { ...this.headers, ...headers };
    }
    
    end(data) {
        this.body = data;
        this.ended = true;
        
        // Parse and display response
        try {
            const response = JSON.parse(data);
            console.log(`Response ${this.statusCode}:`, JSON.stringify(response, null, 2));
        } catch {
            console.log(`Response ${this.statusCode}:`, data);
        }
    }
}

const testLogoutAPI = async () => {
    console.log('🧪 Testing logout API endpoint...\n');

    try {
        // Test 1: Valid logout request
        console.log('1️⃣ Testing valid logout request...');
        
        const validToken = generateToken({
            id: 123,
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
        });
        
        const mockReq1 = {
            token: validToken,
            headers: {
                authorization: `Bearer ${validToken}`
            }
        };
        
        const mockRes1 = new MockResponse();
        
        await logout(mockReq1, mockRes1);
        console.log('Test 1 completed\n');

        // Test 2: Missing token
        console.log('2️⃣ Testing missing token...');
        
        const mockReq2 = {
            token: null,
            headers: {}
        };
        
        const mockRes2 = new MockResponse();
        
        await logout(mockReq2, mockRes2);
        console.log('Test 2 completed\n');

        // Test 3: Empty token
        console.log('3️⃣ Testing empty token...');
        
        const mockReq3 = {
            token: '',
            headers: {
                authorization: 'Bearer '
            }
        };
        
        const mockRes3 = new MockResponse();
        
        await logout(mockReq3, mockRes3);
        console.log('Test 3 completed\n');

        console.log('🎉 All logout API tests completed!');
        console.log('💡 Note: Database connectivity errors are expected in this test environment.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
};

// Run the test
testLogoutAPI();