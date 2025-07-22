<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>توقيع PDF</title>
    <link rel="stylesheet" href="assets/css/sign.css">
    <link rel="icon" type="image/png" href="assets/images/favicon.png">

</head>
<body>
    <div class="container fade-in">
        <h2>📝 توقيع المستندات الإلكترونية</h2>
        
        <!-- منطقة رفع الملفات -->
        <div class="upload-section">
            <h3>📁 تحميل ملف PDF</h3>
            <div class="upload-area" id="upload-area">
                <div class="upload-icon">📄</div>
                <div class="upload-text">اضغط هنا أو اسحب ملف PDF</div>
                <div class="upload-hint">يدعم ملفات PDF فقط - الحد الأقصى 10 ميجابايت</div>
                <input type="file" id="pdf-upload" accept="application/pdf">
            </div>
            
            <div class="file-info" id="file-info">
                <div class="file-name" id="file-name"></div>
                <div class="file-details" id="file-details"></div>
            </div>
        </div>

        <!-- رسائل التنبيه -->
        <div class="alert alert-success" id="success-alert">
            ✅ تم تحميل الملف بنجاح!
        </div>
        <div class="alert alert-error" id="error-alert">
            ❌ حدث خطأ في تحميل الملف
        </div>
        <div class="alert alert-warning" id="warning-alert">
            ⚠️ يرجى تحميل ملف PDF صالح
        </div>
        <div class="alert alert-info" id="info-alert">
            ℹ️ معلومات إضافية
        </div>

        <!-- شريط التقدم -->
        <div class="progress-container" id="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="progress-text" id="progress-text">جاري المعالجة...</div>
        </div>

        <!-- منطقة التوقيع -->
        <div class="signature-section">
            <h3>✍️ ارسم توقيعك</h3>
            
            <!-- أدوات التوقيع -->
            <div class="signature-tools">
                <button class="tool-btn active" id="pen-tool" title="قلم">🖊️</button>
                <button class="tool-btn" id="eraser-tool" title="ممحاة">🧽</button>
                <button class="tool-btn" id="text-tool" title="نص">📝</button>
            </div>

            <!-- إعدادات التوقيع -->
            <div class="signature-settings">
                <div class="setting-group">
                    <span class="setting-label">سمك الخط:</span>
                    <div class="setting-control">
                        <input type="range" id="line-width" min="1" max="10" value="3">
                        <input type="number" id="line-width-num" min="1" max="10" value="3">
                    </div>
                </div>
                <div class="setting-group">
                    <span class="setting-label">لون الخط:</span>
                    <div class="setting-control">
                        <input type="color" id="line-color" value="#000000" class="color-input">
                        <span id="color-display">#000000</span>
                    </div>
                </div>
                <div class="setting-group">
                    <span class="setting-label">الشفافية:</span>
                    <div class="setting-control">
                        <input type="range" id="opacity" min="0.1" max="1" step="0.1" value="1">
                        <input type="number" id="opacity-num" min="0.1" max="1" step="0.1" value="1">
                    </div>
                </div>
            </div>

            <div class="signature-container">
                <canvas id="signature-pad" width="500" height="200"></canvas>
                
                <div class="signature-controls">
                    <button class="btn btn-secondary" id="clear-signature">
                        🗑️ مسح التوقيع
                    </button>
                    <button class="btn btn-secondary" id="undo-signature">
                        ↶ تراجع
                    </button>
                    <button class="btn btn-secondary" id="redo-signature">
                        ↷ إعادة
                    </button>
                </div>
            </div>

            <!-- معاينة التوقيع -->
            <div class="signature-preview" id="signature-preview">
                <span>لا يوجد توقيع للمعاينة</span>
            </div>
        </div>

        <!-- منطقة الإجراءات -->
        <div class="actions-section">
            <h3>⚙️ الإجراءات</h3>
            
            <div class="main-actions">
                <button class="btn btn-primary btn-large" id="apply-signature" disabled>
                    ✅ إضافة التوقيع للصفحة الأولى
                </button>
                <button class="btn btn-success btn-large" id="download-pdf" disabled>
                    ⬇️ تحميل PDF موقع
                </button>
                <button class="btn btn-secondary" id="preview-signature">
                    👁️ معاينة التوقيع
                </button>
                <button class="btn btn-secondary" id="save-signature">
                    💾 حفظ التوقيع
                </button>
                <button class="btn btn-secondary" id="load-signature">
                    📁 تحميل توقيع محفوظ
                    <input type="file" id="signature-upload" accept="image/*" style="display: none;">
                </button>
                <button class="btn btn-danger" id="reset-all">
                    🔄 إعادة تعيين الكل
                </button>
            </div>
        </div>
    </div>

    <!-- تحميل المكتبات -->
       <script src="assets/js/sign.js"></script>
        <script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js"></script>


</body>
</html>