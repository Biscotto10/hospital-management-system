const LabTest = require('../models/LabTest');

class LabTestController {
    static async getMyLabTests(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const labTests = await LabTest.findByPatientId(req.user.id);
            res.json(labTests);
        } catch (error) {
            console.error('Get lab tests error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = LabTestController;