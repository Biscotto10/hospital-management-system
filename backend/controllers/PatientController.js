const Patient = require('../models/Patient');
const User = require('../models/User');

class PatientController {
    static async getAllPatients(req, res) {
        try {
            const patients = await Patient.getAll();
            res.json(patients);
        } catch (error) {
            console.error('Get patients error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async getPatientById(req, res) {
        try {
            const { id } = req.params;
            const patient = await Patient.findByUserId(id);
            
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            
            res.json(patient);
        } catch (error) {
            console.error('Get patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async createPatient(req, res) {
        try {
            const { email, password, first_name, last_name, phone, blood_group, allergies } = req.body;
            
            // Create user first
            const user = await User.create({
                email,
                password,
                first_name,
                last_name,
                role: 'patient',
                phone
            });
            
            // Create patient record
            const patient = await Patient.create({
                user_id: user.id,
                blood_group,
                allergies
            });
            
            res.status(201).json({
                message: 'Patient created successfully',
                patient: {
                    ...patient,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone: user.phone
                }
            });
        } catch (error) {
            console.error('Create patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updatePatient(req, res) {
        try {
            const { id } = req.params;
            const { blood_group, allergies, emergency_contact } = req.body;
            
            // Update patient record
            const [result] = await pool.execute(
                `UPDATE patients 
                 SET blood_group = ?, allergies = ?, emergency_contact = ?, updated_at = NOW()
                 WHERE user_id = ?`,
                [blood_group, allergies, emergency_contact, id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            
            res.json({ message: 'Patient updated successfully' });
        } catch (error) {
            console.error('Update patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = PatientController;