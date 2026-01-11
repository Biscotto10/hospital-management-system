const pool = require('../config/database');

class LabTest {
    static async create(labTestData) {
        const { patient_id, doctor_id, test_name, test_type, ordered_date, test_date, notes } = labTestData;
        
        const [result] = await pool.execute(
            `INSERT INTO lab_tests 
             (patient_id, doctor_id, test_name, test_type, ordered_date, test_date, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [patient_id, doctor_id, test_name, test_type, ordered_date, test_date, notes]
        );
        
        return { id: result.insertId, ...labTestData, status: 'ordered' };
    }

    static async findByPatientId(patientId) {
        const [rows] = await pool.execute(
            `SELECT lt.*, 
                    d.first_name as doctor_first_name, 
                    d.last_name as doctor_last_name
             FROM lab_tests lt
             LEFT JOIN users d ON lt.doctor_id = d.id
             WHERE lt.patient_id = ?
             ORDER BY lt.ordered_date DESC`,
            [patientId]
        );
        return rows;
    }

    static async updateResults(id, results, result_date) {
        const [result] = await pool.execute(
            'UPDATE lab_tests SET results = ?, result_date = ?, status = "completed" WHERE id = ?',
            [results, result_date, id]
        );
        return result.affectedRows > 0;
    }

    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE lab_tests SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = LabTest;