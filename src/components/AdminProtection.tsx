import React, { useEffect, useState } from 'react';
import { configUtils } from '@/core/config';
import { auth, onAuthStateChanged } from '@/core/firebase/config';
import { isAdminEmail } from '@/features/admin/configService';

interface AdminProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}



export default function AdminProtection({ children, fallback }: AdminProtectionProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Timeout para evitar cargas infinitas
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Tiempo de verificación agotado');
        setLoading(false);
      }
    }, 10000); // 10 segundos timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user?.email) {
          // Intentar usar configuración dinámica primero, con fallback a estática
          let adminStatus: boolean;
          try {
            adminStatus = await isAdminEmail(user.email);
            console.log('Admin verification (dynamic):', { email: user.email, isAdmin: adminStatus });
          } catch (dynamicError) {
            console.warn('Dynamic admin check failed, using static config:', dynamicError);
            try {
              adminStatus = configUtils.isAdminEmail(user.email);
              console.log('Admin verification (static):', { email: user.email, isAdmin: adminStatus });
            } catch (staticError) {
              console.error('Both dynamic and static admin checks failed:', staticError);
              setError('Error en la verificación de permisos');
              setIsAdmin(false);
              return;
            }
          }
          
          setIsAdmin(adminStatus);
          setError(null);
        } else {
          setIsAdmin(false);
          setError(null);
          console.log('No user authenticated');
        }
      } catch (error) {
        console.error('Error verificando estado de admin:', error);
        setError('Error en la verificación de permisos');
        setIsAdmin(false);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  if (error) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">Error de Verificación</h2>
        <p className="text-yellow-700 text-center max-w-md mb-4">
          {error}. Por favor, recarga la página o contacta al administrador del sistema.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Recargar
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 border border-red-200 rounded-lg p-8">
        <div className="text-red-600 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
        <p className="text-red-700 text-center max-w-md">
          No tienes permisos para acceder a esta sección. Solo los administradores pueden ver este contenido.
              </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  return <>{children}</>;
} 