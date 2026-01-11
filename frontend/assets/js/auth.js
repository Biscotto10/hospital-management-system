// Authentication JavaScript for Hospital Management System

const API_BASE_URL = 'http://localhost:3000/api';

// Show alert message
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close float-end" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Handle login form submission
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalText = loginButton.innerHTML;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
        loginButton.disabled = true;
        
        try {
            // Demo mode - simulate API call
            const isDemo = true; // Set to false to use real API
            
            if (isDemo) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Demo credentials check
                const demoUsers = {
                    'admin@hms.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
                    'doctor@hms.com': { password: 'doctor123', role: 'doctor', name: 'Dr. John Smith' },
                    'patient@hms.com': { password: 'patient123', role: 'patient', name: 'Jane Doe' }
                };
                
                if (demoUsers[email] && demoUsers[email].password === password) {
                    const user = demoUsers[email];
                    
                    // Store user data in localStorage for demo
                    localStorage.setItem('hms_user', JSON.stringify({
                        email: email,
                        name: user.name,
                        role: user.role,
                        token: 'demo_jwt_token_' + Date.now()
                    }));
                    
                    showAlert(`Welcome back, ${user.name}!`, 'success');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        window.location.href = '../../views/dashboard/admin.html';
                    }, 1000);
                } else {
                    throw new Error('Invalid credentials');
                }
            } else {
                // Real API call
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token and user data
                    localStorage.setItem('hms_token', data.token);
                    localStorage.setItem('hms_user', JSON.stringify(data.user));
                    
                    showAlert('Login successful!', 'success');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = '../../views/dashboard/admin.html';
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            }
        } catch (error) {
            showAlert(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            loginButton.innerHTML = originalText;
            loginButton.disabled = false;
        }
    });
}

// Handle registration form submission
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!firstName || !lastName || !email || !phone || !password) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 8) {
            showAlert('Password must be at least 8 characters long', 'error');
            return;
        }
        
        const registerButton = registerForm.querySelector('button[type="submit"]');
        const originalText = registerButton.innerHTML;
        registerButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating account...';
        registerButton.disabled = true;
        
        try {
            // Demo mode - simulate API call
            const isDemo = true;
            
            if (isDemo) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Get additional patient data if applicable
                let patientData = null;
                if (role === 'patient') {
                    const bloodGroup = document.getElementById('bloodGroup').value;
                    const allergies = document.getElementById('allergies').value;
                    patientData = { bloodGroup, allergies };
                }
                
                // Store user data in localStorage for demo
                localStorage.setItem('hms_user', JSON.stringify({
                    email: email,
                    name: `${firstName} ${lastName}`,
                    role: role,
                    phone: phone,
                    patientData: patientData,
                    token: 'demo_jwt_token_' + Date.now()
                }));
                
                showAlert(`Account created successfully! Welcome ${firstName}`, 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    window.location.href = '../../views/dashboard/admin.html';
                }, 1500);
            } else {
                // Real API call
                const userData = {
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    role,
                    phone
                };
                
                // Add patient data if patient role
                if (role === 'patient') {
                    userData.blood_group = document.getElementById('bloodGroup').value;
                    userData.allergies = document.getElementById('allergies').value;
                }
                
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token and user data
                    localStorage.setItem('hms_token', data.token);
                    localStorage.setItem('hms_user', JSON.stringify(data.user));
                    
                    showAlert('Registration successful!', 'success');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = '../../views/dashboard/admin.html';
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Registration failed');
                }
            }
        } catch (error) {
            showAlert(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            registerButton.innerHTML = originalText;
            registerButton.disabled = false;
        }
    });
}

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('hms_user'));
    const token = localStorage.getItem('hms_token') || user?.token;
    
    if (!user || !token) {
        // Redirect to login if not authenticated
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('register.html')) {
            window.location.href = '../auth/login.html';
        }
        return null;
    }
    
    return { user, token };
}

// Logout function
function logout() {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    window.location.href = '../auth/login.html';
}

// Make functions available globally
window.showAlert = showAlert;
window.checkAuth = checkAuth;
window.logout = logout;