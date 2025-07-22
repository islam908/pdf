// متغيرات عامة
let selectedFile = null;

// تحديث واجهة المستخدم عند تحديد ملف
document.getElementById('pdfInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const rotateBtn = document.getElementById('rotateBtn');
    const fileWrapper = document.querySelector('.file-input-wrapper');
    
    if (file && file.type === 'application/pdf') {
        selectedFile = file;
        rotateBtn.disabled = false;
        fileWrapper.classList.add('file-selected');
        showStatus(`تم اختيار الملف: ${file.name}`, 'success');
    } else {
        selectedFile = null;
        rotateBtn.disabled = true;
        fileWrapper.classList.remove('file-selected');
        if (file) {
            showStatus('يرجى اختيار ملف PDF صالح', 'error');
        }
    }
});

// عرض رسائل الحالة
function showStatus(message, type = '') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

// إخفاء رسائل الحالة
function hideStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.style.display = 'none';
}

// عرض مؤشر التحميل
function showLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    const rotateBtn = document.getElementById('rotateBtn');
    
    if (show) {
        spinner.style.display = 'flex';
        rotateBtn.style.display = 'none';
        hideStatus();
    } else {
        spinner.style.display = 'none';
        rotateBtn.style.display = 'block';
    }
}

// الدالة الرئيسية لتدوير PDF
async function rotatePdf() {
    if (!selectedFile) {
        showStatus("يرجى اختيار ملف PDF أولاً", 'error');
        return;
    }

    const rotation = parseInt(document.getElementById('rotationAngle').value);
    
    try {
        showLoading(true);
        
        // قراءة الملف
        const arrayBuffer = await selectedFile.arrayBuffer();
        
        // تحميل مستند PDF
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // الحصول على جميع الصفحات
        const pages = pdfDoc.getPages();
        
        if (pages.length === 0) {
            throw new Error('الملف لا يحتوي على صفحات صالحة');
        }
        
        // تدوير جميع الصفحات
        pages.forEach(page => {
            const currentRotation = page.getRotation().angle;
            const newRotation = (currentRotation + rotation) % 360;
            page.setRotation(PDFLib.degrees(newRotation));
        });

        // حفظ المستند المُعدل
        const pdfBytes = await pdfDoc.save();

        // تحميل الملف الجديد
        downloadFile(pdfBytes, generateFileName(selectedFile.name, rotation));
        
        showStatus(`تم تدوير الملف بنجاح! (${pages.length} صفحة)`, 'success');
        
    } catch (error) {
        console.error('خطأ في تدوير PDF:', error);
        showStatus(`خطأ: ${getErrorMessage(error)}`, 'error');
    } finally {
        showLoading(false);
    }
}

// إنشاء اسم الملف الجديد
function generateFileName(originalName, rotation) {
    const nameWithoutExt = originalName.replace('.pdf', '');
    const rotationText = getRotationText(rotation);
    return `${nameWithoutExt}_${rotationText}.pdf`;
}

// الحصول على نص التدوير
function getRotationText(rotation) {
    switch(rotation) {
        case 90: return 'تدوير_90';
        case 180: return 'تدوير_180';
        case 270: return 'تدوير_270';
        default: return 'مُدوَر';
    }
}

// تحميل الملف
function downloadFile(pdfBytes, fileName) {
    try {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // تنظيف الذاكرة
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
    } catch (error) {
        console.error('خطأ في تحميل الملف:', error);
        throw new Error('فشل في تحميل الملف المُدوَر');
    }
}

// ترجمة رسائل الخطأ
function getErrorMessage(error) {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('Invalid PDF')) {
        return 'الملف تالف أو ليس ملف PDF صالح';
    } else if (errorMessage.includes('encrypted')) {
        return 'الملف محمي بكلمة مرور ولا يمكن تعديله';
    } else if (errorMessage.includes('network')) {
        return 'خطأ في الاتصال، يرجى المحاولة مرة أخرى';
    } else if (errorMessage.includes('memory')) {
        return 'الملف كبير جداً، يرجى اختيار ملف أصغر';
    } else {
        return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
    }
}

// معالجة السحب والإفلات
const fileInputWrapper = document.querySelector('.file-input-wrapper');
const fileInput = document.getElementById('pdfInput');

// منع السلوك الافتراضي للسحب والإفلات
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileInputWrapper.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// إضافة تأثيرات بصرية للسحب والإفلات
['dragenter', 'dragover'].forEach(eventName => {
    fileInputWrapper.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileInputWrapper.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    fileInputWrapper.classList.add('drag-over');
}

function unhighlight() {
    fileInputWrapper.classList.remove('drag-over');
}

// معالجة إفلات الملفات
fileInputWrapper.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    }
}

// تحديث CSS للسحب والإفلات
const style = document.createElement('style');
style.textContent = `
    .drag-over .file-label {
        border-color: #667eea !important;
        background: #edf2f7 !important;
        transform: scale(1.02);
    }
`;
document.head.appendChild(style);