// Device detection and performance settings
const deviceConfig = {
    isMobile: false,
    isTablet: false,
    isLowPerf: false,
    maxImages: 25
};

// Check device type and performance
function detectDevice() {
    const width = window.innerWidth;
    deviceConfig.isMobile = width <= 768;
    deviceConfig.isTablet = width > 768 && width <= 1024;
    
    // Check for low performance indicators
    deviceConfig.isLowPerf = deviceConfig.isMobile || 
                            deviceConfig.isTablet || 
                            navigator.hardwareConcurrency <= 4 ||
                            !window.matchMedia('(pointer: fine)').matches;
    
    // Set max images based on device
    if (deviceConfig.isMobile) {
        deviceConfig.maxImages = 3; // Only background, text, and one fog layer
    } else if (deviceConfig.isTablet) {
        deviceConfig.maxImages = 8;
    } else if (deviceConfig.isLowPerf) {
        deviceConfig.maxImages = 12;
    }
    
    return deviceConfig;
}

// Initialize on load
detectDevice();

function bootAnim() {
    // Configuration variables for loading animation
    const config = {
        loadingDuration: deviceConfig.isMobile ? 0.5 : 1,
        circleExpandDuration: deviceConfig.isMobile ? 0.8 : 1.5,
        circleExpandEase: "power2.inOut"
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
            if (!deviceConfig.isMobile) {
                initializeParallax();
            } else {
                // Simple initialization for mobile
                document.querySelector(".circular-mask").style.display = "none";
                document.querySelector(".overlay").style.display = "none";
                isInitialized = true;
            }
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

const parallax_el = document.querySelectorAll(".parallax");
let xValue = 0, yValue = 0;
let rotateDegree = 0;
let isInitialized = false;
let rafId = null;
let lastMouseX = 0, lastMouseY = 0;

// Initialize elements with proper default state
function initializeParallax() {
    if (deviceConfig.isMobile) return;
    
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

// Throttled mousemove handler
let mouseThrottle = null;
window.addEventListener("mousemove", (e) => {
    if (!isInitialized || deviceConfig.isMobile) return;
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    // Throttle mouse events on low-perf devices
    if (deviceConfig.isLowPerf) {
        if (!mouseThrottle) {
            mouseThrottle = setTimeout(() => {
                handleMouseMove(lastMouseX, lastMouseY);
                mouseThrottle = null;
            }, 50); // 20fps max on low-perf
        }
    } else {
        handleMouseMove(e.clientX, e.clientY);
    }
});

function handleMouseMove(clientX, clientY) {
    xValue = clientX - window.innerWidth / 2;
    yValue = clientY - window.innerHeight / 2;
    rotateDegree = (xValue / (window.innerWidth / 2)) * 20;

    // Add moving class to disable transitions during movement
    parallax_el.forEach(el => el.classList.add('moving'));

    // Use RAF for smooth animation
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => update(clientX));
}

// Remove moving class when mouse stops (debounced)
let mouseStopTimer;
window.addEventListener("mousemove", () => {
    if (deviceConfig.isMobile) return;
    
    clearTimeout(mouseStopTimer);
    mouseStopTimer = setTimeout(() => {
        parallax_el.forEach(el => el.classList.remove('moving'));
    }, 100);
});

function update(cursorPosition) {
    if (deviceConfig.isMobile) return;
    
    parallax_el.forEach((el, index) => {
        // Skip processing images beyond limit
        if (deviceConfig.isLowPerf && index > deviceConfig.maxImages) return;
        
        let speedx = el.dataset.speedx || 0;
        let speedy = el.dataset.speedy || 0;
        let rotatespeed = el.dataset.rotatespeed || speedy;

        let limitedXValue = Math.max(-movementLimits.maxX, Math.min(movementLimits.maxX, xValue));
        let limitedYValue = Math.max(-movementLimits.maxY, Math.min(movementLimits.maxY, yValue));

        // Safely get computed style
        const computedLeft = parseFloat(getComputedStyle(el).left) || 0;
        let isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        let zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        // Simplified transform for low-perf devices
        if (deviceConfig.isLowPerf) {
            el.style.transform = `translateX(calc(-50% + ${-limitedXValue * speedx}px)) translateY(calc(-50% + ${limitedYValue * speedy}px))`;
        } else {
            el.style.transform = `perspective(2300px) translateZ(${zValue}px) rotateY(${rotateDegree * rotatespeed}deg) translateX(calc(-50% + ${-limitedXValue * speedx}px)) translateY(calc(-50% + ${limitedYValue * speedy}px))`;
        }
    });
}

// Debounce resize events to prevent excessive animation calls
let resizeTimeout;
window.addEventListener('resize', () => {
    // Re-detect device on resize
    detectDevice();
    
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

        // Update movement limits
        movementLimits = getMovementLimits();
        
        // Handle image visibility based on device
        updateImageVisibility();
        
        if (!deviceConfig.isMobile) {
            initializeParallax();
        }
        
        // Trigger the boot animation after resize stops
        bootAnim();
    }, 500);
});

// Update which images are visible based on device
function updateImageVisibility() {
    const allImages = document.querySelectorAll('.parallax:not(.text)');
    
    if (deviceConfig.isMobile) {
        // Mobile: Only show background and essential elements
        allImages.forEach((img, index) => {
            if (img.classList.contains('bg-img') || 
                img.classList.contains('center_fog') || 
                img.classList.contains('front_fog')) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
    } else if (deviceConfig.isTablet || deviceConfig.isLowPerf) {
        // Tablet/Low-perf: Show limited images
        const essentialClasses = [
            'bg-img', 'distant_island', 'far_fog', 'center_fog', 
            'front_fog', 'left_cliff', 'right_cliff', 'middle_fog'
        ];
        
        allImages.forEach(img => {
            const hasEssentialClass = essentialClasses.some(cls => img.classList.contains(cls));
            img.style.display = hasEssentialClass ? 'block' : 'none';
        });
    } else {
        // Desktop: Show all images
        allImages.forEach(img => {
            img.style.display = 'block';
        });
    }
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    // Update image visibility on load
    updateImageVisibility();
    
    // Start the boot animation on page load
    bootAnim();
});

function getMovementLimits() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (deviceConfig.isMobile) {
        return {
            maxX: 0, // No parallax on mobile
            maxY: 0,
        };
    } else if (deviceConfig.isTablet) {
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

// Navbar light effect (disable on mobile for performance)
if (!deviceConfig.isMobile) {
    document.addEventListener('mousemove', function (e) {
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
}

const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});