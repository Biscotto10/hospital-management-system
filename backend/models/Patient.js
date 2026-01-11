const pool = require('../config/database');

class Patient {
    static async create(patientData) {
        const { user_id, blood_group, allergies } = patientData;
        
        const [result] = await pool.execute(
            `INSERT INTO patients (user_id, blood_group, allergies) 
             VALUES (?, ?, ?)`,
            [user_id, blood_group, allergies]
        );
        
        return { id: result.insertId, ...patientData };
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT p.*, u.email, u.first_name, u.last_name, u.phone 
             FROM patients p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    static async getAll() {
        const [rows] = await pool.execute(
            `SELECT p.*, u.email, u.first_name, u.last_name, u.phone, u.created_at 
             FROM patients p 
             JOIN users u ON p.user_id = u.id`
        );
        return rows;
    }
}

module.exports = Patient;