const pool = require('../config/database');

class UserActivity {
    static async logActivity(activityData) {
        const { user_id, activity_type, activity_details, ip_address, user_agent } = activityData;
        
        const [result] = await pool.execute(
            `INSERT INTO user_activity 
             (user_id, activity_type, activity_details, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, activity_type, activity_details, ip_address, user_agent]
        );
        
        return { id: result.insertId, ...activityData };
    }

    static async getUserActivities(userId, limit = 50) {
        const [rows] = await pool.execute(
            `SELECT * FROM user_activity 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ?`,
            [userId, limit]
        );
        return rows;
    }

    static async getRecentActivities(limit = 100) {
        const [rows] = await pool.execute(
            `SELECT a.*, 
                    u.email as user_email,
                    u.first_name as user_first_name,
                    u.last_name as user_last_name,
                    u.role as user_role
             FROM user_activity a
             JOIN users u ON a.user_id = u.id
             ORDER BY a.created_at DESC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    }

    static async getActivityStats(timeframe = 'today') {
        let dateCondition = '';
        switch(timeframe) {
            case 'today':
                dateCondition = 'DATE(created_at) = CURDATE()';
                break;
            case 'week':
                dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                break;
            default:
                dateCondition = '1=1';
        }
        
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_activities,
                COUNT(DISTINCT user_id) as active_users,
                COUNT(CASE WHEN activity_type LIKE 'login%' THEN 1 END) as login_count,
                COUNT(CASE WHEN activity_type LIKE 'create%' THEN 1 END) as create_count,
                COUNT(CASE WHEN activity_type LIKE 'update%' THEN 1 END) as update_count,
                COUNT(CASE WHEN activity_type LIKE 'delete%' THEN 1 END) as delete_count,
                COUNT(CASE WHEN activity_type LIKE 'view%' THEN 1 END) as view_count
             FROM user_activity 
             WHERE ${dateCondition}`
        );
        
        return rows[0];
    }

    static async getActiveUsers(hours = 24) {
        const [rows] = await pool.execute(
            `SELECT DISTINCT u.* 
             FROM user_activity a
             JOIN users u ON a.user_id = u.id
             WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
             ORDER BY a.created_at DESC`,
            [hours]
        );
        return rows;
    }

    static async cleanupOldActivities(days = 90) {
        const [result] = await pool.execute(
            'DELETE FROM user_activity WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
            [days]
        );
        
        return {
            deleted_count: result.affectedRows,
            days: days
        };
    }
}

module.exports = UserActivity;