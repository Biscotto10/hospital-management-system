const pool = require('../config/database');

class MedicalRecord {
    static async create(recordData) {
        const { patient_id, doctor_id, visit_date, diagnosis, symptoms, treatment, notes, follow_up_date } = recordData;
        
        const [result] = await pool.execute(
            `INSERT INTO medical_records 
             (patient_id, doctor_id, visit_date, diagnosis, symptoms, treatment, notes, follow_up_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient_id, doctor_id, visit_date, diagnosis, symptoms, treatment, notes, follow_up_date]
        );
        
        return { id: result.insertId, ...recordData };
    }

    static async findByPatientId(patientId) {
        const [rows] = await pool.execute(
            `SELECT mr.*, 
                    d.first_name as doctor_first_name, 
                    d.last_name as doctor_last_name,
                    d.specialization as doctor_specialization
             FROM medical_records mr
             LEFT JOIN users d ON mr.doctor_id = d.id
             WHERE mr.patient_id = ?
             ORDER BY mr.visit_date DESC`,
            [patientId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT mr.*, 
                    d.first_name as doctor_first_name, 
                    d.last_name as doctor_last_name,
                    d.phone as doctor_phone,
                    d.email as doctor_email,
                    p.first_name as patient_first_name,
                    p.last_name as patient_last_name
             FROM medical_records mr
             LEFT JOIN users d ON mr.doctor_id = d.id
             JOIN users p ON mr.patient_id = p.id
             WHERE mr.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async update(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        const [result] = await pool.execute(
            `UPDATE medical_records SET ${fields} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM medical_records WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MedicalRecord;