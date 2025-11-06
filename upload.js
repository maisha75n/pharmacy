// Upload Management
let uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadUploadHistory();
    setupForm();
    setupFileInput();
});

function setupForm() {
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleFileUpload();
    });
}

function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    const fileLabel = document.querySelector('.file-label');
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            fileLabel.querySelector('span:not(.upload-icon):not(.file-info)').textContent = e.target.files[0].name;
        }
    });
}

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadType = document.getElementById('uploadType').value;
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    if (!uploadType) {
        alert('Please select upload type');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let records = [];
            const content = e.target.result;
            
            if (file.name.endsWith('.json')) {
                records = JSON.parse(content);
            } else if (file.name.endsWith('.csv')) {
                records = parseCSV(content);
            } else {
                alert('File format not supported. Please use CSV or JSON files.');
                return;
            }
            
            // Process records based on upload type
            processUploadedData(uploadType, records);
            
            // Save upload history
            const uploadRecord = {
                id: Date.now(),
                date: new Date().toISOString(),
                fileName: file.name,
                type: uploadType,
                recordsCount: records.length,
                status: 'Success'
            };
            
            uploadHistory.push(uploadRecord);
            localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
            
            loadUploadHistory();
            document.getElementById('uploadForm').reset();
            document.querySelector('.file-label span:not(.upload-icon):not(.file-info)').textContent = 'Choose file or drag and drop';
            
            alert(`Successfully uploaded ${records.length} ${uploadType} records!`);
        } catch (error) {
            alert('Error processing file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const record = {};
            headers.forEach((header, index) => {
                record[header] = values[index] || '';
            });
            records.push(record);
        }
    }
    
    return records;
}

function processUploadedData(type, records) {
    if (type === 'pharmacies') {
        const pharmacies = getPharmacies();
        records.forEach(record => {
            const pharmacy = {
                id: Date.now() + Math.random(),
                name: record.name || record.Name || '',
                address: record.address || record.Address || '',
                phone: record.phone || record.Phone || '',
                email: record.email || record.Email || '',
                license: record.license || record.License || ''
            };
            pharmacies.push(pharmacy);
        });
        savePharmacies(pharmacies);
    } else if (type === 'wellness') {
        const wellnessPrograms = getWellnessPrograms();
        records.forEach(record => {
            const program = {
                id: Date.now() + Math.random(),
                name: record.name || record.Name || '',
                description: record.description || record.Description || '',
                startDate: record.startDate || record['Start Date'] || new Date().toISOString().split('T')[0],
                endDate: record.endDate || record['End Date'] || new Date().toISOString().split('T')[0],
                price: parseFloat(record.price || record.Price || 0)
            };
            wellnessPrograms.push(program);
        });
        saveWellnessPrograms(wellnessPrograms);
    }
}

function loadUploadHistory() {
    uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
    const tbody = document.getElementById('uploadHistoryBody');
    tbody.innerHTML = '';
    
    if (uploadHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No upload history</td></tr>';
        return;
    }
    
    uploadHistory.reverse().forEach(upload => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(upload.date)}</td>
            <td>${upload.fileName}</td>
            <td>${upload.type}</td>
            <td>${upload.recordsCount}</td>
            <td><span class="status-badge status-${upload.status.toLowerCase()}">${upload.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

