// Common utilities and data access functions
// Data storage (using localStorage)
function getMedicines() {
    return JSON.parse(localStorage.getItem('medicines')) || [];
}

function saveMedicines(medicines) {
    localStorage.setItem('medicines', JSON.stringify(medicines));
}

function getSales() {
    return JSON.parse(localStorage.getItem('sales')) || [];
}

function saveSales(sales) {
    localStorage.setItem('sales', JSON.stringify(sales));
}

function getCustomers() {
    return JSON.parse(localStorage.getItem('customers')) || [];
}

function saveCustomers(customers) {
    localStorage.setItem('customers', JSON.stringify(customers));
}

function getSuppliers() {
    return JSON.parse(localStorage.getItem('suppliers')) || [];
}

function saveSuppliers(suppliers) {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
}

function getPharmacies() {
    return JSON.parse(localStorage.getItem('pharmacies')) || [];
}

function savePharmacies(pharmacies) {
    localStorage.setItem('pharmacies', JSON.stringify(pharmacies));
}

function getWellnessPrograms() {
    return JSON.parse(localStorage.getItem('wellnessPrograms')) || [];
}

function saveWellnessPrograms(programs) {
    localStorage.setItem('wellnessPrograms', JSON.stringify(programs));
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

