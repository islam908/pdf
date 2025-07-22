<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use setasign\Fpdi\Fpdi;

class PdfEditor
{
    /**
     * يضيف نصًا فوق صفحات PDF مع خيارات متقدمة
     *
     * @param string $sourceFile ملف PDF الأصلي
     * @param string $outputFile ملف الإخراج
     * @param string $text النص المراد إضافته
     * @param array $pages الصفحات التي سيتم الكتابة عليها (مثلاً: [1,3,5])
     *                     إذا فارغة أو null يعني كل الصفحات
     * @param float $x موقع X (مم)
     * @param float $y موقع Y (مم)
     * @param string $font اسم الخط (مثلاً: Helvetica)
     * @param string $style نمط الخط ('', 'B', 'I', 'U', 'BI', ...)
     * @param int $size حجم الخط
     * @param array $color مصفوفة RGB، مثال: [255, 0, 0] = أحمر
     */
    public function addTextOverlay(
        string $sourceFile,
        string $outputFile,
        string $text,
        ?array $pages = null,
        float $x = 10,
        float $y = 10,
        string $font = 'Helvetica',
        string $style = 'B',
        int $size = 16,
        array $color = [255, 0, 0]
    ) {
        $pdf = new Fpdi();

        $pageCount = $pdf->setSourceFile($sourceFile);

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $tpl = $pdf->importPage($pageNo);
            $sizePage = $pdf->getTemplateSize($tpl);

            $pdf->AddPage($sizePage['orientation'], [$sizePage['width'], $sizePage['height']]);
            $pdf->useTemplate($tpl);

            // إذا الصفحات محددة، نكتب فقط عليها
            if ($pages === null || in_array($pageNo, $pages)) {
                $pdf->SetFont($font, $style, $size);
                $pdf->SetTextColor(...$color);
                $pdf->SetXY($x, $y);
                $pdf->Write(10, $text);
            }
        }

        $pdf->Output('F', $outputFile);
    }
}
