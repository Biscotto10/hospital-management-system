const Billing = require('../models/Billing');

class BillingController {
    static async getMyInvoices(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const invoices = await Billing.getInvoicesByPatientId(req.user.id);
            res.json(invoices);
        } catch (error) {
            console.error('Get invoices error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await Billing.getInvoiceById(id);
            
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            
            // Check if patient owns this invoice
            if (req.user.role === 'patient' && invoice.patient_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            
            const payments = await Billing.getPaymentsByInvoiceId(id);
            res.json({ invoice, payments });
        } catch (error) {
            console.error('Get invoice error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async makePayment(req, res) {
        try {
            if (req.user.role !== 'patient') {
                return res.status(403).json({ message: 'Access denied. Patients only.' });
            }
            
            const { invoice_id, amount, payment_method, transaction_id, notes } = req.body;
            
            // Validate payment
            const invoice = await Billing.getInvoiceById(invoice_id);
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            
            if (invoice.patient_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            
            if (amount <= 0 || amount > invoice.balance_due) {
                return res.status(400).json({ 
                    message: `Invalid payment amount. Maximum allowed: $${invoice.balance_due}` 
                });
            }
            
            const payment = await Billing.recordPayment({
                invoice_id,
                patient_id: req.user.id,
                payment_method,
                amount,
                payment_date: new Date().toISOString().split('T')[0],
                transaction_id,
                notes
            });
            
            const updatedInvoice = await Billing.getInvoiceById(invoice_id);
            res.json({ 
                message: 'Payment processed successfully', 
                payment, 
                invoice: updatedInvoice 
            });
        } catch (error) {
            console.error('Make payment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = BillingController;