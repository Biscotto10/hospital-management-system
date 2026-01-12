const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Dashboard Statistics
router.get('/dashboard/stats', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getDashboardStats
);

// User Management
router.get('/users', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getAllUsers
);

router.get('/users/:id', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getUserDetails
);

router.post('/users', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.createUser
);

router.put('/users/:id', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.updateUser
);

router.delete('/users/:id', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.deleteUser
);

router.put('/users/:id/status', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.toggleUserStatus
);

// System Settings
router.get('/settings', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getSystemSettings
);

router.put('/settings', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.updateSystemSettings
);

// Backup Management
router.get('/backups', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getBackups
);

router.post('/backups', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.createBackup
);

router.delete('/backups/:id', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.deleteBackup
);

// System Logs
router.get('/logs', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getSystemLogs
);

// User Activities
router.get('/activities', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getUserActivities
);

// Role Permissions
router.get('/permissions', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getRolePermissions
);

router.put('/permissions', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.updateRolePermissions
);

// Email Templates
router.get('/email-templates', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getEmailTemplates
);

router.put('/email-templates/:id', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.updateEmailTemplate
);

router.post('/email-templates/test', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.testEmailTemplate
);

// API Keys Management
router.get('/api-keys', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getApiKeys
);

router.post('/api-keys', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.createApiKey
);

router.put('/api-keys/:id/revoke', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.revokeApiKey
);

router.put('/api-keys/:id/regenerate', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.regenerateSecretKey
);

// System Maintenance
router.post('/maintenance/clear-cache', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.clearCache
);

router.post('/maintenance/cleanup', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.cleanupOldData
);

router.put('/maintenance/mode', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.toggleMaintenanceMode
);

// Reports and Analytics
router.get('/reports', 
    authMiddleware, 
    roleMiddleware('admin'), 
    AdminController.getDetailedReport
);

module.exports = router;