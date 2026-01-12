const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const SystemLog = require('../models/SystemLog');
const SystemSetting = require('../models/SystemSetting');
const Backup = require('../models/Backup');
const UserActivity = require('../models/UserActivity');
const RolePermission = require('../models/RolePermission');
const EmailTemplate = require('../models/EmailTemplate');
const ApiKey = require('../models/ApiKey');
const Billing = require('../models/Billing');
const Inventory = require('../models/Inventory');
const Admission = require('../models/Admission');

class AdminController {
    // Admin Dashboard Statistics
    static async getDashboardStats(req, res) {
        try {
            const [
                userStats,
                patientStats,
                appointmentStats,
                billingStats,
                inventoryStats,
                admissionStats,
                systemLogStats,
                userActivityStats
            ] = await Promise.all([
                this.getUserStats(),
                this.getPatientStats(),
                this.getAppointmentStats(),
                this.getBillingStats(),
                this.getInventoryStats(),
                this.getAdmissionStats(),
                SystemLog.getStats('today'),
                UserActivity.getActivityStats('today')
            ]);
            
            res.json({
                userStats,
                patientStats,
                appointmentStats,
                billingStats,
                inventoryStats,
                admissionStats,
                systemLogStats,
                userActivityStats,
                systemHealth: await this.getSystemHealth()
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getUserStats() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctors,
                COUNT(CASE WHEN role = 'nurse' THEN 1 END) as nurses,
                COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
                COUNT(CASE WHEN role = 'patient' THEN 1 END) as patients,
                COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
                COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_users,
                DATE(created_at) as date,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_registrations
             FROM users
             GROUP BY DATE(created_at)
             ORDER BY date DESC
             LIMIT 30`
        );
        
        const todayStats = rows.find(r => r.date === new Date().toISOString().split('T')[0]) || {};
        
        return {
            total: rows[0]?.total_users || 0,
            byRole: {
                admins: rows[0]?.admins || 0,
                doctors: rows[0]?.doctors || 0,
                nurses: rows[0]?.nurses || 0,
                staff: rows[0]?.staff || 0,
                patients: rows[0]?.patients || 0
            },
            active: rows[0]?.active_users || 0,
            inactive: rows[0]?.inactive_users || 0,
            todayRegistrations: todayStats.today_registrations || 0,
            dailyRegistrations: rows.slice(0, 7).reverse()
        };
    }
    
    static async getPatientStats() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_patients,
                COUNT(CASE WHEN gender = 'male' THEN 1 END) as male,
                COUNT(CASE WHEN gender = 'female' THEN 1 END) as female,
                COUNT(CASE WHEN gender = 'other' THEN 1 END) as other,
                COUNT(CASE WHEN DATE(date_of_birth) >= DATE_SUB(CURDATE(), INTERVAL 18 YEAR) THEN 1 END) as under_18,
                COUNT(CASE WHEN DATE(date_of_birth) < DATE_SUB(CURDATE(), INTERVAL 18 YEAR) 
                          AND DATE(date_of_birth) >= DATE_SUB(CURDATE(), INTERVAL 65 YEAR) THEN 1 END) as adults,
                COUNT(CASE WHEN DATE(date_of_birth) < DATE_SUB(CURDATE(), INTERVAL 65 YEAR) THEN 1 END) as seniors,
                DATE(u.created_at) as date,
                COUNT(CASE WHEN DATE(u.created_at) = CURDATE() THEN 1 END) as today_new
             FROM users u
             WHERE u.role = 'patient'
             GROUP BY DATE(u.created_at)
             ORDER BY date DESC
             LIMIT 30`
        );
        
        const todayStats = rows.find(r => r.date === new Date().toISOString().split('T')[0]) || {};
        
        return {
            total: rows[0]?.total_patients || 0,
            byGender: {
                male: rows[0]?.male || 0,
                female: rows[0]?.female || 0,
                other: rows[0]?.other || 0
            },
            byAge: {
                under18: rows[0]?.under_18 || 0,
                adults: rows[0]?.adults || 0,
                seniors: rows[0]?.seniors || 0
            },
            todayNew: todayStats.today_new || 0,
            dailyNew: rows.slice(0, 7).reverse()
        };
    }
    
    static async getAppointmentStats() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_appointments,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN DATE(appointment_date) = CURDATE() THEN 1 END) as today_appointments,
                DATE(appointment_date) as date,
                COUNT(CASE WHEN DATE(appointment_date) = CURDATE() AND status = 'scheduled' THEN 1 END) as today_scheduled
             FROM appointments
             GROUP BY DATE(appointment_date)
             ORDER BY date DESC
             LIMIT 30`
        );
        
        const todayStats = rows.find(r => r.date === new Date().toISOString().split('T')[0]) || {};
        
        return {
            total: rows[0]?.total_appointments || 0,
            byStatus: {
                scheduled: rows[0]?.scheduled || 0,
                confirmed: rows[0]?.confirmed || 0,
                completed: rows[0]?.completed || 0,
                cancelled: rows[0]?.cancelled || 0
            },
            today: todayStats.today_appointments || 0,
            todayScheduled: todayStats.today_scheduled || 0,
            daily: rows.slice(0, 7).reverse()
        };
    }
    
    static async getBillingStats() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_invoices,
                SUM(total_amount) as total_revenue,
                SUM(insurance_covered) as total_insurance,
                SUM(patient_responsibility) as total_patient_responsibility,
                SUM(paid_amount) as total_paid,
                SUM(balance_due) as total_balance,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
                DATE(invoice_date) as date,
                SUM(CASE WHEN DATE(invoice_date) = CURDATE() THEN total_amount ELSE 0 END) as today_revenue
             FROM invoices
             GROUP BY DATE(invoice_date)
             ORDER BY date DESC
             LIMIT 30`
        );
        
        const todayStats = rows.find(r => r.date === new Date().toISOString().split('T')[0]) || {};
        
        return {
            totalInvoices: rows[0]?.total_invoices || 0,
            totalRevenue: rows[0]?.total_revenue || 0,
            totalInsurance: rows[0]?.total_insurance || 0,
            totalPatientResponsibility: rows[0]?.total_patient_responsibility || 0,
            totalPaid: rows[0]?.total_paid || 0,
            totalBalance: rows[0]?.total_balance || 0,
            byStatus: {
                pending: rows[0]?.pending || 0,
                partial: rows[0]?.partial || 0,
                paid: rows[0]?.paid || 0,
                overdue: rows[0]?.overdue || 0
            },
            todayRevenue: todayStats.today_revenue || 0,
            dailyRevenue: rows.slice(0, 7).reverse()
        };
    }
    
    static async getInventoryStats() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_items,
                SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
                COUNT(CASE WHEN item_type = 'medication' THEN 1 END) as medications,
                COUNT(CASE WHEN item_type = 'equipment' THEN 1 END) as equipment,
                COUNT(CASE WHEN item_type = 'supply' THEN 1 END) as supplies,
                COUNT(CASE WHEN item_type = 'other' THEN 1 END) as other
             FROM inventory`
        );
        
        const [transactions] = await pool.execute(
            `SELECT 
                COUNT(*) as total_transactions,
                COUNT(CASE WHEN transaction_type = 'add' THEN 1 END) as additions,
                COUNT(CASE WHEN transaction_type = 'remove' THEN 1 END) as removals,
                SUM(CASE WHEN transaction_type = 'add' THEN quantity ELSE 0 END) as total_added,
                SUM(CASE WHEN transaction_type = 'remove' THEN quantity ELSE 0 END) as total_removed,
                DATE(transaction_date) as date
             FROM inventory_transactions
             GROUP BY DATE(transaction_date)
             ORDER BY date DESC
             LIMIT 7`
        );
        
        return {
            totalItems: rows[0]?.total_items || 0,
            totalQuantity: rows[0]?.total_quantity || 0,
            lowStock: rows[0]?.low_stock_items || 0,
            outOfStock: rows[0]?.out_of_stock || 0,
            byType: {
                medications: rows[0]?.medications || 0,
                equipment: rows[0]?.equipment || 0,
                supplies: rows[0]?.supplies || 0,
                other: rows[0]?.other || 0
            },
            recentTransactions: transactions.slice(0, 7).reverse()
        };
    }
    
    static async getAdmissionStats() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_admissions,
                COUNT(CASE WHEN status = 'admitted' THEN 1 END) as currently_admitted,
                COUNT(CASE WHEN status = 'discharged' THEN 1 END) as discharged,
                COUNT(CASE WHEN status = 'transferred' THEN 1 END) as transferred,
                COUNT(CASE WHEN admission_type = 'emergency' THEN 1 END) as emergency,
                COUNT(CASE WHEN admission_type = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN admission_type = 'transfer' THEN 1 END) as transfers,
                DATE(admission_date) as date,
                COUNT(CASE WHEN DATE(admission_date) = CURDATE() THEN 1 END) as today_admissions
             FROM admissions
             GROUP BY DATE(admission_date)
             ORDER BY date DESC
             LIMIT 30`
        );
        
        const todayStats = rows.find(r => r.date === new Date().toISOString().split('T')[0]) || {};
        
        return {
            total: rows[0]?.total_admissions || 0,
            currentlyAdmitted: rows[0]?.currently_admitted || 0,
            discharged: rows[0]?.discharged || 0,
            transferred: rows[0]?.transferred || 0,
            byType: {
                emergency: rows[0]?.emergency || 0,
                scheduled: rows[0]?.scheduled || 0,
                transfers: rows[0]?.transfers || 0
            },
            todayAdmissions: todayStats.today_admissions || 0,
            dailyAdmissions: rows.slice(0, 7).reverse()
        };
    }
    
    static async getSystemHealth() {
        const pool = require('../config/database');
        
        try {
            // Test database connection
            await pool.execute('SELECT 1');
            
            // Get server info
            const os = require('os');
            const fs = require('fs').promises;
            const disk = require('diskusage');
            const path = require('path');
            
            const diskInfo = await disk.check('/');
            const memory = process.memoryUsage();
            
            // Get uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / (24 * 60 * 60));
            const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((uptime % (60 * 60)) / 60);
            
            // Check if backups directory exists
            const backupsDir = path.join(__dirname, '../../backups');
            let backupCount = 0;
            let backupSize = 0;
            
            try {
                const files = await fs.readdir(backupsDir);
                backupCount = files.length;
                
                for (const file of files) {
                    const stats = await fs.stat(path.join(backupsDir, file));
                    backupSize += stats.size;
                }
            } catch (error) {
                // Directory doesn't exist or empty
            }
            
            // Check for recent errors in logs
            const [errorLogs] = await pool.execute(
                `SELECT COUNT(*) as error_count 
                 FROM system_logs 
                 WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
                 AND action LIKE '%error%' OR action LIKE '%fail%'`,
                []
            );
            
            return {
                status: 'healthy',
                database: 'connected',
                server: {
                    platform: os.platform(),
                    arch: os.arch(),
                    hostname: os.hostname(),
                    cpus: os.cpus().length,
                    load: os.loadavg()[0],
                    uptime: `${days}d ${hours}h ${minutes}m`,
                    nodeVersion: process.version
                },
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem(),
                    usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
                    processMemory: memory
                },
                disk: {
                    total: diskInfo.total,
                    free: diskInfo.free,
                    used: diskInfo.total - diskInfo.free,
                    usagePercentage: ((diskInfo.total - diskInfo.free) / diskInfo.total * 100).toFixed(2)
                },
                backups: {
                    count: backupCount,
                    totalSize: backupSize,
                    lastBackup: await this.getLastBackupTime()
                },
                errors: {
                    last24h: errorLogs[0]?.error_count || 0
                }
            };
            
        } catch (error) {
            console.error('System health check error:', error);
            return {
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message
            };
        }
    }
    
    static async getLastBackupTime() {
        const pool = require('../config/database');
        const [rows] = await pool.execute(
            'SELECT MAX(completed_at) as last_backup FROM backup_logs WHERE status = "completed"'
        );
        
        return rows[0]?.last_backup || 'Never';
    }
    
    // User Management
    static async getAllUsers(req, res) {
        try {
            const { role, is_active, search } = req.query;
            
            let query = `SELECT id, email, first_name, last_name, role, phone, 
                                department, is_active, created_at, last_login 
                         FROM users WHERE 1=1`;
            let params = [];
            
            if (role) {
                query += ' AND role = ?';
                params.push(role);
            }
            
            if (is_active !== undefined) {
                query += ' AND is_active = ?';
                params.push(is_active === 'true');
            }
            
            if (search) {
                query += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const pool = require('../config/database');
            const [rows] = await pool.execute(query, params);
            
            res.json(rows);
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getUserDetails(req, res) {
        try {
            const { id } = req.params;
            
            const pool = require('../config/database');
            const [rows] = await pool.execute(
                `SELECT u.*, 
                        p.blood_group, p.allergies, p.medical_history, p.emergency_contact,
                        p.insurance_number, p.insurance_provider
                 FROM users u
                 LEFT JOIN patients p ON u.id = p.user_id
                 WHERE u.id = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Get user activity
            const activities = await UserActivity.getUserActivities(id, 10);
            
            // Get user permissions if applicable
            let permissions = null;
            if (rows[0].role !== 'patient') {
                permissions = await RolePermission.getPermissions(rows[0].role);
            }
            
            res.json({
                user: rows[0],
                activities,
                permissions
            });
        } catch (error) {
            console.error('Get user details error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async createUser(req, res) {
        try {
            const userData = req.body;
            
            // Create user using existing User model
            const user = await User.create(userData);
            
            // If patient, create patient record
            if (user.role === 'patient' && (userData.blood_group || userData.allergies)) {
                await Patient.create({
                    user_id: user.id,
                    blood_group: userData.blood_group,
                    allergies: userData.allergies
                });
            }
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'user_create',
                activity_details: `Created new ${user.role} user: ${user.email}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Update user in database
            const pool = require('../config/database');
            const fields = Object.keys(updateData)
                .filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
                .map(key => `${key} = ?`);
            
            const values = Object.values(updateData)
                .filter((_, index) => Object.keys(updateData)[index] !== 'id');
            
            if (fields.length === 0) {
                return res.status(400).json({ message: 'No fields to update' });
            }
            
            values.push(id);
            
            const [result] = await pool.execute(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Failed to update user' });
            }
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'user_update',
                activity_details: `Updated user: ${existingUser.email}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: 'User updated successfully',
                user_id: id
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Prevent deleting self
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({ message: 'Cannot delete your own account' });
            }
            
            // Delete user (cascade will handle related records)
            const pool = require('../config/database');
            const [result] = await pool.execute(
                'DELETE FROM users WHERE id = ?',
                [id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Failed to delete user' });
            }
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'user_delete',
                activity_details: `Deleted user: ${existingUser.email}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: 'User deleted successfully',
                user_id: id
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;
            
            if (is_active === undefined) {
                return res.status(400).json({ message: 'is_active field is required' });
            }
            
            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Prevent deactivating self
            if (parseInt(id) === req.user.id && !is_active) {
                return res.status(400).json({ message: 'Cannot deactivate your own account' });
            }
            
            // Update status
            const pool = require('../config/database');
            const [result] = await pool.execute(
                'UPDATE users SET is_active = ? WHERE id = ?',
                [is_active, id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Failed to update user status' });
            }
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'user_status_update',
                activity_details: `Set user ${existingUser.email} status to ${is_active ? 'active' : 'inactive'}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
                user_id: id,
                is_active
            });
        } catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // System Settings Management
    static async getSystemSettings(req, res) {
        try {
            const { category } = req.query;
            
            let settings;
            if (category) {
                settings = await SystemSetting.getByCategory(category);
            } else {
                settings = await SystemSetting.getAll();
            }
            
            res.json(settings);
        } catch (error) {
            console.error('Get system settings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateSystemSettings(req, res) {
        try {
            const updates = req.body;
            
            const results = await SystemSetting.setMultiple(updates);
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'settings_update',
                activity_details: `Updated system settings: ${Object.keys(updates).join(', ')}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: 'Settings updated successfully',
                updates: Object.keys(updates),
                success: true
            });
        } catch (error) {
            console.error('Update system settings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Backup Management
    static async getBackups(req, res) {
        try {
            const backups = await Backup.getAllBackups();
            const stats = await Backup.getBackupStats();
            
            res.json({
                backups,
                stats
            });
        } catch (error) {
            console.error('Get backups error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async createBackup(req, res) {
        try {
            const { type, notes } = req.body;
            
            const result = await Backup.performDatabaseBackup(req.user.id);
            
            if (result.success) {
                // Log activity
                await UserActivity.logActivity({
                    user_id: req.user.id,
                    activity_type: 'backup_create',
                    activity_details: `Created database backup: ${result.filename}`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'Backup created successfully',
                    ...result
                });
            } else {
                res.status(500).json({
                    message: 'Backup failed',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Create backup error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async deleteBackup(req, res) {
        try {
            const { id } = req.params;
            
            const result = await Backup.deleteBackup(id);
            
            if (result.success) {
                // Log activity
                await UserActivity.logActivity({
                    user_id: req.user.id,
                    activity_type: 'backup_delete',
                    activity_details: `Deleted backup: ${result.filename}`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'Backup deleted successfully',
                    ...result
                });
            } else {
                res.status(400).json({
                    message: 'Failed to delete backup',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Delete backup error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // System Logs
    static async getSystemLogs(req, res) {
        try {
            const { action, table_name, user_id, start_date, end_date, limit } = req.query;
            
            const filters = {};
            if (action) filters.action = action;
            if (table_name) filters.table_name = table_name;
            if (user_id) filters.user_id = user_id;
            if (start_date) filters.start_date = start_date;
            if (end_date) filters.end_date = end_date;
            
            const logs = await SystemLog.getAll(filters);
            
            // Get log stats
            const stats = await SystemLog.getStats('month');
            
            res.json({
                logs: limit ? logs.slice(0, parseInt(limit)) : logs,
                stats,
                total: logs.length
            });
        } catch (error) {
            console.error('Get system logs error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // User Activity
    static async getUserActivities(req, res) {
        try {
            const { user_id, limit } = req.query;
            
            let activities;
            if (user_id) {
                activities = await UserActivity.getUserActivities(user_id, limit || 50);
            } else {
                activities = await UserActivity.getRecentActivities(limit || 100);
            }
            
            // Get activity stats
            const stats = await UserActivity.getActivityStats('today');
            
            res.json({
                activities,
                stats,
                total: activities.length
            });
        } catch (error) {
            console.error('Get user activities error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Role Permissions Management
    static async getRolePermissions(req, res) {
        try {
            const { role } = req.query;
            
            let permissions;
            if (role) {
                permissions = await RolePermission.getPermissions(role);
            } else {
                permissions = await RolePermission.getAllRolesPermissions();
            }
            
            const modules = await RolePermission.getAvailableModules();
            const roles = await RolePermission.getAvailableRoles();
            
            res.json({
                permissions,
                modules,
                roles
            });
        } catch (error) {
            console.error('Get role permissions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateRolePermissions(req, res) {
        try {
            const { role, module, permissions } = req.body;
            
            if (!role || !module || !permissions) {
                return res.status(400).json({ 
                    message: 'Role, module, and permissions are required' 
                });
            }
            
            const success = await RolePermission.updatePermissions(role, module, permissions);
            
            if (success) {
                // Log activity
                await UserActivity.logActivity({
                    user_id: req.user.id,
                    activity_type: 'permissions_update',
                    activity_details: `Updated permissions for ${role} on ${module} module`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'Permissions updated successfully',
                    role,
                    module,
                    permissions
                });
            } else {
                res.status(400).json({ message: 'Failed to update permissions' });
            }
        } catch (error) {
            console.error('Update role permissions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Email Templates Management
    static async getEmailTemplates(req, res) {
        try {
            const templates = await EmailTemplate.getAll();
            
            res.json(templates);
        } catch (error) {
            console.error('Get email templates error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateEmailTemplate(req, res) {
        try {
            const { id } = req.params;
            const templateData = req.body;
            
            const success = await EmailTemplate.update(id, templateData);
            
            if (success) {
                // Log activity
                await UserActivity.logActivity({
                    user_id: req.user.id,
                    activity_type: 'email_template_update',
                    activity_details: `Updated email template ID: ${id}`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'Email template updated successfully',
                    template_id: id
                });
            } else {
                res.status(404).json({ message: 'Template not found' });
            }
        } catch (error) {
            console.error('Update email template error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async testEmailTemplate(req, res) {
        try {
            const { template_name, variables } = req.body;
            
            const rendered = await EmailTemplate.renderTemplate(template_name, variables);
            
            res.json({
                message: 'Template rendered successfully',
                template: rendered
            });
        } catch (error) {
            console.error('Test email template error:', error);
            res.status(400).json({ message: error.message });
        }
    }
    
    // API Keys Management
    static async getApiKeys(req, res) {
        try {
            const apiKeys = await ApiKey.getAll();
            const stats = await ApiKey.getStats();
            
            res.json({
                apiKeys,
                stats
            });
        } catch (error) {
            console.error('Get API keys error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async createApiKey(req, res) {
        try {
            const { key_name, permissions, expires_at } = req.body;
            
            const apiKeyData = {
                key_name,
                permissions: permissions || 'read-only',
                expires_at,
                created_by: req.user.id
            };
            
            const apiKey = await ApiKey.generateApiKey(apiKeyData);
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'api_key_create',
                activity_details: `Created API key: ${key_name}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.status(201).json({
                message: 'API key created successfully',
                apiKey: {
                    id: apiKey.id,
                    key_name: apiKey.key_name,
                    api_key: apiKey.api_key,
                    secret_key: apiKey.secret_key, // Only shown once!
                    permissions: apiKey.permissions,
                    expires_at: apiKey.expires_at,
                    is_active: apiKey.is_active
                }
            });
        } catch (error) {
            console.error('Create API key error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async revokeApiKey(req, res) {
        try {
            const { id } = req.params;
            
            const success = await ApiKey.revokeApiKey(id);
            
            if (success) {
                // Log activity
                await UserActivity.logActivity({
                    user_id: req.user.id,
                    activity_type: 'api_key_revoke',
                    activity_details: `Revoked API key ID: ${id}`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'API key revoked successfully',
                    api_key_id: id
                });
            } else {
                res.status(404).json({ message: 'API key not found' });
            }
        } catch (error) {
            console.error('Revoke API key error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async regenerateSecretKey(req, res) {
        try {
            const { id } = req.params;
            
            const result = await ApiKey.regenerateSecretKey(id);
            
            if (result.success) {
                // Log activity
                await UserActivity.logActivity({
                    user_id: req.user.id,
                    activity_type: 'api_key_regenerate',
                    activity_details: `Regenerated secret key for API key ID: ${id}`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'Secret key regenerated successfully',
                    ...result
                });
            } else {
                res.status(404).json({ message: 'API key not found' });
            }
        } catch (error) {
            console.error('Regenerate secret key error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // System Maintenance
    static async clearCache(req, res) {
        try {
            // In a real system, this would clear various caches
            // For now, we'll just log the activity
            
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'cache_clear',
                activity_details: 'Cleared system cache',
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: 'System cache cleared successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Clear cache error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async cleanupOldData(req, res) {
        try {
            const { days } = req.body;
            
            const cleanupDays = days || 90;
            const result = await UserActivity.cleanupOldActivities(cleanupDays);
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'data_cleanup',
                activity_details: `Cleaned up old data older than ${cleanupDays} days`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: `Cleaned up ${result.deleted_count} old activity records`,
                ...result
            });
        } catch (error) {
            console.error('Cleanup old data error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async toggleMaintenanceMode(req, res) {
        try {
            const { enabled } = req.body;
            
            if (enabled === undefined) {
                return res.status(400).json({ message: 'enabled field is required' });
            }
            
            await SystemSetting.set('maintenance_mode', enabled);
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'maintenance_mode',
                activity_details: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
                maintenance_mode: enabled
            });
        } catch (error) {
            console.error('Toggle maintenance mode error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Reports and Analytics
    static async getDetailedReport(req, res) {
        try {
            const { report_type, start_date, end_date } = req.query;
            
            const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const endDate = end_date || new Date().toISOString().split('T')[0];
            
            let reportData = {};
            
            switch(report_type) {
                case 'user_activity':
                    reportData = await this.generateUserActivityReport(startDate, endDate);
                    break;
                case 'financial':
                    reportData = await this.generateFinancialReport(startDate, endDate);
                    break;
                case 'appointment':
                    reportData = await this.generateAppointmentReport(startDate, endDate);
                    break;
                case 'inventory':
                    reportData = await this.generateInventoryReport(startDate, endDate);
                    break;
                default:
                    reportData = await this.generateComprehensiveReport(startDate, endDate);
            }
            
            // Log activity
            await UserActivity.logActivity({
                user_id: req.user.id,
                activity_type: 'report_generate',
                activity_details: `Generated ${report_type} report from ${startDate} to ${endDate}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            
            res.json({
                message: 'Report generated successfully',
                report_type,
                start_date: startDate,
                end_date: endDate,
                generated_at: new Date().toISOString(),
                data: reportData
            });
        } catch (error) {
            console.error('Get detailed report error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async generateUserActivityReport(startDate, endDate) {
        const pool = require('../config/database');
        
        const [userStats] = await pool.execute(
            `SELECT 
                u.role,
                COUNT(DISTINCT a.user_id) as active_users,
                COUNT(a.id) as total_activities,
                COUNT(CASE WHEN a.activity_type LIKE 'login%' THEN 1 END) as logins,
                COUNT(CASE WHEN a.activity_type LIKE 'create%' THEN 1 END) as creates,
                COUNT(CASE WHEN a.activity_type LIKE 'update%' THEN 1 END) as updates,
                COUNT(CASE WHEN a.activity_type LIKE 'delete%' THEN 1 END) as deletes,
                DATE(a.created_at) as date
             FROM user_activity a
             JOIN users u ON a.user_id = u.id
             WHERE DATE(a.created_at) BETWEEN ? AND ?
             GROUP BY u.role, DATE(a.created_at)
             ORDER BY date, u.role`,
            [startDate, endDate]
        );
        
        const [topUsers] = await pool.execute(
            `SELECT 
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.role,
                COUNT(a.id) as activity_count
             FROM user_activity a
             JOIN users u ON a.user_id = u.id
             WHERE DATE(a.created_at) BETWEEN ? AND ?
             GROUP BY u.id
             ORDER BY activity_count DESC
             LIMIT 10`,
            [startDate, endDate]
        );
        
        return {
            period: { start: startDate, end: endDate },
            summary: {
                total_activities: userStats.reduce((sum, stat) => sum + stat.total_activities, 0),
                active_users: [...new Set(userStats.map(stat => stat.user_id))].length,
                by_role: userStats.reduce((acc, stat) => {
                    if (!acc[stat.role]) acc[stat.role] = 0;
                    acc[stat.role] += stat.total_activities;
                    return acc;
                }, {})
            },
            daily_activity: userStats,
            top_users: topUsers
        };
    }
    
    static async generateFinancialReport(startDate, endDate) {
        const pool = require('../config/database');
        
        const [revenueData] = await pool.execute(
            `SELECT 
                DATE(i.invoice_date) as date,
                COUNT(i.id) as invoice_count,
                SUM(i.total_amount) as total_revenue,
                SUM(i.insurance_covered) as insurance_revenue,
                SUM(i.patient_responsibility) as patient_revenue,
                SUM(i.paid_amount) as collected_amount,
                SUM(i.balance_due) as pending_amount,
                i.status
             FROM invoices i
             WHERE DATE(i.invoice_date) BETWEEN ? AND ?
             GROUP BY DATE(i.invoice_date), i.status
             ORDER BY date, i.status`,
            [startDate, endDate]
        );
        
        const [paymentMethods] = await pool.execute(
            `SELECT 
                p.payment_method,
                COUNT(p.id) as transaction_count,
                SUM(p.amount) as total_amount
             FROM payments p
             JOIN invoices i ON p.invoice_id = i.id
             WHERE DATE(i.invoice_date) BETWEEN ? AND ?
             GROUP BY p.payment_method
             ORDER BY total_amount DESC`,
            [startDate, endDate]
        );
        
        return {
            period: { start: startDate, end: endDate },
            summary: {
                total_invoices: revenueData.reduce((sum, item) => sum + item.invoice_count, 0),
                total_revenue: revenueData.reduce((sum, item) => sum + (item.total_revenue || 0), 0),
                collected_amount: revenueData.reduce((sum, item) => sum + (item.collected_amount || 0), 0),
                pending_amount: revenueData.reduce((sum, item) => sum + (item.pending_amount || 0), 0),
                by_status: revenueData.reduce((acc, item) => {
                    if (!acc[item.status]) acc[item.status] = 0;
                    acc[item.status] += item.invoice_count;
                    return acc;
                }, {})
            },
            daily_revenue: revenueData,
            payment_methods: paymentMethods
        };
    }
    
    static async generateAppointmentReport(startDate, endDate) {
        const pool = require('../config/database');
        
        const [appointmentData] = await pool.execute(
            `SELECT 
                DATE(a.appointment_date) as date,
                COUNT(a.id) as appointment_count,
                COUNT(CASE WHEN a.status = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled,
                a.department,
                u.role as doctor_role,
                u.first_name as doctor_first_name,
                u.last_name as doctor_last_name
             FROM appointments a
             LEFT JOIN users u ON a.doctor_id = u.id
             WHERE DATE(a.appointment_date) BETWEEN ? AND ?
             GROUP BY DATE(a.appointment_date), a.department, a.doctor_id
             ORDER BY date, a.department`,
            [startDate, endDate]
        );
        
        const [topDoctors] = await pool.execute(
            `SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.role,
                COUNT(a.id) as appointment_count,
                COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count
             FROM appointments a
             JOIN users u ON a.doctor_id = u.id
             WHERE DATE(a.appointment_date) BETWEEN ? AND ?
             GROUP BY u.id
             ORDER BY appointment_count DESC
             LIMIT 10`,
            [startDate, endDate]
        );
        
        return {
            period: { start: startDate, end: endDate },
            summary: {
                total_appointments: appointmentData.reduce((sum, item) => sum + item.appointment_count, 0),
                by_status: appointmentData.reduce((acc, item) => {
                    acc.scheduled = (acc.scheduled || 0) + item.scheduled;
                    acc.confirmed = (acc.confirmed || 0) + item.confirmed;
                    acc.completed = (acc.completed || 0) + item.completed;
                    acc.cancelled = (acc.cancelled || 0) + item.cancelled;
                    return acc;
                }, {}),
                by_department: appointmentData.reduce((acc, item) => {
                    if (!acc[item.department]) acc[item.department] = 0;
                    acc[item.department] += item.appointment_count;
                    return acc;
                }, {})
            },
            daily_appointments: appointmentData,
            top_doctors: topDoctors
        };
    }
    
    static async generateInventoryReport(startDate, endDate) {
        const pool = require('../config/database');
        
        const [inventoryData] = await pool.execute(
            `SELECT 
                i.item_name,
                i.item_type,
                i.category,
                i.quantity,
                i.reorder_level,
                COUNT(t.id) as transaction_count,
                SUM(CASE WHEN t.transaction_type = 'add' THEN t.quantity ELSE 0 END) as total_added,
                SUM(CASE WHEN t.transaction_type = 'remove' THEN t.quantity ELSE 0 END) as total_removed,
                DATE(t.transaction_date) as date
             FROM inventory i
             LEFT JOIN inventory_transactions t ON i.id = t.inventory_id 
                AND DATE(t.transaction_date) BETWEEN ? AND ?
             GROUP BY i.id, DATE(t.transaction_date)
             ORDER BY i.item_name, date`,
            [startDate, endDate]
        );
        
        const [lowStock] = await pool.execute(
            `SELECT * FROM inventory 
             WHERE quantity <= reorder_level 
             ORDER BY quantity ASC`
        );
        
        return {
            period: { start: startDate, end: endDate },
            summary: {
                total_items: inventoryData.length,
                total_quantity: inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0),
                low_stock_items: lowStock.length,
                out_of_stock: inventoryData.filter(item => item.quantity === 0).length,
                by_type: inventoryData.reduce((acc, item) => {
                    if (!acc[item.item_type]) acc[item.item_type] = 0;
                    acc[item.item_type]++;
                    return acc;
                }, {})
            },
            inventory_items: inventoryData,
            low_stock_items: lowStock
        };
    }
    
    static async generateComprehensiveReport(startDate, endDate) {
        const [
            userActivity,
            financial,
            appointment,
            inventory
        ] = await Promise.all([
            this.generateUserActivityReport(startDate, endDate),
            this.generateFinancialReport(startDate, endDate),
            this.generateAppointmentReport(startDate, endDate),
            this.generateInventoryReport(startDate, endDate)
        ]);
        
        return {
            period: { start: startDate, end: endDate },
            generated_at: new Date().toISOString(),
            sections: {
                user_activity: userActivity,
                financial: financial,
                appointment: appointment,
                inventory: inventory
            },
            key_metrics: {
                total_revenue: financial.summary.total_revenue,
                total_appointments: appointment.summary.total_appointments,
                active_users: userActivity.summary.active_users,
                low_stock_items: inventory.summary.low_stock_items
            }
        };
    }
}

module.exports = AdminController;