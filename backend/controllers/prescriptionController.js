const Prescription = require('../models/Prescription');

class PrescriptionController {
    static async getMyPrescriptions(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const { status = 'active' } = req.query;
            const prescriptions = await Prescription.findByPatientId(req.user.id, status);
            res.json(prescriptions);
        } catch (error) {
            console.error('Get prescriptions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = PrescriptionController;