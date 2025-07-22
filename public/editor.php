<?php
$uploadsDir = __DIR__ . '/../uploads/';
$publicPath = '/pdf360-webapp/uploads/';

// إنشاء مجلد الرفع إذا لم يكن موجوداً
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['pdf_file'])) {
    $file = $_FILES['pdf_file'];
    
    // التحقق من نوع الملف
    $fileType = mime_content_type($file['tmp_name']);
    if ($fileType !== 'application/pdf') {
        $error = "يرجى رفع ملف PDF صحيح فقط!";
    } else {
        $targetPath = $uploadsDir . basename($file['name']);
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $filename = urlencode(basename($file['name']));
            header("Location: editor.php?file=$filename");
            exit;
        } else {
            $error = "فشل في رفع الملف!";
        }
    }
}

if (!isset($_GET['file'])) {
    ?>
    <!DOCTYPE html>
    <html lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تحميل ملف PDF</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <link rel="icon" type="image/png" href="assets/images/favicon.png">
        <link rel="stylesheet" href="assets/css/editor.css">
    </head>
    <body class="upload-page">
        <div class="upload-container">
            <h2><i class="fas fa-file-pdf"></i> PDF356</h2>
            
            <?php if (isset($error)): ?>
                <div class="error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            
            <form method="post" enctype="multipart/form-data" id="uploadForm">
                <div class="file-input-wrapper">
                    <input type="file" name="pdf_file" accept="application/pdf" required class="file-input" id="pdfFile">
                    <label for="pdfFile" class="file-input-label">
                        <i class="fas fa-upload"></i> اختر ملف PDF
                    </label>
                </div>
                <div class="file-name" id="fileName"></div>
                <button type="submit" class="upload-btn" id="uploadBtn" disabled>
                    <i class="fas fa-edit"></i> رفع وبدء التحرير
                </button>
            </form>
            
            <div class="features">
                <h3><i class="fas fa-star"></i> مميزات المحرر:</h3>
                <ul>
                    <li><i class="fas fa-font"></i> إضافة نصوص بخطوط وألوان مختلفة</li>
                    <li><i class="fas fa-paint-brush"></i> رسم حر بألوان وسماكات متنوعة</li>
                    <li><i class="fas fa-search-plus"></i> تكبير وتصغير الصفحات</li>
                    <li><i class="fas fa-undo"></i> التراجع والإعادة</li>
                    <li><i class="fas fa-download"></i> حفظ وتحميل النسخة المحررة</li>
                </ul>
            </div>
        </div>

        <script>
            document.getElementById('pdfFile').addEventListener('change', function(e) {
                const file = e.target.files[0];
                const uploadBtn = document.getElementById('uploadBtn');
                const fileName = document.getElementById('fileName');
                
                if (file) {
                    fileName.textContent = 'الملف المحدد: ' + file.name;
                    fileName.style.display = 'block';
                    uploadBtn.disabled = false;
                } else {
                    fileName.style.display = 'none';
                    uploadBtn.disabled = true;
                }
            });
        </script>
    </body>
    </html>
    <?php
    exit;
}

$filename = $_GET['file'];
$filePath = $uploadsDir . basename($filename);
$fileURL = $publicPath . basename($filename);

if (!file_exists($filePath)) {
    echo "الملف غير موجود!";
    exit;
}
?>

<!DOCTYPE html>
<html lang="ar">

<head>
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>محرر PDF المتقدم - <?= htmlspecialchars($filename) ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/editor.css">
</head>
<body>
    <div class="header">
        <h1><i class="fas fa-file-pdf"></i> محرر PDF المتقدم - <?= htmlspecialchars($filename) ?></h1>
    </div>

    <div class="toolbar">
        <!-- أدوات النصوص -->
        <div class="toolbar-group">
            <button id="btnAddText" class="btn btn-primary tooltip" data-tooltip="إضافة نص (اختصار: T)">
                <i class="fas fa-font"></i>
            </button>
            <select id="fontFamily" class="font-select">
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times">Times New Roman</option>
                <option value="Courier">Courier New</option>
            </select>
            <input type="number" id="fontSize" class="font-size-input" value="20" min="8" max="100" title="حجم الخط">
        </div>

        <!-- أدوات الرسم -->
        <div class="toolbar-group">
            <button id="btnDraw" class="btn btn-success tooltip" data-tooltip="رسم حر (اختصار: D)">
                <i class="fas fa-paint-brush"></i>
            </button>
            <div class="brush-size-container">
                <input type="range" id="brushSize" min="1" max="20" value="2" title="سماكة الفرشاة">
                <span id="brushSizeValue">2</span>
            </div>
        </div>

        <!-- الألوان -->
        <div class="toolbar-group">
            <input type="color" id="colorPicker" class="color-picker" value="#ff0000" title="اختر اللون">
        </div>

        <!-- التحكم في العرض -->
        <div class="toolbar-group zoom-controls">
            <button id="zoomOut" class="btn btn-secondary tooltip" data-tooltip="تصغير">
                <i class="fas fa-search-minus"></i>
            </button>
            <span class="zoom-level" id="zoomLevel">150%</span>
            <button id="zoomIn" class="btn btn-secondary tooltip" data-tooltip="تكبير">
                <i class="fas fa-search-plus"></i>
            </button>
        </div>

        <!-- التراجع والإعادة -->
        <div class="toolbar-group history-buttons">
            <button id="btnUndo" class="btn btn-warning tooltip" data-tooltip="تراجع (Ctrl+Z)">
                <i class="fas fa-undo"></i>
            </button>
            <button id="btnRedo" class="btn btn-warning tooltip" data-tooltip="إعادة (Ctrl+Y)">
                <i class="fas fa-redo"></i>
            </button>
        </div>

        <!-- أدوات أخرى -->
        <div class="toolbar-group">
            <button id="btnClear" class="btn btn-danger tooltip" data-tooltip="مسح جميع التعديلات">
                <i class="fas fa-trash"></i>
            </button>
            <button id="btnDisable" class="btn btn-secondary tooltip" data-tooltip="تعطيل التحرير (Esc)">
                <i class="fas fa-hand-paper"></i>
            </button>
            <button id="btnSave" class="btn btn-success tooltip" data-tooltip="حفظ PDF (Ctrl+S)">
                <i class="fas fa-download"></i> حفظ
            </button>
        </div>
    </div>

    <input type="text" id="textInput" placeholder="أدخل النص هنا..." />

    <div id="pdf-container"></div>

    <script>
        const FILE_URL = "<?= $fileURL ?>";
    </script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js"></script>
    <script src="assets/js/pdf-editor.js"></script>
</body>
</html>