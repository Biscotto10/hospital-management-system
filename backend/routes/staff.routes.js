const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/StaffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Dashboard Statistics
router.get('/dashboard/stats', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getDashboardStats
);

// Schedule Management
router.get('/schedule', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getMySchedule
);

router.post('/schedule', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.addSchedule
);

// Task Management
router.get('/tasks', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getMyTasks
);

router.post('/tasks', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.addTask
);

router.put('/tasks/:id/status', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.updateTaskStatus
);

// Admissions Management
router.get('/admissions', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'nurse'), 
    StaffController.getAdmissions
);

router.post('/admissions', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'nurse'), 
    StaffController.admitPatient
);

router.put('/admissions/:id/discharge', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor'), 
    StaffController.dischargePatient
);

router.put('/admissions/:id/room', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'nurse'), 
    StaffController.updateAdmissionRoom
);

// Inventory Management
router.get('/inventory', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'nurse'), 
    StaffController.getInventory
);

router.post('/inventory', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.addInventoryItem
);

router.put('/inventory/:id', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.updateInventoryItem
);

router.post('/inventory/:id/adjust', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'nurse'), 
    StaffController.adjustStock
);

router.get('/inventory/transactions', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getInventoryTransactions
);

// Department Management
router.get('/departments', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getDepartments
);

router.get('/departments/stats', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getDepartmentStats
);

// Messaging System
router.post('/messages', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor', 'nurse'), 
    StaffController.sendMessage
);

router.get('/messages/inbox', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor', 'nurse'), 
    StaffController.getInbox
);

router.get('/messages/sent', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor', 'nurse'), 
    StaffController.getSentMessages
);

router.get('/messages/unread-count', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor', 'nurse'), 
    StaffController.getUnreadCount
);

router.get('/messages/:id', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor', 'nurse'), 
    StaffController.getMessage
);

router.put('/messages/:id/read', 
    authMiddleware, 
    roleMiddleware('admin', 'staff', 'doctor', 'nurse'), 
    StaffController.markMessageAsRead
);

// Staff Management
router.get('/staff/all', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getAllStaff
);

router.get('/staff/department/:department', 
    authMiddleware, 
    roleMiddleware('admin', 'staff'), 
    StaffController.getStaffByDept
);

module.exports = router;