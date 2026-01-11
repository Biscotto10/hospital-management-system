const pool = require('../config/database');

class Staff {
    static async getStaffSchedule(staffId, startDate, endDate) {
        const [rows] = await pool.execute(
            `SELECT * FROM staff_schedules 
             WHERE staff_id = ? 
             AND schedule_date BETWEEN ? AND ?
             ORDER BY schedule_date, start_time`,
            [staffId, startDate, endDate]
        );
        return rows;
    }

    static async addSchedule(scheduleData) {
        const { staff_id, schedule_date, start_time, end_time, shift_type, department, notes } = scheduleData;
        
        const [result] = await pool.execute(
            `INSERT INTO staff_schedules 
             (staff_id, schedule_date, start_time, end_time, shift_type, department, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [staff_id, schedule_date, start_time, end_time, shift_type, department, notes]
        );
        
        return { id: result.insertId, ...scheduleData };
    }

    static async getTasks(staffId, status = null) {
        let query = `SELECT t.*, 
                            u.first_name as assigned_by_first_name,
                            u.last_name as assigned_by_last_name
                     FROM staff_tasks t
                     LEFT JOIN users u ON t.assigned_by = u.id
                     WHERE t.staff_id = ?`;
        let params = [staffId];
        
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY t.priority DESC, t.due_date ASC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async addTask(taskData) {
        const { staff_id, title, description, priority, status, due_date, assigned_by } = taskData;
        
        const [result] = await pool.execute(
            `INSERT INTO staff_tasks 
             (staff_id, title, description, priority, status, due_date, assigned_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [staff_id, title, description, priority, status || 'pending', due_date, assigned_by]
        );
        
        return { id: result.insertId, ...taskData };
    }

    static async updateTaskStatus(taskId, status) {
        const updateData = { status };
        if (status === 'completed') {
            updateData.completed_at = new Date();
        }
        
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(taskId);
        
        const [result] = await pool.execute(
            `UPDATE staff_tasks SET ${fields} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async getStaffByDepartment(department) {
        const [rows] = await pool.execute(
            `SELECT id, first_name, last_name, email, phone, role, department 
             FROM users 
             WHERE department = ? AND role IN ('staff', 'nurse', 'doctor')
             ORDER BY role, first_name`,
            [department]
        );
        return rows;
    }

    static async getAllStaff() {
        const [rows] = await pool.execute(
            `SELECT id, first_name, last_name, email, phone, role, department 
             FROM users 
             WHERE role IN ('staff', 'nurse', 'admin')
             ORDER BY department, role, first_name`
        );
        return rows;
    }

    static async getStaffCount() {
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctors,
                COUNT(CASE WHEN role = 'nurse' THEN 1 END) as nurses,
                COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
             FROM users`
        );
        return rows[0];
    }
}

module.exports = Staff;