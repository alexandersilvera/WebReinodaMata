import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../core/firebase/config';

/**
 * Componente para rastrear vistas de página y enviar la información a Firebase
 * Se debe incluir en el MainLayout para rastrear todas las páginas
 */
export default function PageViewTracker() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const recordPageView = async () => {
      try {
        // Obtener información de la página actual
        const path = window.location.pathname;
        const referrer = document.referrer;
        const userAgent = navigator.userAgent;

        // Llamar a la función de Cloud Functions
        const recordPageViewFn = httpsCallable<
          { path: string; referrer: string; userAgent: string },
          { success: boolean }
        >(functions, 'recordPageView');

        await recordPageViewFn({
          path,
          referrer,
          userAgent
        });

        // No necesitamos manejar la respuesta, solo registrar en caso de error
      } catch (error) {
        // No mostrar errores al usuario, solo registrar en la consola
        console.error('Error al registrar vista de página:', error);
      }
    };

    // Registrar vista de página al cargar el componente
    recordPageView();

    // Escuchar cambios en la ruta para SPA (aplicaciones de una sola página)
    // Esto es útil si el sitio utiliza algún router del lado del cliente
    const handleRouteChange = () => {
      recordPageView();
    };

    // Configurar la escucha de cambios en la historia del navegador
    window.addEventListener('popstate', handleRouteChange);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Este componente no renderiza nada
  return null;
} 