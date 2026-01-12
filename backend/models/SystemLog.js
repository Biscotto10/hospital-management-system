const pool = require('../config/database');

class SystemLog {
    static async create(logData) {
        const { user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent } = logData;
        
        const [result] = await pool.execute(
            `INSERT INTO system_logs 
             (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent]
        );
        
        return { id: result.insertId, ...logData };
    }

    static async getAll(filters = {}) {
        let query = `SELECT l.*, 
                            u.email as user_email,
                            u.first_name as user_first_name,
                            u.last_name as user_last_name
                     FROM system_logs l
                     LEFT JOIN users u ON l.user_id = u.id`;
        
        let whereClauses = [];
        let params = [];
        
        if (filters.action) {
            whereClauses.push('l.action = ?');
            params.push(filters.action);
        }
        
        if (filters.table_name) {
            whereClauses.push('l.table_name = ?');
            params.push(filters.table_name);
        }
        
        if (filters.user_id) {
            whereClauses.push('l.user_id = ?');
            params.push(filters.user_id);
        }
        
        if (filters.start_date) {
            whereClauses.push('DATE(l.created_at) >= ?');
            params.push(filters.start_date);
        }
        
        if (filters.end_date) {
            whereClauses.push('DATE(l.created_at) <= ?');
            params.push(filters.end_date);
        }
        
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }
        
        query += ' ORDER BY l.created_at DESC LIMIT 1000';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getRecent(count = 50) {
        const [rows] = await pool.execute(
            `SELECT l.*, 
                    u.email as user_email,
                    u.first_name as user_first_name,
                    u.last_name as user_last_name
             FROM system_logs l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC 
             LIMIT ?`,
            [count]
        );
        return rows;
    }

    static async getStats(timeframe = 'today') {
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
                COUNT(*) as total_logs,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(CASE WHEN action LIKE 'login%' THEN 1 END) as login_count,
                COUNT(CASE WHEN action LIKE 'create%' THEN 1 END) as create_count,
                COUNT(CASE WHEN action LIKE 'update%' THEN 1 END) as update_count,
                COUNT(CASE WHEN action LIKE 'delete%' THEN 1 END) as delete_count
             FROM system_logs 
             WHERE ${dateCondition}`
        );
        
        return rows[0];
    }
}

module.exports = SystemLog;