<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تدوير PDF</title>
  <link rel="stylesheet" href="assets/css/rotate.css">
  <link rel="icon" type="image/png" href="assets/images/favicon.png">

</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌀 تدوير ملف PDF</h1>
      <p>اختر ملف PDF وزاوية التدوير المطلوبة</p>
    </div>
    
    <div class="upload-section">
      <div class="file-input-wrapper">
        <input type="file" id="pdfInput" accept="application/pdf" class="file-input">
        <label for="pdfInput" class="file-label">
          📄 اختر ملف PDF
        </label>
      </div>
      
      <div class="rotation-options">
        <label for="rotationAngle">زاوية التدوير:</label>
        <select id="rotationAngle" class="rotation-select">
          <option value="90">تدوير 90° (يمين)</option>
          <option value="180">تدوير 180° (مقلوب)</option>
          <option value="270">تدوير 270° (يسار)</option>
        </select>
      </div>
      
      <button onclick="rotatePdf()" class="rotate-btn" id="rotateBtn" disabled>
        🔄 تدوير وتحميل
      </button>
      
      <div id="loadingSpinner" class="loading-spinner" style="display: none;">
        <div class="spinner"></div>
        <p>جاري تدوير الملف...</p>
      </div>
      
      <div id="status" class="status-message"></div>
    </div>
  </div>

  <script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js"></script>
  <script src="assets/js/pdf-rotate.js"></script>
</body>
</html>