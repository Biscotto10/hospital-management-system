const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protected routes
router.post('/', 
    authMiddleware, 
    roleMiddleware('patient', 'admin', 'staff'), 
    AppointmentController.createAppointment
);

router.get('/my-appointments', 
    authMiddleware, 
    AppointmentController.getMyAppointments
);

router.get('/:id', 
    authMiddleware, 
    AppointmentController.getAppointmentById
);

router.put('/:id/status', 
    authMiddleware, 
    roleMiddleware('doctor', 'admin', 'staff'), 
    AppointmentController.updateAppointmentStatus
);

module.exports = router;