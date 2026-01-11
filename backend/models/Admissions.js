const pool = require('../config/database');

class Admission {
    static async admitPatient(admissionData) {
        const { patient_id, admission_date, room_number, bed_number, admission_type, diagnosis, attending_doctor, admission_notes } = admissionData;
        
        const [result] = await pool.execute(
            `INSERT INTO admissions 
             (patient_id, admission_date, room_number, bed_number, admission_type, diagnosis, attending_doctor, admission_notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient_id, admission_date, room_number, bed_number, admission_type, diagnosis, attending_doctor, admission_notes]
        );
        
        return { id: result.insertId, ...admissionData, status: 'admitted' };
    }

    static async getAdmissions(status = null) {
        let query = `SELECT a.*, 
                            p.first_name as patient_first_name,
                            p.last_name as patient_last_name,
                            p.phone as patient_phone,
                            d.first_name as doctor_first_name,
                            d.last_name as doctor_last_name
                     FROM admissions a
                     JOIN users p ON a.patient_id = p.id
                     LEFT JOIN users d ON a.attending_doctor = d.id`;
        
        let params = [];
        
        if (status) {
            query += ' WHERE a.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY a.admission_date DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getAdmissionById(id) {
        const [rows] = await pool.execute(
            `SELECT a.*, 
                    p.first_name as patient_first_name,
                    p.last_name as patient_last_name,
                    p.email as patient_email,
                    p.phone as patient_phone,
                    p.date_of_birth as patient_dob,
                    p.gender as patient_gender,
                    d.first_name as doctor_first_name,
                    d.last_name as doctor_last_name,
                    d.phone as doctor_phone
             FROM admissions a
             JOIN users p ON a.patient_id = p.id
             LEFT JOIN users d ON a.attending_doctor = d.id
             WHERE a.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async dischargePatient(id, dischargeData) {
        const { discharge_date, discharge_summary } = dischargeData;
        
        const [result] = await pool.execute(
            `UPDATE admissions 
             SET discharge_date = ?, 
                 discharge_summary = ?, 
                 status = 'discharged' 
             WHERE id = ? AND status = 'admitted'`,
            [discharge_date, discharge_summary, id]
        );
        
        return result.affectedRows > 0;
    }

    static async updateRoom(id, room_number, bed_number) {
        const [result] = await pool.execute(
            'UPDATE admissions SET room_number = ?, bed_number = ? WHERE id = ?',
            [room_number, bed_number, id]
        );
        return result.affectedRows > 0;
    }

    static async getCurrentAdmissions() {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM admissions WHERE status = 'admitted'`
        );
        return rows[0].count;
    }

    static async getAvailableBeds(roomNumber) {
        // In a real system, this would check bed availability
        const [rows] = await pool.execute(
            `SELECT bed_number FROM admissions 
             WHERE room_number = ? AND status = 'admitted'`,
            [roomNumber]
        );
        const occupiedBeds = rows.map(row => row.bed_number);
        return occupiedBeds;
    }
}

module.exports = Admission;