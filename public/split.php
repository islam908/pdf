<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../includes/pdf-utils/PdfSplitter.php';

$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_FILES['pdf_file']) || $_FILES['pdf_file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("خطأ في رفع الملف");
        }

        $from = intval($_POST['from_page'] ?? 1);
        $to = intval($_POST['to_page'] ?? 1);

        if ($from > $to) {
            throw new Exception("رقم الصفحة الأولى يجب أن يكون أقل من أو يساوي رقم الصفحة الأخيرة");
        }

        $tmpName = $_FILES['pdf_file']['tmp_name'];
        $splitter = new PdfSplitter($tmpName);

        $splitPdfData = $splitter->split($from, $to);

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="split_pages_' . $from . '-' . $to . '_' . time() . '.pdf"');
        header('Content-Length: ' . strlen($splitPdfData));
        echo $splitPdfData;
        exit;

    } catch (Exception $ex) {
        $message = $ex->getMessage();
        $messageType = 'error';
    }
}
?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقسيم ملف PDF</title>
    <link rel="stylesheet" href="assets/css/split.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/png" href="assets/images/favicon.png">

</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">
                <i class="fas fa-cut"></i>
            </div>
            <h1>تقسيم ملف PDF</h1>
            <p>قم بتقسيم ملف PDF واستخراج الصفحات المطلوبة</p>
        </div>

        <div class="card">
            <form id="splitForm" method="post" enctype="multipart/form-data">
                <div class="upload-area" id="uploadArea">
                    <i class="fas fa-cloud-upload-alt upload-icon"></i>
                    <h3>اختر ملف PDF أو اسحبه هنا</h3>
                    <p>الحد الأقصى لحجم الملف: 10MB</p>
                    <input type="file" id="pdf_file" name="pdf_file" accept="application/pdf" required>
                    <button type="button" class="browse-btn">تصفح الملفات</button>
                </div>

                <div class="file-info" id="fileInfo" style="display: none;">
                    <div class="file-details">
                        <i class="fas fa-file-pdf"></i>
                        <div class="file-text">
                            <div class="file-name" id="fileName"></div>
                            <div class="file-size" id="fileSize"></div>
                        </div>
                        <button type="button" class="remove-file" id="removeFile">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="form-group-row">
                    <div class="form-group">
                        <label for="from_page">
                            <i class="fas fa-play"></i>
                            من صفحة
                        </label>
                        <input type="number" id="from_page" name="from_page" min="1" value="1" required>
                    </div>

                    <div class="form-group">
                        <label for="to_page">
                            <i class="fas fa-stop"></i>
                            إلى صفحة
                        </label>
                        <input type="number" id="to_page" name="to_page" min="1" value="1" required>
                    </div>
                </div>

                <button type="submit" class="submit-btn" id="submitBtn" disabled>
                    <i class="fas fa-cut"></i>
                    <span>تقسيم الملف</span>
                    <div class="loading-spinner" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </button>
            </form>

            <?php if ($message): ?>
                <div class="message <?= $messageType ?>">
                    <i class="fas <?= $messageType === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle' ?>"></i>
                    <?= htmlspecialchars($message) ?>
                </div>
            <?php endif; ?>
        </div>

        <div class="features">
            <div class="feature">
                <i class="fas fa-shield-alt"></i>
                <h3>آمن وموثوق</h3>
                <p>جميع الملفات تتم معالجتها محلياً وبشكل آمن</p>
            </div>
            <div class="feature">
                <i class="fas fa-bolt"></i>
                <h3>سريع وفعال</h3>
                <p>معالجة سريعة للملفات مع الحفاظ على الجودة</p>
            </div>
            <div class="feature">
                <i class="fas fa-mobile-alt"></i>
                <h3>متوافق مع الأجهزة</h3>
                <p>يعمل على جميع الأجهزة والمتصفحات</p>
            </div>
        </div>
    </div>

    <script src="assets/js/split.js"></script>
</body>
</html>