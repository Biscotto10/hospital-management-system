const MedicalRecord = require('../models/MedicalRecord');

class MedicalRecordController {
    static async getMyRecords(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const records = await MedicalRecord.findByPatientId(req.user.id);
            res.json(records);
        } catch (error) {
            console.error('Get medical records error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async getRecordById(req, res) {
        try {
            const { id } = req.params;
            const record = await MedicalRecord.findById(id);
            
            if (!record) {
                return res.status(404).json({ message: 'Medical record not found' });
            }
            
            // Check if patient owns this record
            if (req.user.role === 'patient' && record.patient_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            
            res.json(record);
        } catch (error) {
            console.error('Get medical record error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = MedicalRecordController;