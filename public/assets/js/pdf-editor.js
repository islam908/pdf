let pdfDoc = null;
let action = null; // 'text', 'draw', or null
let addedTexts = [];
let drawings = [];
let history = [];
let historyIndex = -1;
let isDrawing = false;
let currentPath = [];
let scale = 1.5;

// متغيرات للمس
let touchStartTime = 0;
let touchMoved = false;

// إعدادات الأدوات
let currentColor = '#ff0000';
let currentFontSize = 20;
let currentFontFamily = 'Arial';
let brushSize = 2;

// عناصر DOM
const container = document.getElementById('pdf-container');
const mobileTextPanel = document.getElementById('mobileTextPanel');
const mobileTextInput = document.getElementById('mobileTextInput');
const textPreview = document.getElementById('textPreview');
const loadingElement = document.getElementById('loading');
const colorPicker = document.getElementById('colorPicker');
const fontSizeInput = document.getElementById('fontSize');
const fontFamilySelect = document.getElementById('fontFamily');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const zoomLevel = document.getElementById('zoomLevel');

// تهيئة التطبيق
async function initializeApp() {
    try {
        await renderPDF();
        setupEventListeners();
        setupMobileInterface();
        saveToHistory();
        if(loadingElement) loadingElement.style.display = 'none';
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        if(loadingElement) loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> خطأ في تحميل PDF';
    }
}

// إعداد الواجهة للهاتف
function setupMobileInterface() {
    // إخفاء/إظهار لوحة النص للهاتف حسب الأداة المختارة
    if (isMobileDevice()) {
        updateMobileTextPanel();
    }
}

// فحص إذا كان الجهاز هاتف
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// تحديث لوحة النص للهاتف
function updateMobileTextPanel() {
    if (!mobileTextPanel) return;
    
    if (action === 'text') {
        mobileTextPanel.style.display = 'block';
        updateTextPreview();
    } else {
        mobileTextPanel.style.display = 'none';
    }
}

// تحديث معاينة النص
function updateTextPreview() {
    if (!textPreview || !mobileTextInput) return;
    
    const text = mobileTextInput.value || 'اكتب النص هنا...';
    textPreview.textContent = text;
    textPreview.style.fontSize = currentFontSize + 'px';
    textPreview.style.fontFamily = currentFontFamily;
    textPreview.style.color = currentColor;
}

// رسم PDF
async function renderPDF() {
    const loadingTask = pdfjsLib.getDocument(FILE_URL);
    pdfDoc = await loadingTask.promise;
    container.innerHTML = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.dataset.pageNumber = i;
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.dataset.pageNumber = i;
        canvas.style.cursor = 'crosshair';

        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = `صفحة ${i}`;

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        pageContainer.appendChild(canvas);
        pageContainer.appendChild(pageNumber);
        container.appendChild(pageContainer);
    }

    attachCanvasEvents();
    redrawAll();
}

// ربط أحداث الكانفاس
function attachCanvasEvents() {
    document.querySelectorAll('canvas').forEach(canvas => {
        // أحداث الماوس للكمبيوتر
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleClick);

        // أحداث اللمس للجوال - محسنة
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    });
}

// معالجة النقر
function handleClick(event) {
    if (action !== 'text') return;

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / (rect.width / canvas.width);
    const y = (event.clientY - rect.top) / (rect.height / canvas.height);

    if (isMobileDevice()) {
        addTextFromMobilePanel(canvas, x, y);
    } else {
        showTextInput(canvas, event.clientX - rect.left, event.clientY - rect.top, x, y);
    }
}

// إضافة النص من لوحة الهاتف
function addTextFromMobilePanel(canvas, x, y) {
    if (!mobileTextInput || !mobileTextInput.value.trim()) {
        // إذا لم يكن هناك نص، اجعل المستخدم يكتب أولاً
        if (mobileTextInput) {
            mobileTextInput.focus();
            // إضافة تأثير بصري للتنبيه
            mobileTextInput.style.borderColor = '#ff4444';
            setTimeout(() => {
                mobileTextInput.style.borderColor = '#667eea';
            }, 1000);
        }
        return;
    }

    const ctx = canvas.getContext('2d');
    ctx.font = `${currentFontSize}px ${currentFontFamily}`;
    ctx.fillStyle = currentColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(mobileTextInput.value, x, y);

    addedTexts.push({
        page: parseInt(canvas.dataset.pageNumber),
        x: x,
        y: y,
        text: mobileTextInput.value,
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
        color: currentColor
    });

    saveToHistory();
    
    // تنظيف النص بعد الإضافة (اختياري)
    // mobileTextInput.value = '';
    // updateTextPreview();
}

// معالجة الضغط
function handleMouseDown(event) {
    if (!action || action === 'text') return;

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / (rect.width / canvas.width);
    const y = (event.clientY - rect.top) / (rect.height / canvas.height);

    if (action === 'draw') {
        startDrawing(canvas, x, y);
    }
}

// معالجة الحركة
function handleMouseMove(event) {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / (rect.width / canvas.width);
    const y = (event.clientY - rect.top) / (rect.height / canvas.height);

    if (isDrawing && action === 'draw') {
        continueDrawing(canvas, x, y);
    }
}

// معالجة الرفع
function handleMouseUp(event) {
    if (isDrawing) {
        finishDrawing();
    }
}

// أحداث اللمس المحسنة للجوال
function handleTouchStart(event) {
    event.preventDefault();
    touchStartTime = Date.now();
    touchMoved = false;
    
    const touch = event.touches[0];
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / (rect.width / canvas.width);
    const y = (touch.clientY - rect.top) / (rect.height / canvas.height);

    if (action === 'draw') {
        startDrawing(canvas, x, y);
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    touchMoved = true;
    
    if (!isDrawing || action !== 'draw') return;
    
    const touch = event.touches[0];
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / (rect.width / canvas.width);
    const y = (touch.clientY - rect.top) / (rect.height / canvas.height);

    continueDrawing(canvas, x, y);
}

function handleTouchEnd(event) {
    event.preventDefault();
    
    const touchDuration = Date.now() - touchStartTime;
    
    if (isDrawing) {
        finishDrawing();
        return;
    }
    
    // إذا كان لمسة سريعة وبدون حركة (tap)
    if (!touchMoved && touchDuration < 500) {
        const touch = event.changedTouches[0];
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / (rect.width / canvas.width);
        const y = (touch.clientY - rect.top) / (rect.height / canvas.height);

        if (action === 'text') {
            addTextFromMobilePanel(canvas, x, y);
        }
    }
}

// بدء الرسم الحر
function startDrawing(canvas, x, y) {
    isDrawing = true;
    currentPath = [{ x, y }];

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// متابعة الرسم الحر
function continueDrawing(canvas, x, y) {
    currentPath.push({ x, y });

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
}

// إنهاء الرسم الحر
function finishDrawing() {
    if (currentPath.length > 0) {
        const canvas = document.querySelector(`canvas[data-page-number="${currentPath.length > 0 ? document.querySelectorAll('canvas')[0].dataset.pageNumber : '1'}"]`);
        const pageNum = parseInt(canvas.dataset.pageNumber);
        
        drawings.push({
            page: pageNum,
            path: currentPath,
            color: currentColor,
            size: brushSize,
            type: 'draw'
        });

        saveToHistory();
    }

    isDrawing = false;
    currentPath = [];
}

// عرض مربع إدخال النص - للكمبيوتر فقط
function showTextInput(canvas, screenX, screenY, canvasX, canvasY) {
    const textInput = document.getElementById('textInput');
    if (!textInput) return;
    
    // إخفاء أي مربع نص سابق
    textInput.style.display = 'none';
    
    // تحديد موقع مربع النص
    const containerRect = container.getBoundingClientRect();
    const adjustedX = Math.min(screenX + containerRect.left, window.innerWidth - 200);
    const adjustedY = Math.max(screenY + containerRect.top - 60, 80);
    
    textInput.style.position = 'fixed';
    textInput.style.display = 'block';
    textInput.style.left = adjustedX + 'px';
    textInput.style.top = adjustedY + 'px';
    textInput.style.fontSize = currentFontSize + 'px';
    textInput.style.fontFamily = currentFontFamily;
    textInput.style.color = currentColor;
    textInput.style.zIndex = '1001';
    textInput.style.minWidth = '200px';
    textInput.style.padding = '10px';
    textInput.style.borderRadius = '8px';
    textInput.style.border = '2px solid #667eea';
    textInput.style.backgroundColor = 'white';
    textInput.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    
    textInput.value = '';
    textInput.focus();

    function saveText() {
        if (textInput.value.trim() === '') {
            textInput.style.display = 'none';
            cleanup();
            return;
        }

        const ctx = canvas.getContext('2d');
        ctx.font = `${currentFontSize}px ${currentFontFamily}`;
        ctx.fillStyle = currentColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(textInput.value, canvasX, canvasY);

        addedTexts.push({
            page: parseInt(canvas.dataset.pageNumber),
            x: canvasX,
            y: canvasY,
            text: textInput.value,
            fontSize: currentFontSize,
            fontFamily: currentFontFamily,
            color: currentColor
        });

        textInput.style.display = 'none';
        saveToHistory();
        cleanup();
    }

    function cleanup() {
        textInput.removeEventListener('keydown', keyHandler);
        textInput.removeEventListener('blur', blurHandler);
        document.removeEventListener('click', outsideClickHandler);
    }

    function keyHandler(e) {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            saveText();
        } else if (e.key === 'Escape') {
            textInput.style.display = 'none';
            cleanup();
        }
    }
    
    function blurHandler(e) {
        setTimeout(() => {
            if (document.activeElement !== textInput) {
                saveText();
            }
        }, 200);
    }
    
    function outsideClickHandler(e) {
        if (!textInput.contains(e.target)) {
            saveText();
        }
    }

    textInput.addEventListener('keydown', keyHandler);
    textInput.addEventListener('blur', blurHandler);
    
    setTimeout(() => {
        document.addEventListener('click', outsideClickHandler);
    }, 100);
}

// إعادة رسم الكانفاس
function redrawCanvas(canvas) {
    const pageNum = parseInt(canvas.dataset.pageNumber);
    const ctx = canvas.getContext('2d');
    
    // مسح الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // إعادة رسم الصفحة الأصلية
    renderPageContent(canvas, pageNum);
    
    // رسم النصوص المضافة
    addedTexts.filter(item => item.page === pageNum).forEach(item => {
        ctx.font = `${item.fontSize}px ${item.fontFamily}`;
        ctx.fillStyle = item.color;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(item.text, item.x, item.y);
    });
    
    // رسم الرسم الحر
    drawings.filter(item => item.page === pageNum).forEach(item => {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        if (item.path && item.path.length > 0) {
            ctx.moveTo(item.path[0].x, item.path[0].y);
            item.path.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.stroke();
        }
    });
}

// إعادة رسم جميع الصفحات
async function redrawAll() {
    for (let canvas of document.querySelectorAll('canvas')) {
        await redrawCanvas(canvas);
    }
}

// إعادة رسم محتوى الصفحة الأصلي
async function renderPageContent(canvas, pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
}

// إعدادات الأدوات
function setAddText() {
    action = 'text';
    updateActiveButton('btnAddText');
    updateCursor('text');
    updateMobileTextPanel();
    
    // للكمبيوتر: إخفاء مربع النص القديم
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.style.display = 'none';
}

function setDraw() {
    action = 'draw';
    updateActiveButton('btnDraw');
    updateCursor('crosshair');
    updateMobileTextPanel();
    
    // إخفاء مربع النص
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.style.display = 'none';
}

function disableEdit() {
    action = null;
    updateActiveButton();
    updateCursor('default');
    updateMobileTextPanel();
    
    // إخفاء مربع النص
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.style.display = 'none';
}

// تحديث الزر النشط
function updateActiveButton(activeId = null) {
    document.querySelectorAll('.toolbar .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (activeId) {
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

// تحديث شكل المؤشر
function updateCursor(cursor) {
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.cursor = cursor;
    });
}

// التكبير والتصغير
function zoomIn() {
    scale = Math.min(scale + 0.2, 3.0);
    updateZoom();
}

function zoomOut() {
    scale = Math.max(scale - 0.2, 0.5);
    updateZoom();
}

function updateZoom() {
    if (zoomLevel) zoomLevel.textContent = Math.round(scale * 100) + '%';
    renderPDF();
}

// مسح جميع التعديلات
function clearAll() {
    if (confirm('هل أنت متأكد من مسح جميع التعديلات؟')) {
        addedTexts = [];
        drawings = [];
        saveToHistory();
        redrawAll();
    }
}

// إدارة التاريخ (التراجع والإعادة)
function saveToHistory() {
    const state = {
        texts: JSON.parse(JSON.stringify(addedTexts)),
        drawings: JSON.parse(JSON.stringify(drawings))
    };
    
    // إزالة التاريخ بعد النقطة الحالية
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex = history.length - 1;
    
    // تحديد عدد نقاط التاريخ المحفوظة
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
    
    updateHistoryButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const state = history[historyIndex];
        addedTexts = JSON.parse(JSON.stringify(state.texts));
        drawings = JSON.parse(JSON.stringify(state.drawings));
        redrawAll();
        updateHistoryButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const state = history[historyIndex];
        addedTexts = JSON.parse(JSON.stringify(state.texts));
        drawings = JSON.parse(JSON.stringify(state.drawings));
        redrawAll();
        updateHistoryButtons();
    }
}

function updateHistoryButtons() {
    const undoBtn = document.getElementById('btnUndo');
    const redoBtn = document.getElementById('btnRedo');
    
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}

// حفظ PDF
async function savePDF() {
    try {
        const loadingBtn = document.getElementById('btnSave');
        if (!loadingBtn) return;
        
        const originalText = loadingBtn.innerHTML;
        loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        loadingBtn.disabled = true;

        const existingPdfBytes = await fetch(FILE_URL).then(res => res.arrayBuffer());
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();

        // إضافة النصوص
        for (let item of addedTexts) {
            const page = pages[item.page - 1];
            const pageHeight = page.getHeight();
            
            page.drawText(item.text, {
                x: item.x * (page.getWidth() / (document.querySelector(`canvas[data-page-number="${item.page}"]`).width)),
                y: pageHeight - (item.y * (pageHeight / document.querySelector(`canvas[data-page-number="${item.page}"]`).height)) - (item.fontSize * 0.8),
                size: item.fontSize * 0.75,
                color: PDFLib.rgb(...hexToRgb(item.color)),
                font: await getFont(pdfDoc, item.fontFamily)
            });
        }

        // إضافة الرسم الحر
        drawings.forEach(drawItem => {
            const page = pages[drawItem.page - 1];
            const canvas = document.querySelector(`canvas[data-page-number="${drawItem.page}"]`);
            const pageHeight = page.getHeight();
            const scaleX = page.getWidth() / canvas.width;
            const scaleY = pageHeight / canvas.height;

            const path = drawItem.path;
            for (let i = 1; i < path.length; i++) {
                const from = path[i - 1];
                const to = path[i];
                page.drawLine({
                    start: { 
                        x: from.x * scaleX, 
                        y: pageHeight - from.y * scaleY 
                    },
                    end: { 
                        x: to.x * scaleX, 
                        y: pageHeight - to.y * scaleY 
                    },
                    thickness: drawItem.size,
                    color: PDFLib.rgb(...hexToRgb(drawItem.color)),
                    opacity: 1
                });
            }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "edited_pdf.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // إرجاع الزر لحالته الأصلية
        setTimeout(() => {
            loadingBtn.innerHTML = originalText;
            loadingBtn.disabled = false;
        }, 1000);

    } catch (error) {
        console.error('خطأ في حفظ PDF:', error);
        alert('حدث خطأ أثناء حفظ الملف. يرجى المحاولة مرة أخرى.');
        
        const loadingBtn = document.getElementById('btnSave');
        if (loadingBtn) {
            loadingBtn.innerHTML = '<i class="fas fa-download"></i> حفظ';
            loadingBtn.disabled = false;
        }
    }
}

// دوال مساعدة
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [1, 0, 0];
}

async function getFont(pdfDoc, fontFamily) {
    // استخدام الخطوط الأساسية المدعومة
    switch (fontFamily.toLowerCase()) {
        case 'helvetica':
        case 'arial':
            return pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        case 'times':
        case 'times new roman':
            return pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman);
        case 'courier':
        case 'courier new':
            return pdfDoc.embedFont(PDFLib.StandardFonts.Courier);
        default:
            return pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار الأدوات
    const btnAddText = document.getElementById('btnAddText');
    const btnDraw = document.getElementById('btnDraw');
    const btnDisable = document.getElementById('btnDisable');
    const btnSave = document.getElementById('btnSave');
    const btnClear = document.getElementById('btnClear');

    if (btnAddText) btnAddText.addEventListener('click', setAddText);
    if (btnDraw) btnDraw.addEventListener('click', setDraw);
    if (btnDisable) btnDisable.addEventListener('click', disableEdit);
    if (btnSave) btnSave.addEventListener('click', savePDF);
    if (btnClear) btnClear.addEventListener('click', clearAll);

    // التكبير والتصغير
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);

    // التراجع والإعادة
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    if (btnUndo) btnUndo.addEventListener('click', undo);
    if (btnRedo) btnRedo.addEventListener('click', redo);

    // اختيار اللون
    if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
            updateTextPreview();
        });
    }

    // حجم الخط
    if (fontSizeInput) {
        fontSizeInput.addEventListener('change', (e) => {
            currentFontSize = parseInt(e.target.value);
            updateTextPreview();
        });
    }

    // نوع الخط
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', (e) => {
            currentFontFamily = e.target.value;
            updateTextPreview();
        });
    }

    // حجم الفرشاة
    if (brushSizeInput && brushSizeValue) {
        brushSizeInput.addEventListener('input', (e) => {
            brushSize = parseInt(e.target.value);
            brushSizeValue.textContent = brushSize;
        });
    }

    // مستمع تغيير النص في لوحة الهاتف
    if (mobileTextInput) {
        mobileTextInput.addEventListener('input', updateTextPreview);
        mobileTextInput.addEventListener('focus', () => {
            if (action !== 'text') {
                setAddText();
            }
        });
    }

    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        // تجنب التداخل مع مربع النص
        const textInput = document.getElementById('textInput');
        if ((textInput && textInput.style.display === 'block' && e.target === textInput) ||
            (mobileTextInput && e.target === mobileTextInput)) {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case 's':
                    e.preventDefault();
                    savePDF();
          break;
            }
        }

        // اختصارات الأدوات
        switch (e.key) {
            case 't':
            case 'T':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    setAddText();
                }
                break;
            case 'd':
            case 'D':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    setDraw();
                }
                break;
            case 'Escape':
                e.preventDefault();
                disableEdit();
                break;
            case '+':
            case '=':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    zoomIn();
                }
                break;
            case '-':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    zoomOut();
                }
                break;
        }
    });

    // منع التكبير بالضغط المزدوج على الهاتف
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // تحسين الأداء للأجهزة المحمولة
    if (isMobileDevice()) {
        // منع التمرير أثناء الرسم
        document.body.addEventListener('touchstart', (e) => {
            if (action === 'draw' && e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });

        document.body.addEventListener('touchend', (e) => {
            if (action === 'draw' && e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });

        document.body.addEventListener('touchmove', (e) => {
            if (action === 'draw' && e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // تحديث حالة الأزرار في البداية
    updateHistoryButtons();
}

// وظيفة لإضافة نص مخصص للهاتف
function addMobileText() {
    if (!mobileTextInput || !mobileTextInput.value.trim()) {
        alert('يرجى كتابة النص أولاً');
        if (mobileTextInput) mobileTextInput.focus();
        return;
    }
    
    // تغيير الأداة إلى النص إذا لم تكن كذلك
    if (action !== 'text') {
        setAddText();
    }
    
    // إظهار رسالة للمستخدم
    showMobileInstruction('اضغط على الموقع المرغوب لإضافة النص');
}

// عرض تعليمات للهاتف
function showMobileInstruction(message) {
    // إنشاء عنصر التعليمات
    let instructionElement = document.getElementById('mobileInstruction');
    if (!instructionElement) {
        instructionElement = document.createElement('div');
        instructionElement.id = 'mobileInstruction';
        instructionElement.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #667eea;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 1002;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 90%;
            animation: fadeInOut 3s ease-in-out;
        `;
        document.body.appendChild(instructionElement);
    }
    
    instructionElement.textContent = message;
    instructionElement.style.display = 'block';
    
    // إخفاء الرسالة بعد 3 ثوان
    setTimeout(() => {
        instructionElement.style.display = 'none';
    }, 3000);
}

// وظيفة لتحديث إعدادات النص من لوحة الهاتف
function updateMobileTextSettings() {
    // تحديث معاينة النص عند تغيير الإعدادات
    updateTextPreview();
}

// معالجة تغيير حجم النافذة
window.addEventListener('resize', () => {
    // إعادة تحديد نوع الجهاز
    updateMobileTextPanel();
    
    // إخفاء مربع النص للكمبيوتر عند التبديل للهاتف
    if (isMobileDevice()) {
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.style.display = 'none';
    }
});

// تحسين واجهة الهاتف
function optimizeMobileInterface() {
    if (!isMobileDevice()) return;

    // تحسين حجم الأزرار للمس
    const buttons = document.querySelectorAll('.toolbar .btn');
    buttons.forEach(btn => {
        btn.style.minHeight = '44px';
        btn.style.minWidth = '44px';
        btn.style.padding = '12px';
    });

    // تحسين مدخلات النماذج للهاتف
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.minHeight = '44px';
        input.style.fontSize = '16px'; // منع التكبير التلقائي في iOS
    });

    // إضافة padding إضافي للكونتينر في الهاتف
    if (container) {
        container.style.paddingBottom = '100px';
    }
}

// تشغيل التحسينات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    optimizeMobileInterface();
});

// وظيفة لحفظ إعدادات المستخدم محلياً (للجلسة الحالية فقط)
function saveUserSettings() {
    const settings = {
        color: currentColor,
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
        brushSize: brushSize,
        scale: scale
    };
    
    // حفظ في متغير جلوبال بدلاً من localStorage
    window.userSettings = settings;
}

// استعادة إعدادات المستخدم
function restoreUserSettings() {
    if (window.userSettings) {
        const settings = window.userSettings;
        
        currentColor = settings.color || '#ff0000';
        currentFontSize = settings.fontSize || 20;
        currentFontFamily = settings.fontFamily || 'Arial';
        brushSize = settings.brushSize || 2;
        scale = settings.scale || 1.5;
        
        // تحديث واجهة المستخدم
        if (colorPicker) colorPicker.value = currentColor;
        if (fontSizeInput) fontSizeInput.value = currentFontSize;
        if (fontFamilySelect) fontFamilySelect.value = currentFontFamily;
        if (brushSizeInput) {
            brushSizeInput.value = brushSize;
            if (brushSizeValue) brushSizeValue.textContent = brushSize;
        }
        if (zoomLevel) zoomLevel.textContent = Math.round(scale * 100) + '%';
        
        updateTextPreview();
    }
}

// حفظ الإعدادات عند التغيير
function setupSettingsListeners() {
    if (colorPicker) {
        colorPicker.addEventListener('change', saveUserSettings);
    }
    if (fontSizeInput) {
        fontSizeInput.addEventListener('change', saveUserSettings);
    }
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', saveUserSettings);
    }
    if (brushSizeInput) {
        brushSizeInput.addEventListener('change', saveUserSettings);
    }
}

// تطبيق التحسينات على الواجهة
function applyUIEnhancements() {
    // إضافة انيميشن للأزرار
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        
        .btn:active {
            transform: scale(0.95);
        }
        
        .toolbar .btn.active {
            box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
        }
        
        @media (max-width: 768px) {
            .page-container {
                margin-bottom: 20px;
            }
            
            canvas {
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
        }
    `;
    document.head.appendChild(style);
}

// تهيئة جميع التحسينات
function initializeEnhancements() {
    restoreUserSettings();
    setupSettingsListeners();
    applyUIEnhancements();
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().then(() => {
        initializeEnhancements();
    });
});

// تصدير الوظائف المطلوبة للاستخدام الخارجي
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setAddText,
        setDraw,
        disableEdit,
        savePDF,
        clearAll,
        zoomIn,
        zoomOut,
        undo,
        redo
    };
}