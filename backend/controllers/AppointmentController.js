const Appointment = require('../models/Appointment');

class AppointmentController {
    static async createAppointment(req, res) {
        try {
            const { doctor_id, appointment_date, appointment_time, department, reason } = req.body;
            
            // Validate appointment date/time
            const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
            const now = new Date();
            
            if (appointmentDateTime < now) {
                return res.status(400).json({ message: 'Appointment cannot be in the past' });
            }
            
            const appointment = await Appointment.create({
                patient_id: req.user.id,
                doctor_id,
                appointment_date,
                appointment_time,
                department,
                reason
            });
            
            res.status(201).json({
                message: 'Appointment scheduled successfully',
                appointment
            });
        } catch (error) {
            console.error('Create appointment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async getMyAppointments(req, res) {
        try {
            let appointments;
            
            if (req.user.role === 'patient') {
                appointments = await Appointment.findByPatientId(req.user.id);
            } else if (req.user.role === 'doctor') {
                appointments = await Appointment.findByDoctorId(req.user.id);
            } else {
                return res.status(403).json({ message: 'Access denied' });
            }
            
            res.json(appointments);
        } catch (error) {
            console.error('Get appointments error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            
            const updated = await Appointment.updateStatus(id, status);
            if (!updated) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            
            res.json({ message: 'Appointment status updated successfully' });
        } catch (error) {
            console.error('Update appointment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async getAppointmentById(req, res) {
        try {
            const { id } = req.params;
            
            const pool = require('../config/database');
            const [rows] = await pool.execute(
                `SELECT a.*, 
                        p.first_name as patient_first_name, 
                        p.last_name as patient_last_name,
                        p.phone as patient_phone,
                        d.first_name as doctor_first_name, 
                        d.last_name as doctor_last_name
                 FROM appointments a
                 JOIN users p ON a.patient_id = p.id
                 JOIN users d ON a.doctor_id = d.id
                 WHERE a.id = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            console.error('Get appointment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = AppointmentController;