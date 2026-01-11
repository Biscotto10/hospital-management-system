const pool = require('../config/database');

class Insurance {
    static async createOrUpdate(insuranceData) {
        const { patient_id, provider_name, policy_number, group_number, member_id, plan_type, effective_date, expiration_date, copay_amount, deductible, coinsurance_percentage, out_of_pocket_max, primary_insured_name, relationship_to_patient } = insuranceData;
        
        // Check if insurance info already exists
        const [existing] = await pool.execute(
            'SELECT id FROM insurance_info WHERE patient_id = ?',
            [patient_id]
        );
        
        if (existing.length > 0) {
            // Update existing record
            const [result] = await pool.execute(
                `UPDATE insurance_info SET 
                    provider_name = ?, policy_number = ?, group_number = ?, member_id = ?, 
                    plan_type = ?, effective_date = ?, expiration_date = ?, 
                    copay_amount = ?, deductible = ?, coinsurance_percentage = ?, 
                    out_of_pocket_max = ?, primary_insured_name = ?, relationship_to_patient = ?
                 WHERE patient_id = ?`,
                [provider_name, policy_number, group_number, member_id, plan_type, 
                 effective_date, expiration_date, copay_amount, deductible, 
                 coinsurance_percentage, out_of_pocket_max, primary_insured_name, 
                 relationship_to_patient, patient_id]
            );
            return { id: existing[0].id, ...insuranceData, updated: true };
        } else {
            // Create new record
            const [result] = await pool.execute(
                `INSERT INTO insurance_info 
                 (patient_id, provider_name, policy_number, group_number, member_id, 
                  plan_type, effective_date, expiration_date, copay_amount, deductible, 
                  coinsurance_percentage, out_of_pocket_max, primary_insured_name, relationship_to_patient) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [patient_id, provider_name, policy_number, group_number, member_id, 
                 plan_type, effective_date, expiration_date, copay_amount, deductible, 
                 coinsurance_percentage, out_of_pocket_max, primary_insured_name, relationship_to_patient]
            );
            return { id: result.insertId, ...insuranceData, updated: false };
        }
    }

    static async findByPatientId(patientId) {
        const [rows] = await pool.execute(
            'SELECT * FROM insurance_info WHERE patient_id = ?',
            [patientId]
        );
        return rows[0];
    }
}

module.exports = Insurance;