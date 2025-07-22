// متغيرات عامة
let selectedFiles = [];
let isUploading = false;

// عناصر DOM
const uploadArea = document.querySelector('.upload-area');
const fileInput = document.getElementById('file-input');
const fileList = document.querySelector('.file-list');
const mergeBtn = document.getElementById('merge-btn');
const clearBtn = document.getElementById('clear-btn');
const progressContainer = document.querySelector('.progress-container');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const alertContainer = document.querySelector('.alert-container');

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateUI();
});

// إعداد مستمعي الأحداث
function initializeEventListeners() {
    // أحداث منطقة الرفع
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // حدث اختيار الملفات
    fileInput.addEventListener('change', handleFileSelect);
    
    // أحداث الأزرار
    if (mergeBtn) mergeBtn.addEventListener('click', handleMerge);
    if (clearBtn) clearBtn.addEventListener('click', clearAllFiles);
    
    // منع السحب والإفلات على الصفحة بالكامل
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());
}

// معالجة السحب فوق منطقة الرفع
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

// معالجة مغادرة منطقة الرفع
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

// معالجة إفلات الملفات
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

// معالجة اختيار الملفات
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = ''; // إعادة تعيين قيمة المدخل
}

// إضافة ملفات إلى القائمة
function addFiles(files) {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
        showAlert('تم تجاهل بعض الملفات. يُسمح بملفات PDF فقط.', 'warning');
    }
    
    pdfFiles.forEach(file => {
        // التحقق من عدم وجود الملف مسبقاً
        const exists = selectedFiles.some(f => 
            f.name === file.name && f.size === file.size
        );
        
        if (!exists) {
            selectedFiles.push(file);
        }
    });
    
    if (pdfFiles.length > 0) {
        updateFileList();
        updateUI();
        showAlert(`تم إضافة ${pdfFiles.length} ملف PDF بنجاح.`, 'success');
    }
}

// تحديث قائمة الملفات
function updateFileList() {
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileList.appendChild(fileItem);
    });
}

// إنشاء عنصر ملف
function createFileItem(file, index) {
    const item = document.createElement('div');
    item.className = 'file-item fade-in';
    
    const fileSize = formatFileSize(file.size);
    
    item.innerHTML = `
        <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${fileSize})</span>
        </div>
        <button class="remove-file" onclick="removeFile(${index})" title="حذف الملف">
            ×
        </button>
    `;
    
    return item;
}

// حذف ملف من القائمة
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateUI();
    showAlert('تم حذف الملف.', 'warning');
}

// مسح جميع الملفات
function clearAllFiles() {
    if (selectedFiles.length === 0) return;
    
    selectedFiles = [];
    updateFileList();
    updateUI();
    showAlert('تم مسح جميع الملفات.', 'warning');
}

// تحديث واجهة المستخدم
function updateUI() {
    const hasFiles = selectedFiles.length > 0;
    
    if (mergeBtn) {
        mergeBtn.disabled = !hasFiles || isUploading;
        mergeBtn.innerHTML = isUploading ? 
            '<span class="spinner">⏳</span> جاري الدمج...' : 
            '<span>🔗</span> دمج الملفات';
    }
    
    if (clearBtn) {
        clearBtn.disabled = !hasFiles || isUploading;
    }
    
    // تحديث نص منطقة الرفع
    const uploadText = document.querySelector('.upload-text');
    if (uploadText) {
        uploadText.textContent = hasFiles ? 
            `تم اختيار ${selectedFiles.length} ملف PDF` : 
            'اسحب ملفات PDF هنا أو انقر للاختيار';
    }
}

// معالجة عملية الدمج
async function handleMerge() {
    if (selectedFiles.length === 0) {
        showAlert('الرجاء اختيار ملفات PDF للدمج.', 'error');
        return;
    }
    
    if (selectedFiles.length === 1) {
        showAlert('يجب اختيار أكثر من ملف واحد للدمج.', 'warning');
        return;
    }
    
    isUploading = true;
    updateUI();
    showProgress(0, 'بدء عملية الدمج...');
    
    try {
        // إنشاء FormData
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('pdfs[]', file);
        });
        
        // رفع الملفات مع تتبع التقدم
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الخادم: ${response.status}`);
        }
        
        const result = await response.text();
        handleMergeResult(result);
        
    } catch (error) {
        console.error('خطأ في عملية الدمج:', error);
        showAlert('حدث خطأ أثناء دمج الملفات. الرجاء المحاولة مرة أخرى.', 'error');
    } finally {
        isUploading = false;
        updateUI();
        hideProgress();
    }
}

// معالجة نتيجة الدمج
function handleMergeResult(result) {
    const alertContainer = document.querySelector('.alert-container') || 
                          document.createElement('div');
    
    if (!document.querySelector('.alert-container')) {
        alertContainer.className = 'alert-container';
        document.querySelector('.container').appendChild(alertContainer);
    }
    
    // البحث عن رابط التحميل في النتيجة
    const linkMatch = result.match(/href=['"]([^'"]+)['"]/);
    
    if (linkMatch) {
        const downloadUrl = linkMatch[1];
        showDownloadLink(downloadUrl);
        showAlert('تم دمج الملفات بنجاح! يمكنك تحميل الملف المدمج.', 'success');
    } else {
        showAlert('تم الدمج ولكن لم يتم العثور على رابط التحميل.', 'warning');
    }
}

// عرض رابط التحميل
function showDownloadLink(url) {
    const existingLink = document.querySelector('.download-link');
    if (existingLink) {
        existingLink.remove();
    }
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.className = 'download-link fade-in';
    downloadLink.innerHTML = '<span>📥</span> تحميل الملف المدمج';
    downloadLink.download = '';
    
    const container = document.querySelector('.container');
    container.appendChild(downloadLink);
    
    // تحريك التمرير إلى الرابط
    downloadLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// عرض شريط التقدم
function showProgress(percent, text) {
    if (!progressContainer) return;
    
    progressContainer.style.display = 'block';
    progressFill.style.width = percent + '%';
    if (progressText) {
        progressText.textContent = text || `${percent}%`;
    }
}

// إخفاء شريط التقدم
function hideProgress() {
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

// عرض رسالة تنبيه
function showAlert(message, type = 'info') {
    // إزالة الرسائل السابقة
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.textContent = message;
    
    const container = document.querySelector('.container');
    const firstChild = container.firstElementChild.nextElementSibling;
    container.insertBefore(alert, firstChild);
    
    // إزالة الرسالة بعد 5 ثوان
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

// تنسيق حجم الملف
function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// دالة للتحقق من دعم المتصفح
function checkBrowserSupport() {
    const features = {
        fileAPI: window.File && window.FileReader && window.FileList && window.Blob,
        dragDrop: 'draggable' in document.createElement('div'),
        formData: window.FormData
    };
    
    const unsupported = Object.keys(features).filter(key => !features[key]);
    
    if (unsupported.length > 0) {
        showAlert(
            'متصفحك لا يدعم بعض الميزات المطلوبة. الرجاء تحديث المتصفح.',
            'warning'
        );
    }
}

// التحقق من دعم المتصفح عند التحميل
document.addEventListener('DOMContentLoaded', checkBrowserSupport);

// معالجة الأخطاء العامة
window.addEventListener('error', function(e) {
    console.error('خطأ JavaScript:', e.error);
    showAlert('حدث خطأ غير متوقع. الرجاء تحديث الصفحة والمحاولة مرة أخرى.', 'error');
});

// معالجة الأخطاء في الشبكة
window.addEventListener('unhandledrejection', function(e) {
    console.error('خطأ في الشبكة:', e.reason);
    showAlert('حدث خطأ في الاتصال. الرجاء التحقق من اتصال الإنترنت.', 'error');
});