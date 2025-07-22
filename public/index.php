<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF360 - أدوات PDF المتكاملة</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/png" href="assets/images/favicon.png">

</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <i class="fas fa-file-pdf"></i>
                <span>PDF360</span>
            </div>
            <nav class="nav">
                <ul>
                    <li><a href="#home" class="nav-link active">الرئيسية</a></li>
                    <li><a href="#tools" class="nav-link">الأدوات</a></li>
                    <li><a href="#about" class="nav-link">حول الموقع</a></li>
                    <li><a href="#footer" class="nav-link">اتصل بنا</a></li>
                </ul>
            </nav>
            <div class="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-bg"></div>
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">
                    <span class="gradient-text">PDF360</span>
                    <br>أدوات PDF المتكاملة
                </h1>
                <p class="hero-subtitle">
                    حلول شاملة لجميع احتياجاتك من ملفات PDF - دمج، تقسيم، حماية وأكثر
                </p>
                <div class="hero-buttons">
                    <a href="#tools" class="btn btn-primary">
                        <i class="fas fa-rocket"></i>
                        ابدأ الآن
                    </a>
                    <a href="#footer" class="btn btn-secondary">
                        <i class="fas fa-info-circle"></i>
                        اعرف المزيد
                    </a>
                </div>
            </div>
            <div class="hero-image">
                <div class="floating-card card-1">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="floating-card card-2">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="floating-card card-3">
                    <i class="fas fa-cut"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Tools Section -->
    <section id="tools" class="tools">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">أدواتنا المتميزة</h2>
                <p class="section-subtitle">اختر الأداة التي تحتاجها لمعالجة ملفات PDF بسهولة وفعالية</p>
            </div>
            <div class="tools-grid">
                <div class="tool-card" data-tool="merge">
                    <div class="tool-icon">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h3>دمج ملفات PDF</h3>
                    <p>اجمع عدة ملفات PDF في ملف واحد بسهولة وسرعة</p>
                    <a href="merge.php" class="tool-btn">
                        <span>استخدم الآن</span>
                        <i class="fas fa-arrow-left"></i>
                    </a>
                </div>

                <div class="tool-card" data-tool="split">
                    <div class="tool-icon">
                        <i class="fas fa-cut"></i>
                    </div>
                    <h3>تقسيم ملفات PDF</h3>
                    <p>قسّم ملفات PDF الكبيرة إلى ملفات أصغر حسب احتياجك</p>
                    <a href="split.php" class="tool-btn">
                        <span>استخدم الآن</span>
                        <i class="fas fa-arrow-left"></i>
                    </a>
                </div>

              

                  <div class="tool-card" data-tool="protect">
                    <div class="tool-icon">
                        <i class="fas fa-redo-alt"></i>
                    </div>
                    <h3>تدوير PDF</h3>
                    <p>اختر ملف PDF وزاوية التدوير المطلوبة</p>
                    <a href="rotate.php" class="tool-btn">
                        <span>استخدم الآن</span>
                        <i class="fas fa-arrow-left"></i>
                    </a>
                </div>

                <div class="tool-card" data-tool="edit">
                    <div class="tool-icon">
                        <i class="fas fa-eye-slash"></i>
                    </div>
                    <h3>حذف وترتيب صفحات PDF</h3>
                    <p>عدّل النصوص والصور في ملفات PDF بسهولة ومرونة</p>
                    <a href="edit.php" class="tool-btn">
                        <span>استخدم الآن</span>
                        <i class="fas fa-arrow-left"></i>
                    </a>
                </div>


                <div class="tool-card" data-tool="upload">
                    <div class="tool-icon">
                        <i class="fas fa-edit"></i>
                    </div>
                    <h3>تعديل ملفات</h3>
                     <p>عدّل النصوص والصور في ملفات PDF بسهولة ومرونة</p>
                    <a href="editor.php" class="tool-btn">
                        <span>استخدم الآن</span>
                        <i class="fas fa-arrow-left"></i>
                    </a>
                </div>


               

                <div class="tool-card" data-tool="edit">
                    <div class="tool-icon">
                        <i class="fas fa-marker"></i>
                    </div>
                    <h3>توقيع PDF</h3>
                    <p>  اضف توقيعك على pdf   </p>
                    <a href="sign.php" class="tool-btn">
                        <span>استخدم الآن</span>
                        <i class="fas fa-arrow-left"></i>
                    </a>
                </div>

                <div class="tool-card coming-soon">
                    <div class="tool-icon">
                        <i class="fas fa-magic"></i>
                    </div>
                    <h3>أدوات إضافية</h3>
                    <p>المزيد من الأدوات المفيدة قادمة قريباً</p>
                    <div class="coming-soon-badge">قريباً</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="about">
        <div class="container">
            <div class="features-grid" >
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <h3>سرعة فائقة</h3>
                    <p>معالجة سريعة لجميع ملفات PDF مهما كان حجمها</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3>أمان تام</h3>
                    <p>حماية كاملة لملفاتك مع تشفير متقدم</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3>متوافق مع الجوال</h3>
                    <p>يعمل بسلاسة على جميع الأجهزة والشاشات</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-gift"></i>
                    </div>
                    <h3>مجاني بالكامل</h3>
                    <p>استخدم جميع الأدوات مجاناً بدون قيود</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer" >
        <div class="container" id="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-logo">
                        <i class="fas fa-file-pdf"></i>
                        <span>PDF360</span>
                    </div>
                    <p>أدوات PDF المتكاملة لجميع احتياجاتك. سهل، سريع وآمن.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>الأدوات</h4>
                    <ul>
                        <li><a href="merge.php">دمج PDF</a></li>
                        <li><a href="split.php">تقسيم PDF</a></li>
                        <li><a href="sign.php">توقيع PDF</a></li>
                        <li><a href="editor.php">تعديل PDF</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>الدعم</h4>
                    <ul>
                        <li><a href="#help">المساعدة</a></li>
                        <li><a href="#faq">الأسئلة الشائعة</a></li>
                        <li><a href="#contact">اتصل بنا</a></li>
                        <li><a href="#privacy">سياسة الخصوصية</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>تواصل معنا</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> info@pdf360.com</p>
                        <p><i class="fas fa-map-marker-alt"></i>مصر</p>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 PDF360. جميع الحقوق محفوظة.</p>
            </div>
        </div>
    </footer>

    <script src="assets/js/script.js"></script>
</body>
</html>
