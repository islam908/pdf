  
        // متغيرات عامة
        let canvas, ctx;
        let isDrawing = false;
        let currentTool = 'pen';
        let currentPDF = null;
        let signatureHistory = [];
        let historyIndex = -1;

        // تهيئة التطبيق
        document.addEventListener('DOMContentLoaded', function() {
            initializeCanvas();
            initializeEventListeners();
            initializeSettings();
        });

        // تهيئة لوحة الرسم
        function initializeCanvas() {
            canvas = document.getElementById('signature-pad');
            ctx = canvas.getContext('2d');
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.globalAlpha = 1;
            
            // حفظ الحالة الأولية
            saveCanvasState();
        }

        // تهيئة مستمعي الأحداث
        function initializeEventListeners() {
            // رفع ملف PDF
            const pdfUpload = document.getElementById('pdf-upload');
            const uploadArea = document.getElementById('upload-area');
            
            pdfUpload.addEventListener('change', handlePDFUpload);
            
            // سحب وإفلات الملفات
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#764ba2';
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = '#667eea';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#667eea';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFile(files[0]);
                }
            });

            // أحداث الرسم
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('touchstart', handleTouch);
            canvas.addEventListener('touchmove', handleTouch);
            canvas.addEventListener('touchend', stopDrawing);

            // أزرار التحكم
            document.getElementById('clear-signature').addEventListener('click', clearSignature);
            document.getElementById('undo-signature').addEventListener('click', undoSignature);
            document.getElementById('redo-signature').addEventListener('click', redoSignature);
            document.getElementById('apply-signature').addEventListener('click', applySignature);
            document.getElementById('download-pdf').addEventListener('click', downloadPDF);
            document.getElementById('preview-signature').addEventListener('click', previewSignature);
            document.getElementById('save-signature').addEventListener('click', saveSignature);
            document.getElementById('load-signature').addEventListener('click', () => {
                document.getElementById('signature-upload').click();
            });
            document.getElementById('signature-upload').addEventListener('change', loadSignature);
            document.getElementById('reset-all').addEventListener('click', resetAll);

            // أدوات الرسم
            document.getElementById('pen-tool').addEventListener('click', () => selectTool('pen'));
            document.getElementById('eraser-tool').addEventListener('click', () => selectTool('eraser'));
            document.getElementById('text-tool').addEventListener('click', () => selectTool('text'));
        }

        // تهيئة الإعدادات
        function initializeSettings() {
            const lineWidth = document.getElementById('line-width');
            const lineWidthNum = document.getElementById('line-width-num');
            const lineColor = document.getElementById('line-color');
            const opacity = document.getElementById('opacity');
            const opacityNum = document.getElementById('opacity-num');

            // ربط المتحكمات
            lineWidth.addEventListener('input', (e) => {
                lineWidthNum.value = e.target.value;
                ctx.lineWidth = e.target.value;
            });

            lineWidthNum.addEventListener('input', (e) => {
                lineWidth.value = e.target.value;
                ctx.lineWidth = e.target.value;
            });

            lineColor.addEventListener('change', (e) => {
                ctx.strokeStyle = e.target.value;
                document.getElementById('color-display').textContent = e.target.value;
            });

            opacity.addEventListener('input', (e) => {
                opacityNum.value = e.target.value;
                ctx.globalAlpha = e.target.value;
            });

            opacityNum.addEventListener('input', (e) => {
                opacity.value = e.target.value;
                ctx.globalAlpha = e.target.value;
            });
        }

        // معالجة رفع ملف PDF
        function handlePDFUpload(event) {
            const file = event.target.files[0];
            if (file) {
                handleFile(file);
            }
        }

        // معالجة الملف
        function handleFile(file) {
            if (file.type !== 'application/pdf') {
                showAlert('warning', 'يرجى اختيار ملف PDF صالح');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showAlert('error', 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                currentPDF = e.target.result;
                displayFileInfo(file);
                showAlert('success', 'تم تحميل الملف بنجاح!');
                document.getElementById('apply-signature').disabled = false;
            };
            reader.readAsArrayBuffer(file);
        }

        // عرض معلومات الملف
        function displayFileInfo(file) {
            const fileInfo = document.getElementById('file-info');
            const fileName = document.getElementById('file-name');
            const fileDetails = document.getElementById('file-details');
            
            fileName.textContent = file.name;
            fileDetails.textContent = `الحجم: ${(file.size / 1024).toFixed(1)} كيلوبايت | النوع: ${file.type}`;
            
            fileInfo.classList.add('show');
            document.getElementById('upload-area').classList.add('has-file');
        }

        // بدء الرسم
        function startDrawing(e) {
            if (currentTool === 'text') return;
            
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        // الرسم
        function draw(e) {
            if (!isDrawing || currentTool === 'text') return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (currentTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }
            
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // إنهاء الرسم
        function stopDrawing() {
            if (isDrawing) {
                isDrawing = false;
                ctx.globalCompositeOperation = 'source-over';
                saveCanvasState();
            }
        }

        // معالجة اللمس
        function handleTouch(e) {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) return;
            
            const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                            e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            
            canvas.dispatchEvent(mouseEvent);
        }

        // اختيار أداة
        function selectTool(tool) {
            currentTool = tool;
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tool + '-tool').classList.add('active');
            
            if (tool === 'text') {
                canvas.style.cursor = 'text';
            } else if (tool === 'eraser') {
                canvas.style.cursor = 'crosshair';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        }

        // مسح التوقيع
        function clearSignature() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveCanvasState();
        }

        // حفظ حالة اللوحة
        function saveCanvasState() {
            historyIndex++;
            if (historyIndex < signatureHistory.length) {
                signatureHistory.length = historyIndex;
            }
            signatureHistory.push(canvas.toDataURL());
        }

        // تراجع
        function undoSignature() {
            if (historyIndex > 0) {
                historyIndex--;
                restoreCanvasState();
            }
        }

        // إعادة
        function redoSignature() {
            if (historyIndex < signatureHistory.length - 1) {
                historyIndex++;
                restoreCanvasState();
            }
        }

        // استعادة حالة اللوحة
        function restoreCanvasState() {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = signatureHistory[historyIndex];
        }

        // معاينة التوقيع
        function previewSignature() {
            const preview = document.getElementById('signature-preview');
            const signatureData = canvas.toDataURL();
            
            preview.innerHTML = `<img src="${signatureData}" alt="معاينة التوقيع">`;
            preview.classList.add('show');
        }

        // حفظ التوقيع
        function saveSignature() {
            const link = document.createElement('a');
            link.download = 'signature.png';
            link.href = canvas.toDataURL();
            link.click();
        }

        // تحميل توقيع
        function loadSignature(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    saveCanvasState();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        // تطبيق التوقيع
        async function applySignature() {
            if (!currentPDF) {
                showAlert('error', 'يرجى تحميل ملف PDF أولاً');
                return;
            }

            showProgress(0, 'جاري معالجة التوقيع...');
            
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(currentPDF);
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];
                
                showProgress(30, 'جاري إضافة التوقيع...');
                
                const signatureImage = canvas.toDataURL();
                const signatureBytes = dataURLtoUint8Array(signatureImage);
                const signature = await pdfDoc.embedPng(signatureBytes);
                
                showProgress(60, 'جاري دمج التوقيع...');
                
                const { width, height } = firstPage.getSize();
                firstPage.drawImage(signature, {
                    x: width - 200,
                    y: 50,
                    width: 150,
                    height: 75,
                });
                
                showProgress(90, 'جاري إنهاء المعالجة...');
                
                const pdfBytes = await pdfDoc.save();
                currentPDF = pdfBytes;
                
                showProgress(100, 'تم بنجاح!');
                hideProgress();
                
                document.getElementById('download-pdf').disabled = false;
                showAlert('success', 'تم إضافة التوقيع بنجاح!');
                
            } catch (error) {
                hideProgress();
                showAlert('error', 'حدث خطأ أثناء معالجة الملف: ' + error.message);
            }
        }

        // تحميل PDF
        function downloadPDF() {
            if (!currentPDF) {
                showAlert('error', 'لا يوجد ملف للتحميل');
                return;
            }

            const blob = new Blob([currentPDF], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'signed_document.pdf';
            link.click();
        }

        // إعادة تعيين الكل
        function resetAll() {
            if (confirm('هل أنت متأكد من إعادة تعيين كل شيء؟')) {
                clearSignature();
                currentPDF = null;
                document.getElementById('pdf-upload').value = '';
                document.getElementById('file-info').classList.remove('show');
                document.getElementById('upload-area').classList.remove('has-file');
                document.getElementById('apply-signature').disabled = true;
                document.getElementById('download-pdf').disabled = true;
                document.getElementById('signature-preview').classList.remove('show');
                hideAllAlerts();
                showAlert('info', 'تم إعادة تعيين التطبيق');
            }
        }

        // عرض تنبيه
        function showAlert(type, message) {
            hideAllAlerts();
            const alert = document.getElementById(type + '-alert');
            alert.textContent = message;
            alert.classList.add('show');
            
            setTimeout(() => {
                alert.classList.remove('show');
            }, 5000);
        }

        // إخفاء جميع التنبيهات
        function hideAllAlerts() {
            document.querySelectorAll('.alert').forEach(alert => {
                alert.classList.remove('show');
            });
        }

        // عرض شريط التقدم
        function showProgress(percent, text) {
            const container = document.getElementById('progress-container');
            const fill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            
            container.style.display = 'block';
            fill.style.width = percent + '%';
            progressText.textContent = text;
        }

        // إخفاء شريط التقدم
        function hideProgress() {
            setTimeout(() => {
                document.getElementById('progress-container').style.display = 'none';
            }, 1000);
        }

        // تحويل DataURL إلى Uint8Array
        function dataURLtoUint8Array(dataURL) {
            const arr = dataURL.split(',');
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return u8arr;
        }
