// nav-client.js

function setupMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuToggle && mobileMenu) {
        menuToggle.onclick = null;
        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
            mobileMenu.classList.toggle("flex");
        });
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setupMobileMenu);
    document.addEventListener('astro:page-load', setupMobileMenu);
} 