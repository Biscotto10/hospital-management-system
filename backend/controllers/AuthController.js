const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiration } = require('../config/auth');
const User = require('../models/User');
const Patient = require('../models/Patient');

class AuthController {
    static async register(req, res) {
        try {
            const { email, password, first_name, last_name, role, phone, blood_group, allergies } = req.body;
            
            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            
            // Create user
            const user = await User.create({ 
                email, 
                password, 
                first_name, 
                last_name, 
                role: role || 'patient', 
                phone 
            });
            
            // If patient, create patient record
            if ((role === 'patient' || !role) && (blood_group || allergies)) {
                await Patient.create({
                    user_id: user.id,
                    blood_group,
                    allergies
                });
            }
            
            // Generate JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: jwtExpiration }
            );
            
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            
            // Check password
            const isPasswordValid = await User.comparePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            
            // Generate JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: jwtExpiration }
            );
            
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    phone: user.phone
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // If patient, get patient details
            let patientDetails = null;
            if (user.role === 'patient') {
                patientDetails = await Patient.findByUserId(user.id);
            }
            
            res.json({
                user,
                patientDetails
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = AuthController;