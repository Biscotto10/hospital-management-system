const pool = require('../config/database');

class Prescription {
    static async create(prescriptionData) {
        const { patient_id, doctor_id, medication_name, dosage, frequency, start_date, end_date, refills, instructions } = prescriptionData;
        
        const [result] = await pool.execute(
            `INSERT INTO prescriptions 
             (patient_id, doctor_id, medication_name, dosage, frequency, start_date, end_date, refills, instructions) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient_id, doctor_id, medication_name, dosage, frequency, start_date, end_date, refills, instructions]
        );
        
        return { id: result.insertId, ...prescriptionData, status: 'active' };
    }

    static async findByPatientId(patientId, status = 'active') {
        const [rows] = await pool.execute(
            `SELECT p.*, 
                    d.first_name as doctor_first_name, 
                    d.last_name as doctor_last_name
             FROM prescriptions p
             LEFT JOIN users d ON p.doctor_id = d.id
             WHERE p.patient_id = ? AND p.status = ?
             ORDER BY p.start_date DESC`,
            [patientId, status]
        );
        return rows;
    }

    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE prescriptions SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Prescription;