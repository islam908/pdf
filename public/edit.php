<?php
require_once '../includes/pdf-utils/PdfPageManager.php';

$message = '';
$pdfInfo = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = '../uploads/';
    
    // التأكد من وجود مجلد التحميل
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // التأكد من وجود مجلد التنزيلات
    $downloadDir = '../downloads/';
    if (!is_dir($downloadDir)) {
        mkdir($downloadDir, 0755, true);
    }

    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        
        if ($action === 'upload') {
            // رفع الملف والحصول على معلوماته
            if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] === UPLOAD_ERR_OK) {
                $fileTmp = $_FILES['pdf']['tmp_name'];
                $fileName = basename($_FILES['pdf']['name']);
                $targetPath = $uploadDir . 'temp_' . time() . '_' . $fileName;

                if (move_uploaded_file($fileTmp, $targetPath)) {
                    try {
                        $manager = new PdfPageManager();
                        $pdfInfo = $manager->getPageInfo($targetPath);
                        $pdfInfo['file_path'] = $targetPath;
                        $pdfInfo['file_name'] = $fileName;
                        
                        // حفظ معلومات الملف في جلسة
                        session_start();
                        $_SESSION['pdf_info'] = $pdfInfo;
                        
                        $message = "<div class='success'>✅ تم رفع الملف بنجاح! الملف يحتوي على {$pdfInfo['total_pages']} صفحة</div>";
                    } catch (Exception $e) {
                        $message = "<div class='error'>❌ خطأ في قراءة الملف: " . $e->getMessage() . "</div>";
                        unlink($targetPath);
                    }
                } else {
                    $message = "<div class='error'>❌ فشل في رفع الملف</div>";
                }
            } else {
                $message = "<div class='error'>❌ يرجى اختيار ملف PDF صحيح</div>";
            }
        } 
        elseif ($action === 'process') {
            // معالجة الملف
            session_start();
            if (!isset($_SESSION['pdf_info'])) {
                $message = "<div class='error'>❌ يرجى رفع ملف PDF أولاً</div>";
            } else {
                $pdfInfo = $_SESSION['pdf_info'];
                $inputFile = $pdfInfo['file_path'];
                $operation = $_POST['operation'];
                
                $outputFile = $downloadDir . 'processed_' . time() . '.pdf';
                
                try {
                    $manager = new PdfPageManager();
                    
                    if ($operation === 'delete') {
                        $pagesToDelete = [];
                        $pagesInput = trim($_POST['pages_to_delete'] ?? '');
                        if ($pagesInput !== '') {
                            $pagesToDelete = array_map('intval', array_filter(array_map('trim', explode(',', $pagesInput))));
                        }
                        
                        if (empty($pagesToDelete)) {
                            $message = "<div class='error'>❌ يرجى تحديد الصفحات المراد حذفها</div>";
                        } else {
                            $manager->deletePages($inputFile, $outputFile, $pagesToDelete);
                            $message = "<div class='success'>✅ تم حذف الصفحات بنجاح! 
                                       <a href=\"$outputFile\" download class='download-btn'>📥 تحميل الملف</a></div>";
                        }
                    }
                    elseif ($operation === 'reorder') {
                        $newOrder = [];
                        $orderInput = trim($_POST['page_order'] ?? '');
                        if ($orderInput !== '') {
                            $newOrder = array_map('intval', array_filter(array_map('trim', explode(',', $orderInput))));
                        }
                        
                        if (empty($newOrder)) {
                            $message = "<div class='error'>❌ يرجى تحديد ترتيب الصفحات</div>";
                        } else {
                            $manager->reorderPages($inputFile, $outputFile, $newOrder);
                            $message = "<div class='success'>✅ تم ترتيب الصفحات بنجاح! 
                                       <a href=\"$outputFile\" download class='download-btn'>📥 تحميل الملف</a></div>";
                        }
                    }
                    
                } catch (Exception $e) {
                    $message = "<div class='error'>❌ خطأ: " . $e->getMessage() . "</div>";
                }
            }
        }
    }
}

// استرجاع معلومات الملف من الجلسة إذا كانت متوفرة
if (!isset($pdfInfo)) {
    session_start();
    if (isset($_SESSION['pdf_info'])) {
        $pdfInfo = $_SESSION['pdf_info'];
    }
}
?>

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حذف وترتيب صفحات PDF</title>
    <link rel="stylesheet" href="assets/css/edit.css">
    <link rel="icon" type="image/png" href="assets/images/favicon.png">

</head>
<body>
    <div class="container">
        <h1>🗂️ حذف وترتيب صفحات PDF</h1>
        
        <?php echo $message; ?>
        
        <!-- نموذج رفع الملف -->
        <div class="upload-section">
            <h2>📁 رفع ملف PDF</h2>
            <form method="POST" enctype="multipart/form-data">
                <input type="hidden" name="action" value="upload">
                <div class="form-group">
                    <label>اختر ملف PDF:</label>
                    <input type="file" name="pdf" accept="application/pdf" required>
                </div>
                <button type="submit" class="btn btn-primary">رفع الملف</button>
            </form>
        </div>

        <?php if ($pdfInfo): ?>
        <!-- معلومات الملف -->
        <div class="file-info">
            <h3>📊 معلومات الملف</h3>
            <p><strong>اسم الملف:</strong> <?php echo htmlspecialchars($pdfInfo['file_name']); ?></p>
            <p><strong>عدد الصفحات:</strong> <?php echo $pdfInfo['total_pages']; ?></p>
            
            <div class="pages-preview">
                <h4>معاينة الصفحات:</h4>
                <div class="pages-grid">
                    <?php foreach ($pdfInfo['pages'] as $page): ?>
                        <div class="page-item" data-page="<?php echo $page['number']; ?>">
                            <span class="page-number">صفحة <?php echo $page['number']; ?></span>
                            <small><?php echo $page['width'].'×'.$page['height']; ?></small>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- أدوات التحرير -->
        <div class="edit-section">
            <div class="operation-tabs">
                <button class="tab-btn active" data-tab="delete">🗑️ حذف صفحات</button>
                <button class="tab-btn" data-tab="reorder">🔄 ترتيب صفحات</button>
            </div>

            <!-- حذف الصفحات -->
            <div id="delete-tab" class="tab-content active">
                <h3>🗑️ حذف صفحات</h3>
                <form method="POST">
                    <input type="hidden" name="action" value="process">
                    <input type="hidden" name="operation" value="delete">
                    
                    <div class="form-group">
                        <label>الصفحات المراد حذفها (مثال: 1,3,5):</label>
                        <input type="text" name="pages_to_delete" id="pages-to-delete" 
                               placeholder="أدخل أرقام الصفحات مفصولة بفواصل">
                        <small>مثال: 1,3,5 لحذف الصفحات 1 و 3 و 5</small>
                    </div>
                    
                    <div class="page-selector">
                        <p>أو انقر على الصفحات المراد حذفها:</p>
                        <div class="selectable-pages">
                            <?php for ($i = 1; $i <= $pdfInfo['total_pages']; $i++): ?>
                                <button type="button" class="page-selector-btn" data-page="<?php echo $i; ?>">
                                    <?php echo $i; ?>
                                </button>
                            <?php endfor; ?>
                        </div>
                        <button type="button" id="clear-delete-selection" class="btn btn-secondary">مسح التحديد</button>
                    </div>
                    
                    <button type="submit" class="btn btn-danger">🗑️ حذف الصفحات المحددة</button>
                </form>
            </div>

            <!-- ترتيب الصفحات -->
            <div id="reorder-tab" class="tab-content">
                <h3>🔄 ترتيب الصفحات</h3>
                <form method="POST">
                    <input type="hidden" name="action" value="process">
                    <input type="hidden" name="operation" value="reorder">
                    
                    <div class="form-group">
                        <label>الترتيب الجديد (مثال: 2,1,3):</label>
                        <input type="text" name="page_order" id="page-order" 
                               placeholder="أدخل ترتيب الصفحات المطلوب">
                        <small>مثال: 2,1,3 يعني الصفحة 2 أولاً، ثم الصفحة 1، ثم الصفحة 3</small>
                    </div>
                    
                    <div class="reorder-section">
                        <p>أو اسحب وأفلت لترتيب الصفحات:</p>
                        <div id="sortable-pages" class="sortable-container">
                            <?php for ($i = 1; $i <= $pdfInfo['total_pages']; $i++): ?>
                                <div class="sortable-page" data-page="<?php echo $i; ?>">
                                    <span class="drag-handle">⋮⋮</span>
                                    <span class="page-label">صفحة <?php echo $i; ?></span>
                                </div>
                            <?php endfor; ?>
                        </div>
                        <button type="button" id="reset-order" class="btn btn-secondary">إعادة الترتيب الأصلي</button>
                    </div>
                    
                    <button type="submit" class="btn btn-success">🔄 إعادة ترتيب الصفحات</button>
                </form>
            </div>
        </div>
        <?php endif; ?>
        
        <div class="help-section">
            <h3>💡 نصائح الاستخدام</h3>
            <ul>
                <li>يمكنك رفع ملفات PDF بحجم يصل إلى 10 ميجابايت</li>
                <li>لحذف صفحات متعددة، استخدم الفواصل (مثال: 1,3,5,7)</li>
                <li>لإعادة ترتيب الصفحات، أدخل الترتيب المطلوب (مثال: 3,1,2,4)</li>
                <li>يمكنك استخدام النقر أو السحب والإفلات لسهولة أكبر</li>
            </ul>
        </div>
    </div>
    
    <script src="assets/js/edit.js"></script>
</body>
</html>