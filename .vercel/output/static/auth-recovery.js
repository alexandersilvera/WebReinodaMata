// auth-recovery.js - Script de recuperación global para sesión de usuario
// Este script se ejecuta en cada página para asegurar que la UI refleje el estado de autenticación

(function() {
    console.log('[AuthRecovery] Script de recuperación global iniciado');
    
    // Intentamos recuperar datos del localStorage en cada carga de página
    function syncUIWithStoredProfile() {
        try {
            const savedProfile = localStorage.getItem('userProfileData');
            if (!savedProfile) {
                console.log('[AuthRecovery] No hay datos de perfil guardados');
                return;
            }
            
            const profileData = JSON.parse(savedProfile);
            const now = new Date().getTime();
            const savedTime = profileData.timestamp || 0;
            
            // Verificar si los datos son recientes (menos de 24 horas)
            if (now - savedTime > 24 * 3600000) {
                console.log('[AuthRecovery] Datos guardados demasiado antiguos, limpiando');
                localStorage.removeItem('userProfileData');
                return;
            }
            
            console.log('[AuthRecovery] Datos de perfil encontrados:', profileData);
            
            // Actualizar avatares independientemente del estado de Firebase Auth
            const userAvatarDesktop = document.getElementById('user-avatar-desktop');
            const userAvatarMobile = document.getElementById('user-avatar-mobile');
            const authLinksDesktop = document.getElementById('auth-links-desktop');
            const userInfoDesktop = document.getElementById('user-info-desktop');
            const authLinksMobile = document.getElementById('auth-links-mobile');
            const userInfoMobile = document.getElementById('user-info-mobile');
            
            // Actualizar avatares si existen
            if (userAvatarDesktop && profileData.photoURL) {
                userAvatarDesktop.src = profileData.photoURL;
                console.log('[AuthRecovery] Avatar de escritorio actualizado');
            }
            if (userAvatarMobile && profileData.photoURL) {
                userAvatarMobile.src = profileData.photoURL;
                console.log('[AuthRecovery] Avatar móvil actualizado');
            }
            
            // Mostrar UI de usuario autenticado si los elementos existen
            if (authLinksDesktop && userInfoDesktop) {
                authLinksDesktop.classList.add('hidden');
                userInfoDesktop.classList.remove('hidden');
                console.log('[AuthRecovery] UI de escritorio actualizada a autenticado');
            }
            if (authLinksMobile && userInfoMobile) {
                authLinksMobile.classList.add('hidden');
                userInfoMobile.classList.remove('hidden');
                console.log('[AuthRecovery] UI móvil actualizada a autenticado');
            }
        } catch (error) {
            console.error('[AuthRecovery] Error al sincronizar UI con perfil guardado:', error);
        }
    }
    
    // Ejecutar sincronización cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncUIWithStoredProfile);
    } else {
        syncUIWithStoredProfile();
    }
    
    // Volver a intentar después de un tiempo para manejar componentes cargados dinámicamente
    setTimeout(syncUIWithStoredProfile, 500);
    
    // También ejecutar en cada navegación de Astro
    document.addEventListener('astro:page-load', () => {
        console.log('[AuthRecovery] Evento astro:page-load detectado');
        syncUIWithStoredProfile();
        // Ejecutar nuevamente para componentes cargados dinámicamente
        setTimeout(syncUIWithStoredProfile, 300);
    });
    
    // Para manejar casos específicos donde hay problemas con los eventos de Astro
    // establecemos un intervalo corto para verificar la sincronización varias veces
    const checkInterval = setInterval(() => {
        syncUIWithStoredProfile();
    }, 2000);
    
    // Detener el intervalo después de 10 segundos (5 verificaciones)
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log('[AuthRecovery] Vigilancia de sincronización finalizada');
    }, 10000);
})(); 