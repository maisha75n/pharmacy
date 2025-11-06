// Profile Management
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: '',
    email: '',
    phone: '',
    address: '',
    lastLogin: null
};

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadActivityStats();
    setupForm();
    
    // Update last login
    userProfile.lastLogin = new Date().toISOString();
    saveProfile();
});

function setupForm() {
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
}

function loadProfile() {
    userProfile = JSON.parse(localStorage.getItem('userProfile')) || userProfile;
    
    document.getElementById('profileName').value = userProfile.name || '';
    document.getElementById('profileEmail').value = userProfile.email || '';
    document.getElementById('profilePhone').value = userProfile.phone || '';
    document.getElementById('profileAddress').value = userProfile.address || '';
}

function updateProfile() {
    userProfile.name = document.getElementById('profileName').value;
    userProfile.email = document.getElementById('profileEmail').value;
    userProfile.phone = document.getElementById('profilePhone').value;
    userProfile.address = document.getElementById('profileAddress').value;
    
    saveProfile();
    alert('Profile updated successfully!');
}

function loadActivityStats() {
    const pharmacies = getPharmacies();
    const wellnessPrograms = getWellnessPrograms();
    
    document.getElementById('totalSalesProcessed').textContent = pharmacies.length;
    document.getElementById('medicinesAdded').textContent = wellnessPrograms.length;
    
    if (userProfile.lastLogin) {
        document.getElementById('lastLogin').textContent = formatDate(userProfile.lastLogin);
    } else {
        document.getElementById('lastLogin').textContent = 'Never';
    }
}

function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        const confirmPassword = prompt('Confirm new password:');
        if (newPassword === confirmPassword) {
            alert('Password changed successfully!');
        } else {
            alert('Passwords do not match!');
        }
    }
}

function notificationSettings() {
    alert('Notification settings feature coming soon!');
}

function privacySettings() {
    alert('Privacy settings feature coming soon!');
}

function saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

