// script.js - No Visitor Counter

document.addEventListener('DOMContentLoaded', () => {

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
        document.querySelectorAll('.navbar a').forEach(link => {
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
    const topBarHeight = (window.getComputedStyle(document.getElementById('top-bar')).display !== 'none') ? (document.getElementById('top-bar')?.offsetHeight || 0) : 0;
    const mainHeaderHeight = header?.offsetHeight || 70;
    const totalFixedHeaderHeight = topBarHeight + mainHeaderHeight;
    const removeActiveClasses = () => { navLinks.forEach(link => { link.classList.remove('active'); link.removeAttribute('aria-current'); }); };
    const observerOptions = { root: null, rootMargin: `-${(window.innerWidth <= 768 ? mainHeaderHeight : totalFixedHeaderHeight) + 10}px 0px -45% 0px`, threshold: 0 };
    const observer = new IntersectionObserver((entries) => { /* ... observer logic ... */ });
    sections.forEach(section => { if (section) observer.observe(section); });

    // --- Loan Interest Calculator ---
    const calcButton = document.getElementById("calc-button");
    if (calcButton) { /* ... calculator logic ... */ }

    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

}); // End DOMContentLoaded
