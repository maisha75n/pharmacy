// Wellness Management
let wellnessPrograms = JSON.parse(localStorage.getItem('wellnessPrograms')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadWellnessPrograms();
    setupForm();
});

function setupForm() {
    document.getElementById('wellnessForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addWellnessProgram();
    });
}

function addWellnessProgram() {
    const program = {
        id: Date.now(),
        name: document.getElementById('programName').value,
        description: document.getElementById('programDescription').value,
        startDate: document.getElementById('programStartDate').value,
        endDate: document.getElementById('programEndDate').value,
        price: parseFloat(document.getElementById('programPrice').value)
    };

    wellnessPrograms.push(program);
    saveWellnessPrograms();
    loadWellnessPrograms();
    document.getElementById('wellnessForm').reset();
    alert('Wellness program added successfully!');
}

function loadWellnessPrograms() {
    wellnessPrograms = JSON.parse(localStorage.getItem('wellnessPrograms')) || [];
    const container = document.getElementById('wellnessProgramsContainer');
    container.innerHTML = '';

    if (wellnessPrograms.length === 0) {
        container.innerHTML = '<div class="empty-message">No wellness programs available</div>';
        return;
    }

    wellnessPrograms.forEach(program => {
        const programCard = document.createElement('div');
        programCard.className = 'wellness-card-item';
        programCard.innerHTML = `
            <h4>${program.name}</h4>
            <p>${program.description}</p>
            <div class="program-details">
                <span><strong>Start:</strong> ${formatDate(program.startDate)}</span>
                <span><strong>End:</strong> ${formatDate(program.endDate)}</span>
                <span><strong>Price:</strong> $${program.price.toFixed(2)}</span>
            </div>
            <div class="program-actions">
                <button class="btn-action btn-edit" onclick="editWellnessProgram(${program.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteWellnessProgram(${program.id})">Delete</button>
            </div>
        `;
        container.appendChild(programCard);
    });
}

function deleteWellnessProgram(id) {
    if (confirm('Are you sure you want to delete this wellness program?')) {
        wellnessPrograms = wellnessPrograms.filter(p => p.id !== id);
        saveWellnessPrograms();
        loadWellnessPrograms();
    }
}

function editWellnessProgram(id) {
    const program = wellnessPrograms.find(p => p.id === id);
    if (program) {
        document.getElementById('programName').value = program.name;
        document.getElementById('programDescription').value = program.description;
        document.getElementById('programStartDate').value = program.startDate;
        document.getElementById('programEndDate').value = program.endDate;
        document.getElementById('programPrice').value = program.price;
        
        wellnessPrograms = wellnessPrograms.filter(p => p.id !== id);
        saveWellnessPrograms();
        loadWellnessPrograms();
    }
}

function saveWellnessPrograms() {
    localStorage.setItem('wellnessPrograms', JSON.stringify(wellnessPrograms));
}

