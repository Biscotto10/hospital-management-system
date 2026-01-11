const Staff = require('../models/Staff');
const Admission = require('../models/Admission');
const Inventory = require('../models/Inventory');
const Department = require('../models/Department');
const Message = require('../models/Message');
const Appointment = require('../models/Appointment');

class StaffController {
    // Staff Dashboard Statistics
    static async getDashboardStats(req, res) {
        try {
            const [
                staffCount,
                currentAdmissions,
                lowStockItems,
                todaysAppointments
            ] = await Promise.all([
                Staff.getStaffCount(),
                Admission.getCurrentAdmissions(),
                Inventory.getLowStock(),
                Appointment.findByDate(new Date().toISOString().split('T')[0])
            ]);
            
            res.json({
                staffCount,
                currentAdmissions,
                lowStockCount: lowStockItems.length,
                todaysAppointments: todaysAppointments.length
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Staff Schedule Management
    static async getMySchedule(req, res) {
        try {
            const { start_date, end_date } = req.query;
            const startDate = start_date || new Date().toISOString().split('T')[0];
            const endDate = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            const schedule = await Staff.getStaffSchedule(req.user.id, startDate, endDate);
            res.json(schedule);
        } catch (error) {
            console.error('Get schedule error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async addSchedule(req, res) {
        try {
            const scheduleData = {
                staff_id: req.user.id,
                ...req.body
            };
            
            const schedule = await Staff.addSchedule(scheduleData);
            res.status(201).json({ 
                message: 'Schedule added successfully', 
                schedule 
            });
        } catch (error) {
            console.error('Add schedule error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Task Management
    static async getMyTasks(req, res) {
        try {
            const { status } = req.query;
            const tasks = await Staff.getTasks(req.user.id, status);
            res.json(tasks);
        } catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async addTask(req, res) {
        try {
            const taskData = {
                staff_id: req.user.id,
                assigned_by: req.user.id,
                ...req.body
            };
            
            const task = await Staff.addTask(taskData);
            res.status(201).json({ 
                message: 'Task added successfully', 
                task 
            });
        } catch (error) {
            console.error('Add task error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateTaskStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const updated = await Staff.updateTaskStatus(id, status);
            if (!updated) {
                return res.status(404).json({ message: 'Task not found' });
            }
            
            res.json({ message: 'Task status updated successfully' });
        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Admissions Management
    static async getAdmissions(req, res) {
        try {
            const { status } = req.query;
            const admissions = await Admission.getAdmissions(status);
            res.json(admissions);
        } catch (error) {
            console.error('Get admissions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async admitPatient(req, res) {
        try {
            const admission = await Admission.admitPatient(req.body);
            res.status(201).json({ 
                message: 'Patient admitted successfully', 
                admission 
            });
        } catch (error) {
            console.error('Admit patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async dischargePatient(req, res) {
        try {
            const { id } = req.params;
            const updated = await Admission.dischargePatient(id, req.body);
            
            if (!updated) {
                return res.status(404).json({ message: 'Admission not found or already discharged' });
            }
            
            res.json({ message: 'Patient discharged successfully' });
        } catch (error) {
            console.error('Discharge patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateAdmissionRoom(req, res) {
        try {
            const { id } = req.params;
            const { room_number, bed_number } = req.body;
            
            const updated = await Admission.updateRoom(id, room_number, bed_number);
            if (!updated) {
                return res.status(404).json({ message: 'Admission not found' });
            }
            
            res.json({ message: 'Room updated successfully' });
        } catch (error) {
            console.error('Update room error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Inventory Management
    static async getInventory(req, res) {
        try {
            const { type, low_stock } = req.query;
            
            let inventory;
            if (low_stock === 'true') {
                inventory = await Inventory.getLowStock();
            } else if (type) {
                inventory = await Inventory.getByType(type);
            } else {
                inventory = await Inventory.getAll();
            }
            
            res.json(inventory);
        } catch (error) {
            console.error('Get inventory error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async addInventoryItem(req, res) {
        try {
            const item = await Inventory.addItem(req.body);
            res.status(201).json({ 
                message: 'Inventory item added successfully', 
                item 
            });
        } catch (error) {
            console.error('Add inventory error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async updateInventoryItem(req, res) {
        try {
            const { id } = req.params;
            const updated = await Inventory.updateItem(id, req.body);
            
            if (!updated) {
                return res.status(404).json({ message: 'Inventory item not found' });
            }
            
            res.json({ message: 'Inventory item updated successfully' });
        } catch (error) {
            console.error('Update inventory error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async adjustStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, notes } = req.body;
            
            const result = await Inventory.adjustStock(id, quantity, req.user.id, notes);
            
            if (!result.success) {
                return res.status(400).json({ message: 'Failed to adjust stock' });
            }
            
            res.json({ 
                message: quantity > 0 ? 'Stock added successfully' : 'Stock removed successfully',
                newQuantity: result.newQuantity
            });
        } catch (error) {
            console.error('Adjust stock error:', error);
            res.status(500).json({ message: error.message || 'Server error' });
        }
    }
    
    static async getInventoryTransactions(req, res) {
        try {
            const { item_id } = req.query;
            const transactions = await Inventory.getTransactions(item_id);
            res.json(transactions);
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Department Management
    static async getDepartments(req, res) {
        try {
            const departments = await Department.getAll();
            res.json(departments);
        } catch (error) {
            console.error('Get departments error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getDepartmentStats(req, res) {
        try {
            const stats = await Department.getDepartmentStats();
            res.json(stats);
        } catch (error) {
            console.error('Get department stats error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Messaging System
    static async sendMessage(req, res) {
        try {
            const messageData = {
                sender_id: req.user.id,
                ...req.body
            };
            
            const message = await Message.sendMessage(messageData);
            res.status(201).json({ 
                message: 'Message sent successfully', 
                message: message 
            });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getInbox(req, res) {
        try {
            const { unread } = req.query;
            const messages = await Message.getInbox(req.user.id, unread === 'true');
            res.json(messages);
        } catch (error) {
            console.error('Get inbox error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getSentMessages(req, res) {
        try {
            const messages = await Message.getSentMessages(req.user.id);
            res.json(messages);
        } catch (error) {
            console.error('Get sent messages error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async markMessageAsRead(req, res) {
        try {
            const { id } = req.params;
            const updated = await Message.markAsRead(id);
            
            if (!updated) {
                return res.status(404).json({ message: 'Message not found' });
            }
            
            res.json({ message: 'Message marked as read' });
        } catch (error) {
            console.error('Mark message as read error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getMessage(req, res) {
        try {
            const { id } = req.params;
            const message = await Message.getMessageById(id);
            
            if (!message) {
                return res.status(404).json({ message: 'Message not found' });
            }
            
            // Check if user is sender or receiver
            if (message.sender_id !== req.user.id && message.receiver_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            
            // Mark as read if receiver
            if (message.receiver_id === req.user.id && !message.is_read) {
                await Message.markAsRead(id);
            }
            
            res.json(message);
        } catch (error) {
            console.error('Get message error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getUnreadCount(req, res) {
        try {
            const count = await Message.getUnreadCount(req.user.id);
            res.json({ count });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    // Staff Management
    static async getAllStaff(req, res) {
        try {
            const staff = await Staff.getAllStaff();
            res.json(staff);
        } catch (error) {
            console.error('Get all staff error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    static async getStaffByDept(req, res) {
        try {
            const { department } = req.params;
            const staff = await Staff.getStaffByDepartment(department);
            res.json(staff);
        } catch (error) {
            console.error('Get staff by department error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = StaffController;