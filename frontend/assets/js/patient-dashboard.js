// Patient Dashboard JavaScript

let currentUser = null;
let demoData = {
    appointments: [
        { id: 1, date: '2024-03-15', time: '10:00', doctor: 'Dr. John Smith', department: 'Cardiology', reason: 'Follow-up for hypertension', status: 'scheduled' },
        { id: 2, date: '2024-03-20', time: '14:30', doctor: 'Dr. Sarah Johnson', department: 'General Medicine', reason: 'Annual check-up', status: 'scheduled' }
    ],
    medicalRecords: [
        { id: 1, date: '2024-01-15', doctor: 'Dr. John Smith', diagnosis: 'Hypertension Stage 1', treatment: 'Lisinopril 10mg daily', followUp: '2024-02-15' },
        { id: 2, date: '2024-02-10', doctor: 'Dr. John Smith', diagnosis: 'Type 2 Diabetes', treatment: 'Metformin 500mg twice daily', followUp: '2024-03-10' }
    ],
    prescriptions: [
        { id: 1, medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', doctor: 'Dr. John Smith', status: 'active', refills: 5 },
        { id: 2, medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', doctor: 'Dr. John Smith', status: 'active', refills: 3 }
    ],
    labTests: [
        { id: 1, name: 'Complete Blood Count', type: 'blood', ordered: '2024-01-15', status: 'completed', results: 'Normal ranges' },
        { id: 2, name: 'Lipid Panel', type: 'blood', ordered: '2024-02-10', status: 'completed', results: 'Cholesterol: 210 mg/dL' },
        { id: 3, name: 'Hemoglobin A1C', type: 'blood', ordered: '2024-02-10', status: 'ordered', results: 'Pending' }
    ],
    invoices: [
        { id: 1, number: 'INV-2024-001', date: '2024-01-16', description: 'Hypertension consultation', total: 350, insurance: 280, due: 0, status: 'paid' },
        { id: 2, number: 'INV-2024-002', date: '2024-02-11', description: 'Diabetes consultation + tests', total: 520, insurance: 416, due: 54, status: 'partial' },
        { id: 3, number: 'INV-2024-003', date: '2024-02-20', description: 'Laboratory tests', total: 150, insurance: 120, due: 30, status: 'pending' }
    ],
    insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'P123456789',
        memberId: 'M-12345-01',
        planType: 'PPO',
        deductible: 1500,
        coinsurance: 20,
        copay: 25,
        outOfPocketMax: 5000
    }
};

function initializeDashboard() {
    // Check authentication
    currentUser = JSON.parse(localStorage.getItem('hms_user'));
    if (!currentUser) {
        window.location.href = '../auth/login.html';
        return;
    }
    
    // Update UI with user info
    document.getElementById('patientName').textContent = currentUser.name || 'Patient User';
    document.getElementById('patientEmail').textContent = currentUser.email || 'patient@hms.com';
    document.getElementById('userName').textContent = currentUser.name || 'Patient User';
    
    // Set today's date as minimum for appointment booking
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('appointmentDate')) {
        document.getElementById('appointmentDate').min = today;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load dashboard data
    loadDashboardData();
}

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            loadSection(section);
        });
    });
    
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('d-none');
            document.querySelector('.sidebar').classList.toggle('d-block');
        });
    }
    
    // Prescription filter
    const prescriptionFilter = document.getElementById('prescriptionFilter');
    if (prescriptionFilter) {
        prescriptionFilter.addEventListener('change', function() {
            loadPrescriptions(this.value);
        });
    }
}

function loadSection(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(div => {
        div.style.display = 'none';
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            overview: 'Patient Dashboard',
            appointments: 'My Appointments',
            'medical-records': 'Medical Records',
            prescriptions: 'Prescriptions',
            'lab-tests': 'Laboratory Tests',
            billing: 'Billing & Payments',
            insurance: 'Insurance Information',
            profile: 'My Profile'
        };
        pageTitle.textContent = titles[section] || 'Patient Dashboard';
    }
    
    // Load section-specific data
    switch(section) {
        case 'overview':
            loadOverview();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'medical-records':
            loadMedicalRecords();
            break;
        case 'prescriptions':
            loadPrescriptions('active');
            break;
        case 'lab-tests':
            loadLabTests();
            break;
        case 'billing':
            loadBilling();
            break;
        case 'insurance':
            loadInsurance();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

async function loadDashboardData() {
    try {
        // Try to load from API first
        if (window.apiService && currentUser.token && !currentUser.token.startsWith('demo')) {
            await loadFromAPI();
        } else {
            // Use demo data
            useDemoData();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        useDemoData();
    }
}

async function loadFromAPI() {
    try {
        // Load user profile
        const profile = await apiService.getProfile();
        if (profile && profile.user) {
            currentUser = { ...currentUser, ...profile.user };
            localStorage.setItem('hms_user', JSON.stringify(currentUser));
        }
        
        // Load appointments
        const appointments = await apiService.getAppointments();
        demoData.appointments = appointments.map(apt => ({
            id: apt.id,
            date: apt.appointment_date,
            time: apt.appointment_time,
            doctor: `${apt.doctor_first_name} ${apt.doctor_last_name}`,
            department: apt.department || 'General',
            reason: apt.reason,
            status: apt.status
        }));
        
        // Load medical records
        const medicalRecords = await apiService.get('/patients/dashboard/medical-records');
        demoData.medicalRecords = medicalRecords.map(record => ({
            id: record.id,
            date: record.visit_date,
            doctor: `${record.doctor_first_name} ${record.doctor_last_name}`,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            followUp: record.follow_up_date
        }));
        
        // Load prescriptions
        const prescriptions = await apiService.get('/patients/dashboard/prescriptions');
        demoData.prescriptions = prescriptions.map(pres => ({
            id: pres.id,
            medication: pres.medication_name,
            dosage: pres.dosage,
            frequency: pres.frequency,
            doctor: `${pres.doctor_first_name} ${pres.doctor_last_name}`,
            status: pres.status,
            refills: pres.refills
        }));
        
        // Load lab tests
        const labTests = await apiService.get('/patients/dashboard/lab-tests');
        demoData.labTests = labTests.map(test => ({
            id: test.id,
            name: test.test_name,
            type: test.test_type,
            ordered: test.ordered_date,
            status: test.status,
            results: test.results
        }));
        
        // Load billing
        const invoices = await apiService.get('/patients/dashboard/invoices');
        demoData.invoices = invoices.map(inv => ({
            id: inv.id,
            number: inv.invoice_number,
            date: inv.invoice_date,
            description: inv.appointment_id ? 'Appointment' : 'Laboratory Tests',
            total: inv.total_amount,
            insurance: inv.insurance_covered,
            due: inv.balance_due,
            status: inv.status
        }));
        
        // Load insurance
        const insurance = await apiService.get('/patients/dashboard/insurance');
        if (insurance && insurance.provider_name) {
            demoData.insurance = {
                provider: insurance.provider_name,
                policyNumber: insurance.policy_number,
                memberId: insurance.member_id,
                planType: insurance.plan_type,
                deductible: insurance.deductible,
                coinsurance: insurance.coinsurance_percentage,
                copay: insurance.copay_amount,
                outOfPocketMax: insurance.out_of_pocket_max
            };
        }
        
        // Update UI
        updateDashboardStats();
        loadOverview();
        
    } catch (error) {
        console.error('API load error:', error);
        useDemoData();
    }
}

function useDemoData() {
    // Update stats
    document.getElementById('appointmentsCount').textContent = demoData.appointments.filter(a => a.status === 'scheduled').length;
    document.getElementById('prescriptionsCount').textContent = demoData.prescriptions.filter(p => p.status === 'active').length;
    document.getElementById('pendingBills').textContent = `$${demoData.invoices.reduce((sum, inv) => sum + inv.due, 0)}`;
    document.getElementById('labTestsCount').textContent = demoData.labTests.length;
    document.getElementById('insuranceProvider').textContent = demoData.insurance.provider;
    
    // Load overview
    loadOverview();
}

function updateDashboardStats() {
    const pendingBills = demoData.invoices.reduce((sum, inv) => sum + inv.due, 0);
    
    document.getElementById('appointmentsCount').textContent = 
        demoData.appointments.filter(a => a.status === 'scheduled').length;
    document.getElementById('prescriptionsCount').textContent = 
        demoData.prescriptions.filter(p => p.status === 'active').length;
    document.getElementById('pendingBills').textContent = `$${pendingBills}`;
    document.getElementById('labTestsCount').textContent = demoData.labTests.length;
    document.getElementById('insuranceProvider').textContent = demoData.insurance.provider;
    
    // Update billing section stats if visible
    if (document.getElementById('totalBalance')) {
        document.getElementById('totalBalance').textContent = `$${pendingBills}`;
        document.getElementById('pendingInvoices').textContent = 
            demoData.invoices.filter(inv => inv.due > 0).length;
        document.getElementById('paidAmount').textContent = 
            `$${demoData.invoices.reduce((sum, inv) => sum + (inv.total - inv.due), 0)}`;
    }
}

function loadOverview() {
    // Load upcoming appointments
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    if (upcomingAppointments) {
        const upcoming = demoData.appointments
            .filter(apt => apt.status === 'scheduled')
            .slice(0, 3);
        
        if (upcoming.length > 0) {
            let html = '<div class="list-group list-group-flush">';
            upcoming.forEach(apt => {
                html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${apt.doctor}</h6>
                            <small class="text-muted">${apt.date} at ${apt.time} • ${apt.department}</small>
                        </div>
                        <span class="badge badge-info">${apt.status}</span>
                    </div>
                    <small>${apt.reason}</small>
                </div>`;
            });
            html += '</div>';
            upcomingAppointments.innerHTML = html;
        } else {
            upcomingAppointments.innerHTML = '<p class="text-center text-muted py-3">No upcoming appointments</p>';
        }
    }
    
    // Load recent medical records
    const recentMedicalRecords = document.getElementById('recentMedicalRecords');
    if (recentMedicalRecords) {
        const recent = demoData.medicalRecords.slice(0, 3);
        
        if (recent.length > 0) {
            let html = '<div class="list-group list-group-flush">';
            recent.forEach(record => {
                html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${record.diagnosis.split(' ')[0]}</h6>
                            <small class="text-muted">${record.date} • ${record.doctor}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewMedicalRecord(${record.id})">
                            View
                        </button>
                    </div>
                    <small>${record.treatment.substring(0, 100)}...</small>
                </div>`;
            });
            html += '</div>';
            recentMedicalRecords.innerHTML = html;
        } else {
            recentMedicalRecords.innerHTML = '<p class="text-center text-muted py-3">No medical records found</p>';
        }
    }
}

function loadAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;
    
    let html = '';
    demoData.appointments.forEach(apt => {
        const statusBadge = apt.status === 'scheduled' ? 'badge-info' : 
                          apt.status === 'confirmed' ? 'badge-success' : 
                          apt.status === 'cancelled' ? 'badge-danger' : 'badge-secondary';
        
        html += `
        <tr>
            <td>${apt.date}<br><small class="text-muted">${apt.time}</small></td>
            <td>${apt.doctor}</td>
            <td>${apt.department}</td>
            <td>${apt.reason}</td>
            <td><span class="badge ${statusBadge}">${apt.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewAppointment(${apt.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${apt.status === 'scheduled' ? `
                <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointment(${apt.id})">
                    <i class="fas fa-times"></i>
                </button>` : ''}
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">No appointments found</td></tr>';
}

function loadMedicalRecords() {
    const tbody = document.getElementById('medicalRecordsTableBody');
    if (!tbody) return;
    
    let html = '';
    demoData.medicalRecords.forEach(record => {
        html += `
        <tr>
            <td>${record.date}</td>
            <td>${record.doctor}</td>
            <td>${record.diagnosis}</td>
            <td>${record.treatment.substring(0, 50)}...</td>
            <td>${record.followUp || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewMedicalRecord(${record.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="downloadRecord(${record.id})">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">No medical records found</td></tr>';
}

function loadPrescriptions(status = 'active') {
    const container = document.getElementById('prescriptionsGrid');
    if (!container) return;
    
    let prescriptions = demoData.prescriptions;
    if (status !== 'all') {
        prescriptions = prescriptions.filter(p => p.status === status);
    }
    
    if (prescriptions.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted py-4">No prescriptions found</p></div>';
        return;
    }
    
    let html = '';
    prescriptions.forEach(pres => {
        const statusBadge = pres.status === 'active' ? 'badge-success' : 
                          pres.status === 'completed' ? 'badge-info' : 'badge-secondary';
        
        html += `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6>${pres.medication} ${pres.dosage}</h6>
                    <small class="text-muted">${pres.frequency}</small><br>
                    <small><strong>Doctor:</strong> ${pres.doctor}</small><br>
                    <small><strong>Refills:</strong> ${pres.refills} remaining</small><br>
                    <span class="badge ${statusBadge} mt-2">${pres.status}</span>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary" onclick="refillPrescription(${pres.id})">
                        <i class="fas fa-sync-alt"></i> Request Refill
                    </button>
                </div>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

function loadLabTests() {
    const tbody = document.getElementById('labTestsTableBody');
    if (!tbody) return;
    
    let html = '';
    demoData.labTests.forEach(test => {
        const statusBadge = test.status === 'completed' ? 'badge-success' : 
                          test.status === 'ordered' ? 'badge-warning' : 
                          test.status === 'in-progress' ? 'badge-info' : 'badge-secondary';
        
        html += `
        <tr>
            <td>${test.name}</td>
            <td><span class="badge bg-light text-dark">${test.type}</span></td>
            <td>${test.ordered}</td>
            <td><span class="badge ${statusBadge}">${test.status}</span></td>
            <td>${test.results || 'Pending'}</td>
            <td>
                ${test.results ? `
                <button class="btn btn-sm btn-outline-primary" onclick="viewLabResults(${test.id})">
                    <i class="fas fa-chart-line"></i> Results
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="downloadLabResults(${test.id})">
                    <i class="fas fa-download"></i>
                </button>` : `
                <button class="btn btn-sm btn-outline-secondary" disabled>
                    <i class="fas fa-clock"></i> Pending
                </button>`}
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">No lab tests found</td></tr>';
}

function loadBilling() {
    const tbody = document.getElementById('billingTableBody');
    if (!tbody) return;
    
    // Update stats
    const totalBalance = demoData.invoices.reduce((sum, inv) => sum + inv.due, 0);
    const pendingInvoices = demoData.invoices.filter(inv => inv.due > 0).length;
    const totalPaid = demoData.invoices.reduce((sum, inv) => sum + (inv.total - inv.due), 0);
    
    if (document.getElementById('totalBalance')) {
        document.getElementById('totalBalance').textContent = `$${totalBalance}`;
        document.getElementById('pendingInvoices').textContent = pendingInvoices;
        document.getElementById('paidAmount').textContent = `$${totalPaid}`;
    }
    
    // Update invoice select for payment modal
    const invoiceSelect = document.getElementById('invoiceSelect');
    if (invoiceSelect) {
        invoiceSelect.innerHTML = '<option value="">Select invoice to pay...</option>' +
            demoData.invoices
                .filter(inv => inv.due > 0)
                .map(inv => `<option value="${inv.id}" data-balance="${inv.due}">${inv.number} - Balance: $${inv.due}</option>`)
                .join('');
    }
    
    let html = '';
    demoData.invoices.forEach(inv => {
        const statusBadge = inv.status === 'paid' ? 'badge-success' : 
                          inv.status === 'partial' ? 'badge-warning' : 
                          inv.status === 'pending' ? 'badge-danger' : 'badge-secondary';
        
        html += `
        <tr>
            <td>${inv.number}</td>
            <td>${inv.date}</td>
            <td>${inv.description}</td>
            <td>$${inv.total}</td>
            <td>$${inv.insurance}</td>
            <td><strong>$${inv.due}</strong></td>
            <td><span class="badge ${statusBadge}">${inv.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewInvoice(${inv.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${inv.due > 0 ? `
                <button class="btn btn-sm btn-outline-success" onclick="payInvoice(${inv.id})">
                    <i class="fas fa-credit-card"></i> Pay
                </button>` : ''}
                <button class="btn btn-sm btn-outline-info" onclick="downloadInvoice(${inv.id})">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="8" class="text-center">No invoices found</td></tr>';
}

function loadInsurance() {
    const container = document.getElementById('insuranceDetails');
    if (!container) return;
    
    const insurance = demoData.insurance;
    
    const html = `
    <div class="row">
        <div class="col-md-6">
            <h6>Insurance Provider</h6>
            <p>${insurance.provider}</p>
            
            <h6 class="mt-4">Policy Information</h6>
            <dl class="row">
                <dt class="col-sm-4">Policy Number</dt>
                <dd class="col-sm-8">${insurance.policyNumber}</dd>
                
                <dt class="col-sm-4">Member ID</dt>
                <dd class="col-sm-8">${insurance.memberId}</dd>
                
                <dt class="col-sm-4">Plan Type</dt>
                <dd class="col-sm-8">${insurance.planType}</dd>
            </dl>
        </div>
        <div class="col-md-6">
            <h6>Coverage Details</h6>
            <dl class="row">
                <dt class="col-sm-6">Annual Deductible</dt>
                <dd class="col-sm-6">$${insurance.deductible}</dd>
                
                <dt class="col-sm-6">Coinsurance</dt>
                <dd class="col-sm-6">${insurance.coinsurance}%</dd>
                
                <dt class="col-sm-6">Copay Amount</dt>
                <dd class="col-sm-6">$${insurance.copay}</dd>
                
                <dt class="col-sm-6">Out-of-Pocket Max</dt>
                <dd class="col-sm-6">$${insurance.outOfPocketMax}</dd>
            </dl>
        </div>
    </div>
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-info-circle"></i> For claims and coverage questions, contact your insurance provider directly.
        </small>
    </div>`;
    
    container.innerHTML = html;
}

function loadProfile() {
    // Personal Info
    const personalInfo = document.getElementById('personalInfo');
    if (personalInfo) {
        const html = `
        <dl class="row">
            <dt class="col-sm-3">Full Name</dt>
            <dd class="col-sm-9">${currentUser.name || 'Patient User'}</dd>
            
            <dt class="col-sm-3">Email Address</dt>
            <dd class="col-sm-9">${currentUser.email || 'patient@hms.com'}</dd>
            
            <dt class="col-sm-3">Phone Number</dt>
            <dd class="col-sm-9">${currentUser.phone || '(555) 123-4567'}</dd>
            
            <dt class="col-sm-3">Date of Birth</dt>
            <dd class="col-sm-9">${currentUser.date_of_birth || 'January 1, 1980'}</dd>
            
            <dt class="col-sm-3">Address</dt>
            <dd class="col-sm-9">${currentUser.address || '123 Main St, Anytown, USA'}</dd>
            
            <dt class="col-sm-3">Emergency Contact</dt>
            <dd class="col-sm-9">John Doe (555) 987-6543</dd>
        </dl>`;
        personalInfo.innerHTML = html;
    }
    
    // Medical Info
    const medicalInfo = document.getElementById('medicalInfo');
    if (medicalInfo) {
        const html = `
        <dl class="row">
            <dt class="col-sm-4">Blood Type</dt>
            <dd class="col-sm-8">O+</dd>
            
            <dt class="col-sm-4">Allergies</dt>
            <dd class="col-sm-8">Peanuts, Penicillin</dd>
            
            <dt class="col-sm-4">Current Conditions</dt>
            <dd class="col-sm-8">Hypertension, Type 2 Diabetes</dd>
            
            <dt class="col-sm-4">Primary Physician</dt>
            <dd class="col-sm-8">Dr. John Smith</dd>
            
            <dt class="col-sm-4">Last Physical</dt>
            <dd class="col-sm-8">February 10, 2024</dd>
        </dl>`;
        medicalInfo.innerHTML = html;
    }
}

// Modal Functions
function bookAppointment() {
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();
}

function submitAppointment() {
    const doctor = document.getElementById('doctorSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('appointmentReason').value;
    
    if (!doctor || !department || !date || !time || !reason) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new appointment
    const newAppointment = {
        id: demoData.appointments.length + 1,
        date: date,
        time: time,
        doctor: doctor === '1' ? 'Dr. John Smith' : 
               doctor === '2' ? 'Dr. Sarah Johnson' : 'Dr. Michael Brown',
        department: department,
        reason: reason,
        status: 'scheduled'
    };
    
    demoData.appointments.push(newAppointment);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
    
    // Show success message
    alert('Appointment booked successfully!');
    
    // Refresh appointments
    loadAppointments();
    updateDashboardStats();
}

function makePayment() {
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function submitPayment() {
    const invoiceId = document.getElementById('invoiceSelect').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!invoiceId || !amount || amount <= 0) {
        alert('Please select an invoice and enter a valid payment amount');
        return;
    }
    
    // Validate card
    if (!cardNumber || !expiryDate || !cvv) {
        alert('Please enter complete payment information');
        return;
    }
    
    // Find invoice
    const invoiceIndex = demoData.invoices.findIndex(inv => inv.id == invoiceId);
    if (invoiceIndex === -1) {
        alert('Invoice not found');
        return;
    }
    
    const invoice = demoData.invoices[invoiceIndex];
    
    if (amount > invoice.due) {
        alert(`Payment cannot exceed balance due: $${invoice.due}`);
        return;
    }
    
    // Update invoice
    invoice.due -= amount;
    invoice.status = invoice.due === 0 ? 'paid' : 'partial';
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    
    // Show success message
    alert('Payment processed successfully!');
    
    // Refresh billing
    loadBilling();
    updateDashboardStats();
}

// View Functions
function viewAppointment(id) {
    const appointment = demoData.appointments.find(apt => apt.id === id);
    if (!appointment) return;
    
    const html = `
    <div class="row">
        <div class="col-md-6">
            <h6>Appointment Details</h6>
            <dl>
                <dt>Date & Time</dt>
                <dd>${appointment.date} at ${appointment.time}</dd>
                
                <dt>Doctor</dt>
                <dd>${appointment.doctor}</dd>
                
                <dt>Department</dt>
                <dd>${appointment.department}</dd>
                
                <dt>Status</dt>
                <dd><span class="badge badge-info">${appointment.status}</span></dd>
            </dl>
        </div>
        <div class="col-md-6">
            <h6>Visit Information</h6>
            <dl>
                <dt>Reason for Visit</dt>
                <dd>${appointment.reason}</dd>
                
                <dt>Notes</dt>
                <dd>${appointment.notes || 'No additional notes'}</dd>
            </dl>
        </div>
    </div>
    <div class="mt-3">
        <h6>Preparation Instructions</h6>
        <ul>
            <li>Arrive 15 minutes before your appointment</li>
            <li>Bring your insurance card and ID</li>
            <li>Bring a list of current medications</li>
            <li>Wear comfortable clothing</li>
        </ul>
    </div>`;
    
    document.getElementById('detailsModalTitle').textContent = 'Appointment Details';
    document.getElementById('detailsModalBody').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function viewMedicalRecord(id) {
    const record = demoData.medicalRecords.find(rec => rec.id === id);
    if (!record) return;
    
    const html = `
    <div class="row">
        <div class="col-md-6">
            <h6>Visit Information</h6>
            <dl>
                <dt>Visit Date</dt>
                <dd>${record.date}</dd>
                
                <dt>Doctor</dt>
                <dd>${record.doctor}</dd>
                
                <dt>Follow-up Date</dt>
                <dd>${record.followUp || 'Not scheduled'}</dd>
            </dl>
        </div>
        <div class="col-md-6">
            <h6>Diagnosis & Treatment</h6>
            <dl>
                <dt>Diagnosis</dt>
                <dd>${record.diagnosis}</dd>
                
                <dt>Treatment Plan</dt>
                <dd>${record.treatment}</dd>
            </dl>
        </div>
    </div>
    <div class="mt-3">
        <h6>Notes</h6>
        <p>Patient presented with typical symptoms. Recommended lifestyle changes and medication as prescribed. 
           Patient instructed to monitor blood pressure daily and return for follow-up.</p>
    </div>
    <div class="mt-3">
        <button class="btn btn-outline-primary" onclick="downloadRecord(${id})">
            <i class="fas fa-download"></i> Download Full Record
        </button>
    </div>`;
    
    document.getElementById('detailsModalTitle').textContent = 'Medical Record Details';
    document.getElementById('detailsModalBody').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function viewLabResults(id) {
    const test = demoData.labTests.find(t => t.id === id);
    if (!test) return;
    
    const html = `
    <div class="row">
        <div class="col-md-6">
            <h6>Test Information</h6>
            <dl>
                <dt>Test Name</dt>
                <dd>${test.name}</dd>
                
                <dt>Test Type</dt>
                <dd>${test.type}</dd>
                
                <dt>Ordered Date</dt>
                <dd>${test.ordered}</dd>
                
                <dt>Status</dt>
                <dd><span class="badge badge-success">${test.status}</span></dd>
            </dl>
        </div>
        <div class="col-md-6">
            <h6>Results</h6>
            <div class="bg-light p-3 rounded">
                <pre>${test.results || 'Results pending'}</pre>
            </div>
        </div>
    </div>
    <div class="mt-3">
        <h6>Interpretation</h6>
        <p>Results indicate typical ranges for age and gender. No abnormalities detected. 
           Continue with current treatment plan and monitor as scheduled.</p>
    </div>
    <div class="mt-3">
        <button class="btn btn-outline-primary" onclick="downloadLabResults(${id})">
            <i class="fas fa-download"></i> Download Results
        </button>
    </div>`;
    
    document.getElementById('detailsModalTitle').textContent = 'Lab Test Results';
    document.getElementById('detailsModalBody').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function viewInvoice(id) {
    const invoice = demoData.invoices.find(inv => inv.id === id);
    if (!invoice) return;
    
    const html = `
    <div class="row">
        <div class="col-md-6">
            <h6>Invoice Details</h6>
            <dl>
                <dt>Invoice Number</dt>
                <dd>${invoice.number}</dd>
                
                <dt>Date</dt>
                <dd>${invoice.date}</dd>
                
                <dt>Description</dt>
                <dd>${invoice.description}</dd>
                
                <dt>Status</dt>
                <dd><span class="badge ${invoice.status === 'paid' ? 'badge-success' : 'badge-danger'}">${invoice.status}</span></dd>
            </dl>
        </div>
        <div class="col-md-6">
            <h6>Amount Breakdown</h6>
            <dl>
                <dt>Total Amount</dt>
                <dd>$${invoice.total}</dd>
                
                <dt>Insurance Coverage</dt>
                <dd>$${invoice.insurance}</dd>
                
                <dt>Patient Responsibility</dt>
                <dd>$${invoice.total - invoice.insurance}</dd>
                
                <dt>Amount Paid</dt>
                <dd>$${invoice.total - invoice.insurance - invoice.due}</dd>
                
                <dt class="text-primary">Balance Due</dt>
                <dd class="text-primary"><strong>$${invoice.due}</strong></dd>
            </dl>
        </div>
    </div>
    <div class="mt-3">
        <h6>Billing Codes</h6>
        <p>CPT: 99213, 80053 | ICD-10: I10, E11</p>
    </div>
    <div class="mt-3">
        <button class="btn btn-outline-primary" onclick="downloadInvoice(${id})">
            <i class="fas fa-download"></i> Download Invoice
        </button>
        ${invoice.due > 0 ? `
        <button class="btn btn-primary" onclick="payInvoice(${id})">
            <i class="fas fa-credit-card"></i> Pay Now
        </button>` : ''}
    </div>`;
    
    document.getElementById('detailsModalTitle').textContent = 'Invoice Details';
    document.getElementById('detailsModalBody').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

// Action Functions
function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointmentIndex = demoData.appointments.findIndex(apt => apt.id === id);
        if (appointmentIndex !== -1) {
            demoData.appointments[appointmentIndex].status = 'cancelled';
            alert('Appointment cancelled successfully');
            loadAppointments();
            updateDashboardStats();
        }
    }
}

function refillPrescription(id) {
    const prescription = demoData.prescriptions.find(p => p.id === id);
    if (!prescription) return;
    
    if (prescription.refills > 0) {
        if (confirm(`Request refill for ${prescription.medication}? You have ${prescription.refills} refills remaining.`)) {
            alert('Refill request submitted to your doctor. You will be notified when approved.');
        }
    } else {
        alert('No refills remaining. Please contact your doctor for a new prescription.');
    }
}

function payInvoice(id) {
    const invoice = demoData.invoices.find(inv => inv.id === id);
    if (!invoice) return;
    
    // Set invoice in payment modal
    document.getElementById('invoiceSelect').value = id;
    document.getElementById('paymentAmount').value = invoice.due;
    
    // Show payment modal
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function downloadMedicalRecords() {
    alert('Downloading medical records... (Demo)');
    // In real implementation, this would generate and download a PDF
}

function downloadRecord(id) {
    alert(`Downloading medical record #${id}... (Demo)`);
}

function downloadLabResults(id) {
    alert(`Downloading lab results #${id}... (Demo)`);
}

function downloadInvoice(id) {
    alert(`Downloading invoice #${id}... (Demo)`);
}

function editProfile() {
    alert('Edit profile feature coming soon!');
}

function editInsurance() {
    alert('Edit insurance feature coming soon!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        localStorage.removeItem('hms_token');
        window