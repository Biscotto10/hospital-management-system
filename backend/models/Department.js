const pool = require('../config/database');

class Department {
    static async getAll() {
        const [rows] = await pool.execute(
            `SELECT d.*, 
                    u.first_name as head_first_name,
                    u.last_name as head_last_name
             FROM departments d
             LEFT JOIN users u ON d.head_doctor = u.id
             ORDER BY d.name`
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            `SELECT d.*, 
                    u.first_name as head_first_name,
                    u.last_name as head_last_name
             FROM departments d
             LEFT JOIN users u ON d.head_doctor = u.id
             WHERE d.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async create(departmentData) {
        const { name, description, head_doctor, location, phone_extension } = departmentData;
        
        const [result] = await pool.execute(
            `INSERT INTO departments 
             (name, description, head_doctor, location, phone_extension) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, description, head_doctor, location, phone_extension]
        );
        
        return { id: result.insertId, ...departmentData };
    }

    static async update(id, departmentData) {
        const fields = Object.keys(departmentData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(departmentData);
        values.push(id);
        
        const [result] = await pool.execute(
            `UPDATE departments SET ${fields} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM departments WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getDepartmentStats() {
        const [rows] = await pool.execute(
            `SELECT d.name,
                    COUNT(CASE WHEN u.role = 'doctor' THEN 1 END) as doctor_count,
                    COUNT(CASE WHEN u.role = 'nurse' THEN 1 END) as nurse_count,
                    COUNT(CASE WHEN u.role = 'staff' THEN 1 END) as staff_count
             FROM departments d
             LEFT JOIN users u ON d.name = u.department
             GROUP BY d.name`
        );
        return rows;
    }
}

module.exports = Department;