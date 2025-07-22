<?php
require_once '../includes/pdf-utils/PdfMerger.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadedFiles = $_FILES['pdfs'];
    $uploadDir = '../uploads/';
    $pdfFiles = [];

    for ($i = 0; $i < count($uploadedFiles['name']); $i++) {
        $tmpName = $uploadedFiles['tmp_name'][$i];
        $fileName = basename($uploadedFiles['name'][$i]);
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($tmpName, $targetPath)) {
            $pdfFiles[] = $targetPath;
        }
    }

    if (!empty($pdfFiles)) {
        $outputPath = '../downloads/merged_' . time() . '.pdf';
        $merger = new PdfMerger();
        $merger->merge($pdfFiles, $outputPath);
        echo "<a href='$outputPath'>📥 تحميل الملف المدمج</a>";
    } else {
        echo "⚠️ فشل في رفع الملفات.";
    }
}
?>

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دمج ملفات PDF</title>
    <link rel="stylesheet" href="assets/css/merge.css">
    <link rel="icon" type="image/png" href="assets/images/favicon.png">

</head>
<body>
    <div class="container">
        <h2>🔗 دمج ملفات PDF</h2>
        
        <!-- منطقة رفع الملفات -->
        <div class="upload-area">
            <div class="upload-icon">📁</div>
            <div class="upload-text">اسحب ملفات PDF هنا أو انقر للاختيار</div>
            <div class="upload-hint">يدعم ملفات PDF فقط • الحد الأقصى 50 ميجا لكل ملف</div>
            <input type="file" id="file-input" name="pdfs[]" multiple accept="application/pdf" style="display: none;">
        </div>
        
        <!-- قائمة الملفات المحددة -->
        <div class="file-list"></div>
        
        <!-- شريط التقدم -->
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">جاري المعالجة...</div>
        </div>
        
        <!-- أزرار التحكم -->
        <div class="controls">
            <button type="button" id="merge-btn" class="btn btn-primary" disabled>
                <span>🔗</span> دمج الملفات
            </button>
            <button type="button" id="clear-btn" class="btn btn-secondary" disabled>
                <span>🗑️</span> مسح الكل
            </button>
        </div>
        
        <!-- حاوي الرسائل -->
        <div class="alert-container"></div>
    </div>

    <script src="assets/js/merge.js"></script>
</body>
</html>