const pool = require('../config/database');

class Message {
    static async sendMessage(messageData) {
        const { sender_id, receiver_id, subject, message, priority } = messageData;
        
        const [result] = await pool.execute(
            `INSERT INTO staff_messages 
             (sender_id, receiver_id, subject, message, priority) 
             VALUES (?, ?, ?, ?, ?)`,
            [sender_id, receiver_id, subject, message, priority || 'normal']
        );
        
        return { id: result.insertId, ...messageData, is_read: false };
    }

    static async getInbox(userId, unreadOnly = false) {
        let query = `SELECT m.*, 
                            s.first_name as sender_first_name,
                            s.last_name as sender_last_name,
                            s.role as sender_role
                     FROM staff_messages m
                     JOIN users s ON m.sender_id = s.id
                     WHERE m.receiver_id = ?`;
        
        let params = [userId];
        
        if (unreadOnly) {
            query += ' AND m.is_read = FALSE';
        }
        
        query += ' ORDER BY m.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getSentMessages(userId) {
        const [rows] = await pool.execute(
            `SELECT m.*, 
                    r.first_name as receiver_first_name,
                    r.last_name as receiver_last_name,
                    r.role as receiver_role
             FROM staff_messages m
             JOIN users r ON m.receiver_id = r.id
             WHERE m.sender_id = ?
             ORDER BY m.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async markAsRead(messageId) {
        const [result] = await pool.execute(
            'UPDATE staff_messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
            [messageId]
        );
        return result.affectedRows > 0;
    }

    static async getMessageById(id) {
        const [rows] = await pool.execute(
            `SELECT m.*, 
                    s.first_name as sender_first_name,
                    s.last_name as sender_last_name,
                    s.email as sender_email,
                    r.first_name as receiver_first_name,
                    r.last_name as receiver_last_name,
                    r.email as receiver_email
             FROM staff_messages m
             JOIN users s ON m.sender_id = s.id
             JOIN users r ON m.receiver_id = r.id
             WHERE m.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async getUnreadCount(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM staff_messages WHERE receiver_id = ? AND is_read = FALSE',
            [userId]
        );
        return rows[0].count;
    }

    static async deleteMessage(id, userId) {
        const [result] = await pool.execute(
            `DELETE FROM staff_messages 
             WHERE id = ? AND (sender_id = ? OR receiver_id = ?)`,
            [id, userId, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Message;