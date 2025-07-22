<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use setasign\Fpdi\Fpdi;

class PdfMerger
{
    public function merge(array $files, string $outputPath)
    {
        $pdf = new Fpdi();

        $validFiles = [];

        foreach ($files as $file) {
            try {
                $pageCount = $pdf->setSourceFile($file); // محاولة قراءة الملف
                $validFiles[] = $file;
            } catch (\Exception $e) {
                // تجاهل الملف غير المدعوم
                error_log("❌ تم تجاهل الملف لعدم توافقه: $file - " . $e->getMessage());
            }
        }

        if (empty($validFiles)) {
            throw new \Exception("❌ لم يتم العثور على ملفات صالحة للدمج.");
        }

        // البدء من جديد بـ FPDI (لإعادة التهيئة)
        $pdf = new Fpdi();

        foreach ($validFiles as $file) {
            $pageCount = $pdf->setSourceFile($file);
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);

                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
            }
        }
        $outputDir = dirname($outputPath);
if (!file_exists($outputDir)) {
    mkdir($outputDir, 0777, true); // إنشاء المجلد إذا لم يكن موجودًا
}
        $pdf->Output($outputPath, 'F');
    }
}
