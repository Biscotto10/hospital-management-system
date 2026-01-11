const pool = require('../config/database');

class Inventory {
    static async getAll() {
        const [rows] = await pool.execute(
            `SELECT * FROM inventory 
             ORDER BY item_type, item_name`
        );
        return rows;
    }

    static async getLowStock() {
        const [rows] = await pool.execute(
            `SELECT * FROM inventory 
             WHERE quantity <= reorder_level
             ORDER BY quantity ASC`
        );
        return rows;
    }

    static async getByType(itemType) {
        const [rows] = await pool.execute(
            `SELECT * FROM inventory 
             WHERE item_type = ?
             ORDER BY item_name`,
            [itemType]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM inventory WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async addItem(itemData) {
        const { item_name, item_type, category, quantity, unit, reorder_level, supplier, location, notes } = itemData;
        
        const [result] = await pool.execute(
            `INSERT INTO inventory 
             (item_name, item_type, category, quantity, unit, reorder_level, supplier, location, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item_name, item_type, category, quantity, unit, reorder_level, supplier, location, notes]
        );
        
        return { id: result.insertId, ...itemData };
    }

    static async updateItem(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        const [result] = await pool.execute(
            `UPDATE inventory SET ${fields} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async adjustStock(id, quantity, staffId, notes = '') {
        // Get current quantity
        const item = await this.findById(id);
        if (!item) throw new Error('Item not found');
        
        const newQuantity = item.quantity + quantity;
        
        if (newQuantity < 0) {
            throw new Error('Insufficient stock');
        }
        
        // Update inventory
        const [result] = await pool.execute(
            'UPDATE inventory SET quantity = ?, last_restocked = NOW() WHERE id = ?',
            [newQuantity, id]
        );
        
        if (result.affectedRows > 0) {
            // Record transaction
            await this.recordTransaction({
                inventory_id: id,
                transaction_type: quantity > 0 ? 'add' : 'remove',
                quantity: Math.abs(quantity),
                staff_id: staffId,
                notes: notes
            });
            
            return { success: true, newQuantity };
        }
        
        return { success: false };
    }

    static async recordTransaction(transactionData) {
        const { inventory_id, transaction_type, quantity, staff_id, reference, notes } = transactionData;
        
        const [result] = await pool.execute(
            `INSERT INTO inventory_transactions 
             (inventory_id, transaction_type, quantity, staff_id, reference, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [inventory_id, transaction_type, quantity, staff_id, reference, notes]
        );
        
        return { id: result.insertId, ...transactionData };
    }

    static async getTransactions(itemId = null) {
        let query = `SELECT t.*, 
                            i.item_name,
                            i.item_type,
                            s.first_name as staff_first_name,
                            s.last_name as staff_last_name
                     FROM inventory_transactions t
                     JOIN inventory i ON t.inventory_id = i.id
                     JOIN users s ON t.staff_id = s.id`;
        
        let params = [];
        
        if (itemId) {
            query += ' WHERE t.inventory_id = ?';
            params.push(itemId);
        }
        
        query += ' ORDER BY t.transaction_date DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async deleteItem(id) {
        const [result] = await pool.execute(
            'DELETE FROM inventory WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Inventory;