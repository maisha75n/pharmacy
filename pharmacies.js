// Pharmacy Management
let pharmacies = JSON.parse(localStorage.getItem('pharmacies')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadPharmacies();
    setupForm();
});

function setupForm() {
    document.getElementById('pharmacyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addPharmacy();
    });
}

function addPharmacy() {
    const pharmacy = {
        id: Date.now(),
        name: document.getElementById('pharmacyName').value,
        address: document.getElementById('pharmacyAddress').value,
        phone: document.getElementById('pharmacyPhone').value,
        email: document.getElementById('pharmacyEmail').value,
        license: document.getElementById('pharmacyLicense').value
    };

    pharmacies.push(pharmacy);
    savePharmacies();
    loadPharmacies();
    document.getElementById('pharmacyForm').reset();
    alert('Pharmacy added successfully!');
}

function loadPharmacies() {
    pharmacies = JSON.parse(localStorage.getItem('pharmacies')) || [];
    const tbody = document.getElementById('pharmaciesBody');
    tbody.innerHTML = '';

    if (pharmacies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No pharmacies registered</td></tr>';
        return;
    }

    pharmacies.forEach(pharmacy => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pharmacy.name}</td>
            <td>${pharmacy.address}</td>
            <td>${pharmacy.phone}</td>
            <td>${pharmacy.email}</td>
            <td>${pharmacy.license}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editPharmacy(${pharmacy.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deletePharmacy(${pharmacy.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deletePharmacy(id) {
    if (confirm('Are you sure you want to delete this pharmacy?')) {
        pharmacies = pharmacies.filter(p => p.id !== id);
        savePharmacies();
        loadPharmacies();
    }
}

function editPharmacy(id) {
    const pharmacy = pharmacies.find(p => p.id === id);
    if (pharmacy) {
        document.getElementById('pharmacyName').value = pharmacy.name;
        document.getElementById('pharmacyAddress').value = pharmacy.address;
        document.getElementById('pharmacyPhone').value = pharmacy.phone;
        document.getElementById('pharmacyEmail').value = pharmacy.email;
        document.getElementById('pharmacyLicense').value = pharmacy.license;
        
        pharmacies = pharmacies.filter(p => p.id !== id);
        savePharmacies();
        loadPharmacies();
    }
}

function savePharmacies() {
    localStorage.setItem('pharmacies', JSON.stringify(pharmacies));
}

