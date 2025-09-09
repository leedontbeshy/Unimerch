// test-user-model.js
require('dotenv').config();
const User = require('../src/models/User');

const testUserModel = async () => {
    try {
        console.log('🧪 Testing User Model...');

        // Test 1: Create user
        console.log('\n1️⃣ Testing create user...');
        const newUser = await User.create({
            username: 'testuser123',
            email: 'test@example.com',
            password: 'hashedpassword123',
            fullName: 'Test User',
            studentId: 'ST123456',
            phone: '0901234567',
            address: '123 Test Street'
        });
        console.log('✅ User created:', newUser);

        // Test 2: Find by email
        console.log('\n2️⃣ Testing find by email...');
        const foundUser = await User.findByEmail('test@example.com');
        console.log('✅ User found by email:', foundUser ? 'Yes' : 'No');

        // Test 3: Find by username
        console.log('\n3️⃣ Testing find by username...');
        const foundByUsername = await User.findByUsername('testuser123');
        console.log('✅ User found by username:', foundByUsername ? 'Yes' : 'No');

        // Test 4: Find by ID
        console.log('\n4️⃣ Testing find by ID...');
        const foundById = await User.findById(newUser.id);
        console.log('✅ User found by ID:', foundById ? 'Yes' : 'No');

        // Test 5: Update password
        console.log('\n5️⃣ Testing update password...');
        const passwordUpdated = await User.updatePassword('test@example.com', 'newhashedpassword');
        console.log('✅ Password updated:', passwordUpdated ? 'Yes' : 'No');

        // Cleanup: Delete test user
        console.log('\n🧹 Cleaning up...');
        await User.delete(newUser.id);
        console.log('✅ Test user deleted');

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
};

testUserModel();