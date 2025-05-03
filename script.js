// script.js - FINAL - Includes Translate Link Logic, Correct Scrollspy Offset

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const isExpanded = navbar.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.innerHTML = isExpanded ? '✕' : '☰'; // Change icon
        });
        // Close mobile menu when a link is clicked
        document.querySelectorAll('.navbar a.nav-link').forEach(link => { // More specific selector
            link.addEventListener('click', () => {
                if (navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.innerHTML = '☰';
                }
            });
        });
    }

    // --- Active Nav Link Highlighting on Scroll ---
    const navLinks = document.querySelectorAll('.navbar a.nav-link[href^="#"]'); // More specific selector
    const sections = document.querySelectorAll('main section[id]');
    const header = document.getElementById('header');
    const topBar = document.getElementById('top-bar');

    const getEffectiveHeaderHeight = () => {
        // Check visibility using computed style as display:none removes offsetHeight
        const topBarVisible = topBar && window.getComputedStyle(topBar).display !== 'none';
        // Ensure elements exist before getting offsetHeight
        const topBarHeight = topBarVisible ? topBar.offsetHeight : 0;
        const mainHeaderHeight = header ? header.offsetHeight : 0;
        // If header height becomes auto on mobile wrap, get scrollHeight (might be less accurate)
        // const currentMainHeaderHeight = (header && window.getComputedStyle(header).height === 'auto') ? header.scrollHeight : mainHeaderHeight;
        return mainHeaderHeight + topBarHeight;
    };

    let currentScrollOffset = getEffectiveHeaderHeight(); // Initial calculation

    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
    };

    // Define observer options dynamically based on initial offset
    let observerOptions = {
        root: null,
        rootMargin: `-${currentScrollOffset + 20}px 0px -45% 0px`, // Increased top margin
        threshold: 0
    };

    const observerCallback = (entries) => {
        let latestIntersectingEntry = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the section that is most visible near the top edge accounting for header
                if (!latestIntersectingEntry || entry.boundingClientRect.top < latestIntersectingEntry.boundingClientRect.top) {
                    latestIntersectingEntry = entry;
                }
            }
        });

        // Fallback logic needs dynamic offset
        const dynamicOffset = getEffectiveHeaderHeight();

        if (latestIntersectingEntry) {
            const id = latestIntersectingEntry.target.getAttribute('id');
            const activeLink = document.querySelector(`.navbar a.nav-link[href="#${id}"]`);
            if (activeLink) {
                removeActiveClasses();
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
            }
        } else {
             // Fallback when no section is intersecting according to rootMargin
             const scrollY = window.scrollY;
             const isNearBottom = (window.innerHeight + scrollY) >= document.body.offsetHeight - 100;
             const isNearTop = scrollY < (window.innerHeight * 0.3) - dynamicOffset; // Use dynamic offset

              if (isNearBottom && navLinks.length > 0) {
                 removeActiveClasses();
                 const lastLink = navLinks[navLinks.length - 1];
                 if(lastLink) { lastLink.classList.add('active'); lastLink.setAttribute('aria-current', 'page'); }
              } else if (isNearTop && navLinks.length > 0) {
                 removeActiveClasses();
                  const firstLink = navLinks[0];
                  if(firstLink) { firstLink.classList.add('active'); firstLink.setAttribute('aria-current', 'page'); }
              } else {
                  // If not near top or bottom, and nothing intersecting, remove active classes
                  removeActiveClasses();
              }
        }
    };

    let observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => { if (section) observer.observe(section); });

    // Recalculate offset and potentially re-observe on resize
     let resizeTimeout;
     window.addEventListener('resize', () => {
         clearTimeout(resizeTimeout);
         resizeTimeout = setTimeout(() => {
             const newOffset = getEffectiveHeaderHeight();
             // Only re-init observer if offset significantly changes (more performant)
             if (Math.abs(newOffset - currentScrollOffset) > 5) {
                 console.log("Re-initializing observer due to resize. New Offset:", newOffset);
                 currentScrollOffset = newOffset;
                 observerOptions.rootMargin = `-${currentScrollOffset + 20}px 0px -45% 0px`;
                 observer.disconnect(); // Disconnect old one
                 observer = new IntersectionObserver(observerCallback, observerOptions); // Create new one
                 sections.forEach(section => { if (section) observer.observe(section); }); // Re-observe
             }
         }, 250); // Debounce resize event
     });


    // --- Loan Interest Calculator ---
    const calcButton = document.getElementById("calc-button");
    if (calcButton) {
        const principalInput = document.getElementById("principal"); const rateInput = document.getElementById("rate"); const timeInput = document.getElementById("time"); const resultDiv = document.getElementById("calc-result"); const errorP = document.getElementById("calculator-error");
        calcButton.addEventListener("click", function(event) { event.preventDefault(); const interestTypeInput = document.querySelector('input[name="interest_type"]:checked'); resultDiv.innerHTML = ""; errorP.textContent = ""; const P = parseFloat(principalInput.value), r_percent = parseFloat(rateInput.value), t = parseFloat(timeInput.value); const interestType = interestTypeInput ? interestTypeInput.value : null; if (!interestType) { errorP.textContent = 'Please select an interest type.'; return; } if (isNaN(P) || isNaN(r_percent) || isNaN(t) || P <= 0 || r_percent < 0 || t <= 0) { errorP.textContent = "Please enter valid positive numbers (Principal > 0, Rate >= 0, Time > 0)."; return; } let interest = 0, totalAmount = 0, typeCalculated = ""; const r = r_percent / 100; if (interestType === 'simple') { interest = P * r * t; totalAmount = P + interest; typeCalculated = "Simple Interest"; } else if (interestType === 'compound') { totalAmount = P * Math.pow((1 + r), t); interest = totalAmount - P; typeCalculated = "Compound Interest (Annually)"; } resultDiv.innerHTML = `<p><strong>Interest Type:</strong> ${typeCalculated}</p><p><strong>Estimated Interest:</strong> ₹ ${interest.toFixed(2)}</p><p><strong>Estimated Total Repayment:</strong> ₹ ${totalAmount.toFixed(2)}</p>`; });
    }


    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Dynamic Translate Link ---
    const translateLink = document.getElementById('translate-link-ta');
    if (translateLink) {
        const currentPageUrl = window.location.href;
        const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=ta&hl=en&u=${encodeURIComponent(currentPageUrl)}`; // Added hl=en for consistency
        translateLink.href = googleTranslateUrl;
        // Setting target to '_self' explicitly to ensure inline opening
        translateLink.target = '_self';
        // Noopener/noreferrer not strictly needed for same-tab links but doesn't hurt
        // translateLink.rel = "noopener noreferrer";
    }

}); // End DOMContentLoaded