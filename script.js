// script.js - Updated Visitor Counter using SPECIFIC npoint.io URL

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
    const headerHeight = header ? header.offsetHeight : 70; // Use dynamic or default height

    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: `-${window.innerWidth <= 768 ? 10 : headerHeight + 10}px 0px -45% 0px`,
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
              const isNearTop = scrollY < window.innerHeight * 0.3;
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

    // --- Visitor Counter (Using npoint.io) ---
    const visitorCountElement = document.getElementById('visitor-counter');
    // !! Using the specific URL provided by the user !!
    const npointUrl = 'https://api.npoint.io/c936fa1da5716ef5ada9'; // Your Specific URL

    async function updateVisitorCount() {
        if (!visitorCountElement) {
            console.error("Visitor count element not found (#visitor-counter). Check HTML Footer ID.");
            return;
        }
        // No need for placeholder check now

        visitorCountElement.textContent = "Loading..."; // Initial state

        try {
            // 1. GET current count
            const getResponse = await fetch(npointUrl);
            if (!getResponse.ok) {
                // Provide more context in the error
                throw new Error(`npoint GET failed for ${npointUrl}: ${getResponse.status} ${getResponse.statusText}`);
            }
            const data = await getResponse.json();

            // Ensure data has the expected structure
            if (typeof data !== 'object' || data === null || typeof data.visits !== 'number') {
                console.error("npoint data format unexpected:", data);
                throw new Error("Incorrect data format received from npoint.");
            }

            // 2. Increment count
            const currentCount = data.visits;
            const newCount = currentCount + 1;

            // 3. Display new count IMMEDIATELY (optimistic update)
            visitorCountElement.textContent = newCount.toLocaleString('en-IN');

            // 4. PUT the updated count back
            const updatedData = { visits: newCount };

            const putResponse = await fetch(npointUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!putResponse.ok) {
                // Log error but don't change displayed count as it was optimistic
                console.error(`npoint PUT failed for ${npointUrl}: ${putResponse.status} ${putResponse.statusText}`);
                // Optionally add a subtle visual indicator of save failure if desired
                // visitorCountElement.style.color = 'orange'; // Example
            } else {
                // Optional: Confirm successful update in console
                // console.log("npoint count updated successfully to:", newCount);
            }

        } catch (error) {
            console.error('Error updating visitor count:', error);
            visitorCountElement.textContent = "N/A"; // Show error state
        }
    }

    // Call the function to update count when the page loads
    updateVisitorCount();


    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded