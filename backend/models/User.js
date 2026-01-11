const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, role, phone, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { email, password, first_name, last_name, role, phone } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            `INSERT INTO users (email, password, first_name, last_name, role, phone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, first_name, last_name, role || 'patient', phone]
        );
        
        return { id: result.insertId, email, first_name, last_name, role };
    }

    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User;