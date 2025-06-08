// nav-client.js

function setupMobileMenu() {
    console.log('setupMobileMenu ejecutado');
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuToggle && mobileMenu) {
        // Eliminar cualquier evento anterior para evitar duplicados
        menuToggle.onclick = function() {
            console.log('Botón hamburguesa clickeado');
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            }
            return false; // Prevenir comportamiento por defecto
        };
        console.log('Evento de click asignado al botón hamburguesa');
    } else {
        console.warn('No se encontró menu-toggle o mobile-menu');
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', setupMobileMenu);

// También ejecutar cuando Astro haga navegación entre páginas
if (typeof document !== 'undefined') {
    document.addEventListener('astro:page-load', setupMobileMenu);
}