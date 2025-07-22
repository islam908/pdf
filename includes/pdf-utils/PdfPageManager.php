<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use setasign\Fpdi\Fpdi;

class PdfPageManager {
    
    /**
     * حذف وإعادة ترتيب صفحات PDF
     * 
     * @param string $inputFile مسار ملف PDF المدخل
     * @param string $outputFile مسار ملف PDF المخرج
     * @param array $pageOrder ترتيب الصفحات المطلوب (مثال: [1,3,2] أو [2,4,1])
     * @throws Exception
     */
    public function reorderPages($inputFile, $outputFile, $pageOrder) {
        if (!file_exists($inputFile)) {
            throw new Exception("الملف المحدد غير موجود: $inputFile");
        }

        try {
            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($inputFile);
            
            // التحقق من صحة أرقام الصفحات
            foreach ($pageOrder as $pageNum) {
                if ($pageNum < 1 || $pageNum > $pageCount) {
                    throw new Exception("رقم الصفحة $pageNum غير صحيح. الملف يحتوي على $pageCount صفحات فقط.");
                }
            }

            // إضافة الصفحات حسب الترتيب المحدد
            foreach ($pageOrder as $pageNum) {
                $templateId = $pdf->importPage($pageNum);
                $size = $pdf->getTemplateSize($templateId);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
            }

            $pdf->Output('F', $outputFile);
            
        } catch (Exception $e) {
            throw new Exception("خطأ في معالجة PDF: " . $e->getMessage());
        }
    }
    
    /**
     * حذف صفحات محددة من PDF
     * 
     * @param string $inputFile مسار ملف PDF المدخل
     * @param string $outputFile مسار ملف PDF المخرج
     * @param array $pagesToDelete أرقام الصفحات المراد حذفها (مثال: [2,4,6])
     * @throws Exception
     */
    public function deletePages($inputFile, $outputFile, $pagesToDelete) {
        if (!file_exists($inputFile)) {
            throw new Exception("الملف المحدد غير موجود: $inputFile");
        }

        try {
            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($inputFile);
            
            // التحقق من صحة أرقام الصفحات
            foreach ($pagesToDelete as $pageNum) {
                if ($pageNum < 1 || $pageNum > $pageCount) {
                    throw new Exception("رقم الصفحة $pageNum غير صحيح. الملف يحتوي على $pageCount صفحات فقط.");
                }
            }

            // إضافة جميع الصفحات عدا المحذوفة
            for ($pageNum = 1; $pageNum <= $pageCount; $pageNum++) {
                if (!in_array($pageNum, $pagesToDelete)) {
                    $templateId = $pdf->importPage($pageNum);
                    $size = $pdf->getTemplateSize($templateId);
                    $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                    $pdf->useTemplate($templateId);
                }
            }

            $pdf->Output('F', $outputFile);
            
        } catch (Exception $e) {
            throw new Exception("خطأ في معالجة PDF: " . $e->getMessage());
        }
    }
    
    /**
     * الحصول على معلومات الصفحات
     * 
     * @param string $inputFile مسار ملف PDF
     * @return array معلومات الصفحات
     * @throws Exception
     */
    public function getPageInfo($inputFile) {
        if (!file_exists($inputFile)) {
            throw new Exception("الملف المحدد غير موجود: $inputFile");
        }

        try {
            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($inputFile);
            
            $pages = [];
            for ($i = 1; $i <= $pageCount; $i++) {
                $templateId = $pdf->importPage($i);
                $size = $pdf->getTemplateSize($templateId);
                $pages[] = [
                    'number' => $i,
                    'width' => $size['width'],
                    'height' => $size['height'],
                    'orientation' => $size['orientation']
                ];
            }
            
            return [
                'total_pages' => $pageCount,
                'pages' => $pages
            ];
            
        } catch (Exception $e) {
            throw new Exception("خطأ في قراءة معلومات PDF: " . $e->getMessage());
        }
    }
}