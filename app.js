// Portfolio App - Apple Vision Pro Style
// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Global Variables
let isLoaded = false;
let currentSection = 'home';

// DOM Elements
const loadingOverlay = document.querySelector('.loading-overlay');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const skillProgressBars = document.querySelectorAll('.skill-progress');
const contactForm = document.querySelector('.contact-form');

// Initialize Application
function initApp() {
    initLoading();
    initNavigation();
    // Set active nav link after a short delay to ensure DOM is ready
    setTimeout(setActiveNavLink, 100);
    initScrollAnimations();
    initSkillBars();
    initContactForm();
    initParallaxEffects();
}

// Loading Animation - Much faster and more responsive
function initLoading() {
    // Initialize fog and particles immediately
    gsap.set('.fog', { opacity: 1 });
    gsap.set('.particle', { opacity: 1 });
    
    // Super quick animation timeline - total time reduced significantly
    const tl = gsap.timeline({
        onComplete: () => {
            isLoaded = true;
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 150);
        }
    });

    // Quick entrance animation
    tl.fromTo('.loading-overlay', {
        opacity: 1
    }, {
        opacity: 1,
        duration: 0.3
    });

    // Fast exit animation
    tl.to('.loading-overlay', {
        opacity: 0,
        duration: 0.2,
        delay: 0.1 // Minimal delay
    });
}

// Mystical page transition effect
function createMysticalTransition(callback) {
    // Create temporary transition overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'transition-overlay';
    transitionOverlay.innerHTML = `
        <div class="transition-fog"></div>
        <div class="transition-fog" style="animation-delay: -1s; opacity: 0.6;"></div>
        <div class="transition-fog" style="animation-delay: -0.5s; opacity: 0.4;"></div>
    `;
    document.body.appendChild(transitionOverlay);
    
    // Animate transition in
    gsap.fromTo(transitionOverlay, 
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
    
    // Execute callback after short delay
    setTimeout(() => {
        callback();
    }, 250);
}

// Set active nav link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    // If no nav links found, return early
    if (!navLinks.length) return;
    
    // Remove all active classes first
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    let activeSet = false;
    
    // Find and activate the correct nav link
    navLinks.forEach(link => {
        if (activeSet) return; // Only set one active link
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Direct match
        if (href === currentPage) {
            link.classList.add('active');
            activeSet = true;
            return;
        }
        
        // Handle index page variations
        if ((currentPage === 'index.html' || currentPage === '' || currentPath === '/') && href === 'index.html') {
            link.classList.add('active');
            activeSet = true;
            return;
        }
        
        // Handle other pages
        const currentPageName = currentPage.replace('.html', '');
        const linkPageName = href.replace('.html', '');
        
        if (currentPageName === linkPageName && currentPageName !== '' && linkPageName !== '') {
            link.classList.add('active');
            activeSet = true;
            return;
        }
    });
    
    // If no active link was set and we're on a page, try one more time with loose matching
    if (!activeSet && currentPage) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPage.includes(href.replace('.html', '')) && href !== '#') {
                link.classList.add('active');
            }
        });
    }
}

// Navigation System
function initNavigation() {
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Animate hamburger
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.transform = navMenu.classList.contains('active') 
                    ? `rotate(${index === 0 ? '45deg' : index === 1 ? '0deg' : '-45deg'}) 
                       translate(${index === 0 ? '6px, 6px' : index === 1 ? '20px, 0' : '6px, -6px'})`
                    : 'none';
                span.style.opacity = index === 1 && navMenu.classList.contains('active') ? '0' : '1';
            });
        });
    }

    // Page navigation - handle both hash links and page transitions
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only prevent default and handle scroll for hash links (same page navigation)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    // Update active nav link
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Close mobile menu
                    navMenu.classList.remove('active');
                    
                    // Smooth scroll to section
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: {
                            y: targetSection,
                            offsetY: 50
                        },
                        ease: 'power3.inOut'
                    });
                }
            } else if (href && !href.startsWith('http') && href.endsWith('.html')) {
                // For internal page navigation, add mystical transition
                e.preventDefault();
                createMysticalTransition(() => {
                    window.location.href = href;
                });
                navMenu.classList.remove('active');
            } else {
                // For external links, just close the mobile menu
                navMenu.classList.remove('active');
            }
        });
    });

    // Update active nav on scroll
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.6 });

    sections.forEach(section => observer.observe(section));
}

// Scroll Animations
function initScrollAnimations() {
    // Hero section animation
    gsap.from('.hero-card', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 1
    });

    // About cards animation
    gsap.from('.about-card', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Projects animation
    gsap.from('.project-card', {
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.projects-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    // Skills animation
    gsap.from('.skill-category', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.skills-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Contact section animation
    gsap.from('.contact-content > *', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Floating elements
    gsap.to('.orb-1', {
        y: -30,
        x: 20,
        rotation: 180,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    gsap.to('.orb-2', {
        y: 25,
        x: -15,
        rotation: -180,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2
    });

    gsap.to('.orb-3', {
        y: -20,
        x: 25,
        rotation: 90,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 4
    });
}

// Skill Progress Bars
function initSkillBars() {
    const animateSkillBar = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll('.skill-progress');
                progressBars.forEach((bar, index) => {
                    const level = bar.getAttribute('data-level');
                    gsap.to(bar, {
                        width: `${level}%`,
                        duration: 1.5,
                        ease: 'power2.out',
                        delay: index * 0.1
                    });
                });
            }
        });
    };

    const observer = new IntersectionObserver(animateSkillBar, {
        threshold: 0.5
    });

    document.querySelectorAll('.skill-category').forEach(category => {
        observer.observe(category);
    });
}

// Contact Form
function initContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            
            // Animate button
            gsap.to(submitBtn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    contactForm.reset();
                }, 2000);
            }, 1000);
        });
    }
}

// Original Parallax System Integration with Friction
const parallax_el = document.querySelectorAll(".parallax");
let xValue = 0, yValue = 0;
let rotateDegree = 0;
let isParallaxInitialized = false;

// Friction/Damping system for smooth movement
let targetX = 0, targetY = 0, targetRotate = 0;
let currentX = 0, currentY = 0, currentRotate = 0;
const friction = 0.08; // Lower = more friction (smoother but slower)
let animationId = null;
let isAnimating = false;

function getMovementLimits() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth <= 480) {
        return {
            maxX: screenWidth * 0.03,
            maxY: screenHeight * 0.01,
        };
    } else if (screenWidth <= 768) {
        return {
            maxX: screenWidth * 0.05,
            maxY: screenHeight * 0.02,
        };
    } else {
        return {
            maxX: screenWidth * 0.2,
            maxY: screenHeight * 0.05,
        };
    }
}

let movementLimits = getMovementLimits();

function initializeOriginalParallax() {
    parallax_el.forEach((el) => {
        el.style.transform = `perspective(2300px) translateZ(0px) rotateY(0deg) translateX(-50%) translateY(-50%)`;
        el.classList.remove('loading');
    });
    isParallaxInitialized = true;
}

// Smooth animation loop with friction
function animateParallax() {
    // Lerp (linear interpolation) for smooth movement
    currentX += (targetX - currentX) * friction;
    currentY += (targetY - currentY) * friction;
    currentRotate += (targetRotate - currentRotate) * friction;
    
    // Update parallax elements with smooth values
    updateParallaxElements();
    
    // Continue animation loop
    animationId = requestAnimationFrame(animateParallax);
}

function updateParallaxElements() {
    if (!isParallaxInitialized) return;
    
    parallax_el.forEach((el) => {
        let speedx = el.dataset.speedx || 0;
        let speedy = el.dataset.speedy || 0;
        let rotatespeed = el.dataset.rotatespeed || speedy;

        let limitedXValue = Math.max(-movementLimits.maxX, Math.min(movementLimits.maxX, currentX));
        let limitedYValue = Math.max(-movementLimits.maxY, Math.min(movementLimits.maxY, currentY));

        const computedLeft = parseFloat(getComputedStyle(el).left) || 0;
        let isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        let zValue = ((window.innerWidth / 2 + currentX) - computedLeft) * isInLeft * 0.1;

        // Special handling for parallax text to avoid transform conflicts
        if (el.classList.contains('parallax-text')) {
            // Use GSAP for parallax text to avoid conflicts with ScrollTrigger
            gsap.to(el, {
                x: -limitedXValue * speedx,
                y: limitedYValue * speedy,
                rotationY: currentRotate * rotatespeed,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: false // Don't overwrite ScrollTrigger animations
            });
        } else {
            // Use direct transform for other elements
            el.style.transform = `perspective(2300px) translateZ(${zValue}px) rotateY(${currentRotate * rotatespeed}deg) translateX(calc(-50% + ${-limitedXValue * speedx}px)) translateY(calc(-50% + ${limitedYValue * speedy}px))`;
        }
    });
}

// Parallax Effects
function initParallaxEffects() {
    // Initialize original parallax system
    initializeOriginalParallax();
    
    // Start smooth animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    animateParallax();
    
    // Combined mouse movement handler with friction
    document.addEventListener('mousemove', (e) => {
        // Set target values for smooth interpolation
        targetX = e.clientX - window.innerWidth / 2;
        targetY = e.clientY - window.innerHeight / 2;
        targetRotate = (targetX / (window.innerWidth / 2)) * 20;
        
        // Apple Vision Pro style effects with added friction
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        
        // Subtle parallax for glass panels with increased duration for smoothness
        gsap.to('.glass-panel', {
            rotationY: mouseX * 1.5,
            rotationX: mouseY * -1.5,
            duration: 1.2, // Increased from 0.8 for smoother feel
            ease: 'power2.out',
            stagger: 0.02
        });
        
        // Enhanced parallax for floating orbs with more friction
        gsap.to('.orb', {
            x: mouseX * 40,
            y: mouseY * 25,
            duration: 1.8, // Increased from 1.2 for smoother feel
            ease: 'power2.out',
            stagger: 0.1
        });
        
        // Add moving class to disable transitions during movement
        parallax_el.forEach(el => el.classList.add('moving'));
    });
    
    // Remove moving class when mouse stops (simplified)
    let mouseStopTimer;
    
    document.addEventListener('mousemove', () => {
        clearTimeout(mouseStopTimer);
        mouseStopTimer = setTimeout(() => {
            parallax_el.forEach(el => el.classList.remove('moving'));
        }, 100);
    });

    // Parallax text fade out on scroll - much more responsive
    gsap.to('.parallax-text', {
        opacity: 0,
        y: -50,
        scale: 0.9,
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: '30% top', // Fade out much faster
            scrub: 1
        }
    });
    
    // Keep atmospheric overlays fixed - no scroll movement
    // (Removed the moving atmospheric overlay animation)
    
    // Handle resize for parallax
    window.addEventListener('resize', () => {
        movementLimits = getMovementLimits();
        initializeOriginalParallax();
    });
}

// Intersection Observer for animations
function createScrollObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe all glass panels
    document.querySelectorAll('.glass-panel').forEach(panel => {
        observer.observe(panel);
    });
}

// Button hover effects
function initButtonEffects() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('click', () => {
            gsap.to(btn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out'
            });
        });
    });
}

// Text typing effect
function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        subtitle.style.borderRight = '2px solid #007AFF';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    subtitle.style.borderRight = 'none';
                }, 1000);
            }
        }, 50);
    }
}

// Resize handler
function handleResize() {
    // Refresh ScrollTrigger on resize
    ScrollTrigger.refresh();
}

// Quick About section animations
function initQuickAbout() {
    const profileCard = document.querySelector('.profile-card');
    const languagesCard = document.querySelector('.languages-card');
    const languageTags = document.querySelectorAll('.language-tag');
    
    if (profileCard) {
        gsap.fromTo(profileCard, 
            { opacity: 0, x: -60 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.quick-about-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
    
    if (languagesCard) {
        gsap.fromTo(languagesCard, 
            { opacity: 0, x: 60 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1,
                ease: 'power2.out',
                delay: 0.2,
                scrollTrigger: {
                    trigger: '.quick-about-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
    
    // Animate language tags
    languageTags.forEach((tag, index) => {
        gsap.fromTo(tag, 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5,
                ease: 'back.out(1.7)',
                delay: 0.5 + (index * 0.03),
                scrollTrigger: {
                    trigger: '.languages-card',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
        
        // Add hover effects
        tag.addEventListener('mouseenter', () => {
            gsap.to(tag, {
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        tag.addEventListener('mouseleave', () => {
            gsap.to(tag, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
    
    // Profile image ring animation
    const profileImageRing = document.querySelector('.profile-image-ring');
    if (profileImageRing) {
        gsap.to(profileImageRing, {
            rotation: 360,
            duration: 20,
            ease: 'none',
            repeat: -1
        });
    }
}

// Enhanced highlights section animations
function initHighlights() {
    const highlightCards = document.querySelectorAll('.highlight-card');
    
    highlightCards.forEach((card, index) => {
        // Initial animation
        gsap.fromTo(card, 
            { opacity: 0, y: 60 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8,
                ease: 'power2.out',
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: '.highlights-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
        
        // Hover effects
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelector('.highlight-icon'), {
                scale: 1.1,
                rotation: 5,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card.querySelector('.highlight-icon'), {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        // Click navigation
        card.addEventListener('click', () => {
            const link = card.querySelector('.highlight-link');
            if (link) {
                window.location.href = link.getAttribute('href');
            }
        });
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    createScrollObserver();
    initButtonEffects();
    initQuickAbout();
    initHighlights();
    
    // Delay typing effect
    setTimeout(initTypingEffect, 2000);
});

// Handle resize
window.addEventListener('resize', handleResize);

// Preloader for images
function preloadImages() {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    
    images.forEach(img => {
        if (img.complete) {
            loadedCount++;
        } else {
            img.addEventListener('load', () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    document.body.classList.add('images-loaded');
                }
            });
        }
    });
    
    if (loadedCount === images.length) {
        document.body.classList.add('images-loaded');
    }
}

// Start image preloading
preloadImages();

// Smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    gsap.registerPlugin(ScrollToPlugin);
}
