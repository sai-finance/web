// script.js - Enhanced Version with Hero Slideshow

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const topBar = document.getElementById('top-bar');
    let currentScrollOffset = 0; // Will be calculated

    // --- Calculate and Set Dynamic Offsets ---
    const getEffectiveHeaderHeight = () => {
        const topBarVisible = topBar && window.getComputedStyle(topBar).display !== 'none';
        const topBarHeight = topBarVisible ? topBar.offsetHeight : 0;
        const mainHeaderHeight = header ? header.offsetHeight : 0;
        return mainHeaderHeight + topBarHeight;
    };

    const updateScrollRelatedPaddings = () => {
        currentScrollOffset = getEffectiveHeaderHeight();
        document.documentElement.style.scrollPaddingTop = `${currentScrollOffset}px`;
        // body padding-top is set via CSS using vars for initial load.
        // The scroll-padding-top for anchors is now dynamic.
    };

    // Initial calculation
    updateScrollRelatedPaddings();


    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const isExpanded = navbar.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.innerHTML = isExpanded ? '✕' : '☰'; // Cross icon when open, burger when closed
        });
        // Close mobile menu when a nav link is clicked
        document.querySelectorAll('.navbar a.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.innerHTML = '☰';
                }
            });
        });
    }

    // --- Active Nav Link Highlighting on Scroll (Scrollspy) ---
    const navLinks = document.querySelectorAll('.navbar a.nav-link[href^="#"]');
    const sections = document.querySelectorAll('main section[id]');

    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
    };

    let scrollspyObserver;

    const initScrollspyObserver = () => {
        if (scrollspyObserver) scrollspyObserver.disconnect();

        // Use the dynamically calculated currentScrollOffset for rootMargin
        const observerOptions = {
            root: null,
            rootMargin: `-${currentScrollOffset + 20}px 0px -45% 0px`, // Adjusted for better accuracy
            threshold: 0 // Trigger as soon as any part of the section enters/leaves the viewport according to rootMargin
        };

        const observerCallback = (entries) => {
            let latestIntersectingEntry = null;
            // Find the topmost visible section
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!latestIntersectingEntry || entry.boundingClientRect.top < latestIntersectingEntry.boundingClientRect.top) {
                        latestIntersectingEntry = entry;
                    }
                }
            });

            if (latestIntersectingEntry) {
                const id = latestIntersectingEntry.target.getAttribute('id');
                const activeLink = document.querySelector(`.navbar a.nav-link[href="#${id}"]`);
                if (activeLink) {
                    removeActiveClasses();
                    activeLink.classList.add('active');
                    activeLink.setAttribute('aria-current', 'page');
                }
            } else {
                // Fallback logic for when no section is "intersecting" according to the strict rootMargin
                // (e.g., when scrolled to the very top or very bottom beyond section bounds)
                const scrollY = window.scrollY;
                const dynamicOffsetForFallback = getEffectiveHeaderHeight();
                const isNearBottom = (window.innerHeight + scrollY) >= document.body.offsetHeight - 100;
                const isNearTop = scrollY < (sections.length > 0 && sections[0] ? sections[0].offsetTop - dynamicOffsetForFallback - 50 : (window.innerHeight * 0.3) - dynamicOffsetForFallback);


                if (isNearBottom && navLinks.length > 0) {
                    removeActiveClasses();
                    const lastLink = navLinks[navLinks.length - 1];
                    if (lastLink && sections[sections.length -1].id === lastLink.getAttribute('href').substring(1)) { // Ensure last link matches last section
                         lastLink.classList.add('active'); lastLink.setAttribute('aria-current', 'page');
                    }
                } else if (isNearTop && navLinks.length > 0) {
                    removeActiveClasses();
                    const firstLink = navLinks[0];
                    if (firstLink && sections[0].id === firstLink.getAttribute('href').substring(1)) { // Ensure first link matches first section
                        firstLink.classList.add('active'); firstLink.setAttribute('aria-current', 'page');
                    }
                } else {
                    // If no specific condition met, try to find the closest section from the top
                    let closestSectionId = null;
                    let smallestDistance = Infinity;
                    sections.forEach(section => {
                        const rect = section.getBoundingClientRect();
                        // Consider sections that are at or above the trigger line (currentScrollOffset + 20)
                        if (rect.top <= currentScrollOffset + 21 && rect.bottom > currentScrollOffset + 20) {
                             if (rect.top < smallestDistance) { // Prioritize the one closest to the top edge or fully visible
                                smallestDistance = rect.top;
                                closestSectionId = section.id;
                            }
                        }
                    });
                    if (closestSectionId) {
                        const activeLink = document.querySelector(`.navbar a.nav-link[href="#${closestSectionId}"]`);
                        if (activeLink) {
                            removeActiveClasses();
                            activeLink.classList.add('active');
                            activeLink.setAttribute('aria-current', 'page');
                        }
                    } else if (!latestIntersectingEntry && scrollY < 100 && navLinks.length > 0) { // Default to first if very top
                        removeActiveClasses();
                        navLinks[0].classList.add('active');
                        navLinks[0].setAttribute('aria-current', 'page');
                    }
                }
            }
        };
        scrollspyObserver = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => { if (section) scrollspyObserver.observe(section); });
    };

    initScrollspyObserver(); // Initialize on load

    // --- Loan Interest Calculator ---
    const calcForm = document.getElementById("calculator-form");
    if (calcForm) {
        const principalInput = document.getElementById("principal");
        const rateInput = document.getElementById("rate");
        const timeInput = document.getElementById("time");
        const resultDiv = document.getElementById("calc-result");
        const errorP = document.getElementById("calculator-error");

        calcForm.addEventListener("submit", function(event) {
            event.preventDefault();
            resultDiv.innerHTML = ""; // Clear previous results
            errorP.textContent = "";  // Clear previous errors

            const interestTypeInput = document.querySelector('input[name="interest_type"]:checked');
            const P = parseFloat(principalInput.value);
            const r_percent = parseFloat(rateInput.value);
            const t = parseFloat(timeInput.value);
            const interestType = interestTypeInput ? interestTypeInput.value : null;

            if (!interestType) {
                errorP.textContent = 'Please select an interest type.';
                return;
            }
            if (isNaN(P) || isNaN(r_percent) || isNaN(t) || P <= 0 || r_percent < 0 || t <= 0) {
                errorP.textContent = "Please enter valid positive numbers (Principal > 0, Rate >= 0, Time > 0).";
                return;
            }

            let interest = 0, totalAmount = 0, typeCalculated = "";
            const r = r_percent / 100; // Convert percentage to decimal

            if (interestType === 'simple') {
                interest = P * r * t;
                totalAmount = P + interest;
                typeCalculated = "Simple Interest";
            } else if (interestType === 'compound') {
                totalAmount = P * Math.pow((1 + r), t); // Annually compounded
                interest = totalAmount - P;
                typeCalculated = "Compound Interest (Annually)";
            }
            resultDiv.innerHTML = `<p><strong>Interest Type:</strong> ${typeCalculated}</p><p><strong>Estimated Interest:</strong> ₹ ${interest.toFixed(2)}</p><p><strong>Estimated Total Repayment:</strong> ₹ ${totalAmount.toFixed(2)}</p>`;
        });
    }

    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Dynamic Translate Link ---
    const translateLink = document.getElementById('translate-link-ta');
    if (translateLink) {
        const currentPageUrl = window.location.href;
        // Ensure the URL used for translation is the canonical one or the one you want translated
        // Remove hash for base page translation, then re-add if necessary (though Google Translate often handles this)
        const baseUrl = currentPageUrl.split('#')[0];
        const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=ta&hl=en&u=${encodeURIComponent(baseUrl)}`;
        translateLink.href = googleTranslateUrl;
        translateLink.target = '_self'; // Open in the same tab
    }

    // --- Scroll Reveal Animations for Elements ---
    const animatedElements = document.querySelectorAll('.fade-in-element');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve after animation if you want it to trigger only once
                // observer.unobserve(entry.target);
            }
            // Optional: remove 'is-visible' when element scrolls out of view (can be performance intensive)
            // else {
            //     entry.target.classList.remove('is-visible');
            // }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => { if(el) revealObserver.observe(el); });


    // --- Hero Slideshow ---
    const heroSlides = document.querySelectorAll('.hero-slideshow-container .hero-slide');
    let currentSlideIndex = 0;
    const slideIntervalTime = 5000; // Time in milliseconds (e.g., 5 seconds per slide)

    function showNextSlide() {
        if (heroSlides.length === 0) return; // No slides to show

        heroSlides[currentSlideIndex].classList.remove('active'); // Make current slide inactive (fade out)
        currentSlideIndex = (currentSlideIndex + 1) % heroSlides.length; // Move to next slide, loop to start
        heroSlides[currentSlideIndex].classList.add('active'); // Make new current slide active (fade in)
    }

    if (heroSlides.length > 1) { // Only start slideshow if there's more than one image
        // Show the first slide immediately without waiting for the interval
        if (heroSlides[0]) {
            heroSlides[0].classList.add('active');
        }
        setInterval(showNextSlide, slideIntervalTime);
    } else if (heroSlides.length === 1) {
        // If only one slide, just make it active
        if (heroSlides[0]) {
            heroSlides[0].classList.add('active');
        }
    }


    // --- Resize Handler for Dynamic Offsets and Observer Re-init ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const oldOffset = currentScrollOffset;
            updateScrollRelatedPaddings(); // This updates currentScrollOffset
            // Only re-init if offset changed significantly enough to affect scrollspy
            if (Math.abs(currentScrollOffset - oldOffset) > 5) {
                // console.log("Re-initializing scrollspy observer due to resize. New Offset:", currentScrollOffset);
                initScrollspyObserver();
            }
        }, 250); // Debounce resize event to avoid excessive re-calculations
    });

}); // End DOMContentLoaded