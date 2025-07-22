// PDF360 - Main JavaScript File

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    initializeNavigation();
    initializeScrollEffects();
    initializeToolCards();
    initializeAnimations();
    initializeMobileMenu();
    initializeThemeEffects();
}

// Navigation Functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Update active nav link
            updateActiveNavLink(this);
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', debounce(updateActiveNavOnScroll, 100));
}

// Update Active Navigation Link
function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// Update Active Navigation on Scroll
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

// Scroll Effects
function initializeScrollEffects() {
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', debounce(() => {
        const scrollPosition = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        
        // Header background opacity
        if (scrollPosition > 50) {
            header.style.background = 'rgba(15, 15, 35, 0.95)';
            header.style.backdropFilter = 'blur(25px)';
        } else {
            header.style.background = 'rgba(15, 15, 35, 0.9)';
            header.style.backdropFilter = 'blur(20px)';
        }
        
        // Parallax effect for hero background
        if (scrollPosition < heroHeight) {
            const heroBackground = document.querySelector('.hero-bg');
            heroBackground.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        }
        
        // Animate floating cards
        animateFloatingCards(scrollPosition);
        
    }, 16)); // ~60fps
}

// Animate Floating Cards
function animateFloatingCards(scrollPosition) {
    const cards = document.querySelectorAll('.floating-card');
    
    cards.forEach((card, index) => {
        const speed = 0.1 + (index * 0.05);
        const yPos = Math.sin(scrollPosition * speed + index) * 10;
        const rotation = Math.sin(scrollPosition * speed * 0.5 + index) * 5;
        
        card.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
    });
}

// Tool Cards Interactive Effects
function initializeToolCards() {
    const toolCards = document.querySelectorAll('.tool-card:not(.coming-soon)');
    
    toolCards.forEach(card => {
        // Mouse move effect
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        // Mouse leave effect
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg)';
        });
        
        // Click animation
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.tool-btn')) {
                const toolBtn = this.querySelector('.tool-btn');
                if (toolBtn) {
                    toolBtn.click();
                }
            }
        });
    });
    
    // Tool button hover effects
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(-5px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0px) scale(1)';
        });
    });
}

// Initialize Animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.tool-card, .feature, .footer-section, .hero-content, .section-header'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Add CSS for animations
    addScrollAnimationStyles();
}

// Add Scroll Animation Styles
function addScrollAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .tool-card.animate-on-scroll {
            transition-delay: calc(var(--index, 0) * 0.1s);
        }
        
        .feature.animate-on-scroll {
            transition-delay: calc(var(--index, 0) * 0.15s);
        }
    `;
    document.head.appendChild(style);
    
    // Add index variables for staggered animations
    document.querySelectorAll('.tool-card').forEach((card, index) => {
        card.style.setProperty('--index', index);
    });
    
    document.querySelectorAll('.feature').forEach((feature, index) => {
        feature.style.setProperty('--index', index);
    });
}

// Mobile Menu
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
        
        // Add mobile menu styles
        addMobileMenuStyles();
    }
}

// Add Mobile Menu Styles
function addMobileMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .menu-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .menu-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            
            .menu-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
            
            .nav.active {
                display: block;
                position: fixed;
                top: 80px;
                left: 0;
                width: 100%;
                background: rgba(15, 15, 35, 0.98);
                backdrop-filter: blur(25px);
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .nav.active ul {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav.active .nav-link {
                display: block;
                padding: 1rem;
                text-align: center;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .body.menu-open {
                overflow: hidden;
            }
        }
    `;
    document.head.appendChild(style);
}

// Theme Effects
function initializeThemeEffects() {
    // Dynamic gradient background
    createDynamicBackground();
    
    // Cursor trail effect
    createCursorTrail();
    
    // Random sparkles
    createSparkleEffect();
}

// Dynamic Background
function createDynamicBackground() {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    
    if (hero && heroBg) {
        hero.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const gradientX = x * 100;
            const gradientY = y * 100;
            
            heroBg.style.background = `
                radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
                radial-gradient(circle at ${100 - gradientX}% ${100 - gradientY}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)
            `;
        });
    }
}

// Cursor Trail Effect
function createCursorTrail() {
    const trail = [];
    const trailLength = 20;
    
    // Create trail elements
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(99, 102, 241, ${1 - i / trailLength});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.1s ease;
        `;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        let x = mouseX;
        let y = mouseY;
        
        trail.forEach((dot, index) => {
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            
            const nextDot = trail[index + 1] || trail[0];
            x += (parseInt(nextDot.style.left) - x) * 0.3;
            y += (parseInt(nextDot.style.top) - y) * 0.3;
        });
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// Sparkle Effect
function createSparkleEffect() {
    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 3 + 2;
        
        sparkle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
            animation: sparkleAnimation ${duration}s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, duration * 1000);
    }
    
    // Add sparkle animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleAnimation {
            0% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(0) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create sparkles periodically
    setInterval(createSparkle, 3000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimizations
function optimizePerformance() {
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Lazy load images when implemented
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);

// Error Handling
window.addEventListener('error', function(e) {
    console.error('PDF360 Error:', e.error);
    // Could send error to analytics service here
});

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}