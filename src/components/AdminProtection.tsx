import React from 'react';
import { useAuth } from '@/core/hooks/useAuth';
import { useRBAC, usePermissions, useRoleCheck } from '@/features/admin/hooks/useRBAC';
import type { Permission, AdminRole } from '@/features/admin/roles/types';

interface AdminProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Nuevas opciones para control granular
  requiredPermissions?: Permission[];
  allowedRoles?: AdminRole[];
  requireAll?: boolean; // true = todas las permissions, false = cualquiera
  showRoleInfo?: boolean; // Mostrar información del rol del usuario
}

export default function AdminProtection({ 
  children, 
  fallback,
  requiredPermissions,
  allowedRoles,
  requireAll = true,
  showRoleInfo = false
}: AdminProtectionProps) {
  const { isAdmin: legacyIsAdmin } = useAuth(); // Sistema anterior
  const rbac = useRBAC();
  
  // Si se especifican permisos específicos, usar hook de permisos
  const permissionCheck = usePermissions(requiredPermissions || []);
  
  // Si se especifican roles específicos, usar hook de roles
  const roleCheck = useRoleCheck(allowedRoles || []);

  // Determinar si está cargando
  const loading = rbac.loading || 
    (requiredPermissions && permissionCheck.loading) ||
    (allowedRoles && roleCheck.loading);

  // Determinar el error
  const error = rbac.error;

  // Determinar si tiene acceso
  const hasAccess = () => {
    // Si hay error, denegar acceso
    if (error) return false;

    // Si hay rol RBAC, usar sistema nuevo
    if (rbac.userRole) {
      // Si se especifican roles específicos
      if (allowedRoles && allowedRoles.length > 0) {
        if (!roleCheck.isAllowed) return false;
      }

      // Si se especifican permisos específicos
      if (requiredPermissions && requiredPermissions.length > 0) {
        if (requireAll) {
          if (!permissionCheck.hasAll) return false;
        } else {
          if (!permissionCheck.hasAny) return false;
        }
      }

      return true;
    }

    // Fallback al sistema anterior si no hay rol RBAC pero es admin legacy
    if (!rbac.userRole && legacyIsAdmin && !rbac.loading) {
      // Si se especifican restricciones específicas y no hay rol RBAC,
      // solo permitir acceso básico (sin permisos/roles específicos)
      if (requiredPermissions && requiredPermissions.length > 0) return false;
      if (allowedRoles && allowedRoles.length > 0) return false;
      
      return true; // Admin legacy puede acceder a funciones básicas
    }

    return false;
  };

  // Componente de loading mejorado
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-300 text-sm mt-2">
          {requiredPermissions ? 'Verificando permisos...' : 'Verificando acceso...'}
        </span>
      </div>
    );
  }

  // Manejo de errores mejorado
  if (error) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-yellow-800/20 border border-yellow-600/30 rounded-lg p-8">
        <div className="text-yellow-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-yellow-300 mb-2">Error de Verificación</h2>
        <p className="text-yellow-200 text-center max-w-md mb-4">
          {error}. Por favor, recarga la página o contacta al administrador del sistema.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => rbac.refresh()}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Reintentar
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

  // Verificar acceso
  const hasUserAccess = hasAccess();
  
  // Caso especial: Admin legacy que necesita migración
  const needsMigration = !rbac.userRole && legacyIsAdmin && !rbac.loading && !error;

  if (!hasUserAccess && !needsMigration) {
    const getDenialMessage = () => {
      if (!rbac.userRole) {
        return 'No tienes permisos administrativos para acceder a esta sección.';
      }
      
      if (allowedRoles && allowedRoles.length > 0 && !roleCheck.isAllowed) {
        return `Tu rol actual (${rbac.roleDefinition?.name}) no tiene acceso a esta funcionalidad.`;
      }
      
      if (requiredPermissions && requiredPermissions.length > 0) {
        const missingPerms = requiredPermissions.filter(p => !rbac.hasPermission(p));
        return `Te faltan los siguientes permisos: ${missingPerms.join(', ')}`;
      }
      
      return 'No tienes los permisos necesarios para acceder a esta funcionalidad.';
    };

    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-900/20 border border-red-600/30 rounded-lg p-8">
        <div className="text-red-400 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-300 mb-2">Acceso Denegado</h2>
        <p className="text-red-200 text-center max-w-md mb-4">
          {getDenialMessage()}
        </p>
        
        {/* Mostrar información del rol si está habilitado */}
        {showRoleInfo && rbac.userRole && (
          <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
            <p className="text-gray-300 text-sm">
              <strong>Rol actual:</strong> {rbac.roleDefinition?.name || rbac.userRole.role}
            </p>
            {rbac.roleDefinition?.description && (
              <p className="text-gray-400 text-xs mt-1">
                {rbac.roleDefinition.description}
              </p>
            )}
          </div>
        )}
        
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Panel Principal
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

  // Mensaje especial para admins legacy que necesitan migración
  if (needsMigration) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-8">
          <div className="text-blue-300 text-6xl mb-4 text-center">🔄</div>
          <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">
            Migración de Sistema Requerida
          </h2>
          <div className="text-blue-200 space-y-4 mb-6">
            <p className="text-center">
              <strong>¡Hola Alexander!</strong> Tu cuenta de administrador necesita ser migrada al nuevo sistema RBAC.
            </p>
            <p className="text-center">
              Esto es un proceso único que transferirá tus permisos al sistema mejorado.
            </p>
          </div>
          
          <div className="bg-blue-800/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-200 font-medium mb-3">🚀 Pasos para migrar:</h3>
            <ol className="text-blue-200 text-sm space-y-2">
              <li><strong>1.</strong> Abre la consola del navegador (F12)</li>
              <li><strong>2.</strong> Ejecuta: <code className="bg-blue-700/50 px-2 py-1 rounded text-xs">checkMigrationStatus()</code></li>
              <li><strong>3.</strong> Ejecuta: <code className="bg-blue-700/50 px-2 py-1 rounded text-xs">migrateAdminRoles()</code></li>
              <li><strong>4.</strong> Recarga la página</li>
            </ol>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                // Exponer funciones de migración en window
                import('../features/admin/scripts/migrateAdminRoles').then(module => {
                  (window as any).checkMigrationStatus = module.checkMigrationStatus;
                  (window as any).migrateAdminRoles = module.migrateAdminRoles;
                  alert('✅ Funciones de migración cargadas. Abre la consola (F12) y ejecuta los comandos.');
                });
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔧 Cargar Herramientas de Migración
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              🔄 Recargar Página
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-blue-300 text-sm">
              📧 Tu email: <strong>alexandersilvera@hotmail.com</strong> está configurado como administrador.
            </p>
            <p className="text-blue-400 text-xs mt-2">
              Este mensaje desaparecerá después de la migración.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar children con información adicional si se solicita
  return (
    <>
      {showRoleInfo && rbac.userRole && (
        <div className="mb-4 p-3 bg-green-800/20 border border-green-600/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm font-medium">
              {rbac.roleDefinition?.name || rbac.userRole.role}
            </span>
            <span className="text-gray-400 text-xs">
              • Nivel {rbac.getRoleLevel()}
            </span>
          </div>
        </div>
      )}
      {children}
    </>
  );
} 