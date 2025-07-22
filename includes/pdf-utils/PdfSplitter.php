<?php
use setasign\Fpdi\Fpdi;

class PdfSplitter
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        if (!file_exists($filePath)) {
            throw new Exception("ملف PDF غير موجود: $filePath");
        }
        $this->filePath = $filePath;
    }

    public function split(int $fromPage, int $toPage): string
    {
        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($this->filePath);

        if ($fromPage < 1 || $toPage < $fromPage || $toPage > $pageCount) {
            throw new Exception("نطاق صفحات غير صالح.");
        }

        for ($pageNo = $fromPage; $pageNo <= $toPage; $pageNo++) {
            $pdf->AddPage();
            $tplId = $pdf->importPage($pageNo);
            $pdf->useTemplate($tplId);
        }

        return $pdf->Output('', 'S');
    }
}
