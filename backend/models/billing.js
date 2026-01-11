const pool = require('../config/database');

class Billing {
    static async createInvoice(invoiceData) {
        const { patient_id, appointment_id, invoice_number, invoice_date, due_date, total_amount, insurance_covered, patient_responsibility, paid_amount, balance_due, billing_codes, insurance_provider, insurance_claim_id } = invoiceData;
        
        const [result] = await pool.execute(
            `INSERT INTO invoices 
             (patient_id, appointment_id, invoice_number, invoice_date, due_date, total_amount, insurance_covered, patient_responsibility, paid_amount, balance_due, billing_codes, insurance_provider, insurance_claim_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient_id, appointment_id, invoice_number, invoice_date, due_date, total_amount, insurance_covered, patient_responsibility, paid_amount, balance_due, billing_codes, insurance_provider, insurance_claim_id]
        );
        
        return { id: result.insertId, ...invoiceData, status: 'pending' };
    }

    static async getInvoicesByPatientId(patientId) {
        const [rows] = await pool.execute(
            `SELECT i.*, 
                    a.appointment_date,
                    a.appointment_time,
                    d.first_name as doctor_first_name,
                    d.last_name as doctor_last_name
             FROM invoices i
             LEFT JOIN appointments a ON i.appointment_id = a.id
             LEFT JOIN users d ON a.doctor_id = d.id
             WHERE i.patient_id = ?
             ORDER BY i.invoice_date DESC`,
            [patientId]
        );
        return rows;
    }

    static async getInvoiceById(id) {
        const [rows] = await pool.execute(
            `SELECT i.*, 
                    p.first_name as patient_first_name,
                    p.last_name as patient_last_name,
                    p.email as patient_email,
                    p.phone as patient_phone,
                    a.appointment_date,
                    a.appointment_time,
                    a.reason,
                    d.first_name as doctor_first_name,
                    d.last_name as doctor_last_name
             FROM invoices i
             JOIN users p ON i.patient_id = p.id
             LEFT JOIN appointments a ON i.appointment_id = a.id
             LEFT JOIN users d ON a.doctor_id = d.id
             WHERE i.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async recordPayment(paymentData) {
        const { invoice_id, patient_id, payment_method, amount, payment_date, transaction_id, notes } = paymentData;
        
        const [result] = await pool.execute(
            `INSERT INTO payments 
             (invoice_id, patient_id, payment_method, amount, payment_date, transaction_id, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [invoice_id, patient_id, payment_method, amount, payment_date, transaction_id, notes]
        );
        
        // Update invoice balance
        await pool.execute(
            'UPDATE invoices SET paid_amount = paid_amount + ?, balance_due = balance_due - ? WHERE id = ?',
            [amount, amount, invoice_id]
        );
        
        // Update invoice status
        await pool.execute(
            `UPDATE invoices SET status = 
                CASE 
                    WHEN balance_due <= 0 THEN 'paid'
                    WHEN paid_amount > 0 THEN 'partial'
                    ELSE 'pending'
                END
             WHERE id = ?`,
            [invoice_id]
        );
        
        return { id: result.insertId, ...paymentData };
    }

    static async getPaymentsByInvoiceId(invoiceId) {
        const [rows] = await pool.execute(
            'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC',
            [invoiceId]
        );
        return rows;
    }
}

module.exports = Billing;