/**
 * Hook personalizado para manejo de roles y permisos (RBAC)
 * Proporciona una interfaz reactiva para el sistema de permisos
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/core/hooks/useAuth';
import RBACService from '../roles/rbacService';
import { 
  AdminRole, 
  Permission,
  type UserRole,
  type RoleDefinition,
  type PermissionCheck 
} from '../roles/types';

interface UseRBACReturn {
  // Estado del usuario
  userRole: UserRole | null;
  roleDefinition: RoleDefinition | null;
  loading: boolean;
  error: string | null;
  
  // Verificaciones de permisos
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canPerformAction: (check: PermissionCheck) => Promise<boolean>;
  
  // Información del rol
  isRole: (role: AdminRole) => boolean;
  isSuperAdmin: boolean;
  isContentManager: boolean;
  isSubscriberManager: boolean;
  isAnalyticsViewer: boolean;
  isReadOnly: boolean;
  
  // Utilidades
  getRoleLevel: () => number;
  canManageRole: (targetRole: AdminRole) => boolean;
  refresh: () => Promise<void>;
  
  // Permisos específicos comunes
  canReadArticles: boolean;
  canWriteArticles: boolean;
  canDeleteArticles: boolean;
  canPublishArticles: boolean;
  canReadSubscribers: boolean;
  canWriteSubscribers: boolean;
  canDeleteSubscribers: boolean;
  canSendNewsletter: boolean;
  canReadMetrics: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canAccessSettings: boolean;
  canReadAudit: boolean;
}

export function useRBAC(): UseRBACReturn {
  const { user, isAdmin } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar rol del usuario
  const loadUserRole = useCallback(async () => {
    if (!user?.email) {
      setUserRole(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const role = await RBACService.getUserRole(user.email);
      setUserRole(role);
      
      if (!role && isAdmin) {
        // Si es admin pero no tiene rol asignado, crear rol de emergencia
        console.warn('Admin user without RBAC role, using fallback');
        const fallbackRole: UserRole = {
          email: user.email,
          role: AdminRole.SUPER_ADMIN,
          assignedBy: 'fallback',
          assignedAt: new Date(),
          isActive: true
        };
        setUserRole(fallbackRole);
      }
    } catch (err: any) {
      console.error('Error loading user role:', err);
      
      // Si es error de permisos de Firestore, usar fallback silencioso
      if (err.code === 'permission-denied') {
        console.warn('RBAC collection not accessible, using legacy admin system');
        setError(null); // No mostrar error, usar sistema anterior
      } else {
        setError(err.message || 'Error al cargar permisos');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email, isAdmin]);

  // Cargar rol al montar y cuando cambie el usuario
  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  // Función de refresh
  const refresh = useCallback(async () => {
    await loadUserRole();
  }, [loadUserRole]);

  // Obtener definición del rol
  const roleDefinition = useMemo(() => {
    return userRole ? RBACService.getRoleDefinition(userRole.role) : null;
  }, [userRole]);

  // Verificar permiso individual
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!userRole || !roleDefinition) return false;
    
    const allPermissions = RBACService.getRolePermissions(userRole.role);
    return allPermissions.includes(permission);
  }, [userRole, roleDefinition]);

  // Verificar si tiene cualquiera de los permisos
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // Verificar si tiene todos los permisos
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Verificar acción específica (async para verificaciones complejas)
  const canPerformAction = useCallback(async (check: PermissionCheck): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      return await RBACService.canPerformAction(user.email, check);
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  }, [user?.email]);

  // Verificaciones de rol específico
  const isRole = useCallback((role: AdminRole): boolean => {
    return userRole?.role === role;
  }, [userRole]);

  // Roles específicos
  const isSuperAdmin = useMemo(() => isRole(AdminRole.SUPER_ADMIN), [isRole]);
  const isContentManager = useMemo(() => isRole(AdminRole.CONTENT_MANAGER), [isRole]);
  const isSubscriberManager = useMemo(() => isRole(AdminRole.SUBSCRIBER_MANAGER), [isRole]);
  const isAnalyticsViewer = useMemo(() => isRole(AdminRole.ANALYTICS_VIEWER), [isRole]);
  const isReadOnly = useMemo(() => isRole(AdminRole.READONLY), [isRole]);

  // Obtener nivel del rol
  const getRoleLevel = useCallback((): number => {
    return roleDefinition?.level || 0;
  }, [roleDefinition]);

  // Verificar si puede gestionar otro rol
  const canManageRole = useCallback((targetRole: AdminRole): boolean => {
    if (!userRole) return false;
    return RBACService.canManageRole(userRole.role, targetRole);
  }, [userRole]);

  // Permisos específicos comunes (memoizados para performance)
  const canReadArticles = useMemo(() => 
    hasPermission(Permission.ARTICLES_READ), [hasPermission]);
  
  const canWriteArticles = useMemo(() => 
    hasPermission(Permission.ARTICLES_WRITE), [hasPermission]);
  
  const canDeleteArticles = useMemo(() => 
    hasPermission(Permission.ARTICLES_DELETE), [hasPermission]);
  
  const canPublishArticles = useMemo(() => 
    hasPermission(Permission.ARTICLES_PUBLISH), [hasPermission]);
  
  const canReadSubscribers = useMemo(() => 
    hasPermission(Permission.SUBSCRIBERS_READ), [hasPermission]);
  
  const canWriteSubscribers = useMemo(() => 
    hasPermission(Permission.SUBSCRIBERS_WRITE), [hasPermission]);
  
  const canDeleteSubscribers = useMemo(() => 
    hasPermission(Permission.SUBSCRIBERS_DELETE), [hasPermission]);
  
  const canSendNewsletter = useMemo(() => 
    hasPermission(Permission.NEWSLETTER_SEND), [hasPermission]);
  
  const canReadMetrics = useMemo(() => 
    hasPermission(Permission.METRICS_READ), [hasPermission]);
  
  const canManageUsers = useMemo(() => 
    hasPermission(Permission.USERS_MANAGE), [hasPermission]);
  
  const canManageRoles = useMemo(() => 
    hasPermission(Permission.ROLES_MANAGE), [hasPermission]);
  
  const canAccessSettings = useMemo(() => 
    hasPermission(Permission.SETTINGS_READ), [hasPermission]);
  
  const canReadAudit = useMemo(() => 
    hasPermission(Permission.AUDIT_READ), [hasPermission]);

  return {
    // Estado
    userRole,
    roleDefinition,
    loading,
    error,
    
    // Verificaciones
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    
    // Roles
    isRole,
    isSuperAdmin,
    isContentManager,
    isSubscriberManager,
    isAnalyticsViewer,
    isReadOnly,
    
    // Utilidades
    getRoleLevel,
    canManageRole,
    refresh,
    
    // Permisos específicos
    canReadArticles,
    canWriteArticles,
    canDeleteArticles,
    canPublishArticles,
    canReadSubscribers,
    canWriteSubscribers,
    canDeleteSubscribers,
    canSendNewsletter,
    canReadMetrics,
    canManageUsers,
    canManageRoles,
    canAccessSettings,
    canReadAudit
  };
}

/**
 * Hook para verificar permisos específicos
 * Útil para componentes que solo necesitan verificar permisos específicos
 */
export function usePermissions(requiredPermissions: Permission[]) {
  const { hasAllPermissions, hasAnyPermission, loading } = useRBAC();
  
  return useMemo(() => ({
    hasAll: hasAllPermissions(requiredPermissions),
    hasAny: hasAnyPermission(requiredPermissions),
    loading
  }), [hasAllPermissions, hasAnyPermission, loading, requiredPermissions]);
}

/**
 * Hook para verificar roles específicos
 */
export function useRoleCheck(allowedRoles: AdminRole[]) {
  const { userRole, loading } = useRBAC();
  
  return useMemo(() => ({
    isAllowed: userRole ? allowedRoles.includes(userRole.role) : false,
    currentRole: userRole?.role,
    loading
  }), [userRole, allowedRoles, loading]);
}

export default useRBAC;