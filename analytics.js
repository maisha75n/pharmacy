// Analytics Management
document.addEventListener('DOMContentLoaded', function() {
    loadAnalytics();
    
    document.getElementById('timePeriod').addEventListener('change', function() {
        loadAnalytics();
    });
});

function generateReport() {
    loadAnalytics();
    alert('Report generated successfully!');
}

function loadAnalytics() {
    const timePeriod = document.getElementById('timePeriod').value;
    const pharmacies = getPharmacies();
    const wellnessPrograms = getWellnessPrograms();
    const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
    
    // Filter uploads by time period
    const filteredUploads = filterUploadsByPeriod(uploadHistory, timePeriod);
    
    // Total Uploads (as revenue metric)
    document.getElementById('totalRevenue').textContent = filteredUploads.length;
    
    // Top Upload Types
    loadTopUploadTypes(filteredUploads);
    
    // Pharmacy Statistics
    document.getElementById('totalCustomersAnalytics').textContent = pharmacies.length;
    const newPharmacies = filterPharmaciesByPeriod(pharmacies, timePeriod);
    document.getElementById('newCustomers').textContent = newPharmacies.length;
    
    // Wellness Programs Status
    const totalProgramValue = wellnessPrograms.reduce((sum, p) => sum + p.price, 0);
    document.getElementById('totalStockValue').textContent = '$' + totalProgramValue.toFixed(2);
    const activePrograms = wellnessPrograms.filter(p => {
        const endDate = new Date(p.endDate);
        return endDate >= new Date();
    }).length;
    document.getElementById('lowStockCount').textContent = activePrograms;
}

function filterUploadsByPeriod(uploads, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return uploads.filter(upload => {
        const uploadDate = new Date(upload.date);
        
        switch(period) {
            case 'today':
                return uploadDate >= today;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return uploadDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return uploadDate >= monthAgo;
            case 'year':
                const yearAgo = new Date(today);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                return uploadDate >= yearAgo;
            default:
                return true;
        }
    });
}

function filterPharmaciesByPeriod(pharmacies, period) {
    const now = Date.now();
    let periodStart;
    
    switch(period) {
        case 'today':
            periodStart = now - (24 * 60 * 60 * 1000);
            break;
        case 'week':
            periodStart = now - (7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            periodStart = now - (30 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            periodStart = now - (365 * 24 * 60 * 60 * 1000);
            break;
        default:
            return pharmacies;
    }
    
    return pharmacies.filter(p => p.id >= periodStart);
}

function loadTopUploadTypes(uploads) {
    const uploadTypes = {};
    
    uploads.forEach(upload => {
        if (!uploadTypes[upload.type]) {
            uploadTypes[upload.type] = {
                name: upload.type,
                count: 0,
                records: 0
            };
        }
        uploadTypes[upload.type].count += 1;
        uploadTypes[upload.type].records += upload.recordsCount || 0;
    });
    
    const topTypes = Object.values(uploadTypes)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const tbody = document.getElementById('topSellingBody');
    tbody.innerHTML = '';
    
    if (topTypes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-message">No upload data</td></tr>';
        return;
    }
    
    topTypes.forEach(type => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type.name}</td>
            <td>${type.count}</td>
            <td>${type.records} records</td>
        `;
        tbody.appendChild(row);
    });
}
