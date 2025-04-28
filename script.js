// script.js - Visitor Counter Removed

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
        document.querySelectorAll('.navbar a').forEach(link => { // Close on link click
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
    const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
    const sections = document.querySelectorAll('main section[id]');
    const header = document.getElementById('header');
    // Adjust for single fixed header height (as top bar is hidden on mobile)
    const headerHeight = header?.offsetHeight || 70;
     const topBarHeight = document.getElementById('top-bar')?.offsetHeight || 0;
     // Calculate effective offset based on screen width
     const scrollOffset = window.innerWidth <= 768 ? headerHeight : headerHeight + topBarHeight;


    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
    };

    // Adjust rootMargin based on effective fixed height
    const observerOptions = {
        root: null,
        rootMargin: `-${scrollOffset + 10}px 0px -45% 0px`,
        threshold: 0
    };


    const observer = new IntersectionObserver((entries) => { // Observer logic remains same
        let latestIntersectingEntry = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!latestIntersectingEntry || entry.boundingClientRect.top < latestIntersectingEntry.boundingClientRect.top) {
                    latestIntersectingEntry = entry;
                }
            }
        });
        if (latestIntersectingEntry) { /* ... update active link ... */
            const id = latestIntersectingEntry.target.getAttribute('id');
            const activeLink = document.querySelector(`.navbar a[href="#${id}"]`);
            if (activeLink) {
                removeActiveClasses();
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
            }
        } else { /* ... fallback logic ... */
             const scrollY = window.scrollY;
              const isNearBottom = (window.innerHeight + scrollY) >= document.body.offsetHeight - 100;
              // Adjust near top check for effective fixed header height
              const isNearTop = scrollY < (window.innerHeight * 0.3) - scrollOffset;

              if (isNearBottom && navLinks.length > 0) {
                 removeActiveClasses();
                 const lastLink = navLinks[navLinks.length - 1];
                 if(lastLink) { lastLink.classList.add('active'); lastLink.setAttribute('aria-current', 'page'); }
              } else if (isNearTop && navLinks.length > 0) {
                 removeActiveClasses();
                  const firstLink = navLinks[0];
                  if(firstLink) { firstLink.classList.add('active'); firstLink.setAttribute('aria-current', 'page'); }
              }
        }
    }, observerOptions);
    sections.forEach(section => { if (section) observer.observe(section); });


    // --- Loan Interest Calculator (Simple & Compound) ---
    const calcButton = document.getElementById("calc-button"); // Calculator logic remains same
    if (calcButton) { /* ... calculator event listener ... */
        const principalInput = document.getElementById("principal");
        const rateInput = document.getElementById("rate");
        const timeInput = document.getElementById("time");
        const resultDiv = document.getElementById("calc-result");
        const errorP = document.getElementById("calculator-error");
        calcButton.addEventListener("click", function(event) {
            event.preventDefault();
            const interestTypeInput = document.querySelector('input[name="interest_type"]:checked');
            resultDiv.innerHTML = ""; errorP.textContent = "";
            const P = parseFloat(principalInput.value), r_percent = parseFloat(rateInput.value), t = parseFloat(timeInput.value);
            const interestType = interestTypeInput ? interestTypeInput.value : null;
            if (!interestType) { errorP.textContent = 'Please select an interest type.'; return; }
            if (isNaN(P) || isNaN(r_percent) || isNaN(t) || P <= 0 || r_percent < 0 || t <= 0) { errorP.textContent = "Please enter valid positive numbers (Principal > 0, Rate >= 0, Time > 0)."; return; }
            let interest = 0, totalAmount = 0, typeCalculated = ""; const r = r_percent / 100;
            if (interestType === 'simple') { interest = P * r * t; totalAmount = P + interest; typeCalculated = "Simple Interest"; }
            else if (interestType === 'compound') { totalAmount = P * Math.pow((1 + r), t); interest = totalAmount - P; typeCalculated = "Compound Interest (Annually)"; }
            resultDiv.innerHTML = `<p><strong>Interest Type:</strong> ${typeCalculated}</p><p><strong>Estimated Interest:</strong> ₹ ${interest.toFixed(2)}</p><p><strong>Estimated Total Repayment:</strong> ₹ ${totalAmount.toFixed(2)}</p>`;
        });
    }

    // --- Visitor Counter Section REMOVED ---


    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded
