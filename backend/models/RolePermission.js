const pool = require('../config/database');

class RolePermission {
    static async getPermissions(role) {
        const [rows] = await pool.execute(
            'SELECT * FROM role_permissions WHERE role = ?',
            [role]
        );
        
        const permissions = {};
        rows.forEach(row => {
            permissions[row.module] = {
                can_view: row.can_view,
                can_create: row.can_create,
                can_edit: row.can_edit,
                can_delete: row.can_delete,
                can_export: row.can_export
            };
        });
        
        return permissions;
    }

    static async getModulePermissions(role, module) {
        const [rows] = await pool.execute(
            'SELECT * FROM role_permissions WHERE role = ? AND module = ?',
            [role, module]
        );
        
        if (rows.length === 0) return null;
        
        const row = rows[0];
        return {
            can_view: row.can_view,
            can_create: row.can_create,
            can_edit: row.can_edit,
            can_delete: row.can_delete,
            can_export: row.can_export
        };
    }

    static async updatePermissions(role, module, permissions) {
        // Check if exists
        const [existing] = await pool.execute(
            'SELECT id FROM role_permissions WHERE role = ? AND module = ?',
            [role, module]
        );
        
        if (existing.length > 0) {
            // Update existing
            const [result] = await pool.execute(
                `UPDATE role_permissions SET 
                    can_view = ?, can_create = ?, can_edit = ?, can_delete = ?, can_export = ?
                 WHERE role = ? AND module = ?`,
                [
                    permissions.can_view || false,
                    permissions.can_create || false,
                    permissions.can_edit || false,
                    permissions.can_delete || false,
                    permissions.can_export || false,
                    role,
                    module
                ]
            );
            
            return result.affectedRows > 0;
        } else {
            // Insert new
            const [result] = await pool.execute(
                `INSERT INTO role_permissions 
                 (role, module, can_view, can_create, can_edit, can_delete, can_export) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    role,
                    module,
                    permissions.can_view || false,
                    permissions.can_create || false,
                    permissions.can_edit || false,
                    permissions.can_delete || false,
                    permissions.can_export || false
                ]
            );
            
            return result.affectedRows > 0;
        }
    }

    static async deletePermission(role, module) {
        const [result] = await pool.execute(
            'DELETE FROM role_permissions WHERE role = ? AND module = ?',
            [role, module]
        );
        
        return result.affectedRows > 0;
    }

    static async getAllRolesPermissions() {
        const [rows] = await pool.execute(
            'SELECT * FROM role_permissions ORDER BY role, module'
        );
        
        const grouped = {};
        rows.forEach(row => {
            if (!grouped[row.role]) {
                grouped[row.role] = {};
            }
            
            grouped[row.role][row.module] = {
                can_view: row.can_view,
                can_create: row.can_create,
                can_edit: row.can_edit,
                can_delete: row.can_delete,
                can_export: row.can_export
            };
        });
        
        return grouped;
    }

    static async getAvailableModules() {
        // Get unique modules from permissions table
        const [rows] = await pool.execute(
            'SELECT DISTINCT module FROM role_permissions ORDER BY module'
        );
        
        const modules = rows.map(row => row.module);
        
        // Add common modules if not present
        const commonModules = [
            'dashboard', 'users', 'patients', 'doctors', 'staff', 
            'appointments', 'medical_records', 'prescriptions', 
            'lab_tests', 'billing', 'inventory', 'departments', 
            'reports', 'settings', 'system'
        ];
        
        commonModules.forEach(module => {
            if (!modules.includes(module)) {
                modules.push(module);
            }
        });
        
        return modules.sort();
    }

    static async getAvailableRoles() {
        const [rows] = await pool.execute(
            'SELECT DISTINCT role FROM role_permissions ORDER BY role'
        );
        
        const roles = rows.map(row => row.role);
        
        // Add default roles if not present
        const defaultRoles = ['admin', 'doctor', 'nurse', 'staff', 'patient'];
        defaultRoles.forEach(role => {
            if (!roles.includes(role)) {
                roles.push(role);
            }
        });
        
        return roles.sort();
    }
}

module.exports = RolePermission;