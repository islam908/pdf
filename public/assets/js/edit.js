document.addEventListener('DOMContentLoaded', function() {
    // إدارة التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // إزالة الحالة النشطة من جميع التبويبات
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // تفعيل التبويب المحدد
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
    
    // إدارة اختيار الصفحات للحذف
    const pageSelectorButtons = document.querySelectorAll('.page-selector-btn');
    const pagesDeleteInput = document.getElementById('pages-to-delete');
    const clearDeleteBtn = document.getElementById('clear-delete-selection');
    
    let selectedPagesForDeletion = [];
    
    pageSelectorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageNum = parseInt(this.getAttribute('data-page'));
            const isSelected = this.classList.contains('selected-delete');
            
            if (isSelected) {
                // إلغاء التحديد
                this.classList.remove('selected-delete');
                selectedPagesForDeletion = selectedPagesForDeletion.filter(p => p !== pageNum);
            } else {
                // إضافة للتحديد
                this.classList.add('selected-delete');
                selectedPagesForDeletion.push(pageNum);
            }
            
            // تحديث حقل الإدخال
            selectedPagesForDeletion.sort((a, b) => a - b);
            if (pagesDeleteInput) {
                pagesDeleteInput.value = selectedPagesForDeletion.join(',');
            }
        });
    });
    
    // مسح تحديد الصفحات للحذف
    if (clearDeleteBtn) {
        clearDeleteBtn.addEventListener('click', function() {
            selectedPagesForDeletion = [];
            pageSelectorButtons.forEach(btn => btn.classList.remove('selected-delete'));
            if (pagesDeleteInput) {
                pagesDeleteInput.value = '';
            }
        });
    }
    
    // إدارة السحب والإفلات لترتيب الصفحات
    const sortableContainer = document.getElementById('sortable-pages');
    const pageOrderInput = document.getElementById('page-order');
    const resetOrderBtn = document.getElementById('reset-order');
    
    if (sortableContainer) {
        let draggedElement = null;
        let placeholder = null;
        
        // إنشاء عنصر placeholder
        function createPlaceholder() {
            const div = document.createElement('div');
            div.className = 'sortable-page placeholder';
            div.style.background = '#ecf0f1';
            div.style.border = '2px dashed #bdc3c7';
            div.style.height = '60px';
            div.innerHTML = '<span style="color: #95a5a6;">ضع الصفحة هنا</span>';
            return div;
        }
        
        // جعل العناصر قابلة للسحب
        function makeDraggable() {
            const sortablePages = sortableContainer.querySelectorAll('.sortable-page:not(.placeholder)');
            
            sortablePages.forEach(page => {
                page.draggable = true;
                
                page.addEventListener('dragstart', function(e) {
                    draggedElement = this;
                    this.classList.add('dragging');
                    
                    // إنشاء placeholder
                    placeholder = createPlaceholder();
                    
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', this.outerHTML);
                });
                
                page.addEventListener('dragend', function() {
                    this.classList.remove('dragging');
                    
                    // إزالة placeholder
                    if (placeholder && placeholder.parentNode) {
                        placeholder.parentNode.removeChild(placeholder);
                    }
                    
                    draggedElement = null;
                    placeholder = null;
                    
                    updatePageOrder();
                });
            });
        }
        
        // التعامل مع الإسقاط
        sortableContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            
            if (draggedElement) {
                const afterElement = getDragAfterElement(sortableContainer, e.clientY);
                
                if (placeholder && placeholder.parentNode) {
                    placeholder.parentNode.removeChild(placeholder);
                }
                
                if (afterElement == null) {
                    sortableContainer.appendChild(placeholder);
                } else {
                    sortableContainer.insertBefore(placeholder, afterElement);
                }
            }
        });
        
        sortableContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            
            if (draggedElement && placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(draggedElement, placeholder);
                placeholder.parentNode.removeChild(placeholder);
            }
        });
        
        // الحصول على العنصر الذي يجب الإدراج بعده
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.sortable-page:not(.dragging):not(.placeholder)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        
        // تحديث حقل ترتيب الصفحات
        function updatePageOrder() {
            const pages = sortableContainer.querySelectorAll('.sortable-page:not(.placeholder)');
            const order = Array.from(pages).map(page => page.getAttribute('data-page'));
            
            if (pageOrderInput) {
                pageOrderInput.value = order.join(',');
            }
        }
        
        // إعادة الترتيب الأصلي
        if (resetOrderBtn) {
            resetOrderBtn.addEventListener('click', function() {
                const pages = Array.from(sortableContainer.querySelectorAll('.sortable-page:not(.placeholder)'));
                
                // ترتيب حسب رقم الصفحة
                pages.sort((a, b) => {
                    return parseInt(a.getAttribute('data-page')) - parseInt(b.getAttribute('data-page'));
                });
                
                // إعادة إدراج العناصر في الحاوية
                pages.forEach(page => sortableContainer.appendChild(page));
                
                updatePageOrder();
            });
        }
        
        // تفعيل السحب والإفلات
        makeDraggable();
        updatePageOrder();
    }
    
    // تحديث حقل ترتيب الصفحات عند الكتابة يدوياً
    if (pagesDeleteInput) {
        pagesDeleteInput.addEventListener('input', function() {
            const pages = this.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
            
            // تحديث التحديد المرئي
            pageSelectorButtons.forEach(btn => {
                const pageNum = parseInt(btn.getAttribute('data-page'));
                if (pages.includes(pageNum)) {
                    btn.classList.add('selected-delete');
                } else {
                    btn.classList.remove('selected-delete');
                }
            });
            
            selectedPagesForDeletion = pages;
        });
    }
    
    // التحقق من صحة الإدخال
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const operation = form.querySelector('input[name="operation"]');
            
            if (operation) {
                const opValue = operation.value;
                
                if (opValue === 'delete') {
                    const pagesInput = form.querySelector('input[name="pages_to_delete"]');
                    if (pagesInput && !pagesInput.value.trim()) {
                        e.preventDefault();
                        showFeedback('يرجى تحديد الصفحات المراد حذفها', 'warning');
                        return false;
                    }
                } else if (opValue === 'reorder') {
                    const orderInput = form.querySelector('input[name="page_order"]');
                    if (orderInput && !orderInput.value.trim()) {
                        e.preventDefault();
                        showFeedback('يرجى تحديد ترتيب الصفحات المطلوب', 'warning');
                        return false;
                    }
                }
            }
        });
    });
    
    // عرض رسائل التغذية الراجعة
    function showFeedback(message, type = 'info') {
        // إزالة الرسائل السابقة
        const existingFeedback = document.querySelector('.feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback ${type}`;
        feedbackDiv.textContent = message;
        
        const container = document.querySelector('.container');
        const firstChild = container.firstChild;
        container.insertBefore(feedbackDiv, firstChild);
        
        // إزالة الرسالة بعد 5 ثواني
        setTimeout(() => {
            feedbackDiv.remove();
        }, 5000);
    }
    
    // تحسين تجربة المستخدم مع تحميل الملفات
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.type !== 'application/pdf') {
                    showFeedback('يرجى اختيار ملف PDF فقط', 'warning');
                    this.value = '';
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    showFeedback('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت', 'warning');
                    this.value = '';
                    return;
                }
                
                showFeedback(`تم اختيار الملف: ${file.name} (${formatFileSize(file.size)})`, 'info');
            }
        });
    });
    
    // تنسيق حجم الملف
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 بايت';
        
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // إضافة تأثيرات بصرية للتفاعل
    function addRippleEffect(element, e) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    // إضافة تأثير الريبل للأزرار
    const buttons = document.querySelectorAll('.btn, .page-selector-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            addRippleEffect(this, e);
        });
    });
    
    // إضافة CSS للأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .feedback {
            animation: slideInDown 0.5s ease-out;
        }
        
        @keyframes slideInDown {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // إضافة دعم لوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        // ESC لإغلاق الرسائل
        if (e.key === 'Escape') {
            const feedback = document.querySelector('.feedback');
            if (feedback) {
                feedback.remove();
            }
        }
        
        // Ctrl+A لتحديد جميع الصفحات للحذف
        if (e.ctrlKey && e.key === 'a' && document.activeElement.closest('.page-selector')) {
            e.preventDefault();
            pageSelectorButtons.forEach(btn => {
                btn.classList.add('selected-delete');
                const pageNum = parseInt(btn.getAttribute('data-page'));
                if (!selectedPagesForDeletion.includes(pageNum)) {
                    selectedPagesForDeletion.push(pageNum);
                }
            });
            if (pagesDeleteInput) {
                selectedPagesForDeletion.sort((a, b) => a - b);
                pagesDeleteInput.value = selectedPagesForDeletion.join(',');
            }
        }
    });
    
    // حفظ الحالة في localStorage (للنسخ الاحتياطي)
    function saveState() {
        const state = {
            selectedPages: selectedPagesForDeletion,
            activeTab: document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || 'delete'
        };
        
        try {
            localStorage.setItem('pdfEditorState', JSON.stringify(state));
        } catch (e) {
            // تجاهل الأخطاء إذا كان localStorage غير متاح
        }
    }
    
    // استرداد الحالة
    function restoreState() {
        try {
            const savedState = localStorage.getItem('pdfEditorState');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // استرداد التبويب النشط
                if (state.activeTab) {
                    const tabBtn = document.querySelector(`[data-tab="${state.activeTab}"]`);
                    if (tabBtn) {
                        tabBtn.click();
                    }
                }
            }
        } catch (e) {
            // تجاهل الأخطاء
        }
    }
    
    // حفظ الحالة عند التغيير
    document.addEventListener('change', saveState);
    document.addEventListener('click', saveState);
    
    // استرداد الحالة عند التحميل
    restoreState();
    
    console.log('🎉 تم تحميل محرر PDF بنجاح!');
});