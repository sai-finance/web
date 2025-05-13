// script.js - Enhanced Version

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
        // body padding-top is set via CSS using vars for initial load,
        // but if header height changes drastically and dynamically, this could also be adjusted.
        // For now, CSS fixed padding-top on body is: calc(var(--top-bar-height) + var(--header-height))
        // which refers to the *defined* header height, not its dynamic offsetHeight if it wraps.
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
            menuToggle.innerHTML = isExpanded ? '✕' : '☰';
        });
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
            rootMargin: `-${currentScrollOffset + 20}px 0px -45% 0px`,
            threshold: 0
        };

        const observerCallback = (entries) => {
            let latestIntersectingEntry = null;
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
                const scrollY = window.scrollY;
                const dynamicOffsetForFallback = getEffectiveHeaderHeight(); // Recalculate for fallback accuracy
                const isNearBottom = (window.innerHeight + scrollY) >= document.body.offsetHeight - 100;
                const isNearTop = scrollY < (window.innerHeight * 0.3) - dynamicOffsetForFallback;

                if (isNearBottom && navLinks.length > 0) {
                    removeActiveClasses();
                    const lastLink = navLinks[navLinks.length - 1];
                    if(lastLink) { lastLink.classList.add('active'); lastLink.setAttribute('aria-current', 'page'); }
                } else if (isNearTop && navLinks.length > 0) {
                    removeActiveClasses();
                    const firstLink = navLinks[0];
                    if(firstLink) { firstLink.classList.add('active'); firstLink.setAttribute('aria-current', 'page'); }
                } else {
                    removeActiveClasses();
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
            const r = r_percent / 100;

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
        const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=ta&hl=en&u=${encodeURIComponent(currentPageUrl.split('#')[0])}`; // Remove hash for base page translation
        translateLink.href = googleTranslateUrl;
        translateLink.target = '_self'; // Open in the same tab as per original logic
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
            // Optional: remove 'is-visible' when element scrolls out of view
            // else {
            //     entry.target.classList.remove('is-visible');
            // }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => revealObserver.observe(el));


    // --- Resize Handler for Dynamic Offsets and Observer Re-init ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const oldOffset = currentScrollOffset;
            updateScrollRelatedPaddings(); // This updates currentScrollOffset
            if (Math.abs(currentScrollOffset - oldOffset) > 5) { // Only re-init if offset changed significantly
                console.log("Re-initializing scrollspy observer due to resize. New Offset:", currentScrollOffset);
                initScrollspyObserver();
            }
        }, 250); // Debounce resize event
    });

}); // End DOMContentLoaded