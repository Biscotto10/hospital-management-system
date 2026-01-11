// Staff Dashboard JavaScript

let currentStaff = null;
let demoData = {
    stats: {
        totalPatients: 127,
        currentAdmissions: 15,
        todayAppointments: 24,
        lowStockItems: 7,
        unreadMessages: 3,
        pendingTasks: 3
    },
    tasks: [
        { id: 1, title: 'Process patient admissions', description: 'Check and process new patient admissions for today', priority: 'high', status: 'pending', dueDate: '2024-03-15' },
        { id: 2, title: 'Update inventory records', description: 'Update medication stock levels in system', priority: 'medium', status: 'in-progress', dueDate: '2024-03-16' },
        { id: 3, title: 'Schedule appointments', description: 'Schedule appointments for next week', priority: 'medium', status: 'pending', dueDate: '2024-03-17' },
        { id: 4, title: 'Prepare monthly report', description: 'Compile monthly hospital statistics', priority: 'low', status: 'pending', dueDate: '2024-03-20' }
    ],
    admissions: [
        { id: 1, patientName: 'Jane Doe', admissionDate: '2024-03-01', room: '301', bed: 'A', diagnosis: 'Hypertension monitoring', doctor: 'Dr. John Smith', status: 'admitted' },
        { id: 2, patientName: 'John Smith', admissionDate: '2024-03-05', room: '302', bed: 'B', diagnosis: 'Pneumonia', doctor: 'Dr. Sarah Johnson', status: 'admitted' },
        { id: 3, patientName: 'Alice Johnson', admissionDate: '2024-03-10', room: '303', bed: 'A', diagnosis: 'Appendectomy recovery', doctor: 'Dr. Michael Brown', status: 'discharged' }
    ],
    inventory: [
        { id: 1, name: 'Paracetamol 500mg', type: 'medication', category: 'Pain Relief', quantity: 500, reorderLevel: 100, location: 'Pharmacy - Shelf A1', lastUpdated: '2024-03-14' },
        { id: 2, name: 'Surgical Masks', type: 'supply', category: 'PPE', quantity: 1000, reorderLevel: 200, location: 'Store Room - Box 1', lastUpdated: '2024-03-14' },
        { id: 3, name: 'IV Drip Sets', type: 'equipment', category: 'IV Supplies', quantity: 150, reorderLevel: 30, location: 'Store Room - Rack 3', lastUpdated: '2024-03-13' },
        { id: 4, name: 'Blood Pressure Monitor', type: 'equipment', category: 'Diagnostic', quantity: 25, reorderLevel: 5, location: 'Equipment Room - Shelf B2', lastUpdated: '2024-03-12' },
        { id: 5, name: 'Antibiotic Ointment', type: 'medication', category: 'Wound Care', quantity: 80, reorderLevel: 20, location: 'Pharmacy - Shelf C3', lastUpdated: '2024-03-11' }
    ],
    appointments: [
        { id: 1, time: '09:00', patient: 'Robert Brown', doctor: 'Dr. John Smith', department: 'Cardiology', reason: 'Hypertension follow-up', status: 'confirmed' },
        { id: 2, time: '10:30', patient: 'Mary Wilson', doctor: 'Dr. Sarah Johnson', department: 'General Medicine', reason: 'Annual check-up', status: 'confirmed' },
        { id: 3, time: '14:00', patient: 'James Miller', doctor: 'Dr. Michael Brown', department: 'Neurology', reason: 'Migraine consultation', status: 'pending' }
    ],
    departments: [
        { id: 1, name: 'Emergency', description: 'Emergency Medicine Department', doctors: 5, nurses: 8 },
        { id: 2, name: 'Cardiology', description: 'Heart and Cardiovascular Care', doctors: 3, nurses: 6 },
        { id: 3, name: 'Pediatrics', description: 'Child Healthcare Services', doctors: 4, nurses: 7 },
        { id: 4, name: 'Radiology', description: 'Imaging and Diagnostic Services', doctors: 2, nurses: 4 },
        { id: 5, name: 'Pharmacy', description: 'Medication Dispensing', doctors: 1, nurses: 3 }
    ],
    staff: [
        { id: 1, name: 'Dr. John Smith', role: 'doctor', department: 'Cardiology', contact: 'john@hms.com', status: 'active' },
        { id: 2, name: 'Dr. Sarah Johnson', role: 'doctor', department: 'General Medicine', contact: 'sarah@hms.com', status: 'active' },
        { id: 3, name: 'Nurse Emily Davis', role: 'nurse', department: 'Emergency', contact: 'emily@hms.com', status: 'active' },
        { id: 4, name: 'Robert Wilson', role: 'staff', department: 'Administration', contact: 'robert@hms.com', status: 'active' }
    ],
    schedule: [
        { id: 1, date: '2024-03-15', startTime: '08:00', endTime: '16:00', shiftType: 'morning', department: 'Administration', notes: 'Regular shift' },
        { id: 2, date: '2024-03-16', startTime: '08:00', endTime: '16:00', shiftType: 'morning', department: 'Administration', notes: 'Regular shift' },
        { id: 3, date: '2024-03-17', startTime: '16:00', endTime: '00:00', shiftType: 'afternoon', department: 'Administration', notes: 'Weekend shift' }
    ]
};

// Initialize dashboard
function initializeDashboard() {
    // Check authentication
    currentStaff = JSON.parse(localStorage.getItem('hms_user'));
    if (!currentStaff || (currentStaff.role !== 'staff' && currentStaff.role !== 'admin')) {
        window.location.href = '../auth/login.html';
        return;
    }
    
    // Update UI with staff info
    document.getElementById('staffName').textContent = currentStaff.name || 'Staff User';
    document.getElementById('staffEmail').textContent = currentStaff.email || 'staff@hms.com';
    document.getElementById('userName').textContent = currentStaff.name || 'Staff User';
    
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
            document.querySelector('.staff-sidebar').classList.toggle('d-none');
            document.querySelector('.staff-sidebar').classList.toggle('d-block');
        });
    }
    
    // Schedule form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitSchedule();
        });
    }
    
    // Message form submission
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateReport();
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
            overview: 'Staff Dashboard',
            schedule: 'My Schedule',
            tasks: 'Tasks',
            patients: 'Patient Management',
            admissions: 'Admissions',
            inventory: 'Inventory',
            appointments: 'Appointments',
            departments: 'Departments',
            staff: 'Staff Directory',
            messages: 'Messages',
            reports: 'Reports',
            profile: 'My Profile'
        };
        pageTitle.textContent = titles[section] || 'Staff Dashboard';
    }
    
    // Load section-specific data
    switch(section) {
        case 'overview':
            loadOverview();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'admissions':
            loadAdmissions();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'reports':
            loadReports();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

async function loadDashboardData() {
    try {
        // Try to load from API first
        if (window.apiService && currentStaff.token && !currentStaff.token.startsWith('demo')) {
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
        // Load dashboard stats
        const stats = await apiService.get('/staff/dashboard/stats');
        if (stats) {
            demoData.stats = {
                totalPatients: stats.totalPatients || 127,
                currentAdmissions: stats.currentAdmissions || 15,
                todayAppointments: stats.todaysAppointments || 24,
                lowStockItems: stats.lowStockCount || 7,
                unreadMessages: 3,
                pendingTasks: demoData.tasks.filter(t => t.status === 'pending').length
            };
        }
        
        // Load tasks
        const tasks = await apiService.get('/staff/tasks');
        if (tasks) {
            demoData.tasks = tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.due_date
            }));
        }
        
        // Load admissions
        const admissions = await apiService.get('/staff/admissions');
        if (admissions) {
            demoData.admissions = admissions.map(adm => ({
                id: adm.id,
                patientName: `${adm.patient_first_name} ${adm.patient_last_name}`,
                admissionDate: adm.admission_date,
                room: adm.room_number,
                bed: adm.bed_number,
                diagnosis: adm.diagnosis,
                doctor: `${adm.doctor_first_name} ${adm.doctor_last_name}`,
                status: adm.status
            }));
        }
        
        // Load inventory
        const inventory = await apiService.get('/staff/inventory');
        if (inventory) {
            demoData.inventory = inventory.map(item => ({
                id: item.id,
                name: item.item_name,
                type: item.item_type,
                category: item.category,
                quantity: item.quantity,
                reorderLevel: item.reorder_level,
                location: item.location,
                lastUpdated: item.last_restocked
            }));
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
    updateDashboardStats();
    
    // Load overview
    loadOverview();
}

function updateDashboardStats() {
    const stats = demoData.stats;
    
    // Update stat cards
    document.getElementById('totalPatients').textContent = stats.totalPatients;
    document.getElementById('currentAdmissions').textContent = stats.currentAdmissions;
    document.getElementById('todayAppointments').textContent = stats.todayAppointments;
    document.getElementById('lowStockItems').textContent = stats.lowStockItems;
    
    // Update badges
    document.getElementById('taskCount').textContent = stats.pendingTasks;
    document.getElementById('admissionCount').textContent = stats.currentAdmissions;
    document.getElementById('lowStockCount').textContent = stats.lowStockItems;
    document.getElementById('unreadCount').textContent = stats.unreadMessages;
    document.getElementById('unreadCountBadge').textContent = stats.unreadMessages;
}

function loadOverview() {
    // Load recent tasks
    const recentTasks = document.getElementById('recentTasks');
    if (recentTasks) {
        const tasks = demoData.tasks.slice(0, 5);
        
        if (tasks.length > 0) {
            let html = '<div class="list-group list-group-flush">';
            tasks.forEach(task => {
                const priorityClass = `task-priority-${task.priority}`;
                const statusClass = task.status === 'completed' ? 'text-success' : 
                                  task.status === 'in-progress' ? 'text-primary' : 'text-warning';
                
                html += `
                <div class="list-group-item ${priorityClass}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${task.title}</h6>
                            <small class="text-muted">${task.description}</small>
                        </div>
                        <div class="text-end">
                            <small class="${statusClass}">${task.status}</small><br>
                            <small class="text-muted">${task.dueDate}</small>
                        </div>
                    </div>
                </div>`;
            });
            html += '</div>';
            recentTasks.innerHTML = html;
        } else {
            recentTasks.innerHTML = '<p class="text-center text-muted py-3">No tasks found</p>';
        }
    }
    
    // Load recent admissions
    const recentAdmissions = document.getElementById('recentAdmissions');
    if (recentAdmissions) {
        const admissions = demoData.admissions.slice(0, 5);
        
        if (admissions.length > 0) {
            let html = '<div class="list-group list-group-flush">';
            admissions.forEach(adm => {
                const statusClass = adm.status === 'admitted' ? 'admission-status-admitted' : 'admission-status-discharged';
                
                html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${adm.patientName}</h6>
                            <small class="text-muted">${adm.diagnosis}</small>
                        </div>
                        <div class="text-end">
                            <span class="${statusClass}">${adm.status}</span><br>
                            <small class="text-muted">${adm.room}/${adm.bed}</small>
                        </div>
                    </div>
                </div>`;
            });
            html += '</div>';
            recentAdmissions.innerHTML = html;
        } else {
            recentAdmissions.innerHTML = '<p class="text-center text-muted py-3">No admissions found</p>';
        }
    }
    
    // Load low stock alerts
    const lowStockAlerts = document.getElementById('lowStockAlerts');
    if (lowStockAlerts) {
        const lowStock = demoData.inventory.filter(item => item.quantity <= item.reorderLevel).slice(0, 5);
        
        if (lowStock.length > 0) {
            let html = '<div class="list-group list-group-flush">';
            lowStock.forEach(item => {
                const isCritical = item.quantity < (item.reorderLevel * 0.5);
                const rowClass = isCritical ? 'inventory-critical' : 'inventory-low';
                
                html += `
                <div class="list-group-item ${rowClass}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">${item.location}</small>
                        </div>
                        <div class="text-end">
                            <strong>${item.quantity} ${item.category ? item.category : 'units'}</strong><br>
                            <small>Reorder: ${item.reorderLevel}</small>
                        </div>
                    </div>
                </div>`;
            });
            html += '</div>';
            lowStockAlerts.innerHTML = html;
        } else {
            lowStockAlerts.innerHTML = '<p class="text-center text-success py-3">All stock levels are good</p>';
        }
    }
    
    // Load today's schedule
    const todaySchedule = document.getElementById('todaySchedule');
    if (todaySchedule) {
        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = demoData.schedule.filter(s => s.date === today);
        
        if (todaySchedules.length > 0) {
            let html = '<div class="list-group list-group-flush">';
            todaySchedules.forEach(schedule => {
                html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${schedule.shiftType.charAt(0).toUpperCase() + schedule.shiftType.slice(1)} Shift</h6>
                            <small class="text-muted">${schedule.department}</small>
                        </div>
                        <div class="text-end">
                            <strong>${schedule.startTime} - ${schedule.endTime}</strong><br>
                            <small>${schedule.notes}</small>
                        </div>
                    </div>
                </div>`;
            });
            html += '</div>';
            todaySchedule.innerHTML = html;
        } else {
            todaySchedule.innerHTML = '<p class="text-center text-muted py-3">No schedule for today</p>';
        }
    }
}

function loadSchedule() {
    // Initialize calendar
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: demoData.schedule.map(schedule => ({
                title: `${schedule.shiftType} Shift - ${schedule.department}`,
                start: `${schedule.date}T${schedule.startTime}`,
                end: `${schedule.date}T${schedule.endTime}`,
                className: `fc-event-${schedule.shiftType}`,
                extendedProps: {
                    notes: schedule.notes
                }
            })),
            eventClick: function(info) {
                showScheduleDetails(info.event);
            }
        });
        calendar.render();
    }
    
    // Set default date for schedule form
    const scheduleDate = document.getElementById('scheduleDate');
    if (scheduleDate) {
        scheduleDate.value = new Date().toISOString().split('T')[0];
    }
}

function loadTasks() {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;
    
    // Apply filter if exists
    const filter = document.getElementById('taskFilter') ? document.getElementById('taskFilter').value : 'all';
    let tasks = demoData.tasks;
    
    if (filter !== 'all') {
        tasks = tasks.filter(task => task.status === filter);
    }
    
    let html = '';
    tasks.forEach(task => {
        const priorityClass = task.priority === 'high' || task.priority === 'urgent' ? 'text-danger' :
                            task.priority === 'medium' ? 'text-warning' : 'text-success';
        const statusClass = task.status === 'completed' ? 'text-success' : 
                          task.status === 'in-progress' ? 'text-primary' : 'text-warning';
        const priorityIcon = task.priority === 'urgent' ? 'fas fa-exclamation-circle' :
                           task.priority === 'high' ? 'fas fa-exclamation-triangle' :
                           task.priority === 'medium' ? 'fas fa-info-circle' : 'fas fa-flag';
        
        html += `
        <tr>
            <td><i class="${priorityIcon} ${priorityClass}"></i> ${task.priority}</td>
            <td>${task.title}</td>
            <td>${task.description || 'No description'}</td>
            <td>${task.dueDate}</td>
            <td><span class="${statusClass}">${task.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewTask(${task.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${task.status !== 'completed' ? `
                <button class="btn btn-sm btn-outline-success" onclick="completeTask(${task.id})">
                    <i class="fas fa-check"></i>
                </button>` : ''}
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">No tasks found</td></tr>';
}

function loadPatients() {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;
    
    // This would typically come from an API
    const patients = [
        { id: 1, name: 'Jane Doe', contact: 'jane@email.com', age: 45, bloodGroup: 'O+', lastVisit: '2024-03-10', status: 'active' },
        { id: 2, name: 'John Smith', contact: 'john@email.com', age: 52, bloodGroup: 'A-', lastVisit: '2024-03-12', status: 'active' },
        { id: 3, name: 'Alice Johnson', contact: 'alice@email.com', age: 38, bloodGroup: 'B+', lastVisit: '2024-03-05', status: 'inactive' }
    ];
    
    let html = '';
    patients.forEach(patient => {
        const statusBadge = patient.status === 'active' ? 'badge-success' : 'badge-secondary';
        
        html += `
        <tr>
            <td>PAT-${patient.id.toString().padStart(5, '0')}</td>
            <td>${patient.name}</td>
            <td>${patient.contact}</td>
            <td>${patient.age}</td>
            <td><span class="badge bg-light text-dark">${patient.bloodGroup}</span></td>
            <td>${patient.lastVisit}</td>
            <td><span class="badge ${statusBadge}">${patient.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="admitPatientModal(${patient.id})">
                    <i class="fas fa-hospital-user"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="8" class="text-center">No patients found</td></tr>';
}

function loadAdmissions() {
    const tbody = document.getElementById('admissionsTableBody');
    if (!tbody) return;
    
    let html = '';
    demoData.admissions.forEach(adm => {
        const statusClass = adm.status === 'admitted' ? 'admission-status-admitted' : 'admission-status-discharged';
        
        html += `
        <tr>
            <td>ADM-${adm.id.toString().padStart(5, '0')}</td>
            <td>${adm.patientName}</td>
            <td>${adm.admissionDate}</td>
            <td>${adm.room}/${adm.bed}</td>
            <td>${adm.diagnosis.substring(0, 50)}...</td>
            <td>${adm.doctor}</td>
            <td><span class="${statusClass}">${adm.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewAdmission(${adm.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${adm.status === 'admitted' ? `
                <button class="btn btn-sm btn-outline-success" onclick="dischargePatientModal(${adm.id})">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="transferPatient(${adm.id})">
                    <i class="fas fa-exchange-alt"></i>
                </button>` : ''}
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="8" class="text-center">No admissions found</td></tr>';
    
    // Load room occupancy
    loadRoomOccupancy();
    
    // Load admission chart
    loadAdmissionChart();
}

function loadInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    
    // Apply filter if exists
    const filter = document.getElementById('inventoryFilter') ? document.getElementById('inventoryFilter').value : 'all';
    let inventory = demoData.inventory;
    
    if (filter === 'low') {
        inventory = inventory.filter(item => item.quantity <= item.reorderLevel);
    } else if (filter !== 'all') {
        inventory = inventory.filter(item => item.type === filter);
    }
    
    let html = '';
    inventory.forEach(item => {
        const isLowStock = item.quantity <= item.reorderLevel;
        const rowClass = isLowStock ? (item.quantity < (item.reorderLevel * 0.5) ? 'inventory-critical' : 'inventory-low') : '';
        
        html += `
        <tr class="${rowClass}">
            <td>${item.name}</td>
            <td><span class="badge bg-light text-dark">${item.type}</span></td>
            <td>${item.category || 'N/A'}</td>
            <td><strong>${item.quantity}</strong> ${item.category ? item.category.toLowerCase() : 'units'}</td>
            <td>${item.reorderLevel}</td>
            <td>${item.location}</td>
            <td>${item.lastUpdated || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewInventoryItem(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="adjustStockModal(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteInventoryItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="8" class="text-center">No inventory items found</td></tr>';
    
    // Load inventory chart
    loadInventoryChart();
    
    // Load recent transactions
    loadRecentTransactions();
}

function loadAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;
    
    let html = '';
    demoData.appointments.forEach(apt => {
        const statusBadge = apt.status === 'confirmed' ? 'badge-success' : 
                          apt.status === 'pending' ? 'badge-warning' : 'badge-secondary';
        
        html += `
        <tr>
            <td>${apt.time}</td>
            <td>${apt.patient}</td>
            <td>${apt.doctor}</td>
            <td>${apt.department}</td>
            <td>${apt.reason}</td>
            <td><span class="badge ${statusBadge}">${apt.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="7" class="text-center">No appointments found</td></tr>';
    
    // Set today's date as default filter
    const dateFilter = document.getElementById('appointmentDateFilter');
    if (dateFilter) {
        dateFilter.value = new Date().toISOString().split('T')[0];
    }
}

function loadDepartments() {
    const container = document.getElementById('departmentsGrid');
    if (!container) return;
    
    let html = '';
    demoData.departments.forEach(dept => {
        html += `
        <div class="col-md-6 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h5>${dept.name}</h5>
                    <p class="text-muted">${dept.description}</p>
                    <div class="d-flex justify-content-between mt-3">
                        <span><i class="fas fa-user-md text-primary"></i> ${dept.doctors} Doctors</span>
                        <span><i class="fas fa-user-nurse text-info"></i> ${dept.nurses} Nurses</span>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary me-2">
                        <i class="fas fa-users"></i> View Staff
                    </button>
                    <button class="btn btn-sm btn-outline-warning">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    
    // Load department chart
    loadDepartmentChart();
}

function loadStaff() {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;
    
    // Apply filter if exists
    const filter = document.getElementById('staffFilter') ? document.getElementById('staffFilter').value : 'all';
    let staff = demoData.staff;
    
    if (filter !== 'all') {
        staff = staff.filter(s => s.role === filter);
    }
    
    // Apply search if exists
    const search = document.getElementById('staffSearch') ? document.getElementById('staffSearch').value.toLowerCase() : '';
    if (search) {
        staff = staff.filter(s => 
            s.name.toLowerCase().includes(search) || 
            s.department.toLowerCase().includes(search) ||
            s.contact.toLowerCase().includes(search)
        );
    }
    
    let html = '';
    staff.forEach(person => {
        const roleBadge = person.role === 'doctor' ? 'badge-primary' :
                        person.role === 'nurse' ? 'badge-info' :
                        person.role === 'staff' ? 'badge-secondary' : 'badge-danger';
        
        html += `
        <tr>
            <td>${person.role.charAt(0).toUpperCase()}-${person.id.toString().padStart(5, '0')}</td>
            <td>${person.name}</td>
            <td><span class="badge ${roleBadge}">${person.role}</span></td>
            <td>${person.department}</td>
            <td>${person.contact}</td>
            <td><span class="badge badge-success">${person.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="sendMessageToStaff(${person.id})">
                    <i class="fas fa-envelope"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="7" class="text-center">No staff found</td></tr>';
}

function loadMessages() {
    // This would typically load from API
    // For demo, we'll use static data
    
    // Update unread count
    document.getElementById('unreadCountBadge').textContent = demoData.stats.unreadMessages;
}

function loadReports() {
    // Load charts for reports section
    loadAnalyticsChart();
    loadMonthlyAdmissionsChart();
    loadDemographicsChart();
    
    // Set default dates for report form
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDate = document.getElementById('reportStartDate');
    const endDate = document.getElementById('reportEndDate');
    
    if (startDate) startDate.value = firstDay.toISOString().split('T')[0];
    if (endDate) endDate.value = lastDay.toISOString().split('T')[0];
}

function loadProfile() {
    // This would typically load from API
    // For demo, we'll use static data from currentStaff
}

// Chart Functions
function loadAdmissionChart() {
    const ctx = document.getElementById('admissionChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Admitted', 'Discharged', 'Transferred'],
            datasets: [{
                data: [12, 8, 2],
                backgroundColor: [
                    '#4a6fa5',
                    '#6b8cbc',
                    '#8da9d4'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Medication', 'Equipment', 'Supplies', 'Other'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [
                    '#4a6fa5',
                    '#6b8cbc',
                    '#8da9d4',
                    '#afc5eb'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadDepartmentChart() {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: demoData.departments.map(d => d.name),
            datasets: [{
                label: 'Doctors',
                data: demoData.departments.map(d => d.doctors),
                backgroundColor: '#4a6fa5'
            }, {
                label: 'Nurses',
                data: demoData.departments.map(d => d.nurses),
                backgroundColor: '#6b8cbc'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function loadAnalyticsChart() {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Admissions',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: '#4a6fa5',
                tension: 0.1
            }, {
                label: 'Appointments',
                data: [28, 48, 40, 19, 86, 27],
                borderColor: '#6b8cbc',
                tension: 0.1
            }]
        },
        options: {
            responsive: true
        }
    });
}

function loadMonthlyAdmissionsChart() {
    const ctx = document.getElementById('monthlyAdmissionsChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Admissions',
                data: [12, 19, 15, 8],
                backgroundColor: '#4a6fa5'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function loadDemographicsChart() {
    const ctx = document.getElementById('demographicsChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
            datasets: [{
                data: [15, 25, 30, 20, 10],
                backgroundColor: [
                    '#4a6fa5',
                    '#6b8cbc',
                    '#8da9d4',
                    '#afc5eb',
                    '#d1dcf2'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

function loadRoomOccupancy() {
    const container = document.getElementById('roomOccupancy');
    if (!container) return;
    
    const occupancy = [
        { room: '301', beds: ['A', 'B', 'C'], occupied: ['A'] },
        { room: '302', beds: ['A', 'B', 'C'], occupied: ['A', 'B'] },
        { room: '303', beds: ['A', 'B'], occupied: ['A'] },
        { room: '304', beds: ['A', 'B', 'C', 'D'], occupied: [] }
    ];
    
    let html = '';
    occupancy.forEach(room => {
        html += `
        <div class="mb-3">
            <h6>Room ${room.room}</h6>
            <div class="d-flex flex-wrap gap-2">
                ${room.beds.map(bed => `
                <span class="badge ${room.occupied.includes(bed) ? 'bg-danger' : 'bg-success'} p-2">
                    Bed ${bed}
                </span>
                `).join('')}
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

function loadRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const transactions = [
        { id: 1, item: 'Surgical Masks', type: 'add', quantity: 500, staff: 'Emily Johnson', date: '2024-03-14' },
        { id: 2, item: 'Paracetamol', type: 'remove', quantity: 100, staff: 'John Smith', date: '2024-03-13' },
        { id: 3, item: 'IV Drip Sets', type: 'add', quantity: 50, staff: 'Robert Wilson', date: '2024-03-12' }
    ];
    
    let html = '<div class="list-group list-group-flush">';
    transactions.forEach(txn => {
        const typeClass = txn.type === 'add' ? 'text-success' : 'text-danger';
        const typeIcon = txn.type === 'add' ? 'fa-plus' : 'fa-minus';
        
        html += `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${txn.item}</h6>
                    <small class="text-muted">${txn.staff}</small>
                </div>
                <div class="text-end">
                    <span class="${typeClass}"><i class="fas ${typeIcon}"></i> ${txn.quantity}</span><br>
                    <small class="text-muted">${txn.date}</small>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Modal Functions
function quickAction(action) {
    switch(action) {
        case 'admit':
            admitPatient();
            break;
        case 'schedule':
            addSchedule();
            break;
        case 'inventory':
            addInventoryItem();
            break;
        case 'message':
            loadSection('messages');
            break;
        case 'report':
            loadSection('reports');
            break;
        case 'task':
            addTask();
            break;
    }
}

function admitPatient() {
    const modal = new bootstrap.Modal(document.getElementById('admitPatientModal'));
    modal.show();
}

function submitAdmission() {
    const patient = document.getElementById('patientSelect').value;
    const admissionType = document.getElementById('admissionType').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const bedNumber = document.getElementById('bedNumber').value;
    const attendingDoctor = document.getElementById('attendingDoctor').value;
    const admissionDateTime = document.getElementById('admissionDateTime').value;
    const diagnosis = document.getElementById('diagnosis').value;
    
    if (!patient || !roomNumber || !bedNumber || !attendingDoctor || !admissionDateTime || !diagnosis) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new admission
    const newAdmission = {
        id: demoData.admissions.length + 1,
        patientName: 'New Patient',
        admissionDate: admissionDateTime.split('T')[0],
        room: roomNumber,
        bed: bedNumber,
        diagnosis: diagnosis,
        doctor: 'Dr. Selected',
        status: 'admitted'
    };
    
    demoData.admissions.push(newAdmission);
    
    // Update stats
    demoData.stats.currentAdmissions++;
    updateDashboardStats();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('admitPatientModal')).hide();
    
    // Show success message
    alert('Patient admitted successfully!');
    
    // Refresh admissions
    loadAdmissions();
}

function addInventoryItem() {
    const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    modal.show();
}

function submitInventoryItem() {
    const itemName = document.getElementById('itemName').value;
    const itemType = document.getElementById('itemType').value;
    const itemCategory = document.getElementById('itemCategory').value;
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value);
    const itemUnit = document.getElementById('itemUnit').value;
    const reorderLevel = parseInt(document.getElementById('reorderLevel').value);
    const supplier = document.getElementById('supplier').value;
    const location = document.getElementById('itemLocation').value;
    const notes = document.getElementById('itemNotes').value;
    
    if (!itemName || !itemType || !itemQuantity || !reorderLevel) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new inventory item
    const newItem = {
        id: demoData.inventory.length + 1,
        name: itemName,
        type: itemType,
        category: itemCategory,
        quantity: itemQuantity,
        reorderLevel: reorderLevel,
        location: location,
        lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    demoData.inventory.push(newItem);
    
    // Update low stock count if needed
    if (itemQuantity <= reorderLevel) {
        demoData.stats.lowStockItems++;
        updateDashboardStats();
    }
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('inventoryModal')).hide();
    
    // Show success message
    alert('Inventory item added successfully!');
    
    // Refresh inventory
    loadInventory();
}

function adjustStockModal(itemId) {
    const item = demoData.inventory.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById('adjustItemName').value = item.name;
    document.getElementById('currentStock').value = item.quantity;
    
    const modal = new bootstrap.Modal(document.getElementById('adjustStockModal'));
    modal.show();
    
    // Store item ID for later use
    document.getElementById('adjustStockModal').dataset.itemId = itemId;
}

function submitStockAdjustment() {
    const itemId = parseInt(document.getElementById('adjustStockModal').dataset.itemId);
    const action = document.getElementById('adjustAction').value;
    const quantity = parseInt(document.getElementById('adjustQuantity').value);
    const notes = document.getElementById('adjustNotes').value;
    
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const itemIndex = demoData.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
        alert('Item not found');
        return;
    }
    
    const item = demoData.inventory[itemIndex];
    
    if (action === 'remove' && quantity > item.quantity) {
        alert('Cannot remove more stock than available');
        return;
    }
    
    // Update quantity
    item.quantity = action === 'add' ? item.quantity + quantity : item.quantity - quantity;
    item.lastUpdated = new Date().toISOString().split('T')[0];
    
    // Update low stock count if needed
    const wasLowStock = item.quantity <= item.reorderLevel;
    const isNowLowStock = item.quantity <= item.reorderLevel;
    
    if (!wasLowStock && isNowLowStock) {
        demoData.stats.lowStockItems++;
    } else if (wasLowStock && !isNowLowStock) {
        demoData.stats.lowStockItems--;
    }
    
    updateDashboardStats();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('adjustStockModal')).hide();
    
    // Show success message
    alert(`Stock ${action === 'add' ? 'added' : 'removed'} successfully!`);
    
    // Refresh inventory
    loadInventory();
}

function dischargePatientModal(admissionId) {
    const admission = demoData.admissions.find(a => a.id === admissionId);
    if (!admission) return;
    
    document.getElementById('dischargePatient').value = admission.patientName;
    
    // Set default discharge date/time to now
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16);
    document.getElementById('dischargeDateTime').value = formattedDateTime;
    
    const modal = new bootstrap.Modal(document.getElementById('dischargeModal'));
    modal.show();
    
    // Store admission ID for later use
    document.getElementById('dischargeModal').dataset.admissionId = admissionId;
}

function submitDischarge() {
    const admissionId = parseInt(document.getElementById('dischargeModal').dataset.admissionId);
    const dischargeSummary = document.getElementById('dischargeSummary').value;
    
    if (!dischargeSummary) {
        alert('Please provide a discharge summary');
        return;
    }
    
    const admissionIndex = demoData.admissions.findIndex(a => a.id === admissionId);
    if (admissionIndex === -1) {
        alert('Admission not found');
        return;
    }
    
    // Update admission status
    demoData.admissions[admissionIndex].status = 'discharged';
    
    // Update stats
    demoData.stats.currentAdmissions--;
    updateDashboardStats();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('dischargeModal')).hide();
    
    // Show success message
    alert('Patient discharged successfully!');
    
    // Refresh admissions
    loadAdmissions();
}

function addTask() {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function submitTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!title || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new task
    const newTask = {
        id: demoData.tasks.length + 1,
        title: title,
        description: description,
        priority: priority,
        status: 'pending',
        dueDate: dueDate
    };
    
    demoData.tasks.push(newTask);
    
    // Update stats
    demoData.stats.pendingTasks++;
    updateDashboardStats();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
    
    // Show success message
    alert('Task added successfully!');
    
    // Refresh tasks
    loadTasks();
}

function completeTask(taskId) {
    if (confirm('Mark this task as completed?')) {
        const taskIndex = demoData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            demoData.tasks[taskIndex].status = 'completed';
            
            // Update stats
            demoData.stats.pendingTasks--;
            updateDashboardStats();
            
            alert('Task marked as completed');
            loadTasks();
        }
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = demoData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const wasPending = demoData.tasks[taskIndex].status === 'pending';
            demoData.tasks.splice(taskIndex, 1);
            
            // Update stats if task was pending
            if (wasPending) {
                demoData.stats.pendingTasks--;
                updateDashboardStats();
            }
            
            alert('Task deleted successfully');
            loadTasks();
        }
    }
}

function addSchedule() {
    // Show schedule section
    loadSection('schedule');
}

function submitSchedule() {
    const date = document.getElementById('scheduleDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const shiftType = document.getElementById('shiftType').value;
    const department = document.getElementById('department').value;
    const notes = document.getElementById('scheduleNotes').value;
    
    if (!date || !startTime || !endTime || !shiftType || !department) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new schedule
    const newSchedule = {
        id: demoData.schedule.length + 1,
        date: date,
        startTime: startTime,
        endTime: endTime,
        shiftType: shiftType,
        department: department,
        notes: notes
    };
    
    demoData.schedule.push(newSchedule);
    
    // Show success message
    alert('Schedule added successfully!');
    
    // Refresh schedule
    loadSchedule();
}

function addPatient() {
    alert('Add patient functionality would open a patient registration form');
}

function scheduleAppointment() {
    alert('Schedule appointment functionality would open a booking form');
}

function addDepartment() {
    alert('Add department functionality would open a department creation form');
}

function sendMessage() {
    const to = document.getElementById('messageTo').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    const priority = document.getElementById('messagePriority').value;
    
    if (!to || !subject || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In a real system, this would send to API
    alert('Message sent successfully!');
    
    // Clear form
    document.getElementById('messageForm').reset();
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const format = document.getElementById('reportFormat').value;
    
    if (!reportType || !startDate || !endDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be after end date');
        return;
    }
    
    // In a real system, this would generate and download a report
    alert(`Generating ${reportType} report from ${startDate} to ${endDate} in ${format.toUpperCase()} format...`);
    
    // Simulate download
    setTimeout(() => {
        alert('Report generated successfully! It would download automatically in a real system.');
    }, 1500);
}

function editProfile() {
    alert('Edit profile functionality would open an edit form');
}

function showScheduleDetails(event) {
    const details = event.extendedProps;
    alert(`Schedule Details:\n\nDate: ${event.start.toLocaleDateString()}\nTime: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}\nShift: ${event.title}\nNotes: ${details.notes || 'No notes'}`);
}

function viewTask(taskId) {
    const task = demoData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    alert(`Task Details:\n\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue Date: ${task.dueDate}`);
}

function viewAdmission(admissionId) {
    const admission = demoData.admissions.find(a => a.id === admissionId);
    if (!admission) return;
    
    alert(`Admission Details:\n\nPatient: ${admission.patientName}\nAdmission Date: ${admission.admissionDate}\nRoom/Bed: ${admission.room}/${admission.bed}\nDiagnosis: ${admission.diagnosis}\nDoctor: ${admission.doctor}\nStatus: ${admission.status}`);
}

function viewInventoryItem(itemId) {
    const item = demoData.inventory.find(i => i.id === itemId);
    if (!item) return;
    
    alert(`Inventory Item Details:\n\nName: ${item.name}\nType: ${item.type}\nCategory: ${item.category}\nQuantity: ${item.quantity}\nReorder Level: ${item.reorderLevel}\nLocation: ${item.location}\nLast Updated: ${item.lastUpdated}`);
}

function deleteInventoryItem(itemId) {
    if (confirm('Are you sure you want to delete this inventory item?')) {
        const itemIndex = demoData.inventory.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
            const wasLowStock = demoData.inventory[itemIndex].quantity <= demoData.inventory[itemIndex].reorderLevel;
            demoData.inventory.splice(itemIndex, 1);
            
            // Update stats if item was low stock
            if (wasLowStock) {
                demoData.stats.lowStockItems--;
                updateDashboardStats();
            }
            
            alert('Inventory item deleted successfully');
            loadInventory();
        }
    }
}

function transferPatient(admissionId) {
    const admission = demoData.admissions.find(a => a.id === admissionId);
    if (!admission) return;
    
    const newRoom = prompt(`Transfer patient ${admission.patientName} to which room?`, admission.room);
    if (newRoom) {
        const newBed = prompt(`Which bed in room ${newRoom}?`, admission.bed);
        if (newBed) {
            admission.room = newRoom;
            admission.bed = newBed;
            alert('Patient transferred successfully');
            loadAdmissions();
        }
    }
}

function sendMessageToStaff(staffId) {
    const staff = demoData.staff.find(s => s.id === staffId);
    if (!staff) return;
    
    // Navigate to messages section and pre-fill recipient
    loadSection('messages');
    setTimeout(() => {
        const messageTo = document.getElementById('messageTo');
        if (messageTo) {
            messageTo.innerHTML = `<option value="${staffId}">${staff.name} (${staff.role})</option>` + messageTo.innerHTML;
            document.getElementById('messageSubject').focus();
        }
    }, 500);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        localStorage.removeItem('hms_token');
        window.location.href = '../auth/login.html';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});