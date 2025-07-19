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

const parallax_el = document.querySelectorAll(".parallax");
let xValue = 0, yValue = 0;
let rotateDegree = 0;
let isInitialized = false;

// Initialize elements with proper default state
function initializeParallax() {
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
        
        // Update movement limits
        movementLimits = getMovementLimits();
        initializeParallax();
        // Trigger the boot animation after resize stops
        bootAnim();
    }, 500); // Wait 150ms after resize stops
});

window.addEventListener("mousemove", (e) => {
    if (!isInitialized) return; // Don't update until initialized
    //if (!isWindowMaximized()) return;
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
    clearTimeout(mouseStopTimer);
    mouseStopTimer = setTimeout(() => {
        parallax_el.forEach(el => el.classList.remove('moving'));
    }, 100);
});

function update(cursorPosition) {
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
    // Start the boot animation on page load
    bootAnim();
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