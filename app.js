function bootAnim() {
    // Configuration variables for loading animation
    const config = {
        loadingDuration: 1, // Loading bar duration in seconds
        circleExpandDuration: 1.5, // Circle expansion duration
        circleExpandEase: "power2.inOut" // GSAP easing function
    };

    // Reset elements to initial state
    gsap.set(".loading-container", { opacity: 0 });
    gsap.set(".loading-progress", { width: "0%" });
    gsap.set(".overlay", { opacity: 1, display: "block" });
    gsap.set(".circular-mask", { display: "block" });
    gsap.set("#maskCircle", { attr: { r: 0 } });

    // Initialize loading animation timeline
    const loadingTl = gsap.timeline({
        onComplete: () => {
            // Your parallax initialization will happen after loading completes
            initializeParallax();
        }
    });

    // Show loading container
    loadingTl.to(".loading-container", {
        opacity: 1,
        duration: 0.3
    });

    // Animate loading bar
    loadingTl.to(".loading-progress", {
        width: "100%",
        duration: config.loadingDuration,
        ease: "none"
    });

    // Hide loading container
    loadingTl.to(".loading-container", {
        opacity: 0,
        duration: 0.3
    });

    // Start circular reveal
    loadingTl.to("#maskCircle", {
        attr: { r: 150 },
        duration: config.circleExpandDuration,
        ease: config.circleExpandEase,
        onStart: () => {
            gsap.to(".overlay", {
                opacity: 0,
                duration: config.circleExpandDuration,
                ease: config.circleExpandEase
            });
        },
        onComplete: () => {
            document.querySelector(".circular-mask").style.display = "none";
            document.querySelector(".overlay").style.display = "none";
        }
    }, "-=0.1");
}

// Simple mobile detection function
function isMobile() {
    return window.innerWidth <= 768;
}

// Function to update image visibility based on device type
function updateMobileImages() {
    const parallaxImages = document.querySelectorAll('.parallax');
    
    if (isMobile()) {
        // On mobile, hide all images except background, center_fog, and front_fog
        parallaxImages.forEach(img => {
            if (img.classList.contains('bg-img') || 
                img.classList.contains('center_fog') || 
                img.classList.contains('front_fog') ||
                img.classList.contains('text')) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
    } else {
        // On desktop/tablet, show all images
        parallaxImages.forEach(img => {
            img.style.display = 'block';
        });
    }
}

const parallax_el = document.querySelectorAll(".parallax");
let xValue = 0, yValue = 0;
let rotateDegree = 0;
let isInitialized = false;

// Initialize elements with proper default state
function initializeParallax() {
    // Update image visibility based on device type
    updateMobileImages();
    
    parallax_el.forEach((el) => {
        // Set baseline transform to prevent glitches
        el.style.transform = `perspective(2300px) translateZ(0px) rotateY(0deg) translateX(-50%) translateY(-50%)`;
        // Remove any loading states
        el.classList.remove('loading');
    });

    isInitialized = true;
}

function isWindowMaximized() {
    return window.innerHeight === screen.height && window.innerWidth === screen.width;
}

let movementLimits = getMovementLimits();

// Debounce resize events to prevent excessive animation calls
let resizeTimeout;
let wasMobile = isMobile();

window.addEventListener('resize', () => {
    // Immediately show black overlay when resize starts
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    } else {
        // First resize event - show overlay immediately
        gsap.set(".overlay", { opacity: 1, display: "block" });
        gsap.set(".circular-mask", { display: "block" });
        isInitialized = false; // Disable mouse interactions
    }

    resizeTimeout = setTimeout(() => {
        // Reset timeout reference
        resizeTimeout = null;
        
        // Check if device type changed
        const isNowMobile = isMobile();
        if (wasMobile !== isNowMobile) {
            wasMobile = isNowMobile;
            updateMobileImages();
        }

        // Update movement limits
        movementLimits = getMovementLimits();
        initializeParallax();
        // Trigger the boot animation after resize stops
        bootAnim();
    }, 500); // Wait 500ms after resize stops
});

window.addEventListener("mousemove", (e) => {
    // Early return for mobile devices
    if (isMobile()) return;
    
    if (!isInitialized) return; // Don't update until initialized
    
    xValue = e.clientX - window.innerWidth / 2;
    yValue = e.clientY - window.innerHeight / 2;
    rotateDegree = (xValue / (window.innerWidth / 2)) * 20;

    // Add moving class to disable transitions during movement
    parallax_el.forEach(el => el.classList.add('moving'));

    update(e.clientX);
});

// Remove moving class when mouse stops (debounced)
let mouseStopTimer;
window.addEventListener("mousemove", () => {
    // Early return for mobile devices
    if (isMobile()) return;
    
    clearTimeout(mouseStopTimer);
    mouseStopTimer = setTimeout(() => {
        parallax_el.forEach(el => el.classList.remove('moving'));
    }, 100);
});

function update(cursorPosition) {
    // Early return for mobile devices
    if (isMobile()) return;
    
    parallax_el.forEach((el) => {
        let speedx = el.dataset.speedx || 0;
        let speedy = el.dataset.speedy || 0;
        let rotatespeed = el.dataset.rotatespeed || speedy;

        let limitedXValue = Math.max(-movementLimits.maxX, Math.min(movementLimits.maxX, xValue));
        let limitedYValue = Math.max(-movementLimits.maxY, Math.min(movementLimits.maxY, yValue));

        // Safely get computed style
        const computedLeft = parseFloat(getComputedStyle(el).left) || 0;
        let isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        let zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${zValue}px) rotateY(${rotateDegree * rotatespeed}deg) translateX(calc(-50% + ${-limitedXValue * speedx}px)) translateY(calc(-50% + ${limitedYValue * speedy}px))`;
    });
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial mobile state
    wasMobile = isMobile();
});

function getMovementLimits() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth <= 480) {
        return {
            maxX: screenWidth * 0.03, // Much smaller
            maxY: screenHeight * 0.01,
        };
    } else if (screenWidth <= 768) {
        return {
            maxX: screenWidth * 0.05, // Smaller
            maxY: screenHeight * 0.02,
        };
    } else {
        return {
            maxX: screenWidth * 0.2,
            maxY: screenHeight * 0.05,
        };
    }
}

document.addEventListener('mousemove', function (e) {
    // Early return for mobile devices
    if (isMobile()) return;
    
    const navbar = document.querySelector('.navbar');
    const rect = navbar.getBoundingClientRect();

    // Calculate mouse position relative to navbar
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate distance from center
    const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    // Convert distance to light intensity
    const maxDistance = 300;
    let intensity = Math.max(0, 1 - (distance / maxDistance));

    // Boost if mouse is directly over navbar
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        intensity = Math.min(1, intensity * 1.5);
    }

    // Update CSS variables
    navbar.style.setProperty('--global-mouse-x', `${x}px`);
    navbar.style.setProperty('--global-mouse-y', `${y}px`);
    navbar.style.setProperty('--light-intensity', intensity);
});

const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Smooth scrolling for navigation links
function initNavigation() {
    // Get all navigation links (both desktop and mobile)
    const navLinks = document.querySelectorAll('.nav-menu a, .mobile-menu a');
    const snapContainer = document.querySelector('.snap-container');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target section ID from the href
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection && snapContainer) {
                // Calculate the scroll position
                const sectionIndex = Array.from(document.querySelectorAll('.snap-section')).indexOf(targetSection);
                const scrollPosition = sectionIndex * window.innerHeight;
                
                // Smooth scroll to the section
                snapContainer.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
                
                // Update active state
                updateActiveNavLink(targetId);
            }
        });
    });
    
    // Update active link on scroll
    snapContainer.addEventListener('scroll', () => {
        updateActiveNavOnScroll();
    });
}

// Update active navigation link
function updateActiveNavLink(activeId) {
    const allLinks = document.querySelectorAll('.nav-menu a, .mobile-menu a');
    
    allLinks.forEach(link => {
        if (link.getAttribute('href') === activeId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Update active link based on scroll position
function updateActiveNavOnScroll() {
    const snapContainer = document.querySelector('.snap-container');
    const sections = document.querySelectorAll('.snap-section');
    const scrollPosition = snapContainer.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Determine which section is currently in view
    const currentSectionIndex = Math.round(scrollPosition / windowHeight);
    const currentSection = sections[currentSectionIndex];
    
    if (currentSection) {
        // Determine the section ID
        let sectionId = '#home'; // Default to home
        
        if (currentSection.classList.contains('content-section')) {
            const heading = currentSection.querySelector('h2');
            if (heading) {
                sectionId = '#' + heading.textContent.toLowerCase();
            }
        }
        
        updateActiveNavLink(sectionId);
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start the boot animation on page load
    bootAnim();
    // Initialize navigation
    initNavigation();
});