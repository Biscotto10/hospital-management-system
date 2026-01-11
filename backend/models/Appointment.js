const pool = require('../config/database');

class Appointment {
    static async create(appointmentData) {
        const { patient_id, doctor_id, appointment_date, appointment_time, department, reason } = appointmentData;
        
        const [result] = await pool.execute(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, department, reason) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [patient_id, doctor_id, appointment_date, appointment_time, department, reason]
        );
        
        return { id: result.insertId, ...appointmentData, status: 'scheduled' };
    }

    static async findByPatientId(patientId) {
        const [rows] = await pool.execute(
            `SELECT a.*, 
                    d.first_name as doctor_first_name, 
                    d.last_name as doctor_last_name
             FROM appointments a
             JOIN users d ON a.doctor_id = d.id
             WHERE a.patient_id = ?
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
            [patientId]
        );
        return rows;
    }

    static async findByDoctorId(doctorId) {
        const [rows] = await pool.execute(
            `SELECT a.*, 
                    p.first_name as patient_first_name, 
                    p.last_name as patient_last_name,
                    p.phone as patient_phone
             FROM appointments a
             JOIN users p ON a.patient_id = p.id
             WHERE a.doctor_id = ?
             ORDER BY a.appointment_date, a.appointment_time`,
            [doctorId]
        );
        return rows;
    }

    static async updateStatus(appointmentId, status) {
        const [result] = await pool.execute(
            'UPDATE appointments SET status = ? WHERE id = ?',
            [status, appointmentId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Appointment;