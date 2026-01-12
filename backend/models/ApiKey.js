const pool = require('../config/database');
const crypto = require('crypto');

class ApiKey {
    static async generateApiKey(keyData) {
        const { key_name, permissions, is_active, expires_at, created_by } = keyData;
        
        // Generate API key and secret
        const apiKey = crypto.randomBytes(32).toString('hex');
        const secretKey = crypto.randomBytes(64).toString('hex');
        
        const [result] = await pool.execute(
            `INSERT INTO api_keys 
             (key_name, api_key, secret_key, permissions, is_active, expires_at, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [key_name, apiKey, secretKey, permissions, is_active || true, expires_at, created_by]
        );
        
        return { 
            id: result.insertId, 
            ...keyData,
            api_key: apiKey,
            secret_key: secretKey 
        };
    }

    static async getAll() {
        const [rows] = await pool.execute(
            `SELECT a.*, 
                    u.email as created_by_email,
                    u.first_name as created_by_first_name,
                    u.last_name as created_by_last_name
             FROM api_keys a
             LEFT JOIN users u ON a.created_by = u.id
             ORDER BY a.created_at DESC`
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM api_keys WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getByApiKey(apiKey) {
        const [rows] = await pool.execute(
            'SELECT * FROM api_keys WHERE api_key = ? AND is_active = TRUE',
            [apiKey]
        );
        return rows[0];
    }

    static async update(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        const [result] = await pool.execute(
            `UPDATE api_keys SET ${fields} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async updateLastUsed(id) {
        const [result] = await pool.execute(
            'UPDATE api_keys SET last_used = NOW() WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM api_keys WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async validateApiKey(apiKey, secretKey = null) {
        const key = await this.getByApiKey(apiKey);
        
        if (!key) {
            return { valid: false, reason: 'Invalid API key' };
        }
        
        // Check if expired
        if (key.expires_at && new Date(key.expires_at) < new Date()) {
            return { valid: false, reason: 'API key expired' };
        }
        
        // Check secret key if provided
        if (secretKey && key.secret_key !== secretKey) {
            return { valid: false, reason: 'Invalid secret key' };
        }
        
        // Update last used timestamp
        await this.updateLastUsed(key.id);
        
        return { 
            valid: true, 
            key_id: key.id,
            key_name: key.key_name,
            permissions: key.permissions
        };
    }

    static async regenerateSecretKey(id) {
        const newSecretKey = crypto.randomBytes(64).toString('hex');
        
        const [result] = await pool.execute(
            'UPDATE api_keys SET secret_key = ? WHERE id = ?',
            [newSecretKey, id]
        );
        
        if (result.affectedRows > 0) {
            const key = await this.getById(id);
            return {
                success: true,
                secret_key: newSecretKey,
                api_key: key.api_key
            };
        }
        
        return { success: false };
    }

    static async revokeApiKey(id) {
        const [result] = await pool.execute(
            'UPDATE api_keys SET is_active = FALSE WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async getStats() {
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total_keys,
                COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_keys,
                COUNT(CASE WHEN is_active = FALSE THEN 1 END) as revoked_keys,
                COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_keys
             FROM api_keys`
        );
        
        return rows[0];
    }
}

module.exports = ApiKey;