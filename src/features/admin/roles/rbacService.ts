/**
 * Servicio RBAC (Role-Based Access Control)
 * Maneja la lógica de roles y permisos
 */

import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  updateDoc,
  deleteDoc
} from '@/core/firebase/config';
import { configUtils } from '@/core/config';
import { syncLogger } from '../services/logger';
import type { 
  AdminRole, 
  UserRole, 
  RoleDefinition, 
  PermissionCheck
} from './types';
import { Permission, ROLE_DEFINITIONS as DEFAULT_ROLES, ROLE_HIERARCHY } from './types';

export class RBACService {
  private static roleCache = new Map<string, UserRole>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene el rol de un usuario por email
   */
  static async getUserRole(email: string): Promise<UserRole | null> {
    try {
      // Verificar cache primero
      const cached = this.getCachedRole(email);
      if (cached) {
        return cached;
      }

      // Buscar en Firestore
      const userRoleDoc = await getDoc(doc(db, 'admin_roles', email));
      
      if (userRoleDoc.exists()) {
        const roleData = userRoleDoc.data() as UserRole;
        
        // Verificar si el rol está activo y no ha expirado
        if (!roleData.isActive || (roleData.expiresAt && new Date() > roleData.expiresAt)) {
          return null;
        }

        // Cachear resultado
        this.setCachedRole(email, roleData);
        return roleData;
      }

      // Fallback al sistema anterior para compatibilidad
      const isLegacyAdmin = configUtils.isAdminEmail(email);
      if (isLegacyAdmin) {
        const legacyRole: UserRole = {
          email,
          role: AdminRole.SUPER_ADMIN,
          assignedBy: 'system',
          assignedAt: new Date(),
          isActive: true
        };
        
        // Migrar al nuevo sistema automáticamente
        await this.assignRole(email, AdminRole.SUPER_ADMIN, 'system_migration');
        
        this.setCachedRole(email, legacyRole);
        return legacyRole;
      }

      return null;
    } catch (error) {
      syncLogger.error('Error getting user role', { email, error });
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  static async hasPermission(email: string, permission: Permission): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(email);
      if (!userRole) return false;

      const roleDefinition = DEFAULT_ROLES[userRole.role];
      if (!roleDefinition) return false;

      // Verificar permiso directo
      if (roleDefinition.permissions.includes(permission)) {
        return true;
      }

      // Verificar jerarquía de roles
      const subordinateRoles = ROLE_HIERARCHY[userRole.role] || [];
      for (const subordinateRole of subordinateRoles) {
        const subordinateDefinition = DEFAULT_ROLES[subordinateRole];
        if (subordinateDefinition?.permissions.includes(permission)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      syncLogger.error('Error checking permission', { email, permission, error });
      return false;
    }
  }

  /**
   * Verifica múltiples permisos
   */
  static async hasPermissions(email: string, permissions: Permission[]): Promise<boolean[]> {
    try {
      const results = await Promise.all(
        permissions.map(permission => this.hasPermission(email, permission))
      );
      return results;
    } catch (error) {
      syncLogger.error('Error checking multiple permissions', { email, permissions, error });
      return permissions.map(() => false);
    }
  }

  /**
   * Verifica si un usuario puede realizar una acción específica
   */
  static async canPerformAction(
    email: string, 
    check: PermissionCheck
  ): Promise<boolean> {
    try {
      const hasBasePermission = await this.hasPermission(email, check.permission);
      if (!hasBasePermission) return false;

      // Aquí se pueden añadir verificaciones adicionales basadas en recursos
      if (check.resource && check.resourceId) {
        // Por ejemplo, verificar si el usuario puede editar un artículo específico
        return await this.canAccessResource(email, check.resource, check.resourceId);
      }

      return true;
    } catch (error) {
      syncLogger.error('Error checking action permission', { email, check, error });
      return false;
    }
  }

  /**
   * Asigna un rol a un usuario
   */
  static async assignRole(
    email: string, 
    role: AdminRole, 
    assignedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const userRole: UserRole = {
        email,
        role,
        assignedBy,
        assignedAt: new Date(),
        isActive: true,
        ...(expiresAt && { expiresAt })
      };

      await setDoc(doc(db, 'admin_roles', email), {
        ...userRole,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Limpiar cache
      this.clearCachedRole(email);
      
      syncLogger.info('Role assigned successfully', { 
        email, 
        role, 
        assignedBy 
      });
    } catch (error) {
      syncLogger.error('Error assigning role', { email, role, error });
      throw error;
    }
  }

  /**
   * Actualiza un rol existente
   */
  static async updateRole(
    email: string,
    updates: Partial<UserRole>,
    updatedBy: string
  ): Promise<void> {
    try {
      const roleRef = doc(db, 'admin_roles', email);
      
      await updateDoc(roleRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy
      });

      // Limpiar cache
      this.clearCachedRole(email);
      
      syncLogger.info('Role updated successfully', { 
        email, 
        updates, 
        updatedBy 
      });
    } catch (error) {
      syncLogger.error('Error updating role', { email, updates, error });
      throw error;
    }
  }

  /**
   * Revoca un rol de usuario
   */
  static async revokeRole(email: string, revokedBy: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'admin_roles', email));
      
      // Limpiar cache
      this.clearCachedRole(email);
      
      syncLogger.info('Role revoked successfully', { 
        email, 
        revokedBy 
      });
    } catch (error) {
      syncLogger.error('Error revoking role', { email, error });
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios con roles
   */
  static async getAllUserRoles(): Promise<UserRole[]> {
    try {
      const rolesSnapshot = await getDocs(collection(db, 'admin_roles'));
      
      return rolesSnapshot.docs
        .map(doc => doc.data() as UserRole)
        .filter(role => role.isActive);
    } catch (error) {
      syncLogger.error('Error getting all user roles', { error });
      throw error;
    }
  }

  /**
   * Obtiene usuarios por rol específico
   */
  static async getUsersByRole(role: AdminRole): Promise<UserRole[]> {
    try {
      const roleQuery = query(
        collection(db, 'admin_roles'),
        where('role', '==', role),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(roleQuery);
      return snapshot.docs.map(doc => doc.data() as UserRole);
    } catch (error) {
      syncLogger.error('Error getting users by role', { role, error });
      throw error;
    }
  }

  /**
   * Obtiene la definición de un rol
   */
  static getRoleDefinition(role: AdminRole): RoleDefinition | null {
    return DEFAULT_ROLES[role] || null;
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  static getRolePermissions(role: AdminRole): Permission[] {
    const roleDefinition = this.getRoleDefinition(role);
    if (!roleDefinition) return [];

    const permissions = new Set(roleDefinition.permissions);
    
    // Añadir permisos de roles subordinados
    const subordinateRoles = ROLE_HIERARCHY[role] || [];
    for (const subordinateRole of subordinateRoles) {
      const subordinateDefinition = this.getRoleDefinition(subordinateRole);
      if (subordinateDefinition) {
        subordinateDefinition.permissions.forEach(p => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  /**
   * Verifica si un rol puede gestionar otro rol
   */
  static canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
    const managerDef = DEFAULT_ROLES[managerRole];
    const targetDef = DEFAULT_ROLES[targetRole];
    
    if (!managerDef || !targetDef) return false;
    
    // Solo roles de nivel superior pueden gestionar roles inferiores
    return managerDef.level > targetDef.level;
  }

  /**
   * Métodos privados para cache
   */
  private static getCachedRole(email: string): UserRole | null {
    const expiry = this.cacheExpiry.get(email);
    if (!expiry || Date.now() > expiry) {
      this.clearCachedRole(email);
      return null;
    }
    return this.roleCache.get(email) || null;
  }

  private static setCachedRole(email: string, role: UserRole): void {
    this.roleCache.set(email, role);
    this.cacheExpiry.set(email, Date.now() + this.CACHE_TTL);
  }

  private static clearCachedRole(email: string): void {
    this.roleCache.delete(email);
    this.cacheExpiry.delete(email);
  }

  /**
   * Verifica acceso a recursos específicos
   */
  private static async canAccessResource(
    email: string, 
    resource: string, 
    resourceId: string
  ): Promise<boolean> {
    // Implementar lógica específica de recursos aquí
    // Por ejemplo, verificar si un usuario puede editar un artículo específico
    // que él mismo creó, o si tiene permisos globales
    
    try {
      const userRole = await this.getUserRole(email);
      if (!userRole) return false;

      // Super admin puede acceder a todo
      if (userRole.role === AdminRole.SUPER_ADMIN) return true;

      // Lógica específica por tipo de recurso
      switch (resource) {
        case 'article':
          return await this.canAccessArticle(email, resourceId);
        case 'subscriber':
          return await this.canAccessSubscriber(email, resourceId);
        default:
          return true; // Permiso básico ya verificado
      }
    } catch (error) {
      syncLogger.error('Error checking resource access', { 
        email, 
        resource, 
        resourceId, 
        error 
      });
      return false;
    }
  }

  private static async canAccessArticle(email: string, articleId: string): Promise<boolean> {
    // Verificar si el usuario creó el artículo o tiene permisos globales
    // Esta lógica se puede expandir según las necesidades
    return true;
  }

  private static async canAccessSubscriber(email: string, subscriberId: string): Promise<boolean> {
    // Lógica para verificar acceso a suscriptores específicos
    return true;
  }
}

export default RBACService;