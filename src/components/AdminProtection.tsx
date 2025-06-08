import React, { useEffect, useState } from 'react';
import { configUtils } from '@/core/config';
import { auth, onAuthStateChanged } from '@/core/firebase/config';

interface AdminProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminProtection({ children, fallback }: AdminProtectionProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user?.email) {
          const adminStatus = configUtils.isAdminEmail(user.email);
          setIsAdmin(adminStatus);
          console.log('Admin verification:', { email: user.email, isAdmin: adminStatus });
        } else {
          setIsAdmin(false);
          console.log('No user authenticated');
        }
      } catch (error) {
        console.error('Error verificando estado de admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
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