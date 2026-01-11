const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/PatientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protected routes - only admin and staff can access
router.get('/', 
    authMiddleware, 
    roleMiddleware('admin', 'doctor', 'nurse', 'staff'), 
    PatientController.getAllPatients
);

router.get('/:id', 
    authMiddleware, 
    roleMiddleware('admin', 'doctor', 'nurse', 'staff'), 
    PatientController.getPatientById
);

router.post('/', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    PatientController.createPatient
);

router.put('/:id', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    PatientController.updatePatient
);

module.exports = router;
const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/MedicalRecordController');
const PrescriptionController = require('../controllers/PrescriptionController');
const LabTestController = require('../controllers/LabTestController');
const BillingController = require('../controllers/BillingController');
const InsuranceController = require('../controllers/InsuranceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Patient Dashboard Routes
router.get('/medical-records', 
    authMiddleware, 
    roleMiddleware('patient'), 
    MedicalRecordController.getMyRecords
);

router.get('/medical-records/:id', 
    authMiddleware, 
    roleMiddleware('patient'), 
    MedicalRecordController.getRecordById
);

router.get('/prescriptions', 
    authMiddleware, 
    roleMiddleware('patient'), 
    PrescriptionController.getMyPrescriptions
);

router.get('/lab-tests', 
    authMiddleware, 
    roleMiddleware('patient'), 
    LabTestController.getMyLabTests
);

router.get('/invoices', 
    authMiddleware, 
    roleMiddleware('patient'), 
    BillingController.getMyInvoices
);

router.get('/invoices/:id', 
    authMiddleware, 
    roleMiddleware('patient'), 
    BillingController.getInvoiceById
);

router.post('/invoices/:id/pay', 
    authMiddleware, 
    roleMiddleware('patient'), 
    BillingController.makePayment
);

router.get('/insurance', 
    authMiddleware, 
    roleMiddleware('patient'), 
    InsuranceController.getMyInsurance
);

router.put('/insurance', 
    authMiddleware, 
    roleMiddleware('patient'), 
    InsuranceController.updateInsurance
);

module.exports = router;