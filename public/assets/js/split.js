document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('pdf_file');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const browseBtn = uploadArea.querySelector('.browse-btn');
    const submitBtn = document.getElementById('submitBtn');
    const splitForm = document.getElementById('splitForm');
    const fromPage = document.getElementById('from_page');
    const toPage = document.getElementById('to_page');

    // File upload handling
    browseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    // Handle file selection
    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showError('يرجى اختيار ملف PDF صالح');
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showError('حجم الملف يجب أن يكون أقل من 10MB');
                return;
            }

            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            
            uploadArea.style.display = 'none';
            fileInfo.style.display = 'block';
            submitBtn.disabled = false;
        }
    }

    // Remove file
    removeFile.addEventListener('click', function() {
        fileInput.value = '';
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        submitBtn.disabled = true;
        clearError();
    });

    // Page number validation
    fromPage.addEventListener('input', validatePageNumbers);
    toPage.addEventListener('input', validatePageNumbers);

    function validatePageNumbers() {
        const from = parseInt(fromPage.value) || 1;
        const to = parseInt(toPage.value) || 1;

        if (from < 1) {
            fromPage.value = 1;
        }

        if (to < 1) {
            toPage.value = 1;
        }

        if (from > to) {
            toPage.value = from;
        }

        // Update to_page minimum value
        toPage.min = from;
    }

    // Form submission
    splitForm.addEventListener('submit', function(e) {
        if (!fileInput.files[0]) {
            e.preventDefault();
            showError('يرجى اختيار ملف PDF أولاً');
            return;
        }

        const from = parseInt(fromPage.value);
        const to = parseInt(toPage.value);

        if (from > to) {
            e.preventDefault();
            showError('رقم الصفحة الأولى يجب أن يكون أقل من أو يساوي رقم الصفحة الأخيرة');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    });

    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showError(message) {
        clearError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const form = document.querySelector('.card form');
        form.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function clearError() {
        const existingError = document.querySelector('.message.error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Auto-focus first input
    setTimeout(() => {
        fromPage.focus();
    }, 500);

    // Handle browser back/forward
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = !fileInput.files[0];
        }
    });

    // Reset form on page load
    window.addEventListener('load', function() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = !fileInput.files[0];
    });
});