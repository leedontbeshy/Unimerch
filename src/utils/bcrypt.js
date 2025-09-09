const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    try {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Password hashing failed');
    }
};

const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

module.exports = {
    hashPassword,
    comparePassword
};
