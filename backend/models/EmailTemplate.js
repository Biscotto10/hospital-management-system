const pool = require('../config/database');

class EmailTemplate {
    static async getAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM email_templates ORDER BY template_name'
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM email_templates WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getByName(name) {
        const [rows] = await pool.execute(
            'SELECT * FROM email_templates WHERE template_name = ?',
            [name]
        );
        return rows[0];
    }

    static async create(templateData) {
        const { template_name, template_subject, template_body, variables, is_active } = templateData;
        
        const [result] = await pool.execute(
            `INSERT INTO email_templates 
             (template_name, template_subject, template_body, variables, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            [template_name, template_subject, template_body, variables, is_active || true]
        );
        
        return { id: result.insertId, ...templateData };
    }

    static async update(id, templateData) {
        const fields = Object.keys(templateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(templateData);
        values.push(id);
        
        const [result] = await pool.execute(
            `UPDATE email_templates SET ${fields}, updated_at = NOW() WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM email_templates WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async renderTemplate(templateName, variables) {
        const template = await this.getByName(templateName);
        
        if (!template) {
            throw new Error(`Template "${templateName}" not found`);
        }
        
        let subject = template.template_subject;
        let body = template.template_body;
        
        // Parse variables if provided as JSON string
        let variableList = [];
        try {
            variableList = template.variables ? JSON.parse(template.variables) : [];
        } catch (e) {
            variableList = [];
        }
        
        // Replace variables in subject and body
        variableList.forEach(varName => {
            const pattern = new RegExp(`{{${varName}}}`, 'g');
            const value = variables[varName] || '';
            
            subject = subject.replace(pattern, value);
            body = body.replace(pattern, value);
        });
        
        return {
            subject: subject,
            body: body,
            variables: variableList
        };
    }

    static async duplicateTemplate(id, newName) {
        const template = await this.getById(id);
        
        if (!template) {
            throw new Error(`Template with ID ${id} not found`);
        }
        
        // Check if new name already exists
        const existing = await this.getByName(newName);
        if (existing) {
            throw new Error(`Template "${newName}" already exists`);
        }
        
        // Create duplicate
        const duplicateData = {
            template_name: newName,
            template_subject: template.template_subject,
            template_body: template.template_body,
            variables: template.variables,
            is_active: template.is_active
        };
        
        return await this.create(duplicateData);
    }
}

module.exports = EmailTemplate;