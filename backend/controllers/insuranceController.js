const Insurance = require('../models/Insurance');

class InsuranceController {
    static async getMyInsurance(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const insurance = await Insurance.findByPatientId(req.user.id);
            res.json(insurance || {});
        } catch (error) {
            console.error('Get insurance error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updateInsurance(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const insuranceData = {
                patient_id: req.user.id,
                ...req.body
            };
            
            const insurance = await Insurance.createOrUpdate(insuranceData);
            res.json({ 
                message: insurance.updated ? 'Insurance updated successfully' : 'Insurance added successfully',
                insurance 
            });
        } catch (error) {
            console.error('Update insurance error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = InsuranceController;