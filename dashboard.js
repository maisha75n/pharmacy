// Dashboard Management
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadRecentActivity();
    loadWellnessPrograms();
});

function loadDashboardStats() {
    const pharmacies = getPharmacies();
    const wellnessPrograms = getWellnessPrograms();
    const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
    
    // Total Pharmacies
    document.getElementById('totalMedicines').textContent = pharmacies.length;
    
    // Active Wellness Programs
    const activePrograms = wellnessPrograms.filter(p => {
        const endDate = new Date(p.endDate);
        return endDate >= new Date();
    }).length;
    document.getElementById('lowStockItems').textContent = activePrograms;
    
    // Total Uploads
    document.getElementById('todaySales').textContent = uploadHistory.length;
    
    // Total Wellness Programs
    document.getElementById('totalCustomers').textContent = wellnessPrograms.length;
}

function loadRecentActivity() {
    const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
    const tbody = document.getElementById('recentSalesBody');
    tbody.innerHTML = '';
    
    if (uploadHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No recent activity</td></tr>';
        return;
    }
    
    // Get last 5 uploads
    const recentUploads = uploadHistory.slice(-5).reverse();
    
    recentUploads.forEach(upload => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(upload.date)}</td>
            <td>${upload.type}</td>
            <td>${upload.fileName}</td>
            <td>${upload.recordsCount} records</td>
        `;
        tbody.appendChild(row);
    });
}

function loadWellnessPrograms() {
    const wellnessPrograms = getWellnessPrograms();
    const tbody = document.getElementById('expiringSoonBody');
    tbody.innerHTML = '';
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingPrograms = wellnessPrograms.filter(program => {
        const endDate = new Date(program.endDate);
        return endDate >= today && endDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 5);
    
    if (upcomingPrograms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-message">No upcoming programs</td></tr>';
        return;
    }
    
    upcomingPrograms.forEach(program => {
        const endDate = new Date(program.endDate);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${program.name}</td>
            <td>${formatDate(program.endDate)}</td>
            <td>${daysLeft} days</td>
        `;
        tbody.appendChild(row);
    });
}
